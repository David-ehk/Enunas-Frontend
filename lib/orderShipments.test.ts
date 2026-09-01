import { describe, it, expect } from 'vitest'
import { describeShipment } from './orderShipments'

describe('describeShipment', () => {
  it('names the carrier and returns the tracking number when both are present', () => {
    expect(describeShipment({
      brandId: 1, brandName: 'Alpha', status: 'SHIPPED',
      shippedAt: '2026-08-31T17:04:12', carrier: 'DHL', trackingNumber: '00340',
    })).toEqual({ label: 'Versandt — DHL', trackingNumber: '00340' })
  })

  it('says no tracking is available for an admin-marked shipment', () => {
    expect(describeShipment({
      brandId: 1, brandName: 'Alpha', status: 'SHIPPED',
      shippedAt: '2026-08-31T17:04:12', carrier: null, trackingNumber: null,
    })).toEqual({ label: 'Versandt — keine Sendungsnummer verfügbar', trackingNumber: null })
  })

  it('labels the pre-shipment and problem states', () => {
    expect(describeShipment({ brandId: 1, brandName: 'A', status: 'AWAITING_SHIPMENT' }).label)
      .toBe('Versand ausstehend')
    expect(describeShipment({ brandId: 1, brandName: 'A', status: 'PROBLEM' }).label)
      .toBe('Versandproblem')
  })

  it('falls back to the raw status for an unknown value', () => {
    expect(describeShipment({ brandId: 1, brandName: 'A', status: 'WAT' }).label).toBe('WAT')
  })
})
