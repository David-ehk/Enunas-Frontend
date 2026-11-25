import { describe, it, expect } from 'vitest'
import { returnPeriodError, duplicateVariants } from './productWizardValidation'

// Platform policy (25 Nov 2026): the return window is fixed at 14 days. The range check stays so
// the window can be widened again later (out-of-range input was once accepted — 30 Sep 2026 E2E).
describe('returnPeriodError', () => {
  it('accepts 14 days', () => {
    expect(returnPeriodError(14)).toBeNull()
  })

  it('rejects any other window', () => {
    expect(returnPeriodError(0)).not.toBeNull()
    expect(returnPeriodError(13)).not.toBeNull()
    expect(returnPeriodError(15)).not.toBeNull()
    expect(returnPeriodError(30)).not.toBeNull()
  })

  it('rejects negative and non-whole values', () => {
    expect(returnPeriodError(-1)).not.toBeNull()
    expect(returnPeriodError(14.5)).not.toBeNull()
    expect(returnPeriodError(NaN)).not.toBeNull()
  })
})

// Two rows with the same colour + size are the same SKU slot; the wizard accepted them silently.
describe('duplicateVariants', () => {
  it('returns nothing when every colour/size pair is unique', () => {
    expect(duplicateVariants([
      { color: 'BLACK', size: 'S' }, { color: 'BLACK', size: 'M' }, { color: 'RED', size: 'S' },
    ])).toEqual([])
  })

  it('reports each duplicated colour/size pair once', () => {
    expect(duplicateVariants([
      { color: 'BLACK', size: 'S' }, { color: 'BLACK', size: 'S' }, { color: 'BLACK', size: 'S' },
      { color: 'RED', size: 'M' }, { color: 'RED', size: 'M' },
    ])).toEqual([{ color: 'BLACK', size: 'S' }, { color: 'RED', size: 'M' }])
  })
})
