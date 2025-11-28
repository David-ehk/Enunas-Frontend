import React from 'react'
import Titel from './components/Titel'
import Filter from './components/Filter'
import ProductCard from './components/ProductCard'

export default function Bekleidungpage() {
  return (
    <>
    <section className="">
        <Titel/>
    </section>
    <section>
      <Filter/>
    </section>
    {/*Richtige Product section hinzufügen*/}
    <section className="sm:px-3 px-5 sm:py-6 py-3">
      <ProductCard/>
      <ProductCard/>
      <ProductCard/>
      <ProductCard/>
    </section>
    </>
  )
}
