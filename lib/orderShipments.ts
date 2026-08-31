import type { ApiOrderShipment } from '@/types/api'

// An admin marking a whole order shipped produces a SHIPPED row with no carrier and no tracking
// number — and the customer gets a dispatch email for it. The email says tracking is unavailable,
// so the order detail must say the same rather than showing an empty carrier or a dead link.
export function describeShipment(s: ApiOrderShipment): { label: string; trackingNumber: string | null } {
  const tracking = s.trackingNumber || null

  if (s.status === 'SHIPPED') {
    if (s.carrier && tracking) return { label: `Versandt — ${s.carrier}`, trackingNumber: tracking }
    return { label: 'Versandt — keine Sendungsnummer verfügbar', trackingNumber: null }
  }
  if (s.status === 'AWAITING_SHIPMENT') return { label: 'Versand ausstehend', trackingNumber: null }
  if (s.status === 'PROBLEM') return { label: 'Versandproblem', trackingNumber: null }

  return { label: String(s.status), trackingNumber: tracking }
}
