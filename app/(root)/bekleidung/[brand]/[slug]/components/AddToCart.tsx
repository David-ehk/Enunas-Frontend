"use client"

import React from 'react'
import { useCart } from '@/app/context/CartContext'
import { Product } from '@/lib/product'
import { Color } from '@/lib/color'

interface AddToCartProps {
  selectedSize?: string | null
  product: Product
  selectedColor: Color | null
}

function AddToCart({ selectedSize = null, product, selectedColor }: AddToCartProps) {
  const { addToCart, openCart } = useCart()
  const hasSizeSelected = selectedSize !== null

  const handleAddToCart = () => {
    if (!hasSizeSelected || !selectedSize) return

    addToCart({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      currency: product.currency,
      size: selectedSize,
      color: selectedColor
        ? { id: selectedColor.id, name: selectedColor.name, hex: selectedColor.hex }
        : undefined,
      image: product.images[0] ?? '',
    })
    openCart()
  }

  return (
    <button
      className="relative w-full py-4 px-6 tracking-widest text-white bg-[#370E4D] overflow-hidden group transition-colors duration-600 disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={handleAddToCart}
      disabled={!hasSizeSelected}
    >
      <span className="absolute left-1/2 -translate-x-1/2 top-[10%] w-full h-[1px] bg-white transition-all duration-500 ease-out group-hover:w-[75%]"></span>

      <h3 className="relative z-10 text-base sm:text-lg">
        {hasSizeSelected ? "Zum Warenkorb hinzufügen" : "Wählen Sie eine Größe aus"}
      </h3>

      <span className="absolute left-1/2 -translate-x-1/2 bottom-[10%] w-full h-[1px] bg-white transition-all duration-500 ease-out group-hover:w-[75%]"></span>
    </button>
  )
}

export default AddToCart
