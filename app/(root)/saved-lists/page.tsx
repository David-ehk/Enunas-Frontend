'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/app/context/AuthContext'
import { wardrobeApi, apiProductToCardShape } from '@/lib/api'
import type { ProductCardShape } from '@/lib/api'
import PopularProductCard from '@/app/Homepage/components/PopularProductCard'
import type { ApiWardrobeItem } from '@/types/api'

export default function SavedListsPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [items, setItems] = useState<ApiWardrobeItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }
    wardrobeApi.getAll()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  async function handleRemove(id: string) {
    try {
      await wardrobeApi.remove(id)
      setItems(prev => prev.filter(i => i.id !== id))
    } catch {
      // silently fail
    }
  }

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-enunas-gray-light border-t-enunas-purple rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <h1
          className="text-3xl text-enunas-black mb-4"
          style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
        >
          Deine Favoriten
        </h1>
        <p className="font-league-spartan text-sm text-enunas-gray-medium mb-8">
          Melde dich an, um deine gespeicherten Artikel zu sehen.
        </p>
        <Link
          href="/account"
          className="px-8 py-4 bg-enunas-purple text-white font-league-spartan text-sm tracking-[0.15em] uppercase hover:bg-enunas-purple-light transition-colors duration-200"
        >
          Anmelden
        </Link>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="text-center pt-16 pb-10 px-6">
        <h1
          className="text-3xl lg:text-4xl text-enunas-black font-light tracking-[0.02em]"
          style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
        >
          Deine Favoriten
        </h1>
        <p className="font-league-spartan text-[10px] uppercase tracking-[0.2em] text-enunas-gray-medium mt-4">
          {items.length} {items.length === 1 ? 'Artikel' : 'Artikel'}
        </p>
      </div>

      <section className="px-4 lg:px-8 xl:px-12 pb-24">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-cormorant text-2xl text-enunas-gray-medium mb-6">
              Du hast noch keine Artikel gespeichert.
            </p>
            <Link
              href="/bekleidung"
              className="font-league-spartan text-xs uppercase tracking-[0.15em] text-enunas-purple border border-enunas-purple px-8 py-3 hover:bg-enunas-purple hover:text-white transition-colors duration-200"
            >
              Entdecken
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 max-w-[1800px] mx-auto">
            {items.map(item => {
              const card: ProductCardShape = apiProductToCardShape(item.product)
              return (
                <div key={item.id} className="relative group">
                  <PopularProductCard {...card} />
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="absolute top-2 right-2 z-10 w-7 h-7 bg-white border border-enunas-gray-light flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:border-enunas-error hover:text-enunas-error"
                    aria-label="Aus Favoriten entfernen"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <line x1="1" y1="1" x2="11" y2="11" />
                      <line x1="11" y1="1" x2="1" y2="11" />
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
