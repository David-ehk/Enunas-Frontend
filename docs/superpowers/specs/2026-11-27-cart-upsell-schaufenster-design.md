# Cart upsell from the Schaufenster — design

## Why
The shop admin wants to choose the small add-ons suggested in the cart ("Empfohlen für dich").
The backend now stores that choice in its own list. The frontend does not use it yet.

## Backend contract (live on api.enunas.com)
`GET /storefront/curation` (public), `GET` and `PUT /admin/storefront/curation` (ADMIN) carry one
more top-level field: `cartUpsell: string[]`, an ordered list of product ids. `PUT` replaces the
lists and returns the saved state. As requested from the backend (not yet verified from here): the
public GET leaves out hidden products, and a PUT without the field keeps the saved list.

## Behaviour

### Cart (drawer and /cart page)
1. An empty cart gets no suggestions.
2. The admin's `cartUpsell` picks come first, in the admin's order, at most 3. A pick is skipped
   when it is in the cart, unavailable, coming soon, sold out, or not among the loaded products.
3. If no pick can be used (none saved, all skipped, or curation failed to load), show the 3 newest
   buyable products that are not in the cart.
4. A partly usable list is not topped up with newest products.
5. The cart no longer reads the per-style `recommendations` lists.
6. `/storefront/recommendations` and the product-page rails do not change.

### Admin Schaufenster
1. A fourth section tab, **Warenkorb**, edits `cartUpsell` with the same add, remove, drag-to-order,
   clear and save controls as the other lists.
2. Its hint reads: `Erscheint im Warenkorb unter „Empfohlen für dich“`.
3. The cart shows 3, so here the highlighted positions are 1–3: legend `Direkt sichtbar (1–3)`,
   overflow `+N als Ersatz`, and the divider after position 3 reads `Ersatz, falls oben etwas fehlt`.
   The other tabs keep 1–4 and their current texts.
4. Saving still sends the complete curation object.

## Approaches
- **Own `cartUpsell` list (chosen).** Add-ons stay out of the style rails. One list for all carts.
- Reuse the style lists. No new field, but add-ons would also appear in the product-page rails.
- Own list with the style lists as a second fallback. Harder for the admin to predict. Rejected:
  the user asked for "admin picks, else the most recent products".

## Limits
- Suggestions are resolved from the first 100 products of the public product list (unchanged).
  A pick outside them is skipped.
- The cart caches its data for 5 minutes; a reload fetches it again.

## Non-goals
No backend changes. No redesign of the cart rows or of the Schaufenster. No new dependencies.
