import { useState } from 'react'
import {
  FileUp,
  LineChart,
  SearchAlert,
  GitCompare,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  FileQuestion,
  HelpCircle,
} from 'lucide-react'

interface Stage {
  number: string
  title: string
  subtitle: string
  description: string
  icon: typeof FileUp
  previewBadge: string
  details: {
    inputs: string[]
    output: string
    highlight: string
  }
}

const STAGES: Stage[] = [
  {
    number: '01',
    title: 'Understand',
    subtitle: 'Multi-Source Document Ingestion',
    description:
      'Upload financial statements, bank statements, GST returns, ledgers, and other supported documents with automated OCR and format normalization.',
    icon: FileUp,
    previewBadge: 'DOCUMENTS INGESTED & NORMALIZED',
    details: {
      inputs: ['Audited Balance Sheets (3 Yrs)', 'Bank E-Statements (36 Months)', 'GSTR-3B & GSTR-2A Returns'],
      output: 'High-confidence tabular extraction and time-series mapping across financial years.',
      highlight: 'Zero manual data entry; automated reconciliation across disparate file formats.',
    },
  },
  {
    number: '02',
    title: 'Analyze',
    subtitle: 'Financial Signal & Metric Extraction',
    description:
      'Extract financial information and identify unusual patterns in revenue, receivables, liquidity, working capital, and operating cash flow.',
    icon: LineChart,
    previewBadge: 'KPI & RATIO SCHEDULE DERIVED',
    details: {
      inputs: ['EBITDA & Operating Margins', 'Cash Conversion Cycle (DSO/DPO/DIO)', 'Leverage & Debt Service Coverage'],
      output: 'Derived ratio schedules and automated flagging of mathematical or economic divergences.',
      highlight: 'Flags anomalies without premature assumptions: detects diverging growth curves.',
    },
  },
  {
    number: '03',
    title: 'Investigate',
    subtitle: 'Hypothesis Formulation',
    description:
      'Turn important risk signals into focused investigation questions, identifying key uncertainties that require evidentiary testing.',
    icon: SearchAlert,
    previewBadge: 'RISK HYPOTHESIS GENERATED',
    details: {
      inputs: ['Receivables grew 47% vs Sales 32%', 'Operating cash flow dropped by 18%', 'Concentration in top 2 customers'],
      output: 'Structured investigation questions targeted at corroborating management assertions.',
      highlight: 'Turns passive alerts into actionable, defensible research hypotheses for analysts.',
    },
  },
  {
    number: '04',
    title: 'Verify',
    subtitle: 'Multi-Evidence Triaging',
    description:
      'Compare findings with relevant evidence and distinguish supported, contradicted, unverified, and inconclusive claims with clear confidence tiers.',
    icon: GitCompare,
    previewBadge: 'EVIDENCE AUDIT TRAILS RECORDED',
    details: {
      inputs: ['MCA Statutory Filings', 'Independent GST Invoicing Trails', 'Bank Deposit Trajectories'],
      output: 'Status categorisation: Supported (65%), Corroborated (25%), Unresolved (10%).',
      highlight: 'Strictly distinguishes observed financial records from external simulated claims.',
    },
  },
  {
    number: '05',
    title: 'Explain',
    subtitle: 'Defensible Credit Memo & Dossier',
    description:
      'Present an understandable assessment with evidence references, limitations, confidence status, and specific follow-up questions for the credit committee.',
    icon: FileCheck,
    previewBadge: 'CREDIT MEMO READY FOR REVIEW',
    details: {
      inputs: ['Executive Risk Synthesis', 'Audit Source Citations', 'Management Interview Guide'],
      output: 'Defensible credit memorandum with transparent citations and unresolved item checks.',
      highlight: 'Empowers human underwriters with defensible evidence, not black-box automated mandates.',
    },
  },
]

export function WorkflowSection() {
  const [activeStageIndex, setActiveStageIndex] = useState(0)
  const activeStage = STAGES[activeStageIndex] ?? STAGES[0]!

  return (
    <section id="how-it-works" className="relative py-24 sm:py-32 bg-surface-muted/60 border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold tracking-widest text-accent uppercase">
            THE FINLYTICS INTELLIGENCE PIPELINE
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            From Financial Data to Defensible Decisions.
          </h2>
          <p className="mt-4 text-base text-ink-2">
            A connected 5-stage workflow that bridges raw financial documents with explainable,
            evidence-backed credit intelligence.
          </p>
        </div>

        {/* 5-Stage Connected Progress Stepper */}
        <div className="mt-16">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-2">
            {STAGES.map((stage, idx) => {
              const Icon = stage.icon
              const isActive = idx === activeStageIndex
              return (
                <button
                  key={stage.number}
                  type="button"
                  onClick={() => setActiveStageIndex(idx)}
                  className={`group relative flex flex-col items-start rounded-xl p-4 text-left transition-all duration-200 border ${
                    isActive
                      ? 'bg-surface border-accent shadow-sm ring-1 ring-accent'
                      : 'bg-surface/60 border-border hover:bg-surface hover:border-border-strong'
                  }`}
                  aria-pressed={isActive}
                >
                  {/* Top indicator bar */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl transition-colors ${
                      isActive ? 'bg-accent' : 'bg-transparent'
                    }`}
                  />
                  <div className="flex w-full items-center justify-between">
                    <span
                      className={`font-mono text-xs font-bold ${
                        isActive ? 'text-accent' : 'text-ink-3'
                      }`}
                    >
                      {stage.number}
                    </span>
                    <Icon
                      className={`size-4 transition-colors ${
                        isActive ? 'text-accent' : 'text-ink-3 group-hover:text-ink-2'
                      }`}
                    />
                  </div>
                  <h3 className="mt-2 text-sm font-bold text-ink">{stage.title}</h3>
                  <p className="mt-0.5 line-clamp-2 text-[11px] text-ink-3">{stage.subtitle}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Active Stage Detail & Interactive Mini-Visualizer */}
        <div className="mt-8 rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                <activeStage.icon className="size-3.5" />
                <span>Stage {activeStage.number} · {activeStage.title}</span>
              </div>

              <h3 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                {activeStage.subtitle}
              </h3>

              <p className="text-sm leading-relaxed text-ink-2">
                {activeStage.description}
              </p>

              {/* Data Inputs & Outputs */}
              <div className="pt-2 space-y-3">
                <div className="rounded-lg border border-border bg-surface-muted p-3.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-3">
                    Key Inputs &amp; Sources:
                  </span>
                  <ul className="mt-1.5 space-y-1 text-xs text-ink-2">
                    {activeStage.details.inputs.map((input) => (
                      <li key={input} className="flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-accent shrink-0" />
                        <span>{input}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg border border-accent/20 bg-accent/5 p-3.5 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                    Defensible Output:
                  </span>
                  <p className="mt-1 font-medium text-ink">{activeStage.details.output}</p>
                  <p className="mt-1 text-[11px] text-ink-3 italic">{activeStage.details.highlight}</p>
                </div>
              </div>
            </div>

            {/* Right Interactive Visual Stage Showcase */}
            <div className="lg:col-span-6">
              <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-[#0c182a] p-6 text-slate-100 shadow-xl">
                {/* Visual Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-teal-400 animate-pulse" />
                    <span className="text-xs font-mono font-semibold text-teal-400">
                      {activeStage.previewBadge}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">FINLYTICS PIPELINE ENGINE</span>
                </div>

                {/* Specific Live UI Mock based on active stage */}
                <div className="mt-5 space-y-4">
                  {activeStageIndex === 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900/80 p-3">
                        <div className="flex items-center gap-2.5">
                          <FileUp className="size-5 text-teal-400" />
                          <div>
                            <div className="text-xs font-semibold text-white">Meridian_FY24_25_Audited.pdf</div>
                            <span className="text-[10px] text-slate-400">OCR Extraction · 48 Pages · 100% Parsed</span>
                          </div>
                        </div>
                        <span className="rounded bg-teal-500/20 px-2 py-0.5 text-[10px] font-semibold text-teal-300">
                          Complete
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900/80 p-3">
                        <div className="flex items-center gap-2.5">
                          <FileUp className="size-5 text-teal-400" />
                          <div>
                            <div className="text-xs font-semibold text-white">Bank_Statement_36M_HDFC.pdf</div>
                            <span className="text-[10px] text-slate-400">1,482 Transactions Cross-Reconciled</span>
                          </div>
                        </div>
                        <span className="rounded bg-teal-500/20 px-2 py-0.5 text-[10px] font-semibold text-teal-300">
                          Complete
                        </span>
                      </div>
                    </div>
                  )}

                  {activeStageIndex === 1 && (
                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-2.5">
                          <span className="text-[10px] text-slate-400">Revenue Growth</span>
                          <div className="text-sm font-bold text-emerald-400">+32.0% YoY</div>
                        </div>
                        <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-2.5">
                          <span className="text-[10px] text-slate-400">OCF Margin</span>
                          <div className="text-sm font-bold text-rose-400">8.1% (Weakening)</div>
                        </div>
                        <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-2.5">
                          <span className="text-[10px] text-slate-400">Debtor Days</span>
                          <div className="text-sm font-bold text-amber-400">74 Days (+22d)</div>
                        </div>
                      </div>
                      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-amber-300">
                        <span className="font-semibold text-xs">Pattern Identified:</span> Working capital absorption is outstripping topline expansion.
                      </div>
                    </div>
                  )}

                  {activeStageIndex === 2 && (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-slate-800 bg-slate-900 p-3.5">
                        <span className="text-[10px] font-bold text-teal-400 uppercase">Core Investigation Question:</span>
                        <p className="mt-1 text-xs font-semibold text-white">
                          &ldquo;Why did accounts receivable grow by 47% while operating cash flow declined by 18% during FY2025?&rdquo;
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="rounded border border-slate-800 bg-slate-950 p-2 text-slate-300">
                          • Hypothesis 1: Delayed customer collections
                        </div>
                        <div className="rounded border border-slate-800 bg-slate-950 p-2 text-slate-300">
                          • Hypothesis 2: Aggressive credit term relaxation
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStageIndex === 3 && (
                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-2.5 text-emerald-300">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="size-4 text-emerald-400" />
                          <span>Bank receipts confirm 88.4% of declared GST sales</span>
                        </div>
                        <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold uppercase">Supported</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-950/30 p-2.5 text-amber-300">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="size-4 text-amber-400" />
                          <span>Receivables concentration with Anchor Client (₹4.8 Cr)</span>
                        </div>
                        <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[9px] font-bold uppercase">Under Review</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-blue-500/30 bg-blue-950/30 p-2.5 text-blue-300">
                        <div className="flex items-center gap-2">
                          <FileQuestion className="size-4 text-blue-400" />
                          <span>FY25 MCA Annual filing cross-check with tax returns</span>
                        </div>
                        <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[9px] font-bold uppercase">Corroborated</span>
                      </div>
                    </div>
                  )}

                  {activeStageIndex === 4 && (
                    <div className="space-y-3 text-xs">
                      <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">Underwriting Assessment Summary</span>
                          <span className="rounded bg-teal-500/20 px-2 py-0.5 text-[10px] font-bold text-teal-300">
                            MEMO APPROVED
                          </span>
                        </div>
                        <p className="mt-2 text-[11px] leading-relaxed text-slate-300">
                          Borrower exhibits strong operating profitability (EBITDA 14.8%) and viable interest coverage (4.2x). Credit approval recommended subject to condition precedent: pledge of receivables from top debtor.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <HelpCircle className="size-3.5 text-teal-400" />
                        <span>Includes 3 management clarification questions for credit sanction committee.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
