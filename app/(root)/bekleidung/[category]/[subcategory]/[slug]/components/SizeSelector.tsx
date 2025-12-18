"use client"

import React, { useState } from 'react'

interface SizeSelectorProps {
  sizes: string[];
  onSizeSelect?: (size: string | null) => void;
}

const SizeSelector = ({ sizes, onSizeSelect }: SizeSelectorProps) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)

  const handleSizeClick = (size: string) => {
    const newSize = selectedSize === size ? null : size
    setSelectedSize(newSize)
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
            <h3>{size}</h3>
          </button>
        ))}
      </div>
    </div>
  )
}

export default SizeSelector