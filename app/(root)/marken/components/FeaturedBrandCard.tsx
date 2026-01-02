"use client"

import React, { useState } from 'react';

interface Brand {
  id: number;
  name: string;
  image: string;
}

interface FeaturedBrandCardProps {
  brand: Brand;
}

export const FeaturedBrandCard: React.FC<FeaturedBrandCardProps> = ({ brand }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square mb-3 overflow-hidden bg-gray-100">
        <img
          src={brand.image}
          alt={brand.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isHovered ? 'opacity-10' : 'opacity-0'
          }`}
        />
      </div>
      <h3 className="text-sm text-center font-light tracking-wide group-hover:text-gray-600 transition-colors">
        {brand.name}
      </h3>
    </div>
  );
};