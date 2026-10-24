import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck, FileCheck, CheckCircle } from 'lucide-react'

export function ConversionSection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32 bg-nav text-white">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-40 -right-40 size-[500px] rounded-full bg-accent/20 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 size-[500px] rounded-full bg-blue-600/15 blur-[140px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Text & CTA */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-3.5 py-1 text-xs font-semibold text-teal-300">
              <ShieldCheck className="size-3.5 text-teal-400" />
              <span>COMMERCIAL CREDIT INTELLIGENCE</span>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Make Every Financial Signal Count.
            </h2>

            <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Bring financial documents, risk investigation, and explainable assessment into one
              connected, defensible underwriting workflow.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/auth?mode=register"
                className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-900/40 transition-all hover:bg-accent-hover focus-visible:outline-teal-400"
              >
                Get Started
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/auth?mode=login"
                className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-teal-400"
              >
                Sign In
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="size-3.5 text-teal-400" />
                <span>Statutory Multi-Source Ingestion</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="size-3.5 text-teal-400" />
                <span>Audit-Ready Dossier Export</span>
              </div>
            </div>
          </div>

          {/* Right Compact Floating 3D Financial Badge Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div
              className="relative w-full max-w-sm rounded-2xl border border-slate-700/80 bg-gradient-to-br from-[#0c182a] via-[#0f2138] to-[#081220] p-6 shadow-2xl backdrop-blur-xl"
              style={{
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-teal-400 animate-pulse" />
                  <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                    Finlytics Executive Dossier
                  </span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">ASM-1001</span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
                  <div className="text-xs font-bold text-white">Meridian Packaging Pvt Ltd</div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Credit Health Index:</span>
                    <span className="font-bold text-teal-300">78 / 100 (Moderate)</span>
                  </div>
                </div>

                <div className="rounded-lg border border-teal-500/30 bg-teal-950/40 p-3 text-[11px] text-teal-200">
                  <div className="flex items-center gap-2 font-semibold">
                    <FileCheck className="size-3.5 text-teal-400" />
                    <span>3 Yrs Financial Statements Verified</span>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-300">
                    EBITDA 14.8% · DSCR 1.8x · Bank credits reconcile with GST returns.
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-center text-[10px] text-slate-400">
                <span>Enterprise Encrypted · Statutory Governance Standard</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
