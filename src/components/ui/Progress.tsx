import { cn } from '@/lib/utils'

export function Progress({ value, label, tone = 'accent', className }: { value: number; label: string; tone?: 'accent' | 'high'; className?: string }) {
  const v = Math.max(0, Math.min(100, value))
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={v}
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-neutral-soft', className)}
    >
      <div className={cn('h-full rounded-full transition-[width] duration-300', tone === 'high' ? 'bg-risk-high' : 'bg-accent')} style={{ width: `${v}%` }} />
    </div>
  )
}
