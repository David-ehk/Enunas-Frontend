import { describe, it, expect, afterEach, vi } from 'vitest'
import { getBaseUrl } from './fetcher'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('getBaseUrl', () => {
  it('returns NEXT_PUBLIC_API_URL when set', () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.enunas.com')
    expect(getBaseUrl()).toBe('https://api.enunas.com')
  })

  it('throws in production when the URL is unset (no silent localhost)', () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', '')
    vi.stubEnv('NODE_ENV', 'production')
    expect(() => getBaseUrl()).toThrow(/NEXT_PUBLIC_API_URL is not set/)
  })

  it('falls back to localhost outside production', () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', '')
    vi.stubEnv('NODE_ENV', 'development')
    expect(getBaseUrl()).toBe('http://localhost:8080')
  })
})
