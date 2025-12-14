"use client"

import React, { useState } from 'react'

interface SizeSelectorProps {
  sizes: string[];
  onSizeSelect?: (size: string | null) => void;
}

function SizeSelector({ sizes, onSizeSelect }: SizeSelectorProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)

  const handleSizeClick = (size: string) => {
    const newSize = selectedSize === size ? null : size
    setSelectedSize(newSize)
    onSizeSelect?.(newSize)
  }

  return (
    <div className="w-full">
      <h3 className="text-sm font-medium mb-3">Größe auswählen</h3>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => handleSizeClick(size)}
            className={`
              min-w-[60px] px-4 py-2 border transition-all
              ${selectedSize === size
                ? 'border-black bg-black text-white'
                : 'border-gray-300 hover:border-black text-black'
              }
            `}
          >
            {size}
          </button>
        ))}
      </div>
      
      {selectedSize && (
        <p className="text-sm text-gray-600 mt-2">
          Ausgewählt: <span className="font-semibold">{selectedSize}</span>
        </p>
      )}
    </div>
  )
}

export default SizeSelector