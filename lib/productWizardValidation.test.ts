import { describe, it, expect } from 'vitest'
import { returnPeriodError, duplicateVariants } from './productWizardValidation'

// The wizard's return-period field is capped at 30 days (the input's max), but typing 31 was
// accepted and submitted — found in the 30 Sep 2026 production E2E run.
describe('returnPeriodError', () => {
  it('accepts 0, 14 and 30 days', () => {
    expect(returnPeriodError(0)).toBeNull()
    expect(returnPeriodError(14)).toBeNull()
    expect(returnPeriodError(30)).toBeNull()
  })

  it('rejects more than 30 days', () => {
    expect(returnPeriodError(31)).not.toBeNull()
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
