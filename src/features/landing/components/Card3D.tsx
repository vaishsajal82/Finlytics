import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Shield,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  FileCheck2,
  CheckCircle2,
  Building,
  Layers,
  ArrowUpRight,
} from 'lucide-react'

export function Card3D() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const [sheen, setSheen] = useState({ x: 50, y: 50, opacity: 0.15 })
  const [isHovered, setIsHovered] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
    return false
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Restrained, physical tilt angles (-12 to +12 deg max)
    const rotateX = ((centerY - y) / centerY) * 10
    const rotateY = ((x - centerX) / centerX) * 12

    setRotate({ x: rotateX, y: rotateY })
    setSheen({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.35,
    })
  }, [reducedMotion])

  const handleMouseEnter = () => setIsHovered(true)
  const handleMouseLeave = () => {
    setIsHovered(false)
    setRotate({ x: 0, y: 0 })
    setSheen({ x: 50, y: 50, opacity: 0.15 })
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative mx-auto flex w-full max-w-[620px] items-center justify-center p-4 py-8 sm:p-8"
      style={{ perspective: '1400px' }}
    >
      {/* 3D Transform Pivot Stage */}
      <div
        className="relative w-full transition-transform duration-300 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        }}
      >
        {/* Subtle Ambient Depth Shadows */}
        <div
          className="pointer-events-none absolute -inset-4 rounded-3xl bg-accent/20 blur-2xl transition-opacity duration-500"
          style={{
            transform: 'translateZ(-80px)',
            opacity: isHovered ? 0.45 : 0.25,
          }}
        />

        {/* ============================================================== */}
        {/* MAIN 3D METALLIC FINANCIAL INTELLIGENCE CARD                   */}
        {/* ============================================================== */}
        <div
          className="relative overflow-hidden rounded-2xl border border-slate-700/70 bg-gradient-to-br from-[#0c182a] via-[#0f2138] to-[#081220] p-6 text-slate-100 shadow-2xl backdrop-blur-xl transition-all duration-300 sm:p-7"
          style={{
            transform: 'translateZ(0px)',
            boxShadow: '0 25px 60px -15px rgba(10, 20, 36, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Dynamic Specular Sheen layer */}
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle 350px at ${sheen.x}% ${sheen.y}%, rgba(45, 212, 191, 0.25), transparent 70%)`,
              opacity: sheen.opacity,
            }}
          />

          {/* Fine Brushed Metal / Microgrid Pattern Overlay */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.04] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Card Header: Holographic chip + Finlytics Brand */}
          <div className="relative z-10 flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              {/* Gold/Emerald Hologram Chip */}
              <div className="relative flex size-10 items-center justify-center rounded-lg border border-teal-400/40 bg-gradient-to-tr from-teal-950 via-slate-900 to-teal-900/60 shadow-inner">
                <div className="size-5 rounded border border-teal-400/60 bg-teal-400/20" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-300/30 to-transparent animate-sheen" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold tracking-widest text-teal-400 uppercase">Finlytics</span>
                  <span className="rounded bg-teal-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-teal-300 border border-teal-500/20">
                    DOSSIER
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">CREDIT DUE-DILIGENCE DOSSIER</p>
              </div>
            </div>

            <div className="text-right">
              <span className="font-mono text-xs font-semibold text-slate-300">ASM-1001</span>
              <p className="text-[9px] text-slate-500">FY2024-25 EVALUATION</p>
            </div>
          </div>

          {/* Fictional Commercial Profile */}
          <div className="relative z-10 mt-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Building className="size-4 text-teal-400" />
                <h3 className="text-base font-bold text-white sm:text-lg">Meridian Packaging Pvt Ltd</h3>
              </div>
              <p className="mt-0.5 text-xs text-slate-400">
                Packaging &amp; Industrial Corrugated Products · Mumbai, MH
              </p>
            </div>

            {/* Composite Health Indicator */}
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-1 text-xs font-bold text-teal-300 shadow-sm">
                <Shield className="size-3.5 text-teal-400" />
                <span>Score: 78 / 100</span>
              </div>
              <span className="mt-1 text-[9px] font-medium text-slate-400 uppercase tracking-wide">
                Grade: Moderate Risk
              </span>
            </div>
          </div>

          {/* Revenue vs Cash Flow Interactive Sparkline Visual */}
          <div className="relative z-10 mt-5 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-[10px] uppercase text-slate-400">Reported Revenue</span>
                  <div className="flex items-center gap-1 font-semibold text-white">
                    <span>₹48.2 Cr</span>
                    <span className="flex items-center text-[10px] text-emerald-400">
                      <TrendingUp className="size-3" /> +32%
                    </span>
                  </div>
                </div>
                <div className="h-6 w-px bg-slate-800" />
                <div>
                  <span className="text-[10px] uppercase text-slate-400">Operating Cash Flow</span>
                  <div className="flex items-center gap-1 font-semibold text-white">
                    <span>₹3.9 Cr</span>
                    <span className="flex items-center text-[10px] text-rose-400">
                      <TrendingDown className="size-3" /> -18%
                    </span>
                  </div>
                </div>
              </div>

              <span className="hidden rounded bg-slate-800/80 px-2 py-0.5 text-[9px] font-mono text-teal-300 sm:inline-block">
                Divergence: +50% Gap
              </span>
            </div>

            {/* SVG Divergence Chart */}
            <div className="mt-2.5 h-14 w-full">
              <svg className="size-full overflow-visible" viewBox="0 0 400 60" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="revenueGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="ocfGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                <line x1="0" y1="15" x2="400" y2="15" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="0" y1="45" x2="400" y2="45" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />

                {/* Revenue Curve (Rising) */}
                <path
                  d="M 0,48 Q 100,42 200,32 T 400,12"
                  fill="none"
                  stroke="#2dd4bf"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="400" cy="12" r="3.5" fill="#2dd4bf" className="animate-pulse" />

                {/* Operating Cash Flow Curve (Diverging downward) */}
                <path
                  d="M 0,38 Q 100,34 200,42 T 400,52"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                  strokeLinecap="round"
                />
                <circle cx="400" cy="52" r="3" fill="#f43f5e" />
              </svg>
            </div>
          </div>

          {/* Risk Signal Alert & Verification Status */}
          <div className="relative z-10 mt-4 space-y-2 text-xs">
            {/* Working Capital Divergence Risk */}
            <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-amber-300">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-3.5 shrink-0 text-amber-400" />
                <span className="font-medium text-[11px] sm:text-xs">
                  Working capital divergence: Receivables grew +47% vs sales +32%
                </span>
              </div>
              <span className="shrink-0 text-[10px] font-bold text-amber-400">DSO: 74d</span>
            </div>

            {/* Document Verification Matrix */}
            <div className="flex items-center justify-between rounded-lg border border-teal-500/20 bg-teal-950/30 px-3 py-1.5 text-[11px] text-teal-300">
              <div className="flex items-center gap-1.5">
                <FileCheck2 className="size-3.5 text-teal-400" />
                <span>Audited Statements (3 Yrs) · 36M Bank OCR 99.4%</span>
              </div>
              <div className="flex items-center gap-1 font-semibold text-emerald-400">
                <CheckCircle2 className="size-3" />
                <span>Verified</span>
              </div>
            </div>
          </div>

          {/* Card Footer: Disclaimer Badge */}
          <div className="relative z-10 mt-4 flex items-center justify-between pt-3 border-t border-slate-800 text-[10px] text-slate-400">
            <span>Evidence: 3/4 Core Claims Verified · 1 Under Review</span>
            <span className="font-mono text-[9px] text-slate-400">SYNTHETIC DEMO ASSESSMENT</span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SURROUNDING CONNECTED FLOATING 3D PANELS                       */}
        {/* ============================================================== */}

        {/* 1. Top-Left Floating Panel: Financial Overview */}
        <div
          className="absolute -top-6 -left-4 hidden w-48 rounded-xl border border-slate-800/90 bg-slate-900/90 p-3 shadow-xl backdrop-blur-md transition-all duration-300 sm:block animate-float-subtle"
          style={{
            transform: 'translateZ(65px)',
          }}
        >
          <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-teal-400 uppercase">
            <Layers className="size-3" />
            <span>Financial Overview</span>
          </div>
          <div className="mt-1.5 flex items-baseline justify-between text-xs">
            <span className="text-slate-400">EBITDA Margin</span>
            <span className="font-bold text-white">14.8%</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between text-xs">
            <span className="text-slate-400">Debt / Equity</span>
            <span className="font-bold text-emerald-400">1.2x (Healthy)</span>
          </div>
        </div>

        {/* 2. Top-Right Floating Panel: Cash Flow Trend */}
        <div
          className="absolute -top-8 -right-4 hidden w-52 rounded-xl border border-slate-800/90 bg-slate-900/90 p-3 shadow-xl backdrop-blur-md transition-all duration-300 sm:block animate-float-reverse"
          style={{
            transform: 'translateZ(85px)',
          }}
        >
          <div className="flex items-center justify-between text-[10px] font-semibold text-teal-400 uppercase">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="size-3" />
              <span>Cash Flow Trend</span>
            </div>
            <ArrowUpRight className="size-3 text-slate-500" />
          </div>
          <p className="mt-1 text-[11px] font-medium text-slate-200">
            Operating Cash Conversion: <span className="font-bold text-rose-400">28.4%</span>
          </p>
          <span className="mt-0.5 inline-block text-[9px] text-slate-400">
            Diverges from FY23-24 trend line
          </span>
        </div>

        {/* 3. Bottom-Left Floating Panel: Risk Signals */}
        <div
          className="absolute -bottom-6 -left-6 hidden w-52 rounded-xl border border-amber-500/40 bg-slate-900/95 p-3 shadow-xl backdrop-blur-md transition-all duration-300 sm:block animate-float-reverse"
          style={{
            transform: 'translateZ(75px)',
          }}
        >
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-400 uppercase">
            <AlertTriangle className="size-3 text-amber-400" />
            <span>Key Risk Signal</span>
          </div>
          <p className="mt-1 text-[11px] leading-snug font-medium text-slate-200">
            Debtor concentration with top 2 buyers rose to 46%
          </p>
          <span className="mt-1 block text-[9px] text-amber-400/90">Requires review of GST e-invoices</span>
        </div>

        {/* 4. Bottom-Right Floating Panel: Evidence Verified */}
        <div
          className="absolute -bottom-7 -right-6 hidden w-48 rounded-xl border border-teal-500/40 bg-slate-900/95 p-3 shadow-xl backdrop-blur-md transition-all duration-300 sm:block animate-float-subtle"
          style={{
            transform: 'translateZ(90px)',
          }}
        >
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-teal-300 uppercase">
            <CheckCircle2 className="size-3 text-emerald-400" />
            <span>Evidence Verified</span>
          </div>
          <div className="mt-1 text-[11px] font-medium text-slate-200">
            MCA Filings &amp; GST Returns
          </div>
          <span className="mt-0.5 block text-[9px] text-emerald-400">
            Zero statutory defaults on record
          </span>
        </div>
      </div>
    </div>
  )
}
