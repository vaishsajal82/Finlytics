import { useState } from 'react'
import {
  BarChart3,
  Search,
  FileCheck2,
  FileSpreadsheet,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  HelpCircle,
  ExternalLink,
} from 'lucide-react'

export function CapabilitiesSection() {
  const [activeTab, setActiveTab] = useState<'analysis' | 'risk' | 'evidence' | 'explainable'>('analysis')

  return (
    <section id="capabilities" className="relative py-24 sm:py-32 bg-canvas">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold tracking-widest text-accent uppercase">
            ENTERPRISE CAPABILITIES
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Financial Intelligence in Motion.
          </h2>
          <p className="mt-4 text-base text-ink-2">
            Explore the four core engines powering comprehensive commercial credit appraisals and risk investigations.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="mt-12 flex justify-center">
          <div className="inline-flex rounded-xl border border-border bg-surface-muted p-1.5 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab('analysis')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === 'analysis'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-ink-3 hover:text-ink'
              }`}
            >
              <BarChart3 className="size-3.5" />
              <span>Financial Analysis</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('risk')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === 'risk'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-ink-3 hover:text-ink'
              }`}
            >
              <Search className="size-3.5" />
              <span>Risk Investigation</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('evidence')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === 'evidence'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-ink-3 hover:text-ink'
              }`}
            >
              <FileCheck2 className="size-3.5" />
              <span>Evidence Intelligence</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('explainable')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === 'explainable'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-ink-3 hover:text-ink'
              }`}
            >
              <FileSpreadsheet className="size-3.5" />
              <span>Explainable Assessment</span>
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="mt-10">
          {/* TAB 1: FINANCIAL ANALYSIS */}
          {activeTab === 'analysis' && (
            <div className="grid gap-8 rounded-2xl border border-border bg-surface p-6 shadow-sm lg:grid-cols-12 sm:p-8">
              <div className="lg:col-span-5 flex flex-col justify-center space-y-4">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent w-fit">
                  <BarChart3 className="size-3.5" />
                  <span>Module 01</span>
                </div>
                <h3 className="text-2xl font-bold text-ink">Financial Analysis Engine</h3>
                <p className="text-sm leading-relaxed text-ink-2">
                  Understand financial performance through clear visualizations, key indicators, and explainable insights.
                  Identify revenue and cash flow divergences, leverage trajectories, and margin trends instantly.
                </p>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-ink-2">
                    <CheckCircle2 className="size-4 text-accent" />
                    <span>Calculates 16+ institutional credit ratios automatically</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-ink-2">
                    <CheckCircle2 className="size-4 text-accent" />
                    <span>Working capital cycle and debtor days stress-testing</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-ink-2">
                    <CheckCircle2 className="size-4 text-accent" />
                    <span>Cross-verifies revenue with bank transaction summaries</span>
                  </div>
                </div>
              </div>

              {/* Miniature Interactive UI */}
              <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#0f1b2d] p-5 text-slate-100 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-xs font-bold text-white">Financial Performance Metrics (₹ Crores)</h4>
                    <p className="text-[10px] text-slate-400">Meridian Packaging · 3-Year Comparative Trend</p>
                  </div>
                  <span className="rounded bg-teal-500/20 px-2 py-0.5 text-[9px] font-mono text-teal-300">
                    AUDITED SCHEDULES
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-slate-800 bg-slate-900/90 p-3">
                    <span className="text-[10px] text-slate-400 uppercase">FY25 Revenue</span>
                    <div className="mt-1 text-base font-bold text-white">₹48.24 Cr</div>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                      <TrendingUp className="size-3" /> +32.0% YoY
                    </span>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-900/90 p-3">
                    <span className="text-[10px] text-slate-400 uppercase">EBITDA Margin</span>
                    <div className="mt-1 text-base font-bold text-white">14.82%</div>
                    <span className="text-[10px] text-emerald-400">+110 bps expansion</span>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-900/90 p-3">
                    <span className="text-[10px] text-slate-400 uppercase">Operating Cash Flow</span>
                    <div className="mt-1 text-base font-bold text-rose-400">₹3.91 Cr</div>
                    <span className="text-[10px] text-rose-400">-18.2% (Divergence)</span>
                  </div>
                </div>

                {/* SVG Visual Bar Chart */}
                <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 p-4">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                    <span>Revenue vs Cash Flow (FY23 &rarr; FY25)</span>
                    <span className="text-teal-400">Divergence Alert Active</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-300 mb-1">
                        <span>FY25 Revenue (₹48.2 Cr)</span>
                        <span className="text-teal-400">100% Index</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full bg-teal-400 w-[100%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-300 mb-1">
                        <span>FY24 Revenue (₹36.5 Cr)</span>
                        <span className="text-slate-400">75.7%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full bg-teal-600 w-[75%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-rose-300 mb-1">
                        <span>FY25 Operating Cash Flow (₹3.9 Cr)</span>
                        <span className="text-rose-400">8.1% of Revenue</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full bg-rose-500 w-[24%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RISK INVESTIGATION */}
          {activeTab === 'risk' && (
            <div className="grid gap-8 rounded-2xl border border-border bg-surface p-6 shadow-sm lg:grid-cols-12 sm:p-8">
              <div className="lg:col-span-5 flex flex-col justify-center space-y-4">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 w-fit">
                  <Search className="size-3.5" />
                  <span>Module 02</span>
                </div>
                <h3 className="text-2xl font-bold text-ink">Risk Investigation Network</h3>
                <p className="text-sm leading-relaxed text-ink-2">
                  Investigate anomalies and explore the evidence behind important financial questions.
                  Connect anomalous metrics to structured hypotheses with supporting or contradicting evidence trails.
                </p>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-ink-2">
                    <CheckCircle2 className="size-4 text-accent" />
                    <span>Decomposes anomalies into testable hypotheses</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-ink-2">
                    <CheckCircle2 className="size-4 text-accent" />
                    <span>Distinguishes supported vs unverified findings</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-ink-2">
                    <CheckCircle2 className="size-4 text-accent" />
                    <span>Generates focused interview queries for management</span>
                  </div>
                </div>
              </div>

              {/* Miniature Interactive UI */}
              <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#0c182a] p-5 text-slate-100 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="size-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">Flagged Signal: Receivables &gt; Revenue Growth</span>
                  </div>
                  <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[9px] font-bold text-amber-300">
                    HIGH PRIORITY
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {/* Hypothesis 1 */}
                  <div className="rounded-lg border border-slate-800 bg-slate-900/90 p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200">
                        Hypothesis A: Extended Credit Terms with Top Customer
                      </span>
                      <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
                        SUPPORTED
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Top client invoice terms lengthened from 45 days to 75 days as confirmed by GST e-way bills.
                    </p>
                  </div>

                  {/* Hypothesis 2 */}
                  <div className="rounded-lg border border-slate-800 bg-slate-900/90 p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200">
                        Hypothesis B: Fictitious Invoicing or Revenue Acceleration
                      </span>
                      <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[9px] font-bold text-rose-300">
                        CONTRADICTED
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Bank deposits corroborate 98.4% of declared GST sales; no round-tripping or circular transactions.
                    </p>
                  </div>

                  {/* Hypothesis 3 */}
                  <div className="rounded-lg border border-slate-800 bg-slate-900/90 p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200">
                        Hypothesis C: Solvency Risk of Anchor Debtor
                      </span>
                      <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[9px] font-bold text-blue-300">
                        UNRESOLVED
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Anchor client credit rating report not in repository; recommend credit committee request audited financials of top debtor.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EVIDENCE INTELLIGENCE */}
          {activeTab === 'evidence' && (
            <div className="grid gap-8 rounded-2xl border border-border bg-surface p-6 shadow-sm lg:grid-cols-12 sm:p-8">
              <div className="lg:col-span-5 flex flex-col justify-center space-y-4">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-700 w-fit">
                  <FileCheck2 className="size-3.5" />
                  <span>Module 03</span>
                </div>
                <h3 className="text-2xl font-bold text-ink">Evidence Intelligence Engine</h3>
                <p className="text-sm leading-relaxed text-ink-2">
                  Separate observed financial data from hypotheses and externally retrieved evidence.
                  Maintains a transparent source audit trail with timestamped verification checkpoints.
                </p>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-ink-2">
                    <CheckCircle2 className="size-4 text-accent" />
                    <span>Strict demarcation of observed vs simulated evidence</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-ink-2">
                    <CheckCircle2 className="size-4 text-accent" />
                    <span>Direct line-item citations to source document pages</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-ink-2">
                    <CheckCircle2 className="size-4 text-accent" />
                    <span>Eliminates hallucination through evidentiary grounding</span>
                  </div>
                </div>
              </div>

              {/* Miniature Interactive UI */}
              <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#0c182a] p-5 text-slate-100 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-teal-400" />
                    <span className="text-xs font-bold text-white">Source Verification Matrix</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">AUDIT TRAIL V1.2</span>
                </div>

                <div className="mt-4 space-y-2.5">
                  <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 p-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-md bg-teal-500/10 p-2 text-teal-400">
                        <FileCheck2 className="size-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">MCA Annual Filings (AOC-4)</div>
                        <span className="text-[10px] text-slate-400">Directly matched CIN · 3 Years Audited</span>
                      </div>
                    </div>
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
                      Observed Data
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 p-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-md bg-teal-500/10 p-2 text-teal-400">
                        <Clock className="size-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">Bank OCR Statements (36 Months)</div>
                        <span className="text-[10px] text-slate-400">1,482 Entries Verified · Zero Bounces</span>
                      </div>
                    </div>
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
                      Observed Data
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 p-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-md bg-amber-500/10 p-2 text-amber-400">
                        <HelpCircle className="size-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">Industry Debtor Days Benchmark</div>
                        <span className="text-[10px] text-slate-400">External reference dataset · Synthetic simulated</span>
                      </div>
                    </div>
                    <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[9px] font-bold text-amber-300">
                      Simulated Reference
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EXPLAINABLE ASSESSMENT */}
          {activeTab === 'explainable' && (
            <div className="grid gap-8 rounded-2xl border border-border bg-surface p-6 shadow-sm lg:grid-cols-12 sm:p-8">
              <div className="lg:col-span-5 flex flex-col justify-center space-y-4">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-700 w-fit">
                  <FileSpreadsheet className="size-3.5" />
                  <span>Module 04</span>
                </div>
                <h3 className="text-2xl font-bold text-ink">Explainable Assessment Dossier</h3>
                <p className="text-sm leading-relaxed text-ink-2">
                  Give financial reviewers a clearer basis for informed decisions.
                  Generates executive underwriting dossiers with transparent risk signals, evidence strength, and follow-up checks.
                </p>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-ink-2">
                    <CheckCircle2 className="size-4 text-accent" />
                    <span>Credit Committee Memorandum ready for export</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-ink-2">
                    <CheckCircle2 className="size-4 text-accent" />
                    <span>Transparent disclosure of data gaps and limitations</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-ink-2">
                    <CheckCircle2 className="size-4 text-accent" />
                    <span>Formulated sanction conditions and covenants</span>
                  </div>
                </div>
              </div>

              {/* Miniature Interactive UI */}
              <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#0c182a] p-5 text-slate-100 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-xs font-bold text-white">Underwriting Decision Summary</h4>
                    <p className="text-[10px] text-slate-400">Meridian Packaging Pvt Ltd · Due Diligence Memo</p>
                  </div>
                  <span className="rounded bg-teal-500/20 px-2 py-0.5 text-[9px] font-bold text-teal-300">
                    RECOMMENDED WITH COVENANTS
                  </span>
                </div>

                <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900 p-3.5 space-y-2 text-xs">
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    <strong className="text-white">Executive Synthesis:</strong> The applicant demonstrates solid core operating margins (14.8%) and viable interest coverage (4.2x). While revenue expanded 32%, cash flow conversion contracted to 28% due to working capital expansion.
                  </p>
                  <div className="rounded border border-amber-500/20 bg-amber-500/5 p-2 text-[10px] text-amber-300">
                    <strong>Sanction Condition:</strong> Escrow on Anchor Client receivables &amp; quarterly stock audit.
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Sign-off: Priya Sharma, Senior Underwriter</span>
                  <span className="flex items-center gap-1 text-teal-400">
                    <span>Export Full PDF</span>
                    <ExternalLink className="size-3" />
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
