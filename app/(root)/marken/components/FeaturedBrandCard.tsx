"use client"

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { generateSlug } from '@/lib/product';

interface Brand {
  id: number;
  name: string;
  image?: string;
}

interface FeaturedBrandCardProps {
  brand: Brand;
}

export const FeaturedBrandCard: React.FC<FeaturedBrandCardProps> = ({ brand }) => {
  const brandSlug = generateSlug(brand.name);
  const hasRealImage = brand.image && brand.image !== '...' && brand.image.startsWith('http');

  return (
    <Link href={`/bekleidung/${brandSlug}`} className="group cursor-pointer">
      <div className="relative aspect-square mb-3 overflow-hidden bg-[#F5F5F0]">
        {hasRealImage ? (
          <Image
            src={brand.image!}
            alt={brand.name}
            fill
            sizes="(max-width: 768px) 33vw, 20vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span
              className="text-4xl font-light text-[#370E4D]"
              style={{ fontFamily: 'var(--font-cormorant)' }}
            >
              {brand.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
      </div>
      <h3
        className="text-sm text-center font-light tracking-wide text-[#0A0A0A] group-hover:text-[#370E4D] transition-colors"
        style={{ fontFamily: 'var(--font-league-spartan)' }}
      >
        {brand.name}
      </h3>
    </Link>
  );
};
