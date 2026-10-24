import { useState } from 'react'
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, FileSearch, Trash2 } from 'lucide-react'
import { PageContainer } from '@/app/layouts/PageContainer'
import { AssessmentStatusBadge } from '@/components/data-display/badges'
import { useToast } from '@/components/feedback/Toast'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/Dialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { DocumentUploader } from '@/features/documents/components/DocumentUploader'
import { DocumentsList } from '@/features/documents/components/DocumentsList'
import { ExtractionSummary } from '@/features/documents/components/ExtractionSummary'
import { FinancialAnalysisView } from '@/features/financial-analysis/components/FinancialAnalysisView'
import { RiskInvestigation } from '@/features/risk-analysis/components/RiskInvestigation'
import { AssessmentReportPanel } from '@/features/reports/components/AssessmentReportPanel'
import { formatDate, formatCurrency } from '@/lib/formatters'
import { ApiError, toUserMessage } from '@/services/api/errors'
import { useFinancialAnalysis } from '@/features/financial-analysis/hooks/useFinancialAnalysis'
import { StructuredInsightsView } from '@/features/financial-analysis/components/StructuredInsightsView'
import type { StructuredLlmInsight } from '@/features/financial-analysis/types'
import { AssessmentForm } from '../components/AssessmentForm'
import { StageStepper } from '../components/StageStepper'
import { useAssessment, useDeleteAssessment, useUpdateAssessment } from '../hooks/useAssessments'
import { currentStage, STAGES, type Assessment, type StageKey } from '../types'

function StageBody({ a, stage }: { a: Assessment; stage: StageKey }) {
  const update = useUpdateAssessment(a.id)
  const toast = useToast()
  const [, setParams] = useSearchParams()
  const { data: analysis } = useFinancialAnalysis(a.id)

  const navigateToInvestigation = (insight: StructuredLlmInsight) => {
    setParams({ stage: 'investigation', search: insight.title }, { replace: true })
    toast.info(`Navigated to Risk Investigation for ${insight.title}`)
  }

  switch (stage) {
    case 'company':
      return (
        <Card>
          <CardHeader title="Company information & credit facility details" description={`Assessment ${a.id} · opened ${formatDate(a.createdAt)}`} />
          <div className="p-4">
            <AssessmentForm
              key={a.updatedAt}
              submitLabel="Save changes"
              defaultValues={{
                companyName: a.companyName,
                purpose: a.purpose,
                cin: a.cin ?? '',
                gstin: a.gstin ?? '',
                pan: a.pan ?? '',
                industry: a.industry ?? '',
                businessType: a.businessType ?? '',
                requestedLoanAmount: a.requestedLoanAmount,
                currency: a.currency ?? 'INR',
                facilityType: a.facilityType ?? '',
                proposedTenure: a.proposedTenure ?? '',
                annualTurnover: a.annualTurnover,
                existingDebt: a.existingDebt,
                operatingHistory: a.operatingHistory ?? '',
                assignedAnalyst: a.assignedAnalyst ?? '',
                reportingPeriod: a.reportingPeriod ?? '',
                assessmentDate: a.assessmentDate ?? '',
              }}
              onSubmit={async (v) => {
                await update.mutateAsync(v)
                toast.success('Company information saved.')
              }}
            />
          </div>
        </Card>
      )
    case 'documents':
      return (
        <div className="space-y-4">
          <DocumentUploader assessmentId={a.id} />
          <Card>
            <CardHeader title="Uploaded documents" />
            <DocumentsList
              query={{ assessmentId: a.id }}
              showExtractionCount={false}
              emptyHint="Upload bank statements, balance sheets, P&L, cash-flow statements or GST returns to begin."
            />
          </Card>
        </div>
      )
    case 'extraction':
      return (
        <div className="space-y-4">
          <ExtractionSummary assessmentId={a.id} />
          {analysis?.structuredInsights && analysis.structuredInsights.length > 0 && (
            <StructuredInsightsView
              insights={analysis.structuredInsights}
              onInvestigate={navigateToInvestigation}
            />
          )}
          <Card>
            <CardHeader title="Extracted document records & fields" description="Failed documents can be retried. Open a document to see the fields extracted from it." />
            <DocumentsList
              query={{ assessmentId: a.id }}
              showExtractionCount={true}
              emptyHint="Nothing to process yet. Upload documents in the previous stage."
            />
          </Card>
        </div>
      )
    case 'analysis':
      return (
        <FinancialAnalysisView
          assessmentId={a.id}
          notStartedReason={
            a.stages.extraction === 'completed'
              ? 'Extraction finished, but the backend has not returned an analysis for this assessment.'
              : 'Analysis needs extracted figures. Finish uploading and extracting documents first.'
          }
        />
      )
    case 'investigation':
      return <RiskInvestigation assessmentId={a.id} emptyHint="No findings yet. Findings appear once financial analysis has run." />
    case 'report':
      return <AssessmentReportPanel assessmentId={a.id} />
  }
}

export function AssessmentWorkspacePage() {
  const { id = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { data: a, isLoading, isError, error, refetch } = useAssessment(id)
  const del = useDeleteAssessment()
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (isLoading)
    return (
      <PageContainer>
        <Skeleton className="mb-4 h-10 w-1/2" />
        <Skeleton className="h-96 w-full" />
      </PageContainer>
    )
  if (isError || !a) {
    const notFound = error instanceof ApiError && error.kind === 'not_found'
    return (
      <PageContainer>
        <Card>
          {notFound ? (
            <EmptyState
              icon={FileSearch}
              title="Assessment not found"
              description="It may have been deleted, or the link is wrong."
              action={<Link to="/assessments" className="text-sm font-medium text-accent hover:underline">Back to assessments</Link>}
            />
          ) : (
            <ErrorState error={error} onRetry={() => void refetch()} title="Could not load the assessment" />
          )}
        </Card>
      </PageContainer>
    )
  }

  const requested = params.get('stage') as StageKey | null
  const stage: StageKey = STAGES.some((s) => s.key === requested) ? (requested as StageKey) : currentStage(a)
  const idx = STAGES.findIndex((s) => s.key === stage)
  const prev = STAGES[idx - 1]
  const next = STAGES[idx + 1]
  const go = (k: StageKey) => setParams({ stage: k }, { replace: true })

  return (
    <PageContainer>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link to="/assessments" className="mb-1 inline-flex items-center gap-1 text-xs text-ink-3 hover:text-ink">
            <ArrowLeft className="size-3.5" aria-hidden />
            All assessments
          </Link>
          <h1 className="text-xl font-semibold tracking-tight">{a.companyName}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-3">
            <span className="num">{a.id}</span>·<span>{a.purpose}</span>·<span>Opened {formatDate(a.createdAt)}</span>
            <AssessmentStatusBadge status={a.status} />
          </p>
        </div>
        <Button variant="ghost" onClick={() => setConfirmDelete(true)}>
          <Trash2 className="size-4" aria-hidden />
          Delete
        </Button>
      </div>

      <div className="mb-5 rounded-lg border border-border bg-surface-muted/50 p-3.5 text-xs text-ink-2 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2.5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {a.requestedLoanAmount && (
              <span className="font-medium text-ink">
                Facility Requested:{' '}
                <strong className="text-accent">{formatCurrency(a.requestedLoanAmount, a.currency ?? 'INR')}</strong>
                {a.facilityType ? ` (${a.facilityType})` : ''}
              </span>
            )}
            {a.proposedTenure && <span>Tenure: <strong className="text-ink">{a.proposedTenure}</strong></span>}
            {a.industry && <span>Industry: <strong className="text-ink">{a.industry}</strong></span>}
            {a.annualTurnover && <span>Turnover: <strong className="text-ink">{formatCurrency(a.annualTurnover, a.currency ?? 'INR')}</strong></span>}
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-ink-3">
          {a.assignedAnalyst && <span>Analyst: <span className="text-ink-2">{a.assignedAnalyst}</span></span>}
          {a.reportingPeriod && <span>Period: <span className="text-ink-2">{a.reportingPeriod}</span></span>}
          {a.cin && <span>CIN: <span className="num font-mono text-ink-2">{a.cin}</span></span>}
          {a.gstin && <span>GSTIN: <span className="num font-mono text-ink-2">{a.gstin}</span></span>}
          {a.pan && <span>PAN: <span className="num font-mono text-ink-2">{a.pan}</span></span>}
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <StageStepper assessment={a} selected={stage} onSelect={go} />
        <div className="min-w-0 space-y-4">
          <h2 className="text-base font-semibold">{STAGES[idx]?.label}</h2>
          <StageBody a={a} stage={stage} />
          <div className="flex justify-between border-t border-border pt-4">
            {prev ? (
              <Button onClick={() => go(prev.key)}>
                <ArrowLeft className="size-4" aria-hidden />
                {prev.short}
              </Button>
            ) : (
              <span />
            )}
            {next && (
              <Button variant="primary" onClick={() => go(next.key)}>
                {next.short}
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this assessment?"
        description={`${a.companyName} and its documents, findings and report will be permanently removed.`}
        confirmLabel="Delete assessment"
        loading={del.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() =>
          del.mutate(a.id, {
            onSuccess: () => {
              toast.success('Assessment deleted.')
              navigate('/assessments', { replace: true })
            },
            onError: (e) => toast.error(toUserMessage(e)),
          })
        }
      />
    </PageContainer>
  )
}
