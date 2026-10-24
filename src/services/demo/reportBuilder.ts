import type { Assessment } from '@/features/assessments/types'
import type { FinancialAnalysis } from '@/features/financial-analysis/types'
import type { Finding } from '@/features/risk-analysis/types'
import type { PreliminaryRecommendation, ReportSection } from '@/features/reports/types'
import { formatDate, formatMetricValue } from '@/lib/formatters'
import { calculateRiskScorecard } from './riskScoring'

const CR = 1e7

/**
 * Builds the structured preliminary analytical recommendation.
 * Explains rationale, conditions, and non-automated credit approval disclaimer.
 */
export function buildPreliminaryRecommendation(
  a: Assessment,
  analysis: FinancialAnalysis | undefined,
  findings: Finding[],
): PreliminaryRecommendation {
  const requestedLoan = a.requestedLoanAmount ?? 20000000
  const dscrMetric = analysis?.metrics.find((m) => m.id === 'dscr')

  return {
    verdict: 'proceed_with_conditions',
    title: 'Proceed Subject to Verification & Conditions',
    rationale: `The borrower demonstrates robust topline revenue growth (+32.0% YoY) and profitable operations (EBITDA margin 16.7%, Net profit ₹3.90 Cr). The proposed ₹${(requestedLoan / CR).toFixed(2)} Cr working capital facility represents ~4.3% of annual turnover, which is operationally justifiable for raw material inventory and paper pulp purchases. However, because operating cash flow declined (−18.0% YoY) and receivables lengthened to 73.7 days DSO, disbursement must be subject to debtor ageing verification and strict quarterly monitoring.`,
    supportingFactors: [
      `Established 8-year operating history with verified ROC corporate filings.`,
      `Healthy baseline EBITDA of ₹7.78 Cr (16.7% margin) and Net Profit of ₹3.90 Cr.`,
      `Adequate pre-sanction DSCR cushion of ${dscrMetric?.value ? Number(dscrMetric.value).toFixed(2) : '1.44'}x against the 1.25x minimum banking threshold.`,
      `Modest overall leverage with Debt-to-Equity at 0.74x (covenant ceiling: 1.50x).`,
      `Zero insolvency, NCLT, or wilful default records detected across ${findings.length} investigated risk signals.`,
    ],
    materialObjections: [
      `Working-capital divergence: Topline sales rose 32.0% while operating cash flow fell 18.0%, indicating cash lockup in trade receivables.`,
      `Trade receivables expansion: Closing receivables grew 47.0% YoY to ₹9.41 Cr, outpacing sales growth.`,
      `Unverified customer payment delay: Trade media mentions potential customer payment delays; identity match requires borrower verification.`,
      `Missing itemisation: Interest expense not broken down in P&L notes; detailed debtor ageing report pending submission.`,
    ],
    unresolvedUncertainties: [
      'Top 5 debtor ageing breakdown (>90 days balance overdue).',
      'Reconciliation of 5.4% variance between GSTR-3B turnover and audited P&L.',
      'Confirmation of credit terms with Apex FMCG Ltd and Zenith Pharmaceuticals.',
    ],
    suggestedConditions: [
      'Hypothecation of paid stocks, work-in-progress, and book debts under 90 days.',
      'Monthly submission of certified book debt statements and stock inspection reports.',
      'Quarterly debt-service covenant: borrower must maintain minimum DSCR of 1.25x and Current Ratio of 1.33x.',
      'Personal guarantee of primary promoters/directors.',
      'Escrow/routing of customer receivables through the lending bank operational account.',
    ],
    disclaimer:
      'This preliminary analytical recommendation is prepared by Finlytics decision-support algorithms to assist credit risk underwriters. It is based strictly on synthetic illustrative due-diligence data and does not constitute a formal loan sanction, binding credit approval, or automated underwriting decision. Final credit approval remains subject to the sanctioning authority of the credit committee.',
  }
}

/**
 * Compiles comprehensive report sections (A through Q) deterministically from the workspace data.
 */
export function buildReportSections(a: Assessment, analysis: FinancialAnalysis | undefined, findings: Finding[]): ReportSection[] {
  const active = findings.filter((f) => f.reviewStatus !== 'dismissed')
  const count = (s: string) => active.filter((f) => f.severity === s).length
  const metric = (id: string) => analysis?.metrics.find((x) => x.id === id)
  const fmt = (id: string, signed = false) => {
    const x = metric(id)
    return x ? formatMetricValue(x.value, x.unit, x.currency, signed) : 'not available'
  }

  const requestedAmount = a.requestedLoanAmount ?? 20000000
  const scorecard = calculateRiskScorecard(analysis, findings, requestedAmount)
  const recVerdict = buildPreliminaryRecommendation(a, analysis, findings)

  // Section A: Cover & Metadata
  const secA: ReportSection = {
    id: 'cover',
    code: 'A',
    title: 'Report Cover & Assessment Metadata',
    status: 'complete',
    body: [
      `Borrower Name: ${a.companyName}`,
      `Assessment Identifier: ${a.id}`,
      `Industry & Business Type: ${a.industry ?? 'Corrugated Packaging & Paper Products Manufacturing (SME)'}`,
      `Assigned Credit Analyst: ${a.assignedAnalyst ?? 'Priya Sharma (Senior Risk Analyst)'}`,
      `Assessment Date: ${formatDate(a.createdAt)}`,
      `Reporting Period Covered: ${a.reportingPeriod ?? 'FY 2024-25 (Audited Financials)'}`,
      `Requested Credit Facility: ${a.facilityType ?? 'Working Capital Cash Credit (CC) Facility'} — ₹${(requestedAmount / CR).toFixed(2)} Cr (${a.proposedTenure ?? '12 Months, Renewable'})`,
      `Report Version: Finlytics v2.4 (Comprehensive Evaluation)`,
      `- [DISCLOSURE] This due-diligence report is compiled by Finlytics decision-support systems for credit appraisal and committee evaluation.`,
    ],
  }

  // Section B: Executive Summary
  const secB: ReportSection = {
    id: 'executive',
    code: 'B',
    title: 'Executive Summary',
    status: 'complete',
    body: [
      `Purpose of Due Diligence: Comprehensive credit risk appraisal for a proposed ₹${(requestedAmount / CR).toFixed(2)} Cr working capital facility to support business expansion and raw material procurement.`,
      `Overall Financial Position: The borrower shows strong commercial revenue growth (${fmt('revenue_growth', true)}) with expanding operating margins. However, cash conversion has slowed significantly (${fmt('ocf_change', true)} operating cash flow YoY), leading to a working-capital stretch.`,
      `Key Strengths:`,
      `- Robust topline expansion: FY25 revenue reached ${fmt('revenue')} with net profit of ${fmt('net_profit')}.`,
      `- Adequate debt serviceability: FY25 DSCR stands at ${fmt('dscr')}, providing cushion above the 1.25x covenant benchmark.`,
      `- Moderate financial leverage: Total borrowings of ${fmt('total_debt')} represent a Debt-to-Equity ratio of ${fmt('debt_equity')}.`,
      `- Clean statutory compliance: No legal suits, NCLT insolvency petitions, or active recovery actions identified.`,
      `Material Concerns:`,
      `- Cash flow divergence: Revenue rose 32.0% while operating cash flow dropped 18.0%, requiring investigation into debtor collections.`,
      `- Receivables expansion: Closing receivables reached ${fmt('receivables')} (+47.0% YoY), lengthening DSO to ${fmt('dso')}.`,
      `- Unverified customer intelligence: Simulated TinyFish search flagged trade media alleging payment delays at a major customer.`,
      `Overall Assessment Status: ${active.length} active risk findings (${count('high')} High, ${count('medium')} Medium, ${count('low')} Low severity).`,
      `Preliminary Recommendation: ${recVerdict.title} (see Section P for comprehensive terms and covenants).`,
    ],
  }

  // Section C: Borrower & Business Profile
  const secC: ReportSection = {
    id: 'borrower_profile',
    code: 'C',
    title: 'Borrower & Business Profile',
    status: 'complete',
    body: [
      `Company Overview: ${a.companyName} is an established SME manufacturing high-grade corrugated boxes, offset printed cartons, and industrial packaging solutions for FMCG, pharmaceutical, and beverage clients.`,
      `Operating History: Incorporated in 2017 (8 years continuous commercial operations) with corporate headquarters and primary manufacturing unit in Maharashtra, India.`,
      `Corporate Identifiers:`,
      `- Corporate Identification Number (CIN): ${a.cin ?? 'U21022MH2017PTC294101'}`,
      `- Goods & Services Tax Identification Number (GSTIN): ${a.gstin ?? '27AABCM8291Q1ZP'}`,
      `- Permanent Account Number (PAN): ${a.pan ?? 'AABCM8291Q'}`,
      `Ownership & Management: Closely held private limited entity with 84% equity held by founder-promoters and 16% held by family trust. Promoters have over 22 years of cumulative domain experience in industrial packaging.`,
      `Industry & Market Context: The Indian paper packaging sector is expanding at 11.2% CAGR, driven by e-commerce and organized retail packaging demand. Key operational risk is raw paper pulp price volatility.`,
    ],
  }

  // Section D: Assessment Scope & Methodology
  const secD: ReportSection = {
    id: 'scope_methodology',
    code: 'D',
    title: 'Assessment Scope & Analytical Methodology',
    status: 'complete',
    body: [
      `Documents Audited: Complete review of audited financial statements, profit & loss, balance sheets, cash-flow statements, bank statements, and GSTR-3B filings covering FY24 and FY25 (8 quarters).`,
      `Analytical Pipeline:`,
      `- Step 1: Automated ingestion, validation, and multi-field extraction across uploaded primary documents.`,
      `- Step 2: Financial calculation engine deriving 16+ credit metrics, working capital cycles, and coverage ratios.`,
      `- Step 3: Anomaly detection identifying cash conversion divergences and debtor expansion signals.`,
      `- Step 4: TinyFish-style simulated external research verifying ROC records, litigation registers, and industry news.`,
      `- Step 5: Evidence corroboration distinguishing confirmed facts, potential anomalies, and unverified hypotheses.`,
      `Analytical Assumptions & Scope Limitations:`,
      `- Financial metrics are computed using standard banking formulas; interest expense is estimated at 10.5% average cost of debt due to lack of P&L note itemisation.`,
      `- All external evidence is retrieved from simulated illustrative registries and must be independently verified by the credit team prior to final disbursement.`,
    ],
  }

  // Section E: Document Inventory & Data Quality
  const secE: ReportSection = {
    id: 'documents_inventory',
    code: 'E',
    title: 'Document Inventory & Data Quality Assessment',
    status: 'complete',
    body: [
      `Document Records Examined:`,
      `- Audited Balance Sheet (FY24–FY25): Completed (38 fields extracted, 96% confidence).`,
      `- Profit & Loss Statement (FY24–FY25): Completed (54 fields extracted, 98% confidence).`,
      `- Cash Flow Statement (FY24–FY25): Completed (27 fields extracted, 94% confidence).`,
      `- Bank Statements (24 Months, Apr 2023 – Mar 2025): Completed (142 transaction items extracted).`,
      `- GSTR-3B Monthly Returns (FY25): Completed (61 tax fields extracted).`,
      `Data Quality Observations:`,
      `- Completeness: Core financial statements are complete and mathematically balanced.`,
      `- Missing Document Items: Customer-wise detailed debtor ageing ledger was not submitted with the primary application.`,
      `- Data Inconsistency: A 5.4% turnover variance between GSTR-3B (₹44.10 Cr) and P&L Revenue (₹46.60 Cr) was flagged for reconciliation.`,
    ],
  }

  // Section F: Financial Performance
  const secF: ReportSection = {
    id: 'financial_performance',
    code: 'F',
    title: 'Financial Performance & Historical Trends',
    status: 'complete',
    body: [
      `Topline Performance: Total revenue from operations expanded from ₹35.30 Cr in FY24 to ₹46.60 Cr in FY25 (${fmt('revenue_growth', true)} YoY growth). Growth was steady across all four quarters of FY25.`,
      `Profitability Breakdown:`,
      `- Gross Profit: ${fmt('gross_profit')} (${fmt('gross_margin')} gross margin). Raw material consumption tracked revenue expansion.`,
      `- EBITDA: ${fmt('ebitda')} (${fmt('ebitda_margin')} EBITDA margin), reflecting sound operational efficiency.`,
      `- Net Profit (PAT): ${fmt('net_profit')} (${fmt('net_margin')} net profit margin), up from ₹3.60 Cr in FY24.`,
      `Financial Trend Interpretation: Strong organic commercial demand is evident in the packaging order book. Operating margins have remained resilient despite wholesale paper pulp price inflation.`,
    ],
  }

  // Section G: Cash Flow & Liquidity
  const secG: ReportSection = {
    id: 'cash_flow_liquidity',
    code: 'G',
    title: 'Cash Flow & Liquidity Analysis',
    status: 'complete',
    body: [
      `Operating Cash Flow (OCF): Net cash from operating activities declined from ₹8.00 Cr in FY24 to ₹6.56 Cr in FY25 (${fmt('ocf_change', true)} YoY).`,
      `Cash Conversion Divergence: OCF-to-Revenue conversion dropped from 22.7% to 14.1%. Operating profit is not converting into liquid cash receipts at historical rates.`,
      `Working Capital & Liquidity Ratios:`,
      `- Current Assets: ${fmt('current_assets')} vs Current Liabilities: ${fmt('current_liabilities')}.`,
      `- Current Ratio: ${fmt('current_ratio')} (meets 1.33x banking benchmark).`,
      `- Quick Ratio: ${fmt('quick_ratio')} (after excluding inventory, meets 1.00x benchmark).`,
      `- Net Working Capital: ${fmt('nwc')}, providing positive operational buffer.`,
      `- Cash & Equivalents: ${fmt('cash_equivalents')} at bank as of Q4 FY25.`,
      `Liquidity Implications: While on-paper liquidity ratios satisfy banking norms, the decline in cash flow conversion increases the borrower's reliance on short-term bank borrowings to fund raw materials.`,
    ],
  }

  // Section H: Leverage & Debt-Service Capacity
  const secH: ReportSection = {
    id: 'leverage_debt',
    code: 'H',
    title: 'Leverage & Debt-Service Capacity (DSCR)',
    status: 'complete',
    body: [
      `Existing Debt Obligations: Total borrowings stand at ${fmt('total_debt')} (comprising working capital limits and machinery term loans).`,
      `Capital Structure: Total shareholders' equity is ₹24.60 Cr, resulting in a conservative Debt-to-Equity ratio of ${fmt('debt_equity')}.`,
      `Debt-Service Coverage Ratio (DSCR):`,
      `- Pre-sanction DSCR: ${fmt('dscr')} against annual debt-service commitments of ₹4.50 Cr.`,
      `- Facility Impact Analysis: The requested ₹${(requestedAmount / CR).toFixed(2)} Cr credit facility will add approximately ₹22 Lakh in annual interest service, adjusting post-sanction DSCR to 1.37x.`,
      `- DSCR conclusion: Borrower maintains adequate repayment capacity, but requires strict cash-flow monitoring to prevent further collection slippage.`,
    ],
  }

  // Section I: Financial Ratio Analysis
  const secI: ReportSection = {
    id: 'ratio_analysis',
    code: 'I',
    title: 'Comprehensive Financial Ratio Analysis',
    status: 'complete',
    body: [
      `Key Financial Ratios & Benchmark Comparison:`,
      ...(analysis?.metrics
        .filter((m) => m.value !== null)
        .map(
          (m) =>
            `- ${m.label} (${m.period}): ${formatMetricValue(m.value, m.unit, m.currency)} [${m.kind}]${m.formula ? ` · Formula: ${m.formula}` : ''}${m.benchmark ? ` · Benchmark: ${m.benchmark.value}` : ''}`,
        ) ?? ['- Financial metrics not yet calculated.']),
    ],
  }

  // Section J: Financial Anomalies & Inconsistencies
  const secJ: ReportSection = {
    id: 'anomalies',
    code: 'J',
    title: 'Financial Anomalies & Reconciliation',
    status: 'complete',
    body: [
      `Observed Anomalies & Materiality Assessment:`,
      `- Anomaly 1: Revenue Grew While OCF Declined (High Severity). Revenue grew 32.0% while OCF dropped 18.0%. Cause: working capital lockup in trade receivables.`,
      `- Anomaly 2: Receivables Growing Faster than Revenue (Medium Severity). Closing receivables expanded 47.0% YoY to ₹9.41 Cr, pushing DSO from 66.2 to 73.7 days.`,
      `- Inconsistency 1: GSTR-3B vs P&L Revenue Discrepancy (Low Severity). GSTR-3B declared turnover (₹44.10 Cr) is 5.4% lower than audited P&L revenue (₹46.60 Cr). Likely timing or exempt export sales.`,
      `- Missing Item 1: P&L Interest Expense Breakdown (Information Gap). Interest expense is aggregated in finance costs without loan-wise breakdown.`,
      `Reconciliation Requirement: Borrower must submit formal GST reconciliation certificate and loan interest certificate before document execution.`,
    ],
  }

  // Section K: External Risk Investigation (TinyFish)
  const secK: ReportSection = {
    id: 'risk_investigation',
    code: 'K',
    title: 'External Risk Investigation (Simulated TinyFish Research)',
    status: 'complete',
    body: [
      `Investigation Triggers & Scope: Financial signals (rising DSO and cash divergence) prompted automated external risk intelligence queries across public and regulatory registries.`,
      `Categories Investigated & Results:`,
      `- Company Registration & MCA Status: Active compliance; valid charges registered with ROC; directors verified.`,
      `- Legal & Litigation Search: Zero insolvency petitions or NCLT recovery proceedings found.`,
      `- Tax & Statutory Returns: GST returns filed regularly; no tax evasion notices or blacklisting found.`,
      `- Adverse Media & Market Intelligence: Simulated trade-press item noted possible payment stretch at a regional retail customer. Evidence classified as unverified and inconclusive.`,
      `- Uninvestigated Categories: Offshore ownership, cross-border related party transactions (deemed not applicable for domestic packaging SME).`,
      `Conclusion: Core regulatory and legal profile is clean. External risk is concentrated in buyer payment delay rumors requiring commercial verification.`,
    ],
  }

  // Section L: Evidence & Source Register
  const secL: ReportSection = {
    id: 'evidence_register',
    code: 'L',
    title: 'Evidence & Master Source Register',
    status: 'complete',
    body: [
      `Master Evidence Records:`,
      `- [SRC-ROC-01] MCA-21 Corporate Registry: Company Master Data & Charges register (accessed simulated date, verified statutory status).`,
      `- [SRC-COURT-02] e-Courts & NCLT Portal: National Company Law Tribunal litigation database query (0 active matters found).`,
      `- [SRC-GST-04] GSTN Returns Portal: Monthly GSTR-3B filings verification (₹44.10 Cr outward supplies).`,
      `- [SRC-NEWS-03] Regional Industrial Press: Regional industrial report regarding buyer payment cycles (Simulated, not live-verified).`,
      `- [SRC-DOC-2002] Audited Balance Sheet FY25: Meridian Packaging Pvt Ltd, page 2 (Trade Receivables ₹9.41 Cr, Borrowings ₹18.20 Cr).`,
      `- [SRC-DOC-2003] Audited P&L Statement FY25: Meridian Packaging Pvt Ltd, page 2 (Revenue ₹46.60 Cr, Net Profit ₹3.90 Cr).`,
      `- [SRC-DOC-2004] Cash Flow Statement FY25: Meridian Packaging Pvt Ltd, page 1 (Net OCF ₹6.56 Cr).`,
    ],
  }

  // Section M: Risk Assessment & Prioritization
  const secM: ReportSection = {
    id: 'risk_scoring',
    code: 'M',
    title: 'Multi-Factor Risk Assessment & Prioritization',
    status: 'complete',
    body: [
      `Overall Risk Score: ${scorecard.overallScore}/100 — Rating: ${scorecard.overallRating}`,
      `Risk Dimension Score Breakdown:`,
      `- Financial Risk: ${scorecard.financialRisk.score}/100 — Drivers: ${scorecard.financialRisk.drivers.join(' ')}`,
      `- Business & Operational Risk: ${scorecard.businessOperationalRisk.score}/100 — Drivers: ${scorecard.businessOperationalRisk.drivers.join(' ')}`,
      `- Legal & Regulatory Risk: ${scorecard.legalRegulatoryRisk.score}/100 — Drivers: ${scorecard.legalRegulatoryRisk.drivers.join(' ')}`,
      `- External Research Risk: ${scorecard.externalResearchRisk.score}/100 — Drivers: ${scorecard.externalResearchRisk.drivers.join(' ')}`,
      `- Data Completeness Risk: ${scorecard.dataCompletenessRisk.score}/100 — Drivers: ${scorecard.dataCompletenessRisk.drivers.join(' ')}`,
      `Prioritized Risk Mitigations: Implement strict receivables ageing covenants and hypothecation of current assets to mitigate the primary financial risk score driver.`,
    ],
  }

  // Section N: Repayment Capacity & Lending Considerations
  const secN: ReportSection = {
    id: 'repayment_capacity',
    code: 'N',
    title: 'Repayment Capacity & Sensitivity Stress Scenarios',
    status: 'complete',
    body: [
      `Proposed Facility Serviceability: The requested ₹${(requestedAmount / CR).toFixed(2)} Cr working capital facility has an estimated annual debt service of ₹22 Lakh. Total annual debt obligations post-sanction will be ₹4.72 Cr.`,
      `Sensitivity Stress Testing Scenarios:`,
      `- Base Case: Revenue ₹46.60 Cr, EBITDA ₹7.78 Cr, OCF ₹6.56 Cr -> Projected DSCR: 1.39x (Pass).`,
      `- Stress Scenario 1 (−10% Revenue Contraction): Revenue ₹41.94 Cr, EBITDA ₹6.50 Cr, OCF ₹5.45 Cr -> Projected DSCR: 1.15x (Acceptable working buffer).`,
      `- Stress Scenario 2 (−200 bps EBITDA Margin Compression from Raw Pulp Costs): EBITDA ₹6.85 Cr, OCF ₹5.80 Cr -> Projected DSCR: 1.23x (Borderline, requires monitoring).`,
      `- Stress Scenario 3 (+30 Days DSO Receivables Delay): Working capital cash conversion slows -> Temporary overdraft buffer required.`,
      `Stress Conclusion: Borrower can service the debt in moderate downturns, but cash conversion discipline is imperative.`,
    ],
  }

  // Section O: Recommended Next Steps
  const secO: ReportSection = {
    id: 'next_steps',
    code: 'O',
    title: 'Recommended Next Steps & Borrower Queries',
    status: 'complete',
    body: [
      `Outstanding Documentation & Analyst Queries:`,
      `- 1. Request certified trade receivables ageing schedule categorized into 0–30, 31–60, 61–90, and >90 days overdue.`,
      `- 2. Seek written management clarification regarding payment terms agreed with top buyer Apex FMCG Ltd.`,
      `- 3. Obtain Chartered Accountant certified GSTR-3B vs Audited P&L annual reconciliation statement.`,
      `- 4. Conduct physical inspection of packaging plant, machinery condition, and stored paper inventory.`,
      `- 5. Obtain sanction letters and No Objection Certificates (NOC) from existing lenders.`,
    ],
  }

  // Section P: Preliminary Decision-Support Recommendation
  const secP: ReportSection = {
    id: 'recommendation',
    code: 'P',
    title: 'Preliminary Decision-Support Recommendation',
    status: 'complete',
    body: [
      `Verdict: ${recVerdict.title}`,
      `Analytical Rationale: ${recVerdict.rationale}`,
      `Key Supporting Factors:`,
      ...recVerdict.supportingFactors.map((f) => `- ${f}`),
      `Material Objections & Unresolved Items:`,
      ...recVerdict.materialObjections.map((o) => `- ${o}`),
      `Sanction Covenants & Pre-Disbursement Conditions:`,
      ...recVerdict.suggestedConditions.map((c) => `- ${c}`),
      `- [REGULATORY DISCLAIMER] ${recVerdict.disclaimer}`,
    ],
  }

  // Section Q: Appendices
  const secQ: ReportSection = {
    id: 'appendices',
    code: 'Q',
    title: 'Appendices & Regulatory Disclaimers',
    status: 'complete',
    body: [
      `Appendix 1: Financial Definitions and Mathematical Formulas:`,
      `- Current Ratio = Current Assets ÷ Current Liabilities`,
      `- Quick Ratio = (Current Assets − Inventory) ÷ Current Liabilities`,
      `- Debt-to-Equity = Total Borrowings ÷ Shareholders' Equity`,
      `- Net Profit Margin = Net Profit ÷ Revenue × 100`,
      `- DSCR = Operating Cash Flow Available ÷ Annual Debt Service Obligations`,
      `- Days Sales Outstanding (DSO) = Closing Trade Receivables ÷ Annual Revenue × 365`,
      `Appendix 2: Document Verification Log: Verified 5 primary financial documents.`,
      `Appendix 3: Legal Disclosures: Finlytics operates strictly as an analytical decision-support workspace. All conclusions are generated based on deterministic financial analysis.`,
    ],
  }

  return [secA, secB, secC, secD, secE, secF, secG, secH, secI, secJ, secK, secL, secM, secN, secO, secP, secQ]
}

export function reportToMarkdown(companyName: string, draft: boolean, sections: ReportSection[]): string {
  const lines = [
    `# Financial Due-Diligence & Credit Intelligence Report`,
    `## Borrower: ${companyName}`,
    ...(draft ? ['', '> **DRAFT REPORT** — Generated automatically for preliminary credit committee review; analyst sign-off pending.'] : []),
    '',
    `*Generated by Finlytics AI Financial Due Diligence Agent*`,
    '---',
  ]
  for (const s of sections) {
    const title = s.title.replace(/^[A-Z]\.\s*/, '')
    lines.push('', `## ${title}`, '')
    for (const p of s.body) {
      lines.push(p.startsWith('- ') ? p : `${p}\n`)
    }
  }
  return lines.join('\n')
}
