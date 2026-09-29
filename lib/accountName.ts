interface NameSource {
  firstName?: string | null
  lastName?: string | null
  fullName?: string | null
}

export interface ResolvedAccountName {
  firstName: string
  lastName: string
  source: 'profile' | 'order' | 'none'
}

const clean = (v?: string | null) => (v ?? '').trim()

/** "Anna Maria Schmidt" → { Anna Maria, Schmidt }; a single word stays the first name. */
function splitFullName(full: string): { firstName: string; lastName: string } {
  const i = full.lastIndexOf(' ')
  if (i === -1) return { firstName: full, lastName: '' }
  return { firstName: full.slice(0, i).trim(), lastName: full.slice(i + 1).trim() }
}

/**
 * The name an account shows. The profile wins whenever it has a first name; only a profile
 * without one borrows the name from an order's shipping address (both parts together, so a
 * profile first name is never paired with someone else's last name).
 */
export function resolveAccountName(
  profile: NameSource | null | undefined,
  order: NameSource | null | undefined,
): ResolvedAccountName {
  const first = clean(profile?.firstName)
  if (first) return { firstName: first, lastName: clean(profile?.lastName), source: 'profile' }

  if (order) {
    const oFirst = clean(order.firstName)
    if (oFirst) return { firstName: oFirst, lastName: clean(order.lastName), source: 'order' }
    const full = clean(order.fullName)
    if (full) return { ...splitFullName(full), source: 'order' }
  }

  return { firstName: '', lastName: '', source: 'none' }
}
