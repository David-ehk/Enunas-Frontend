"use client"

import React from 'react'

interface AddToCartProps {
  selectedSize?: string | null;
}

function AddToCart({ selectedSize = null }: AddToCartProps) {
  const hasSizeSelected = selectedSize !== null

  return (
    <button 
      className="relative w-full py-4 px-6 tracking-widest text-white bg-[#370E4D] overflow-hidden group transition-colors duration-600"
      disabled={!hasSizeSelected}
    >
      {/* Obere Linie - zentriert verkürzen */}
      <span className="absolute left-1/2 -translate-x-1/2 top-[10%] w-full h-[1px] bg-white transition-all duration-500 ease-out group-hover:w-[75%]"></span>
      
      {/* Text - conditional based on size selection */}
      <h3 className="relative z-10">
        {hasSizeSelected ? "Zum Warenkorp hinzufügen" : "Wählen sie eine Farbe aus"}
      </h3>
      
      {/* Untere Linie - zentriert verkürzen */}
      <span className="absolute left-1/2 -translate-x-1/2 bottom-[10%] w-full h-[1px] bg-white transition-all duration-500 ease-out group-hover:w-[75%]"></span>
    </button>
  )
}

export default AddToCart
 
