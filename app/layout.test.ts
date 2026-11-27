// Preloading every font file (19 of them, about 1.7 MB) delayed the homepage hero video by
// seconds on slow connections. Fonts load when the CSS first needs them instead.
import { describe, it, expect, vi } from 'vitest'

const fontOptions = vi.hoisted(() => [] as { preload?: boolean }[])

vi.mock('next/font/local', () => ({
  default: (options: { preload?: boolean }) => {
    fontOptions.push(options)
    return { variable: 'font' }
  },
}))
vi.mock('./globals.css', () => ({}))
vi.mock('./providers', () => ({ PostHogProvider: () => null }))

describe('root layout fonts', () => {
  it('preloads none of them', async () => {
    await import('./layout')
    expect(fontOptions.length).toBeGreaterThan(0)
    expect(fontOptions.filter(options => options.preload !== false)).toEqual([])
  })
})
