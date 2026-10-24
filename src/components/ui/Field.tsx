import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface FieldShellProps {
  label: string
  error?: string
  hint?: string
  optional?: boolean
  id: string
  children: ReactNode
}

function FieldShell({ label, error, hint, optional, id, children }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-ink-2">
        {label}
        {optional && <span className="ml-1 font-normal text-ink-3">(optional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-err`} role="alert" className="text-xs text-risk-high">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-ink-3">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

const control =
  'w-full rounded-md border bg-surface px-3 text-sm text-ink placeholder:text-ink-3 transition-colors focus-visible:outline-2 focus-visible:outline-accent disabled:bg-surface-muted'

interface BaseProps {
  label: string
  error?: string
  hint?: string
  optional?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & BaseProps>(function Input(
  { label, error, hint, optional, className, id, ...rest },
  ref,
) {
  const auto = useId()
  const fid = id ?? auto
  return (
    <FieldShell label={label} error={error} hint={hint} optional={optional} id={fid}>
      <input
        ref={ref}
        id={fid}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fid}-err` : hint ? `${fid}-hint` : undefined}
        className={cn(control, 'h-9', error ? 'border-risk-high' : 'border-border-strong', className)}
        {...rest}
      />
    </FieldShell>
  )
})

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & BaseProps>(function Textarea(
  { label, error, hint, optional, className, id, ...rest },
  ref,
) {
  const auto = useId()
  const fid = id ?? auto
  return (
    <FieldShell label={label} error={error} hint={hint} optional={optional} id={fid}>
      <textarea
        ref={ref}
        id={fid}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fid}-err` : hint ? `${fid}-hint` : undefined}
        className={cn(control, 'min-h-20 py-2', error ? 'border-risk-high' : 'border-border-strong', className)}
        {...rest}
      />
    </FieldShell>
  )
})

export interface Option {
  value: string
  label: string
}

/** Compact select with a visible label (or aria-label when `hideLabel`). */
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: Option[]; hideLabel?: boolean }>(function Select(
  { label, options, hideLabel, className, id, ...rest },
  ref,
) {
  const auto = useId()
  const fid = id ?? auto
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fid} className={hideLabel ? 'sr-only' : 'text-[13px] font-medium text-ink-2'}>
        {label}
      </label>
      <select ref={ref} id={fid} className={cn(control, 'h-9 border-border-strong pr-8', className)} {...rest}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
})
