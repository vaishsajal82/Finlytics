import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-lg border border-border bg-surface shadow-card', className)} {...rest} />
}

export function CardHeader({ title, description, actions, as: Tag = 'h2' }: { title: string; description?: string; actions?: ReactNode; as?: 'h2' | 'h3' }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3">
      <div>
        <Tag className="text-sm font-semibold text-ink">{title}</Tag>
        {description && <p className="mt-0.5 text-xs text-ink-3">{description}</p>}
      </div>
      {actions}
    </div>
  )
}
