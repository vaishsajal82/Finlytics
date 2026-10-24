import { useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  Printer,
  ShieldCheck,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { downloadBlob } from '@/lib/utils'
import type { Report } from '../types'
import { exportReportToPdf } from '../utils/pdfExport'

export function ReportView({ report }: { report: Report }) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const toggleSection = (id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const exportPdf = () => {
    try {
      exportReportToPdf(report)
    } catch {
      window.print()
    }
  }

  const exportJson = () => {
    const jsonStr = JSON.stringify(report, null, 2)
    downloadBlob(`${report.companyName.replace(/\W+/g, '_')}_diligence_data.json`, jsonStr, 'application/json')
  }

  const printReport = () => {
    window.print()
  }


  const rec = report.recommendation

  return (
    <article aria-label={`Due-diligence report for ${report.companyName}`} className="space-y-6">
      {/* Draft and Synthetic Disclosures */}
      <div className="space-y-2 no-print">
        {report.draft && (
          <div className="flex items-center gap-2 rounded-lg border border-[#f3d98b] bg-risk-med-soft px-3.5 py-2.5 text-xs text-risk-med">
            <AlertCircle className="size-4 shrink-0" />
            <span>
              <strong>Draft Report:</strong> Compiled automatically from current assessment state and simulated research. Analyst sign-off pending.
            </span>
          </div>
        )}
      </div>

      {/* Report Header Card */}
      <div className="rounded-xl border border-border bg-surface p-5 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-accent">
              Finlytics AI Financial Due Diligence &amp; Credit Intelligence
            </span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">{report.companyName}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-3">
              <span>Assessment ID: <strong className="font-mono text-ink-2">{report.assessmentId}</strong></span>
              <span>·</span>
              <span>Report Version: <strong className="text-ink-2">v{report.version ?? '1.2'}</strong></span>
              <span>·</span>
              <span>Date: <strong className="text-ink-2">{report.generatedAt ? new Date(report.generatedAt).toLocaleDateString() : 'Current'}</strong></span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2 no-print">
            <Button size="sm" variant="primary" onClick={exportPdf} className="gap-1.5 text-xs">
              <Download className="size-3.5" />
              Export PDF
            </Button>
            <Button size="sm" variant="secondary" onClick={printReport} className="gap-1.5 text-xs">
              <Printer className="size-3.5" />
              Print / Save PDF
            </Button>
            <Button size="sm" variant="secondary" onClick={exportJson} className="gap-1.5 text-xs">
              <Download className="size-3.5" />
              Export JSON
            </Button>
          </div>
        </div>

        {/* Preliminary Recommendation Card */}
        {rec && (
          <div className="mt-5 rounded-lg border border-accent/30 bg-accent-soft/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-accent" />
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-3">
                  Preliminary Credit Decision-Support Verdict
                </span>
              </div>
              <Badge tone="accent" className="px-2.5 py-1 text-xs font-bold uppercase tracking-wide">
                {rec.verdict.replace(/_/g, ' ')}
              </Badge>
            </div>

            <p className="mt-3 text-sm text-ink-2 leading-relaxed">
              <strong className="text-ink font-semibold">Underwriting Rationale: </strong>
              {rec.rationale}
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-md border border-border bg-surface p-3 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-risk-low">
                  <CheckCircle2 className="size-3.5" />
                  Key Supporting Factors
                </div>
                <ul className="mt-2 space-y-1.5 text-ink-2">
                  {rec.supportingFactors.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="mt-1 size-1 shrink-0 rounded-full bg-risk-low" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-md border border-border bg-surface p-3 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-risk-med">
                  <AlertTriangle className="size-3.5" />
                  Material Objections &amp; Sensitivities
                </div>
                <ul className="mt-2 space-y-1.5 text-ink-2">
                  {rec.materialObjections.map((o, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="mt-1 size-1 shrink-0 rounded-full bg-risk-med" />
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {rec.suggestedConditions && rec.suggestedConditions.length > 0 && (
              <div className="mt-3 rounded-md border border-border bg-surface p-3 text-xs">
                <div className="font-semibold text-ink">Suggested Monitoring Covenants &amp; Conditions:</div>
                <ul className="mt-1.5 space-y-1 text-ink-2">
                  {rec.suggestedConditions.map((c: string, i: number) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="mt-1 size-1 shrink-0 rounded-full bg-accent" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mt-3 text-[11px] text-ink-3 italic">
              Disclaimer: Analytical decision-support only. This system provides explainable credit analysis and does not issue automated credit sanction or rejection under banking regulations.
            </p>
          </div>
        )}
      </div>


      {/* Sections A through Q Rendered */}
      <div className="space-y-4">
        {report.sections.map((s) => {
          const isCollapsed = collapsed[s.id]
          const bullets = s.body.filter((l) => l.startsWith('- '))
          const paras = s.body.filter((l) => !l.startsWith('- '))

          return (
            <Card key={s.id} id={`sec-${s.id}`} className="scroll-mt-20 overflow-hidden">
              <div className="flex items-center justify-between border-b border-border bg-surface-muted/40 px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-sm font-semibold text-ink">{s.title.replace(/^[A-Z]\.\s*/, '')}</h3>
                  <Badge
                    tone={
                      s.status === 'complete'
                        ? 'low'
                        : s.status === 'partial'
                          ? 'medium'
                          : 'neutral'
                    }
                  >
                    {s.status ?? 'Complete'}
                  </Badge>
                </div>

                <button
                  type="button"
                  onClick={() => toggleSection(s.id)}
                  aria-label={`Toggle section ${s.title}`}
                  className="rounded p-1 text-ink-3 hover:bg-surface hover:text-ink no-print"
                >
                  {isCollapsed ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
                </button>
              </div>

              {!isCollapsed && (
                <div className="space-y-3 p-4 sm:p-5">
                  {paras.map((p, idx) => (
                    <p key={idx} className="text-xs text-ink-2 leading-relaxed">
                      {p}
                    </p>
                  ))}

                  {bullets.length > 0 && (
                    <ul className="space-y-1.5 rounded-lg border border-border bg-surface-muted/30 p-3 text-xs text-ink-2">
                      {bullets.map((b, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="mt-1 size-1 shrink-0 rounded-full bg-accent" />
                          <span className="leading-relaxed">{b.slice(2)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Footer Return CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4 no-print">
        <span className="text-xs text-ink-3">
          End of due-diligence dossier · Assessment {report.assessmentId} · Finlytics AI
        </span>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="gap-1.5 text-xs text-ink-2"
          >
            <ArrowUp className="size-3.5" />
            Back to Top
          </Button>
          <Button size="sm" variant="primary" onClick={exportPdf} className="gap-1.5 text-xs">
            <Download className="size-3.5" />
            Download PDF Report
          </Button>
        </div>
      </div>
    </article>
  )
}
