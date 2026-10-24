import { useState } from 'react'
import {
  UploadCloud,
  TrendingUp,
  AlertTriangle,
  FileText,
  FileCheck2,
  CheckCircle2,
  Clock,
  Building,
  Shield,
  FileSpreadsheet,
} from 'lucide-react'

export function ProductPreviewSection() {
  const [activeStage, setActiveStage] = useState<'upload' | 'analysis' | 'risk' | 'summary'>('analysis')

  return (
    <section id="preview" className="relative py-24 sm:py-32 bg-canvas">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold tracking-widest text-accent uppercase">
            READ-ONLY INTERACTIVE DEMO
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Experience the Underwriter Workspace.
          </h2>
          <p className="mt-4 text-base text-ink-2">
            Step through an active due-diligence assessment for commercial borrower{' '}
            <strong className="text-ink">Meridian Packaging Pvt Ltd</strong> (Assessment ID: ASM-1001).
          </p>
        </div>

        {/* Stepper Tabs */}
        <div className="mt-12 flex justify-center">
          <div className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-surface-muted p-1 sm:grid-cols-4 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveStage('upload')}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                activeStage === 'upload'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-ink-3 hover:text-ink'
              }`}
            >
              <UploadCloud className="size-3.5" />
              <span>1. Upload Documents</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveStage('analysis')}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                activeStage === 'analysis'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-ink-3 hover:text-ink'
              }`}
            >
              <TrendingUp className="size-3.5" />
              <span>2. Financial Analysis</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveStage('risk')}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                activeStage === 'risk'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-ink-3 hover:text-ink'
              }`}
            >
              <AlertTriangle className="size-3.5" />
              <span>3. Risk Investigation</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveStage('summary')}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                activeStage === 'summary'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-ink-3 hover:text-ink'
              }`}
            >
              <FileSpreadsheet className="size-3.5" />
              <span>4. Assessment Summary</span>
            </button>
          </div>
        </div>

        {/* Simulated Assessment Workspace Card */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-surface shadow-md">
          {/* Workspace Top Toolbar */}
          <div className="flex flex-wrap items-center justify-between border-b border-border bg-surface-muted px-6 py-4 gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-nav text-teal-400">
                <Building className="size-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-ink">Meridian Packaging Pvt Ltd</h3>
                  <span className="rounded bg-teal-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-teal-700 border border-teal-500/20">
                    ASM-1001
                  </span>
                </div>
                <p className="text-[11px] text-ink-3">
                  CIN: U21014MH2018PTC309812 · Commercial Credit Appraisal · ₹15.0 Cr Facility
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                <Shield className="size-3" />
                <span>Health Score: 78/100</span>
              </span>
              <span className="hidden rounded bg-surface px-2.5 py-1 text-xs font-mono text-ink-3 border border-border sm:inline-block">
                READ-ONLY SIMULATION
              </span>
            </div>
          </div>

          {/* Interactive Stage Window */}
          <div className="p-6 sm:p-8">
            {/* STAGE 1: UPLOAD DOCUMENTS */}
            {activeStage === 'upload' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-base font-bold text-ink">Uploaded Dossier Documents</h4>
                  <p className="text-xs text-ink-3">
                    Finlytics automatically extracts tabular disclosures, OCR-verifies bank statements, and reconciles GST returns.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-border bg-surface-muted p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <FileText className="size-5 text-accent" />
                      <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                        OCR 100%
                      </span>
                    </div>
                    <div className="text-xs font-bold text-ink">Audited Balance Sheet (FY25)</div>
                    <p className="text-[11px] text-ink-3">48 Pages · Signed by KPMG · Schedule III Formatted</p>
                  </div>

                  <div className="rounded-xl border border-border bg-surface-muted p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <FileCheck2 className="size-5 text-accent" />
                      <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                        MATCHED
                      </span>
                    </div>
                    <div className="text-xs font-bold text-ink">GST Returns (GSTR-3B)</div>
                    <p className="text-[11px] text-ink-3">36 Months Reconciliation · 99.1% Turnover Match</p>
                  </div>

                  <div className="rounded-xl border border-border bg-surface-muted p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Clock className="size-5 text-accent" />
                      <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                        1,482 TXNS
                      </span>
                    </div>
                    <div className="text-xs font-bold text-ink">HDFC Operating Account</div>
                    <p className="text-[11px] text-ink-3">36 Months Bank Statement · Zero Dishonored Cheques</p>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 2: FINANCIAL ANALYSIS */}
            {activeStage === 'analysis' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-base font-bold text-ink">Financial Performance &amp; Ratio Schedules</h4>
                  <p className="text-xs text-ink-3">Derived metrics calculated directly from verified balance sheet lines.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-4">
                  <div className="rounded-xl border border-border bg-surface-muted p-4">
                    <span className="text-[11px] font-medium text-ink-3">Revenue (YoY Growth)</span>
                    <div className="mt-1 text-xl font-bold text-ink">₹48.24 Cr</div>
                    <span className="text-xs font-semibold text-emerald-700">+32.0% expansion</span>
                  </div>
                  <div className="rounded-xl border border-border bg-surface-muted p-4">
                    <span className="text-[11px] font-medium text-ink-3">Operating Cash Flow</span>
                    <div className="mt-1 text-xl font-bold text-rose-700">₹3.91 Cr</div>
                    <span className="text-xs font-semibold text-rose-700">-18.2% (Divergence)</span>
                  </div>
                  <div className="rounded-xl border border-border bg-surface-muted p-4">
                    <span className="text-[11px] font-medium text-ink-3">EBITDA Margin</span>
                    <div className="mt-1 text-xl font-bold text-ink">14.82%</div>
                    <span className="text-xs font-semibold text-emerald-700">+1.1% vs FY24</span>
                  </div>
                  <div className="rounded-xl border border-border bg-surface-muted p-4">
                    <span className="text-[11px] font-medium text-ink-3">Debtor Days (DSO)</span>
                    <div className="mt-1 text-xl font-bold text-amber-700">74 Days</div>
                    <span className="text-xs font-semibold text-amber-700">+22 days stretch</span>
                  </div>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-900">
                  <strong>Analyst Anomaly Note:</strong> While revenue grew 32.0% in FY25, accounts receivable expanded by 47.1% to ₹9.8 Cr, leading to working capital drag on cash conversion.
                </div>
              </div>
            )}

            {/* STAGE 3: RISK INVESTIGATION */}
            {activeStage === 'risk' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-base font-bold text-ink">Active Risk Signals &amp; Evidence Audit</h4>
                  <p className="text-xs text-ink-3">Systematic hypothesis validation for credit underwriting review.</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start justify-between rounded-xl border border-border bg-surface-muted p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          SUPPORTED
                        </span>
                        <h5 className="text-xs font-bold text-ink">Sales Reconciliation with Bank Credits</h5>
                      </div>
                      <p className="text-xs text-ink-2">
                        Bank account inflows account for 98.4% of declared GST sales. No evidence of unbooked cash or circular trading.
                      </p>
                    </div>
                    <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                  </div>

                  <div className="flex items-start justify-between rounded-xl border border-border bg-surface-muted p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                          UNDER REVIEW
                        </span>
                        <h5 className="text-xs font-bold text-ink">Top Debtor Concentration (₹4.8 Cr)</h5>
                      </div>
                      <p className="text-xs text-ink-2">
                        Single customer accounts for 49% of all outstanding receivables. Customer is a listed FMCG major, but invoice settlement widened to 75 days.
                      </p>
                    </div>
                    <AlertTriangle className="size-5 text-amber-600 shrink-0" />
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 4: ASSESSMENT SUMMARY */}
            {activeStage === 'summary' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-base font-bold text-ink">Credit Committee Memorandum Preview</h4>
                  <p className="text-xs text-ink-3">Explainable synthesis and structured recommendation for loan sanction.</p>
                </div>

                <div className="rounded-xl border border-border bg-surface-muted p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <span className="text-xs font-bold text-ink">Recommended Sanction Decision</span>
                    <span className="rounded bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent">
                      CONDITIONAL APPROVAL (₹15.0 CR)
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed text-ink-2">
                    Borrower shows sustainable operating EBITDA of 14.8% and healthy debt-service headroom (DSCR 1.8x). Working capital stretch is corroborated by legitimate FMCG supply contract extension. Sanction is recommended with covenant requiring pledge of Anchor Client receivables.
                  </p>

                  <div className="rounded-lg border border-accent/20 bg-accent/5 p-3 text-xs">
                    <span className="font-bold text-accent block mb-1">Recommended Follow-up Questions for Interview:</span>
                    <ol className="list-decimal pl-4 space-y-1 text-ink-2">
                      <li>What are the renewal terms for the FMCG Anchor packaging contract expiring Q3?</li>
                      <li>Can management provide unencumbered inventory certificates for raw paper stock?</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
