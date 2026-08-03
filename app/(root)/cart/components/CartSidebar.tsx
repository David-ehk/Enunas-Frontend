'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/app/context/CartContext'
import Image from 'next/image'
import Link from 'next/link'
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_COST } from '../constants'

/* ─────────────────────────────────────────────────────────────────
   CSS from design_handoff_cart/cart/cart.css — embedded so it loads
   with the component. Cream surface only; prototype-only rules dropped.
───────────────────────────────────────────────────────────────── */
const css = `
.enu-cart {
  position: fixed; top: 0; right: 0; z-index: 9999;
  height: 100dvh; width: min(468px, 100vw);
  display: flex; flex-direction: column;
  background: #F5F5F0; color: #0A0A0A;
  font-family: 'League Spartan', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transform: translateX(101%);
  transition: transform 720ms cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 0 80px rgba(0,0,0,0.22);
  --acc:    #370E4D;
  --hair-c: #E2E2DC;
  --muted:  #6B6B6B;
  --faint:  #9A9A93;
  --panel:  #FBFBF8;
  --ship:   #1A5A3C;
  --error:  #8B1E3F;
  --ease:   cubic-bezier(0.16, 1, 0.3, 1);
  --ease-q: cubic-bezier(0.25, 1, 0.5, 1);
}
.enu-cart.is-open { transform: translateX(0); }

/* Header */
.enu-cart-head {
  position: relative; flex: none;
  padding: 26px 30px 0;
  background: #F5F5F0;
}
.enu-cart-head::after {
  content: ""; display: block; height: 1px;
  background: var(--hair-c);
}
.enu-cart-head-top {
  display: flex; align-items: center; justify-content: space-between;
}
.enu-cart-tabs { display: flex; gap: 26px; }
.enu-cart-tab {
  position: relative; background: none; border: 0; padding: 0 0 16px; cursor: pointer;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-weight: 400; font-size: 23px; letter-spacing: 0.01em;
  color: var(--faint);
  transition: color 280ms var(--ease-q);
}
.enu-cart-tab .enu-tab-n {
  font-family: 'League Spartan', system-ui, sans-serif;
  font-size: 10px; letter-spacing: 0.1em; vertical-align: super;
  margin-left: 5px; color: var(--faint); font-variant-numeric: tabular-nums;
}
.enu-cart-tab::after {
  content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 1px;
  background: var(--acc); transform: scaleX(0); transform-origin: left;
  transition: transform 420ms var(--ease);
}
.enu-cart-tab:hover { color: var(--muted); }
.enu-cart-tab[aria-selected="true"] { color: #0A0A0A; }
.enu-cart-tab[aria-selected="true"] .enu-tab-n { color: var(--acc); }
.enu-cart-tab[aria-selected="true"]::after { transform: scaleX(1); }
.enu-cart-close {
  background: none; border: 0; color: var(--muted); padding: 6px;
  margin: -6px -6px 8px 0; cursor: pointer;
  display: flex; transition: color 240ms var(--ease-q), transform 360ms var(--ease);
}
.enu-cart-close:hover { color: #0A0A0A; transform: rotate(90deg); }

/* Free-shipping bar */
.enu-ship {
  flex: none; padding: 18px 30px 20px; background: #F5F5F0;
  border-bottom: 1px solid var(--hair-c);
}
.enu-ship-row {
  display: flex; align-items: baseline; justify-content: space-between;
  gap: 14px; margin-bottom: 11px;
}
.enu-ship-msg {
  font-size: 11px; letter-spacing: 0.13em; text-transform: uppercase; line-height: 1.5;
  color: #0A0A0A;
}
.enu-ship-msg.is-done { color: var(--ship); }
.enu-ship-msg .enu-amt { color: #0A0A0A; font-weight: 500; }
.enu-ship-meta {
  font-size: 11px; letter-spacing: 0.06em; color: var(--muted);
  font-variant-numeric: tabular-nums; white-space: nowrap;
}
.enu-ship-track {
  position: relative; height: 2px; background: var(--hair-c); overflow: hidden;
}
.enu-ship-fill {
  position: absolute; inset: 0 auto 0 0; width: var(--pct, 0%);
  background: var(--ship); transition: width 900ms var(--ease);
}

/* Item list */
.enu-cart-body {
  flex: 1; overflow-y: auto; padding: 6px 30px 24px; background: #F5F5F0;
  scrollbar-width: none;
}
.enu-cart-body::-webkit-scrollbar { width: 0; }

.enu-item {
  display: grid; grid-template-columns: 92px 1fr; gap: 18px;
  padding: 26px 0; border-bottom: 1px solid var(--hair-c);
  opacity: 0; transform: translateY(14px);
  animation: enuItemIn 620ms cubic-bezier(0.16,1,0.3,1) forwards;
}
.enu-item:nth-child(1) { animation-delay: 80ms; }
.enu-item:nth-child(2) { animation-delay: 160ms; }
.enu-item:nth-child(3) { animation-delay: 240ms; }
.enu-item:nth-child(4) { animation-delay: 320ms; }
@keyframes enuItemIn { to { opacity: 1; transform: translateY(0); } }
.enu-item.removing { animation: enuItemOut 420ms cubic-bezier(0.16,1,0.3,1) forwards; }
@keyframes enuItemOut { to { opacity: 0; transform: translateX(40px); } }

.enu-item-media {
  position: relative; width: 92px; height: 120px;
  background: var(--panel); overflow: hidden; flex-shrink: 0;
  display: block; text-decoration: none;
}
.enu-item-media img,
.enu-item-media > span {
  transition: transform 1000ms cubic-bezier(0.16,1,0.3,1) !important;
}
.enu-item:hover .enu-item-media img,
.enu-item:hover .enu-item-media > span > img {
  transform: scale(1.05) !important;
}

.enu-item-main { display: flex; flex-direction: column; min-width: 0; }
.enu-item-top {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
}
.enu-item-brand {
  font-size: 10px; letter-spacing: 0.26em; text-transform: uppercase;
  color: var(--muted); margin-bottom: 7px;
}
.enu-item-name {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-weight: 400; font-size: 19px; line-height: 1.1; color: #0A0A0A;
  text-decoration: none; transition: opacity 240ms cubic-bezier(0.25,1,0.5,1);
}
.enu-item-name:hover { opacity: 0.6; }
.enu-item-remove {
  flex: none; background: none; border: 0; color: var(--faint); padding: 2px;
  cursor: pointer; display: flex; transition: color 240ms var(--ease-q);
}
.enu-item-remove:hover { color: var(--error); }

.enu-item-attrs {
  display: flex; flex-wrap: wrap; gap: 6px 14px; margin-top: 9px;
}
.enu-item-attr {
  font-size: 11px; letter-spacing: 0.04em; color: var(--muted);
  display: flex; align-items: center; gap: 7px;
}
.enu-item-swatch { width: 9px; height: 9px; border: 1px solid var(--hair-c); flex-shrink: 0; }

.enu-item-bottom {
  margin-top: auto; padding-top: 16px;
  display: flex; align-items: center; justify-content: space-between;
}

/* Stepper */
.enu-stepper {
  display: inline-flex; align-items: stretch; border: 1px solid var(--hair-c);
}
.enu-stepper button {
  width: 30px; height: 30px; background: none; border: 0; cursor: pointer;
  color: #0A0A0A; display: grid; place-items: center;
  transition: background 220ms var(--ease-q), color 220ms var(--ease-q);
}
.enu-stepper button:hover:not(:disabled) { background: var(--acc); color: #fff; }
.enu-stepper button:disabled { color: var(--faint); cursor: not-allowed; }
.enu-stepper .enu-qty {
  min-width: 34px; display: grid; place-items: center;
  font-size: 12px; font-variant-numeric: tabular-nums; color: #0A0A0A;
  border-left: 1px solid var(--hair-c); border-right: 1px solid var(--hair-c);
}
.enu-item-price {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 19px; font-weight: 400; color: #0A0A0A;
  font-variant-numeric: tabular-nums;
}

/* Empty state */
.enu-empty {
  height: 100%; display: flex; flex-direction: column; align-items: center;
  justify-content: center; text-align: center; gap: 14px; padding: 40px;
}
.enu-empty .enu-e-mark { color: var(--faint); }
.enu-empty .enu-e-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 27px; font-weight: 300; color: #0A0A0A;
}
.enu-empty .enu-e-sub {
  font-size: 12px; letter-spacing: 0.1em; color: var(--muted);
  line-height: 1.7; max-width: 240px;
}
.enu-empty .enu-e-cta {
  margin-top: 6px; background: none; border: 0; cursor: pointer; color: var(--acc);
  font-family: 'League Spartan', system-ui, sans-serif;
  font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase;
  display: inline-flex; align-items: center; gap: 9px;
}
.enu-empty .enu-e-ar { transition: transform 360ms var(--ease); display: flex; }
.enu-empty .enu-e-cta:hover .enu-e-ar { transform: translateX(6px); }

/* Summary */
.enu-summary {
  position: relative; flex: none; padding: 22px 30px 26px;
  background: var(--panel); border-top: 1px solid var(--hair-c);
}
.enu-summary::before, .enu-summary::after {
  content: ""; position: absolute; width: 12px; height: 12px;
  pointer-events: none; border: 0 solid var(--faint); opacity: 0.7;
}
.enu-summary::before {
  top: 14px; right: 18px; border-top-width: 1px; border-right-width: 1px;
}
.enu-summary::after {
  bottom: 14px; left: 18px; border-bottom-width: 1px; border-left-width: 1px;
}
.enu-sum-lines { display: flex; flex-direction: column; gap: 9px; margin-bottom: 18px; }
.enu-sum-row { display: flex; align-items: baseline; justify-content: space-between; }
.enu-sum-row .enu-lbl {
  font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted);
}
.enu-sum-row .enu-val { font-size: 13px; color: #0A0A0A; font-variant-numeric: tabular-nums; }
.enu-sum-row .enu-val.free {
  color: var(--ship); letter-spacing: 0.1em; text-transform: uppercase; font-size: 11px;
}
.enu-sum-total {
  display: flex; align-items: baseline; justify-content: space-between;
  padding-top: 15px; border-top: 1px solid var(--hair-c);
}
.enu-sum-total .enu-lbl {
  font-family: 'Cormorant Garamond', Georgia, serif; font-size: 22px; font-weight: 400;
}
.enu-sum-total .enu-lbl .enu-n {
  font-family: 'League Spartan', system-ui, sans-serif;
  font-size: 11px; letter-spacing: 0.12em; color: var(--muted); margin-left: 8px;
}
.enu-sum-total .enu-val {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 27px; font-weight: 400; font-variant-numeric: tabular-nums; color: #0A0A0A;
}
.enu-sum-vat {
  font-size: 10px; letter-spacing: 0.08em; color: var(--faint);
  margin-top: 4px; text-align: right;
}

/* Checkout CTA */
.enu-checkout {
  width: 100%; margin-top: 18px; position: relative; overflow: hidden;
  background: var(--acc); color: #fff; border: 0; padding: 18px;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 18px; font-weight: 400; letter-spacing: 0.06em;
  display: flex; align-items: center; justify-content: center; gap: 12px;
  cursor: pointer; text-decoration: none;
  transition: background 300ms var(--ease-q);
}
.enu-checkout .enu-lock { display: flex; opacity: 0.85; }
.enu-checkout:hover { background: #250838; }
/* Diagonal shimmer sweep — premium glow on hover */
.enu-checkout::after {
  content: ""; position: absolute; top: 0; left: -60%; width: 40%; height: 100%;
  background: linear-gradient(100deg, transparent, rgba(255,255,255,0.22), transparent);
  transform: skewX(-18deg); transition: left 720ms var(--ease);
  pointer-events: none;
}
.enu-checkout:hover::after { left: 120%; }
/* Two hairlines that contract on hover */
.enu-checkout-line {
  position: absolute; left: 50%; transform: translateX(-50%);
  width: 100%; height: 1px; background: rgba(255,255,255,0.55);
  transition: width 500ms cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}
.enu-checkout-line.top { top: 14%; }
.enu-checkout-line.bot { bottom: 14%; }
.enu-checkout:hover .enu-checkout-line { width: 70%; }

.enu-continue {
  display: block; width: 100%; margin-top: 14px; text-align: center;
  background: none; border: 0; cursor: pointer; color: var(--muted);
  font-family: 'League Spartan', system-ui, sans-serif;
  font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase;
  padding: 4px; transition: color 240ms var(--ease-q);
}
.enu-continue span { border-bottom: 1px solid transparent; padding-bottom: 2px; transition: border-color 240ms; }
.enu-continue:hover { color: #0A0A0A; }
.enu-continue:hover span { border-color: #0A0A0A; }

.enu-trust {
  display: flex; align-items: center; justify-content: center; gap: 9px;
  margin-top: 16px; color: var(--faint);
}
.enu-trust span {
  font-family: 'League Spartan', system-ui, sans-serif;
  font-size: 9.5px; letter-spacing: 0.2em; text-transform: uppercase;
}

@media (prefers-reduced-motion: reduce) {
  .enu-item { animation: none !important; opacity: 1 !important; transform: none !important; }
}
@media (max-width: 480px) {
  .enu-summary::before, .enu-summary::after { display: none; }
}
`

/* ── SVG Icons ────────────────────────────────────────────────── */
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
)
const MinusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <path d="M5 12h14" />
  </svg>
)
const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
)
const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13h10l1-13" />
  </svg>
)
const LockIcon = ({ width = 13, height = 13 }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="4" y="10" width="16" height="11" rx="1.5" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
)
const BagIcon = ({ width = 40, height = 40 }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 8h12l-1 12H7L6 8Z" />
    <path d="M9 8a3 3 0 0 1 6 0" />
  </svg>
)
const HeartIcon = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round">
    <path d="M12 20s-7-4.5-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5C19 15.5 12 20 12 20Z" />
  </svg>
)
const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
)

/* ── Helpers ──────────────────────────────────────────────────── */
function fmt(euros: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(euros)
}

/* ── CartItem row ─────────────────────────────────────────────── */
interface CartItemData {
  id: string
  name: string
  brand?: string
  image?: string
  price: number
  quantity: number
  size?: string
  color?: { name: string }
  productPath?: string
}

function CartItemRow({ item, removing, onDec, onInc, onRemove }: {
  item: CartItemData
  removing: boolean
  onDec: () => void
  onInc: () => void
  onRemove: () => void
}) {
  const href = item.productPath ?? '#'

  return (
    <div className={`enu-item${removing ? ' removing' : ''}`}>
      <Link href={href} onClick={href !== '#' ? undefined : (e) => e.preventDefault()} className="enu-item-media">
        {item.image ? (
          <Image src={item.image} alt={item.name} fill sizes="92px" className="object-cover" />
        ) : (
          <div className="w-full h-full bg-[#E8E8E8]" />
        )}
      </Link>
      <div className="enu-item-main">
        <div className="enu-item-top">
          <div>
            {item.brand && <div className="enu-item-brand">{item.brand}</div>}
            <Link href={href} onClick={href !== '#' ? undefined : (e) => e.preventDefault()} className="enu-item-name">{item.name}</Link>
          </div>
          <button className="enu-item-remove" onClick={onRemove} aria-label="Entfernen">
            <TrashIcon />
          </button>
        </div>
        <div className="enu-item-attrs">
          {item.color && (
            <span className="enu-item-attr">{item.color.name}</span>
          )}
          {item.size && (
            <span className="enu-item-attr">Größe {item.size}</span>
          )}
        </div>
        <div className="enu-item-bottom">
          <div className="enu-stepper">
            <button onClick={onDec} disabled={item.quantity <= 1} aria-label="Menge verringern">
              <MinusIcon />
            </button>
            <span className="enu-qty">{item.quantity}</span>
            <button onClick={onInc} aria-label="Menge erhöhen">
              <PlusIcon />
            </button>
          </div>
          <div className="enu-item-price">{fmt(item.price * item.quantity)}</div>
        </div>
      </div>
    </div>
  )
}

/* ── Main CartSidebar ─────────────────────────────────────────── */
export default function CartSidebar() {
  const {
    isCartOpen,
    closeCart,
    cartItems,
    itemCount,
    totalPrice,
    updateQuantity,
    removeFromCart,
  } = useCart()

  const [activeTab, setActiveTab] = useState<'cart' | 'wish'>('cart')
  const [removingId, setRemovingId] = useState<string | null>(null)

  const freeShip = totalPrice >= FREE_SHIPPING_THRESHOLD
  const shipping  = freeShip ? 0 : STANDARD_SHIPPING_COST
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - totalPrice)
  const pct       = Math.min(100, (totalPrice / FREE_SHIPPING_THRESHOLD) * 100)
  const total     = totalPrice + shipping

  function handleRemove(id: string) {
    setRemovingId(id)
    setTimeout(() => { removeFromCart(id); setRemovingId(null) }, 420)
  }

  useEffect(() => {
    document.body.style.overflow = isCartOpen ? 'hidden' : 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isCartOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCart() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeCart])

  return (
    <>
      <style>{css}</style>

      {/* Scrim */}
      <div
        onClick={closeCart}
        aria-hidden
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(10,8,14,0.34)',
          opacity: isCartOpen ? 1 : 0,
          pointerEvents: isCartOpen ? 'auto' : 'none',
          transition: 'opacity 600ms cubic-bezier(0.16,1,0.3,1)',
        }}
      />

      {/* Drawer */}
      <aside
        className={`enu-cart${isCartOpen ? ' is-open' : ''}`}
        aria-label="Warenkorb"
      >
        {/* ── Header ── */}
        <div className="enu-cart-head">
          <div className="enu-cart-head-top">
            <div className="enu-cart-tabs" role="tablist">
              <button
                className="enu-cart-tab"
                role="tab"
                aria-selected={activeTab === 'cart'}
                onClick={() => setActiveTab('cart')}
              >
                Warenkorb<span className="enu-tab-n">{itemCount}</span>
              </button>
              <button
                className="enu-cart-tab"
                role="tab"
                aria-selected={activeTab === 'wish'}
                onClick={() => setActiveTab('wish')}
              >
                Wunschliste<span className="enu-tab-n">0</span>
              </button>
            </div>
            <button className="enu-cart-close" onClick={closeCart} aria-label="Schließen">
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Free-shipping bar — re-enable once per-product shipping is configured */}

        {/* ── Body ── */}
        <div className="enu-cart-body">
          {activeTab === 'cart' ? (
            cartItems.length > 0 ? (
              cartItems.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  removing={removingId === item.id}
                  onDec={() => updateQuantity(item.id, item.quantity - 1)}
                  onInc={() => updateQuantity(item.id, item.quantity + 1)}
                  onRemove={() => handleRemove(item.id)}
                />
              ))
            ) : (
              <div className="enu-empty">
                <div className="enu-e-mark"><BagIcon /></div>
                <div className="enu-e-title">Dein Warenkorb ist leer</div>
                <div className="enu-e-sub">Entdecke kuratierte Designer- und Streetwear-Stücke.</div>
                <button className="enu-e-cta" onClick={closeCart}>
                  Weiter einkaufen <span className="enu-e-ar"><ArrowIcon /></span>
                </button>
              </div>
            )
          ) : (
            <div className="enu-empty">
              <div className="enu-e-mark"><HeartIcon /></div>
              <div className="enu-e-title">Noch nichts gemerkt</div>
              <div className="enu-e-sub">Tippe auf das Herz, um Lieblingsstücke hier zu sammeln.</div>
            </div>
          )}
        </div>

        {/* ── Summary footer ── */}
        {activeTab === 'cart' && cartItems.length > 0 && (
          <div className="enu-summary">
            <div className="enu-sum-lines">
              <div className="enu-sum-row">
                <span className="enu-lbl">Zwischensumme</span>
                <span className="enu-val">{fmt(totalPrice)}</span>
              </div>
              <div className="enu-sum-row">
                <span className="enu-lbl">Versand</span>
                {freeShip
                  ? <span className="enu-val free">Kostenlos</span>
                  : <span className="enu-val">{fmt(shipping)}</span>
                }
              </div>
            </div>
            <div className="enu-sum-total">
              <span className="enu-lbl">
                Gesamt
                <span className="enu-n">{itemCount} {itemCount === 1 ? 'Artikel' : 'Artikel'}</span>
              </span>
              <span className="enu-val">{fmt(total)}</span>
            </div>
            <div className="enu-sum-vat">inkl. MwSt.</div>

            <Link href="/checkout" onClick={closeCart} className="enu-checkout">
              <span className="enu-checkout-line top" />
              <span className="enu-lock"><LockIcon /></span>
              Sicher zur Kasse
              <span className="enu-checkout-line bot" />
            </Link>

            <Link href="/cart" onClick={closeCart} className="enu-continue" style={{ textDecoration: 'none' }}>
              <span>Warenkorb anzeigen</span>
            </Link>

            <div className="enu-trust">
              <LockIcon width={11} height={11} />
              <span>SSL-verschlüsselt · Käuferschutz</span>
            </div>
          </div>
        )}

        {/* Corner bracket — top-right */}
        <span
          className="absolute pointer-events-none"
          style={{
            top: 16, right: 16, width: 14, height: 14,
            borderTop: '1px solid rgba(10,10,10,0.3)',
            borderRight: '1px solid rgba(10,10,10,0.3)',
          }}
        />
        {/* Corner bracket — bottom-left */}
        <span
          className="absolute pointer-events-none"
          style={{
            bottom: 16, left: 16, width: 14, height: 14,
            borderBottom: '1px solid rgba(10,10,10,0.3)',
            borderLeft: '1px solid rgba(10,10,10,0.3)',
          }}
        />
      </aside>
    </>
  )
}
