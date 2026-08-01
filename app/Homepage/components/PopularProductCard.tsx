"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

interface ProductColour {
  hex: string;
  name: string;
}

const STYLE_COLORS: Record<string, { bg: string; text: string }> = {
  'athleisure': { bg: 'bg-[#C01B1B]', text: 'text-white' },
  'culture': { bg: 'bg-[#EA9575]', text: 'text-white' },
  'cultural': { bg: 'bg-[#EA9575]', text: 'text-white' }, // Alias
  'streetwear': { bg: 'bg-[#0011A5]', text: 'text-white' },
  'experimental': { bg: 'bg-[#6C169C]', text: 'text-white' },
  'star': { bg: 'bg-black', text: 'text-white' },
}

// Canonical clothing order. Numeric (shoe) sizes sort numerically after these,
// and unrecognised values are kept rather than dropped — unlike sortedSizes()
// in the slug page's types, which filters to a whitelist.
const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'XXXL'];

const sortSizes = (sizes: string[]): string[] =>
  [...sizes].sort((a, b) => {
    const na = Number(a), nb = Number(b);
    const aNum = a.trim() !== '' && !isNaN(na);
    const bNum = b.trim() !== '' && !isNaN(nb);
    if (aNum && bNum) return na - nb;
    const ia = SIZE_ORDER.indexOf(a.trim().toUpperCase());
    const ib = SIZE_ORDER.indexOf(b.trim().toUpperCase());
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });

interface PopularProductCardProps {
  imgURL: string;
  brandName: string;
  productName: string;
  price: string;
  href: string;
  colours: ProductColour[];
  createdAt: Date | string;
  sizes?: string[];
  categories?: string[];
  catalogue?: string[]; // alias for categories
}

const isNewProduct = (createdAt: Date | string): boolean => {
  const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  return date >= threeDaysAgo;
};

const PopularProductCard = ({
  imgURL,
  brandName,
  productName,
  price,
  href,
  colours,
  createdAt,
  sizes = [],
  categories = [],
  catalogue = []
}: PopularProductCardProps) => {
  // Use catalogue if categories is empty
  const displayCategories = categories.length > 0 ? categories : catalogue;
  const [isHovered, setIsHovered] = useState(false);
  // Touch devices fire mouseenter on tap but never mouseleave, which would leave
  // the card flipped to sizes with the price hidden. Only arm the swap where
  // hover actually exists.
  const [canHover, setCanHover] = useState(false);
  useEffect(() => {
    setCanHover(window.matchMedia('(hover: hover)').matches);
  }, []);
  const isNew = isNewProduct(createdAt);

  return (
    <div
      className="flex flex-1 flex-col w-full group"
      onMouseEnter={() => canHover && setIsHovered(true)}
      onMouseLeave={() => canHover && setIsHovered(false)}
    >
      <Link href={href} className="block">
        {/* Image Container */}
        <div className="relative w-full aspect-[3/4] overflow-hidden bg-enunas-off-white">
          {imgURL && (
            <Image
              className="object-cover transition-transform duration-800 ease-out-expo group-hover:scale-105"
              src={imgURL}
              alt={productName}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}

          {/* Subtle Overlay on Hover */}
          <div className="absolute inset-0 bg-enunas-purple/0 transition-colors duration-300 group-hover:bg-enunas-purple/5" />

          {/* Favorite Icon */}
          <button
            className="absolute top-3 right-3 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <svg
              className="w-5 h-5 text-enunas-black hover:text-enunas-purple transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        {/* Product Info */}
        <div className="pt-3 pb-2 relative min-h-[120px]">

          {/* Static Elements (always visible) */}
          <div className="space-y-1">
            {/* "new in" Label */}
            {isNew && (
              <span className="text-xs text-[#370E4D] lowercase tracking-wide">
                new in
              </span>
            )}

            {/* Brand Name - Elegant, restrained styling */}
            <p className="font-league-spartan text-sm font-normal text-gray-900 tracking-wide uppercase transition-colors duration-300 group-hover:text-enunas-purple">
              {brandName}
            </p>
          </div>

          {/* Content Container - Stacked for crossfade */}
          <div className="relative mt-1">
            {/* Default Content (Product Details) */}
            <div
              className={`
                space-y-2
                transition-opacity duration-300 ease-out-expo
                ${isHovered ? 'opacity-0' : 'opacity-100'}
              `}
            >
              {/* Product Name */}
              <h3 className="font-cormorant text-base font-normal text-gray-700 leading-snug">
                {productName}
              </h3>

              {/* Color Swatches */}
              <div className="flex items-start gap-2">
                {/* First Swatch with centered bar */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-5 h-5 border border-gray-200"
                    style={{ backgroundColor: colours[0]?.hex }}
                    aria-label={colours[0]?.name}
                  />
                  <div className="h-[1px] w-6 bg-black mt-1" />
                </div>

                {/* Second Swatch (only if exactly 2 colors) */}
                {colours.length === 2 && (
                  <div className="flex flex-col items-center">
                    <div
                      className="w-5 h-5 border border-gray-200"
                      style={{ backgroundColor: colours[1].hex }}
                      aria-label={colours[1].name}
                    />
                    <div className="h-[1px] w-6 bg-transparent mt-1" />
                  </div>
                )}

                {/* More than 2 colors: show count */}
                {colours.length > 2 && (
                  <span className="text-xs text-enunas-gray-medium self-center">
                    +{colours.length - 1} siehe weitere
                  </span>
                )}
              </div>

              {/* Price */}
              <p className="text-sm font-light text-enunas-black">
                {price}
              </p>
            </div>

            {/* Hover Content (Sizes & Categories) - Absolute for crossfade */}
            <div
              className={`
                absolute top-0 left-0 right-0
                space-y-2
                transition-opacity duration-300 ease-out-expo
                ${isHovered ? 'opacity-100' : 'opacity-0'}
              `}
            >
              {/* Sizes */}
              {sizes.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs text-enunas-gray-medium">
                    Größe erhältlich in
                  </span>
                  <p className="text-sm text-enunas-black">
                    {sortSizes(sizes).join(", ")}
                  </p>
                </div>
              )}

              {/* Category Pills */}
              {displayCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {displayCategories.map((category, index) => {
                    const colors = STYLE_COLORS[category.toLowerCase()] || { bg: 'bg-gray-400', text: 'text-white' }
                    return (
                      <span
                        key={index}
                        className={`px-3 py-1 text-xs font-light border border-black ${colors.bg} ${colors.text}`}
                      >
                        {category}
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default PopularProductCard
