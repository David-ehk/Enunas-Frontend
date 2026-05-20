// ============================================================
// ENUNAS — Wishlist preview row on the account dashboard
// Drop into: enunas/app/(root)/account/components/WishlistPreview.tsx
// Reuses PopularProductCard for visual parity with rest of site.
// ============================================================

import Link from 'next/link'
import PopularProductCard from '@/app/Homepage/components/PopularProductCard'
import type { WishlistEntry } from '@/lib/account'

interface WishlistPreviewProps {
  items: WishlistEntry[];
}

export default function WishlistPreview({ items }: WishlistPreviewProps) {
  if (items.length === 0) {
    return (
      <section>
        <h2 className="font-cormorant text-2xl md:text-[28px] font-normal text-enunas-black mb-6">
          Wunschliste
        </h2>
        <div className="border border-enunas-gray-light p-12 text-center">
          <p className="font-league-spartan text-sm text-enunas-gray-medium">
            Du hast noch keine Pieces gespeichert.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section>
      <div className="flex justify-between items-baseline mb-6">
        <h2 className="font-cormorant text-2xl md:text-[28px] font-normal text-enunas-black">
          Aus deiner Wunschliste
        </h2>
        <Link
          href="/saved-lists"
          className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-black underline underline-offset-4 hover:text-enunas-purple transition-colors duration-300"
        >
          Alle ansehen
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
        {items.map((item) => (
          <PopularProductCard
            key={item.id}
            imgURL={item.imgURL}
            brandName={item.brandName}
            productName={item.productName}
            price={item.price}
            href={item.href}
            colours={item.colours}
            createdAt={item.createdAt}
            sizes={item.sizes}
            catalogue={item.catalogue}
          />
        ))}
      </div>
    </section>
  )
}
