/** The stored form of a VAT id: no whitespace, upper case. */
export function normalizeVatId(value: string): string {
  return value.replace(/\s+/g, '').toUpperCase()
}

/** Error text for an invalid VAT id, or null when valid or empty (the field is optional). */
export function vatIdError(value: string): string | null {
  const v = normalizeVatId(value)
  if (!v) return null
  if (v.startsWith('DE')) {
    return /^DE\d{9}$/.test(v) ? null : 'Deutsche USt-IdNr.: „DE“ gefolgt von 9 Ziffern.'
  }
  return /^[A-Z]{2}[A-Z0-9]{2,12}$/.test(v) ? null : 'Ungültige USt-IdNr. — Ländercode + Nummer, z. B. DE123456789.'
}

/** Error text for an invalid postcode, or null. Germany is strict (5 digits); elsewhere lenient. */
export function postalCodeError(value: string, country: string): string | null {
  const v = value.trim()
  if (country === 'DE') return /^\d{5}$/.test(v) ? null : 'PLZ: 5 Ziffern.'
  return /^[A-Za-z0-9][A-Za-z0-9 -]{1,9}$/.test(v) ? null : 'Ungültige PLZ.'
}

/** Social handles are stored without the leading "@" the input's placeholder suggests. */
export function normalizeSocialHandle(value: string): string {
  return value.trim().replace(/^@+/, '')
}
