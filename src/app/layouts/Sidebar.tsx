import { NavLink } from 'react-router-dom'
import { FileText, LayoutDashboard, ClipboardList, FolderOpen, ShieldAlert, Settings, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/assessments', label: 'Assessments', icon: ClipboardList },
  { to: '/documents', label: 'Documents', icon: FolderOpen },
  { to: '/risk', label: 'Risk Analysis', icon: ShieldAlert },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const

interface Props {
  collapsed: boolean
  onToggleCollapsed: () => void
  /** Mobile drawer state. */
  drawerOpen: boolean
  onCloseDrawer: () => void
}

function Logo({ compact }: { compact: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden className="shrink-0">
        <rect width="32" height="32" rx="7" fill="#1d3352" />
        <path d="M9 22V10h13M9 16h9" stroke="#2dd4bf" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {!compact && <span className="text-[15px] font-semibold tracking-tight text-white">Finlytics</span>}
    </div>
  )
}

function NavList({ compact, onNavigate }: { compact: boolean; onNavigate?: () => void }) {
  return (
    <nav aria-label="Primary" className="flex flex-col gap-0.5 px-2">
      {NAV.map(({ to, label, icon: Icon, ...rest }) => (
        <NavLink
          key={to}
          to={to}
          end={'end' in rest ? rest.end : false}
          onClick={onNavigate}
          title={compact ? label : undefined}
          className={({ isActive }) =>
            cn(
              'flex h-9 items-center gap-3 rounded-md px-2.5 text-sm font-medium transition-colors',
              compact && 'justify-center px-0',
              isActive ? 'bg-nav-active text-nav-text-strong' : 'text-nav-text hover:bg-nav-hover hover:text-nav-text-strong',
            )
          }
        >
          <Icon className="size-[18px] shrink-0" aria-hidden />
          <span className={cn(compact && 'sr-only')}>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export function Sidebar({ collapsed, onToggleCollapsed, drawerOpen, onCloseDrawer }: Props) {
  return (
    <>
      {/* Desktop */}
      <aside className={cn('hidden shrink-0 flex-col bg-nav transition-[width] duration-200 lg:flex', collapsed ? 'w-16' : 'w-60')}>
        <div className={cn('flex h-14 items-center', collapsed ? 'justify-center' : 'px-4')}>
          <Logo compact={collapsed} />
        </div>
        <div className="mt-2 flex-1">
          <NavList compact={collapsed} />
        </div>
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          className="m-2 flex h-9 items-center justify-center gap-2 rounded-md text-sm text-nav-text hover:bg-nav-hover hover:text-white"
        >
          {collapsed ? <PanelLeftOpen className="size-[18px]" aria-hidden /> : <><PanelLeftClose className="size-[18px]" aria-hidden />Collapse</>}
        </button>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 bg-slate-900/50" onClick={onCloseDrawer} aria-hidden />
          <aside className="relative flex h-full w-64 flex-col bg-nav shadow-pop">
            <div className="flex h-14 items-center justify-between px-4">
              <Logo compact={false} />
              <button type="button" onClick={onCloseDrawer} aria-label="Close navigation" className="rounded-md p-1 text-nav-text hover:bg-nav-hover hover:text-white">
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <div className="mt-2">
              <NavList compact={false} onNavigate={onCloseDrawer} />
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
