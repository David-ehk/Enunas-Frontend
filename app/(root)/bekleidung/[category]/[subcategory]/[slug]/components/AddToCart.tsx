"use client"

import React from 'react'
import { useToast } from '@/app/context/ToastContext'

interface AddToCartProps {
  selectedSize?: string | null;
  onCartOpen: () => void; // ← Neue Prop
}

function AddToCart({ selectedSize = null, onCartOpen }: AddToCartProps) {
  const hasSizeSelected = selectedSize !== null
  const { showToast } = useToast()

  const handleAddToCart = () => {
    if (!hasSizeSelected) {
      showToast('Bitte wählen Sie eine Größe aus', 'error')
      return
    }
    
    // Add to cart logic hier
    showToast('Zum Warenkorb hinzugefügt')
    
    // Sidebar öffnen
    onCartOpen()
  }

  return (
    <button 
      className="relative w-full py-4 px-6 tracking-widest text-white bg-[#370E4D] overflow-hidden group transition-colors duration-600 disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={handleAddToCart}
      disabled={!hasSizeSelected}
    >
      <span className="absolute left-1/2 -translate-x-1/2 top-[10%] w-full h-[1px] bg-white transition-all duration-500 ease-out group-hover:w-[75%]"></span>
      
      <h3 className="relative z-10 text-base sm:text-lg">
        {hasSizeSelected ? "Zum Warenkorb hinzufügen" : "Wählen Sie eine Größe aus"}
      </h3>
      
      <span className="absolute left-1/2 -translate-x-1/2 bottom-[10%] w-full h-[1px] bg-white transition-all duration-500 ease-out group-hover:w-[75%]"></span>
    </button>
  )
}

export default AddToCart