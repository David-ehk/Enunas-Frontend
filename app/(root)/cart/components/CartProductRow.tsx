'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/app/context/CartContext'
import { productApi } from '@/lib/api'
import { isSoldOut } from '@/lib/cartSuggestions'
import { quickAdd, sizeChoices, variantColours, type QuickAddResult } from '@/lib/quickAdd'
import type { ApiProduct } from '@/types/api'

/** A suggestion or favourite in the cart drawer. Styles live in CartSidebar's stylesheet. */
export default function CartProductRow({ image, brand, name, price, href, product, onNavigate }: {
  image: string
  brand: string
  name: string
  price: string | null
  href: string
  /** Live catalogue data. Without it the row is only a link: stock and sizes are unknown. */
  product?: ApiProduct
  onNavigate: () => void
}) {
  const { cartItems, addToCart } = useCart()
  const [choosing, setChoosing] = useState(false)
  const [pickedColour, setPickedColour] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<QuickAddResult['status'] | null>(null)
  // A ref, not just state: a second tap can land before the re-render disables the button.
  const busy = useRef(false)

  const colours = product ? variantColours(product) : []
  const colour = pickedColour
    ?? colours.find(c => product && sizeChoices(product, c).some(s => !s.unavailable))
    ?? colours[0]

  const status = !product ? null : product.preview ? 'Coming Soon' : isSoldOut(product) ? 'Ausverkauft' : null
  const canAdd = !!product && !status && product.available && colours.length > 0

  async function add(size: string, fromColour: string) {
    if (!product || busy.current) return
    busy.current = true
    setPending(true)
    setResult(null)
    const outcome = await quickAdd({
      product, colour: fromColour, size, cartItems,
      getListings: id => productApi.getListings(id),
      addToCart,
    })
    busy.current = false
    setPending(false)
    setResult(outcome.status)
    if (outcome.status === 'added') setChoosing(false)
  }

  function handleAddClick() {
    const only = product?.variants?.length === 1 ? product.variants[0] : null
    if (only) add(only.size, only.color)
    else setChoosing(open => !open)
  }

  return (
    <div className="enu-pick">
      <Link href={href} onClick={onNavigate} className="enu-pick-media" tabIndex={-1} aria-hidden>
        {image && <Image src={image} alt="" fill sizes="72px" className="object-cover" />}
      </Link>

      <div className="enu-pick-main">
        <div className="enu-pick-top">
          <div style={{ minWidth: 0 }}>
            <div className="enu-item-brand">{brand}</div>
            <Link href={href} onClick={onNavigate} className="enu-pick-name">{name}</Link>
          </div>
          {price && <div className="enu-pick-price">{price}</div>}
        </div>

        {status && <div className="enu-pick-status">{status}</div>}

        {canAdd && (
          <button
            type="button"
            className="enu-pick-add"
            onClick={handleAddClick}
            disabled={pending}
            aria-expanded={product.variants?.length === 1 ? undefined : choosing}
          >
            + Hinzufügen
          </button>
        )}

        {canAdd && choosing && (
          <div className="enu-pick-choice">
            {colours.length > 1 && (
              <div className="enu-pick-options" role="group" aria-label="Farbe">
                {colours.map(c => (
                  <button
                    key={c}
                    type="button"
                    className="enu-pick-option"
                    aria-pressed={c === colour}
                    disabled={pending}
                    onClick={() => { setPickedColour(c); setResult(null) }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
            <div className="enu-pick-options" role="group" aria-label="Größe">
              {sizeChoices(product, colour).map(s => (
                <button
                  key={s.size}
                  type="button"
                  className="enu-pick-option"
                  disabled={pending || s.unavailable}
                  onClick={() => add(s.size, colour)}
                >
                  {s.size}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="enu-pick-note" aria-live="polite">
          {result === 'added' && 'Im Warenkorb'}
          {result === 'atLimit' && 'Maximale Menge im Warenkorb'}
          {result === 'login' && (
            <Link href="/account" onClick={onNavigate}>Zum Hinzufügen bitte anmelden</Link>
          )}
          {result === 'failed' && (
            <>Hat nicht geklappt. <Link href={href} onClick={onNavigate}>Zum Produkt</Link></>
          )}
        </div>
      </div>
    </div>
  )
}
