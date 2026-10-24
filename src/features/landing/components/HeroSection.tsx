import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, FileText, BarChart3, Search, CheckCircle } from 'lucide-react'
import { Card3D } from './Card3D'

export function HeroSection() {
  const handleScrollToWorkflow = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const target = document.querySelector('#how-it-works')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
      {/* Background Architectural Grid Lines & Ambient Lighting */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[650px] rounded-full bg-accent/10 blur-[130px]" />
        <div className="absolute top-1/3 right-1/4 size-[400px] rounded-full bg-blue-500/10 blur-[140px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Eyebrow Badge */}
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3.5 py-1.5 text-xs font-semibold text-accent shadow-xs">
            <Sparkles className="size-3.5 text-accent" />
            <span>AI-ASSISTED FINANCIAL DUE DILIGENCE</span>
          </div>

          {/* Main Headline */}
          <h1 className="mt-6 max-w-4xl text-4xl font-extrabold tracking-tight text-ink sm:text-6xl lg:text-7xl">
            See Beyond the <span className="bg-gradient-to-r from-accent to-teal-500 bg-clip-text text-transparent">Numbers.</span>
          </h1>

          {/* Supporting Copy */}
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-2 sm:text-lg">
            Turn financial documents into explainable credit intelligence. Analyze financial performance,
            investigate risk signals, and make better-informed lending decisions with Finlytics.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#how-it-works"
              onClick={handleScrollToWorkflow}
              className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-accent-hover focus-visible:outline-accent"
            >
              Explore Finlytics
              <ArrowRight className="size-4" />
            </a>
            <Link
              to="/auth?mode=login"
              className="inline-flex items-center gap-2 rounded-md border border-border-strong bg-surface px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-surface-muted focus-visible:outline-accent"
            >
              Sign In
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-ink-3 sm:gap-10">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-accent" />
              <span>Multi-Source Document OCR</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4 text-accent" />
              <span>Revenue &amp; Cash Flow Reconciliations</span>
            </div>
            <div className="flex items-center gap-2">
              <Search className="size-4 text-accent" />
              <span>Evidence-Backed Risk Triaging</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="size-4 text-accent" />
              <span>Human-in-the-Loop Explainability</span>
            </div>
          </div>
        </div>

        {/* Central 3D Financial Intelligence Object */}
        <div className="mt-12 sm:mt-16">
          <Card3D />
        </div>
      </div>
    </section>
  )
}
