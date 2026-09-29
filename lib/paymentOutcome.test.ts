import { describe, it, expect } from 'vitest'
import {
  paymentOutcome, rememberPendingCheckout, takePendingCheckout, PENDING_CHECKOUT_STORAGE_KEY,
} from './paymentOutcome'

const memoryStorage = () => {
  const data = new Map<string, string>()
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => { data.set(k, v) },
    removeItem: (k: string) => { data.delete(k) },
    data,
  }
}

describe('paymentOutcome', () => {
  it('never confirms an order that is still waiting on its payment', () => {
    expect(paymentOutcome('PENDING')).toBe('processing')
  })

  it('treats a cancelled order as a payment that did not go through', () => {
    expect(paymentOutcome('CANCELLED')).toBe('failed')
  })

  it('treats a cancelled order with paidAt as refunded', () => {
    expect(paymentOutcome('CANCELLED', '2026-09-21T10:00:00Z')).toBe('refunded')
  })

  it('treats a cancelled order with null paidAt as failed', () => {
    expect(paymentOutcome('CANCELLED', null)).toBe('failed')
  })

  it.each(['PAID', 'PARTIALLY_SHIPPED', 'SHIPPED', 'DELIVERED', 'RETURN_REQUESTED', 'REFUNDED'])(
    'confirms %s — the payment went through at some point',
    (status) => expect(paymentOutcome(status)).toBe('confirmed'),
  )

  it('claims nothing when the order could not be loaded', () => {
    expect(paymentOutcome(undefined)).toBe('unknown')
    expect(paymentOutcome(null)).toBe('unknown')
  })
})

describe('pending checkout hand-off', () => {
  it('matches only the order that was handed to Mollie, and only once', () => {
    const s = memoryStorage()
    rememberPendingCheckout('ENS-2026-AAAAAA', s)
    expect(takePendingCheckout('ENS-2026-BBBBBB', s)).toBe(false)
    expect(s.data.get(PENDING_CHECKOUT_STORAGE_KEY)).toBe('ENS-2026-AAAAAA')
    expect(takePendingCheckout('ENS-2026-AAAAAA', s)).toBe(true)
    expect(takePendingCheckout('ENS-2026-AAAAAA', s)).toBe(false)
  })

  it('is false when nothing was handed off', () => {
    expect(takePendingCheckout('ENS-2026-AAAAAA', memoryStorage())).toBe(false)
  })

  it('survives storage that throws', () => {
    const broken = {
      getItem: () => { throw new Error('blocked') },
      setItem: () => { throw new Error('blocked') },
      removeItem: () => { throw new Error('blocked') },
    }
    expect(() => rememberPendingCheckout('ENS-2026-AAAAAA', broken)).not.toThrow()
    expect(takePendingCheckout('ENS-2026-AAAAAA', broken)).toBe(false)
  })
})
