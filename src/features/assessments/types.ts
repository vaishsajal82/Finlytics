import type { Severity, SortOrder } from '@/types/common'

export const STAGES = [
  { key: 'company', label: 'Company information', short: 'Company' },
  { key: 'documents', label: 'Document upload', short: 'Documents' },
  { key: 'extraction', label: 'Processing & extraction', short: 'Extraction' },
  { key: 'analysis', label: 'Financial analysis', short: 'Analysis' },
  { key: 'investigation', label: 'Risk investigation', short: 'Investigation' },
  { key: 'report', label: 'Review & reporting', short: 'Report' },
] as const

export type StageKey = (typeof STAGES)[number]['key']
export type StageStatus = 'completed' | 'active' | 'pending' | 'failed'

export type AssessmentStatus = 'draft' | 'in_progress' | 'review' | 'completed' | 'failed'

export interface RiskSummary {
  high: number
  medium: number
  low: number
  /** Findings not yet reviewed by an analyst. */
  unreviewed: number
}

export interface Assessment {
  id: string
  companyName: string
  purpose: string
  cin?: string
  gstin?: string
  pan?: string
  industry?: string
  businessType?: string
  requestedLoanAmount?: number
  currency?: string
  facilityType?: string
  proposedTenure?: string
  annualTurnover?: number
  existingDebt?: number
  operatingHistory?: string
  assignedAnalyst?: string
  assessmentDate?: string
  reportingPeriod?: string
  createdAt: string
  updatedAt: string
  status: AssessmentStatus
  stages: Record<StageKey, StageStatus>
  documentCount: number
  /** null until findings exist. */
  riskSummary: RiskSummary | null
  overallRisk: Severity | null
  /** True when the record belongs to the synthetic demo adapter. */
  isDemo?: boolean
}

export type AssessmentSortKey = 'companyName' | 'createdAt' | 'status' | 'overallRisk'

export interface AssessmentQuery {
  search?: string
  status?: AssessmentStatus | ''
  risk?: Severity | 'none' | ''
  period?: '7d' | '30d' | '90d' | ''
  sort?: AssessmentSortKey
  order?: SortOrder
  page?: number
  pageSize?: number
}

export interface CreateAssessmentInput {
  companyName: string
  purpose: string
  cin?: string
  gstin?: string
  pan?: string
  industry?: string
  businessType?: string
  requestedLoanAmount?: number
  currency?: string
  facilityType?: string
  proposedTenure?: string
  annualTurnover?: number
  existingDebt?: number
  operatingHistory?: string
  assignedAnalyst?: string
  assessmentDate?: string
  reportingPeriod?: string
}

export type UpdateAssessmentInput = Partial<CreateAssessmentInput>

export const STATUS_LABEL: Record<AssessmentStatus, string> = {
  draft: 'Draft',
  in_progress: 'In progress',
  review: 'In review',
  completed: 'Completed',
  failed: 'Failed',
}

export function assessmentProgress(a: Pick<Assessment, 'stages'>): number {
  const done = Object.values(a.stages).filter((s) => s === 'completed').length
  return Math.round((done / STAGES.length) * 100)
}

export function currentStage(a: Pick<Assessment, 'stages'>): StageKey {
  const failed = STAGES.find((s) => a.stages[s.key] === 'failed')
  if (failed) return failed.key
  const active = STAGES.find((s) => a.stages[s.key] === 'active')
  if (active) return active.key
  const pending = STAGES.find((s) => a.stages[s.key] === 'pending')
  return pending?.key ?? 'report'
}
