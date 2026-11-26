'use client'

import { Suspense, useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Lock } from 'lucide-react'
import { orderApi, productApi, listingApi } from '@/lib/api'
import { useCart } from '@/app/context/CartContext'
import { useAuth } from '@/app/context/AuthContext'
import { resolveAccountName } from '@/lib/accountName'
import { colourwayCoverImage, colourwayGallery } from '@/lib/colourwayImage'
import { formatEuro } from '@/lib/format'
import {
  formatCountdown,
  rememberAppliedOffer,
  offerSizeOptions,
  offerPriceForListing,
  type OfferSizeOption,
} from '@/lib/upsellOffer'
import { useOfferCountdown } from '@/hooks/use-offer-countdown'
import type { ApiOrder, LiveOffer } from '@/types/api'
import CartFooter from '@/app/(root)/cart/components/CartFooter'
import ImageGallery from '@/app/(root)/bekleidung/[brand]/[slug]/components/ImageGallery'
import BrandLink from '@/app/(root)/bekleidung/[brand]/[slug]/components/BrandLink'
import GenderBadge from '@/app/(root)/bekleidung/[brand]/[slug]/components/GenderBadge'
import SizeSelector from '@/app/(root)/bekleidung/[brand]/[slug]/components/SizeSelector'
import { PdpAccordion } from '@/app/(root)/bekleidung/[brand]/[slug]/components/ProductDetails'
import type { Gender } from '@/app/(root)/bekleidung/[brand]/[slug]/types/product'
import { effectiveReturnPeriodDays } from '@/lib/returnPolicy'

// Length of the offer window; only used to draw the progress bar. The deadline is the API's.
const OFFER_WINDOW_MS = 10 * 60 * 1000

interface LoadedOffer {
  offer: LiveOffer
  options: OfferSizeOption[]
}

function Spinner() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-enunas-gray-light border-t-enunas-purple rounded-full animate-spin motion-reduce:animate-none" />
    </div>
  )
}

// The product page's CTA: Cormorant label between two hairlines that draw in on hover.
const CTA_CLASS =
  'group relative block w-full max-w-[540px] overflow-hidden text-center text-white font-cormorant font-normal tracking-[0.04em] transition-colors duration-300 ease-out-expo'
const CTA_STYLE = { padding: 'clamp(13px, 3.4vw, 22px) 32px', fontSize: 'clamp(15px, 4vw, 22px)' }

function CtaLabel({ children }: { children: React.ReactNode }) {
  return (
    <>
      <span className="absolute left-1/2 -translate-x-1/2 top-[10%] w-full h-[1px] bg-white/70 transition-all duration-500 ease-out group-hover:w-[75%]" />
      <span className="relative z-10">{children}</span>
      <span className="absolute left-1/2 -translate-x-1/2 bottom-[10%] w-full h-[1px] bg-white/70 transition-all duration-500 ease-out group-hover:w-[75%]" />
    </>
  )
}

/** `fraction` is the share of the offer window still left, 0–1. */
function OfferCard({ firstName, percent, countdown, fraction }: {
  /** Empty when no name is known. */
  firstName: string
  percent: number
  countdown: string
  fraction: number
}) {
  return (
    <section
      aria-label="Persönliches Angebot"
      className="relative w-full max-w-[540px] overflow-hidden rounded border border-[#E4DDEA] bg-[#F7F5F9] px-5 pt-5 pb-[18px] text-left font-league-spartan before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-enunas-purple"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0 [overflow-wrap:anywhere] text-[11px] font-semibold uppercase tracking-[0.12em] text-enunas-purple">
          {firstName ? `${firstName}, du wurdest ausgewählt` : 'Du wurdest ausgewählt'}
        </span>
        <span className="flex shrink-0 items-center gap-1.5 text-xs text-enunas-gray-medium">
          Noch{' '}
          <b className="rounded-[3px] border border-[#E4DDEA] bg-white px-2 py-[3px] text-[13px] font-semibold tabular-nums text-enunas-purple">
            {countdown}
          </b>
        </span>
      </div>
      <div className="flex items-center gap-4 mt-4 mb-3.5">
        <div className="whitespace-nowrap font-cormorant text-[46px] font-medium leading-none tracking-[-0.01em] text-enunas-purple">
          −{percent}&nbsp;%
        </div>
        <div className="border-l border-[#E4DDEA] pl-4 text-sm text-enunas-gray-dark" style={{ lineHeight: 1.45 }}>
          <strong className="block font-semibold text-enunas-black">Nur für ausgewählte Kunden</strong>
          Dieses Angebot haben nicht alle erhalten und ist nicht öffentlich einlösbar.
        </div>
      </div>
      <div className="h-[3px] overflow-hidden rounded-sm bg-[#E4DDEA]">
        {/* Linear on purpose: the bar tracks the clock. */}
        <i
          className="block h-full w-full origin-left bg-enunas-purple transition-transform duration-1000 ease-linear motion-reduce:transition-none"
          style={{ transform: `scaleX(${fraction})` }}
        />
      </div>
    </section>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AngebotPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <AngebotContent />
    </Suspense>
  )
}

function AngebotContent() {
  const params = useParams<{ brand: string; slug: string }>()
  const orderNumber = useSearchParams().get('order')
  const router = useRouter()
  const { addToCart } = useCart()

  const [data, setData] = useState<LoadedOffer | null>(null)
  const [openAccordion, setOpenAccordion] = useState<string | null>('details')
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [added, setAdded] = useState(false)
  const [sizeError, setSizeError] = useState(false)

  const remaining = useOfferCountdown(data?.offer.deadline ?? null)

  // A profile can lack a name (signup asks for none) — then this order's shipping address has it.
  const { customer, isLoading: authLoading } = useAuth()
  const [orderAddress, setOrderAddress] = useState<ApiOrder['shippingAddress']>()
  const hasProfileName = Boolean(customer?.firstName?.trim())
  useEffect(() => {
    if (!orderNumber || authLoading || hasProfileName) return
    let cancelled = false
    orderApi
      .getByOrderNumber(orderNumber)
      .then(order => { if (!cancelled) setOrderAddress(order?.shippingAddress) })
      .catch(() => {}) // no name — the card keeps its neutral headline
    return () => {
      cancelled = true
    }
  }, [orderNumber, authLoading, hasProfileName])
  const { firstName } = resolveAccountName(customer, orderAddress)

  useEffect(() => {
    let cancelled = false
    // No offer to show (never rolled, foreign order, redeemed, product gone): go back.
    const leave = () => {
      if (cancelled) return
      router.replace(
        orderNumber
          ? `/orders/${encodeURIComponent(orderNumber)}/confirmation`
          : `/bekleidung/${params.brand}/${params.slug}`,
      )
    }

    async function load() {
      if (!orderNumber) return leave()
      const offer = await orderApi.getUpsellOffer(orderNumber)
      if (offer === null || offer === 'pending') return leave()

      const variants = offer.product.variants ?? []
      let options = offerSizeOptions(
        variants,
        await productApi.getListings(offer.product.id).catch(() => []),
        offer.listingId,
      )
      // Without the full list, the offered listing alone is still buyable.
      if (options.length === 0) {
        options = offerSizeOptions(variants, [await listingApi.getById(offer.listingId)], offer.listingId)
      }
      if (options.length === 0) return leave()
      if (!cancelled) setData({ offer, options })
    }

    load().catch(leave)
    return () => {
      cancelled = true
    }
  }, [orderNumber, params.brand, params.slug, router])

  if (!data || remaining === null) return <Spinner />

  const { offer, options } = data
  const { product, percent: discountPct } = offer
  const expired = remaining === 0
  const display = formatCountdown(remaining)
  const selected = options.find(o => o.variant.size === selectedSize) ?? null
  // All options share one colourway: the offered listing's.
  const offeredOption = options.find(o => Number(o.listing.id) === offer.listingId) ?? options[0]
  const { listPrice, offerPrice } = offerPriceForListing(offer, (selected ?? offeredOption).listing)

  const { color, colorId = null } = offeredOption.variant
  const colour = product.colours.find(c => c.name === color)
  const images = colourwayGallery(product.imageObjects, colorId, product.images)

  const progressPct = Math.min(100, Math.max(0, ((OFFER_WINDOW_MS - remaining) / OFFER_WINDOW_MS) * 100))

  const toggleAccordion = (key: string) => setOpenAccordion(prev => (prev === key ? null : key))

  function handleCta() {
    if (expired) return
    if (!selected) {
      setSizeError(true)
      setTimeout(() => setSizeError(false), 2000)
      return
    }
    // The cart carries the list price: the discount is a separate line the backend computes.
    addToCart({
      productId: product.id,
      name: product.name,
      brand: product.brandName,
      price: listPrice,
      currency: 'EUR',
      size: selected.variant.size,
      color: colour ? { id: colour.id ?? colour.name, name: colour.name, hex: colour.hex } : undefined,
      image: colourwayCoverImage(product.imageObjects, colorId, images[0] ?? ''),
      defaultListingId: String(selected.listing.id),
      stockQuantity: selected.variant.stockQuantity,
      productPath: `/bekleidung/${params.brand}/${product.slug}`,
    })
    rememberAppliedOffer(offer.offerId)
    setAdded(true)
    setTimeout(() => router.push('/checkout'), 800)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Urgency bar ───────────────────────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-enunas-purple text-white" style={{ height: '44px' }}>
        <div className="relative overflow-hidden h-full">
          <div
            className="absolute inset-0 bg-enunas-purple-dark"
            style={{ width: `${progressPct}%` }}
          />
          <div className="relative z-10 h-full flex items-center justify-center gap-3 px-4">
            {expired ? (
              <p className="font-league-spartan text-xs tracking-[0.2em] uppercase">
                Das Angebot ist abgelaufen.
              </p>
            ) : (
              <>
                <span className="font-league-spartan text-[10px] tracking-[0.25em] uppercase opacity-70 hidden sm:inline">
                  Exklusives Angebot · Nur noch
                </span>
                <span
                  className="font-cormorant text-xl tabular-nums font-light"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {display}
                </span>
                <span className="font-league-spartan text-[10px] tracking-[0.25em] uppercase opacity-70 hidden sm:inline">
                  verfügbar
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Checkout-style navbar ─────────────────────────────────────────────── */}
      <nav
        className="fixed left-0 right-0 z-40 bg-white border-b border-enunas-gray-light"
        style={{ top: '44px', height: '64px' }}
      >
        <div className="max-w-[1440px] mx-auto h-full px-4 sm:px-8 lg:px-16 flex items-center justify-between">
          <Link
            href="/"
            className="font-cormorant text-2xl font-light tracking-[0.04em] text-enunas-black hover:opacity-70 transition-opacity duration-300"
          >
            Enunas
          </Link>
          <div className="flex items-center gap-2 text-enunas-gray-medium">
            <Lock className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="font-league-spartan text-[11px] tracking-[0.15em] uppercase">
              Sicher einkaufen
            </span>
          </div>
        </div>
      </nav>

      {/* ── Main content — same grid and column as the product page ────────────── */}
      <div className="flex-1" style={{ paddingTop: '108px' }}>
        <div className="grid grid-cols-1 md:grid-cols-2">

          {/* ── Left: Gallery ─────────────────────────────────────────────────── */}
          <div>
            <ImageGallery images={images} productName={product.name} />
          </div>

          {/* ── Right: Info + CTA ─────────────────────────────────────────────── */}
          <div className="flex flex-col items-center text-center px-6 pt-10 pb-16 sm:px-12 md:px-10 lg:px-14 md:pt-14 md:pb-20">
              <div className="flex items-center gap-3.5 mb-3.5">
                <BrandLink brand={product.brandName} />
                <GenderBadge gender={(product.gender as Gender) ?? null} />
              </div>

              <h1
                className="font-cormorant font-light text-enunas-black mb-8"
                style={{ fontSize: '38px', lineHeight: 1.1 }}
              >
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 mb-8">
                <span
                  className={`font-league-spartan font-light ${expired ? 'text-enunas-black' : 'text-enunas-purple'}`}
                  style={{ fontSize: '22px' }}
                >
                  {formatEuro(expired ? listPrice : offerPrice)}
                </span>
                {!expired && (
                  <span
                    className="font-league-spartan text-enunas-gray-medium line-through decoration-enunas-purple"
                    style={{ fontSize: '17px', textDecorationThickness: '1.5px' }}
                  >
                    {formatEuro(listPrice)}
                  </span>
                )}
                <span className="font-league-spartan text-xs tracking-[0.02em] text-enunas-gray-medium">
                  inkl. MwSt.
                </span>
              </div>

              {/* Offer card */}
              {!expired && (
                <OfferCard
                  firstName={firstName}
                  percent={discountPct}
                  countdown={display}
                  fraction={1 - progressPct / 100}
                />
              )}

              {expired && (
                <div
                  className="w-full max-w-[540px] mb-8 px-5 py-4 text-left"
                  style={{ background: 'rgba(107,107,107,0.06)', borderLeft: '2px solid #6B6B6B' }}
                >
                  <p className="font-cormorant italic text-base text-enunas-gray-medium leading-relaxed">
                    Das exklusive Angebot ist leider abgelaufen.
                  </p>
                </div>
              )}

              {/* Sizes — nothing to pick once the offer is over */}
              {!expired && (
                <>
                  <SizeSelector
                    variants={options.map(o => ({ ...o.variant, weightGrams: o.variant.weightGrams ?? 0 }))}
                    selectedColor={color}
                    selectedSize={selectedSize}
                    onSizeSelect={size => { setSelectedSize(size); setSizeError(false) }}
                  />
                  <p role="alert" className="min-h-5 mb-3 font-league-spartan text-xs text-enunas-error">
                    {sizeError ? 'Bitte wähle eine Größe' : ''}
                  </p>
                </>
              )}

              {/* CTA */}
              {!expired ? (
                <button
                  onClick={handleCta}
                  disabled={added}
                  className={`${CTA_CLASS} ${added ? 'bg-enunas-success' : 'bg-enunas-purple hover:bg-enunas-purple-dark'}`}
                  style={CTA_STYLE}
                >
                  <CtaLabel>
                    {added ? '✓ Zum Warenkorb hinzugefügt' : `Jetzt zugreifen — ${discountPct}% sparen`}
                  </CtaLabel>
                </button>
              ) : (
                <Link
                  href={`/bekleidung/${params.brand}/${params.slug}`}
                  className={`${CTA_CLASS} bg-enunas-purple hover:bg-enunas-purple-dark`}
                  style={CTA_STYLE}
                >
                  <CtaLabel>Zum regulären Preis ansehen</CtaLabel>
                </Link>
              )}

              {/* Decline — directly below button */}
              <Link
                href="/bekleidung"
                className="mt-5 mb-6 font-league-spartan text-[11px] text-enunas-gray-medium tracking-[0.15em] uppercase hover:text-enunas-black transition-colors duration-200"
              >
                {expired ? 'Weiter einkaufen' : 'Nein danke, ich verzichte auf das Angebot'}
              </Link>

              {/* Accordions */}
              <div className="w-full max-w-[560px] text-left mt-4">
                {product.description && (
                  <PdpAccordion
                    id="details"
                    title="Produktdetails"
                    open={openAccordion === 'details'}
                    onToggle={() => toggleAccordion('details')}
                  >
                    <p className="font-cormorant text-base text-enunas-gray-dark" style={{ lineHeight: 1.7 }}>
                      {product.description}
                    </p>
                  </PdpAccordion>
                )}
                <PdpAccordion
                  id="shipping"
                  title="Versand & Rückgabe"
                  open={openAccordion === 'shipping'}
                  onToggle={() => toggleAccordion('shipping')}
                  isLast
                >
                  <p className="font-cormorant text-base text-enunas-gray-dark" style={{ lineHeight: 1.7 }}>
                    {effectiveReturnPeriodDays(product.returnPeriodDays)} Tage Rückgaberecht ab Erhalt der Ware.
                    SSL-verschlüsselte Zahlung.
                  </p>
                </PdpAccordion>
              </div>
          </div>
        </div>
      </div>

      {/* ── Checkout footer ───────────────────────────────────────────────────── */}
      <CartFooter />
    </div>
  )
}
