import { useState } from 'react'
import {
  CheckCircle,
  ExternalLink,
  FileSearch,
  FileText,
  FlaskConical,
  HelpCircle,
  ListChecks,
  MessageSquarePlus,
  Scale,
  ShieldAlert,
} from 'lucide-react'
import { ClassBadge, EvidenceBadge, ReviewBadge, SeverityBadge } from '@/components/data-display/badges'
import { useToast } from '@/components/feedback/Toast'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Field'
import { formatDateTime, formatMetricValue, formatPercent } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import { toUserMessage } from '@/services/api/errors'
import { useProfile } from '@/features/settings/hooks/useProfile'
import { useAddNote, useSetReviewStatus } from '../hooks/useFindings'
import {
  CLASS_HELP,
  REVIEW_LABEL,
  RISK_CATEGORY_LABEL,
  type Finding,
  type FindingMetric,
  type ReviewStatus,
} from '../types'

const ACTIONS: ReviewStatus[] = ['investigating', 'needs_info', 'confirmed', 'dismissed']

function delta(m: FindingMetric): string {
  if (!m.prior || m.prior.value === 0) return '—'
  if (m.unit === 'percent' || m.unit === 'days' || m.unit === 'ratio') {
    const d = m.value - m.prior.value
    return `${d > 0 ? '+' : d < 0 ? '−' : ''}${Math.abs(d).toFixed(1)}${m.unit === 'percent' ? ' pp' : m.unit === 'days' ? ' days' : 'x'}`
  }
  return formatPercent((m.value / m.prior.value - 1) * 100, 1, true)
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="border-t border-border pt-4">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-3">
        {icon}
        <h3>{title}</h3>
      </div>
      {children}
    </section>
  )
}

export function FindingDetail({ finding }: { finding: Finding }) {
  const setReview = useSetReviewStatus()
  const addNote = useAddNote(useProfile().profile.name)
  const toast = useToast()
  const [note, setNote] = useState('')

  const apply = (status: ReviewStatus) =>
    setReview.mutate(
      { id: finding.id, status },
      { onSuccess: () => toast.success(`Marked as ${REVIEW_LABEL[status].toLowerCase()}.`), onError: (e) => toast.error(toUserMessage(e)) },
    )

  const submitNote = () => {
    if (!note.trim()) return
    addNote.mutate(
      { id: finding.id, text: note },
      {
        onSuccess: () => {
          setNote('')
          toast.success('Note added.')
        },
        onError: (e) => toast.error(toUserMessage(e)),
      },
    )
  }

  const categoryLabel = finding.category ? RISK_CATEGORY_LABEL[finding.category] : undefined

  return (
    <article aria-label={finding.title} className="space-y-4">
      <header>
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <SeverityBadge severity={finding.severity} />
          <ClassBadge value={finding.classification} />
          {categoryLabel && (
            <Badge tone="neutral" className="border-border">
              {categoryLabel}
            </Badge>
          )}
          <ReviewBadge status={finding.reviewStatus} />
        </div>
        <h2 className="text-base font-semibold leading-snug text-ink">{finding.title}</h2>
        <p className="mt-1 text-xs text-ink-3">
          {finding.companyName} · {finding.period} · detected {formatDateTime(finding.detectedAt)}
          {finding.confidence !== undefined && <span className="num"> · confidence {Math.round(finding.confidence * 100)}%</span>}
        </p>
      </header>

      <p className="rounded-md bg-surface-muted px-3 py-2 text-xs text-ink-2">
        <strong className="font-semibold">{finding.classification === 'confirmed_fact' ? 'Confirmed fact' : finding.classification === 'potential_anomaly' ? 'Potential anomaly' : 'Unverified hypothesis'}.</strong> {CLASS_HELP[finding.classification]}
      </p>

      {/* Investigation Trigger & Targeted Question */}
      {(finding.triggerSignal || finding.investigationQuestion) && (
        <div className="rounded-lg border border-accent/20 bg-accent-soft/30 p-3.5 text-xs">
          {finding.triggerSignal && (
            <div className="mb-2">
              <span className="font-semibold text-accent">Financial Trigger Signal: </span>
              <span className="text-ink-2">{finding.triggerSignal}</span>
            </div>
          )}
          {finding.investigationQuestion && (
            <div>
              <span className="font-semibold text-accent">TinyFish Investigation Question: </span>
              <span className="text-ink font-medium italic">"{finding.investigationQuestion}"</span>
            </div>
          )}
        </div>
      )}

      <Section title="What was observed" icon={<FileSearch className="size-3.5 text-accent" />}>
        <p className="text-sm text-ink leading-relaxed">{finding.summary}</p>
      </Section>

      {finding.researchSummary && (
        <Section title="External Research Findings & Synthesis" icon={<Scale className="size-3.5 text-info" />}>
          <p className="text-sm text-ink-2 leading-relaxed">{finding.researchSummary}</p>
        </Section>
      )}

      <Section title="Why it matters for credit due diligence" icon={<ShieldAlert className="size-3.5 text-risk-med" />}>
        <p className="text-sm text-ink-2 leading-relaxed">{finding.whyItMatters}</p>
      </Section>

      {finding.metrics.length > 0 && (
        <Section title="Supporting metrics" icon={<FileText className="size-3.5 text-ink-3" />}>
          <div className="overflow-x-auto rounded-md border border-border scroll-thin">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-muted text-xs uppercase tracking-wide text-ink-3">
                <tr>
                  <th scope="col" className="px-3 py-2 font-semibold">Metric</th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">Current</th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">Prior</th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">Change</th>
                </tr>
              </thead>
              <tbody>
                {finding.metrics.map((m) => (
                  <tr key={m.label} className="border-t border-border">
                    <td className="px-3 py-2">
                      {m.label}
                      <span className="block text-xs text-ink-3">{m.period}</span>
                    </td>
                    <td className="num px-3 py-2 text-right font-medium">{formatMetricValue(m.value, m.unit, m.currency)}</td>
                    <td className="num px-3 py-2 text-right text-ink-2">
                      {m.prior ? (
                        <>
                          {formatMetricValue(m.prior.value, m.unit, m.currency)}
                          <span className="block text-xs text-ink-3">{m.prior.period}</span>
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="num px-3 py-2 text-right">{delta(m)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* Traceable Source Register */}
      <Section title={`Traceable Evidence & Source Records (${finding.evidence.length})`} icon={<FileText className="size-3.5 text-accent" />}>
        <div className="mb-2.5 flex items-center gap-2 text-xs text-ink-3">
          Overall Status: <EvidenceBadge status={finding.evidenceStatus} />
        </div>
        {finding.evidence.length === 0 ? (
          <p className="text-sm text-ink-3">No external evidence has been attached yet.</p>
        ) : (
          <ul className="space-y-3">
            {finding.evidence.map((e) => (
              <li
                key={e.id}
                className={cn(
                  'rounded-lg border p-3.5 text-xs',
                  e.simulated ? 'border-border bg-surface-muted/40' : 'border-border bg-surface',
                )}
              >
                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {e.sourceId && (
                      <span className="rounded bg-surface px-1.5 py-0.5 font-mono text-[11px] font-semibold text-ink border border-border">
                        {e.sourceId}
                      </span>
                    )}
                    <Badge>{e.origin === 'internal' ? 'Uploaded document' : 'TinyFish External Research'}</Badge>
                    <EvidenceBadge status={e.status} />
                    {e.reliability && (
                      <span className="rounded border border-border bg-surface px-1.5 py-0.5 text-[11px] text-ink-2">
                        Reliability: <strong className="text-ink uppercase">{e.reliability}</strong>
                      </span>
                    )}
                  </div>
                  {e.simulated && (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-risk-med">
                      <FlaskConical className="size-3" aria-hidden />
                      Simulated, not live-verified
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-semibold text-ink">{e.title}</h4>
                {e.publisher && (
                  <p className="mt-0.5 text-xs text-ink-3">Publisher / Registry: <span className="font-medium text-ink-2">{e.publisher}</span></p>
                )}

                <div className="mt-2 rounded border border-border/80 bg-surface p-2.5 text-ink-2 leading-relaxed italic">
                  "{e.excerpt}"
                </div>

                {e.reliabilityAssessment && (
                  <div className="mt-2 text-[11px] text-ink-3">
                    <strong className="text-ink-2">Source Assessment:</strong> {e.reliabilityAssessment}
                  </div>
                )}
                {e.borrowerRelevance && (
                  <div className="mt-1 text-[11px] text-ink-3">
                    <strong className="text-ink-2">Relevance:</strong> {e.borrowerRelevance}
                  </div>
                )}

                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-2 text-[11px] text-ink-3">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    {e.publishedAt && <span>Published: {e.publishedAt}</span>}
                    {e.retrievedAt && <span>Accessed: {formatDateTime(e.retrievedAt)}</span>}
                    {e.source && (
                      <span>
                        Document: {e.source.documentName} {e.source.page ? `(p. ${e.source.page})` : ''}
                      </span>
                    )}
                  </div>
                  {e.url && (
                    <a
                      href={e.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
                    >
                      Inspect Source <ExternalLink className="size-3" aria-hidden />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Recommended Next Steps */}
      {finding.recommendedNextSteps && finding.recommendedNextSteps.length > 0 && (
        <Section title="Recommended Underwriter Next Steps" icon={<ListChecks className="size-3.5 text-risk-low" />}>
          <ul className="space-y-1.5 text-xs text-ink-2">
            {finding.recommendedNextSteps.map((step: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 size-3.5 shrink-0 text-risk-low" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {finding.followUps.length > 0 && (
        <Section title="Open Due-Diligence Questions" icon={<HelpCircle className="size-3.5 text-ink-3" />}>
          <ul className="list-disc space-y-1 pl-5 text-sm text-ink-2">
            {finding.followUps.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Analyst review & decision" icon={<MessageSquarePlus className="size-3.5 text-accent" />}>
        <div role="group" aria-label="Set review status" className="flex flex-wrap gap-2">
          {ACTIONS.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={finding.reviewStatus === s ? 'primary' : 'secondary'}
              aria-pressed={finding.reviewStatus === s}
              disabled={setReview.isPending}
              onClick={() => apply(s)}
            >
              {REVIEW_LABEL[s]}
            </Button>
          ))}
          {finding.reviewStatus !== 'unreviewed' && (
            <Button size="sm" variant="ghost" disabled={setReview.isPending} onClick={() => apply('unreviewed')}>
              Reset
            </Button>
          )}
        </div>

        {finding.notes.length > 0 && (
          <ul className="mt-3 space-y-2">
            {finding.notes.map((n) => (
              <li key={n.id} className="rounded-md bg-surface-muted px-3 py-2 text-sm">
                <p className="text-ink">{n.text}</p>
                <p className="mt-1 text-xs text-ink-3">
                  {n.author} · {formatDateTime(n.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 flex flex-col gap-2">
          <Textarea
            label="Add an underwriter note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Record review notes, covenants, or borrower questions..."
          />
          <div className="flex justify-end">
            <Button size="sm" disabled={!note.trim()} loading={addNote.isPending} onClick={submitNote}>
              <MessageSquarePlus className="size-4" aria-hidden />
              Add note
            </Button>
          </div>
        </div>
      </Section>
    </article>
  )
}
