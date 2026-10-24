import type { Assessment, AssessmentStatus } from '@/features/assessments/types'

export interface ActivityEvent {
  id: string
  assessmentId: string
  companyName: string
  kind: 'assessment_created' | 'document_uploaded' | 'extraction_completed' | 'extraction_failed' | 'finding_detected' | 'report_generated' | 'finding_reviewed'
  message: string
  at: string
}

export interface Overview {
  statusCounts: Record<AssessmentStatus, number>
  total: number
  recent: Assessment[]
  activity: ActivityEvent[]
  reportsReadyCount?: number
  documentsAwaitingProcessingCount?: number
  outstandingFindingsCount?: number
  highRiskFindingsCount?: number
}
