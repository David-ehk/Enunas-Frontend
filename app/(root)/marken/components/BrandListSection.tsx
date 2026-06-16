import React from 'react';
import Link from 'next/link';
import { generateSlug } from '@/lib/product';

interface Brand {
  id: number;
  name: string;
  letter: string;
}

interface BrandListSectionProps {
  letter: string;
  brands: Brand[];
}

export const BrandListSection: React.FC<BrandListSectionProps> = ({ letter, brands }) => {
  return (
    <div className="mb-16">
      <h2 className="text-3xl font-light mb-8 pb-4 border-b border-gray-200">
        {letter}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-4">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={`/bekleidung/${generateSlug(brand.name)}`}
            className="text-sm text-gray-700 hover:text-black transition-colors"
          >
            {brand.name}
          </Link>
        ))}
      </div>
    </div>
  );
};