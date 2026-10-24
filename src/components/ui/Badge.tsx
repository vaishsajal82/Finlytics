import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type Tone = 'neutral' | 'high' | 'medium' | 'low' | 'info' | 'accent'

const tones: Record<Tone, string> = {
  neutral: 'bg-neutral-soft text-ink-2 border-border',
  high: 'bg-risk-high-soft text-risk-high border-[#f5c2bd]',
  medium: 'bg-risk-med-soft text-risk-med border-[#f3d98b]',
  low: 'bg-risk-low-soft text-risk-low border-[#bfe3c9]',
  info: 'bg-info-soft text-info border-[#c5d5fb]',
  accent: 'bg-accent-soft text-accent-ink border-[#bfe0db]',
}

export function Badge({ tone = 'neutral', children, className, title }: { tone?: Tone; children: ReactNode; className?: string; title?: string }) {
  return (
    <span title={title} className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-sm border px-1.5 py-0.5 text-xs font-medium leading-4', tones[tone], className)}>
      {children}
    </span>
  )
}
