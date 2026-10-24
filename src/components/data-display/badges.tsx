import { AlertOctagon, AlertTriangle, CheckCircle2, CircleDashed, CircleHelp, CircleSlash, Info, Loader2, ShieldCheck, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import type { Severity } from '@/types/common'
import type { AssessmentStatus, StageStatus } from '@/features/assessments/types'
import { STATUS_LABEL } from '@/features/assessments/types'
import type { DocumentStatus } from '@/features/documents/types'
import { DOCUMENT_STATUS_LABEL } from '@/features/documents/types'
import type { EvidenceStatus, FindingClass, ReviewStatus } from '@/features/risk-analysis/types'
import { CLASS_LABEL, EVIDENCE_LABEL, REVIEW_LABEL } from '@/features/risk-analysis/types'

/** Severity is always conveyed by icon shape and text, never by colour alone. */
export function SeverityBadge({ severity }: { severity: Severity | null }) {
  if (!severity) return <Badge>Not assessed</Badge>
  const map = {
    high: { tone: 'high', Icon: AlertOctagon, label: 'High' },
    medium: { tone: 'medium', Icon: AlertTriangle, label: 'Medium' },
    low: { tone: 'low', Icon: Info, label: 'Low' },
  } as const
  const { tone, Icon, label } = map[severity]
  return (
    <Badge tone={tone}>
      <Icon className="size-3" aria-hidden />
      {label}
    </Badge>
  )
}

export function AssessmentStatusBadge({ status }: { status: AssessmentStatus }) {
  const tone = status === 'completed' ? 'low' : status === 'failed' ? 'high' : status === 'review' ? 'info' : status === 'in_progress' ? 'accent' : 'neutral'
  return <Badge tone={tone}>{STATUS_LABEL[status]}</Badge>
}

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  switch (status) {
    case 'completed':
      return (
        <Badge tone="low">
          <CheckCircle2 className="size-3" aria-hidden />
          {DOCUMENT_STATUS_LABEL[status]}
        </Badge>
      )
    case 'failed':
      return (
        <Badge tone="high">
          <XCircle className="size-3" aria-hidden />
          {DOCUMENT_STATUS_LABEL[status]}
        </Badge>
      )
    case 'processing':
      return (
        <Badge tone="info">
          <Loader2 className="size-3 animate-spin" aria-hidden />
          {DOCUMENT_STATUS_LABEL[status]}
        </Badge>
      )
    case 'queued':
      return (
        <Badge>
          <CircleDashed className="size-3" aria-hidden />
          {DOCUMENT_STATUS_LABEL[status]}
        </Badge>
      )
  }
}

export function StageStatusLabel({ status }: { status: StageStatus }) {
  const map: Record<StageStatus, string> = { completed: 'Completed', active: 'In progress', pending: 'Not started', failed: 'Failed' }
  return <>{map[status]}</>
}

export function ReviewBadge({ status }: { status: ReviewStatus }) {
  const tone = status === 'confirmed' ? 'high' : status === 'investigating' ? 'info' : status === 'needs_info' ? 'medium' : status === 'dismissed' ? 'neutral' : 'neutral'
  return <Badge tone={tone}>{REVIEW_LABEL[status]}</Badge>
}

export function ClassBadge({ value }: { value: FindingClass }) {
  const Icon = value === 'confirmed_fact' ? ShieldCheck : value === 'potential_anomaly' ? CircleHelp : CircleSlash
  return (
    <Badge tone={value === 'confirmed_fact' ? 'accent' : 'neutral'}>
      <Icon className="size-3" aria-hidden />
      {CLASS_LABEL[value]}
    </Badge>
  )
}

export function EvidenceBadge({ status }: { status: EvidenceStatus }) {
  const tone = status === 'supported' || status === 'corroborated' ? 'low' : status === 'contradicted' ? 'high' : status === 'unverified' ? 'medium' : 'neutral'
  return <Badge tone={tone}>{EVIDENCE_LABEL[status]}</Badge>
}
