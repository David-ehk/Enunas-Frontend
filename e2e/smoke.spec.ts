import { test, expect } from '@playwright/test'

// Backend-agnostic smoke test: the app boots and core client interactions work even with no
// product data loaded. Asserts wordmark renders, the search panel opens, the cart sidebar
// opens and closes, and a data route loads without a runtime error overlay.
//
// The navbar renders separate mobile/desktop copies of some controls, so `:visible` selectors
// are used to target the one shown at the current viewport (default desktop 1280×720).

test('homepage renders the Enunas wordmark', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('link', { name: 'Enunas' }).first()).toBeVisible()
})

test('search panel opens from the navbar', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const searchBtn = page.locator('button[aria-label="Suche öffnen"]:visible').first()
  // Retry the click: with domcontentloaded the button can be present before React hydrates,
  // so the first click may land before the handler is attached. setSearch(true) is idempotent.
  await expect(async () => {
    await searchBtn.click()
    await expect(page.getByPlaceholder('SUCHEN')).toBeVisible({ timeout: 1000 })
  }).toPass()
})

test('cart sidebar opens and closes', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const drawer = page.locator('aside.enu-cart')
  const cartBtn = page.locator('button[aria-label^="Warenkorb mit"]:visible').first()
  // Open: retry-click past the hydration race; openCart() is idempotent.
  await expect(async () => {
    await cartBtn.click()
    await expect(drawer).toHaveClass(/is-open/, { timeout: 1000 })
  }).toPass()
  await expect(page.getByText('Dein Warenkorb ist leer')).toBeVisible()
  // Close via Escape (the drawer registers an Escape handler) → is-open class drops.
  await page.keyboard.press('Escape')
  await expect(drawer).not.toHaveClass(/is-open/)
})

test('/bekleidung route loads without a runtime error', async ({ page }) => {
  await page.goto('/bekleidung', { waitUntil: 'domcontentloaded' })
  // Next.js dev error overlay would carry this text; assert it is absent.
  await expect(page.locator('text=Unhandled Runtime Error')).toHaveCount(0)
  await expect(page.locator('body')).toBeVisible()
})
