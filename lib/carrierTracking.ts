/**
 * Canonical carrier → tracking-URL mapping.
 *
 * Previously duplicated with drifted URLs in two places: the vendor "Versenden" modal
 * (piececode-style DHL link) and the public /sendungsverfolgung page (idc-style DHL link,
 * different DPD domain). A brand and a customer looking at the same shipment could land on two
 * different DHL pages. This is the one place either side builds a tracking link.
 *
 * DHL's `piececode` link is verified against real production tracking numbers (Sep 2026). UPS,
 * DPD and FedEx are believed correct but were not click-verified live from this environment —
 * spot-check with a real tracking number before relying on them.
 */
export const CARRIERS = ['DHL', 'UPS', 'DPD', 'FedEx'] as const
export type Carrier = typeof CARRIERS[number]

export function trackingUrl(carrier: Carrier, trackingNumber: string): string {
  const n = encodeURIComponent(trackingNumber)
  switch (carrier) {
    case 'DHL':   return `https://www.dhl.de/de/privatkunden/dhl-sendungsverfolgung.html?piececode=${n}`
    case 'UPS':   return `https://www.ups.com/track?loc=de_DE&tracknum=${n}`
    case 'DPD':   return `https://tracking.dpd.de/status/de_DE/parcel/${n}`
    case 'FedEx': return `https://www.fedex.com/fedextrack/?trknbr=${n}`
  }
}
