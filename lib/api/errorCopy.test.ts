import { describe, it, expect } from 'vitest'
import { germanErrorMessage, errorRemedies, couponErrorMessage, returnRequestErrorMessage } from './errorCopy'

describe('germanErrorMessage', () => {
  it('translates infra statuses instead of echoing the English backend string', () => {
    expect(germanErrorMessage(401, 'Authentication required')).toMatch(/Sitzung/)
    expect(germanErrorMessage(403, 'Access denied')).toMatch(/Berechtigung/)
    expect(germanErrorMessage(415, 'Content type not supported')).toMatch(/Format/)
    expect(germanErrorMessage(406, 'Not acceptable')).toMatch(/nicht unterstützt/)
    expect(germanErrorMessage(405, 'Method not allowed')).toMatch(/nicht möglich/)
  })

  it('translates the concurrent-edit 409 but keeps a domain 409 verbatim', () => {
    expect(germanErrorMessage(409, 'The record was modified concurrently — please reload and retry'))
      .toMatch(/Seite neu/)
    expect(germanErrorMessage(409, 'Product 41 still has listings. Remove them first.'))
      .toBe('Product 41 still has listings. Remove them first.')
  })

  it('keeps a 400 enum hint verbatim — it names the accepted values', () => {
    const msg = "Invalid value 'NOT_A_STATUS' for 'status'. Allowed values: [PENDING, PAID]"
    expect(germanErrorMessage(400, msg)).toBe(msg)
  })

  it('gives 5xx a single German message', () => {
    expect(germanErrorMessage(500, 'An unexpected error occurred')).toMatch(/Serverfehler/)
    expect(germanErrorMessage(503, null)).toMatch(/Serverfehler/)
  })

  it('prefers a known code over both the status copy and the English message', () => {
    expect(germanErrorMessage(409, 'Product 41 still has listings.', 'PRODUCT_HAS_LISTINGS'))
      .toMatch(/Listings/)
    expect(germanErrorMessage(409, 'Product 41 has been ordered.', 'PRODUCT_HAS_ORDERS'))
      .toMatch(/bereits bestellt/)
    expect(germanErrorMessage(409, 'Referenced elsewhere.', 'PRODUCT_REFERENCED'))
      .toMatch(/Support/)
  })

  it('treats an unknown code as a generic failure rather than echoing the message', () => {
    const msg = 'Product 41 exploded in a novel way'
    expect(germanErrorMessage(409, msg, 'PRODUCT_SOMETHING_NEW')).not.toBe(msg)
    expect(germanErrorMessage(409, msg, 'PRODUCT_SOMETHING_NEW')).toBe('Ein Fehler ist aufgetreten.')
  })

  it('offers only the remedies the code actually allows', () => {
    expect(errorRemedies('PRODUCT_HAS_LISTINGS')).toEqual(['delete-listings', 'archive'])
    // Ordered products can never be deleted, so the listings remedy must not be offered.
    expect(errorRemedies('PRODUCT_HAS_ORDERS')).toEqual(['archive'])
    expect(errorRemedies('PRODUCT_REFERENCED')).toEqual(['support'])
    expect(errorRemedies('PRODUCT_SOMETHING_NEW')).toEqual([])
    expect(errorRemedies(undefined)).toEqual([])
  })

  it('falls back to generic German when the body carried no message', () => {
    expect(germanErrorMessage(418, undefined)).toBe('Ein Fehler ist aufgetreten.')
  })
})

// Checkout, 30 Sep 2026 E2E run: an unknown Gutscheincode showed the backend's raw English
// message. The customer-facing text must be German; server errors keep the generic server copy.
describe('couponErrorMessage', () => {
  it('explains a rejected code in German for 4xx responses', () => {
    for (const status of [400, 404, 409, 422]) {
      expect(couponErrorMessage(status)).toBe('Dieser Gutscheincode ist ungültig oder abgelaufen.')
    }
  })

  it('does not blame the code for a server error or a network failure', () => {
    expect(couponErrorMessage(500)).toBe('Gutscheincode konnte nicht geprüft werden.')
    expect(couponErrorMessage(undefined)).toBe('Gutscheincode konnte nicht geprüft werden.')
  })
})

// POST /orders/{id}/return with partial quantities (contract of 7 Oct 2026). The backend message is
// English; the customer sees German copy keyed on the status.
describe('returnRequestErrorMessage', () => {
  it('explains a quantity above what is left (400)', () => {
    expect(returnRequestErrorMessage(400)).toBe('Diese Menge kann nicht mehr zurückgegeben werden. Bitte lade die Seite neu.')
  })

  it('explains why a return is not possible right now (409)', () => {
    expect(returnRequestErrorMessage(409)).toContain('Rückgabefrist')
    expect(returnRequestErrorMessage(409)).toContain('noch bearbeitet')
  })

  it('falls back to a generic message', () => {
    expect(returnRequestErrorMessage(500)).toBe('Retoure konnte nicht beantragt werden. Bitte versuche es später erneut.')
  })
})
