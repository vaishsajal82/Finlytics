import { useRef, useState, type DragEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, CheckCircle2, FileUp, X } from 'lucide-react'
import { useToast } from '@/components/feedback/Toast'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Field'
import { Progress } from '@/components/ui/Progress'
import { ACCEPT_ATTR, ACCEPTED_UPLOADS, MAX_UPLOAD_BYTES } from '@/lib/constants'
import { formatBytes } from '@/lib/formatters'
import { cn, uid } from '@/lib/utils'
import { guessDocumentType, validateFile } from '@/services/file-upload/validate'
import { toUserMessage } from '@/services/api/errors'
import { documentService } from '../services/documentService'
import { DOCUMENT_TYPE_LABEL, type DocumentType } from '../types'
import { useDocuments, useInvalidateDocs } from '../hooks/useDocuments'

interface Staged {
  id: string
  file: File
  type: DocumentType
  customCategory?: string
  error?: string
  progress: number
  state: 'ready' | 'uploading' | 'failed'
}

export const ALLOWED_DOCUMENT_TYPES: DocumentType[] = [
  'audited_financials',
  'profit_loss',
  'balance_sheet',
  'cash_flow',
  'bank_statement',
  'gst_return',
  'itr',
  'ar_ageing',
  'ap_ageing',
]

export const ALLOWED_DOCUMENT_TYPE_LABELS: Record<string, string> = {
  audited_financials: 'Audited financials',
  profit_loss: 'P&L (Profit and loss statement)',
  balance_sheet: 'Balance sheet',
  cash_flow: 'Cash flow statement',
  bank_statement: 'Bank statement',
  gst_return: 'GST returns',
  itr: 'ITR (Income tax return)',
  ar_ageing: 'AR ageing (Accounts receivable)',
  ap_ageing: 'AP ageing (Accounts payable)',
}

const typeOptions = ALLOWED_DOCUMENT_TYPES.map((t) => ({
  value: t,
  label: ALLOWED_DOCUMENT_TYPE_LABELS[t] ?? DOCUMENT_TYPE_LABEL[t],
}))

export function DocumentUploader({ assessmentId }: { assessmentId: string }) {
  const input = useRef<HTMLInputElement>(null)
  const [staged, setStaged] = useState<Staged[]>([])
  const [rejected, setRejected] = useState<{ name: string; reason: string }[]>([])
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const toast = useToast()
  const invalidate = useInvalidateDocs()
  const qc = useQueryClient()
  const { data: existingDocs } = useDocuments({ assessmentId })

  const add = (files: FileList | File[]) => {
    const ok: Staged[] = []
    const bad: { name: string; reason: string }[] = []
    const existingNames = new Set([
      ...(existingDocs?.map((d) => d.name.toLowerCase()) ?? []),
      ...staged.map((s) => s.file.name.toLowerCase()),
    ])
    let dupFound = false

    for (const file of Array.from(files)) {
      if (existingNames.has(file.name.toLowerCase())) {
        dupFound = true
      }
      const reason = validateFile(file)
      if (reason) bad.push({ name: file.name, reason })
      else {
        const guessed = guessDocumentType(file.name)
        const type: DocumentType = ALLOWED_DOCUMENT_TYPES.includes(guessed) ? guessed : 'audited_financials'
        ok.push({ id: uid('f'), file, type, progress: 0, state: 'ready' })
      }
    }

    if (dupFound) {
      setDuplicateWarning('One or more selected files have filenames already present in this assessment or staging queue.')
    } else {
      setDuplicateWarning(null)
    }

    setRejected(bad)
    setStaged((s) => [...s, ...ok])
  }


  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (!busy) add(e.dataTransfer.files)
  }

  const patch = (id: string, p: Partial<Staged>) => setStaged((s) => s.map((x) => (x.id === id ? { ...x, ...p } : x)))

  const uploadAll = async () => {
    setBusy(true)
    let okCount = 0
    for (const item of staged.filter((s) => s.state !== 'uploading')) {
      patch(item.id, { state: 'uploading', progress: 0, error: undefined })
      try {
        const userCategory = ALLOWED_DOCUMENT_TYPE_LABELS[item.type] ?? DOCUMENT_TYPE_LABEL[item.type]
        await documentService.upload(
          assessmentId,
          item.file,
          item.type,
          (p) => patch(item.id, { progress: p }),
          userCategory,
          undefined,
        )
        setStaged((s) => s.filter((x) => x.id !== item.id))
        okCount += 1
      } catch (e) {
        patch(item.id, { state: 'failed', error: toUserMessage(e) })
      }
    }
    setBusy(false)
    if (okCount) {
      toast.success(`${okCount} document${okCount > 1 ? 's' : ''} uploaded. Simulated extraction started.`)
      invalidate()
      void qc.invalidateQueries({ queryKey: ['documents'] })
      void qc.invalidateQueries({ queryKey: ['assessments', assessmentId] })
    }
  }

  return (
    <section aria-label="Upload documents" className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'flex flex-col items-center rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors',
          dragging ? 'border-accent bg-accent-soft' : 'border-border-strong bg-surface-muted',
        )}
      >
        <FileUp className="mb-2 size-6 text-ink-3" aria-hidden />
        <p className="text-sm font-medium text-ink">Drag and drop financial documents here</p>
        <p className="mt-1 text-xs text-ink-3">
          Support: Audited financials, P&amp;L, Balance sheet, Cash flow, Bank statements, GST returns, ITR, AR/AP ageing · {Array.from(new Set(ACCEPTED_UPLOADS.map((f) => f.label))).join(', ')} · up to {formatBytes(MAX_UPLOAD_BYTES)} each
        </p>
        <input
          ref={input}
          type="file"
          multiple
          accept={ACCEPT_ATTR}
          className="sr-only"
          tabIndex={-1}
          aria-label="Choose files to upload"
          onChange={(e) => {
            if (e.target.files) add(e.target.files)
            e.target.value = ''
          }}
        />
        <Button className="mt-3" disabled={busy} onClick={() => input.current?.click()}>
          Browse files
        </Button>
      </div>

      {duplicateWarning && (
        <div role="status" className="flex items-center gap-2 rounded-md border border-[#f3d98b] bg-risk-med-soft p-3 text-xs text-risk-med">
          <AlertTriangle className="size-4 shrink-0" />
          <span>{duplicateWarning}</span>
        </div>
      )}

      {rejected.length > 0 && (
        <ul role="alert" className="space-y-1 rounded-md border border-[#f5c2bd] bg-risk-high-soft p-3 text-sm text-risk-high">
          {rejected.map((r) => (
            <li key={r.name}>
              <strong className="font-medium">{r.name}</strong>: {r.reason}
            </li>
          ))}
        </ul>
      )}

      {staged.length > 0 && (
        <div className="rounded-lg border border-border bg-surface">
          <div className="border-b border-border bg-surface-muted px-3 py-2 text-xs font-medium text-ink-2">
            Staged files ({staged.length}) — restricted to supported financial documents
          </div>
          <ul className="divide-y divide-border">
            {staged.map((s) => (
              <li key={s.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{s.file.name}</p>
                  <p className="num text-xs text-ink-3">{formatBytes(s.file.size)}</p>
                  {s.state === 'uploading' && <Progress className="mt-1.5" value={s.progress} label={`Uploading ${s.file.name}`} />}
                  {s.error && (
                    <p role="alert" className="mt-1 text-xs text-risk-high">
                      Upload failed: {s.error}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    label={`Document category for ${s.file.name}`}
                    hideLabel
                    value={s.type}
                    disabled={s.state === 'uploading'}
                    options={typeOptions}
                    onChange={(e) => patch(s.id, { type: e.target.value as DocumentType })}
                    className="w-56"
                  />
                  <button
                    type="button"
                    disabled={s.state === 'uploading'}
                    onClick={() => setStaged((x) => x.filter((f) => f.id !== s.id))}
                    aria-label={`Remove ${s.file.name}`}
                    className="rounded-md p-1.5 text-ink-3 hover:bg-neutral-soft hover:text-ink disabled:opacity-50"
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between gap-3 border-t border-border bg-surface-muted px-3 py-2.5">
            <p className="flex items-center gap-1.5 text-xs text-ink-3">
              <CheckCircle2 className="size-3.5 text-risk-low" aria-hidden />
              Only supported financial documents (Audited financials, P&amp;L, Balance sheet, Cash flow, Bank statements, GST returns, ITR, AR/AP ageing) are processed.
            </p>
            <Button variant="primary" loading={busy} onClick={() => void uploadAll()}>
              Upload {staged.length} file{staged.length > 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}

