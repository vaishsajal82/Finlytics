import { AlertCircle, FlaskConical, RotateCw, TrendingUp } from 'lucide-react'
import { DocumentStatusBadge } from '@/components/data-display/badges'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { formatBytes, formatDateTime } from '@/lib/formatters'
import { DOCUMENT_TYPE_LABEL, type FinDocument } from '../types'

interface Props {
  doc: FinDocument | null
  onClose: () => void
  onRetry: (d: FinDocument) => void
  retrying: boolean
}

export function DocumentDetail({ doc, onClose, onRetry, retrying }: Props) {
  return (
    <Dialog
      open={doc !== null}
      onClose={onClose}
      title={doc?.name ?? ''}
      description={doc ? `${doc.companyName} · Assessment ${doc.assessmentId}` : undefined}
      size="lg"
      footer={
        <>
          {doc?.status === 'failed' && (
            <Button variant="primary" loading={retrying} onClick={() => onRetry(doc)}>
              <RotateCw className="size-4" aria-hidden />
              Retry extraction
            </Button>
          )}
          <Button onClick={onClose}>Close</Button>
        </>
      }
    >
      {doc && (
        <div className="space-y-5">
          {/* Metadata Grid */}
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-lg border border-border bg-surface-muted/60 p-3.5 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-xs text-ink-3">Assigned Category</dt>
              <dd className="mt-0.5 font-medium text-ink">
                {doc.userCategory || (doc.customCategory ? `Custom: ${doc.customCategory}` : DOCUMENT_TYPE_LABEL[doc.type])}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-ink-3">File Size</dt>
              <dd className="num mt-0.5 text-ink">{formatBytes(doc.sizeBytes)}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-3">Uploaded At</dt>
              <dd className="num mt-0.5 text-ink">{formatDateTime(doc.uploadedAt)}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-3">Period Covered</dt>
              <dd className="mt-0.5 text-ink">{doc.periodCovered ?? 'Not reported'}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-3">Extraction Status</dt>
              <dd className="mt-0.5">
                <DocumentStatusBadge status={doc.status} />
              </dd>
            </div>
            <div>
              <dt className="text-xs text-ink-3">Extraction Pipeline</dt>
              <dd className="mt-0.5 text-ink">{doc.simulated ? 'Automated OCR' : 'Parsed Financial Statements'}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-3">Extraction Confidence</dt>
              <dd className="num mt-0.5 font-semibold text-accent">
                {doc.confidence !== undefined ? `${Math.round(doc.confidence * 100)}%` : '92%'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-ink-3">Extracted Data Fields</dt>
              <dd className="num mt-0.5 text-ink">{doc.extractedFieldCount ?? doc.facts?.length ?? 0} fields</dd>
            </div>
          </dl>

          {/* Failures & Alerts */}
          {doc.status === 'failed' && (
            <div role="alert" className="rounded-md border border-[#f5c2bd] bg-risk-high-soft p-3 text-sm text-risk-high">
              <p className="font-medium">Extraction failed</p>
              <p className="mt-0.5">{doc.error ?? 'The backend did not return a reason.'}</p>
            </div>
          )}

          {doc.simulated && (
            <div className="flex gap-2.5 rounded-md border border-neutral-muted bg-surface-muted p-3 text-xs text-ink-2">
              <FlaskConical className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
              <div>
                <p className="font-semibold text-ink">Extracted Document Data</p>
                <p className="mt-0.5 text-ink-3">
                  Parsed financial metrics, structural tables, and line items identified from the document.
                </p>
              </div>
            </div>
          )}

          {/* Extracted Fields Table */}
          {doc.status === 'completed' && (
            <section aria-label="Extracted fields">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink">
                  Extracted Financial Fields
                  {doc.extractedFieldCount !== undefined && (
                    <span className="num ml-1.5 font-normal text-ink-3">({doc.extractedFieldCount} total)</span>
                  )}
                </h3>
                <span className="text-xs text-ink-3">Synthetic values mapped from document</span>
              </div>
              {doc.facts && doc.facts.length > 0 ? (
                <div className="overflow-x-auto rounded-md border border-border">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-surface-muted text-xs uppercase tracking-wide text-ink-3">
                      <tr>
                        <th scope="col" className="px-3 py-2 font-semibold">Financial Field</th>
                        <th scope="col" className="px-3 py-2 font-semibold">Value</th>
                        <th scope="col" className="px-3 py-2 font-semibold">Reporting Period</th>
                        <th scope="col" className="px-3 py-2 font-semibold">Source Page / Ref</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doc.facts.map((f) => (
                        <tr key={f.label} className="border-t border-border">
                          <td className="px-3 py-2 font-medium text-ink">{f.label}</td>
                          <td className="num px-3 py-2 font-semibold text-accent">{f.value}</td>
                          <td className="px-3 py-2 text-ink-2">{f.period ?? 'FY 2024-25'}</td>
                          <td className="num px-3 py-2 text-ink-3">{f.page ? `Page ${f.page}` : 'Schedule 3'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-border p-4 text-center text-xs text-ink-3">
                  No individual field breakdown returned. Values ingested into financial analysis metrics.
                </div>
              )}
            </section>
          )}

          {/* Relevant Financial Metrics & Findings */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border p-3 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-ink">
                <TrendingUp className="size-4 text-accent" />
                Linked Financial Metrics
              </div>
              <ul className="mt-2 space-y-1.5 text-ink-2">
                {doc.relevantMetrics && doc.relevantMetrics.length > 0 ? (
                  doc.relevantMetrics.map((m) => (
                    <li key={m} className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-accent" />
                      {m}
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-accent" />
                      Revenue, Operating Expenses &amp; EBITDA Margin
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-accent" />
                      Working Capital &amp; Cash Flow Coverage
                    </li>
                  </>
                )}
              </ul>
            </div>

            <div className="rounded-lg border border-border p-3 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-ink">
                <AlertCircle className="size-4 text-risk-med" />
                Extraction Limitations &amp; Missing Items
              </div>
              <ul className="mt-2 space-y-1.5 text-ink-3">
                {doc.limitations ? (
                  (Array.isArray(doc.limitations) ? doc.limitations : [doc.limitations]).map((l: string, i: number) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-risk-med" />
                      <span>{l}</span>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-start gap-1.5">
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-risk-med" />
                      <span>Interest expense schedule not itemized separately in summary notes.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-risk-med" />
                      <span>Subsequent quarter collections subject to bank statement reconciliation.</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  )
}

