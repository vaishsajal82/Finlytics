import { describe, expect, it } from 'vitest'
import { guessDocumentType } from '@/services/file-upload/validate'
import { calculateRiskScorecard } from '@/services/demo/riskScoring'
import { buildPreliminaryRecommendation, buildReportSections, reportToMarkdown } from '@/services/demo/reportBuilder'
import { getAnalysis, getAssessment, generateReport, listFindings } from '@/services/demo/db'

describe('Document categorization engine', () => {
  it('identifies 15 financial document categories from filename patterns', () => {
    expect(guessDocumentType('audited_financial_statements_2024.pdf')).toBe('audited_financials')
    expect(guessDocumentType('pnl_statement_fy25.xlsx')).toBe('profit_loss')
    expect(guessDocumentType('balance_sheet_march2024.pdf')).toBe('balance_sheet')
    expect(guessDocumentType('cash_flow_q4.pdf')).toBe('cash_flow')
    expect(guessDocumentType('hdfc_bank_statement_6m.pdf')).toBe('bank_statement')
    expect(guessDocumentType('gstr_3b_june2024.pdf')).toBe('gst_return')
    expect(guessDocumentType('itr_acknowledgement_ay2425.pdf')).toBe('itr')
    expect(guessDocumentType('trial_balance_ledger.xlsx')).toBe('trial_balance')
    expect(guessDocumentType('debtors_ar_ageing_report.xlsx')).toBe('ar_ageing')
    expect(guessDocumentType('creditors_ap_ageing.xlsx')).toBe('ap_ageing')
    expect(guessDocumentType('sanction_letter_existing_loan.pdf')).toBe('loan_statement')
    expect(guessDocumentType('cibil_commercial_bureau_report.pdf')).toBe('credit_bureau')
    expect(guessDocumentType('mca_certificate_of_incorporation.pdf')).toBe('registration_docs')
    expect(guessDocumentType('sales_register_q3.xlsx')).toBe('sales_purchase')
    expect(guessDocumentType('board_resolution.pdf')).toBe('other')
  })
})

describe('Financial analysis calculations & structured insights', () => {
  it('calculates 16 core metrics and generates structured LLM insights', () => {
    const analysis = getAnalysis('ASM-1001')
    expect(analysis).toBeDefined()
    if (!analysis) return

    expect(analysis.metrics.length).toBeGreaterThanOrEqual(16)

    // Metric lookup
    const rev = analysis.metrics.find((m) => m.id === 'revenue')
    const revGrowth = analysis.metrics.find((m) => m.id === 'revenue_growth')
    const currentRatio = analysis.metrics.find((m) => m.id === 'current_ratio')
    const dscr = analysis.metrics.find((m) => m.id === 'dscr')

    expect(rev?.value).toBe(466_000_000)
    expect(Number(revGrowth?.value)).toBeCloseTo(32.0, 0)
    expect(Number(currentRatio?.value)).toBeCloseTo(1.42, 1)
    expect(Number(dscr?.value)).toBeCloseTo(1.46, 1)

    // Formula definition integrity
    expect(currentRatio?.formula).toBe('Current assets ÷ Current liabilities')
    expect(currentRatio?.numerator?.label).toBe('Current assets')
    expect(currentRatio?.denominator?.label).toBe('Current liabilities')

    // Structured LLM insights
    expect(analysis.structuredInsights?.length).toBeGreaterThanOrEqual(4)
    const ocfDivergence = analysis.structuredInsights?.find((i) => i.id === 'INS-01')
    expect(ocfDivergence).toBeDefined()
    expect(ocfDivergence?.creditImplication).toContain('credit facility')
    expect(ocfDivergence?.followUpQuestion).toBeDefined()

    // Ageing & Concentration
    expect(analysis.ageingBuckets?.length).toBe(4)
    expect(analysis.customerConcentration?.length).toBeGreaterThanOrEqual(5)
  })
})

describe('Multi-dimensional Risk Scorecard', () => {
  it('computes transparent weighted risk score across 5 risk dimensions', () => {
    const assessment = getAssessment('ASM-1001')
    const analysis = getAnalysis('ASM-1001')
    const findings = listFindings({ assessmentId: 'ASM-1001' })
    expect(assessment).toBeDefined()

    if (assessment) {
      const scorecard = calculateRiskScorecard(analysis, findings, assessment.requestedLoanAmount)
      expect(scorecard.overallScore).toBeGreaterThanOrEqual(0)
      expect(scorecard.overallScore).toBeLessThanOrEqual(100)

      expect(scorecard.financialRisk.score).toBeGreaterThan(0)
      expect(scorecard.financialRisk.drivers.length).toBeGreaterThan(0)

      expect(scorecard.businessOperationalRisk.score).toBeGreaterThan(0)
      expect(scorecard.businessOperationalRisk.drivers.length).toBeGreaterThan(0)

      expect(scorecard.legalRegulatoryRisk.score).toBeGreaterThan(0)
      expect(scorecard.legalRegulatoryRisk.drivers.length).toBeGreaterThan(0)

      expect(scorecard.externalResearchRisk.score).toBeGreaterThan(0)
      expect(scorecard.dataCompletenessRisk.score).toBeGreaterThan(0)
    }
  })
})

describe('Comprehensive Report Compilation (Sections A through Q)', () => {
  it('assembles report with all 17 required sections, preliminary recommendation, and markdown export', () => {
    const assessment = getAssessment('ASM-1001')
    expect(assessment).toBeDefined()
    if (!assessment) return

    const analysis = getAnalysis(assessment.id)
    const findings = listFindings({ assessmentId: assessment.id })

    // Test preliminary recommendation
    const recommendation = buildPreliminaryRecommendation(assessment, analysis, findings)
    expect(recommendation.verdict).toBe('proceed_with_conditions')
    expect(recommendation.supportingFactors.length).toBeGreaterThan(0)
    expect(recommendation.materialObjections.length).toBeGreaterThan(0)

    // Test sections builder
    const sections = buildReportSections(assessment, analysis, findings)

    const expectedSectionCodes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q']

    expectedSectionCodes.forEach((code) => {
      const sec = sections.find((s) => s.code === code)
      expect(sec, `Missing report section ${code}`).toBeDefined()
      expect(sec?.title).toBeTruthy()
      expect(sec?.body.length).toBeGreaterThan(0)
      expect(['complete', 'partial', 'unavailable']).toContain(sec?.status)
    })

    // Test generateReport in db
    const report = generateReport(assessment.id)
    expect(report).toBeDefined()
    expect(report.assessmentId).toBe(assessment.id)
    expect(report.companyName).toBe(assessment.companyName)
    expect(report.preliminaryRecommendation?.verdict).toBe('proceed_with_conditions')
    expect(report.recommendation?.verdict).toBe('proceed_with_conditions')

    // Markdown export generator
    const md = reportToMarkdown(report.companyName, report.draft, report.sections)
    expect(md).toContain('# Financial Due-Diligence & Credit Intelligence Report')
    expect(md).toContain('Meridian Packaging Pvt Ltd')
    expect(md).toContain('Executive Summary')
    expect(md).toContain('Evidence & Master Source Register')
  })
})
