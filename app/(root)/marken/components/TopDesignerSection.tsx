import React from 'react';
import { FeaturedBrandCard } from './FeaturedBrandCard';

interface Brand {
  id: number;
  name: string;
  image: string;
}

interface TopDesignerSectionProps {
  brands: Brand[];
}

export const TopDesignerSection: React.FC<TopDesignerSectionProps> = ({ brands }) => {
  return (
    <section className="mb-20">
      <h2 className="text-center text-2xl tracking-wider uppercase mb-8 text-black font-medium">
        Top Designer
      </h2>
      <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-4xl mx-auto">
        {brands.map((brand) => (
          <FeaturedBrandCard key={brand.id} brand={brand} />
        ))}
      </div>
    </section>
  );
};