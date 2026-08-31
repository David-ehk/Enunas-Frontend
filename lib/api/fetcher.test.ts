import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getBaseUrl, fetcher, FetchError, setOnUnauthorized } from './fetcher'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
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

describe('fetcher error envelope', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.test')
  })

  it('translates a 403 and keeps the English string for logs', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ timestamp: 't', status: 403, error: 'Forbidden', message: 'Access denied', path: '/admin/orders' }),
      { status: 403 },
    )))
    const err = await fetcher('/admin/orders', { auth: false }).catch((e) => e)
    expect(err).toBeInstanceOf(FetchError)
    expect(err.status).toBe(403)
    expect(err.message).toMatch(/Berechtigung/)
    expect(err.serverMessage).toBe('Access denied')
  })

  it('passes a domain 409 through verbatim', async () => {
    const msg = 'Product 41 still has listings. Remove them first.'
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ status: 409, error: 'Conflict', message: msg, path: '/products/delete/41' }),
      { status: 409 },
    )))
    const err = await fetcher('/products/delete/41', { auth: false }).catch((e) => e)
    expect(err.message).toBe(msg)
  })
})

describe('401 handling', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.test')
    localStorage.clear()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ status: 401, error: 'Unauthorized', message: 'Authentication required', path: '/users/me' }),
      { status: 401 },
    )))
  })

  it('does NOT clear auth state when no token was sent', async () => {
    const onUnauth = vi.fn()
    setOnUnauthorized(onUnauth)
    await fetcher('/users/me').catch(() => {})
    expect(onUnauth).not.toHaveBeenCalled()
  })

  it('clears auth state when a token was sent and rejected', async () => {
    localStorage.setItem('enunas_token', 'stale-jwt')
    const onUnauth = vi.fn()
    setOnUnauthorized(onUnauth)
    await fetcher('/users/me').catch(() => {})
    expect(onUnauth).toHaveBeenCalledTimes(1)
  })

  it('does NOT clear auth state for an explicitly anonymous request', async () => {
    localStorage.setItem('enunas_token', 'valid-jwt')
    const onUnauth = vi.fn()
    setOnUnauthorized(onUnauth)
    await fetcher('/products/1', { auth: false }).catch(() => {})
    expect(onUnauth).not.toHaveBeenCalled()
  })
})
