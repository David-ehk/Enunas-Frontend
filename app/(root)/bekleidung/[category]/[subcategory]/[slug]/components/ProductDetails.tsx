"use client"

import React, { useState } from 'react'
import ImageGallery from './ImageGallery'
import ColorSelector from './ColorSelector'
import SizeSelector from './SizeSelector'
import AddToCart from './AddToCart'
import { Product } from '@/lib/product'
import { Color } from '@/lib/color'
import Link from 'next/link'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import CatalogueDescription from '@/app/(root)/catalogue/components/CatalogueDescription'

interface ProductDetailsProps {
  product: Product;
}

function ProductDetails({ product }: ProductDetailsProps) {
  // State für ausgewählte Größe
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<Color | null>(null)

  const formattedPrice = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: product.currency,
  }).format(product.price)

  // Convert ProductColor[] to Color[] for ColorSelector
  const colorsForSelector: Color[] = product.colors.map((pc) => ({
    id: pc.id,
    name: pc.name,
    hex: pc.hex,
  }))

  return (
    <div className="px-10 pt-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bilder-Galerie */}
        <div>
          <ImageGallery images={product.images} productName={product.name} />
        </div>
        
        {/* Produktinfo */}
        <div className="space-y-6 pt-10">
         
          
          {/* Marke & Name */}
          <div className="text-center">
            <Link href="/" className="text-[#370E4D] hover:text-black">
              {product.brand}
            </Link>
            <h1 className="text-3xl font-light mt-2">{product.name}</h1>
          </div>
          
          {/* Preis */}
          <div className="flex justify-center gap-2 ">
            <div className="text-2xl font-light">{formattedPrice}</div>
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

          {/* Catalogue */}
          {product.catalogue.length > 0 && (
            <div className="flex justify-center">
              <CatalogueDescription/>
            </div>
          )}

          {/* Größenauswahl */}
          {product.sizes.length > 0 && (
            <div className="flex justify-center">
              <SizeSelector
                sizes={product.sizes}
                onSizeSelect={(size) => setSelectedSize(size)}
              />
            </div>
          )}
          
          {/* Warenkorb-Button */}
          <div className="flex justify-center">
            <AddToCart 
              selectedSize={selectedSize}
            />
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
  )
}

export default ProductDetails