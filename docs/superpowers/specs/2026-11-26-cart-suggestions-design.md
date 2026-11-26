# Cart drawer: favourites with pictures, style-based suggestions

## Intent
Make adding pieces from the slide-out cart simple: show the real favourites with pictures, and
suggest pieces matching the cart's main style, in the manner of Cult Gaia's cart rows.

## Goals / non-goals
- Goals: usable Wunschliste tab; suggestions from Admin → Schaufenster → Empfehlungen; very few
  backend requests.
- Non-goals: backend changes, changes to `/cart`, changes to how items are added elsewhere.
- Must not happen: any change to the white summary box (Zwischensumme, Versand (geschätzt),
  Gesamt, buttons, trust line); one request per cart item, favourite or suggestion.

## Approaches
- **A. Look up styles when the cart opens (chosen).** No backend change, existing carts work.
- B. Save the style on each cart item. Old carts lack it; every add path changes.
- C. Backend picks from cart contents. Needs Spring Boot work.

## Request budget
- On opening the drawer: one public Schaufenster curation request and one product list request
  (`size=100`). The list supplies cart styles, suggestion details, favourite stock and sizes.
- Both are shared by the two tabs and reused for 5 minutes. Reopening or switching tabs within
  that time requests nothing. A failed load is not cached.
- Nothing is requested while the drawer is closed, or when cart and favourites are both empty.
- No per-product requests for display. Tapping "Hinzufügen" makes one listings request for that
  product, because the cart line needs the listing id.
- Limit: only those 100 products are known. A cart item outside them is not counted, a pick
  outside them is skipped, and a favourite outside them keeps its picture and links to its
  product page without "Hinzufügen". No extra requests are made to fill gaps.

## Suggestions (Warenkorb tab, beige scroll area, below the cart items)
- Heading "Das könnte dir gefallen". Thin-bordered rows: picture, brand, name, price,
  "+ Hinzufügen".
- Style ranking: sum of cart quantities per style. A product with two styles counts for both.
  Tie: the style on the most recently added cart line.
- Up to 3 picks from the top style, in Schaufenster order. Leave out pieces already in the cart,
  sold out, unavailable or "Coming Soon".
- If the top style has nothing to show, use the next ranked style. Styles are not mixed.
- Nothing to show, empty cart, or failed load: no section. The cart works as before.

## Wunschliste tab
- Same rows, one per favourite, with the saved picture. Keeps the "Wunschliste ansehen" link.
- Sold out shows "Ausverkauft", preview shows "Coming Soon"; neither can be added.
- If the data fails to load, rows still show and link to the product page.

## Adding
- "Hinzufügen" opens the choice inside the row: colour (only if several), then size. Sold-out
  sizes are disabled. With a single variant it adds directly.
- The drawer stays on the current tab. The favourite stays saved.
- If the listings request fails, nothing is added; show a short error linking to the product page.

## Constraints
Existing Enunas colours, fonts and easing; transform/opacity animation only; reduced motion
respected; usable at 390px width with keyboard focus states.

## Verification
Tests first for the pure logic (style ranking, pick selection, cache reuse), then
`pnpm run build`, then a live check in the browser, including the request count and an
unchanged summary box.

## Left to the builder
File layout, exact row spacing and error wording.
