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
          {metrics.map((m) => {
            const missing = m.value === null
            const ch = change(m)
            return (
              <tr key={m.id} className="border-b border-border last:border-0">
                <td className="px-4 py-2.5">
                  <p className="font-medium text-ink">{m.label}</p>
                  {m.formula && <p className="text-xs text-ink-3">{m.formula}</p>}
                  {m.numerator && m.denominator && (
                    <p className="text-[11px] text-ink-3 font-mono">
                      Num: {m.numerator.label} · Den: {m.denominator.label}
                    </p>
                  )}
                  {m.interpretation && <p className="mt-0.5 text-xs text-ink-2 italic">{m.interpretation}</p>}
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
