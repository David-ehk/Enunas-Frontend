import { describe, it, expect } from 'vitest'
import { shippingAddressLines } from './orderAddress'

// Shipping address of order ENS-2026-1TWSCJ exactly as GET /orders/27 returned it on 30 Sep 2026.
// Every order view read only `fullName` / `street`, so the name (confirmation page) and the house
// number + address supplement (everywhere — including the brand's fulfilment view it ships from)
// were missing.
const real = {
  firstName: 'Erika', lastName: 'Mustermann',
  street: 'Marienplatz', houseNumber: '1', addressLine2: 'E2E Phase D',
  postalCode: '80331', city: 'München', country: 'DE', phone: null,
}

describe('shippingAddressLines', () => {
  it('renders name, street with house number, supplement and postcode + city', () => {
    expect(shippingAddressLines(real)).toEqual([
      'Erika Mustermann', 'Marienplatz 1', 'E2E Phase D', '80331 München',
    ])
  })

  it('prefers fullName when the backend sends one', () => {
    expect(shippingAddressLines({ ...real, fullName: 'Dr. Erika Mustermann' })[0]).toBe('Dr. Erika Mustermann')
  })

  it('accepts the legacy street2 field for the supplement', () => {
    expect(shippingAddressLines({ ...real, addressLine2: null, street2: 'Hinterhaus' })).toContain('Hinterhaus')
  })

  it('leaves out lines with no data instead of rendering blanks', () => {
    expect(shippingAddressLines({ street: 'Marienplatz', city: 'München' })).toEqual(['Marienplatz', 'München'])
  })
})
