export interface OrderShippingAddress {
  fullName?: string | null
  firstName?: string | null
  lastName?: string | null
  street?: string | null
  houseNumber?: string | null
  addressLine2?: string | null
  street2?: string | null
  postalCode?: string | null
  city?: string | null
}

/**
 * Display lines for an order's shipping address (country excluded — callers place it). The
 * backend sends first/last name, street and house number as separate fields; reading only
 * `fullName`/`street` drops the name and the house number.
 */
export function shippingAddressLines(a: OrderShippingAddress): string[] {
  const join = (...parts: (string | null | undefined)[]) => parts.filter(Boolean).join(' ')
  return [
    a.fullName || join(a.firstName, a.lastName),
    join(a.street, a.houseNumber),
    a.addressLine2 || a.street2 || '',
    join(a.postalCode, a.city),
  ].filter(Boolean)
}
