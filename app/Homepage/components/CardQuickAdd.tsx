"use client"

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import * as Dialog from '@radix-ui/react-dialog'
import { useCart } from '@/app/context/CartContext'
import { productApi } from '@/lib/api'
import { cardQuickAdd } from '@/lib/cardQuickAdd'
import { quickAdd, type QuickAddResult } from '@/lib/quickAdd'
import SizeSheet from '@/components/SizeSheet'
import type { ApiProduct } from '@/types/api'

const ADDED_FEEDBACK_MS = 2000

/**
 * Phone-only "+" for a product card: tapping it opens a sheet from the bottom, where the size is
 * picked first and added with the button below. Must sit inside the card's `relative` box, outside
 * its link.
 */
export default function CardQuickAdd({ product, href }: { product: ApiProduct; href: string }) {
  const { cartItems, addToCart } = useCart()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<QuickAddResult['status'] | null>(null)
  // A ref, not just state: a second tap can land before the re-render disables the button.
  const busy = useRef(false)

  useEffect(() => {
    if (result !== 'added') return
    const timer = window.setTimeout(() => setResult(null), ADDED_FEEDBACK_MS)
    return () => window.clearTimeout(timer)
  }, [result])

  const offer = cardQuickAdd(product)
  if (!offer) return null
  const { colour, sizes, manyColours } = offer

  async function add(size: string) {
    if (busy.current) return
    busy.current = true
    setPending(true)
    setResult(null)
    const outcome = await quickAdd({
      product, colour, size, cartItems,
      getListings: id => productApi.getListings(id),
      addToCart,
    })
    busy.current = false
    setPending(false)
    setResult(outcome.status)
    if (outcome.status === 'added') setOpen(false)
  }

  const added = result === 'added'

  return (
    <SizeSheet
      open={open}
      onOpenChange={next => { setOpen(next); setResult(null) }}
      productName={product.name}
      label={manyColours ? colour : 'Größe'}
      sizes={sizes}
      pending={pending}
      onPick={() => setResult(null)}
      onConfirm={add}
      message={
        result === 'atLimit' ? 'Maximale Menge im Warenkorb'
        : result === 'login' ? <Link href="/account" className="underline">Zum Hinzufügen bitte anmelden</Link>
        : result === 'failed' ? <>Hat nicht geklappt. <Link href={href} className="underline">Zum Produkt</Link></>
        : null
      }
    >
      <div className="md:hidden font-league-spartan">
        {/* Same box as the card's 3/4 photo, so the "+" sits exactly on the photo. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex aspect-[3/4] flex-col justify-end">
          {/* Bottom counterpart of the card's heart: same inset, tap area and icon size. The white
              halo keeps it readable on dark photos. */}
          <Dialog.Trigger
            aria-label={`${product.name} schnell hinzufügen`}
            className="pointer-events-auto absolute bottom-1.5 right-1.5 p-2 text-enunas-black"
          >
            <svg
              className="h-4 w-4 [filter:drop-shadow(0_0_2px_white)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d={added ? 'M4 13l5 5L20 6' : 'M12 4v16M4 12h16'} />
            </svg>
          </Dialog.Trigger>
        </div>
        <span className="sr-only" role="status">{added ? `${product.name} wurde zum Warenkorb hinzugefügt` : ''}</span>
      </div>
    </SizeSheet>
  )
}
