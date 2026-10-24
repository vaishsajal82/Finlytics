export type ReportStatus = 'not_generated' | 'generating' | 'ready' | 'failed'

export type SectionCompleteness = 'complete' | 'partial' | 'unavailable'

export type RecommendationVerdict =
  | 'proceed'
  | 'proceed_with_conditions'
  | 'hold_pending_info'
  | 'escalate_edd'
  | 'not_recommended'

export interface ReportSection {
  id: string
  code?: string // e.g. "A", "B", "C" ... "Q"
  title: string
  status?: SectionCompleteness
  /** Plain-text paragraphs and bullet lines (prefixed with "- "). */
  body: string[]
  subsections?: {
    id: string
    title: string
    content: string[]
  }[]
}

export interface PreliminaryRecommendation {
  verdict: RecommendationVerdict
  title: string
  rationale: string
  supportingFactors: string[]
  materialObjections: string[]
  unresolvedUncertainties: string[]
  suggestedConditions: string[]
  disclaimer: string
}

export interface Report {
  id: string
  assessmentId: string
  companyName: string
  assessmentDate: string
  status: ReportStatus
  version?: string
  generatedAt?: string
  error?: string
  /** True when analyst has not signed off. */
  draft: boolean
  sections: ReportSection[]
  recommendation?: PreliminaryRecommendation
  preliminaryRecommendation?: PreliminaryRecommendation
  /** URL of a real generated file from the backend, if any. */
  fileUrl?: string
  isDemo?: boolean
}
