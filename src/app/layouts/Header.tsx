import { useState, type FormEvent } from 'react'
import { Link, useMatches, useNavigate } from 'react-router-dom'
import { ChevronRight, LogOut, Menu, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useProfile } from '@/features/settings/hooks/useProfile'
import { initials } from '@/lib/utils'

export interface RouteHandle {
  crumb?: (params: Record<string, string | undefined>) => string
  crumbs?: { label: string; to?: string }[]
}

export function Header({ onOpenDrawer }: { onOpenDrawer: () => void }) {
  const matches = useMatches()
  const navigate = useNavigate()
  const { profile } = useProfile()
  const { logout } = useAuth()
  const [q, setQ] = useState('')

  const last = matches[matches.length - 1]
  const handle = last?.handle as RouteHandle | undefined
  const dynamic = handle?.crumb?.(last?.params ?? {})
  const crumbs = [...(handle?.crumbs ?? []), ...(dynamic ? [{ label: dynamic, to: undefined }] : [])]

  const submit = (e: FormEvent) => {
    e.preventDefault()
    navigate(q.trim() ? `/assessments?q=${encodeURIComponent(q.trim())}` : '/assessments')
  }

  const handleSignOut = () => {
    logout()
    navigate('/auth?mode=login')
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface px-4 sm:px-6">
      <button type="button" onClick={onOpenDrawer} aria-label="Open navigation" className="rounded-md p-1.5 text-ink-2 hover:bg-neutral-soft lg:hidden">
        <Menu className="size-5" aria-hidden />
      </button>

      <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-sm sm:flex">
        {crumbs.map((c, i) => (
          <span key={c.label} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="size-3.5 text-ink-3" aria-hidden />}
            {c.to ? (
              <Link to={c.to} className="text-ink-3 hover:text-ink">
                {c.label}
              </Link>
            ) : (
              <span className="font-medium text-ink" aria-current="page">
                {c.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      <form role="search" onSubmit={submit} className="ml-auto hidden w-64 md:block">
        <label htmlFor="global-search" className="sr-only">
          Search assessments
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-ink-3" aria-hidden />
          <input
            id="global-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search assessments"
            className="h-9 w-full rounded-md border border-border-strong bg-surface-muted pl-8 pr-3 text-sm placeholder:text-ink-3 focus-visible:bg-surface"
          />
        </div>
      </form>

      <Button variant="primary" onClick={() => navigate('/assessments/new')} className="ml-auto md:ml-0">
        <Plus className="size-4" aria-hidden />
        <span className="hidden sm:inline">New Assessment</span>
        <span className="sm:hidden">New</span>
      </Button>

      <div className="flex items-center gap-1.5">
        <Link
          to="/settings"
          aria-label={`Profile and settings for ${profile.name}`}
          className="flex size-8 items-center justify-center rounded-full bg-nav text-xs font-semibold text-white hover:bg-nav-active"
          title={`${profile.name} (${profile.role || 'Credit Underwriter'})`}
        >
          {initials(profile.name) || '?'}
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          aria-label="Sign out / Switch account"
          title="Sign out / Switch account"
          className="rounded p-1.5 text-ink-3 transition-colors hover:bg-neutral-soft hover:text-ink"
        >
          <LogOut className="size-4" aria-hidden />
        </button>
      </div>
    </header>
  )
}
