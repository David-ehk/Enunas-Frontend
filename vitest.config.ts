import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// Vitest config for the Enunas frontend. The `@/` alias mirrors tsconfig.json
// ("@/*": ["./*"]) so test imports resolve the same way the app does. jsdom gives
// us a DOM for React Testing Library + localStorage in the unit/integration tests.
// Playwright e2e lives under e2e/ and is run separately (excluded here).
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'e2e/**'],
  },
})
