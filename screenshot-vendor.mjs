import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';

const BASE = 'http://localhost:3000';
const OUT  = './screenshots';

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

// Navigate to login page first
await page.goto(`${BASE}/dashboard/login`, { waitUntil: 'networkidle' });
await page.screenshot({ path: `${OUT}/01-login.png`, fullPage: true });
console.log('✓ login page');

// Fill login form - try to find email/password fields
const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"], input[placeholder*="Mail"]').first();
const passInput  = page.locator('input[type="password"]').first();

if (await emailInput.isVisible()) {
  await emailInput.fill('admin@enunas.de');
  await passInput.fill('password123');
  await page.screenshot({ path: `${OUT}/02-login-filled.png`, fullPage: true });

  const submitBtn = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Anmelden"), button:has-text("Einloggen")').first();
  if (await submitBtn.isVisible()) {
    await submitBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${OUT}/03-after-login.png`, fullPage: true });
    console.log('✓ after login attempt');
  }
}

// Inject a mock BRAND_PARTNER token to bypass auth (frontend-only guard)
// so we can see the vendor dashboard UI
await page.goto(`${BASE}/dashboard/vendor`);
await page.evaluate(() => {
  // Set a fake token so the fetcher doesn't block, but the auth guard
  // checks user.role from /users/me which will 401 or return real data.
  // Instead, let's just bypass by mocking the AuthContext state.
  localStorage.setItem('enunas_token', 'preview-mode');
});
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/04-vendor-with-token.png`, fullPage: true });
console.log('✓ vendor dashboard (with token)');

// Screenshot the raw dashboard/vendor page structure (pre-auth)
await page.goto(`${BASE}/dashboard/vendor`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);
await page.screenshot({ path: `${OUT}/05-vendor-full.png`, fullPage: true });
console.log('✓ vendor full');

// Also grab admin for reference
await page.goto(`${BASE}/dashboard/admin`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2000);
await page.screenshot({ path: `${OUT}/06-admin.png`, fullPage: true });
console.log('✓ admin dashboard');

await browser.close();
console.log('\nDone — screenshots in', OUT);
