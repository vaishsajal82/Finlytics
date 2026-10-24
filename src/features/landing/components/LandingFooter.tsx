import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

export function LandingFooter() {
  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <footer className="border-t border-border bg-surface py-12 text-ink">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Info */}
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-nav">
                <svg
                  aria-hidden="true"
                  className="shrink-0"
                  height="18"
                  viewBox="0 0 32 32"
                  width="18"
                >
                  <rect fill="#1d3352" height="32" rx="7" width="32" />
                  <path
                    d="M9 22V10h13M9 16h9"
                    fill="none"
                    stroke="#2dd4bf"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                  />
                </svg>
              </div>
              <span className="text-base font-bold text-ink">Finlytics</span>
            </Link>
            <p className="text-xs text-ink-3 leading-relaxed">
              AI-assisted financial due diligence &amp; credit investigation workspace.
              Turn financial records into explainable, evidence-backed underwriting decisions.
            </p>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink mb-3">Platform</h4>
            <ul className="space-y-2 text-xs text-ink-2">
              <li>
                <a
                  href="#how-it-works"
                  onClick={(e) => handleScrollTo(e, '#how-it-works')}
                  className="hover:text-accent transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#capabilities"
                  onClick={(e) => handleScrollTo(e, '#capabilities')}
                  className="hover:text-accent transition-colors"
                >
                  Capabilities
                </a>
              </li>
              <li>
                <a
                  href="#risk-graph"
                  onClick={(e) => handleScrollTo(e, '#risk-graph')}
                  className="hover:text-accent transition-colors"
                >
                  Risk Investigation Graph
                </a>
              </li>
              <li>
                <a
                  href="#trust"
                  onClick={(e) => handleScrollTo(e, '#trust')}
                  className="hover:text-accent transition-colors"
                >
                  Trust &amp; Transparency
                </a>
              </li>
              <li>
                <a
                  href="#preview"
                  onClick={(e) => handleScrollTo(e, '#preview')}
                  className="hover:text-accent transition-colors"
                >
                  Product Preview
                </a>
              </li>
            </ul>
          </div>

          {/* Underwriter Workspace Access */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink mb-3">Access</h4>
            <ul className="space-y-2 text-xs text-ink-2">
              <li>
                <Link to="/auth?mode=login" className="hover:text-accent transition-colors">
                  Sign In with ID
                </Link>
              </li>
              <li>
                <Link to="/auth?mode=register" className="hover:text-accent transition-colors">
                  Create Analyst Account
                </Link>
              </li>
              <li>
                <Link to="/assessments" className="hover:text-accent transition-colors">
                  Assessments Directory
                </Link>
              </li>
              <li>
                <Link to="/documents" className="hover:text-accent transition-colors">
                  Document Repository
                </Link>
              </li>
            </ul>
          </div>

          {/* Compliance & Disclosures */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink mb-3">Governance</h4>
            <div className="flex items-center gap-2 text-xs font-semibold text-accent mb-2">
              <ShieldCheck className="size-4" />
              <span>Analyst-Centric AI</span>
            </div>
            <p className="text-[11px] text-ink-3 leading-relaxed">
              Finlytics supports human underwriting review and does not automatically approve or reject credit applications, guarantee financing, or replace formal statutory audits.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between border-t border-border pt-6 text-xs text-ink-3 gap-3">
          <p>© {new Date().getFullYear()} Finlytics Intelligence. All rights reserved.</p>
          <p className="text-[11px]">Designed for Defensible Institutional Financial Due Diligence</p>
        </div>
      </div>
    </footer>
  )
}
