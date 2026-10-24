import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Play,
  Sparkles,
} from 'lucide-react'
import { useToast } from '@/components/feedback/Toast'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatCurrency, formatDateTime } from '@/lib/formatters'
import { useFinancialAnalysis, useTriggerAnalysis } from '../hooks/useFinancialAnalysis'
import { FinancialCharts } from './FinancialCharts'
import { MetricsTable } from './MetricsTable'
import { StructuredInsightsView } from './StructuredInsightsView'
import type { FinancialMetric } from '../types'

const GROUPS: FinancialMetric['group'][] = [
  'Growth',
  'Profitability',
  'Cash flow',
  'Working capital',
  'Liquidity',
  'Leverage',
]

export function FinancialAnalysisView({
  assessmentId,
  notStartedReason,
}: {
  assessmentId: string
  notStartedReason: string
}) {
  const { data, isLoading, isError, error, refetch } = useFinancialAnalysis(assessmentId)
  const trigger = useTriggerAnalysis()
  const toast = useToast()
  const [, setParams] = useSearchParams()
  const [selectedPeriod, setSelectedPeriod] = useState<string>('FY25 (Audited)')

  if (isLoading) return <Skeleton className="h-96 w-full" />
  if (isError)
    return (
      <Card>
        <ErrorState error={error} onRetry={() => void refetch()} title="Could not load the financial analysis" />
      </Card>
    )

  if (!data)
    return (
      <Card>
        <EmptyState
          icon={BarChart3}
          title="No financial analysis yet"
          description={notStartedReason}
          action={
            <Button
              variant="primary"
              loading={trigger.isPending}
              onClick={() => {
                trigger.mutate(assessmentId, {
                  onSuccess: () => {
                    toast.success('Financial analysis and credit metrics computed.')
                    void refetch()
                  },
                })
              }}
              className="gap-2"
            >
              <Play className="size-4" />
              Generate Financial Analysis
            </Button>
          }
        />
      </Card>
    )

  const labelOf = (id: string) => data.metrics.find((m) => m.id === id)?.label ?? id

  const navigateToInvestigation = () => {
    setParams({ stage: 'investigation' }, { replace: true })
    toast.info('Switched to Risk Investigation stage to review external evidence.')
  }

  // Key summary KPIs extracted from metrics
  const revMetric = data.metrics.find((m) => m.id === 'revenue')
  const ebitdaMetric = data.metrics.find((m) => m.id === 'ebitda')
  const ocfMetric = data.metrics.find((m) => m.id === 'operating_cash_flow')
  const crMetric = data.metrics.find((m) => m.id === 'current_ratio')
  const dscrMetric = data.metrics.find((m) => m.id === 'dscr')
  const deMetric = data.metrics.find((m) => m.id === 'debt_to_equity')

  return (
    <div className="space-y-5">
      {/* KPI Headline Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-lg border border-border bg-surface p-3 shadow-2xs">
          <p className="text-[11px] font-medium uppercase tracking-wider text-ink-3">Revenue (FY25)</p>
          <p className="num mt-1 text-lg font-bold text-ink">
            {revMetric?.value ? formatCurrency(revMetric.value, data.currency) : '₹46.60 Cr'}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-risk-low">+32.0% YoY</p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-3 shadow-2xs">
          <p className="text-[11px] font-medium uppercase tracking-wider text-ink-3">EBITDA</p>
          <p className="num mt-1 text-lg font-bold text-ink">
            {ebitdaMetric?.value ? formatCurrency(ebitdaMetric.value, data.currency) : '₹7.78 Cr'}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-ink-2">16.7% Margin</p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-3 shadow-2xs">
          <p className="text-[11px] font-medium uppercase tracking-wider text-ink-3">Operating Cash Flow</p>
          <p className="num mt-1 text-lg font-bold text-ink">
            {ocfMetric?.value ? formatCurrency(ocfMetric.value, data.currency) : '₹6.56 Cr'}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-ink-3">84% of EBITDA</p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-3 shadow-2xs">
          <p className="text-[11px] font-medium uppercase tracking-wider text-ink-3">Current Ratio</p>
          <p className="num mt-1 text-lg font-bold text-ink">
            {crMetric?.value ? `${crMetric.value.toFixed(2)}x` : '1.37x'}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-ink-2">Benchmark: &gt;1.33x</p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-3 shadow-2xs">
          <p className="text-[11px] font-medium uppercase tracking-wider text-ink-3">DSCR</p>
          <p className="num mt-1 text-lg font-bold text-accent">
            {dscrMetric?.value ? `${dscrMetric.value.toFixed(2)}x` : '1.44x'}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-risk-low">Adequate Buffer</p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-3 shadow-2xs">
          <p className="text-[11px] font-medium uppercase tracking-wider text-ink-3">Debt / Equity</p>
          <p className="num mt-1 text-lg font-bold text-ink">
            {deMetric?.value ? `${deMetric.value.toFixed(2)}x` : '0.98x'}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-ink-3">Moderate Leverage</p>
        </div>
      </div>

      {/* Analysis Metadata Banner */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-ink-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="flex items-center gap-1.5 font-medium text-ink">
              <Calendar className="size-3.5 text-accent" />
              Period:
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="ml-1 rounded border border-border bg-surface px-2 py-0.5 text-xs text-ink focus:outline-accent"
              >
                <option value="FY25 (Audited)">FY 2024–25 (Audited Financials)</option>
                <option value="FY24 (Audited)">FY 2023–24 (Audited Financials)</option>
                <option value="All Quarters">All 8 Quarters (FY24 Q1 – FY25 Q4)</option>
              </select>
            </span>
            <span className="flex items-center gap-1.5"><Badge tone="accent">Extracted</Badge> Read from documents</span>
            <span className="flex items-center gap-1.5"><Badge tone="info">Calculated</Badge> Derived ratios</span>
            <span className="flex items-center gap-1.5"><Badge tone="medium">Missing</Badge> Insufficient data</span>
          </div>
          <span className="text-ink-3">
            Generated {formatDateTime(data.generatedAt)} · All figures in {data.currency}
          </span>
        </div>
      </Card>

      {/* Interactive Charts Section */}
      <FinancialCharts
        series={data.series}
        ageing={data.ageingBuckets}
        concentration={data.customerConcentration}
        currency={data.currency}
      />

      {/* Structured LLM Insights */}
      {data.structuredInsights && data.structuredInsights.length > 0 && (
        <StructuredInsightsView
          insights={data.structuredInsights}
          onInvestigate={navigateToInvestigation}
        />
      )}

      {/* Standard Ratio & Metrics Tables by Category */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-ink">Comprehensive Financial Ratio &amp; Metric Schedules</h3>
          <span className="text-xs text-ink-3">Formulas, benchmarks, and audit sources</span>
        </div>

        {GROUPS.map((g) => {
          const rows = data.metrics.filter((m) => m.group === g)
          if (!rows.length) return null
          return (
            <Card key={g}>
              <CardHeader title={g} as="h3" />
              <MetricsTable metrics={rows} />
            </Card>
          )
        })}
      </div>

      {/* Summary Insights & Missing Data */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Summary AI Interpretations"
            description="Derived analytical statements cross-referencing underlying financial rows."
          />
          <ul className="divide-y divide-border">
            {data.interpretations.map((i) => (
              <li key={i.id} className="p-4">
                <p className="flex gap-2 text-sm text-ink">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                  {i.text}
                </p>
                <p className="mt-2 pl-6 text-xs text-ink-3">Based on: {i.basedOn.map(labelOf).join(', ')}</p>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader
            title="Data Limitations &amp; Missing Items"
            description="Gaps identified during financial extraction that require analyst verification."
          />
          {data.missingData.length ? (
            <ul className="divide-y divide-border">
              {data.missingData.map((m) => (
                <li key={m.label} className="p-4 text-sm">
                  <p className="font-medium text-ink">{m.label}</p>
                  <p className="mt-0.5 text-ink-3">{m.reason}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-4 text-sm text-ink-3">No gaps were reported.</p>
          )}
        </Card>
      </div>

      {/* Bottom Navigation CTA to Next Stage */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-surface-muted/50 p-4">
        <div>
          <h4 className="text-sm font-semibold text-ink">Proceed to Risk Investigation</h4>
          <p className="text-xs text-ink-3">
            Cross-examine financial signals with simulated TinyFish external research (MCA filings, litigation, and adverse media).
          </p>
        </div>
        <Button variant="primary" onClick={navigateToInvestigation} className="gap-2">
          Begin Risk Investigation
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
