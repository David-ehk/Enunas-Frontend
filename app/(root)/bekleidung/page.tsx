'use client'

import React, { useState } from 'react'
import DisappearingNavbar from './components/DisappearingNavbar'
import CategoryNavigation from './components/CategoryNavigation'
import FilterBar from './components/FilterBar'
import PopularProductCard from '@/app/Homepage/components/PopularProductCard'
import { generateSlug } from '@/lib/product'

// Temporäre Produktdaten
const products = [
  {
    imgURL: "https://www.manieredevoir.com/cdn/shop/files/GEN-WD-23-10-2025.jpg?crop=center&height=2095&v=1761206881&width=1920",
    brandName: "Nike",
    productName: "Nike Air Shoes 5",
    price: "220€",
    href: `/bekleidung/bekleidung/schuhe/${generateSlug("nike air shoes 5")}`,
    colours: [
      { hex: "#DE0000", name: "Rot" },
      { hex: "#1A1A1A", name: "Schwarz" }
    ],
    createdAt: new Date(),
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    categories: ["Streetwear"],
    gender: "herren"
  },
  {
    imgURL: "https://www.viviennewestwood.com/dw/image/v2/BJGV_PRD/on/demandware.static/-/Sites-viviennewestwood-master-catalog/default/dw69896e20/images/2G01000A-J001M-_GREY-MELANGE_001_large.jpeg?q=80",
    brandName: "Jordan",
    productName: "Worlds End Denim Boxer Jacket",
    price: "220€",
    href: `/bekleidung/bekleidung/jacken/${generateSlug("Worlds End Denim Boxer Jacket")}`,
    colours: [
      { hex: "#630393", name: "Lila" },
      { hex: "#1A1A1A", name: "Schwarz" }
    ],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    sizes: ["XS", "S", "M", "L", "XL"],
    categories: ["Experimental"],
    gender: "damen"
  },
  {
    imgURL: "https://eu.manieredevoir.com/cdn/shop/files/MDV_0030_MDV2_be0fab84-a04c-4251-adc9-1fefaa4175c4.jpg?v=1759502594",
    brandName: "Maison Guava",
    productName: "D.D. Shell Hooded-Padded Jacket",
    price: "220€",
    href: `/bekleidung/bekleidung/jacken/${generateSlug("D.D. Shell hooded-padded jacket")}`,
    colours: [
      { hex: "#FFFFFF", name: "Weiß" }
    ],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    sizes: ["S", "M", "L", "XL", "XXL"],
    categories: ["Athleisure"],
    gender: "herren"
  },
  {
    imgURL: "https://www.viviennewestwood.com/dw/image/v2/BJGV_PRD/on/demandware.static/-/Library-Sites-viviennewestwood-global-content/default/dw8c63789d/images/collections/autumn-winter-25_26/AW2526%20Lookbook/2x3/VW_AW2526_Lookbook_Look_02.jpg?sw=632&sh=948&q=80",
    brandName: "6pm",
    productName: "Produktbeschreibung Random Blazer",
    price: "220€",
    href: `/bekleidung/bekleidung/oberteile/${generateSlug("Produktbeschreibung random blabalba")}`,
    colours: [
      { hex: "#0A0A0A", name: "Schwarz" },
      { hex: "#2D2D2D", name: "Anthrazit" }
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    sizes: ["XS", "S", "M", "L"],
    categories: ["Culture"],
    gender: "damen"
  },
  {
    imgURL: "https://www.manieredevoir.com/cdn/shop/files/GEN-WD-23-10-2025.jpg?crop=center&height=2095&v=1761206881&width=1920",
    brandName: "Off-White",
    productName: "Arrow Logo Hoodie",
    price: "450€",
    href: `/bekleidung/oberteile/hoodies/${generateSlug("Arrow Logo Hoodie")}`,
    colours: [
      { hex: "#000000", name: "Schwarz" }
    ],
    createdAt: new Date(),
    sizes: ["S", "M", "L", "XL"],
    categories: ["Streetwear"],
    gender: "herren"
  },
  {
    imgURL: "https://www.viviennewestwood.com/dw/image/v2/BJGV_PRD/on/demandware.static/-/Sites-viviennewestwood-master-catalog/default/dw69896e20/images/2G01000A-J001M-_GREY-MELANGE_001_large.jpeg?q=80",
    brandName: "Acne Studios",
    productName: "Face Logo T-Shirt",
    price: "180€",
    href: `/bekleidung/oberteile/t-shirts/${generateSlug("Face Logo T-Shirt")}`,
    colours: [
      { hex: "#FFFFFF", name: "Weiß" },
      { hex: "#FFC0CB", name: "Rosa" }
    ],
    createdAt: new Date(),
    sizes: ["XS", "S", "M", "L"],
    categories: ["Minimal"],
    gender: "damen"
  },
  {
    imgURL: "https://eu.manieredevoir.com/cdn/shop/files/MDV_0030_MDV2_be0fab84-a04c-4251-adc9-1fefaa4175c4.jpg?v=1759502594",
    brandName: "Balenciaga",
    productName: "Track Sneakers 2.0",
    price: "895€",
    href: `/bekleidung/schuhe/${generateSlug("Track Sneakers 2.0")}`,
    colours: [
      { hex: "#FFFFFF", name: "Weiß" },
      { hex: "#000000", name: "Schwarz" }
    ],
    createdAt: new Date(),
    sizes: ["39", "40", "41", "42", "43", "44"],
    categories: ["Luxury"],
    gender: "herren"
  },
  {
    imgURL: "https://www.viviennewestwood.com/dw/image/v2/BJGV_PRD/on/demandware.static/-/Library-Sites-viviennewestwood-global-content/default/dw8c63789d/images/collections/autumn-winter-25_26/AW2526%20Lookbook/2x3/VW_AW2526_Lookbook_Look_02.jpg?sw=632&sh=948&q=80",
    brandName: "Moncler",
    productName: "Maya Short Down Jacket",
    price: "1.290€",
    href: `/bekleidung/oberteile/jacken/${generateSlug("Maya Short Down Jacket")}`,
    colours: [
      { hex: "#000000", name: "Schwarz" },
      { hex: "#1A237E", name: "Navy" }
    ],
    createdAt: new Date(),
    sizes: ["0", "1", "2", "3", "4"],
    categories: ["Luxury"],
    gender: "damen"
  }
]

export default function BekleidungPage() {
  const [activeGenders, setActiveGenders] = useState<string[]>(['damen', 'herren'])

  // Filter products by gender
  const filteredProducts = products.filter(product =>
    activeGenders.includes(product.gender)
  )

  return (
    <main className="min-h-screen bg-white">
      {/* Fixed Navbar - z-50 */}
      <DisappearingNavbar />

      {/* Spacer for fixed Navbar */}
      <div className="h-14" />

      {/* Category Navigation - scrolls with content */}
      <div className="bg-white border-b border-gray-100">
        <CategoryNavigation />
      </div>

      {/* Main Content - All scrollable like McQueen */}
      <div className="bg-white">
        {/* Page Header - Elegant, minimal McQueen style */}
        <div className="text-center pt-16 pb-8 lg:pt-20 lg:pb-10 px-6">
          <h1
            className="text-3xl lg:text-4xl tracking-[0.02em] text-enunas-black font-light"
            style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
          >
            Bekleidung
          </h1>

          <div className="mt-5">
            <p
              className="text-[12px] text-enunas-gray-medium max-w-xl mx-auto leading-relaxed tracking-[0.02em]"
              style={{ fontFamily: 'var(--font-league-spartan)' }}
            >
              Kuratierte Auswahl an Premium-Streetwear und Designermode.
              Jeder Look, ein Statement.
            </p>
          </div>
        </div>

        {/* Filter Bar - McQueen elegant style */}
        <FilterBar
          articleCount={filteredProducts.length}
          onGenderChange={setActiveGenders}
        />

        {/* Product Grid - Generous spacing like McQueen */}
        <section className="px-4 lg:px-8 xl:px-12 py-8 lg:py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 lg:gap-6 max-w-[1800px] mx-auto">
            {filteredProducts.map((product) => (
              <PopularProductCard key={product.productName + product.gender} {...product} />
            ))}
          </div>

          {/* Load More Button - McQueen refined style */}
          {filteredProducts.length >= 8 && (
            <div className="flex justify-center mt-16 lg:mt-20">
              <button
                className="group relative px-10 py-4 text-[11px] tracking-[0.15em] uppercase text-enunas-black
                         border border-enunas-black overflow-hidden transition-colors duration-500"
                style={{ fontFamily: 'var(--font-league-spartan)' }}
              >
                <span className="relative z-10 transition-colors duration-500 group-hover:text-white">
                  Mehr laden
                </span>
                <span className="absolute inset-0 bg-enunas-black transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
              </button>
            </div>
          )}
        </section>

        {/* Bottom spacing */}
        <div className="h-16 lg:h-24" />
      </div>
    </main>
  )
}
