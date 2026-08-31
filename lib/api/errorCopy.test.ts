import { describe, it, expect } from 'vitest'
import { germanErrorMessage } from './errorCopy'

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

  it('falls back to generic German when the body carried no message', () => {
    expect(germanErrorMessage(418, undefined)).toBe('Ein Fehler ist aufgetreten.')
  })
})
