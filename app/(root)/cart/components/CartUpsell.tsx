'use client'

import { useCart } from '@/app/context/CartContext'
import { pickSuggestions } from '@/lib/cartSuggestions'
import { formatEuro } from '@/lib/format'
import { generateSlug } from '@/lib/product'
import CartProductRow from './CartProductRow'
import { useCartShelf } from './useCartShelf'

/** The Schaufenster's cart picks, else the newest products, listed under the items on /cart. */
export default function CartUpsell() {
  const { cartItems } = useCart()
  const shelf = useCartShelf(cartItems.length > 0)
  const picks = shelf ? pickSuggestions(cartItems, shelf.products, shelf.curation) : []
  if (picks.length === 0) return null

  return (
    <section className="enu-upsell" aria-label="Passend zu deinem Warenkorb">
      {picks.map(p => (
        <CartProductRow
          key={p.id}
          image={p.images[0] ?? ''}
          brand={p.brandName}
          name={p.name}
          price={formatEuro(p.price)}
          href={`/bekleidung/${generateSlug(p.brandName)}/${p.slug}`}
          product={p}
          onNavigate={() => {}}
          upsell
        />
      ))}
    </section>
  )
}
