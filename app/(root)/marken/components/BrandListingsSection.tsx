"use client"

import React, { useState, useMemo } from 'react';
import { AlphabetNav } from './AlphabetNav';
import { BrandListSection } from './BrandListSection';

interface Brand {
  id: number;
  name: string;
  letter: string;
}

interface BrandListingsSectionProps {
  brands: Brand[];
}

export const BrandListingsSection: React.FC<BrandListingsSectionProps> = ({ brands }) => {
  const [selectedLetter, setSelectedLetter] = useState('all');

  const availableLetters = useMemo(() => 
    [...new Set(brands.map(b => b.letter))],
    [brands]
  );

  const filteredBrands = useMemo(() => 
    selectedLetter === 'all' 
      ? brands 
      : brands.filter(b => b.letter === selectedLetter),
    [brands, selectedLetter]
  );

  const brandsByLetter = useMemo(() => 
    filteredBrands.reduce((acc, brand) => {
      if (!acc[brand.letter]) {
        acc[brand.letter] = [];
      }
      acc[brand.letter].push(brand);
      return acc;
    }, {} as Record<string, Brand[]>),
    [filteredBrands]
  );

  return (
    <section>
      <h2 className="text-center text-2xl tracking-wider uppercase mb-8 text-black">
        Fashion Designer
      </h2>

      <AlphabetNav 
        selectedLetter={selectedLetter} 
        onLetterClick={setSelectedLetter}
        availableLetters={availableLetters}
      />

      <div className="mt-12">
        {Object.keys(brandsByLetter).sort().map((letter) => (
          <BrandListSection
            key={letter}
            letter={letter}
            brands={brandsByLetter[letter]}
          />
        ))}
      </div>
    </section>
  );
};
