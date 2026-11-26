import { describe, it, expect, vi } from 'vitest'
import { createCartShelfLoader } from './cartShelf'
import type { CurationData } from '@/types/api'

const curation: CurationData = {
  trendy: [], drops: [],
  recommendations: { streetwear: [], cultural: [], athleisure: ['5'], experimental: [], star: [] },
}

function setup() {
  let time = 0
  const listProducts = vi.fn().mockResolvedValue([])
  const getCuration = vi.fn().mockResolvedValue(curation)
  const load = createCartShelfLoader({ listProducts, getCuration, now: () => time })
  return { load, listProducts, getCuration, at: (t: number) => { time = t } }
}

describe('createCartShelfLoader', () => {
  it('shares one load between concurrent calls', async () => {
    const { load, listProducts, getCuration } = setup()
    await Promise.all([load(), load()])
    expect(listProducts).toHaveBeenCalledTimes(1)
    expect(getCuration).toHaveBeenCalledTimes(1)
  })

  it('reuses the result for 5 minutes and reloads after', async () => {
    const { load, listProducts, at } = setup()
    await load()
    at(299_999)
    await load()
    expect(listProducts).toHaveBeenCalledTimes(1)
    at(300_000)
    await load()
    expect(listProducts).toHaveBeenCalledTimes(2)
  })

  it('does not cache a failed product load', async () => {
    const { load, listProducts } = setup()
    listProducts.mockRejectedValueOnce(new Error('down'))
    await expect(load()).rejects.toThrow('down')
    await expect(load()).resolves.toEqual({ products: [], curation })
    expect(listProducts).toHaveBeenCalledTimes(2)
  })

  it('still returns products when curation fails, without caching that', async () => {
    const { load, getCuration } = setup()
    getCuration.mockRejectedValueOnce(new Error('down'))
    await expect(load()).resolves.toEqual({ products: [], curation: null })
    await expect(load()).resolves.toEqual({ products: [], curation })
    expect(getCuration).toHaveBeenCalledTimes(2)
  })
})
