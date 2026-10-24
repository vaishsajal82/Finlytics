import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ClipboardList, Search, SearchX } from 'lucide-react'
import { PageContainer } from '@/app/layouts/PageContainer'
import { AssessmentStatusBadge } from '@/components/data-display/badges'
import { PageHeader } from '@/components/data-display/PageHeader'
import { Pagination } from '@/components/data-display/Pagination'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Select } from '@/components/ui/Field'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { SortTh, Table, Td, THead, Th, Tr } from '@/components/ui/Table'
import { Progress } from '@/components/ui/Progress'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { PAGE_SIZE } from '@/lib/constants'
import { formatDate } from '@/lib/formatters'
import type { SortOrder } from '@/types/common'
import { RiskSummaryCell } from '../components/RiskSummary'
import { useAssessments } from '../hooks/useAssessments'
import { assessmentProgress, STATUS_LABEL, type AssessmentQuery, type AssessmentSortKey, type AssessmentStatus } from '../types'

const statusOptions = [{ value: '', label: 'All statuses' }, ...(Object.keys(STATUS_LABEL) as AssessmentStatus[]).map((s) => ({ value: s, label: STATUS_LABEL[s] }))]
const riskOptions = [
  { value: '', label: 'All risk levels' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
  { value: 'none', label: 'No findings' },
]
const periodOptions = [
  { value: '', label: 'Any date' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
]

export function AssessmentsPage() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const urlQ = params.get('q') ?? ''
  const [search, setSearch] = useState(urlQ)
  const debounced = useDebouncedValue(search)

  // Keep the box in sync when the header search (or back/forward) changes the URL.
  const [seenUrlQ, setSeenUrlQ] = useState(urlQ)
  if (urlQ !== seenUrlQ) {
    setSeenUrlQ(urlQ)
    setSearch(urlQ)
  }

  const set = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v)
      else next.delete(k)
    }
    if (!('page' in patch)) next.delete('page')
    setParams(next, { replace: true })
  }

  useEffect(() => {
    if (debounced !== urlQ) set({ q: debounced })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  const query: AssessmentQuery = {
    search: urlQ,
    status: (params.get('status') ?? '') as AssessmentQuery['status'],
    risk: (params.get('risk') ?? '') as AssessmentQuery['risk'],
    period: (params.get('period') ?? '') as AssessmentQuery['period'],
    sort: (params.get('sort') ?? 'createdAt') as AssessmentSortKey,
    order: (params.get('order') ?? 'desc') as SortOrder,
    page: Number(params.get('page') ?? 1) || 1,
    pageSize: PAGE_SIZE,
  }
  const { data, isLoading, isError, error, refetch, isFetching } = useAssessments(query)
  const filtered = Boolean(query.search || query.status || query.risk || query.period)

  const sortBy = (key: AssessmentSortKey) =>
    set({ sort: key, order: query.sort === key && query.order === 'desc' ? 'asc' : 'desc' })

  return (
    <PageContainer>
      <PageHeader
        title="Assessments"
      />

      <Card>
        <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-2 lg:grid-cols-[1fr_repeat(3,11rem)]">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="asm-search" className="sr-only">
              Search by company or assessment ID
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-ink-3" aria-hidden />
              <input
                id="asm-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search company or assessment ID"
                className="h-9 w-full rounded-md border border-border-strong bg-surface pl-8 pr-3 text-sm placeholder:text-ink-3"
              />
            </div>
          </div>
          <Select label="Status" hideLabel value={query.status ?? ''} options={statusOptions} onChange={(e) => set({ status: e.target.value })} />
          <Select label="Risk level" hideLabel value={query.risk ?? ''} options={riskOptions} onChange={(e) => set({ risk: e.target.value })} />
          <Select label="Created" hideLabel value={query.period ?? ''} options={periodOptions} onChange={(e) => set({ period: e.target.value })} />
        </div>

        {isLoading ? (
          <TableSkeleton cols={6} />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => void refetch()} title="Could not load assessments" />
        ) : data && data.total === 0 ? (
          filtered ? (
            <EmptyState
              icon={SearchX}
              title="No assessments match these filters"
              description="Try a different search or clear the filters."
              action={
                <Button
                  onClick={() => {
                    setSearch('')
                    setParams({}, { replace: true })
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={ClipboardList}
              title="No assessments yet"
              description="Create an assessment, upload the company's financial documents, and Finlytics will guide you through the analysis."
              action={
                <Button variant="primary" onClick={() => navigate('/assessments/new')}>
                  Create first assessment
                </Button>
              }
            />
          )
        ) : (
          data && (
            <div className={isFetching ? 'opacity-70 transition-opacity' : undefined}>
              <Table caption="Assessments">
                <THead>
                  <Tr className="border-0">
                    <SortTh label="Company" active={query.sort === 'companyName'} order={query.order ?? 'desc'} onSort={() => sortBy('companyName')} />
                    <Th className="hidden md:table-cell">Assessment ID</Th>
                    <SortTh label="Created" active={query.sort === 'createdAt'} order={query.order ?? 'desc'} onSort={() => sortBy('createdAt')} className="hidden sm:table-cell" />
                    <SortTh label="Status" active={query.sort === 'status'} order={query.order ?? 'desc'} onSort={() => sortBy('status')} />
                    <Th className="hidden lg:table-cell">Progress</Th>
                    <SortTh label="Risk summary" active={query.sort === 'overallRisk'} order={query.order ?? 'desc'} onSort={() => sortBy('overallRisk')} />
                    <Th className="w-20">
                      <span className="sr-only">Actions</span>
                    </Th>
                  </Tr>
                </THead>
                <tbody>
                  {data.items.map((a) => (
                    <Tr key={a.id} className="hover:bg-surface-muted">
                      <Td>
                        <Link to={`/assessments/${a.id}`} className="font-medium text-ink hover:text-accent hover:underline">
                          {a.companyName}
                        </Link>
                        <p className="text-xs text-ink-3">{a.purpose}</p>
                      </Td>
                      <Td className="num hidden text-ink-3 md:table-cell">{a.id}</Td>
                      <Td className="num hidden whitespace-nowrap text-ink-2 sm:table-cell">{formatDate(a.createdAt)}</Td>
                      <Td>
                        <AssessmentStatusBadge status={a.status} />
                      </Td>
                      <Td className="hidden w-40 lg:table-cell">
                        <div className="flex items-center gap-2">
                          <Progress value={assessmentProgress(a)} label={`${a.companyName} progress`} />
                          <span className="num w-9 text-xs text-ink-3">{assessmentProgress(a)}%</span>
                        </div>
                      </Td>
                      <Td>
                        <RiskSummaryCell overall={a.overallRisk} summary={a.riskSummary} />
                      </Td>
                      <Td>
                        <Button size="sm" onClick={() => navigate(`/assessments/${a.id}`)} aria-label={`Open ${a.companyName}`}>
                          Open
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
              <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPage={(p) => set({ page: String(p) })} />
            </div>
          )
        )}
      </Card>
    </PageContainer>
  )
}
