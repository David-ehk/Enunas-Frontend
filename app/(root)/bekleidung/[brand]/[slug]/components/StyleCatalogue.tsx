"use client"

import React from 'react'

interface StyleCatalogueProps {
  catalogue: string[];
}

const STYLE_COLORS: Record<string, { bg: string; text: string; border?: string }> = {
  // Die 5 Haupt-Kategorien von Enunas
  'streetwear': { bg: 'bg-[#0011A5]', text: 'text-white' },
  'experimental': { bg: 'bg-[#6C169C]', text: 'text-white' },
  'athleisure': { bg: 'bg-[#C01B1B]', text: 'text-white' },
  'culture': { bg: 'bg-[#EA9575]', text: 'text-white' },
  'cultural': { bg: 'bg-[#EA9575]', text: 'text-white' }, // Alias
  'star': { bg: 'bg-black', text: 'text-white' },
}

function StyleCatalogue({ catalogue }: StyleCatalogueProps) {
  if (!catalogue || catalogue.length === 0) return null

  return (
    <div className="flex justify-center my-4">
      <div className="flex flex-wrap gap-4 justify-center ">
        {catalogue.map((style) => {
          const styleKey = style.toLowerCase().replace(/\s+/g, '-')
          const colors = STYLE_COLORS[styleKey] || { 
            bg: 'bg-gray-400', 
            text: 'text-white' 
          }

          return (
            <span
              key={style}
              className={`
                px-4 py-1 font-ligt text-sm border border-black min-w-[140px] text-center
                ${colors.bg} ${colors.text} ${colors.border || ''}
              `}
            >
             <h3> {style} </h3>
            </span>
          )
        })}
      </div>
    </div>
  )
}

export default StyleCatalogue