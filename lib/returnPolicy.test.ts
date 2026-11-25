import { describe, it, expect } from 'vitest'
import { effectiveReturnPeriodDays } from './returnPolicy'

// Platform policy (25 Nov 2026): every product has a 14-day return window, whatever a brand stored.
describe('effectiveReturnPeriodDays', () => {
  it('shows 14 days when a product stored a longer window', () => {
    expect(effectiveReturnPeriodDays(30)).toBe(14)
  })

  it('shows 14 days when a product stored a shorter window', () => {
    expect(effectiveReturnPeriodDays(0)).toBe(14)
  })

  it('shows 14 days when no window is stored', () => {
    expect(effectiveReturnPeriodDays(undefined)).toBe(14)
  })
})
