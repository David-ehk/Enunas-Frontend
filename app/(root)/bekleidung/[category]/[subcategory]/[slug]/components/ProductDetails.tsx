"use client"

import React, { useState } from 'react'
import ImageGallery from './ImageGallery'
import ColorSelector from './ColorSelector'
import SizeSelector from './SizeSelector'
import AddToCart from './AddToCart'
import { Product } from '@/lib/product'
import { ProductColor } from '@/lib/product'
import { Color } from '@/lib/color'
import Link from 'next/link'
import {Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

interface ProductDetailsProps {
  product: Product;
}

function ProductDetails({ product }: ProductDetailsProps) {
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
    <div className="px-4 pt-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 ">
        {/* Bilder-Galerie */}
        <div>
          <ImageGallery images={product.images} productName={product.name} />
        </div>
        
        {/* Produktinfo */}
        <div className="space-y-6">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500">
            <a href="/">Home</a> /{' '}
            <a href="/bekleidung">Bekleidung</a> /{' '}
            <span className="font-semibold">{product.name}</span>
          </nav>
          
          {/* Marke & Name */}
          <div>
            <Link href="/">
             <p className="text-gray-600 flex justify-center hover:text-[#000000]">{product.brand}</p>
            </Link>
            <h1 className="text-3xl flex justify-center">{product.name}</h1>
          </div>
          
          {/* Preis */}
          <div className="text-2xl gap-2 flex justify-center">
            {formattedPrice}
            <span className="text-sm text-gray-500 flex items-center">
              inkl. MwSt. zzgl. Versand
            </span>
          </div>
          
          {/* Farbauswahl */}
          <div className="flex justify-center">
          {product.colors.length > 0 && (
            <ColorSelector
              colors={colorsForSelector}
              
            />
          )}
          </div>

          {/* Größenauswahl */}
          <div className="flex justify-center">
          {product.sizes.length > 0 && (
            <SizeSelector
              sizes={product.sizes}
            >
              {(selectedSize) => (
                <>
                  {/* Warenkorb-Button */}
                  <div className="flex justify-center mt-4">
                    <AddToCart selectedSize={selectedSize} />
                  </div>
                </>
              )}
            </SizeSelector>
          )}
          </div>
          
          {/* Fallback Warenkorb-Button wenn keine Größen vorhanden */}
          {product.sizes.length === 0 && (
            <div className="flex justify-center">
              <AddToCart selectedSize={null} />
            </div>
          )}
          
          {/* Produktdetails */}
          <div className="border-t pt-6 space-y-4">
            <div>
              <h3 className="font-semibold">Produktnummer:</h3>
              <p>{product.sku}</p>
            </div>
         </div>
         <div>
           <Accordion type="single" collapsible>
             <AccordionItem value="details">
                <AccordionTrigger>Produktdetails</AccordionTrigger>
                  <AccordionContent>
                     Produktnummer, Material, Pflegehinweise etc.
                   </AccordionContent>
              </AccordionItem>

                <AccordionItem value="shipping">
                  <AccordionTrigger>Versand & Rückgabe</AccordionTrigger>
                     <AccordionContent>
                        Versand in 2–4 Werktagen. Rückgabe innerhalb 14 Tagen.
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