// Preloading every font file (19 of them, about 1.7 MB) delayed the homepage hero video by
// seconds on slow connections. Fonts load when the CSS first needs them instead.
import { describe, it, expect, vi } from 'vitest'

type FontOptions = { preload?: boolean; src?: { path: string }[] }

const fontOptions = vi.hoisted(() => [] as { preload?: boolean; src?: { path: string }[] }[])

vi.mock('next/font/local', () => ({
  default: (options: FontOptions) => {
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

  // They load only when needed, so text shows in a stand-in font until they arrive: keep them small.
  it('serves every font compressed, as WOFF2', async () => {
    await import('./layout')
    const paths = fontOptions.flatMap(options => (options.src ?? []).map(face => face.path))
    expect(paths.length).toBeGreaterThan(0)
    expect(paths.filter(path => !path.endsWith('.woff2'))).toEqual([])
  })
})
