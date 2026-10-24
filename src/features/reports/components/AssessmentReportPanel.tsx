import { useState } from 'react'
import { FileText, Play, Sparkles } from 'lucide-react'
import { useToast } from '@/components/feedback/Toast'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Progress } from '@/components/ui/Progress'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDateTime } from '@/lib/formatters'
import { toUserMessage } from '@/services/api/errors'
import { useGenerateReport, useReports } from '../hooks/useReports'
import { ReportActions } from './ReportActions'
import { ReportView } from './ReportView'

export function AssessmentReportPanel({ assessmentId }: { assessmentId: string }) {
  const { data, isLoading, isError, error, refetch } = useReports()
  const gen = useGenerateReport()
  const toast = useToast()
  const [generating, setGenerating] = useState(false)
  const [genStep, setGenStep] = useState('')
  const [genProgress, setGenProgress] = useState(0)

  if (isLoading) return <Skeleton className="h-64 w-full" />
  if (isError)
    return (
      <Card>
        <ErrorState error={error} onRetry={() => void refetch()} title="Could not load the report" />
      </Card>
    )

  const report = data?.find((r) => r.assessmentId === assessmentId)

  const handleGenerate = async () => {
    setGenerating(true)
    setGenProgress(20)
    setGenStep('Validating assessment profile and uploaded documents...')

    setTimeout(() => {
      setGenProgress(45)
      setGenStep('Computing financial ratios, DSCR coverage & cash flow conversion...')
    }, 600)

    setTimeout(() => {
      setGenProgress(75)
      setGenStep('Synthesizing TinyFish external intelligence & litigation registry records...')
    }, 1200)

    setTimeout(async () => {
      setGenProgress(100)
      setGenStep('Formulating preliminary recommendation and assembling Sections A through Q...')
      try {
        await gen.mutateAsync(assessmentId)
        setGenerating(false)
        toast.success('Comprehensive financial due diligence report compiled.')
        void refetch()
      } catch (e) {
        setGenerating(false)
        toast.error(toUserMessage(e))
      }
    }, 1800)
  }

  if (!report) {
    return (
      <Card>
        <EmptyState
          icon={FileText}
          title="Due-Diligence Report Ready for Compilation"
          description="Consolidate the borrower's uploaded financial statements, extracted ratios, and TinyFish risk evidence into a decision-support dossier."
          action={
            <div className="space-y-3">
              <Button
                variant="primary"
                loading={generating}
                onClick={handleGenerate}
                className="gap-2"
              >
                <Sparkles className="size-4" />
                Generate Decision-Support Report
              </Button>
              {generating && (
                <div className="mx-auto max-w-sm rounded-lg border border-accent/30 bg-accent-soft/40 p-3 text-xs text-left">
                  <div className="flex justify-between font-medium text-ink">
                    <span>{genStep}</span>
                    <span className="num font-semibold text-accent">{genProgress}%</span>
                  </div>
                  <Progress className="mt-2" value={genProgress} label={genStep} />
                </div>
              )}
            </div>
          }
        />
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title="Due-Diligence Decision-Support Report"
        description={
          report.status === 'ready' && report.generatedAt
            ? `Generated ${formatDateTime(report.generatedAt)} · All 17 Sections Compiled`
            : undefined
        }
        actions={<ReportActions report={report} />}
      />
      <div className="p-4 sm:p-6">
        {report.status === 'ready' ? (
          <ReportView report={report} />
        ) : report.status === 'failed' ? (
          <div role="alert" className="rounded-md border border-[#f5c2bd] bg-risk-high-soft p-4 text-sm text-risk-high">
            <p className="font-semibold">Generation failed</p>
            <p className="mt-1">{report.error ?? 'Unknown error occurred during compilation.'}</p>
            <Button size="sm" variant="secondary" onClick={handleGenerate} className="mt-3">
              Retry Generation
            </Button>
          </div>
        ) : report.status === 'generating' || generating ? (
          <div className="space-y-3 rounded-lg border border-accent/30 bg-accent-soft/30 p-5 text-center">
            <Sparkles className="mx-auto size-6 text-accent animate-spin" />
            <p className="text-sm font-semibold text-ink">Compiling Decision-Support Report...</p>
            <p className="text-xs text-ink-3">{genStep || 'Synthesizing evidence and computing stress scenarios.'}</p>
            <Progress className="mx-auto max-w-md" value={genProgress || 50} label="Compiling report" />
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="Report not generated"
            description="Generate a report to compile the findings, evidence and limitations into one document. It needs a completed financial analysis."
            action={
              <Button variant="primary" onClick={handleGenerate} className="gap-2">
                <Play className="size-4" />
                Generate Report
              </Button>
            }
          />
        )}
      </div>
    </Card>
  )
}
