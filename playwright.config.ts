import { defineConfig, devices } from '@playwright/test'

// Smoke-level e2e against the dev server. The suite is intentionally backend-agnostic:
// it asserts the app boots and core client interactions work even when no product data
// loads. Playwright starts (or reuses) `npm run dev` on :3000.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    // The homepage has a hero video that never fires the `load` event in headless, so default
    // to domcontentloaded for navigations — appropriate for smoke-level assertions.
    navigationTimeout: 30_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
