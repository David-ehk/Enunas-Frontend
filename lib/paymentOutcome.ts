/**
 * What the confirmation page may claim about an order Mollie just returned the customer from.
 *
 * Mollie redirects back after EVERY outcome — paid, cancelled, failed, expired — and the backend
 * only moves the order out of PENDING once the webhook lands. A cancelled or failed payment is
 * NOT cancelled immediately: the order stays PENDING until the expiry job cancels it ~30 minutes
 * later. So PENDING can mean "webhook still on its way" or "customer gave up", and the page must
 * not say "Bestellung bestätigt" for it.
 *
 * `paidAt` distinguishes between a never-charged cancelled order (failed) and one that was
 * charged then admin-cancelled (refunded).
 */
export type PaymentOutcome = 'confirmed' | 'processing' | 'failed' | 'refunded' | 'unknown'

export function paymentOutcome(status: string | null | undefined, paidAt?: string | null): PaymentOutcome {
  if (!status) return 'unknown'
  if (status === 'PENDING') return 'processing'
  if (status === 'CANCELLED') {
    if (paidAt) return 'refunded'
    return 'failed'
  }
  return 'confirmed'
}

/**
 * The cart used to be cleared right before the Mollie redirect, so a failed or abandoned payment
 * left the customer with an empty cart. Instead the checkout remembers which order it handed off,
 * and the confirmation page clears the cart only once THAT order is confirmed paid. Matching the
 * order number stops an old confirmation link from wiping a cart built later.
 */
export const PENDING_CHECKOUT_STORAGE_KEY = 'enunas_pending_checkout'

type ReadWriteStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export function rememberPendingCheckout(orderNumber: string, storage: ReadWriteStorage = localStorage): void {
  try {
    storage.setItem(PENDING_CHECKOUT_STORAGE_KEY, orderNumber)
  } catch {
    // Storage unavailable (private mode, blocked site data) — the cart simply stays filled.
  }
}

/** True — and forgets the hand-off — only when `orderNumber` is the checkout that was handed off. */
export function takePendingCheckout(orderNumber: string, storage: ReadWriteStorage = localStorage): boolean {
  try {
    if (storage.getItem(PENDING_CHECKOUT_STORAGE_KEY) !== orderNumber) return false
    storage.removeItem(PENDING_CHECKOUT_STORAGE_KEY)
    return true
  } catch {
    return false
  }
}
