#!/usr/bin/env node
/**
 * Post-deploy regression for the Enunas money path.
 *
 * Written to re-run the checks from the 29 Aug 2026 production audit after the backend fixes
 * for /brand/orders scoping and per-brand shipment land. It builds its own fixtures (two brands
 * on one order — the only shape that can expose cross-brand leakage), drives a real Mollie
 * TEST-mode payment, then asserts the four items that were failing or untested, plus cheap
 * regression guards on the ten that already passed.
 *
 *   node scripts/post-deploy-regression.mjs --confirm-writes
 *
 * SAFETY
 *   - Refuses to run without --confirm-writes. It creates real brands, products and orders.
 *   - Credentials come from the environment ONLY. Never hardcode them: .claude/settings.local.json
 *     is committed to a PUBLIC repo, which is how the admin password leaked in the first place.
 *   - Cleans up after itself (listings deactivated, products hidden) unless --keep.
 *   - Brands, customers and the order cannot be deleted (FK constraints) and are listed at the end.
 *
 * ENV
 *   API_URL          default https://api.enunas.com
 *   ADMIN_EMAIL      required
 *   ADMIN_PASSWORD   required
 *   BRAND_A_EMAIL    required — an existing, email-verified brand partner
 *   BRAND_A_PASSWORD required
 *   BRAND_B_EMAIL    required — a DIFFERENT brand; two are needed to detect cross-brand leakage
 *   BRAND_B_PASSWORD required
 *   TEST_PASSWORD    password for the generated customer (default: random, printed at the end)
 *
 * WHY BRANDS ARE REUSED, NOT CREATED
 *   Brand partners cannot be deleted (FK constraints), so creating two per run would litter the
 *   environment permanently. They also can no longer be created headlessly: since the Sep 2026
 *   backend fix, /admin/brands/{id}/approve no longer enables a login on its own — the account
 *   must complete /brandpartner/verify with a code sent by email. That is correct behaviour and
 *   this script does not try to work around it. Products and listings ARE created per run, since
 *   those can be hidden again afterwards.
 *
 * FLAGS
 *   --confirm-writes  required; acknowledges this mutates the target environment
 *   --keep            skip cleanup (leaves test products live — only for debugging)
 *   --no-pay          skip the Mollie step; downstream checks that need a PAID order are skipped
 *   --json            emit a machine-readable summary on stdout
 *
 * EXIT CODES  0 = all assertions passed · 1 = at least one FAIL · 2 = setup/config error
 */

const API = (process.env.API_URL || 'https://api.enunas.com').replace(/\/$/, '')
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const BRAND_A = { email: process.env.BRAND_A_EMAIL, password: process.env.BRAND_A_PASSWORD }
const BRAND_B = { email: process.env.BRAND_B_EMAIL, password: process.env.BRAND_B_PASSWORD }
const ARGS = new Set(process.argv.slice(2))

const CONFIRMED = ARGS.has('--confirm-writes')
const KEEP = ARGS.has('--keep')
const NO_PAY = ARGS.has('--no-pay')
const JSON_OUT = ARGS.has('--json')

// Minute resolution plus randomness: accounts cannot be deleted, so two runs in the same minute
// must not collide on an email address.
const STAMP = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12) +
              Math.random().toString(36).slice(2, 6)
const TEST_PASSWORD = process.env.TEST_PASSWORD || `Rg-${Math.random().toString(36).slice(2, 10)}-${STAMP}!`

// ── reporting ────────────────────────────────────────────────────────────────
const results = []
let currentPhase = 'setup'

const C = process.stdout.isTTY
  ? { g: '\x1b[32m', r: '\x1b[31m', y: '\x1b[33m', d: '\x1b[2m', b: '\x1b[1m', x: '\x1b[0m' }
  : { g: '', r: '', y: '', d: '', b: '', x: '' }

function record(status, id, title, detail) {
  results.push({ phase: currentPhase, status, id, title, detail })
  if (JSON_OUT) return
  const tag = status === 'PASS' ? `${C.g}PASS${C.x}`
            : status === 'FAIL' ? `${C.r}FAIL${C.x}`
            : status === 'WARN' ? `${C.y}WARN${C.x}`
            : `${C.d}SKIP${C.x}`
  console.log(`  ${tag}  ${C.b}${id}${C.x} ${title}`)
  if (detail) console.log(`        ${C.d}${detail}${C.x}`)
}
const pass = (id, t, d) => record('PASS', id, t, d)
const fail = (id, t, d) => record('FAIL', id, t, d)
const warn = (id, t, d) => record('WARN', id, t, d)
const skip = (id, t, d) => record('SKIP', id, t, d)

/** Assert helper: one line per check, never throws — a failed assertion must not stop the run. */
function check(id, title, condition, detail) {
  condition ? pass(id, title, detail) : fail(id, title, detail)
  return condition
}

function phase(name) {
  currentPhase = name
  if (!JSON_OUT) console.log(`\n${C.b}${name}${C.x}`)
}

// ── http ─────────────────────────────────────────────────────────────────────
async function api(method, path, { token, body, raw = false } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let json = null
  try { json = text ? JSON.parse(text) : null } catch { /* non-JSON body */ }
  if (raw) return { status: res.status, json, text }
  if (!res.ok) {
    const msg = json?.message || text.slice(0, 200)
    throw Object.assign(new Error(`${method} ${path} → ${res.status}: ${msg}`), { status: res.status, json })
  }
  return json
}

async function login(email, password) {
  const r = await api('POST', '/auth/login', { body: { email, password } })
  if (!r?.token) throw new Error(`login for ${email} returned no token`)
  return r.token
}

const money = n => Number(n ?? 0).toFixed(2)
const near = (a, b, eps = 0.005) => Math.abs(Number(a) - Number(b)) < eps

// ── fixtures ─────────────────────────────────────────────────────────────────
const fixture = {
  brands: [],        // { name, email, token, id, productId, variantId, listingId, sku, price }
  customer: null,    // { email, token }
  order: null,
  createdProductIds: [],
  createdListings: [],  // { productId, listingId, token }
}

/**
 * Logs in as an existing verified brand and gives it a fresh product + listing for this run.
 * See the header note on why brands are reused rather than created.
 */
async function setUpBrand(label, email, password, price, size, color) {
  let token
  try {
    token = await login(email, password)
  } catch (err) {
    throw new Error(
      `Could not log in as BRAND_${label.toUpperCase()} (${email}): ${err.message}\n` +
      `  This script needs two existing, email-verified brand partners. Since the Sep 2026 fix, ` +
      `admin approval alone no longer enables a brand login — the account must have completed ` +
      `/brandpartner/verify. Create and verify two brands once, then set BRAND_A_* / BRAND_B_*.`,
    )
  }

  const me = await api('GET', '/brandpartner/me', { token })
  const brandId = me.id
  const brandName = me.brandName

  const product = await api('POST', '/products/create', {
    token,
    body: {
      name: `RG ${label} Item ${STAMP}`,
      description: 'Post-deploy regression fixture. Safe to delete.',
      category: 'CLOTHING', gender: 'UNISEX', productType: 'HOODIE',
      material: '100% Baumwolle', originCountry: 'DE',
      careInstructions: '30C Maschinenwaesche',
      catalogueCategory: ['STREETWEAR'],
      completeTheLookEnabled: false, completeTheLookProductIds: [],
      variants: [{ color, colorFamily: color, size, stockQuantity: 25, weightGrams: 500 }],
    },
  })
  const variant = product.variants[0]
  const listing = await api('POST', `/products/${product.id}/listings`, {
    token,
    body: { variantId: variant.id, price, priceInputMode: 'GROSS', currency: 'EUR', region: 'DE' },
  })

  fixture.createdProductIds.push(product.id)
  fixture.createdListings.push({ productId: product.id, listingId: listing.id, token })

  return {
    label, name: brandName, email, token, id: brandId,
    productId: product.id, variantId: variant.id, listingId: listing.id,
    sku: variant.sku, price, size, color,
    listingNet: listing.priceNet, listingVat: listing.priceVat,
  }
}

// ── Mollie test-mode payment (Playwright — already a devDependency) ──────────
async function payWithMollieTestCard(checkoutUrl) {
  // The repo ships @playwright/test (which re-exports the browser API); the standalone
  // `playwright` package is not installed. Try both so this works either way.
  let chromium
  try {
    ({ chromium } = await import('@playwright/test'))
  } catch {
    try { ({ chromium } = await import('playwright')) } catch {
      return { ok: false, reason: 'Playwright not installed — run `pnpm exec playwright install chromium`, or pass --no-pay' }
    }
  }
  let browser
  try {
    browser = await chromium.launch({ headless: true })
    // Pin the locale so Mollie's copy (and therefore every selector below) is deterministic;
    // the banner and button labels change language otherwise.
    const context = await browser.newContext({ locale: 'de-DE' })
    const page = await context.newPage()
    await page.goto(checkoutUrl, { waitUntil: 'domcontentloaded' })

    const bodyText = await page.locator('body').innerText()
    // Mollie renders this banner in the viewer's own language and spells it "testmode" in
    // English but "Testzahlung" in German — match generously, or a live-mode guard turns into a
    // false alarm that silently blocks every downstream check.
    if (!/testmode|test\s*mode|testzahlung|test\s*payment|testbetaling/i.test(bodyText)) {
      return {
        ok: false,
        reason: 'Mollie does not look like test mode — refusing to complete a possibly real payment. ' +
                `Page began: ${bodyText.replace(/\s+/g, ' ').slice(0, 160)}`,
      }
    }

    await page.getByRole('button', { name: /Karte|Card/i }).first().click()
    const frame = page.frameLocator('iframe[title*="card" i], iframe[title*="Karte" i]').first()
    await frame.getByRole('textbox', { name: /Kreditkartenummer|card number/i }).fill('4543474002249996')
    await frame.getByRole('textbox', { name: /Gültig bis|expiry/i }).fill('12/30')
    await frame.getByRole('textbox', { name: /CVV|CVC/i }).fill('123')
    await frame.getByRole('textbox', { name: /Karteninhaber|cardholder/i }).fill('Regression Test')
    await frame.getByRole('button', { name: /Bezahlen|Pay/i }).click()

    // Mollie test mode then asks for the final status.
    await page.getByRole('radio', { name: /Bezahlt|Paid/i }).click({ timeout: 30_000 })
    await page.getByRole('button', { name: /Weiter|Continue/i }).click()
    await page.waitForLoadState('domcontentloaded')
    return { ok: true }
  } catch (err) {
    return { ok: false, reason: err.message.split('\n')[0] }
  } finally {
    // Must never throw: a failure closing the browser would replace the real reason above and,
    // because this runs in a promise, escape as an unhandled rejection that kills the process
    // before cleanup gets to run.
    try { await browser?.close() } catch { /* browser already gone */ }
  }
}

// ── checks ───────────────────────────────────────────────────────────────────

/**
 * THE headline check. Before the fix, both brands received byte-identical whole-order payloads.
 * After it, each brand must see only its own line items, its own shipping snapshot, its own
 * returns, and a total recomputed for it alone.
 */
function assertOrderScoping(brand, other, order, orderNumber) {
  const id = `LEAK-${brand.label}`
  const items = order.items ?? []
  const snaps = order.shippingSnapshots ?? []

  const foreignItems = items.filter(i => i.variantSku === other.sku)
  check(`${id}-items`, `${brand.label} sees only its own line items`,
    foreignItems.length === 0,
    foreignItems.length
      ? `LEAKED ${foreignItems.length} item(s) belonging to ${other.label}: ` +
        foreignItems.map(i => `${i.productName} @ ${money(i.priceAtPurchase)}`).join(', ')
      : `${items.length} item(s), all own`)

  const foreignSnaps = snaps.filter(s => String(s.brandId) !== String(brand.id))
  check(`${id}-shipping`, `${brand.label} sees only its own shipping snapshot`,
    foreignSnaps.length === 0,
    foreignSnaps.length
      ? `LEAKED ${other.label} shipping revenue: ` + foreignSnaps.map(s => money(s.amount)).join(', ')
      : `own snapshot only`)

  const ownGross = items.reduce((s, i) => s + Number(i.lineTotal ?? 0), 0)
  const ownShip = snaps.reduce((s, x) => s + Number(x.amount ?? 0), 0)
  const expected = ownGross + ownShip
  check(`${id}-total`, `${brand.label} order total is recomputed for this brand`,
    near(order.total, expected),
    `total=${money(order.total)} expected=${money(expected)} (own items ${money(ownGross)} + own shipping ${money(ownShip)})`)

  const foreignReturns = (order.returns ?? []).filter(r => String(r.brandId) !== String(brand.id))
  check(`${id}-returns`, `${brand.label} sees only its own returns`,
    foreignReturns.length === 0,
    foreignReturns.length ? `LEAKED ${foreignReturns.length} return(s) from ${other.label}` : 'own returns only')

  // The brand needs the delivery address to fulfil, so this is informational, not a failure.
  if (order.buyerEmail) {
    warn(`${id}-pii`, `${brand.label} can read the customer's email address`,
      `buyerEmail=${order.buyerEmail} — needed for fulfilment? If not, drop it from the brand-facing DTO.`)
  }
  check(`${id}-addr`, `${brand.label} still receives the shipping address it needs to fulfil`,
    !!order.shippingAddress, order.shippingAddress ? 'present' : 'MISSING — brand cannot ship')

  if (orderNumber) {
    check(`${id}-order-id`, `${brand.label} still sees the order it participates in`,
      order.orderNumber === orderNumber, `orderNumber=${order.orderNumber}`)
  }
}

async function run() {
  if (!CONFIRMED) {
    console.error('Refusing to run: this creates real brands, products and orders.\n' +
                  'Re-run with --confirm-writes once you have pointed API_URL at the right environment.\n' +
                  `Current API_URL would be: ${API}`)
    process.exit(2)
  }
  const missing = [
    !ADMIN_EMAIL && 'ADMIN_EMAIL', !ADMIN_PASSWORD && 'ADMIN_PASSWORD',
    !BRAND_A.email && 'BRAND_A_EMAIL', !BRAND_A.password && 'BRAND_A_PASSWORD',
    !BRAND_B.email && 'BRAND_B_EMAIL', !BRAND_B.password && 'BRAND_B_PASSWORD',
  ].filter(Boolean)
  if (missing.length) {
    console.error(`Missing required environment variables: ${missing.join(', ')}\n` +
                  'Never hardcode them — this repo is public.\n' +
                  'BRAND_A_* and BRAND_B_* must be two DIFFERENT existing, email-verified brand ' +
                  'partners; two are required to detect cross-brand leakage.')
    process.exit(2)
  }
  if (BRAND_A.email === BRAND_B.email) {
    console.error('BRAND_A_EMAIL and BRAND_B_EMAIL must be different brands — ' +
                  'the leakage check is meaningless otherwise.')
    process.exit(2)
  }

  if (!JSON_OUT) {
    console.log(`${C.b}Enunas post-deploy regression${C.x}`)
    console.log(`${C.d}target ${API} · run ${STAMP}${C.x}`)
  }

  // ── setup ──────────────────────────────────────────────────────────────────
  phase('Setup')
  const admin = await login(ADMIN_EMAIL, ADMIN_PASSWORD)
  pass('SETUP-admin', 'admin authenticated')

  const A = await setUpBrand('Alpha', BRAND_A.email, BRAND_A.password, 89.95, 'M', 'BLACK')
  const B = await setUpBrand('Beta', BRAND_B.email, BRAND_B.password, 29.95, 'L', 'WHITE')
  fixture.brands = [A, B]
  pass('SETUP-brands', 'two existing brands, each given a fresh product with stock',
    `${A.name} (listing ${A.listingId} @ ${money(A.price)}) · ${B.name} (listing ${B.listingId} @ ${money(B.price)})`)

  // Settlement rows aggregate the whole PERIOD, not one order. Snapshot them before creating
  // anything so the commission assertions below can compare the delta this run caused, instead
  // of assuming the month contains exactly one order.
  const PERIOD = new Date().toISOString().slice(0, 7)
  const baselineRows = await api('GET', `/admin/settlements?period=${PERIOD}`, { token: admin })
  const baseline = Object.fromEntries((baselineRows ?? []).map(r => [String(r.brandId), r]))
  const before = id => baseline[String(id)] ?? { commissionNet: 0, commissionVat: 0, commissionGross: 0, payoutAmount: 0, shippingRevenue: 0 }
  pass('SETUP-baseline', `settlement baseline captured for ${PERIOD}`,
    `${(baselineRows ?? []).length} brand row(s) already in this period`)

  const custEmail = `claude.rg+cust${STAMP}@enunas-test.com`
  await api('POST', '/auth/signup', { body: { email: custEmail, password: TEST_PASSWORD } })
  const custToken = await login(custEmail, TEST_PASSWORD)
  fixture.customer = { email: custEmail, token: custToken }
  pass('SETUP-customer', 'customer created')

  // ── pricing / VAT / shipping (regression guard on what already passed) ─────
  phase('Pricing, VAT and shipping')
  for (const brand of [A, B]) {
    const expNet = Math.round((brand.price / 1.19) * 100) / 100
    check(`VAT-${brand.label}`, `${brand.label} listing splits 19 % VAT exactly`,
      near(brand.listingNet, expNet, 0.011),
      `gross ${money(brand.price)} → net ${money(brand.listingNet)} + VAT ${money(brand.listingVat)} (expected net ${money(expNet)})`)
  }

  const address = {
    firstName: 'Regression', lastName: 'Kunde', street: 'Teststrasse', houseNumber: '1',
    postalCode: '10115', city: 'Berlin', country: 'DE', phone: '+4915112345678',
  }
  const cart = { items: [{ listingId: A.listingId, quantity: 1 }, { listingId: B.listingId, quantity: 1 }], shippingAddress: address }

  const preview = await api('POST', '/orders/preview', { token: custToken, body: cart })
  const expectedSubtotal = A.price + B.price
  check('PRICE-subtotal', 'preview subtotal is the sum of both listings',
    near(preview.subtotal, expectedSubtotal), `subtotal=${money(preview.subtotal)} expected=${money(expectedSubtotal)}`)
  check('SHIP-perbrand', 'shipping is charged once per brand',
    (preview.shippingBreakdown ?? []).length === 2,
    `${(preview.shippingBreakdown ?? []).length} shipping line(s), total ${money(preview.shippingTotal)}`)
  check('PRICE-total', 'preview total = subtotal + shipping',
    near(preview.total, preview.subtotal + preview.shippingTotal),
    `total=${money(preview.total)}`)

  // Known defect from the audit: items[].listingId echoed the variant ID.
  const echoed = (preview.items ?? []).map(i => i.listingId).sort()
  const requested = [A.listingId, B.listingId].sort()
  check('PRICE-listingid', 'preview echoes back the listingId that was requested',
    JSON.stringify(echoed) === JSON.stringify(requested),
    `requested [${requested}] → returned [${echoed}]${JSON.stringify(echoed) !== JSON.stringify(requested) ? ' (variant IDs, not listing IDs)' : ''}`)

  // ── stock guard ────────────────────────────────────────────────────────────
  const zero = await api('POST', '/orders/preview', {
    token: custToken, raw: true,
    body: { items: [{ listingId: A.listingId, quantity: 9999 }], shippingAddress: address },
  })
  check('STOCK-guard', 'backend refuses an order above available stock',
    zero.status === 409, `HTTP ${zero.status} ${zero.json?.message ?? ''}`)

  // ── order creation ─────────────────────────────────────────────────────────
  phase('Order creation and payment')
  const order = await api('POST', '/orders', { token: custToken, body: cart })
  fixture.order = order
  check('ORDER-created', 'multi-brand order created',
    !!order.orderNumber && order.status === 'PENDING',
    `${order.orderNumber} · ${money(order.total)} · ${order.status}`)
  check('ORDER-total', 'persisted total matches the preview',
    near(order.total, preview.total), `order=${money(order.total)} preview=${money(preview.total)}`)

  let paid = false
  if (NO_PAY) {
    skip('PAY-mollie', 'Mollie payment skipped (--no-pay)')
  } else if (!order.checkoutUrl) {
    fail('PAY-mollie', 'order carries no Mollie checkoutUrl')
  } else {
    const r = await payWithMollieTestCard(order.checkoutUrl)
    if (!r.ok) {
      fail('PAY-mollie', 'could not complete the Mollie test payment', r.reason)
    } else {
      // The webhook is what actually moves the order; poll briefly for it.
      let status = null
      for (let i = 0; i < 10; i++) {
        const o = await api('GET', `/orders/${order.id}`, { token: custToken })
        status = o.status
        if (status === 'PAID') break
        await new Promise(res => setTimeout(res, 2000))
      }
      paid = status === 'PAID'
      check('PAY-webhook', 'Mollie webhook moved the order PENDING → PAID',
        paid, `status after payment: ${status}`)
    }
  }

  // ── THE headline checks ────────────────────────────────────────────────────
  phase('Cross-brand data leakage  (was CRITICAL — must now pass)')
  for (const [brand, other] of [[A, B], [B, A]]) {
    const page = await api('GET', '/brand/orders?page=0&size=50', { token: brand.token })
    const list = Array.isArray(page) ? page : (page.content ?? [])
    const mine = list.find(o => o.orderNumber === order.orderNumber)
    if (!mine) {
      fail(`LEAK-${brand.label}`, `${brand.label} cannot see an order it has an item on`,
        `looked for ${order.orderNumber} in ${list.length} order(s)`)
      continue
    }
    assertOrderScoping(brand, other, mine, order.orderNumber)
  }

  phase('Per-brand shipment  (was CRITICAL — must now pass)')
  if (!paid) {
    skip('SHIP-perbrand-fulfil', 'needs a PAID order')
  } else {
    await api('POST', `/brand/orders/${order.id}/ship`, {
      token: A.token,
      body: { carrier: 'DHL', trackingNumber: `RG-${STAMP}-A`, note: 'regression: brand A only' },
    })
    const asB = await api('GET', '/brand/orders?page=0&size=50', { token: B.token })
    const bList = Array.isArray(asB) ? asB : (asB.content ?? [])
    const bView = bList.find(o => o.orderNumber === order.orderNumber)
    const custView = await api('GET', `/orders/${order.id}`, { token: custToken })

    // Brand B has not shipped, so B's own view must not claim it has.
    check('SHIP-isolation', "Brand A shipping does not mark Brand B's items shipped",
      bView && bView.status !== 'SHIPPED',
      `Brand B sees its portion as: ${bView?.status ?? 'n/a'}`)

    // The customer-facing order must not read as fully shipped while half of it is not.
    check('SHIP-order-status', 'order is not globally SHIPPED while one brand is outstanding',
      custView.status !== 'SHIPPED',
      `customer sees: ${custView.status} — expected a partial/derived state, not SHIPPED`)

    const tracking = JSON.stringify(bView ?? {})
    check('SHIP-tracking', "Brand A's tracking number is not attached to Brand B's portion",
      !tracking.includes(`RG-${STAMP}-A`),
      tracking.includes(`RG-${STAMP}-A`) ? "Brand A's tracking number is visible on Brand B's view" : 'not present')

    // Now let the second brand ship too. PARTIALLY_SHIPPED is a legitimate intermediate state,
    // and the order only becomes SHIPPED — and therefore deliverable — once every brand has
    // dispatched. Returns gate on DELIVERED, so this step is a prerequisite, not an extra.
    await api('POST', `/brand/orders/${order.id}/ship`, {
      token: B.token,
      body: { carrier: 'DHL', trackingNumber: `RG-${STAMP}-B`, note: 'regression: brand B' },
    })
    const bothShipped = await api('GET', `/orders/${order.id}`, { token: custToken })
    check('SHIP-completes', 'order becomes SHIPPED once every brand has dispatched',
      bothShipped.status === 'SHIPPED', `status=${bothShipped.status}`)
  }

  phase('Returns still work after the shipment change  (regression risk)')
  let returnNumber = null
  if (!paid) {
    skip('RET-lifecycle', 'needs a PAID order')
  } else {
    // Returns require DELIVERED. The per-brand shipment change introduced PARTIALLY_SHIPPED as
    // an intermediate state, so DELIVERED is only reachable once every brand has shipped — which
    // the phase above now does. This is the regression-risk check: that a fully shipped
    // multi-brand order can still be delivered, and therefore still be returned.
    const del = await api('PATCH', `/admin/orders/${order.id}/status?status=DELIVERED`, { token: admin, raw: true })
    check('RET-precondition', 'a fully shipped multi-brand order can still reach DELIVERED',
      del.status === 200, `HTTP ${del.status} ${del.json?.message ?? ''}`)

    const ownItem = (await api('GET', `/orders/${order.id}`, { token: custToken }))
      .items.find(i => i.variantSku === A.sku)
    const withReturn = await api('POST', `/orders/${order.id}/return`, {
      token: custToken, raw: true,
      body: { orderItemId: ownItem?.id, reason: 'WRONG_SIZE', description: 'regression' },
    })
    check('RET-request', 'customer can request a return', withReturn.status === 200,
      `HTTP ${withReturn.status} ${withReturn.json?.message ?? ''}`)

    const ret = (withReturn.json?.returns ?? []).find(r => String(r.brandId) === String(A.id))
    returnNumber = ret?.returnNumber ?? null
    check('RET-scoping', 'the return is scoped to the brand whose item is going back',
      !!ret && (ret.orderItemIds ?? []).length === 1,
      ret ? `${ret.returnNumber} · brand ${ret.brandName} · items ${JSON.stringify(ret.orderItemIds)}` : 'no return for Brand A')

    // Idempotency: the same return must not be creatable twice. Only meaningful if the FIRST
    // one succeeded — otherwise a 409 here just means "there was nothing to duplicate", which
    // would read as a pass while proving nothing.
    if (withReturn.status !== 200) {
      skip('IDEM-return', 'duplicate-return check needs a successful first return')
    } else {
      const dup = await api('POST', `/orders/${order.id}/return`, {
        token: custToken, raw: true,
        body: { orderItemId: ownItem?.id, reason: 'WRONG_SIZE', description: 'regression duplicate' },
      })
      check('IDEM-return', 'duplicate return request is rejected', dup.status === 409, `HTTP ${dup.status}`)
    }

    if (returnNumber) {
      const stockBefore = (await api('GET', `/products/${A.productId}/variants`))[0].stockQuantity
      for (const step of ['approve', 'receive']) {
        const r = await api('POST', `/admin/returns/${encodeURIComponent(returnNumber)}/${step}`, { token: admin, raw: true })
        check(`RET-${step}`, `return ${step} succeeds`, r.status === 200, `HTTP ${r.status} ${r.json?.message ?? ''}`)
      }
      const stockAfter = (await api('GET', `/products/${A.productId}/variants`))[0].stockQuantity
      check('RET-restock', 'receiving the return restores stock',
        stockAfter === stockBefore + 1, `${stockBefore} → ${stockAfter}`)

      const over = await api('POST', `/admin/returns/${encodeURIComponent(returnNumber)}/refund?refundAmount=99999`, { token: admin, raw: true })
      check('REFUND-cap', 'refund above the refundable total is rejected',
        over.status === 400, `HTTP ${over.status} ${over.json?.message ?? ''}`)

      const refunded = await api('POST', `/admin/returns/${encodeURIComponent(returnNumber)}/refund`, { token: admin, raw: true })
      const row = (refunded.json?.returns ?? []).find(r => r.returnNumber === returnNumber)
      check('REFUND-amount', 'refund equals the item gross',
        refunded.status === 200 && near(row?.refundAmount, A.price),
        `refundAmount=${money(row?.refundAmount)} expected=${money(A.price)}`)

      const twice = await api('POST', `/admin/returns/${encodeURIComponent(returnNumber)}/refund`, { token: admin, raw: true })
      check('IDEM-refund', 'double refund is rejected', twice.status === 409, `HTTP ${twice.status}`)
    }
  }

  // ── commission / settlement / payout ───────────────────────────────────────
  phase('Commission, settlement and payout')
  const settlements = await api('GET', `/admin/settlements?period=${PERIOD}`, { token: admin })
  const sB = settlements.find(s => String(s.brandId) === String(B.id))

  if (!sB) {
    skip('COMM-math', `no settlement row yet for ${B.name}`)
  } else {
    // Compare the DELTA this run caused. The row aggregates the period, so any earlier order in
    // the same month would otherwise make these look like clean multiples and read as a failure.
    const b0 = before(B.id)
    const dNet = sB.commissionNet - b0.commissionNet
    const dVat = sB.commissionVat - b0.commissionVat
    const dGross = sB.commissionGross - b0.commissionGross
    const dPayout = sB.payoutAmount - b0.payoutAmount
    const dShip = (sB.shippingRevenue ?? 0) - (b0.shippingRevenue ?? 0)

    const net = Math.round((B.price / 1.19) * 100) / 100
    const cNet = Math.round(net * 0.18 * 100) / 100
    const cVat = Math.round(cNet * 0.19 * 100) / 100
    check('COMM-net', 'commission on this order is 18 % of its NET value',
      near(dNet, cNet, 0.011), `Δ commissionNet=${money(dNet)} expected ${money(cNet)} (gross ${money(B.price)} → net ${money(net)})`)
    check('COMM-vat', 'VAT is charged on that commission',
      near(dVat, cVat, 0.011), `Δ commissionVat=${money(dVat)} expected ${money(cVat)}`)
    check('PAYOUT-amount', 'payout delta = item gross + own shipping − commission gross',
      near(dPayout, B.price + dShip - dGross, 0.011),
      `Δ payout=${money(dPayout)} (gross ${money(B.price)} + Δship ${money(dShip)} − Δcomm ${money(dGross)})`)
  }

  const sA = settlements.find(s => String(s.brandId) === String(A.id))
  if (sA && returnNumber) {
    // Brand A's item was sold and then fully refunded within this run, so the NET effect on
    // commission must be zero — its shipping revenue is still retained.
    const a0 = before(A.id)
    const dGrossA = sA.commissionGross - a0.commissionGross
    check('REFUND-reversal', 'a refunded sale nets its commission back to zero',
      near(dGrossA, 0, 0.011),
      `Δ commissionGross=${money(dGrossA)} (sold then refunded) · Δ payout=${money(sA.payoutAmount - a0.payoutAmount)}`)
  } else if (!returnNumber) {
    skip('REFUND-reversal', 'no return was created')
  }

  const recon = await api('GET', '/admin/reconciliation', { token: admin })
  const dirty = (recon ?? []).filter(r => !r.clean || Math.abs(Number(r.drift)) > 0.005)
  check('RECON-drift', 'ledger and eco-account agree for every brand',
    dirty.length === 0,
    dirty.length ? `drift on brand(s): ${dirty.map(d => `${d.brandPartnerId}=${money(d.drift)}`).join(', ')}` : `${recon.length} brand(s) clean`)

  // Payout lifecycle — untested in the original audit because the calls were blocked.
  phase('Payout lifecycle  (was UNTESTED)')
  const gen = await api('POST', '/admin/payouts/generate', { token: admin, raw: true })
  if (gen.status !== 200 && gen.status !== 201) {
    fail('PAYOUT-generate', 'payout generation failed', `HTTP ${gen.status} ${gen.json?.message ?? ''}`)
  } else {
    const generated = Array.isArray(gen.json) ? gen.json : []
    pass('PAYOUT-generate', 'payouts generated', `${generated.length} payout(s)`)

    const mine = generated.filter(p => String(p.brandPartnerId) === String(B.id))
    const target = mine[0]
    if (!target) {
      skip('PAYOUT-approve', `no payout generated for ${B.name}`)
    } else {
      const appr = await api('POST', `/admin/payouts/${target.id}/approve`, { token: admin, raw: true })
      check('PAYOUT-approve', 'payout can be approved',
        appr.status === 200 && appr.json?.status === 'APPROVED', `status=${appr.json?.status ?? appr.status}`)

      const marked = await api('POST', `/admin/payouts/${target.id}/paid`, {
        token: admin, raw: true, body: { externalReference: `RG-${STAMP}` },
      })
      check('PAYOUT-paid', 'payout can be marked paid',
        marked.status === 200 && marked.json?.status === 'PAID', `status=${marked.json?.status ?? marked.status}`)

      const brandView = await api('GET', '/brand/payouts', { token: B.token })
      check('PAYOUT-brand-visible', 'the brand can see its own payout',
        (brandView ?? []).some(p => String(p.id) === String(target.id)),
        `${(brandView ?? []).length} payout(s) visible to ${B.label}`)

      const foreign = (brandView ?? []).filter(p => p.brandPartnerId && String(p.brandPartnerId) !== String(B.id))
      check('PAYOUT-scoping', "a brand cannot see another brand's payouts",
        foreign.length === 0, foreign.length ? `LEAKED ${foreign.length} foreign payout(s)` : 'own payouts only')
    }
  }

  // ── authorization guards ───────────────────────────────────────────────────
  phase('Authentication and authorization')
  const protectedRoutes = ['/users/me', '/customer/me', '/orders/me', '/wardrobe', '/brand/orders',
                           '/admin/orders', '/admin/payouts/dashboard', '/admin/brands']
  const unauth = await Promise.all(protectedRoutes.map(p => api('GET', p, { raw: true })))
  const leaky = unauth.map((r, i) => ({ p: protectedRoutes[i], s: r.status })).filter(x => x.s !== 401 && x.s !== 403)
  check('AUTH-unauthenticated', 'every protected route refuses an anonymous caller',
    leaky.length === 0, leaky.length ? leaky.map(x => `${x.p}→${x.s}`).join(', ') : `${protectedRoutes.length} routes, all 401/403`)

  const adminOnly = ['/admin/orders', '/admin/payouts/dashboard', '/admin/customers', '/admin/brands']
  for (const [label, token] of [['customer', custToken], ['brand', A.token]]) {
    const res = await Promise.all(adminOnly.map(p => api('GET', p, { token, raw: true })))
    const bad = res.map((r, i) => ({ p: adminOnly[i], s: r.status })).filter(x => x.s !== 403)
    check(`AUTH-escalation-${label}`, `a ${label} token cannot reach admin routes`,
      bad.length === 0, bad.length ? bad.map(x => `${x.p}→${x.s}`).join(', ') : 'all 403')
  }

  const other = await api('POST', '/auth/signup', { body: { email: `claude.rg+idor${STAMP}@enunas-test.com`, password: TEST_PASSWORD }, raw: true })
  if (other.status === 200 || other.status === 201) {
    const otherToken = await login(`claude.rg+idor${STAMP}@enunas-test.com`, TEST_PASSWORD)
    const idor = await api('GET', `/orders/${order.id}`, { token: otherToken, raw: true })
    check('AUTH-idor', "a customer cannot read another customer's order",
      idor.status === 403, `HTTP ${idor.status}`)
  }

  const crossWrite = await api('PUT', `/products/update/${B.productId}`, {
    token: A.token, raw: true, body: { description: 'regression cross-brand write' },
  })
  check('AUTH-product-ownership', "a brand cannot edit another brand's product",
    crossWrite.status === 403, `HTTP ${crossWrite.status} ${crossWrite.json?.message ?? ''}`)

  // Error-handling defects from the audit — reported, not fatal.
  const usersAsCustomer = await api('GET', '/users', { token: custToken, raw: true })
  if (usersAsCustomer.status === 403) pass('ERR-users', 'GET /users denies a non-admin cleanly (403)')
  else warn('ERR-users', 'GET /users still does not deny cleanly', `HTTP ${usersAsCustomer.status} (expected 403)`)

  const deprecated = await api('POST', `/admin/orders/${order.id}/return/receive`, { token: admin, raw: true })
  if (deprecated.status === 500) warn('ERR-deprecated-shim', 'deprecated return shim still 500s', 'use /admin/returns/{returnNumber}/receive')
  else pass('ERR-deprecated-shim', 'deprecated return shim no longer 500s', `HTTP ${deprecated.status}`)
}

// ── cleanup ──────────────────────────────────────────────────────────────────
async function cleanup(admin) {
  phase('Cleanup')
  if (KEEP) {
    warn('CLEAN-skipped', 'cleanup skipped (--keep) — test products remain live on the storefront')
    return
  }
  for (const { productId, listingId, token } of fixture.createdListings) {
    try {
      await api('PUT', `/products/${productId}/listings/${listingId}`, { token, body: { active: false } })
    } catch (e) { warn('CLEAN-listing', `could not deactivate listing ${listingId}`, e.message) }
  }
  for (const productId of fixture.createdProductIds) {
    try {
      await api('POST', `/admin/products/${productId}/hide`, { token: admin })
    } catch (e) { warn('CLEAN-product', `could not hide product ${productId}`, e.message) }
  }
  // Prove it, rather than assume it.
  const live = await api('GET', '/products?page=0&size=200')
  const stillVisible = (live.content ?? []).filter(p => fixture.createdProductIds.includes(p.id))
  check('CLEAN-verified', 'no fixture product is left on the public catalogue',
    stillVisible.length === 0,
    stillVisible.length ? `still visible: ${stillVisible.map(p => p.id).join(', ')}` : 'catalogue clean')
}

// ── main ─────────────────────────────────────────────────────────────────────
// Last-resort net. An unhandled rejection would otherwise tear the process down before the
// cleanup in `finally` runs, leaving fixture products live on a public storefront.
process.on('unhandledRejection', err => {
  console.error(`\n${C.r}UNHANDLED REJECTION${C.x} — fixtures may still be live, clean up manually:`)
  console.error(`  products: ${fixture.createdProductIds.join(', ') || 'none'}`)
  console.error(`  ${err?.stack?.split('\n')[0] ?? err}`)
  process.exit(1)
})

let exitCode = 0
try {
  await run()
} catch (err) {
  fail('RUN-aborted', 'run aborted by an unexpected error', err.message)
} finally {
  try {
    if (ADMIN_EMAIL && ADMIN_PASSWORD && fixture.createdProductIds.length) {
      await cleanup(await login(ADMIN_EMAIL, ADMIN_PASSWORD))
    }
  } catch (e) {
    warn('CLEAN-failed', 'cleanup could not run', e.message)
  }

  const counts = results.reduce((a, r) => (a[r.status] = (a[r.status] ?? 0) + 1, a), {})
  exitCode = (counts.FAIL ?? 0) > 0 ? 1 : 0

  if (JSON_OUT) {
    console.log(JSON.stringify({ target: API, run: STAMP, counts, results, fixture: {
      brands: fixture.brands.map(b => ({ label: b.label, id: b.id, email: b.email, productId: b.productId })),
      customer: fixture.customer?.email, order: fixture.order?.orderNumber,
    } }, null, 2))
  } else {
    console.log(`\n${C.b}Summary${C.x}`)
    console.log(`  ${C.g}${counts.PASS ?? 0} passed${C.x} · ${C.r}${counts.FAIL ?? 0} failed${C.x} · ` +
                `${C.y}${counts.WARN ?? 0} warnings${C.x} · ${C.d}${counts.SKIP ?? 0} skipped${C.x}`)
    if (counts.FAIL) {
      console.log(`\n${C.r}Failures${C.x}`)
      for (const r of results.filter(x => x.status === 'FAIL')) {
        console.log(`  ${r.id} — ${r.title}`)
        if (r.detail) console.log(`    ${C.d}${r.detail}${C.x}`)
      }
    }
    console.log(`\n${C.b}Left behind${C.x} ${C.d}(cannot be deleted — FK constraints)${C.x}`)
    for (const b of fixture.brands) console.log(`  ${C.d}brand ${b.id} ${b.name} — reused, not created${C.x}`)
    if (fixture.customer) console.log(`  customer   ${fixture.customer.email}`)
    if (fixture.order) console.log(`  order      ${fixture.order.orderNumber}`)
    console.log(`  ${C.d}account password: ${TEST_PASSWORD}${C.x}`)
  }
  process.exit(exitCode)
}
