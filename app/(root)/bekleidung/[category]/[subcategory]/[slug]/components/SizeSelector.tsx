"use client"

import React, { useState } from 'react'

interface SizeSelectorProps {
  sizes: string[];
  selected?: string | null;
  onSizeSelect?: (size: string) => void;
}

function SizeSelector({ sizes, selected, onSizeSelect }: SizeSelectorProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(selected || null)

  const handleSizeClick = (size: string) => {
    setSelectedSize(size)
    onSizeSelect?.(size)
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <span className="text-sm tracking-wider uppercase">
          Größe {selectedSize && `: ${selectedSize}`}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => handleSizeClick(size)}
            className={`
              px-4 py-2 border-2 transition-all
              ${selectedSize === size
                ? 'border-black bg-black text-white'
                : 'border-gray-200 hover:border-gray-400 bg-white text-black'
              }
            `}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  )
}

export default SizeSelector