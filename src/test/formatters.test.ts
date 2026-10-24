import { describe, expect, it } from 'vitest'
import { formatCurrency, formatMetricValue, formatPercent } from '@/lib/formatters'

describe('formatters', () => {
  it('formats INR in lakh/crore and keeps the sign', () => {
    expect(formatCurrency(466_000_000)).toBe('₹46.60 Cr')
    expect(formatCurrency(-250_000)).toBe('−₹2.50 L')
  })
  it('does not hardcode currency', () => {
    expect(formatCurrency(1_500_000, 'USD')).toBe('$1.50M')
  })
  it('formats percents with explicit sign when asked', () => {
    expect(formatPercent(32, 1, true)).toBe('+32.0%')
    expect(formatPercent(-18)).toBe('−18.0%')
  })
  it('shows a dash for missing values instead of inventing one', () => {
    expect(formatMetricValue(null, 'ratio')).toBe('—')
  })
})
