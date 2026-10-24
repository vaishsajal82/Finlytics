import { useState } from 'react'
import { Info } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { formatMetricValue, formatPercent } from '@/lib/formatters'
import type { FinancialMetric } from '../types'

export function KindBadge({ kind, missing }: { kind: FinancialMetric['kind']; missing?: boolean }) {
  if (missing) return <Badge tone="medium">Missing</Badge>
  return kind === 'extracted' ? (
    <Badge tone="accent" title="Read directly from an uploaded document">
      Extracted
    </Badge>
  ) : (
    <Badge tone="info" title="Calculated from extracted figures">
      Calculated
    </Badge>
  )
}

function change(m: FinancialMetric): string | null {
  const c = m.comparison
  if (!c || c.value === null || m.value === null || m.unit !== 'currency' || c.value === 0) return null
  return formatPercent((m.value / c.value - 1) * 100, 1, true)
}

function MetricBreakdownTooltip({ metric, isNearBottom }: { metric: FinancialMetric; isNearBottom: boolean }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
    >
      <button
        type="button"
        aria-label={`Calculation breakdown for ${metric.label}`}
        aria-expanded={isOpen}
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen((prev) => !prev)
        }}
        className="inline-flex size-4 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-neutral-soft hover:text-accent focus:outline-none focus:ring-1 focus:ring-accent"
      >
        <Info className="size-3.5" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          role="tooltip"
          className={`absolute left-0 z-50 w-72 sm:w-80 rounded-lg border border-border bg-surface p-3 text-left shadow-pop animate-in fade-in zoom-in-95 ${
            isNearBottom ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          }`}
        >
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink">
            <Info className="size-3.5 text-accent" />
            <span>Calculation Breakdown</span>
          </div>

          {metric.formula && (
            <div className="mb-2 rounded border border-border/70 bg-surface-muted/80 p-2">
              <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wider text-accent">Formula</span>
              <code className="block text-xs font-mono font-medium text-ink break-words">{metric.formula}</code>
            </div>
          )}



          {metric.interpretation && (
            <div className="mb-1.5 border-t border-border/60 pt-1.5 text-xs italic text-ink-2">
              {metric.interpretation}
            </div>
          )}

          {metric.benchmark && (
            <div className="flex items-center justify-between border-t border-border/60 pt-1.5 text-[11px] text-ink-2">
              <span className="text-ink-3">Benchmark ({metric.benchmark.label}):</span>
              <span className="font-semibold text-accent">{metric.benchmark.value}</span>
            </div>
          )}

          {metric.sources.length > 0 && (
            <div className="mt-1.5 border-t border-border/60 pt-1.5 text-[10px] text-ink-3">
              <span className="font-semibold">Source: </span>
              {metric.sources.map((s) => `${s.documentName}${s.page ? ` (p.${s.page})` : ''}`).join('; ')}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function MetricsTable({ metrics }: { metrics: FinancialMetric[] }) {
  return (
    <div className="overflow-x-auto scroll-thin">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-surface-muted text-xs uppercase tracking-wide text-ink-3">
          <tr>
            <th scope="col" className="px-4 py-2.5 font-semibold">Metric</th>
            <th scope="col" className="px-4 py-2.5 text-right font-semibold">Value</th>
            <th scope="col" className="px-4 py-2.5 font-semibold">Period</th>
            <th scope="col" className="hidden px-4 py-2.5 text-right font-semibold md:table-cell">Comparison</th>
            <th scope="col" className="px-4 py-2.5 font-semibold">Basis</th>
            <th scope="col" className="hidden px-4 py-2.5 font-semibold lg:table-cell">Source</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((m, idx) => {
            const missing = m.value === null
            const ch = change(m)
            const hasBreakdown = Boolean(m.formula || m.interpretation || m.benchmark)

            return (
              <tr key={m.id} className="border-b border-border last:border-0">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <p className="font-medium text-ink">{m.label}</p>
                    {hasBreakdown && (
                      <MetricBreakdownTooltip metric={m} isNearBottom={idx >= metrics.length - 2 && idx > 1} />
                    )}
                  </div>
                  {missing && m.missingReason && <p className="mt-0.5 text-xs text-risk-med">{m.missingReason}</p>}
                </td>
                <td className="num px-4 py-2.5 text-right font-medium text-ink">{formatMetricValue(m.value, m.unit, m.currency, m.unit === 'percent' && m.id.endsWith('growth'))}</td>
                <td className="whitespace-nowrap px-4 py-2.5 text-ink-2">{m.period}</td>
                <td className="num hidden px-4 py-2.5 text-right text-ink-2 md:table-cell">
                  {m.comparison ? (
                    <>
                      <span className="text-ink-3">{m.comparison.basis}: </span>
                      {formatMetricValue(m.comparison.value, m.comparison.unit, m.currency)}
                      {ch && <span className="ml-1 text-ink-3">({ch})</span>}
                    </>
                  ) : (
                    <span className="text-ink-3" title="No comparison basis available">
                      —
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <KindBadge kind={m.kind} missing={missing} />
                </td>
                <td className="hidden px-4 py-2.5 text-xs text-ink-3 lg:table-cell">
                  {m.sources.length ? m.sources.map((s) => `${s.documentName}${s.page ? ` p.${s.page}` : ''}`).join('; ') : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
