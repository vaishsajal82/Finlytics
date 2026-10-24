import { AlertCircle, Check } from 'lucide-react'
import { StageStatusLabel } from '@/components/data-display/badges'
import { cn } from '@/lib/utils'
import { STAGES, type Assessment, type StageKey } from '../types'

export function StageStepper({ assessment, selected, onSelect }: { assessment: Assessment; selected: StageKey; onSelect: (k: StageKey) => void }) {
  return (
    <nav aria-label="Assessment stages">
      <ol className="flex gap-2 overflow-x-auto pb-1 scroll-thin lg:flex-col lg:gap-0.5 lg:overflow-visible lg:pb-0">
        {STAGES.map((s, i) => {
          const status = assessment.stages[s.key]
          const isSel = s.key === selected
          return (
            <li key={s.key} className="shrink-0 lg:shrink">
              <button
                type="button"
                onClick={() => onSelect(s.key)}
                aria-current={isSel ? 'step' : undefined}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left transition-colors',
                  isSel ? 'border-accent bg-accent-soft' : 'border-transparent hover:bg-neutral-soft',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                    status === 'completed' && 'border-risk-low bg-risk-low text-white',
                    status === 'active' && 'border-accent bg-surface text-accent',
                    status === 'failed' && 'border-risk-high bg-risk-high text-white',
                    status === 'pending' && 'border-border-strong bg-surface text-ink-3',
                  )}
                >
                  {status === 'completed' ? <Check className="size-3.5" /> : status === 'failed' ? <AlertCircle className="size-3.5" /> : i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block whitespace-nowrap text-[13px] font-medium text-ink lg:whitespace-normal">{s.label}</span>
                  <span className={cn('block text-xs', status === 'failed' ? 'text-risk-high' : 'text-ink-3')}>
                    <StageStatusLabel status={status} />
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
