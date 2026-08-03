'use client'
import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react'
import { wardrobeApi } from '@/lib/api'
import type { ApiWardrobeItem } from '@/types/api'
import { useAuth } from './AuthContext'

interface WishlistContextType {
  items: ApiWardrobeItem[]
  isSaved: (productId: string) => boolean
  toggle: (productId: string) => Promise<void>
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [items, setItems] = useState<ApiWardrobeItem[]>([])

  useEffect(() => {
    if (!isAuthenticated) {
      setItems([])
      return
    }
    wardrobeApi.getAll()
      .then(setItems)
      .catch(() => setItems([]))
  }, [isAuthenticated])

  const isSaved = useCallback(
    (productId: string) => items.some(i => i.product.id === productId),
    [items],
  )

  const toggle = useCallback(async (productId: string) => {
    const existing = items.find(i => i.product.id === productId)
    if (existing) {
      setItems(prev => prev.filter(i => i.id !== existing.id))
      try {
        await wardrobeApi.remove(existing.id)
      } catch {
        setItems(prev => [...prev, existing])
      }
    } else {
      try {
        const created = await wardrobeApi.add(productId)
        setItems(prev => [...prev, created])
      } catch {
        // silently fail — button just doesn't visually flip
      }
    }
  }, [items])

  return (
    <WishlistContext.Provider value={{ items, isSaved, toggle }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist muss innerhalb von WishlistProvider verwendet werden')
  }
  return context
}
