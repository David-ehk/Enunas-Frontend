"use client"

import React from 'react'

interface SizeSelectorProps {
  sizes: string[];
  selectedSize?: string | null; // ← Neue Prop: Empfängt die ausgewählte Größe
  onSizeSelect?: (size: string | null) => void;
}

function SizeSelector({ sizes, selectedSize = null, onSizeSelect }: SizeSelectorProps) {
  const handleSizeClick = (size: string) => {
    const newSize = selectedSize === size ? null : size
    onSizeSelect?.(newSize)
  }

  return (
    <div className="justify-center">
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => handleSizeClick(size)}
            className={`
              min-w-[60px] px-4 py-2 border transition-all
              ${selectedSize === size
                ? 'border-black'
                : 'border-white hover:border-black/50 text-black'
              }
            `}
          >
            <h3 className="text-xl">{size}</h3>
          </button>
        ))}
      </div>
    </div>
  )
}

export default SizeSelector