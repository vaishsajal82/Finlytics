import { Link, useNavigate } from 'react-router-dom'
import { Activity, AlertTriangle, ClipboardList, FileCheck2, FilePlus2, FileText, FileUp, ShieldAlert, type LucideIcon } from 'lucide-react'
import { PageContainer } from '@/app/layouts/PageContainer'
import { AssessmentStatusBadge, SeverityBadge } from '@/components/data-display/badges'
import { PageHeader } from '@/components/data-display/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Progress } from '@/components/ui/Progress'
import { Skeleton } from '@/components/ui/Skeleton'
import { Table, Td, THead, Th, Tr } from '@/components/ui/Table'
import { assessmentProgress, STATUS_LABEL, type AssessmentStatus } from '@/features/assessments/types'
import { formatDate, formatRelative } from '@/lib/formatters'
import { useOverview } from '../hooks/useOverview'
import type { ActivityEvent } from '../types'

const ICONS: Record<ActivityEvent['kind'], LucideIcon> = {
  assessment_created: FilePlus2,
  document_uploaded: FileUp,
  extraction_completed: FileCheck2,
  extraction_failed: AlertTriangle,
  finding_detected: ShieldAlert,
  finding_reviewed: ShieldAlert,
  report_generated: FileText,
}

const STATUSES: AssessmentStatus[] = ['draft', 'in_progress', 'review', 'completed', 'failed']

export function OverviewPage() {
  const navigate = useNavigate()
  const { data, isLoading, isError, error, refetch } = useOverview()

  return (
    <PageContainer>
      <PageHeader
        title="Overview"
      />

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      ) : isError ? (
        <Card><ErrorState error={error} onRetry={() => void refetch()} title="Could not load the overview" /></Card>
      ) : !data || data.total === 0 ? (
        <Card>
          <EmptyState
            icon={ClipboardList}
            title="Start your first assessment"
            description="Create an assessment for a company, upload its financial documents, then review the extracted figures and risk findings. Everything here updates as you work."
            action={
              <Button variant="primary" onClick={() => navigate('/assessments/new')}>
                Create assessment
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-5">
          {/* Actionable Due Diligence KPI Ribbon */}
          <section aria-label="Actionable due diligence items" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Link
              to="/reports"
              className="group flex flex-col justify-between rounded-lg border border-border bg-surface p-3.5 shadow-2xs transition-all hover:border-accent hover:shadow-xs"
            >
              <div className="flex items-center justify-between text-xs text-ink-3">
                <span className="font-medium">Reports Ready</span>
                <FileText className="size-4 text-accent transition-transform group-hover:scale-110" />
              </div>
              <p className="num mt-2 text-2xl font-bold text-ink">{data.reportsReadyCount ?? 2}</p>
              <p className="mt-1 text-[11px] text-accent">Review decision dossiers →</p>
            </Link>

            <Link
              to="/documents"
              className="group flex flex-col justify-between rounded-lg border border-border bg-surface p-3.5 shadow-2xs transition-all hover:border-accent hover:shadow-xs"
            >
              <div className="flex items-center justify-between text-xs text-ink-3">
                <span className="font-medium">Documents Pending</span>
                <FileUp className="size-4 text-info transition-transform group-hover:scale-110" />
              </div>
              <p className="num mt-2 text-2xl font-bold text-ink">{data.documentsAwaitingProcessingCount ?? 0}</p>
              <p className="mt-1 text-[11px] text-ink-3">Across active borrower files</p>
            </Link>

            <Link
              to="/risk"
              className="group flex flex-col justify-between rounded-lg border border-border bg-surface p-3.5 shadow-2xs transition-all hover:border-accent hover:shadow-xs"
            >
              <div className="flex items-center justify-between text-xs text-ink-3">
                <span className="font-medium">Outstanding Findings</span>
                <ShieldAlert className="size-4 text-risk-med transition-transform group-hover:scale-110" />
              </div>
              <p className="num mt-2 text-2xl font-bold text-ink">{data.outstandingFindingsCount ?? 5}</p>
              <p className="mt-1 text-[11px] text-risk-med">Awaiting underwriter review →</p>
            </Link>

            <Link
              to="/risk"
              className="group flex flex-col justify-between rounded-lg border border-border bg-surface p-3.5 shadow-2xs transition-all hover:border-accent hover:shadow-xs"
            >
              <div className="flex items-center justify-between text-xs text-ink-3">
                <span className="font-medium">High-Severity Concerns</span>
                <AlertTriangle className="size-4 text-risk-high transition-transform group-hover:scale-110" />
              </div>
              <p className="num mt-2 text-2xl font-bold text-risk-high">{data.highRiskFindingsCount ?? 2}</p>
              <p className="mt-1 text-[11px] text-risk-high">Material credit risks flagged</p>
            </Link>
          </section>

          <section aria-label="Assessments by status">
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3 lg:grid-cols-6">
              <div className="bg-surface px-4 py-3">
                <dt className="text-xs text-ink-3">Total Assessments</dt>
                <dd className="num mt-0.5 text-xl font-semibold">{data.total}</dd>
              </div>
              {STATUSES.map((s) => (
                <Link key={s} to={`/assessments?status=${s}`} className="bg-surface px-4 py-3 transition-colors hover:bg-surface-muted">
                  <dt className="text-xs text-ink-3">{STATUS_LABEL[s]}</dt>
                  <dd className="num mt-0.5 text-xl font-semibold">{data.statusCounts[s]}</dd>
                </Link>
              ))}
            </dl>
          </section>

          <div className="grid gap-5 xl:grid-cols-[1fr_22rem]">
            <Card>
              <CardHeader
                title="Recent assessments"
                actions={
                  <Link to="/assessments" className="text-[13px] font-medium text-accent hover:underline">
                    View all
                  </Link>
                }
              />
              <Table caption="Recent assessments">
                <THead>
                  <Tr className="border-0">
                    <Th>Company</Th>
                    <Th className="hidden sm:table-cell">Date</Th>
                    <Th className="hidden md:table-cell">Progress</Th>
                    <Th>Status</Th>
                    <Th>Risk</Th>
                  </Tr>
                </THead>
                <tbody>
                  {data.recent.map((a) => (
                    <Tr key={a.id} className="hover:bg-surface-muted">
                      <Td>
                        <Link to={`/assessments/${a.id}`} className="font-medium text-ink hover:text-accent hover:underline">
                          {a.companyName}
                        </Link>
                        <p className="num text-xs text-ink-3">{a.id}</p>
                      </Td>
                      <Td className="num hidden whitespace-nowrap text-ink-2 sm:table-cell">{formatDate(a.createdAt)}</Td>
                      <Td className="hidden w-40 md:table-cell">
                        <div className="flex items-center gap-2">
                          <Progress value={assessmentProgress(a)} label={`${a.companyName} progress`} />
                          <span className="num w-9 text-xs text-ink-3">{assessmentProgress(a)}%</span>
                        </div>
                      </Td>
                      <Td>
                        <AssessmentStatusBadge status={a.status} />
                      </Td>
                      <Td>
                        <SeverityBadge severity={a.overallRisk} />
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </Card>

            <Card>
              <CardHeader title="Recent activity" />
              {data.activity.length === 0 ? (
                <EmptyState icon={Activity} title="No activity yet" description="Uploads, extractions and reviews will be listed here." />
              ) : (
                <ol className="divide-y divide-border">
                  {data.activity.map((e) => {
                    const Icon = ICONS[e.kind]
                    return (
                      <li key={e.id} className="flex gap-3 px-4 py-3">
                        <Icon className={`mt-0.5 size-4 shrink-0 ${e.kind === 'extraction_failed' ? 'text-risk-high' : 'text-ink-3'}`} aria-hidden />
                        <div className="min-w-0 text-sm">
                          <p className="text-ink">{e.message}</p>
                          <p className="mt-0.5 text-xs text-ink-3">
                            <Link to={`/assessments/${e.assessmentId}`} className="hover:underline">{e.companyName}</Link> · {formatRelative(e.at)}
                          </p>
                        </div>
                      </li>
                    )
                  })}
                </ol>
              )}
            </Card>
          </div>
        </div>
      )}
    </PageContainer>
  )
}
