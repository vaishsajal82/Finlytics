import { useState } from 'react'
import {
  ArrowRight,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  HelpCircle,
  Lightbulb,
  Search,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import type { StructuredLlmInsight } from '../types'

interface Props {
  insights: StructuredLlmInsight[]
  onInvestigate?: (insight: StructuredLlmInsight) => void
}

export function StructuredInsightsView({ insights, onInvestigate }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(insights[0]?.id ?? null)

  const toggle = (id: string) => {
    setExpandedId((curr) => (curr === id ? null : id))
  }

  if (!insights || insights.length === 0) return null

  return (
    <Card>
      <CardHeader
        title="AI-Powered Financial Insights & Credit Reasoning"
        description="Structured analytical deductions derived by Finlytics financial engine. Each insight breaks down observations, implications, and required verification."
      />
      <div className="divide-y divide-border">
        {insights.map((item) => {
          const isExpanded = expandedId === item.id
          return (
            <div key={item.id} className="transition-colors hover:bg-surface-muted/20">
              <button
                type="button"
                onClick={() => toggle(item.id)}
                className="flex w-full items-center justify-between gap-4 p-4 text-left focus:outline-none"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-ink">{item.title}</h4>
                    <p className="mt-0.5 line-clamp-1 text-xs text-ink-3">{item.observation}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone="accent">Ref: {item.metricId}</Badge>
                  {isExpanded ? <ChevronUp className="size-4 text-ink-3" /> : <ChevronDown className="size-4 text-ink-3" />}
                </div>
              </button>

              {isExpanded && (
                <div className="space-y-4 px-4 pb-5 pt-1 text-xs sm:px-6">
                  {/* Observation & Interpretation Cards */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-border bg-surface-muted/50 p-3">
                      <div className="flex items-center gap-1.5 font-semibold text-ink">
                        <Lightbulb className="size-3.5 text-accent" />
                        Empirical Observation
                      </div>
                      <p className="mt-1.5 text-ink-2 leading-relaxed">{item.observation}</p>
                      <div className="mt-2.5 rounded border border-border bg-surface px-2.5 py-1 text-[11px] text-ink-3 font-mono">
                        Supporting figures: {item.supportingFigures}
                      </div>
                    </div>

                    <div className="rounded-lg border border-border bg-surface-muted/50 p-3">
                      <div className="flex items-center gap-1.5 font-semibold text-ink">
                        <Search className="size-3.5 text-info" />
                        Financial Interpretation
                      </div>
                      <p className="mt-1.5 text-ink-2 leading-relaxed">{item.interpretation}</p>
                      {item.comparison && (
                        <div className="mt-2.5 rounded border border-border bg-surface px-2.5 py-1 text-[11px] text-ink-3">
                          Benchmark comparison: <strong className="text-ink">{item.comparison}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Business vs Credit Implication */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-neutral-muted bg-surface p-3">
                      <div className="flex items-center gap-1.5 font-semibold text-ink">
                        <CheckCircle className="size-3.5 text-ink-2" />
                        Borrower Business Implication
                      </div>
                      <p className="mt-1.5 text-ink-2 leading-relaxed">{item.businessImplication}</p>
                    </div>

                    <div className="rounded-lg border border-risk-med/40 bg-risk-med-soft/30 p-3">
                      <div className="flex items-center gap-1.5 font-semibold text-risk-med">
                        <ShieldAlert className="size-3.5" />
                        Lending Risk &amp; Credit Implication
                      </div>
                      <p className="mt-1.5 text-ink-2 leading-relaxed">{item.creditImplication}</p>
                    </div>
                  </div>

                  {/* Limitations, Follow-up & Actions */}
                  <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface-muted/30 p-3.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1 sm:max-w-[70%]">
                      <div className="flex items-center gap-1.5 font-semibold text-ink-2">
                        <HelpCircle className="size-3.5 text-ink-3" />
                        Underwriter Verification Question:
                      </div>
                      <p className="text-ink italic leading-relaxed">{item.followUpQuestion}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[11px] text-ink-3">
                        <span className="flex items-center gap-1">
                          <FileText className="size-3 text-ink-3" />
                          Source: {item.evidenceRef}
                        </span>
                        <span>Limitations: {item.confidenceLimitations}</span>
                      </div>
                    </div>

                    {onInvestigate && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onInvestigate(item)}
                        className="shrink-0 gap-1.5 text-xs text-accent"
                      >
                        Flag for TinyFish Research
                        <ArrowRight className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
