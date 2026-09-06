'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import Navbar from '@/app/Homepage/components/navbar'
import Footer from '@/app/Homepage/components/footer'
import { useWishlist } from '@/app/context/WishlistContext'
import PopularProductCard from '@/app/Homepage/components/PopularProductCard'
import { segmentBreakdown } from '@/lib/product'

export default function SavedListsPage() {
  const { items } = useWishlist()

  // Which catalogues the list leans towards. A product counts once per segment,
  // so the totals can exceed items.length when a piece sits in two catalogues.
  const breakdown = useMemo(() => segmentBreakdown(items), [items])

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white pb-20" style={{ paddingTop: '96px' }}>
        <div className="text-center py-10 px-6">
          <h1
            className="text-3xl lg:text-4xl text-enunas-black font-light tracking-[0.02em]"
            style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
          >
            Deine Favoriten
          </h1>
          <p className="font-league-spartan text-[10px] uppercase tracking-[0.2em] text-enunas-gray-medium mt-4">
            {items.length} {items.length === 1 ? 'Artikel' : 'Artikel'}
          </p>

          {breakdown.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
              {breakdown.map((s, i) => (
                <span
                  key={s.segment}
                  className="font-league-spartan text-[10px] uppercase tracking-[0.16em]"
                  style={{
                    // The leading catalogue is the answer to "what do I save most?" —
                    // everything else stays quiet so the ranking reads at a glance.
                    color: i === 0 ? '#370E4D' : '#6B6B6B',
                    fontWeight: i === 0 ? 500 : 400,
                  }}
                >
                  {s.label} <span style={{ fontVariantNumeric: 'tabular-nums' }}>{s.count}</span>
                  {i < breakdown.length - 1 && (
                    <span className="ml-3" style={{ color: '#E8E8E8' }}>·</span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>

        <section className="px-4 lg:px-8 xl:px-12">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-cormorant text-2xl text-enunas-gray-medium mb-6">
                Du hast noch keine Artikel gespeichert.
              </p>
              <Link
                href="/bekleidung"
                className="group relative inline-block overflow-hidden"
                style={{
                  padding: '16px 32px',
                  background: '#370E4D',
                  fontFamily: 'var(--font-Cormorant-Garamond)',
                  fontSize: '18px',
                  fontWeight: 400,
                  letterSpacing: '0.06em',
                  color: 'white',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#250838' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#370E4D' }}
              >
                <span className="absolute left-1/2 -translate-x-1/2 top-[14%] w-full h-[1px] bg-white/60 transition-all duration-500 ease-out group-hover:w-[70%]" />
                <span className="relative z-10">Entdecken</span>
                <span className="absolute left-1/2 -translate-x-1/2 bottom-[14%] w-full h-[1px] bg-white/60 transition-all duration-500 ease-out group-hover:w-[70%]" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 max-w-[1800px] mx-auto">
              {items.map(item => (
                <PopularProductCard key={item.id} {...item} />
              ))}
            </div>
          )}
        </section>
      </div>
      <footer className="bg-enunas-purple w-full px-4 sm:px-8 lg:px-16 pt-12 sm:pt-24 pb-8">
        <Footer />
      </footer>
    </>
  )
}
