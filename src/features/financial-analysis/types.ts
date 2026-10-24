import type { MetricUnit, SourceRef } from '@/types/common'

/** What kind of statement a number is. The UI always shows this distinction. */
export type MetricKind = 'extracted' | 'calculated'

export type MetricGroup =
  | 'Growth'
  | 'Profitability'
  | 'Cash flow'
  | 'Working capital'
  | 'Liquidity'
  | 'Leverage'
  | 'Debt service'

export interface FinancialMetric {
  id: string
  label: string
  group: MetricGroup
  kind: MetricKind
  value: number | null
  unit: MetricUnit
  currency?: string
  period: string
  comparison?: { basis: string; value: number | null; unit: MetricUnit }
  formula?: string
  numerator?: { label: string; value: number }
  denominator?: { label: string; value: number }
  benchmark?: { label: string; value: number | string }
  interpretation?: string
  sources: SourceRef[]
  /** Present when `value` is null. */
  missingReason?: string
}

export interface PeriodRow {
  period: string
  revenue: number
  operatingCashFlow: number
  receivables: number
  operatingExpenses?: number
  ebitda?: number
  netProfit?: number
  currentAssets?: number
  currentLiabilities?: number
  debt?: number
  cash?: number
}

export interface AiInterpretation {
  id: string
  text: string
  /** Metric ids the interpretation is based on. */
  basedOn: string[]
}

export interface StructuredLlmInsight {
  id: string
  metricId?: string
  title: string
  observation: string
  interpretation: string
  businessImplication: string
  creditImplication: string
  supportingFigures: string
  comparison: string
  confidenceLimitations: string
  followUpQuestion: string
  evidenceRef: string
  severity: 'positive' | 'anomaly' | 'inconsistency' | 'missing' | 'concern'
}

export interface AgeingBucket {
  bucket: string
  amount: number
  percentage: number
}

export interface CustomerConcentrationItem {
  name: string
  share: number
  amount: number
}

export interface FinancialAnalysis {
  assessmentId: string
  currency: string
  generatedAt: string
  series: PeriodRow[]
  metrics: FinancialMetric[]
  interpretations: AiInterpretation[]
  structuredInsights?: StructuredLlmInsight[]
  ageingBuckets?: AgeingBucket[]
  customerConcentration?: CustomerConcentrationItem[]
  missingData: { label: string; reason: string }[]
  isDemo?: boolean
}
