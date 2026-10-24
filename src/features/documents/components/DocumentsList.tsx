import { useState } from 'react'
import { FileX2, Eye, RotateCw, Trash2 } from 'lucide-react'
import { DocumentStatusBadge } from '@/components/data-display/badges'
import { useToast } from '@/components/feedback/Toast'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/Dialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Progress } from '@/components/ui/Progress'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { Table, Td, THead, Th, Tr } from '@/components/ui/Table'
import { formatBytes, formatDate } from '@/lib/formatters'
import { toUserMessage } from '@/services/api/errors'
import { useDeleteDocument, useDocuments, useRetryDocument } from '../hooks/useDocuments'
import { DOCUMENT_TYPE_LABEL, type DocumentQuery, type FinDocument } from '../types'
import { DocumentDetail } from './DocumentDetail'

interface Props {
  query: DocumentQuery
  showCompany?: boolean
  emptyHint?: string
  filtered?: boolean
  showExtractionCount?: boolean
}

export function DocumentsList({
  query,
  showCompany,
  emptyHint,
  filtered,
  showExtractionCount = true,
}: Props) {
  const { data, isLoading, isError, error, refetch } = useDocuments(query)
  const retry = useRetryDocument()
  const del = useDeleteDocument()
  const toast = useToast()
  const [inspectId, setInspectId] = useState<string | null>(null)
  const [toDelete, setToDelete] = useState<FinDocument | null>(null)
  const inspected = data?.find((d) => d.id === inspectId) ?? null

  const doRetry = (d: FinDocument) =>
    retry.mutate(d.id, {
      onSuccess: () => toast.success(`Retrying extraction for ${d.name}.`),
      onError: (e) => toast.error(toUserMessage(e)),
    })

  if (isLoading) return <TableSkeleton cols={5} />
  if (isError) return <ErrorState error={error} onRetry={() => void refetch()} title="Could not load documents" />
  if (!data || data.length === 0)
    return (
      <EmptyState
        icon={FileX2}
        title={filtered ? 'No documents match these filters' : 'No documents uploaded'}
        description={filtered ? 'Try a different filter.' : (emptyHint ?? 'Uploaded documents and their extraction status appear here.')}
      />
    )

  return (
    <>
      <Table caption="Documents">
        <THead>
          <Tr className="border-0">
            <Th>Document</Th>
            <Th className="hidden md:table-cell">Type</Th>
            {showCompany && <Th className="hidden lg:table-cell">Company</Th>}
            <Th className="hidden sm:table-cell">Uploaded</Th>
            <Th>Status</Th>
            <Th className="w-28">
              <span className="sr-only">Actions</span>
            </Th>
          </Tr>
        </THead>
        <tbody>
          {data.map((d) => (
            <Tr key={d.id}>
              <Td className="max-w-[18rem]">
                <button type="button" onClick={() => setInspectId(d.id)} className="block max-w-full truncate text-left font-medium text-ink hover:text-accent hover:underline">
                  {d.name}
                </button>
                <p className="num text-xs text-ink-3">{formatBytes(d.sizeBytes)}</p>
              </Td>
              <Td className="hidden text-ink-2 md:table-cell">
                <span className="inline-flex items-center rounded-md bg-surface-muted px-2 py-0.5 text-xs font-medium text-ink">
                  {d.userCategory || (d.customCategory ? `Custom: ${d.customCategory}` : DOCUMENT_TYPE_LABEL[d.type])}
                </span>
              </Td>
              {showCompany && <Td className="hidden text-ink-2 lg:table-cell">{d.companyName}</Td>}
              <Td className="num hidden whitespace-nowrap text-ink-2 sm:table-cell">{formatDate(d.uploadedAt)}</Td>
              <Td className="min-w-40">
                <DocumentStatusBadge status={d.status} />
                {d.status === 'processing' && d.progress !== undefined && <Progress className="mt-1.5 max-w-32" value={d.progress} label={`Processing ${d.name}`} />}
                {d.status === 'failed' && <p className="mt-1 line-clamp-2 max-w-64 text-xs text-risk-high">{d.error ?? 'Extraction failed.'}</p>}
                {d.status === 'completed' && showExtractionCount && d.extractedFieldCount !== undefined && <p className="num mt-1 text-xs text-ink-3">{d.extractedFieldCount} fields extracted</p>}
              </Td>
              <Td>
                <div className="flex justify-end gap-0.5">
                  {d.status === 'failed' && (
                    <Button size="sm" variant="ghost" onClick={() => doRetry(d)} loading={retry.isPending && retry.variables === d.id} aria-label={`Retry extraction for ${d.name}`}>
                      <RotateCw className="size-4" aria-hidden />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => setInspectId(d.id)} aria-label={`Inspect ${d.name}`}>
                    <Eye className="size-4" aria-hidden />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setToDelete(d)} aria-label={`Delete ${d.name}`}>
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                </div>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>

      <DocumentDetail doc={inspected} onClose={() => setInspectId(null)} onRetry={doRetry} retrying={retry.isPending} />
      <ConfirmDialog
        open={toDelete !== null}
        title="Delete document?"
        description={`${toDelete?.name ?? 'This document'} and anything extracted from it will be removed from the assessment. This cannot be undone.`}
        confirmLabel="Delete document"
        loading={del.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return
          del.mutate(toDelete.id, {
            onSuccess: () => {
              toast.success('Document deleted.')
              setToDelete(null)
            },
            onError: (e) => toast.error(toUserMessage(e)),
          })
        }}
      />
    </>
  )
}
