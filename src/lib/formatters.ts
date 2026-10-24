import type { MetricUnit } from '@/types/common'

const MINUS = '−'

export function formatCurrency(value: number, currency = 'INR', opts: { compact?: boolean } = {}): string {
  const compact = opts.compact ?? true
  const abs = Math.abs(value)
  let body: string
  if (currency === 'INR' && compact) {
    // Indian numbering: Cr / L
    if (abs >= 1e7) body = `${(abs / 1e7).toFixed(2)} Cr`
    else if (abs >= 1e5) body = `${(abs / 1e5).toFixed(2)} L`
    else body = abs.toLocaleString('en-IN', { maximumFractionDigits: 0 })
    body = `${symbol(currency)}${body}`
  } else {
    body = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      notation: compact ? 'compact' : 'standard',
      maximumFractionDigits: compact ? 2 : 0,
    }).format(abs)
  }
  return value < 0 ? `${MINUS}${body}` : body
}

function symbol(currency: string): string {
  return currency === 'INR' ? '₹' : `${currency} `
}

export function formatPercent(value: number, digits = 1, signed = false): string {
  const sign = value < 0 ? MINUS : signed && value > 0 ? '+' : ''
  return `${sign}${Math.abs(value).toFixed(digits)}%`
}

export function formatRatio(value: number, digits = 2): string {
  return `${value < 0 ? MINUS : ''}${Math.abs(value).toFixed(digits)}x`
}

export function formatMetricValue(value: number | null, unit: MetricUnit, currency = 'INR', signed = false): string {
  if (value === null) return '—'
  switch (unit) {
    case 'currency':
      return formatCurrency(value, currency)
    case 'percent':
      return formatPercent(value, 1, signed)
    case 'ratio':
      return formatRatio(value)
    case 'days':
      return `${Math.round(value)} days`
  }
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return `${formatDate(iso)}, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
}

export function formatRelative(iso: string, now = Date.now()): string {
  const diff = now - new Date(iso).getTime()
  const min = Math.round(diff / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min} min ago`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr} h ago`
  const day = Math.round(hr / 24)
  if (day < 30) return `${day} d ago`
  return formatDate(iso)
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
