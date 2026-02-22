"use client"

import React, { useState, useEffect, useRef } from 'react'
import ImageGallery from './ImageGallery'
import ColorSelector from './ColorSelector'
import SizeSelector from './SizeSelector'
import AddToCart from '../components/AddToCart'
import { Product } from '@/lib/product'
import { Color } from '@/lib/color'
import Link from 'next/link'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { X } from 'lucide-react'
import StyleCatalogue from './StyleCatalogue'
import { useCart } from '@/app/context/CartContext'

interface ProductDetailsProps {
  product: Product;
  brandSlug: string;
}

function ProductDetails({ product, brandSlug }: ProductDetailsProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<Color | null>(null)
  const [showFloatingButton, setShowFloatingButton] = useState(false)
  const [showSizeModal, setShowSizeModal] = useState(false)
  const staticButtonRef = useRef<HTMLDivElement>(null)

  // ✅ Context Hook verwenden
  const { openCart } = useCart()

  const formattedPrice = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: product.currency,
  }).format(product.price)

  const colorsForSelector: Color[] = product.colors.map((pc) => ({
    id: pc.id,
    name: pc.name,
    hex: pc.hex,
  }))

  // Scroll-Erkennung für fliegenden Button
  useEffect(() => {
    const handleScroll = () => {
      if (staticButtonRef.current) {
        const rect = staticButtonRef.current.getBoundingClientRect()
        setShowFloatingButton(rect.bottom < 0)
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleFloatingButtonClick = () => {
    if (!selectedSize) {
      // Größenauswahl-Modal öffnen
      setShowSizeModal(true)
    } else {
      // ✅ Context verwenden statt localem State
      // Hier würdest du das Produkt zum Cart hinzufügen
      // addToCart(product, selectedSize, selectedColor)
      openCart()
    }
  }

  const handleSizeSelectFromModal = (size: string) => {
    setSelectedSize(size)
    setShowSizeModal(false)
    // ✅ Context verwenden
    // addToCart(product, size, selectedColor)
    openCart()
  }

  return (
    <>
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Bilder-Galerie */}
          <div>
            <ImageGallery images={product.images} productName={product.name} />
            {/* Breadcrumb — below gallery */}
            <nav className="px-4 lg:px-6 py-4">
              <ol className="flex items-center gap-1.5 text-[11px] text-enunas-gray-medium tracking-[0.02em]"
                  style={{ fontFamily: 'var(--font-league-spartan)' }}>
                <li><Link href="/" className="hover:text-enunas-black transition-colors duration-200">Home</Link></li>
                <li className="text-enunas-gray-light">/</li>
                <li><Link href="/bekleidung" className="hover:text-enunas-black transition-colors duration-200">Bekleidung</Link></li>
                <li className="text-enunas-gray-light">/</li>
                <li><Link href={`/bekleidung/${brandSlug}`} className="hover:text-enunas-black transition-colors duration-200">{product.brand}</Link></li>
                <li className="text-enunas-gray-light">/</li>
                <li className="text-enunas-gray-dark">{product.name}</li>
              </ol>
            </nav>
          </div>
          
          {/* Produktinfo */}
          <div className="pt-10 px-15 sm:px-20">
            {/* Marke & Name */}
            <div className="text-center">
              <Link href="/" className="text-[#370E4D] hover:text-black">
                <h2 className="text-3xl sm:text-4xl space-y-10">{product.brand}</h2>
              </Link>
              <h2 className="text-lg sm:text-xl mt-6">{product.name}</h2>
            </div>
            
            {/* Preis */}
            <div className="flex justify-center gap-2 my-4 mb-6">
              <div className="text-lg font-light">{formattedPrice}</div>
              <p className="flex text-sm text-gray-500 text-center">
                inkl. MwSt. zzgl. Versand
              </p>
            </div>
            
            {/* Farbauswahl */}
            {product.colors.length > 0 && (
              <div className="flex justify-center">
                <ColorSelector
                  colors={colorsForSelector}
                  onColorSelect={(color) => setSelectedColor(color)}
                />
              </div>
            )}

            {/* Größenauswahl */}
            {product.sizes.length > 0 && (
              <div className="flex justify-center mt-6 space-y-10">
                <SizeSelector
                  sizes={product.sizes}
                  selectedSize={selectedSize}
                  onSizeSelect={(size) => setSelectedSize(size)}
                />
              </div>
            )}

            {/* Catalogue/Style der Kleidung */}
            <div className="space-y-10 my-6">
              <StyleCatalogue catalogue={product.catalogue}/>
            </div> 
            
            {/* Warenkorb-Button mit Referenz */}
            <div ref={staticButtonRef} className="flex justify-center my-4">
              <AddToCart selectedSize={selectedSize} />
            </div>
            
            {/* Produktdetails */}
            <div>
              <Accordion type="single" collapsible>
                <AccordionItem value="details">
                  <AccordionTrigger>Produktdetails</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-sm">
                      <p><strong>Produktnummer:</strong> {product.sku}</p>
                      <p><strong>Material:</strong> 100% Baumwolle</p>
                      <p><strong>Pflegehinweise:</strong> Maschinenwäsche 30°C</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="shipping">
                  <AccordionTrigger>Versand & Rückgabe</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-sm">
                      <p>• Versand in 2–4 Werktagen</p>
                      <p>• Kostenloser Versand ab 50€</p>
                      <p>• Rückgabe innerhalb 14 Tagen</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="size-guide">
                  <AccordionTrigger>Größentabelle</AccordionTrigger>
                  <AccordionContent>
                    <div className="text-sm">
                      <p>XS: 34-36 | S: 36-38 | M: 38-40 | L: 40-42 | XL: 42-44</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Add-to-Cart Bar — McQueen sharp style */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-500 ease-out ${
          showFloatingButton
            ? 'translate-y-0'
            : 'translate-y-full'
        }`}
      >
        <div className="bg-white border-t border-enunas-gray-light">
          <div className="max-w-[1800px] mx-auto px-6 lg:px-12 py-4 flex items-center gap-6">
            <div className="flex-1 min-w-0">
              <p
                className="text-sm text-enunas-black truncate"
                style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
              >
                {product.name}
              </p>
              <div className="flex items-center gap-3 mt-0.5">
                <span
                  className="text-xs text-enunas-gray-dark"
                  style={{ fontFamily: 'var(--font-league-spartan)' }}
                >
                  {formattedPrice}
                </span>
                {selectedSize && (
                  <span
                    className="text-[10px] text-enunas-gray-medium uppercase tracking-[0.1em]"
                    style={{ fontFamily: 'var(--font-league-spartan)' }}
                  >
                    Größe: {selectedSize}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleFloatingButtonClick}
              className="px-10 py-3.5 bg-[#370E4D] text-white hover:bg-[#4A1566] transition-colors duration-300 whitespace-nowrap"
              style={{ fontFamily: 'var(--font-league-spartan)' }}
            >
              <span className="text-[11px] tracking-[0.15em] uppercase">
                {selectedSize ? 'In den Warenkorb' : 'Größe wählen'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Size Selection Modal — sharp, editorial */}
      {showSizeModal && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center"
          onClick={() => setShowSizeModal(false)}
        >
          <div
            className="bg-white w-full sm:max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
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

            {/* Product context */}
            <div className="px-8 pt-6 pb-4">
              <p
                className="text-sm text-enunas-gray-medium"
                style={{ fontFamily: 'var(--font-league-spartan)' }}
              >
                {product.name}
              </p>
            </div>

            {/* Size grid — flex wrap for natural flow */}
            <div className="px-8 pb-8">
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => {
                  const cols = product.sizes.length <= 3 ? 3 : 4
                  return (
                    <button
                      key={size}
                      onClick={() => handleSizeSelectFromModal(size)}
                      className={`py-3.5 text-center text-sm text-enunas-black
                               border border-enunas-gray-light
                               hover:border-[#370E4D] hover:bg-[#370E4D] hover:text-white
                               transition-all duration-200
                               ${selectedSize === size
                                 ? 'border-[#370E4D] bg-[#370E4D] text-white'
                                 : ''
                               }`}
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

      {/* ❌ ENTFERNT: CartSidebar wird jetzt im MinTimeWrapper gerendert */}
    </>
  )
}

export default ProductDetails