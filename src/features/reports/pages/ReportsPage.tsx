import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText } from 'lucide-react'
import { PageContainer } from '@/app/layouts/PageContainer'
import { PageHeader } from '@/components/data-display/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Dialog } from '@/components/ui/Dialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { Table, Td, THead, Th, Tr } from '@/components/ui/Table'
import { formatDate, formatDateTime } from '@/lib/formatters'
import { ReportActions } from '../components/ReportActions'
import { ReportView } from '../components/ReportView'
import { useReports } from '../hooks/useReports'
import type { Report, ReportStatus } from '../types'

const STATUS: Record<ReportStatus, { label: string; tone: 'neutral' | 'low' | 'high' | 'info' }> = {
  not_generated: { label: 'Not generated', tone: 'neutral' },
  generating: { label: 'Generating', tone: 'info' },
  ready: { label: 'Ready', tone: 'low' },
  failed: { label: 'Failed', tone: 'high' },
}

export function ReportsPage() {
  const { data, isLoading, isError, error, refetch } = useReports()
  const [previewId, setPreviewId] = useState<string | null>(null)
  const preview = data?.find((r) => r.id === previewId) ?? null

  return (
    <PageContainer>
      <PageHeader title="Reports" />
      <Card>
        {isLoading ? (
          <TableSkeleton cols={5} />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => void refetch()} title="Could not load reports" />
        ) : !data || data.length === 0 ? (
          <EmptyState icon={FileText} title="No assessments to report on" description="Create an assessment and complete its analysis to generate a report." />
        ) : (
          <Table caption="Reports">
            <THead>
              <Tr className="border-0">
                <Th>Company</Th>
                <Th className="hidden sm:table-cell">Assessment date</Th>
                <Th>Status</Th>
                <Th className="hidden md:table-cell">Generated</Th>
                <Th><span className="sr-only">Actions</span></Th>
              </Tr>
            </THead>
            <tbody>
              {data.map((r: Report) => (
                <Tr key={r.id}>
                  <Td>
                    <Link to={`/assessments/${r.assessmentId}?stage=report`} className="font-medium text-ink hover:text-accent hover:underline">
                      {r.companyName}
                    </Link>
                    <p className="num text-xs text-ink-3">{r.assessmentId}</p>
                  </Td>
                  <Td className="num hidden whitespace-nowrap text-ink-2 sm:table-cell">{formatDate(r.assessmentDate)}</Td>
                  <Td>
                    <Badge tone={STATUS[r.status].tone}>{STATUS[r.status].label}</Badge>
                    {r.status === 'ready' && r.draft && <Badge tone="medium" className="ml-1">Draft</Badge>}
                    {r.status === 'failed' && <p className="mt-1 max-w-56 text-xs text-risk-high">{r.error ?? 'Generation failed.'}</p>}
                  </Td>
                  <Td className="num hidden whitespace-nowrap text-ink-2 md:table-cell">{r.generatedAt ? formatDateTime(r.generatedAt) : '—'}</Td>
                  <Td>
                    <ReportActions report={r} onPreview={(x) => setPreviewId(x.id)} />
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Dialog open={preview !== null} onClose={() => setPreviewId(null)} title={preview ? `Report preview · ${preview.companyName}` : ''} size="lg">
        {preview && <ReportView report={preview} />}
      </Dialog>
    </PageContainer>
  )
}
