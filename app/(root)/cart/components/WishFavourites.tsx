'use client'

import { useState } from 'react'
import { useCart } from '@/app/context/CartContext'
import type { WishlistItem } from '@/app/context/WishlistContext'
import { pickFavourites } from '@/lib/wishPicks'
import type { ApiProduct } from '@/types/api'
import CartProductRow from './CartProductRow'

/** The three favourites that go best with the cart. */
export default function WishFavourites({ favourites, products, formatPrice, onNavigate }: {
  favourites: WishlistItem[]
  products: ApiProduct[]
  formatPrice: (euros: number) => string
  onNavigate: () => void
}) {
  const { cartItems } = useCart()
  // Matched against the cart as it was when the list opened, so adding a piece does not swap the
  // rows around under the shopper's finger: it stays put and reads "Im Warenkorb".
  const [linesAtOpen] = useState(cartItems)
  const productById = new Map(products.map(p => [String(p.id), p]))

  return pickFavourites(favourites, linesAtOpen, products).map(saved => {
    const product = productById.get(String(saved.id))
    return (
      <CartProductRow
        key={saved.id}
        image={saved.imgURL}
        brand={saved.brandName}
        name={saved.productName}
        price={product?.preview ? null : product?.available ? formatPrice(product.price) : saved.price}
        href={saved.href}
        product={product}
        onNavigate={onNavigate}
        lockColour
      />
    )
  })
}
