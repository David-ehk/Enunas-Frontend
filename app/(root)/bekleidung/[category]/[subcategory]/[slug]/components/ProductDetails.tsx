"use client"

import React, { useState } from 'react'
import ImageGallery from './ImageGallery'
import ColorSelector from './ColorSelector'
import SizeSelector from './SizeSelector'
import AddToCart from './AddToCart'
import { Product } from '@/lib/product'
import { ProductColor } from '@/lib/product'
import { Color } from '@/lib/color'

interface ProductDetailsProps {
  product: Product;
}

function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(
    product.colors[0] || null
  )
  const [selectedSize, setSelectedSize] = useState<string | null>(null)

  const formattedPrice = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: product.currency,
  }).format(product.price)

  const handleColorSelect = (color: Color) => {
    // Convert Color to ProductColor
    const productColor: ProductColor = {
      id: color.id,
      name: color.name,
      hex: color.hex,
      slug: color.id, // Use id as slug if not available
    }
    setSelectedColor(productColor)
  }

  // Convert ProductColor[] to Color[] for ColorSelector
  const colorsForSelector: Color[] = product.colors.map((pc) => ({
    id: pc.id,
    name: pc.name,
    hex: pc.hex,
  }))

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-gray-600">{product.brand}</p>
          </div>
          
          {/* Preis */}
          <div className="text-2xl font-bold">
            {formattedPrice}
            <span className="text-sm text-gray-500 block">
              inkl. MwSt. zzgl. Versand
            </span>
          </div>
          
          {/* Farbauswahl */}
          {product.colors.length > 0 && (
            <ColorSelector
              colors={colorsForSelector}
              onColorSelect={handleColorSelect}
            />
          )}
          
          {/* Größenauswahl */}
          {product.sizes.length > 0 && (
            <SizeSelector
              sizes={product.sizes}
              selected={selectedSize}
              onSizeSelect={handleSizeSelect}
            />
          )}
          
          {/* Warenkorb-Button */}
          <AddToCart selectedSize={selectedSize} />
          
          {/* Produktdetails */}
          <div className="border-t pt-6 space-y-4">
            <div>
              <h3 className="font-semibold">Produktnummer:</h3>
              <p>{product.sku}</p>
            </div>
            
            <div>
              <h3 className="font-semibold">Beschreibung:</h3>
              <p className="text-gray-700">{product.description}</p>
            </div>
          </div>
          
          {/* Versand & Rückgabe */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Versand & Rückgabe</h3>
            <ul className="text-sm space-y-1">
              <li>✓ Kostenloser Versand ab 50€</li>
              <li>✓ 30 Tage Rückgaberecht</li>
              <li>✓ Sichere Zahlung</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetails