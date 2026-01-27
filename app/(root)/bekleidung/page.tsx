import React from 'react';
import Titel from './components/Titel';
import Filter from './components/Filter';
import ProductCard from './components/ProductCard';
import CategoryNavigation from './components/CategoryNavigation';

export default function Bekleidungpage() {
  return (
    <>
    <section>
        <CategoryNavigation />
      </section>
      <section>
        <Titel />
      </section>
      <section>
        <Filter />
      </section>
      {/* Richtige Product section hinzufügen */}
      <section className="sm:px-3 px-5 py-3">
        <ProductCard/>
      </section>
      <section className="sm:px-3 px-5 py-3">
        <ProductCard/>
      </section>
      <section className="sm:px-3 px-5 py-3">
        <ProductCard/>
      </section>
    </>
  );
}
