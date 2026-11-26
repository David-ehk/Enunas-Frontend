'use client'

import { useEffect, useState } from 'react'
import { productApi, storefrontApi } from '@/lib/api'
import { createCartShelfLoader, type CartShelf } from '@/lib/cartShelf'

// Module level, so the 5-minute cache survives drawer re-renders and page changes.
const loadShelf = createCartShelfLoader({
  listProducts: async () => (await productApi.list({ size: 100 })).content,
  getCuration: () => storefrontApi.getCuration(),
})

export function useCartShelf(enabled: boolean): CartShelf | null {
  const [shelf, setShelf] = useState<CartShelf | null>(null)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    loadShelf()
      .then(s => { if (!cancelled) setShelf(s) })
      // The drawer works without suggestions; the next opening tries again.
      .catch(() => {})
    return () => { cancelled = true }
  }, [enabled])

  return shelf
}
