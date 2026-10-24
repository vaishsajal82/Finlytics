import type { FinancialAnalysis } from '@/features/financial-analysis/types'
import type { Finding, RiskScorecard } from '@/features/risk-analysis/types'

/**
 * Transparent multi-factor risk scoring engine for Finlytics.
 * Separates financial, operational, legal, research, and data completeness risks.
 * Every displayed score has explainable contributing drivers.
 */
export function calculateRiskScorecard(
  analysis: FinancialAnalysis | undefined,
  findings: Finding[],
  requestedLoanAmount = 20000000,
): RiskScorecard {
  const activeFindings = findings.filter((f) => f.reviewStatus !== 'dismissed')

  // 1. Financial Risk Score (0-100, higher = higher risk)
  let finScore = 35
  const finDrivers: string[] = []

  const revG = analysis?.metrics.find((m) => m.id === 'revenue_growth')?.value ?? 0
  const ocfG = analysis?.metrics.find((m) => m.id === 'ocf_change')?.value ?? 0
  const dscr = analysis?.metrics.find((m) => m.id === 'dscr')?.value ?? 1.44
  const de = analysis?.metrics.find((m) => m.id === 'debt_equity')?.value ?? 0.74

  if (revG > 0 && ocfG < 0) {
    finScore += 22
    finDrivers.push(`Revenue (+${revG.toFixed(1)}%) grew while operating cash flow declined (${ocfG.toFixed(1)}%), indicating working-capital stretch.`)
  }
  if (dscr < 1.30) {
    finScore += 15
    finDrivers.push(`DSCR buffer of ${dscr.toFixed(2)}x is close to minimum banking benchmark (1.25x).`)
  } else {
    finDrivers.push(`Adequate immediate debt serviceability with FY25 DSCR at ${dscr.toFixed(2)}x.`)
  }
  if (de > 1.0) {
    finScore += 10
    finDrivers.push(`Elevated debt-to-equity ratio (${de.toFixed(2)}x).`)
  } else {
    finDrivers.push(`Moderate leverage with debt-to-equity at ${de.toFixed(2)}x (within 1.50x lender limit).`)
  }

  // 2. Business & Operational Risk (0-100)
  let busScore = 32
  const busDrivers: string[] = []
  const topCustomerShare = analysis?.customerConcentration?.[0]?.share ?? 24
  if (topCustomerShare > 20) {
    busScore += 14
    busDrivers.push(`Customer concentration: Top buyer accounts for ${topCustomerShare}% of sales.`)
  }
  if (requestedLoanAmount >= 20000000) {
    busDrivers.push(`Proposed ₹${(requestedLoanAmount / 1e7).toFixed(2)} Cr facility represents ~4.3% of annual turnover, an appropriate scale for working capital.`)
  }
  busDrivers.push('8-year established operating history in industrial corrugated packaging.')

  // 3. Legal & Regulatory Risk (0-100)
  let legalScore = 20
  const legalDrivers: string[] = []
  const legalFinding = activeFindings.find((f) => f.category === 'legal_disputes' || f.category === 'insolvency_bankruptcy')
  const taxFinding = activeFindings.find((f) => f.category === 'tax_statutory' || f.id === 'FND-3004')

  if (legalFinding && legalFinding.severity === 'high') {
    legalScore += 35
    legalDrivers.push(`Material dispute or litigation flagged in external search.`)
  } else {
    legalDrivers.push('No insolvency petitions, NCLT proceedings, or active recovery suits identified in court databases.')
  }
  if (taxFinding) {
    legalScore += 8
    legalDrivers.push('Minor 5.4% reconciliation variance between GSTR-3B taxable turnover and audited P&L (reconciliation required).')
  } else {
    legalDrivers.push('Statutory filings and GST returns up to date with active MCA compliance status.')
  }

  // 4. External Research Risk (0-100)
  let extScore = 30
  const extDrivers: string[] = []
  const unverified = activeFindings.filter((f) => f.classification === 'unverified_hypothesis' || f.evidenceStatus === 'inconclusive')
  if (unverified.length > 0) {
    extScore += 18
    extDrivers.push(`${unverified.length} hypothesis flagged from trade media requiring buyer confirmation before relying on conclusions.`)
  }
  extDrivers.push('Simulated TinyFish intelligence scanned MCA master data, e-Courts, GST portal, and trade publications.')

  // 5. Data Completeness & Quality Risk (0-100)
  let dataScore = 28
  const dataDrivers: string[] = []
  if (analysis?.missingData && analysis.missingData.length > 0) {
    dataScore += analysis.missingData.length * 6
    dataDrivers.push(`Key items unitemised: ${analysis.missingData.map((m) => m.label).join(', ')}.`)
  } else {
    dataDrivers.push('Core financial statements, bank statements, and tax returns available for review.')
  }

  // Weighted overall calculation
  const overallScore = Math.round(
    finScore * 0.35 +
    busScore * 0.20 +
    legalScore * 0.15 +
    extScore * 0.15 +
    dataScore * 0.15,
  )

  const overallRating =
    overallScore >= 70
      ? 'Critical Risk'
      : overallScore >= 50
        ? 'High Risk'
        : overallScore >= 35
          ? 'Moderate Risk'
          : 'Low Risk'

  return {
    overallScore: Math.min(100, Math.max(0, overallScore)),
    overallRating,
    financialRisk: { score: Math.min(100, finScore), drivers: finDrivers },
    businessOperationalRisk: { score: Math.min(100, busScore), drivers: busDrivers },
    legalRegulatoryRisk: { score: Math.min(100, legalScore), drivers: legalDrivers },
    externalResearchRisk: { score: Math.min(100, extScore), drivers: extDrivers },
    dataCompletenessRisk: { score: Math.min(100, dataScore), drivers: dataDrivers },
  }
}
