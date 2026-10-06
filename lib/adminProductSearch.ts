/**
 * Admin product-list search: name, brand or SKU, case-insensitive. Every field is optional at
 * runtime — production sends admin products without a product-level `sku`, and a missing field
 * must simply not match rather than crash the page.
 */
export function matchesProductSearch(
  p: { name?: string | null; brandName?: string | null; sku?: string | null },
  query: string,
): boolean {
  const q = query.toLowerCase()
  if (!q) return true
  return [p.name, p.brandName, p.sku].some(f => (f ?? '').toLowerCase().includes(q))
}
