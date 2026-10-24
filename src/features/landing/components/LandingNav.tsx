import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Menu, X, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Platform', href: '#capabilities' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Capabilities', href: '#capabilities' },
    { label: 'Risk Graph', href: '#risk-graph' },
    { label: 'Trust & Transparency', href: '#trust' },
    { label: 'Product Preview', href: '#preview' },
  ]

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-surface/90 backdrop-blur-md border-b border-border shadow-sm py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 transition-transform hover:opacity-90 focus-visible:outline-accent"
          aria-label="Finlytics Home"
        >
          <div className="flex size-9 items-center justify-center rounded-lg bg-nav shadow-sm">
            <svg
              aria-hidden="true"
              className="shrink-0"
              height="20"
              viewBox="0 0 32 32"
              width="20"
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
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-ink">Finlytics</span>
            <span className="hidden text-[10px] font-medium uppercase tracking-wider text-ink-3 sm:block">
              Credit Intelligence
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Landing Page Navigation">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleScrollTo(e, link.href)}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-ink-2 transition-colors hover:bg-neutral-soft hover:text-ink focus-visible:outline-accent"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden items-center gap-3 sm:flex">
          {isAuthenticated && user ? (
            <button
              type="button"
              onClick={() => navigate('/overview')}
              className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-accent-hover"
            >
              Open Workspace
              <ArrowRight className="size-3.5" />
            </button>
          ) : (
            <>
              <Link
                to="/auth?mode=login"
                className="rounded-md px-3 py-1.5 text-xs font-medium text-ink-2 transition-colors hover:text-ink"
              >
                Sign In
              </Link>
              <Link
                to="/auth?mode=register"
                className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-accent-hover"
              >
                Get Started
                <ArrowRight className="size-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex sm:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="rounded-md p-2 text-ink-2 hover:bg-neutral-soft hover:text-ink"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-surface px-4 py-5 shadow-lg sm:hidden">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleScrollTo(e, link.href)}
                className="rounded-md px-3 py-2 text-sm font-medium text-ink-2 hover:bg-neutral-soft hover:text-ink"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2 pt-4 border-t border-border">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  navigate('/overview')
                }}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-accent py-2.5 text-xs font-semibold text-white"
              >
                Open Workspace &rarr;
              </button>
            ) : (
              <>
                <Link
                  to="/auth?mode=login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center rounded-md border border-border py-2 text-xs font-medium text-ink"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?mode=register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-md bg-accent py-2 text-xs font-semibold text-white"
                >
                  Get Started &rarr;
                </Link>
              </>
            )}
          </div>
          <div className="mt-3 flex items-center justify-center gap-1 text-[11px] text-ink-3">
            <ShieldCheck className="size-3 text-accent" />
            <span>Enterprise Commercial Credit Intelligence</span>
          </div>
        </div>
      )}
    </header>
  )
}
