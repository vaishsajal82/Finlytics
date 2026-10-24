import type { Severity } from '@/types/common'
import { SeverityBadge } from '@/components/data-display/badges'
import type { RiskSummary as Summary } from '../types'

/** Compact risk indicator: overall level plus counts per level, all as text. */
export function RiskSummaryCell({ overall, summary }: { overall: Severity | null; summary: Summary | null }) {
  if (!summary) return <span className="text-xs text-ink-3">No findings yet</span>
  return (
    <div className="flex flex-col items-start gap-1">
      <SeverityBadge severity={overall} />
      <span className="num text-xs text-ink-3">
        {summary.high} high · {summary.medium} med · {summary.low} low
        {summary.unreviewed > 0 && ` · ${summary.unreviewed} unreviewed`}
      </span>
    </div>
  )
}
