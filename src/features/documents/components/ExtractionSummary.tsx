import { useDocuments } from '../hooks/useDocuments'
import { DOCUMENT_STATUS_LABEL, type DocumentStatus } from '../types'

const order: DocumentStatus[] = ['completed', 'processing', 'queued', 'failed']

export function ExtractionSummary({ assessmentId }: { assessmentId: string }) {
  const { data } = useDocuments({ assessmentId })
  if (!data || data.length === 0) return null

  const totalFields = data.reduce((acc, d) => acc + (d.extractedFieldCount ?? 0), 0)

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-5">
      {order.map((s) => (
        <div key={s} className="bg-surface px-4 py-3">
          <dt className="text-xs text-ink-3">{DOCUMENT_STATUS_LABEL[s]}</dt>
          <dd className="num mt-0.5 text-xl font-semibold text-ink">{data.filter((d) => d.status === s).length}</dd>
        </div>
      ))}
      <div className="bg-surface px-4 py-3 col-span-2 sm:col-span-1">
        <dt className="text-xs text-ink-3">Extracted Fields</dt>
        <dd className="num mt-0.5 text-xl font-semibold text-accent">{totalFields}</dd>
      </div>
    </dl>
  )
}
