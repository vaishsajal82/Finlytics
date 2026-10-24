import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCurrency } from '@/lib/formatters'
import type { PeriodRow } from '../types'

const SERIES = [
  { key: 'revenue', name: 'Revenue', color: '#0f766e', dash: undefined },
  { key: 'operatingCashFlow', name: 'Operating cash flow', color: '#1d3352', dash: '6 3' },
  { key: 'receivables', name: 'Trade receivables', color: '#b45309', dash: '2 3' },
] as const

/** Dashes differ per series so the chart does not rely on colour alone. */
export default function TrendChart({ series, currency }: { series: PeriodRow[]; currency: string }) {
  return (
    <div role="img" aria-label="Quarterly revenue, operating cash flow and trade receivables. A data table follows." className="h-72 w-full">
      <ResponsiveContainer>
        <LineChart data={series} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="period" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
          <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} width={64} tickFormatter={(v: number) => formatCurrency(v, currency)} />
          <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e2e8f0' }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {SERIES.map((s) => (
            <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2} strokeDasharray={s.dash} dot={{ r: 2.5 }} activeDot={{ r: 4 }} isAnimationActive={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
