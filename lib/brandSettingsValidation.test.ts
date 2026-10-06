import { describe, it, expect } from 'vitest'
import { vatIdError, postalCodeError, normalizeSocialHandle, normalizeVatId } from './brandSettingsValidation'

// Brand settings, production E2E run 30 Sep 2026: VAT id "DE12" and return postcode "ABC" were
// saved (200), and typing a handle the way the field's own placeholder shows ("@marke") got a 400.
describe('vatIdError', () => {
  it('accepts an empty value (the field is optional)', () => {
    expect(vatIdError('')).toBeNull()
  })

  it('accepts a German VAT id: DE + 9 digits, spaces tolerated', () => {
    expect(vatIdError('DE123456789')).toBeNull()
    expect(vatIdError('de 123 456 789')).toBeNull()
  })

  it('rejects a truncated German VAT id', () => {
    expect(vatIdError('DE12')).not.toBeNull()
  })

  it('accepts other EU formats and rejects values without a country prefix', () => {
    expect(vatIdError('ATU12345678')).toBeNull()
    expect(vatIdError('123456789')).not.toBeNull()
  })
})

describe('postalCodeError', () => {
  it('requires five digits for Germany', () => {
    expect(postalCodeError('80331', 'DE')).toBeNull()
    expect(postalCodeError('ABC', 'DE')).not.toBeNull()
    expect(postalCodeError('8033', 'DE')).not.toBeNull()
  })

  it('is lenient but not empty-of-digits for other countries', () => {
    expect(postalCodeError('1010', 'AT')).toBeNull()
    expect(postalCodeError('SW1A 1AA', 'GB')).toBeNull()
    expect(postalCodeError('!!', 'AT')).not.toBeNull()
  })
})

describe('normalizeSocialHandle', () => {
  it('strips a leading @ and surrounding spaces', () => {
    expect(normalizeSocialHandle(' @marke ')).toBe('marke')
    expect(normalizeSocialHandle('marke')).toBe('marke')
    expect(normalizeSocialHandle('')).toBe('')
  })
})

// One normalisation for both the check and the save. The first Settings version stripped the
// letter "s" instead of whitespace (/s+/), which would mangle e.g. a Swedish "SE…" id.
describe('normalizeVatId', () => {
  it('removes whitespace and uppercases, leaving letters intact', () => {
    expect(normalizeVatId(' de 123 456 789 ')).toBe('DE123456789')
    expect(normalizeVatId('se556677889901')).toBe('SE556677889901')
  })
})
