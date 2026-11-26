import { describe, it, expect } from 'vitest'
import { buildOrderRequest } from './orderRequest'
import type { AddressSelection } from './address'

const items = [{ defaultListingId: '455', quantity: 2 }]
const saved: AddressSelection = { mode: 'saved', id: 5 }

describe('buildOrderRequest', () => {
  it('maps cart lines and a saved address', () => {
    expect(buildOrderRequest(items, saved, '', null)).toEqual({
      items: [{ listingId: 455, quantity: 2 }],
      savedAddressId: 5,
    })
  })

  it('sends the offer alone, never together with a discount code', () => {
    const request = buildOrderRequest(items, saved, 'SAVE20', 123)
    expect(request.upsellOfferId).toBe(123)
    expect('discountCode' in request).toBe(false)
  })

  it('sends the trimmed code when no offer is applied', () => {
    const request = buildOrderRequest(items, saved, '  SAVE20 ', null)
    expect(request.discountCode).toBe('SAVE20')
    expect('upsellOfferId' in request).toBe(false)
  })

  it('sends a one-off address instead of a saved id', () => {
    const address = {
      firstName: 'A', lastName: 'B', street: 'Weg', houseNumber: '1', addressLine2: '',
      postalCode: '10115', city: 'Berlin', country: 'DE', phone: '',
    }
    const request = buildOrderRequest(items, { mode: 'new', address, savedToBook: false }, '', null)
    expect(request.shippingAddress).toMatchObject({ street: 'Weg', city: 'Berlin' })
    expect('savedAddressId' in request).toBe(false)
  })
})
