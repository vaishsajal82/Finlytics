import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import type { RiskScorecard } from '../types'

interface Props {
  scorecard: RiskScorecard
}

export function RiskScorecardBanner({ scorecard }: Props) {
  const [detailsOpen, setDetailsOpen] = useState(false)

  const getScoreColor = (score: number) => {
    if (score >= 65) return 'text-risk-high'
    if (score >= 40) return 'text-risk-med'
    return 'text-risk-low'
  }

  const getScoreBg = (score: number) => {
    if (score >= 65) return 'bg-risk-high'
    if (score >= 40) return 'bg-risk-med'
    return 'bg-risk-low'
  }

  return (
    <Card className="overflow-hidden border-border">
      <div className="bg-surface-muted/60 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl border border-border bg-surface shadow-xs">
              <span className={`text-xl font-bold leading-none ${getScoreColor(scorecard.overallScore)}`}>
                {scorecard.overallScore}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-ink-3">/ 100</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-ink">Transparent Credit Risk Scorecard</h3>
                <Badge
                  tone={
                    scorecard.overallRating === 'Low Risk'
                      ? 'low'
                      : scorecard.overallRating === 'Moderate Risk'
                        ? 'medium'
                        : 'high'
                  }
                >
                  {scorecard.overallRating}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-ink-3">
                Deterministic synthesis of financial statements, customer concentration, MCA registry data, and external research signals.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDetailsOpen(!detailsOpen)}
            className="flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
          >
            <span>{detailsOpen ? 'Hide scoring drivers' : 'Explain score drivers'}</span>
            {detailsOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
        </div>

        {/* 5 Risk Dimensions Bar */}
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
          {[
            { label: 'Financial Risk', data: scorecard.financialRisk },
            { label: 'Business & Ops', data: scorecard.businessOperationalRisk },
            { label: 'Legal & Regulatory', data: scorecard.legalRegulatoryRisk },
            { label: 'External Research', data: scorecard.externalResearchRisk },
            { label: 'Data Quality', data: scorecard.dataCompletenessRisk },
          ].map((dim) => (
            <div key={dim.label} className="rounded-lg border border-border bg-surface p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-ink-3">{dim.label}</span>
                <span className={`num text-xs font-bold ${getScoreColor(dim.data.score)}`}>
                  {dim.data.score}/100
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-border-subtle">
                <div
                  className={`h-full rounded-full ${getScoreBg(dim.data.score)}`}
                  style={{ width: `${Math.min(100, dim.data.score)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expanded Driver Explanations */}
      {detailsOpen && (
        <div className="border-t border-border bg-surface p-4 sm:p-5">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-3">
            Contributing Factor Breakdown
          </h4>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Financial Risk Drivers', data: scorecard.financialRisk },
              { title: 'Business & Operational Drivers', data: scorecard.businessOperationalRisk },
              { title: 'Legal & Regulatory Drivers', data: scorecard.legalRegulatoryRisk },
              { title: 'External Research Drivers', data: scorecard.externalResearchRisk },
              { title: 'Data Completeness Drivers', data: scorecard.dataCompletenessRisk },
            ].map((d) => (
              <div key={d.title} className="rounded-md border border-border bg-surface-muted/30 p-3 text-xs">
                <div className="flex items-center justify-between font-semibold text-ink">
                  <span>{d.title}</span>
                  <span className={`num ${getScoreColor(d.data.score)}`}>{d.data.score}/100</span>
                </div>
                <ul className="mt-2 space-y-1.5 text-ink-2">
                  {d.data.drivers.map((driver, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px]">
                      <span className="mt-1 size-1 shrink-0 rounded-full bg-ink-3" />
                      <span>{driver}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
