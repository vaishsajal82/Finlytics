import { ShieldCheck, Eye, UserCheck, CheckCircle2, AlertCircle, FileText } from 'lucide-react'

export function TrustSection() {
  const principles = [
    {
      title: 'Traceable Evidence',
      icon: FileText,
      description:
        'Connect every important finding, calculated ratio, and anomaly directly to relevant supporting lines in audited balance sheets, bank ledgers, or tax filings.',
      badge: 'Zero Hallucinations',
    },
    {
      title: 'Explainable Risk',
      icon: Eye,
      description:
        'Explain why a financial pattern deserves investigation. We don’t emit arbitrary risk scores without exposing the underlying financial mechanics.',
      badge: 'Transparent Logic',
    },
    {
      title: 'Human-Led Decisions',
      icon: UserCheck,
      description:
        'Finlytics is built to assist and empower credit underwriters, investment committees, and risk analysts—never to replace human expertise or mandate lending outcomes.',
      badge: 'Analyst Sovereignty',
    },
  ]

  return (
    <section id="trust" className="relative py-24 sm:py-32 bg-surface-muted/50 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3.5 py-1 text-xs font-semibold text-accent">
            <ShieldCheck className="size-3.5 text-accent" />
            <span>RESPONSIBLE AI &amp; GOVERNANCE</span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Every Signal Has a Story.
          </h2>
          <p className="mt-4 text-base text-ink-2">
            Automated tools shouldn&apos;t be black boxes. We hold our AI due-diligence engine to the highest
            standards of transparency, defensibility, and evidentiary integrity.
          </p>
        </div>

        {/* 3 Core Principles Grid */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {principles.map((principle) => {
            const Icon = principle.icon
            return (
              <div
                key={principle.title}
                className="relative flex flex-col justify-between rounded-2xl border border-border bg-surface p-7 shadow-sm transition-all hover:border-border-strong hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <Icon className="size-5" />
                    </div>
                    <span className="rounded-full bg-surface-muted px-2.5 py-1 text-[10px] font-bold tracking-wide text-ink-3 uppercase border border-border">
                      {principle.badge}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-ink">{principle.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-2">
                    {principle.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border flex items-center gap-2 text-xs font-medium text-accent">
                  <CheckCircle2 className="size-4" />
                  <span>Defensible Institutional Standard</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Evidentiary Integrity Comparison Matrix */}
        <div className="mt-12 rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 gap-2">
            <div>
              <h3 className="text-base font-bold text-ink">Evidence Integrity Framework</h3>
              <p className="text-xs text-ink-3">How Finlytics maintains strict separation between verified records and simulated hypotheses.</p>
            </div>
            <span className="rounded bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent self-start sm:self-auto">
              Statutory-Grade Rigor
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface-muted p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>Observed Financial Data</span>
              </div>
              <p className="mt-1 text-xs text-ink-2 leading-relaxed">
                Directly extracted from audited financial statements, tax filings, and bank records. Never altered or filled in with probabilistic estimates.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-surface-muted p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                <AlertCircle className="size-4 text-amber-600" />
                <span>Hypotheses &amp; External Signals</span>
              </div>
              <p className="mt-1 text-xs text-ink-2 leading-relaxed">
                Clearly labeled as hypotheses under review. External research is flagged as simulated demonstration data until live statutory verification is configured.
              </p>
            </div>
          </div>

          <p className="mt-5 text-center text-[11px] text-ink-3">
            <strong>Disclaimer:</strong> Finlytics provides analytical due-diligence assistance. It does not provide automated lending guarantees, legal advice, or certified statutory audits.
          </p>
        </div>
      </div>
    </section>
  )
}
