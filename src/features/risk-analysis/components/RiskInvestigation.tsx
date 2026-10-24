import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  RotateCw,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { ClassBadge, ReviewBadge, SeverityBadge } from '@/components/data-display/badges'
import { useToast } from '@/components/feedback/Toast'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Dialog } from '@/components/ui/Dialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Select } from '@/components/ui/Field'
import { Progress } from '@/components/ui/Progress'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAssessment } from '@/features/assessments/hooks/useAssessments'
import { useFinancialAnalysis } from '@/features/financial-analysis/hooks/useFinancialAnalysis'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'
import { calculateRiskScorecard } from '@/services/demo/riskScoring'
import type { Severity } from '@/types/common'
import { useFindings, useRunTinyFishResearch } from '../hooks/useFindings'
import {
  CLASS_LABEL,
  REVIEW_LABEL,
  RISK_CATEGORY_LABEL,
  type FindingClass,
  type ReviewStatus,
  type RiskCategory,
} from '../types'
import { FindingDetail } from './FindingDetail'
import { RiskScorecardBanner } from './RiskScorecardBanner'

const sevOptions = [
  { value: '', label: 'All severities' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

const classOptions = [
  { value: '', label: 'All finding types' },
  ...(Object.keys(CLASS_LABEL) as FindingClass[]).map((c) => ({ value: c, label: CLASS_LABEL[c] })),
]

const reviewOptions = [
  { value: '', label: 'All review states' },
  ...(Object.keys(REVIEW_LABEL) as ReviewStatus[]).map((r) => ({ value: r, label: REVIEW_LABEL[r] })),
]

const categoryOptions = [
  { value: '', label: 'All 12 Risk Categories' },
  ...(Object.keys(RISK_CATEGORY_LABEL) as RiskCategory[]).map((cat) => ({
    value: cat,
    label: RISK_CATEGORY_LABEL[cat],
  })),
]

export function RiskInvestigation({ assessmentId, emptyHint }: { assessmentId?: string; emptyHint?: string }) {
  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState<Severity | ''>('')
  const [classification, setClassification] = useState<FindingClass | ''>('')
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus | ''>('')
  const [selectedCategory, setSelectedCategory] = useState<RiskCategory | ''>('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isResearching, setIsResearching] = useState(false)
  const [researchStep, setResearchStep] = useState<string>('')
  const [researchProgress, setResearchProgress] = useState(0)

  const wide = useMediaQuery('(min-width: 1024px)')
  const q = useDebouncedValue(search)
  const toast = useToast()
  const [, setParams] = useSearchParams()

  const { data: assessment } = useAssessment(assessmentId ?? '')
  const { data: analysis } = useFinancialAnalysis(assessmentId ?? '')
  const { data, isLoading, isError, error, refetch } = useFindings({
    assessmentId,
    search: q,
    severity,
    classification,
    reviewStatus,
  })

  const runResearch = useRunTinyFishResearch()

  const filtered = Boolean(q || severity || classification || reviewStatus || selectedCategory)

  // Filter in-memory by category if selected
  const displayedFindings = data
    ? selectedCategory
      ? data.filter((f) => f.category === selectedCategory)
      : data
    : []

  const selected = displayedFindings.find((f) => f.id === selectedId) ?? (wide ? displayedFindings[0] : undefined)

  // Compute multi-factor risk scorecard
  const scorecard = calculateRiskScorecard(
    analysis ?? undefined,
    data ?? [],
    assessment?.requestedLoanAmount ?? 20000000,
  )

  const handleRunTinyFish = async () => {
    if (!assessmentId) return
    setIsResearching(true)
    setResearchProgress(15)
    setResearchStep('Connecting to TinyFish simulated intelligence engine...')

    setTimeout(() => {
      setResearchProgress(40)
      setResearchStep('Scanning MCA-21 master records & e-Courts litigation registries...')
    }, 600)

    setTimeout(() => {
      setResearchProgress(75)
      setResearchStep('Cross-referencing GSTIN turnover vs audited financials & trade media...')
    }, 1200)

    setTimeout(async () => {
      setResearchProgress(100)
      setResearchStep('Synthesizing evidence records & evaluating risk hypotheses...')
      try {
        await runResearch.mutateAsync(assessmentId)
        setIsResearching(false)
        toast.success('TinyFish external research completed. Evidence records and risk scorecard updated.')
        void refetch()
      } catch {
        setIsResearching(false)
        toast.error('Simulation completed with cached findings.')
      }
    }, 1800)
  }

  const navigateToReport = () => {
    setParams({ stage: 'report' }, { replace: true })
    toast.info('Switched to Final Decision-Support Report stage.')
  }

  return (
    <div className="space-y-4">
      {/* Risk Scorecard Banner */}
      <RiskScorecardBanner scorecard={scorecard} />

      {/* TinyFish Research Control Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-accent" />
              <h3 className="text-sm font-semibold text-ink">TinyFish External Research Engine</h3>
              <Badge tone="accent">Simulated Research</Badge>
            </div>
            <p className="mt-1 text-xs text-ink-3">
              Automated queries across MCA-21 corporate registry, e-Courts national portal, GST portal, and trade media. All claims backed by traceable source records.
            </p>
          </div>
          <Button
            variant="secondary"
            loading={isResearching}
            onClick={handleRunTinyFish}
            className="shrink-0 gap-2 text-xs text-accent"
          >
            <RotateCw className="size-3.5" />
            Re-run TinyFish Research
          </Button>
        </div>

        {isResearching && (
          <div className="mt-3.5 rounded-lg border border-accent/30 bg-accent-soft/40 p-3 text-xs">
            <div className="flex items-center justify-between font-medium text-ink">
              <span>{researchStep}</span>
              <span className="num font-semibold text-accent">{researchProgress}%</span>
            </div>
            <Progress className="mt-2" value={researchProgress} label={researchStep} />
          </div>
        )}
      </Card>

      {/* Search & Filters */}
      <Card>
        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-[1fr_repeat(4,10.5rem)]">
          <div className="relative">
            <label htmlFor="risk-search" className="sr-only">
              Search findings
            </label>
            <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-ink-3" aria-hidden />
            <input
              id="risk-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search findings or evidence..."
              className="h-9 w-full rounded-md border border-border-strong bg-surface pl-8 pr-3 text-sm placeholder:text-ink-3"
            />
          </div>
          <Select
            label="Category"
            hideLabel
            value={selectedCategory}
            options={categoryOptions}
            onChange={(e) => setSelectedCategory(e.target.value as RiskCategory | '')}
          />
          <Select
            label="Severity"
            hideLabel
            value={severity}
            options={sevOptions}
            onChange={(e) => setSeverity(e.target.value as Severity | '')}
          />
          <Select
            label="Finding type"
            hideLabel
            value={classification}
            options={classOptions}
            onChange={(e) => setClassification(e.target.value as FindingClass | '')}
          />
          <Select
            label="Review state"
            hideLabel
            value={reviewStatus}
            options={reviewOptions}
            onChange={(e) => setReviewStatus(e.target.value as ReviewStatus | '')}
          />
        </div>
      </Card>

      {isLoading ? (
        <Skeleton className="h-80 w-full" />
      ) : isError ? (
        <Card>
          <ErrorState error={error} onRetry={() => void refetch()} title="Could not load findings" />
        </Card>
      ) : displayedFindings.length === 0 ? (
        <Card>
          <EmptyState
            icon={ShieldCheck}
            title={filtered ? 'No findings match these filters' : 'No findings'}
            description={
              filtered
                ? 'Clear a filter or search term to see more.'
                : (emptyHint ?? 'Findings appear here after financial analysis detects patterns that need investigation.')
            }
          />
        </Card>
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,22rem)_1fr] xl:grid-cols-[minmax(0,26rem)_1fr]">
          <Card>
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5 text-xs text-ink-3">
              <span className="font-semibold uppercase tracking-wide">
                <span className="num font-bold text-ink">{displayedFindings.length}</span> finding{displayedFindings.length === 1 ? '' : 's'}
              </span>
              <span>12 Risk Categories Evaluated</span>
            </div>
            <ul className="divide-y divide-border">
              {displayedFindings.map((f) => {
                const active = selected?.id === f.id
                const catLabel = f.category ? RISK_CATEGORY_LABEL[f.category] : undefined
                return (
                  <li key={f.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(f.id)}
                      aria-current={active ? 'true' : undefined}
                      className={cn(
                        'block w-full px-4 py-3 text-left transition-colors',
                        active ? 'bg-accent-soft' : 'hover:bg-surface-muted',
                      )}
                    >
                      <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                        <SeverityBadge severity={f.severity} />
                        <ClassBadge value={f.classification} />
                        {catLabel && (
                          <span className="rounded bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-ink-2">
                            {catLabel}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-ink leading-snug">{f.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-ink-3 leading-relaxed">{f.summary}</p>
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-3">
                        {!assessmentId && <span className="font-medium text-ink-2">{f.companyName}</span>}
                        <span className="num text-[11px] font-mono text-ink-3">{f.evidence.length} evidence sources</span>
                        <ReviewBadge status={f.reviewStatus} />
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          </Card>

          {wide ? (
            <Card className="sticky top-4 max-h-[calc(100dvh-8rem)] overflow-y-auto p-5">
              {selected ? <FindingDetail key={selected.id} finding={selected} /> : null}
            </Card>
          ) : (
            <Dialog
              open={selectedId !== null && selected !== undefined}
              onClose={() => setSelectedId(null)}
              title="Finding & External Research Details"
              size="lg"
            >
              {selected && <FindingDetail key={selected.id} finding={selected} />}
            </Dialog>
          )}
        </div>
      )}

      {/* Bottom CTA to Final Report */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-surface-muted/50 p-4">
        <div>
          <h4 className="text-sm font-semibold text-ink">Ready to compile final assessment?</h4>
          <p className="text-xs text-ink-3">
            Consolidate borrower financials, TinyFish evidence register, stress scenarios, and preliminary credit recommendation.
          </p>
        </div>
        <Button variant="primary" onClick={navigateToReport} className="gap-2">
          Compile Final Report
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
