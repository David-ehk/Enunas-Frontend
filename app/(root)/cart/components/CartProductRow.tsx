'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/app/context/CartContext'
import { productApi } from '@/lib/api'
import { isSoldOut } from '@/lib/cartSuggestions'
import { pictureChoice, quickAdd, savedColour, sizeChoices, variantColours, type QuickAddResult } from '@/lib/quickAdd'
import { colourHref } from '@/lib/product'
import { sortSizes } from '@/lib/sizeOrder'
import { keepInPlace } from '@/lib/keepInPlace'
import type { ApiProduct } from '@/types/api'

/** A suggestion or favourite, in the cart drawer and on /cart. Styles live in CartSidebar's stylesheet. */
export default function CartProductRow({ image, brand, name, price, href, product, onNavigate, lockColour, upsell }: {
  image: string
  brand: string
  name: string
  price: string | null
  href: string
  /** Live catalogue data. Without it the row is only a link: stock and sizes are unknown. */
  product?: ApiProduct
  onNavigate: () => void
  /** Favourites keep the colour they were saved in. */
  lockColour?: boolean
  /**
   * A suggestion: its sizes show straight away and a tap adds one, in the colour of the photo.
   * The photo and name lead to the product page, where the colour can be changed.
   */
  upsell?: boolean
}) {
  const { cartItems, addToCart } = useCart()
  const [choosing, setChoosing] = useState(false)
  const [pickedColour, setPickedColour] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [adding, setAdding] = useState<string | null>(null)
  const [result, setResult] = useState<QuickAddResult['status'] | null>(null)
  // A ref, not just state: a second tap can land before the re-render disables the button.
  const busy = useRef(false)
  const rowRef = useRef<HTMLDivElement>(null)

  const colours = product ? variantColours(product) : []
  const colour = pickedColour ?? (product ? savedColour(product, lockColour ? href : '') ?? '' : '')
  const pictured = upsell && product ? pictureChoice(product) : null
  const productHref = pictured ? colourHref(href, pictured.colour) : href
  const choices = pictured && product ? sizeChoices(product, pictured.colour) : []
  const pictureSizes = sortSizes(choices.map(c => c.size)).map(size => choices.find(c => c.size === size)!)
  const photo = pictured?.image || image

  const inCart = !!product && cartItems.some(i => i.productId === String(product.id))
  const status = !product ? null
    : inCart ? 'Im Warenkorb'
    : product.preview ? 'Coming Soon'
    : isSoldOut(product) ? 'Ausverkauft'
    : null
  const canAdd = !!product && !status && product.available && colours.length > 0

  async function add(size: string, fromColour: string) {
    if (!product || busy.current) return
    busy.current = true
    setPending(true)
    setAdding(size)
    setResult(null)
    const outcome = await quickAdd({
      product, colour: fromColour, size, cartItems,
      getListings: id => productApi.getListings(id),
      addToCart: line => {
        // The new cart line lands above the suggestions: hold them where the customer tapped.
        const section = upsell ? rowRef.current?.closest('.enu-upsell') : null
        const restore = section ? keepInPlace(section) : null
        addToCart(line)
        if (restore) requestAnimationFrame(restore)
      },
    })
    busy.current = false
    setPending(false)
    setAdding(null)
    setResult(outcome.status)
    if (outcome.status === 'added') setChoosing(false)
  }

  function handleAddClick() {
    const only = product?.variants?.length === 1 ? product.variants[0] : null
    if (only) add(only.size, only.color)
    else setChoosing(open => !open)
  }

  return (
    <div ref={rowRef} className="enu-pick">
      <Link href={productHref} onClick={onNavigate} className="enu-pick-media" tabIndex={-1} aria-hidden>
        {photo && <Image src={photo} alt="" fill sizes="72px" className="object-cover" />}
      </Link>

      <div className="enu-pick-main">
        <div className="enu-pick-top">
          <div style={{ minWidth: 0 }}>
            <div className="enu-item-brand">{brand}</div>
            <Link href={productHref} onClick={onNavigate} className="enu-pick-name">{name}</Link>
          </div>
          {price && <div className="enu-pick-price">{price}</div>}
        </div>

        {status && <div className="enu-pick-status">{status}</div>}

        {canAdd && pictured && (
          <>
            <div className="enu-picked" role="group" aria-label={`Ausgewählte Farbe: ${pictured.colour}`}>
              <span
                className="enu-picked-swatch"
                style={{ background: product.colours.find(c => c.name === pictured.colour)?.hex ?? '#999999' }}
                aria-hidden
              />
              {pictured.colour}
            </div>
            <div className="enu-sizes" role="group" aria-label={`${name}: Größe antippen zum Hinzufügen`}>
              {pictureSizes.map(s => (
                <button
                  key={s.size}
                  type="button"
                  className="enu-size"
                  disabled={pending || s.unavailable}
                  data-sold-out={s.unavailable}
                  aria-busy={adding === s.size}
                  onClick={() => add(s.size, pictured.colour)}
                >
                  {s.size}
                </button>
              ))}
            </div>
            <div className="enu-sizes-hint" aria-hidden>Größe antippen zum Hinzufügen</div>
          </>
        )}

        {canAdd && !upsell && (
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
            {lockColour && colours.length > 1 && <div className="enu-pick-colour">Farbe: {colour}</div>}
            {!lockColour && colours.length > 1 && (
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
