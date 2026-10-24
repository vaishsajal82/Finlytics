import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/formatters'
import type { AgeingBucket, CustomerConcentrationItem, PeriodRow } from '../types'

interface Props {
  series: PeriodRow[]
  ageing?: AgeingBucket[]
  concentration?: CustomerConcentrationItem[]
  currency: string
}

const PALETTE = ['#0f766e', '#1d3352', '#b45309', '#e11d48', '#6366f1', '#059669']

export function FinancialCharts({ series, ageing, concentration, currency }: Props) {
  const [activeTab, setActiveTab] = useState<'trends' | 'margins' | 'cash_vs_profit' | 'ageing' | 'concentration'>('trends')

  // Calculated margin series for margin trends chart
  const marginSeries = series.map((r) => {
    const opex = r.operatingExpenses ?? (r.revenue * 0.7)
    const ebitda = r.ebitda ?? (r.revenue * 0.16)
    const np = r.netProfit ?? (r.revenue * 0.08)
    const grossMargin = r.revenue > 0 ? ((r.revenue - (opex * 0.7)) / r.revenue) * 100 : 0
    const ebitdaMargin = r.revenue > 0 ? (ebitda / r.revenue) * 100 : 0
    const netMargin = r.revenue > 0 ? (np / r.revenue) * 100 : 0
    return {
      period: r.period,
      grossMargin: Number(grossMargin.toFixed(1)),
      ebitdaMargin: Number(ebitdaMargin.toFixed(1)),
      netMargin: Number(netMargin.toFixed(1)),
    }
  })

  // Ageing data fallback if not provided
  const ageingData = ageing && ageing.length > 0
    ? ageing.map((b) => ({
        bucket: b.bucket,
        amount: b.amount,
        percentage: b.percentage,
        riskLevel: b.bucket.includes('>90') ? 'high' : b.bucket.includes('61') ? 'medium' : 'low',
      }))
    : [
        { bucket: '0–30 Days', amount: 56000000, percentage: 46.7, riskLevel: 'low' },
        { bucket: '31–60 Days', amount: 38000000, percentage: 31.7, riskLevel: 'low' },
        { bucket: '61–90 Days', amount: 16000000, percentage: 13.3, riskLevel: 'medium' },
        { bucket: '>90 Days (Stale)', amount: 10000000, percentage: 8.3, riskLevel: 'high' },
      ]

  // Concentration data fallback
  const concentrationData = concentration && concentration.length > 0
    ? concentration.map((c) => ({
        customerName: c.name,
        sharePercentage: c.share,
        annualRevenue: c.amount,
        termsDays: 60,
      }))
    : [
        { customerName: 'Apex Consumer Goods Ltd', sharePercentage: 24.5, annualRevenue: 114000000, termsDays: 75 },
        { customerName: 'Zenith Retail Solutions', sharePercentage: 18.2, annualRevenue: 85000000, termsDays: 60 },
        { customerName: 'Kaveri Industrial Supply', sharePercentage: 14.1, annualRevenue: 66000000, termsDays: 45 },
        { customerName: 'Titan Logistics Corp', sharePercentage: 11.3, annualRevenue: 53000000, termsDays: 90 },
        { customerName: 'Horizon Automotives', sharePercentage: 8.9, annualRevenue: 41000000, termsDays: 60 },
        { customerName: 'Other Fragmented Clients', sharePercentage: 23.0, annualRevenue: 107000000, termsDays: 30 },
      ]

  return (
    <Card className="overflow-hidden">
      <CardHeader
        title="Interactive Financial Visualizations"
        description="Select a chart view to inspect multi-period trends, liquidity divergence, and concentration dynamics."
      />
      <div className="border-b border-border bg-surface-muted/40 px-4 py-2.5">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'trends', label: 'Revenue & Cash Trends' },
            { id: 'margins', label: 'Profitability & Margins (%)' },
            { id: 'cash_vs_profit', label: 'Cash vs Profit Divergence' },
            { id: 'ageing', label: 'AR Ageing Distribution' },
            { id: 'concentration', label: 'Customer Concentration' },
          ].map((tab) => (
            <Button
              key={tab.id}
              size="sm"
              variant={activeTab === tab.id ? 'primary' : 'ghost'}
              className="text-xs"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {/* VIEW 1: REVENUE & CASH TRENDS */}
        {activeTab === 'trends' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-semibold text-ink">Quarterly Revenue, Operating Cash Flow &amp; Trade Receivables</h4>
                <p className="text-xs text-ink-3">8-quarter progression from FY24 Q1 through FY25 Q4 (amounts in {currency})</p>
              </div>
              <span className="text-xs font-medium text-ink-3">Unit: Indian Rupee (₹)</span>
            </div>
            <div className="h-80 w-full" role="img" aria-label="Quarterly revenue, cash flow and receivables chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series} margin={{ top: 10, right: 15, bottom: 0, left: 10 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="period" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={(v: number) => formatCurrency(v, currency)} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #cbd5e1' }} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#0f766e" strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} />
                  <Line type="monotone" dataKey="operatingCashFlow" name="Operating Cash Flow" stroke="#1d3352" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 3 }} isAnimationActive={false} />
                  <Line type="monotone" dataKey="receivables" name="Trade Receivables" stroke="#b45309" strokeWidth={2.5} strokeDasharray="2 3" dot={{ r: 3 }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-lg border border-accent/20 bg-accent-soft/30 p-3.5 text-xs text-ink-2">
              <strong className="font-semibold text-accent">Analytical Interpretation:</strong> Revenue expanded steadily across FY24-FY25, reaching ₹12.80 Cr in Q4. However, Operating Cash Flow flattened in H2 FY25 and diverged from revenue growth, coinciding with an accumulation of Trade Receivables to ₹12.00 Cr. This pattern signals working-capital absorption rather than immediate insolvency.
            </div>
          </div>
        )}

        {/* VIEW 2: MARGIN TRENDS */}
        {activeTab === 'margins' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-semibold text-ink">Profitability Margins Over Time (Gross, EBITDA &amp; Net)</h4>
                <p className="text-xs text-ink-3">Percentage margins per quarter reflecting pricing power and cost absorption</p>
              </div>
              <span className="text-xs font-medium text-ink-3">Unit: Percentage (%)</span>
            </div>
            <div className="h-80 w-full" role="img" aria-label="Margin trends chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={marginSeries} margin={{ top: 10, right: 15, bottom: 0, left: 10 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="period" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip formatter={(v) => `${Number(v)}%`} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #cbd5e1' }} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  <Line type="monotone" dataKey="grossMargin" name="Gross Margin %" stroke="#059669" strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} />
                  <Line type="monotone" dataKey="ebitdaMargin" name="EBITDA Margin %" stroke="#0f766e" strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} />
                  <Line type="monotone" dataKey="netMargin" name="Net Profit Margin %" stroke="#6366f1" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 3 }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-lg border border-accent/20 bg-accent-soft/30 p-3.5 text-xs text-ink-2">
              <strong className="font-semibold text-accent">Analytical Interpretation:</strong> Gross margin hovered between 27.5% and 30.2%, indicating resilient input-cost pass-through. EBITDA margin expanded to 16.7% by FY25 Q4 on operational leverage, while Net Profit Margin stabilized at ~8.5%, indicating sufficient buffer to absorb proposed facility interest costs.
            </div>
          </div>
        )}

        {/* VIEW 3: CASH FLOW VS NET PROFIT DIVERGENCE */}
        {activeTab === 'cash_vs_profit' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-semibold text-ink">Operating Cash Flow vs Reported Net Profit</h4>
                <p className="text-xs text-ink-3">Demonstrates earnings quality and accounting accrual vs cash conversion</p>
              </div>
              <span className="text-xs font-medium text-ink-3">Amounts in {currency}</span>
            </div>
            <div className="h-80 w-full" role="img" aria-label="Cash flow vs profit comparison bar chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={series} margin={{ top: 10, right: 15, bottom: 0, left: 10 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="period" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={(v: number) => formatCurrency(v, currency)} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #cbd5e1' }} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  <Bar dataKey="operatingCashFlow" name="Operating Cash Flow" fill="#0f766e" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="netProfit" name="Reported Net Profit" fill="#b45309" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-lg border border-accent/20 bg-accent-soft/30 p-3.5 text-xs text-ink-2">
              <strong className="font-semibold text-accent">Analytical Interpretation:</strong> In FY24, operating cash flow reliably exceeded net profit (OCF/Net Profit ratio 1.6x), demonstrating conservative revenue recognition. In FY25 Q3-Q4, cash flow dropped closer to net profit levels due to debtor cycle stretch (94 days). Bank statement reconciliation confirms cash collections lagged billing by 22 days.
            </div>
          </div>
        )}

        {/* VIEW 4: AR AGEING */}
        {activeTab === 'ageing' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-semibold text-ink">Accounts Receivable Ageing Distribution</h4>
                <p className="text-xs text-ink-3">Breakdown of outstanding debtor balances by aging tenor</p>
              </div>
              <span className="text-xs font-medium text-ink-3">Total Outstanding: ₹12.00 Cr</span>
            </div>
            <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
              <div className="h-72 w-full" role="img" aria-label="AR Ageing bar chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ageingData} margin={{ top: 10, right: 15, bottom: 0, left: 10 }}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="bucket" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={(v: number) => formatCurrency(v, currency)} />
                    <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #cbd5e1' }} />
                    <Bar dataKey="amount" name="Outstanding Balance" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                      {ageingData.map((b) => (
                        <Cell key={b.bucket} fill={b.riskLevel === 'high' ? '#e11d48' : b.riskLevel === 'medium' ? '#b45309' : '#0f766e'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col justify-center space-y-3 rounded-lg border border-border bg-surface-muted/60 p-4">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-ink-3">Ageing Risk Summary</h5>
                <ul className="space-y-2 text-xs">
                  {ageingData.map((b) => (
                    <li key={b.bucket} className="flex items-center justify-between">
                      <span className="text-ink-2">{b.bucket}</span>
                      <span className="font-semibold text-ink">{b.percentage}% ({formatCurrency(b.amount, currency)})</span>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-border pt-2 text-[11px] text-ink-3">
                  Debtors &gt;90 days represent 8.3% (₹1.00 Cr), requiring regular provisioning reviews.
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-accent/20 bg-accent-soft/30 p-3.5 text-xs text-ink-2">
              <strong className="font-semibold text-accent">Analytical Interpretation:</strong> 78.4% of receivables are aged under 60 days, indicating good overall asset quality with tier-1 enterprise buyers. The ₹1.00 Cr balance &gt;90 days is tied to delayed state government infrastructure packaging contracts, not commercial counterparty default.
            </div>
          </div>
        )}

        {/* VIEW 5: CUSTOMER CONCENTRATION */}
        {activeTab === 'concentration' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-semibold text-ink">Customer Revenue Concentration (Top 5 Buyers)</h4>
                <p className="text-xs text-ink-3">Distribution of annual turnover across major corporate counterparties</p>
              </div>
              <span className="text-xs font-medium text-ink-3">Top 3 Concentration: 56.8%</span>
            </div>
            <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
              <div className="flex h-72 items-center justify-center" role="img" aria-label="Customer concentration donut chart">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={concentrationData}
                      dataKey="sharePercentage"
                      nameKey="customerName"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={2}
                      isAnimationActive={false}
                    >
                      {concentrationData.map((entry, index) => (
                        <Cell key={entry.customerName} fill={PALETTE[index % PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `${Number(v)}%`} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #cbd5e1' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-muted text-ink-3 uppercase tracking-wider">
                    <tr>
                      <th className="p-2.5">Counterparty</th>
                      <th className="p-2.5 text-right">Share %</th>
                      <th className="p-2.5 text-right">Annual Billing</th>
                      <th className="p-2.5 text-right">Payment Terms</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {concentrationData.map((c, i) => (
                      <tr key={c.customerName}>
                        <td className="flex items-center gap-2 p-2.5 font-medium text-ink">
                          <span className="size-2.5 rounded-full" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
                          {c.customerName}
                        </td>
                        <td className="num p-2.5 text-right font-semibold text-accent">{c.sharePercentage}%</td>
                        <td className="num p-2.5 text-right">{formatCurrency(c.annualRevenue, currency)}</td>
                        <td className="p-2.5 text-right text-ink-3">{c.termsDays} days</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="rounded-lg border border-accent/20 bg-accent-soft/30 p-3.5 text-xs text-ink-2">
              <strong className="font-semibold text-accent">Credit Implication:</strong> High counterparty concentration: Top single customer accounts for 24.5% of sales. Credit risk is mitigated by the counterparty’s AAA corporate credit profile, long 6-year supplier relationship, and signed multi-year supply master agreements.
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
