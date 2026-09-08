'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import ImageGallery from './ImageGallery'
import BrandLink from './BrandLink'
import GenderBadge, { GENDER_LABELS } from './GenderBadge'
import InspirationStory from './InspirationStory'
import ColorSelector from './ColorSelector'
import SizeSelector from './SizeSelector'
import CatalogueTags from './CatalogueTags'
import SizeGuideRow from './SizeGuideRow'
import StockIndicator from './StockIndicator'
import PflegeAccordionContent from './PflegeAccordionContent'
import StickyAddToCart from './StickyAddToCart'
import ComingSoonCountdown from '@/components/ComingSoonCountdown'
import { formatReleaseDate, previewReleaseMs } from '@/lib/preview'
import Link from 'next/link'
import { X } from 'lucide-react'
import { Product, findVariant, uniqueColors } from '../types/product'
import type { Color } from '@/lib/color'
import { useCart } from '@/app/context/CartContext'
import { useAuth } from '@/app/context/AuthContext'
import { useWishlist, type WishlistItem } from '@/app/context/WishlistContext'
import { productApi } from '@/lib/api'
import { listingPriceView } from '@/lib/pricing'
import type { ApiListing } from '@/types/api'

interface ProductDetailsProps {
  product: Product
  price: number
  /** Pre-discount price from the product response. Non-null is itself the "on sale" signal. */
  originalPrice?: number | null
  currency: string
  /** False when the product has no active listing — `price` is then a meaningless 0. */
  available: boolean
  brandSlug: string
  productSlug: string
  colorHexMap: Record<string, string>
  /** Backend product ID — used to fetch listings client-side. */
  productId: string
  /** True when the product is not yet released — PDP shows the "Coming Soon" state. */
  preview: boolean
}

export default function ProductDetails({
  product,
  price,
  originalPrice,
  currency,
  available,
  brandSlug,
  productSlug,
  colorHexMap,
  productId,
  preview,
}: ProductDetailsProps) {
  const colorList = useMemo(() => uniqueColors(product.variants), [product.variants])
  const colorsForSelector: Color[] = useMemo(
    () => colorList.map((name, i) => ({ id: String(i), name, hex: colorHexMap[name] ?? '#999999' })),
    [colorList, colorHexMap]
  )

  const [selectedColor, setSelectedColor] = useState<Color | null>(colorsForSelector[0] ?? null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [copiedSku, setCopiedSku] = useState(false)
  const [showSizeModal, setShowSizeModal] = useState(false)
  // Preview products aren't buyable yet — the CTA stays clickable and opens a cheeky "not so
  // fast" note instead of doing nothing.
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [openAccordion, setOpenAccordion] = useState<string | null>('details')
  const [justSaved, setJustSaved] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)

  // The product arrives as preview; once the backend flips it (checked on focus/visibility after
  // the release instant) we refetch and drop the preview UI in place — no navigation. Spec §6.
  const [livePreview, setLivePreview] = useState(preview)
  const [livePrice, setLivePrice] = useState<number>(price)
  const [liveOriginalPrice, setLiveOriginalPrice] = useState<number | null>(originalPrice ?? null)
  const [liveAvailable, setLiveAvailable] = useState<boolean>(available)

  // Graceful entrance for the coming-soon price block: it starts blurred + faded and settles
  // in on mount. Reduced-motion users get it fully revealed immediately, no transition.
  const [revealed, setRevealed] = useState(false)
  useEffect(() => {
    if (!livePreview) return
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setRevealed(true)
      return
    }
    const id = requestAnimationFrame(() => setRevealed(true))
    return () => cancelAnimationFrame(id)
  }, [livePreview])

  // Listings tell us availability AND the price of the specific variant once one is picked.
  // The pairing hazard is only in AGGREGATING across listings — the cheapest current price and
  // the cheapest list price can come from different rows and produce a nonsense pair. Within a
  // single listing there is no ambiguity: price and discountPrice are the same row. So the
  // selected variant's own listing prices it, and the product-level price/originalPrice pair
  // (the backend's cheapest sellable listing, i.e. the "ab" figure) covers everything else.
  const [listings, setListings] = useState<ApiListing[]>([])
  const [listingsLoading, setListingsLoading] = useState(false)
  const [listingsFailed, setListingsFailed] = useState(false)

  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const ctaRef = useRef<HTMLButtonElement>(null)
  const { addToCart, openCart } = useCart()
  const { isSaved, toggle: toggleWishlist } = useWishlist()

  useEffect(() => {
    if (!productId || livePreview) return   // preview products have no listings (backend returns [])
    setListingsLoading(true)
    setListingsFailed(false)
    productApi.getListings(productId)
      .then(setListings)
      .catch(() => setListingsFailed(true))
      .finally(() => setListingsLoading(false))
  }, [productId, livePreview])

  // Live transition at release time: once we're past the UTC release instant, re-check the
  // backend on focus / visibility change. When it reports the product live, swap the preview UI
  // for the buyable one in place. No polling — only focus/visibilitychange + one mount check.
  const check = useCallback(async () => {
    if (!livePreview || !product.releaseDate) return
    if (Date.now() < previewReleaseMs(product.releaseDate)) return
    try {
      const fresh = await productApi.getBySlug(productSlug)
      if (!fresh.preview) {
        setLivePreview(false)
        setLivePrice(fresh.price)
        setLiveOriginalPrice(fresh.originalPrice ?? null)
        setLiveAvailable(fresh.available)
      }
    } catch {
      /* transient — try again on the next focus */
    }
  }, [livePreview, product.releaseDate, productSlug])

  useEffect(() => {
    if (!livePreview || !product.releaseDate) return

    const onVisible = () => { if (document.visibilityState === 'visible') check() }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', check)
    check() // in case the tab was already past the release when mounted
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', check)
    }
  }, [livePreview, product.releaseDate, check])

  const selectedVariant = findVariant(product.variants, selectedColor?.name ?? null, selectedSize)
  // SKU shown as soon as a color is selected — not size-dependent
  const colorVariant = useMemo(
    () => product.variants.find(v => v.color === selectedColor?.name),
    [product.variants, selectedColor]
  )
  const isOutOfStock = !!(selectedVariant && selectedVariant.stockQuantity === 0)

  // Find the listing that matches the currently selected color + size.
  // Each listing maps to exactly one variant (variantColor + variantSize).
  const activeListing = useMemo<ApiListing | null>(() => {
    if (!selectedColor || !selectedSize) return null
    return listings.find(
      l => l.variantColor === selectedColor.name && l.variantSize === selectedSize
    ) ?? null
  }, [listings, selectedColor, selectedSize])

  // If authenticated and listings loaded but no listing found for this variant → unavailable.
  const variantUnavailable =
    isAuthenticated &&
    !listingsLoading &&
    !listingsFailed &&
    selectedSize !== null &&
    activeListing === null

  const priceView = useMemo(() => {
    // A variant is chosen: price it from its own listing row (see listingPriceView).
    if (activeListing) return listingPriceView(activeListing)
    // Otherwise the product-level pair, which the backend derives from the cheapest sellable
    // listing — the "ab €X" figure.
    return { current: livePrice, original: liveOriginalPrice }
  }, [activeListing, livePrice, liveOriginalPrice])

  const money = useMemo(
    () => new Intl.NumberFormat('de-DE', { style: 'currency', currency }),
    [currency],
  )

  // While preview is live the product is never buyable; after an in-place flip we trust the
  // freshly-fetched availability, not the stale server prop (which was false at preview render).
  const effectiveAvailable = livePreview ? false : liveAvailable

  // Never render a null-priced product as 0,00 €.
  const formattedPrice = effectiveAvailable ? money.format(priceView.current) : 'Preis nicht verfügbar'
  const formattedOriginalPrice =
    effectiveAvailable && priceView.original != null ? money.format(priceView.original) : null
  // Percentage is presentation only — the sale itself is decided by `originalPrice != null`,
  // never by comparing the two numbers.
  const discountPct =
    priceView.original != null && priceView.original > 0
      ? Math.round((1 - priceView.current / priceView.original) * 100)
      : 0
  const hasDiscount = formattedOriginalPrice != null

  // Reset size when color changes if selected size no longer available for new color
  const handleColorSelect = (color: Color) => {
    setSelectedColor(color)
    if (selectedSize) {
      const v = findVariant(product.variants, color.name, selectedSize)
      if (!v || v.stockQuantity === 0) setSelectedSize(null)
    }
  }

  const buildCartItem = (size: string) => {
    const listing = listings.find(
      l => l.variantColor === selectedColor?.name && l.variantSize === size
    )
    // Resolved for the size being added, not the currently selected one — the size modal can
    // add a size other than selectedSize. The cart reducer refuses a zero-stock line.
    const variant = findVariant(product.variants, selectedColor?.name ?? null, size)
    return {
      productId: String(product.id),
      name: product.name,
      brand: product.brandName,
      price: livePrice,
      currency,
      size,
      color: selectedColor ? { id: selectedColor.id, name: selectedColor.name, hex: selectedColor.hex } : undefined,
      image: product.images[0] ?? '',
      defaultListingId: listing?.id ? String(listing.id) : undefined,
      stockQuantity: variant?.stockQuantity,
      productPath: `/bekleidung/${brandSlug}/${productSlug}`,
    }
  }

  const handleAddToCart = (size: string) => {
    if (!effectiveAvailable) return
    addToCart(buildCartItem(size))
    openCart()
  }

  const handleCta = () => {
    if (livePreview) { setShowPreviewModal(true); return }
    if (!effectiveAvailable || isOutOfStock || variantUnavailable) return
    if (!selectedSize) { setShowSizeModal(true); return }
    handleAddToCart(selectedSize)
  }

  const copySku = async () => {
    const skuToCopy = selectedVariant?.sku ?? ''
    if (!skuToCopy) return
    try { await navigator.clipboard.writeText(skuToCopy) } catch { /* noop */ }
    setCopiedSku(true)
    setTimeout(() => setCopiedSku(false), 1600)
  }

  // Same id + heart used on product cards (PopularProductCard.tsx) — saving here or there is
  // the same wishlist entry either way.
  const saved = isSaved(String(product.id))

  const handleToggleSaved = () => {
    if (!isAuthenticated) { router.push('/account'); return }
    const wasSaved = saved
    const item: WishlistItem = {
      id: String(product.id),
      imgURL: product.images[0] ?? '',
      brandName: product.brandName,
      productName: product.name,
      price: livePreview ? null : formattedPrice,
      originalPrice: formattedOriginalPrice,
      href: `/bekleidung/${brandSlug}/${productSlug}`,
      colours: colorsForSelector,
      createdAt: product.createdAt,
      sizes: [...new Set(product.variants.filter(v => v.stockQuantity > 0).map(v => v.size))],
      catalogue: product.catalogueCategory ?? undefined,
      preview: livePreview,
      releaseDate: product.releaseDate ?? null,
    }
    toggleWishlist(item)
    if (!wasSaved) {
      setJustSaved(true)
      window.setTimeout(() => setJustSaved(false), 500)
    }
  }

  // Native share sheet where available (mostly mobile — see ImageGallery's `lg:hidden` on this
  // button); falls back to copying the link, same "copied" acknowledgment pattern as copySku.
  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const shareData = { title: product.name, text: `${product.brandName} — ${product.name}`, url }
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share(shareData) } catch { /* user cancelled the share sheet */ }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 1600)
    } catch { /* noop */ }
  }

  const toggleAccordion = (key: string) => setOpenAccordion(prev => (prev === key ? null : key))

  // A preview CTA is never "disabled" — it stays clickable and opens the countdown note.
  const ctaDisabled = !livePreview && (!effectiveAvailable || isOutOfStock || variantUnavailable)
  const ctaLabel = livePreview
    ? 'Coming Soon'
    : !effectiveAvailable
    ? 'Derzeit nicht verfügbar'
    : isOutOfStock
    ? 'Ausverkauft'
    : variantUnavailable
    ? 'Derzeit nicht verfügbar'
    : selectedSize
    ? 'Zum Warenkorb hinzufügen'
    : 'Größe wählen'

  return (
    <>
      {/* ── PDP grid — full-bleed so gallery touches the left edge ── */}
      <div className="grid grid-cols-1 md:grid-cols-2">

          {/* LEFT — Gallery + Breadcrumb */}
          <div>
            <ImageGallery
              images={product.images}
              productName={product.name}
              saved={saved}
              onToggleSaved={handleToggleSaved}
              justSaved={justSaved}
              onShare={handleShare}
              shareCopied={shareCopied}
            />
            <nav className="px-6 sm:px-8 py-4 sm:py-[22px]">
              <ol
                className="flex items-center flex-wrap gap-x-2.5 gap-y-1 sm:gap-x-3 text-enunas-gray-medium"
                style={{ fontFamily: 'var(--font-league-spartan)', fontSize: '13px', letterSpacing: '0.02em' }}
              >
                <li className="hidden sm:block"><Link href="/" className="hover:text-enunas-black transition-colors duration-200">Home</Link></li>
                <li className="flex items-center gap-x-2.5 sm:gap-x-3">
                  <span className="hidden sm:inline text-enunas-gray-light">/</span>
                  <Link href="/bekleidung" className="hover:text-enunas-black transition-colors duration-200">Bekleidung</Link>
                </li>
                <li className="flex items-center gap-x-2.5 sm:gap-x-3">
                  <span className="text-enunas-gray-light">/</span>
                  <Link href={`/marken/${brandSlug}`} className="hover:text-enunas-black transition-colors duration-200">{product.brandName}</Link>
                </li>
                <li className="hidden sm:flex items-center gap-x-2.5 sm:gap-x-3">
                  <span className="text-enunas-gray-light">/</span>
                  <span className="text-enunas-black font-medium">{product.name}</span>
                </li>
              </ol>
            </nav>
          </div>

          {/* RIGHT — Details */}
          <div className="flex flex-col items-center text-center px-6 pt-10 pb-16 sm:px-12 md:px-[72px] md:pt-14 md:pb-20">
            {/* 1. Brand + Gender */}
            <div className="flex items-center gap-3.5 mb-3.5">
              <BrandLink brand={product.brandName} />
              <GenderBadge gender={product.gender} />
            </div>

            {/* 2. Product name */}
            <h1
              className="text-enunas-black mb-8"
              style={{ fontFamily: 'var(--font-Cormorant-Garamond)', fontSize: '38px', fontWeight: 300, lineHeight: 1.1 }}
            >
              {product.name}
            </h1>

            {/* 3. Collection line */}
            {product.collectionName && (
              <p
                className="text-enunas-gray-medium mb-5"
                style={{ fontFamily: 'var(--font-Cormorant-Garamond)', fontSize: '15px', fontStyle: 'italic' }}
              >
                {product.collectionName}
              </p>
            )}

            {/* 4. Inspiration story */}
            <InspirationStory text={product.inspirationStory} />

            {/* 5. Price */}
            {livePreview ? (
              <div
                className="flex flex-col items-center gap-3 mb-10"
                style={{
                  transition:
                    'opacity 500ms var(--ease-out-expo), filter 500ms var(--ease-out-expo), transform 500ms var(--ease-out-expo)',
                  opacity: revealed ? 1 : 0,
                  filter: revealed ? 'blur(0px)' : 'blur(8px)',
                  transform: revealed ? 'translateY(0)' : 'translateY(6px)',
                }}
              >
                {/* Blurred placeholder — the real price is withheld by the backend until release. */}
                <div className="flex items-baseline gap-3">
                  <span
                    aria-hidden="true"
                    className="text-enunas-black"
                    style={{
                      fontFamily: 'var(--font-league-spartan)',
                      fontSize: '22px',
                      fontWeight: 300,
                      filter: 'blur(5px)',
                      userSelect: 'none',
                    }}
                  >
                    € 000,00
                  </span>
                  <span
                    className="text-enunas-gray-medium"
                    style={{ fontFamily: 'var(--font-league-spartan)', fontSize: '12px', letterSpacing: '0.02em' }}
                  >
                    inkl. MwSt.
                  </span>
                </div>
                <span className="sr-only">Der Preis wird zum Release bekannt gegeben.</span>

                {product.releaseDate && (
                  <>
                    <span
                      className="text-enunas-gray-medium"
                      style={{ fontFamily: 'var(--font-Cormorant-Garamond)', fontSize: '15px', fontStyle: 'italic' }}
                    >
                      Kommt am {formatReleaseDate(product.releaseDate)}
                    </span>
                    <ComingSoonCountdown
                      releaseDate={product.releaseDate}
                      variant="pdp"
                      onElapsed={check}
                    />
                  </>
                )}
              </div>
            ) : (
            <div className="flex flex-col items-center gap-2 mb-10">
              <div className="flex items-baseline gap-3">
                <span
                  className={hasDiscount ? 'text-enunas-error' : 'text-enunas-black'}
                  style={{ fontFamily: 'var(--font-league-spartan)', fontSize: '22px', fontWeight: 300 }}
                >
                  {formattedPrice}
                </span>
                {formattedOriginalPrice && (
                  <span
                    className="text-enunas-gray-dark"
                    style={{
                      fontFamily: 'var(--font-league-spartan)',
                      fontSize: '17px',
                      fontWeight: 400,
                      textDecorationLine: 'line-through',
                      textDecorationColor: '#8B1E3F',
                      textDecorationThickness: '1.5px',
                    }}
                  >
                    {formattedOriginalPrice}
                  </span>
                )}
                <span
                  className="text-enunas-gray-medium"
                  style={{ fontFamily: 'var(--font-league-spartan)', fontSize: '12px', letterSpacing: '0.02em' }}
                >
                  inkl. MwSt.
                </span>
              </div>
              {/* textIndent offsets the trailing letter-spacing after the last glyph, which
                  would otherwise push the label off-centre inside the box. */}
              {hasDiscount && discountPct > 0 && (
                <span
                  className="inline-flex items-center justify-center bg-enunas-error text-white px-3 py-1.5 leading-none uppercase"
                  style={{ fontFamily: 'var(--font-league-spartan)', fontSize: '10px', letterSpacing: '0.2em', textIndent: '0.2em' }}
                >
                  Reduziert −{discountPct} %
                </span>
              )}
            </div>
            )}

            {/* 6. Color + SKU */}
            {colorsForSelector.length > 0 && (
              <div className="w-full max-w-[460px] mb-[14px]">
                <ColorSelector
                  colors={colorsForSelector}
                  selectedColor={selectedColor}
                  onColorSelect={handleColorSelect}
                  sku={colorVariant?.sku}
                />
              </div>
            )}

            {/* 7. Size selector (variant-aware) */}
            <SizeSelector
              variants={product.variants}
              selectedColor={selectedColor?.name ?? null}
              selectedSize={selectedSize}
              onSizeSelect={setSelectedSize}
            />

            {/* 8. Catalogue tags */}
            <CatalogueTags categories={product.catalogueCategory} />

            {/* 9. Size guide row — hidden for beta, too much work to finish now
            <SizeGuideRow />
            */}

            {/* 10. CTA */}
            {listingsFailed && (
              <p className="text-[12px] text-enunas-error mb-3" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                Verfügbarkeit konnte nicht geladen werden.
              </p>
            )}
            <button
              ref={ctaRef}
              onClick={handleCta}
              disabled={ctaDisabled}
              className="group relative w-full max-w-[460px] overflow-hidden mb-6 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                padding: 'clamp(13px, 3.4vw, 22px) 32px',
                background: '#370E4D',
                fontFamily: 'var(--font-Cormorant-Garamond)',
                fontSize: 'clamp(15px, 4vw, 22px)',
                fontWeight: 400,
                letterSpacing: '0.04em',
                border: 'none',
                color: 'white',
                cursor: ctaDisabled ? 'not-allowed' : 'pointer',
                transition: 'background-color 300ms',
              }}
              onMouseEnter={e => { if (!ctaDisabled) e.currentTarget.style.backgroundColor = '#250838' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#370E4D' }}
            >
              <span className="absolute left-1/2 -translate-x-1/2 top-[10%] w-full h-[1px] bg-white/70 transition-all duration-500 ease-out group-hover:w-[75%]" />
              <span className="relative z-10">{ctaLabel}</span>
              <span className="absolute left-1/2 -translate-x-1/2 bottom-[10%] w-full h-[1px] bg-white/70 transition-all duration-500 ease-out group-hover:w-[75%]" />
            </button>

            {/* 11. Stock indicator */}
            <StockIndicator stockQuantity={selectedVariant?.stockQuantity} />

            {/* 12. Accordions */}
            <div className="w-full max-w-[480px] text-left mt-4">

              <PdpAccordion
                id="details"
                title="Produktdetails"
                open={openAccordion === 'details'}
                onToggle={() => toggleAccordion('details')}
              >
                {product.description && (
                  <p style={{ fontFamily: 'var(--font-Cormorant-Garamond)', fontSize: '16px', lineHeight: 1.7, color: '#2D2D2D', marginBottom: '16px' }}>
                    {product.description}
                  </p>
                )}
                <div>
                  {([
                    { k: 'Produktnummer',  v: selectedVariant?.sku ?? colorVariant?.sku ?? null, highlight: true },
                    { k: 'Farbe',          v: selectedColor?.name ?? null,     highlight: false },
                    { k: 'Material',       v: product.material || null,        highlight: false },
                    { k: 'Geschlecht',     v: product.gender ? GENDER_LABELS[product.gender] : null, highlight: false },
                    // Optional rows sit last and disappear entirely when unset, rather than
                    // showing an em dash. Gewicht is the least useful of the two, so it trails.
                    { k: 'Kollektion',     v: product.collectionName,          highlight: false, optional: true },
                    { k: 'Gewicht',        v: selectedVariant?.weightGrams ? `${selectedVariant.weightGrams} g` : null, highlight: false, optional: true },
                  ] as { k: string; v: string | null | undefined; highlight: boolean; optional?: boolean }[])
                    .filter(({ v, optional }) => !optional || !!v)
                    .map(({ k, v, highlight }) => (
                    <div
                      key={k}
                      className="flex gap-4 py-1.5 border-b border-dashed border-enunas-gray-light last:border-0"
                      style={{ fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.04em' }}
                    >
                      <span style={{ color: '#6B6B6B', minWidth: '140px' }}>{k}</span>
                      {v ? (
                        <span style={{
                          color: '#0A0A0A',
                          background: highlight ? 'rgba(55,14,77,0.08)' : 'none',
                          padding: highlight ? '1px 6px' : '0',
                          borderRadius: highlight ? '2px' : '0',
                        }}>
                          {v}
                        </span>
                      ) : (
                        <span style={{ color: '#6B6B6B', fontStyle: 'italic' }}>—</span>
                      )}
                    </div>
                  ))}
                </div>
              </PdpAccordion>

              <PdpAccordion
                id="shipping"
                title="Versand & Rückgabe"
                open={openAccordion === 'shipping'}
                onToggle={() => toggleAccordion('shipping')}
              >
                <p style={{ fontFamily: 'var(--font-Cormorant-Garamond)', fontSize: '16px', lineHeight: 1.7, color: '#2D2D2D' }}>
                  Versand aus {product.originCountry || 'DE'}. {product.returnPeriodDays ?? 14} Tage Rückgaberecht ab Erhalt der Ware.
                </p>
              </PdpAccordion>

              <PdpAccordion
                id="care"
                title="Pflegehinweise"
                open={openAccordion === 'care'}
                onToggle={() => toggleAccordion('care')}
                isLast
              >
                <PflegeAccordionContent careInstructions={product.careInstructions} />
              </PdpAccordion>

            </div>
          </div>
        </div>

      {/* ── Sticky add-to-cart bar ──────────────────────── */}
      <StickyAddToCart
        productName={product.name}
        formattedPrice={livePreview && product.releaseDate ? `Kommt am ${formatReleaseDate(product.releaseDate)}` : formattedPrice}
        selectedSize={livePreview ? null : selectedSize}
        ctaLabel={ctaLabel}
        isOutOfStock={ctaDisabled}
        onCta={handleCta}
        watchRef={ctaRef}
      />

      {/* ── Size selection modal ─────────────────────────── */}
      {showSizeModal && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center"
          onClick={() => setShowSizeModal(false)}
        >
          <div
            className="bg-white w-full sm:max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-8 py-5 border-b border-enunas-gray-light">
              <h3
                className="text-xs uppercase tracking-[0.15em] text-enunas-black"
                style={{ fontFamily: 'var(--font-league-spartan)' }}
              >
                Größe auswählen
              </h3>
              <button
                onClick={() => setShowSizeModal(false)}
                className="p-1 text-enunas-gray-medium hover:text-enunas-black transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-8 pt-6 pb-4">
              <p className="text-sm text-enunas-gray-medium" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                {product.name}
              </p>
            </div>
            <div className="px-8 pb-8">
              <div className="flex flex-wrap gap-2">
                {uniqueColors(product.variants)
                  .flatMap(color =>
                    product.variants
                      .filter(v => v.color === color && v.stockQuantity > 0)
                      .map(v => v.size)
                  )
                  .filter((s, i, a) => a.indexOf(s) === i)
                  .map((size) => {
                    const cols = 4
                    return (
                      <button
                        key={size}
                        onClick={() => {
                          setSelectedSize(size)
                          setShowSizeModal(false)
                          handleAddToCart(size)
                        }}
                        className="py-3.5 text-center text-sm text-enunas-black border border-enunas-gray-light hover:border-enunas-purple-dark hover:bg-enunas-purple-dark hover:text-white transition-all duration-200"
                        style={{
                          fontFamily: 'var(--font-league-spartan)',
                          width: `calc((100% - ${(cols - 1) * 8}px) / ${cols})`,
                        }}
                      >
                        {size}
                      </button>
                    )
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── "Not so fast" preview modal ───────────────────── */}
      {showPreviewModal && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center animate-fade-in"
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            className="bg-white w-full sm:max-w-md relative px-8 py-10 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPreviewModal(false)}
              className="absolute top-4 right-4 p-1 text-enunas-gray-medium hover:text-enunas-black transition-colors duration-200"
              aria-label="Schließen"
            >
              <X className="w-4 h-4" />
            </button>

            <p className="text-3xl mb-4" aria-hidden="true">👀</p>

            <h3
              className="text-enunas-black mb-3"
              style={{ fontFamily: 'var(--font-Cormorant-Garamond)', fontSize: '24px', fontWeight: 400 }}
            >
              Gefällt dir, was du siehst?
            </h3>

            <p
              className="text-enunas-gray-dark mb-6"
              style={{ fontFamily: 'var(--font-league-spartan)', fontSize: '14px', lineHeight: 1.7 }}
            >
              Uns auch. Aber sachte — der Drop ist noch nicht live. Warte, bis der
              Countdown durch ist, dann kannst du zuschlagen. Versprochen.
            </p>

            {product.releaseDate && (
              <div className="flex flex-col items-center gap-3 mb-8">
                <span
                  className="text-enunas-gray-medium"
                  style={{ fontFamily: 'var(--font-Cormorant-Garamond)', fontSize: '14px', fontStyle: 'italic' }}
                >
                  Kommt am {formatReleaseDate(product.releaseDate)}
                </span>
                <ComingSoonCountdown releaseDate={product.releaseDate} variant="pdp" onElapsed={check} />
              </div>
            )}

            <button
              onClick={() => setShowPreviewModal(false)}
              className="group relative w-full overflow-hidden py-4 bg-enunas-purple text-white hover:bg-enunas-purple-dark transition-colors duration-300"
              style={{
                fontFamily: 'var(--font-league-spartan)',
                fontSize: '12px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              <span className="absolute left-1/2 -translate-x-1/2 top-[18%] w-full h-[1px] bg-white/70 transition-all duration-500 ease-out group-hover:w-[70%]" />
              <span className="relative z-10">Na gut, ich warte</span>
              <span className="absolute left-1/2 -translate-x-1/2 bottom-[18%] w-full h-[1px] bg-white/70 transition-all duration-500 ease-out group-hover:w-[70%]" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

// ── PDP Accordion ─────────────────────────────────────
function PdpAccordion({
  id, title, open, onToggle, children, isLast = false,
}: {
  id: string
  title: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
  isLast?: boolean
}) {
  return (
    <div className={`border-t border-enunas-gray-light${isLast ? ' border-b' : ''}`}>
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center bg-transparent border-none py-[22px] text-enunas-black"
        style={{
          fontFamily: 'var(--font-league-spartan)',
          fontSize: '12px',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          cursor: 'pointer',
        }}
      >
        {title}
        <svg
          style={{
            width: '14px',
            height: '14px',
            flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 200ms',
          }}
          viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M3 6l5 5 5-5" />
        </svg>
      </button>
      <div
        style={{
          overflow: 'hidden',
          maxHeight: open ? '600px' : '0',
          transition: 'max-height 350ms cubic-bezier(0.19, 1, 0.22, 1)',
        }}
      >
        <div style={{ paddingBottom: '24px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
