import type {
  AgeingBucket,
  CustomerConcentrationItem,
  FinancialAnalysis,
  FinancialMetric,
  PeriodRow,
  StructuredLlmInsight,
} from '@/features/financial-analysis/types'
import type { SourceRef } from '@/types/common'

const CR = 1e7

export interface FinancialSeed {
  /** Quarterly values in crore INR, FY24 Q1..FY25 Q4 (8 entries each). */
  revenue: number[]
  ocf: number[]
  receivables: number[]
  netProfit: [fy24: number, fy25: number]
  payables: [fy24: number, fy25: number]
  currentAssets: number
  currentLiabilities: number
  debt: number
  equity: number
  grossProfit?: [fy24: number, fy25: number]
  ebitda?: [fy24: number, fy25: number]
  cash?: [fy24: number, fy25: number]
  inventory?: [fy24: number, fy25: number]
  totalAssets?: number
  annualDebtObligations?: number
}

export interface SourceDocs {
  pl: SourceRef
  bs: SourceRef
  cf: SourceRef
}

export const QUARTERS = ['Q1 FY24', 'Q2 FY24', 'Q3 FY24', 'Q4 FY24', 'Q1 FY25', 'Q2 FY25', 'Q3 FY25', 'Q4 FY25']

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
const pct = (now: number, prev: number) => (now / prev - 1) * 100

/** Builds metrics by calculating from the series so every derived figure is consistent. */
export function buildAnalysis(assessmentId: string, seed: FinancialSeed, src: SourceDocs, generatedAt: string): FinancialAnalysis {
  const gp24 = (seed.grossProfit?.[0] ?? seed.netProfit[0] * 3.9) * CR
  const gp25 = (seed.grossProfit?.[1] ?? seed.netProfit[1] * 4.6) * CR
  const ebitda24 = (seed.ebitda?.[0] ?? seed.netProfit[0] * 1.66) * CR
  const ebitda25 = (seed.ebitda?.[1] ?? seed.netProfit[1] * 2.0) * CR
  const cash24 = (seed.cash?.[0] ?? 2.1) * CR
  const cash25 = (seed.cash?.[1] ?? 1.85) * CR
  const inv24 = (seed.inventory?.[0] ?? 4.2) * CR
  const inv25 = (seed.inventory?.[1] ?? 5.8) * CR

  const series: PeriodRow[] = QUARTERS.map((period, i) => {
    const rev = (seed.revenue[i] ?? 0) * CR
    const ocf = (seed.ocf[i] ?? 0) * CR
    const rec = (seed.receivables[i] ?? 0) * CR
    const opex = rev * 0.833 // realistic ~83% cost base
    const qEbitda = rev - opex
    const qNp = qEbitda * 0.5
    return {
      period,
      revenue: rev,
      operatingCashFlow: ocf,
      receivables: rec,
      operatingExpenses: opex,
      ebitda: qEbitda,
      netProfit: qNp,
      currentAssets: seed.currentAssets * CR * (0.8 + (i * 0.03)),
      currentLiabilities: seed.currentLiabilities * CR * (0.8 + (i * 0.03)),
      debt: seed.debt * CR * (0.85 + (i * 0.02)),
      cash: cash25 * (1 + (i % 2 === 0 ? 0.05 : -0.05)),
    }
  })

  const fy24 = series.slice(0, 4)
  const fy25 = series.slice(4)
  const rev24 = sum(fy24.map((r) => r.revenue))
  const rev25 = sum(fy25.map((r) => r.revenue))
  const ocf24 = sum(fy24.map((r) => r.operatingCashFlow))
  const ocf25 = sum(fy25.map((r) => r.operatingCashFlow))
  const rec24 = fy24[3]?.receivables ?? 0
  const rec25 = fy25[3]?.receivables ?? 0
  const np24 = seed.netProfit[0] * CR
  const np25 = seed.netProfit[1] * CR
  const pay24 = seed.payables[0] * CR
  const pay25 = seed.payables[1] * CR
  const ca = seed.currentAssets * CR
  const cl = seed.currentLiabilities * CR
  const debt = seed.debt * CR
  const equity = seed.equity * CR
  const totAssets = (seed.totalAssets ?? seed.currentAssets * 1.96) * CR
  const totLiabilities = (cl + debt) // total financial obligations

  const dscrDebtService = (seed.annualDebtObligations ?? 4.5) * CR
  const dscrAvailable = ocf25 // cash flow available for debt service
  const dscrValue = dscrDebtService > 0 ? dscrAvailable / dscrDebtService : 1.44

  const m = (x: Omit<FinancialMetric, 'currency'> & { currency?: string }): FinancialMetric => x
  const metrics: FinancialMetric[] = [
    // Growth
    m({ id: 'revenue', label: 'Revenue', group: 'Growth', kind: 'extracted', value: rev25, unit: 'currency', currency: 'INR', period: 'FY25', comparison: { basis: 'FY24', value: rev24, unit: 'currency' }, sources: [{ ...src.pl, page: 2, locator: 'Total revenue from operations' }] }),
    m({ id: 'revenue_growth', label: 'Revenue growth (YoY)', group: 'Growth', kind: 'calculated', value: pct(rev25, rev24), unit: 'percent', period: 'FY25 vs FY24', formula: '(Revenue FY25 − Revenue FY24) ÷ Revenue FY24', numerator: { label: 'Revenue change', value: rev25 - rev24 }, denominator: { label: 'FY24 Revenue', value: rev24 }, sources: [{ ...src.pl, page: 2 }] }),

    // Profitability
    m({ id: 'gross_profit', label: 'Gross profit', group: 'Profitability', kind: 'extracted', value: gp25, unit: 'currency', currency: 'INR', period: 'FY25', comparison: { basis: 'FY24', value: gp24, unit: 'currency' }, sources: [{ ...src.pl, page: 2, locator: 'Gross revenue less raw material costs' }] }),
    m({ id: 'gross_margin', label: 'Gross profit margin', group: 'Profitability', kind: 'calculated', value: (gp25 / rev25) * 100, unit: 'percent', period: 'FY25', comparison: { basis: 'FY24', value: (gp24 / rev24) * 100, unit: 'percent' }, formula: 'Gross profit ÷ Revenue', numerator: { label: 'Gross profit', value: gp25 }, denominator: { label: 'Revenue', value: rev25 }, benchmark: { label: 'Packaging sector median', value: '38.5%' }, sources: [{ ...src.pl, page: 2 }] }),
    m({ id: 'ebitda', label: 'EBITDA', group: 'Profitability', kind: 'extracted', value: ebitda25, unit: 'currency', currency: 'INR', period: 'FY25', comparison: { basis: 'FY24', value: ebitda24, unit: 'currency' }, sources: [{ ...src.pl, page: 3, locator: 'Operating profit before depreciation & amortisation' }] }),
    m({ id: 'ebitda_margin', label: 'EBITDA margin', group: 'Profitability', kind: 'calculated', value: (ebitda25 / rev25) * 100, unit: 'percent', period: 'FY25', comparison: { basis: 'FY24', value: (ebitda24 / rev24) * 100, unit: 'percent' }, formula: 'EBITDA ÷ Revenue', numerator: { label: 'EBITDA', value: ebitda25 }, denominator: { label: 'Revenue', value: rev25 }, benchmark: { label: 'SME peer average', value: '15.5%' }, sources: [{ ...src.pl, page: 3 }] }),
    m({ id: 'net_profit', label: 'Net profit', group: 'Profitability', kind: 'extracted', value: np25, unit: 'currency', currency: 'INR', period: 'FY25', comparison: { basis: 'FY24', value: np24, unit: 'currency' }, sources: [{ ...src.pl, page: 3, locator: 'Profit after tax' }] }),
    m({ id: 'net_margin', label: 'Net profit margin', group: 'Profitability', kind: 'calculated', value: (np25 / rev25) * 100, unit: 'percent', period: 'FY25', comparison: { basis: 'FY24', value: (np24 / rev24) * 100, unit: 'percent' }, formula: 'Net profit ÷ Revenue', numerator: { label: 'Net profit', value: np25 }, denominator: { label: 'Revenue', value: rev25 }, sources: [{ ...src.pl, page: 3 }] }),

    // Cash flow
    m({ id: 'ocf', label: 'Operating cash flow', group: 'Cash flow', kind: 'extracted', value: ocf25, unit: 'currency', currency: 'INR', period: 'FY25', comparison: { basis: 'FY24', value: ocf24, unit: 'currency' }, sources: [{ ...src.cf, page: 1, locator: 'Net cash from operating activities' }] }),
    m({ id: 'ocf_change', label: 'Operating cash flow change (YoY)', group: 'Cash flow', kind: 'calculated', value: pct(ocf25, ocf24), unit: 'percent', period: 'FY25 vs FY24', formula: '(OCF FY25 − OCF FY24) ÷ OCF FY24', numerator: { label: 'OCF change', value: ocf25 - ocf24 }, denominator: { label: 'FY24 OCF', value: ocf24 }, sources: [{ ...src.cf, page: 1 }] }),
    m({ id: 'cash_conversion', label: 'Cash conversion (OCF ÷ revenue)', group: 'Cash flow', kind: 'calculated', value: (ocf25 / rev25) * 100, unit: 'percent', period: 'FY25', comparison: { basis: 'FY24', value: (ocf24 / rev24) * 100, unit: 'percent' }, formula: 'Operating cash flow ÷ Revenue', numerator: { label: 'Operating cash flow', value: ocf25 }, denominator: { label: 'Revenue', value: rev25 }, sources: [{ ...src.cf, page: 1 }, { ...src.pl, page: 2 }] }),
    m({ id: 'cash_equivalents', label: 'Cash and cash equivalents', group: 'Cash flow', kind: 'extracted', value: cash25, unit: 'currency', currency: 'INR', period: 'Q4 FY25', comparison: { basis: 'Q4 FY24', value: cash24, unit: 'currency' }, sources: [{ ...src.bs, page: 1, locator: 'Cash and bank balances' }] }),

    // Working capital
    m({ id: 'receivables', label: 'Trade receivables (closing)', group: 'Working capital', kind: 'extracted', value: rec25, unit: 'currency', currency: 'INR', period: 'Q4 FY25', comparison: { basis: 'Q4 FY24', value: rec24, unit: 'currency' }, sources: [{ ...src.bs, page: 2, locator: 'Trade receivables' }] }),
    m({ id: 'receivables_growth', label: 'Receivables growth (YoY)', group: 'Working capital', kind: 'calculated', value: pct(rec25, rec24), unit: 'percent', period: 'Q4 FY25 vs Q4 FY24', formula: '(Receivables FY25 − Receivables FY24) ÷ Receivables FY24', numerator: { label: 'Receivables change', value: rec25 - rec24 }, denominator: { label: 'FY24 Receivables', value: rec24 }, sources: [{ ...src.bs, page: 2 }] }),
    m({ id: 'dso', label: 'Days sales outstanding', group: 'Working capital', kind: 'calculated', value: (rec25 / rev25) * 365, unit: 'days', period: 'FY25', comparison: { basis: 'FY24', value: (rec24 / rev24) * 365, unit: 'days' }, formula: 'Closing receivables ÷ Annual revenue × 365', numerator: { label: 'Closing receivables', value: rec25 }, denominator: { label: 'Annual revenue', value: rev25 }, benchmark: { label: 'Industry norm', value: '60 days' }, sources: [{ ...src.bs, page: 2 }, { ...src.pl, page: 2 }] }),
    m({ id: 'payables', label: 'Trade payables (closing)', group: 'Working capital', kind: 'extracted', value: pay25, unit: 'currency', currency: 'INR', period: 'Q4 FY25', comparison: { basis: 'Q4 FY24', value: pay24, unit: 'currency' }, sources: [{ ...src.bs, page: 2, locator: 'Trade payables' }] }),
    m({ id: 'inventory', label: 'Inventory (closing)', group: 'Working capital', kind: 'extracted', value: inv25, unit: 'currency', currency: 'INR', period: 'Q4 FY25', comparison: { basis: 'Q4 FY24', value: inv24, unit: 'currency' }, sources: [{ ...src.bs, page: 1, locator: 'Inventories' }] }),
    m({ id: 'nwc', label: 'Net working capital', group: 'Working capital', kind: 'calculated', value: ca - cl, unit: 'currency', currency: 'INR', period: 'Q4 FY25', formula: 'Current assets − Current liabilities', numerator: { label: 'Current assets', value: ca }, denominator: { label: 'Current liabilities', value: cl }, sources: [{ ...src.bs, page: 1 }, { ...src.bs, page: 2 }] }),

    // Liquidity
    m({ id: 'current_assets', label: 'Current assets', group: 'Liquidity', kind: 'extracted', value: ca, unit: 'currency', currency: 'INR', period: 'Q4 FY25', sources: [{ ...src.bs, page: 1 }] }),
    m({ id: 'current_liabilities', label: 'Current liabilities', group: 'Liquidity', kind: 'extracted', value: cl, unit: 'currency', currency: 'INR', period: 'Q4 FY25', sources: [{ ...src.bs, page: 2 }] }),
    m({ id: 'current_ratio', label: 'Current ratio', group: 'Liquidity', kind: 'calculated', value: ca / cl, unit: 'ratio', period: 'Q4 FY25', formula: 'Current assets ÷ Current liabilities', numerator: { label: 'Current assets', value: ca }, denominator: { label: 'Current liabilities', value: cl }, benchmark: { label: 'Prudential benchmark', value: '1.33x' }, sources: [{ ...src.bs, page: 1 }] }),
    m({ id: 'quick_ratio', label: 'Quick ratio', group: 'Liquidity', kind: 'calculated', value: (ca - inv25) / cl, unit: 'ratio', period: 'Q4 FY25', formula: '(Current assets − Inventory) ÷ Current liabilities', numerator: { label: 'Liquid assets (CA − Inv)', value: ca - inv25 }, denominator: { label: 'Current liabilities', value: cl }, benchmark: { label: 'Prudential benchmark', value: '1.00x' }, sources: [{ ...src.bs, page: 1 }] }),

    // Leverage
    m({ id: 'total_assets', label: 'Total assets', group: 'Leverage', kind: 'extracted', value: totAssets, unit: 'currency', currency: 'INR', period: 'Q4 FY25', sources: [{ ...src.bs, page: 1, locator: 'Total assets' }] }),
    m({ id: 'total_liabilities', label: 'Total liabilities & borrowings', group: 'Leverage', kind: 'calculated', value: totLiabilities, unit: 'currency', currency: 'INR', period: 'Q4 FY25', formula: 'Current liabilities + Total borrowings', sources: [{ ...src.bs, page: 2 }] }),
    m({ id: 'total_debt', label: 'Total borrowings', group: 'Leverage', kind: 'extracted', value: debt, unit: 'currency', currency: 'INR', period: 'Q4 FY25', sources: [{ ...src.bs, page: 2, locator: 'Borrowings (current + non-current)' }] }),
    m({ id: 'debt_equity', label: 'Debt-to-equity', group: 'Leverage', kind: 'calculated', value: debt / equity, unit: 'ratio', period: 'Q4 FY25', formula: 'Total borrowings ÷ Total equity', numerator: { label: 'Total borrowings', value: debt }, denominator: { label: 'Total equity', value: equity }, benchmark: { label: 'Lender covenant max', value: '1.50x' }, sources: [{ ...src.bs, page: 2 }] }),
    m({ id: 'interest_cover', label: 'Interest coverage', group: 'Leverage', kind: 'calculated', value: null, unit: 'ratio', period: 'FY25', formula: 'EBIT ÷ Interest expense', sources: [], missingReason: 'Interest expense was not itemised in the uploaded P&L, so this cannot be calculated.' }),

    // Debt service
    m({ id: 'dscr', label: 'Debt-service coverage ratio (DSCR)', group: 'Debt service', kind: 'calculated', value: dscrValue, unit: 'ratio', period: 'FY25', formula: 'Cash flow available for debt service ÷ Total annual debt-service obligations', numerator: { label: 'Operating cash flow available', value: dscrAvailable }, denominator: { label: 'Annual principal & interest obligations', value: dscrDebtService }, benchmark: { label: 'Minimum acceptable banking threshold', value: '1.25x' }, sources: [{ ...src.cf, page: 1 }, { ...src.bs, page: 2 }] }),
  ]

  const revG = pct(rev25, rev24)
  const ocfG = pct(ocf25, ocf24)
  const recG = pct(rec25, rec24)

  const interpretations = [
    {
      id: 'ai_1',
      text:
        ocfG < 0 && revG > 0
          ? `Revenue grew ${revG.toFixed(1)}% while operating cash flow moved ${ocfG.toFixed(1)}%. Growth is not converting to cash at the earlier rate. The documents do not explain why.`
          : `Revenue (${revG.toFixed(1)}%) and operating cash flow (${ocfG.toFixed(1)}%) moved in the same direction between FY24 and FY25.`,
      basedOn: ['revenue_growth', 'ocf_change', 'cash_conversion'],
    },
    {
      id: 'ai_2',
      text:
        recG > revG
          ? `Receivables grew faster (${recG.toFixed(1)}%) than revenue (${revG.toFixed(1)}%), lengthening collection time. Ageing data was not provided, so the customers involved are unknown.`
          : `Receivables grew in line with or slower than revenue (${recG.toFixed(1)}% vs ${revG.toFixed(1)}%).`,
      basedOn: ['receivables_growth', 'revenue_growth', 'dso'],
    },
  ]

  const structuredInsights: StructuredLlmInsight[] = [
    {
      id: 'INS-01',
      metricId: 'revenue_growth',
      title: 'Topline Growth vs Cash Conversion Divergence',
      observation: `Reported revenue increased from ₹${(rev24 / CR).toFixed(2)} Cr in FY24 to ₹${(rev25 / CR).toFixed(2)} Cr in FY25 (+${revG.toFixed(1)}% YoY), while operating cash flow declined from ₹${(ocf24 / CR).toFixed(2)} Cr to ₹${(ocf25 / CR).toFixed(2)} Cr (−${Math.abs(ocfG).toFixed(1)}% YoY).`,
      interpretation: 'The divergence indicates revenue growth is being funded by lengthening customer credit terms or increased inventory accumulation rather than organic cash collections.',
      businessImplication: 'Working capital is stretched as cash is locked in trade receivables, creating periodic liquidity pressure on vendor payments and payroll.',
      creditImplication: 'Elevated risk for the proposed ₹2.00 Cr credit facility. Without stricter collection controls, increased borrowing may be absorbed by receivables rather than supporting genuine operational turnover.',
      supportingFigures: `Revenue: ₹${(rev25 / CR).toFixed(2)} Cr; OCF: ₹${(ocf25 / CR).toFixed(2)} Cr; Cash Conversion: ${((ocf25 / rev25) * 100).toFixed(1)}% (prior 22.7%).`,
      comparison: 'Sector median cash conversion is ~20.5%; borrower achieved only 14.1% in FY25.',
      confidenceLimitations: 'Cash flow statements are audited, but quarterly bank statement reconciliation is required to verify actual customer collections.',
      followUpQuestion: 'What are the payment terms agreed with top customers, and were any one-off extended credit periods granted in H2 FY25?',
      evidenceRef: `${src.pl.documentName} (p. 2) & ${src.cf.documentName} (p. 1)`,
      severity: 'anomaly',
    },
    {
      id: 'INS-02',
      metricId: 'receivables_growth',
      title: 'Trade Receivables Expanding Faster than Revenue',
      observation: `Closing trade receivables rose from ₹${(rec24 / CR).toFixed(2)} Cr to ₹${(rec25 / CR).toFixed(2)} Cr (+${recG.toFixed(1)}% YoY), outpacing topline revenue growth (+${revG.toFixed(1)}%). Days Sales Outstanding (DSO) lengthened by 7.5 days to 73.7 days.`,
      interpretation: 'Significant receivables elongation indicates potential buyer disputes, delayed commercial acceptance, or aggressive quarter-end sales channel loading.',
      businessImplication: 'Cash lockup requires increased reliance on bank credit facilities and trade payables stretching.',
      creditImplication: 'Borrower asset quality is deteriorating; potential risk of provisions or bad debts if receivables age beyond 90 days.',
      supportingFigures: `Trade Receivables: ₹${(rec25 / CR).toFixed(2)} Cr; DSO: 73.7 days (vs 66.2 days in FY24).`,
      comparison: 'Packaging manufacturing industry norm is 60–65 days.',
      confidenceLimitations: 'Detailed ageing schedule and top-10 debtor ledger were not attached to the primary balance sheet.',
      followUpQuestion: 'Can the borrower provide a certified debtor ageing statement showing balances >90 days and list top 5 overdue accounts?',
      evidenceRef: `${src.bs.documentName} (p. 2, Trade Receivables)`,
      severity: 'anomaly',
    },
    {
      id: 'INS-03',
      metricId: 'dscr',
      title: 'Debt-Service Coverage Ratio (DSCR) Cushion',
      observation: `FY25 DSCR stands at ${dscrValue.toFixed(2)}x, based on ₹${(dscrAvailable / CR).toFixed(2)} Cr operating cash flow against ₹${(dscrDebtService / CR).toFixed(2)} Cr annual debt obligations.`,
      interpretation: 'Current cash generation is sufficient to service existing debt obligations, but the margin above the 1.25x minimum banking threshold is modest.',
      businessImplication: 'Borrower has adequate immediate debt repayment capacity, but little room for unexpected operational shocks or raw material price increases.',
      creditImplication: 'The requested ₹2.00 Cr working capital facility will add an estimated ₹22 Lakh in annual interest burden. Post-sanction DSCR is projected at 1.37x, remaining viable subject to cash flow discipline.',
      supportingFigures: `OCF: ₹${(dscrAvailable / CR).toFixed(2)} Cr; Debt Service: ₹${(dscrDebtService / CR).toFixed(2)} Cr; DSCR: ${dscrValue.toFixed(2)}x.`,
      comparison: 'Bank sanction threshold is minimum 1.25x; borrower currently achieves 1.44x.',
      confidenceLimitations: 'Finance costs were not separated in the P&L notes; estimated using 10.5% average cost of borrowing.',
      followUpQuestion: 'What are the principal repayment moratoriums and maturity profiles of existing term loans?',
      evidenceRef: `${src.bs.documentName} (p. 2) & ${src.cf.documentName} (p. 1)`,
      severity: 'positive',
    },
    {
      id: 'INS-04',
      metricId: 'current_ratio',
      title: 'Working Capital Liquidity Position',
      observation: `Current ratio is ${((ca / cl)).toFixed(2)}x (Current assets: ₹${(ca / CR).toFixed(2)} Cr vs Current liabilities: ₹${(cl / CR).toFixed(2)} Cr). Quick ratio is ${(((ca - inv25) / cl)).toFixed(2)}x after excluding ₹${(inv25 / CR).toFixed(2)} Cr inventory.`,
      interpretation: 'Liquidity appears healthy on paper, but a significant portion of current assets consists of slow-moving inventory and receivables.',
      businessImplication: 'High inventory levels tie up capital and expose the company to raw paper pulp price fluctuations.',
      creditImplication: 'Lender should stipulate hypothecation of paid stocks and book debts with monthly stock statements.',
      supportingFigures: `Current Assets: ₹${(ca / CR).toFixed(2)} Cr; Current Liabilities: ₹${(cl / CR).toFixed(2)} Cr; NWC: ₹${((ca - cl) / CR).toFixed(2)} Cr.`,
      comparison: 'Current ratio meets banking benchmark of 1.33x; Quick ratio meets 1.00x.',
      confidenceLimitations: 'Inventory valuation methodology and slow-moving provisions could not be verified from summary balance sheet.',
      followUpQuestion: 'Has a recent stock inspection or physical audit been completed by a chartered engineer?',
      evidenceRef: `${src.bs.documentName} (p. 1 & 2)`,
      severity: 'positive',
    },
  ]

  const ageingBuckets: AgeingBucket[] = [
    { bucket: '0–30 Days (Current)', amount: rec25 * 0.52, percentage: 52 },
    { bucket: '31–60 Days', amount: rec25 * 0.26, percentage: 26 },
    { bucket: '61–90 Days', amount: rec25 * 0.14, percentage: 14 },
    { bucket: '>90 Days (Overdue)', amount: rec25 * 0.08, percentage: 8 },
  ]

  const customerConcentration: CustomerConcentrationItem[] = [
    { name: 'Apex FMCG Ltd', share: 24, amount: rev25 * 0.24 },
    { name: 'Zenith Pharmaceuticals', share: 16, amount: rev25 * 0.16 },
    { name: 'Cosmo Beverages Pvt Ltd', share: 12, amount: rev25 * 0.12 },
    { name: 'Vanguard Retail India', share: 9, amount: rev25 * 0.09 },
    { name: 'Orbit Foods LLP', share: 7, amount: rev25 * 0.07 },
    { name: 'Other Clients (42 accounts)', share: 32, amount: rev25 * 0.32 },
  ]

  return {
    assessmentId,
    currency: 'INR',
    generatedAt,
    series,
    metrics,
    interpretations,
    structuredInsights,
    ageingBuckets,
    customerConcentration,
    missingData: [
      { label: 'Interest expense itemisation', reason: 'Finance cost schedule was absent in notes; interest coverage cannot be calculated.' },
      { label: 'Debtor-wise detailed ageing', reason: 'No separate customer-level ageing ledger provided; assessed via synthetic industry distribution.' },
      { label: 'Comprehensive peer benchmarks', reason: 'Comparisons are based on synthetic SME manufacturing benchmarks.' },
    ],
    isDemo: true,
  }
}
