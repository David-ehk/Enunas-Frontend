"use client"

import React, { useState, useEffect, useRef } from 'react'
import ImageGallery from './ImageGallery'
import ColorSelector from './ColorSelector'
import SizeSelector from './SizeSelector'
import AddToCart from '../components/AddToCart'
// ❌ ENTFERNT: import CartSidebar from '@/app/(root)/cart/components/CartSidebar'
import { Product } from '@/lib/product'
import { Color } from '@/lib/color'
import Link from 'next/link'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { X } from 'lucide-react'
import StyleCatalogue from './StyleCatalogue'
import { useCart } from '@/app/context/CartContext'

interface ProductDetailsProps {
  product: Product;
}

function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<Color | null>(null)
  // ❌ ENTFERNT: const [isCartOpen, setIsCartOpen] = useState(false)
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
      <div className="pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bilder-Galerie */}
          <div>
            <ImageGallery images={product.images} productName={product.name} />
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

      {/* Fliegender Warenkorb Button */}
      <div
        className={`fixed bottom-6 left-0 right-0 px-6 transition-all duration-500 z-50 ${
          showFloatingButton
            ? 'translate-y-0 opacity-100'
            : 'translate-y-20 opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-4xl mx-auto backdrop-blur-xl bg-white/95 border border-gray-200 rounded-sm shadow-2xl p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <h4 className="font-semibold text-black">{product.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-gray-600">{formattedPrice}</p>
                {selectedSize && (
                  <span className="text-xs text-gray-500">Größe: {selectedSize}</span>
                )}
                <span className="text-xs text-gray-500">color</span>
              </div>
            </div>
            
            <button
              onClick={handleFloatingButtonClick}
              className="px-8 py-3 bg-[#370E4D] text-white rounded-sm hover:bg-[#2a0a3a] transition-all whitespace-nowrap"
            >
              <h3 className="text-base sm:text-lg">
                {selectedSize ? 'In den Warenkorb' : 'Größe wählen'}
              </h3>
            </button>
          </div>
        </div>
      </div>

      {/* Größenauswahl Modal */}
      {showSizeModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setShowSizeModal(false)}
        >
          <div 
            className="bg-white rounded-sm shadow-2xl max-w-md w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSizeModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-2xl text-black mb-2">
              Größe auswählen
            </h3>
            <p className="font-light text-gray-600 mb-6">
              Bitte wähle eine Größe für: {product.name}
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => handleSizeSelectFromModal(size)}
                  className="py-4 px-6 border-2 border-gray-300 hover:border-[#370E4D] hover:bg-gray-50 font-medium transition-all text-center"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ❌ ENTFERNT: CartSidebar wird jetzt im MinTimeWrapper gerendert */}
    </>
  )
}

export default ProductDetails