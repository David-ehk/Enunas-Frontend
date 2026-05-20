'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus } from 'lucide-react'
import { useCart, type CartItem } from '@/app/context/CartContext'
import { formatEuro } from '@/lib/format'

interface CartItemRowProps {
  item: CartItem;
}

export default function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, removeFromCart } = useCart()
  const lineTotal = item.price * item.quantity

  return (
    <article className="grid grid-cols-[110px_1fr] sm:grid-cols-[140px_1fr_auto] gap-5 sm:gap-6 py-7 border-b border-enunas-gray-light">
      <Link
        href={item.productPath ?? '#'}
        className="relative w-[110px] sm:w-[140px] aspect-[3/4] bg-enunas-off-white overflow-hidden block shrink-0 group/img"
      >
        {item.image && (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(min-width: 640px) 140px, 110px"
            className="object-cover transition-transform duration-700 ease-out-expo group-hover/img:scale-105"
          />
        )}
      </Link>

      <div className="flex flex-col">
        <p className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-gray-medium mb-1.5">
          {item.brand}
        </p>
        <Link
          href={item.productPath ?? '#'}
          className="font-cormorant text-lg sm:text-xl text-enunas-black leading-tight mb-3 hover:opacity-60 transition-opacity duration-300"
        >
          {item.name}
        </Link>

        <dl className="font-league-spartan text-xs text-enunas-gray-medium space-y-1 mb-4">
          {item.color && (
            <div>
              <dt className="inline">Farbe: </dt>
              <dd className="inline text-enunas-black">{item.color.name}</dd>
            </div>
          )}
          <div>
            <dt className="inline">Größe: </dt>
            <dd className="inline text-enunas-black">{item.size}</dd>
          </div>
        </dl>

        <div
          className="flex items-center border border-enunas-gray-light w-fit"
          role="group"
          aria-label={`Menge für ${item.name}`}
        >
          <button
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="w-9 h-9 flex items-center justify-center border-r border-enunas-gray-light hover:bg-enunas-off-white transition-colors duration-300"
            aria-label="Menge verringern"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-10 text-center font-league-spartan text-sm text-enunas-black">
            {item.quantity}
          </span>
          <button
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="w-9 h-9 flex items-center justify-center border-l border-enunas-gray-light hover:bg-enunas-off-white transition-colors duration-300"
            aria-label="Menge erhöhen"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex justify-between items-center mt-5 sm:hidden">
          <button
            onClick={() => removeFromCart(item.id)}
            className="font-league-spartan text-[11px] tracking-[0.1em] uppercase text-enunas-gray-medium hover:text-enunas-error transition-colors duration-300"
          >
            Entfernen
          </button>
          <p className="font-league-spartan text-base font-light text-enunas-black">
            {formatEuro(lineTotal)}
          </p>
        </div>
      </div>

      <div className="hidden sm:flex flex-col justify-between items-end text-right">
        <button
          onClick={() => removeFromCart(item.id)}
          className="font-league-spartan text-[11px] tracking-[0.1em] uppercase text-enunas-gray-medium hover:text-enunas-error transition-colors duration-300"
        >
          Entfernen
        </button>
        <p className="font-league-spartan text-lg font-light text-enunas-black">
          {formatEuro(lineTotal)}
        </p>
      </div>
    </article>
  )
}
