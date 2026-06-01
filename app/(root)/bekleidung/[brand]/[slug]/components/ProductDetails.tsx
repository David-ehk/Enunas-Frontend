'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import ImageGallery from './ImageGallery'
import BrandLink from './BrandLink'
import GenderBadge from './GenderBadge'
import InspirationStory from './InspirationStory'
import ColorSelector from './ColorSelector'
import SizeSelector from './SizeSelector'
import CatalogueTags from './CatalogueTags'
import SizeGuideRow from './SizeGuideRow'
import StockIndicator from './StockIndicator'
import PflegeAccordionContent from './PflegeAccordionContent'
import StickyAddToCart from './StickyAddToCart'
import Link from 'next/link'
import { X } from 'lucide-react'
import { Product, findVariant, uniqueColors } from '../types/product'
import type { Color } from '@/lib/color'
import { useCart } from '@/app/context/CartContext'

interface ProductDetailsProps {
  product: Product
  price: number
  currency: string
  brandSlug: string
  productSlug: string
  colorHexMap: Record<string, string>
  defaultListingId?: string
}

export default function ProductDetails({
  product,
  price,
  currency,
  brandSlug,
  productSlug,
  colorHexMap,
  defaultListingId,
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
  const [openAccordion, setOpenAccordion] = useState<string | null>('details')

  const ctaRef = useRef<HTMLButtonElement>(null)
  const { addToCart, openCart } = useCart()

  const selectedVariant = findVariant(product.variants, selectedColor?.name ?? null, selectedSize)
  // SKU shown as soon as a color is selected — not size-dependent
  const colorVariant = useMemo(
    () => product.variants.find(v => v.color === selectedColor?.name),
    [product.variants, selectedColor]
  )
  const isOutOfStock = !!(selectedVariant && selectedVariant.stockQuantity === 0)

  const formattedPrice = new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(price)


  // Reset size when color changes if selected size no longer available for new color
  const handleColorSelect = (color: Color) => {
    setSelectedColor(color)
    if (selectedSize) {
      const v = findVariant(product.variants, color.name, selectedSize)
      if (!v || v.stockQuantity === 0) setSelectedSize(null)
    }
  }

  const buildCartItem = (size: string) => ({
    productId: String(product.id),
    name: product.name,
    brand: product.brandName,
    price,
    currency,
    size,
    color: selectedColor ? { id: selectedColor.id, name: selectedColor.name, hex: selectedColor.hex } : undefined,
    image: product.images[0] ?? '',
    defaultListingId,
    productPath: `/bekleidung/${brandSlug}/${productSlug}`,
  })

  const handleAddToCart = (size: string) => { addToCart(buildCartItem(size)); openCart() }

  const handleCta = () => {
    if (isOutOfStock) return
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

  const toggle = (key: string) => setOpenAccordion(prev => (prev === key ? null : key))

  const ctaLabel = isOutOfStock
    ? 'Ausverkauft'
    : selectedSize
    ? 'Zum Warenkorb hinzufügen'
    : 'Größe wählen'

  return (
    <>
      {/* ── PDP grid — full-bleed so gallery touches the left edge ── */}
      <div className="grid grid-cols-1 md:grid-cols-2">

          {/* LEFT — Gallery + Breadcrumb */}
          <div>
            <ImageGallery images={product.images} productName={product.name} />
            <nav className="px-8 py-[22px]">
              <ol
                className="flex items-center flex-wrap gap-3 text-enunas-gray-medium"
                style={{ fontFamily: 'var(--font-league-spartan)', fontSize: '13px', letterSpacing: '0.02em' }}
              >
                <li><Link href="/" className="hover:text-enunas-black transition-colors duration-200">Home</Link></li>
                <li className="text-enunas-gray-light">/</li>
                <li><Link href="/bekleidung" className="hover:text-enunas-black transition-colors duration-200">Bekleidung</Link></li>
                <li className="text-enunas-gray-light">/</li>
                <li><Link href={`/bekleidung/${brandSlug}`} className="hover:text-enunas-black transition-colors duration-200">{product.brandName}</Link></li>
                <li className="text-enunas-gray-light">/</li>
                <li className="text-enunas-black font-medium">{product.name}</li>
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
            <div className="flex items-baseline gap-3 mb-10">
              <span
                className="text-enunas-black"
                style={{ fontFamily: 'var(--font-league-spartan)', fontSize: '22px', fontWeight: 300 }}
              >
                {formattedPrice}
              </span>
              <span
                className="text-enunas-gray-medium"
                style={{ fontFamily: 'var(--font-league-spartan)', fontSize: '12px', letterSpacing: '0.02em' }}
              >
                inkl. MwSt. zzgl. Versand
              </span>
            </div>

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

            {/* 9. Size guide row */}
            <SizeGuideRow />

            {/* 10. CTA */}
            <button
              ref={ctaRef}
              onClick={handleCta}
              disabled={isOutOfStock}
              className="group relative w-full max-w-[460px] overflow-hidden mb-6 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                padding: '22px 32px',
                background: '#370E4D',
                fontFamily: 'var(--font-Cormorant-Garamond)',
                fontSize: '22px',
                fontWeight: 400,
                letterSpacing: '0.04em',
                border: 'none',
                color: 'white',
                cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                transition: 'background-color 300ms',
              }}
              onMouseEnter={e => { if (!isOutOfStock) e.currentTarget.style.backgroundColor = '#250838' }}
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
                onToggle={() => toggle('details')}
              >
                {product.description && (
                  <p style={{ fontFamily: 'var(--font-Cormorant-Garamond)', fontSize: '16px', lineHeight: 1.7, color: '#2D2D2D', marginBottom: '16px' }}>
                    {product.description}
                  </p>
                )}
                <div>
                  {([
                    { k: 'Produktnummer',  v: selectedVariant?.sku ?? null,    highlight: true },
                    { k: 'Farbe',          v: selectedColor?.name ?? null,     highlight: false },
                    { k: 'Gewicht',        v: selectedVariant ? `${selectedVariant.weightGrams} g` : null, highlight: false },
                    { k: 'Material',       v: product.material || null,        highlight: false },
                    { k: 'Geschlecht',     v: product.gender,                  highlight: false },
                    { k: 'Kollektion',     v: product.collectionName,          highlight: false },
                  ] as { k: string; v: string | null | undefined; highlight: boolean }[]).map(({ k, v, highlight }) => (
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
                onToggle={() => toggle('shipping')}
              >
                <p style={{ fontFamily: 'var(--font-Cormorant-Garamond)', fontSize: '16px', lineHeight: 1.7, color: '#2D2D2D' }}>
                  Versand aus {product.originCountry || 'DE'}. {product.returnPeriodDays || 30} Tage Rückgaberecht ab Erhalt der Ware. Versandkostenfrei ab 50 €.
                </p>
              </PdpAccordion>

              <PdpAccordion
                id="care"
                title="Pflegehinweise"
                open={openAccordion === 'care'}
                onToggle={() => toggle('care')}
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
        formattedPrice={formattedPrice}
        selectedSize={selectedSize}
        ctaLabel={ctaLabel}
        isOutOfStock={isOutOfStock}
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
