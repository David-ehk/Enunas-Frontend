'use client'
import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react'

// Local-only wishlist (Version 2 stopgap — see project notes). POST /wardrobe was assumed to be
// a "save this product" endpoint but is actually a different feature entirely (a manually
// described digital-closet item: category/brand/color/styleTag, no link to a real product at
// all) — there is currently no backend endpoint that can save an existing product against a
// customer account. Until one exists, the heart button persists to localStorage only, exactly
// like CartContext does for the cart: it works per-device, survives reloads, but does not sync
// across devices or logins.
export interface WishlistItem {
  id: string
  imgURL: string
  brandName: string
  productName: string
  price: string | null
  originalPrice?: string | null
  href: string
  colours: { hex: string; name: string }[]
  createdAt: Date | string
  sizes?: string[]
  catalogue?: string[]
  /** Set when the saved product was a "Coming Soon" preview at save time. */
  preview?: boolean
  releaseDate?: string | null
}

interface WishlistContextType {
  items: WishlistItem[]
  isSaved: (id: string) => boolean
  // Takes the full item, not just an id — there is no backend to fetch product details from
  // when re-hydrating, so whatever gets saved has to already carry everything a product card
  // needs to render itself later.
  toggle: (item: WishlistItem) => void
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

const STORAGE_KEY = 'enunas_wishlist'

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([])
  // Guards the persist effect below from firing with the initial empty array before the
  // load-from-storage effect has had a chance to run — without this, mounting the provider would
  // immediately overwrite a real saved list with [] for one render.
  const hydrated = useRef(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setItems(JSON.parse(saved))
    } catch {
      // corrupted or unavailable storage (private mode, quota) — start empty rather than crash
    } finally {
      hydrated.current = true
    }
  }, [])

  useEffect(() => {
    if (!hydrated.current) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // storage full/unavailable — saving still works for this session, just won't persist
    }
  }, [items])

  const isSaved = useCallback(
    (id: string) => items.some(i => i.id === id),
    [items],
  )

  const toggle = useCallback((item: WishlistItem) => {
    setItems(prev =>
      prev.some(i => i.id === item.id)
        ? prev.filter(i => i.id !== item.id)
        : [...prev, item]
    )
  }, [])

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
