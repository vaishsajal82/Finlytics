import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import type { SortOrder } from '@/types/common'
import { cn } from '@/lib/utils'

/** Horizontal scroll container keeps wide tables usable on small screens. */
export function Table({ children, className, caption }: { children: ReactNode; className?: string; caption?: string }) {
  return (
    <div className="relative overflow-x-auto scroll-thin">
      <table className={cn('w-full border-collapse text-left text-sm', className)}>
        {caption && <caption className="sr-only">{caption}</caption>}
        {children}
      </table>
    </div>
  )
}

export const THead = ({ children }: { children: ReactNode }) => <thead className="border-b border-border bg-surface-muted">{children}</thead>

export function Th({ className, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th scope="col" className={cn('px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink-3', className)} {...rest} />
}

interface SortThProps {
  label: string
  active: boolean
  order: SortOrder
  onSort: () => void
  className?: string
}

export function SortTh({ label, active, order, onSort, className }: SortThProps) {
  const Icon = !active ? ChevronsUpDown : order === 'asc' ? ArrowUp : ArrowDown
  return (
    <th scope="col" aria-sort={active ? (order === 'asc' ? 'ascending' : 'descending') : 'none'} className={cn('px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink-3', className)}>
      <button type="button" onClick={onSort} className="inline-flex items-center gap-1 uppercase tracking-wide hover:text-ink">
        {label}
        <Icon className={cn('size-3.5', active ? 'text-ink' : 'text-ink-3/70')} aria-hidden />
      </button>
    </th>
  )
}

export const Tr = ({ className, ...rest }: HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn('border-b border-border last:border-0', className)} {...rest} />
)
export const Td = ({ className, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) => <td className={cn('px-4 py-3 align-middle', className)} {...rest} />
