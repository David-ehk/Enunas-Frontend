'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, X } from 'lucide-react'

interface FilterBarProps {
  articleCount: number
  onGenderChange?: (genders: string[]) => void
  onSortChange?: (sort: string) => void
  onCategoryReset?: () => void
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Neueste zuerst' },
  { value: 'price-asc', label: 'Preis aufsteigend' },
  { value: 'price-desc', label: 'Preis absteigend' },
  { value: 'popular', label: 'Beliebtheit' }
]

const BRANDS = ['Nike', 'Adidas', 'Gucci', 'Balenciaga', 'Off-White', 'Moncler', 'Acne Studios', 'Maison Guava']

export default function FilterBar({
  articleCount,
  onGenderChange,
  onSortChange,
  onCategoryReset
}: FilterBarProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [activeGenders, setActiveGenders] = useState<string[]>(['damen', 'herren'])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [currentSort, setCurrentSort] = useState('newest')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown)
  }

  const handleGenderToggle = (gender: string) => {
    let newGenders: string[]

    if (activeGenders.includes(gender)) {
      newGenders = activeGenders.filter(g => g !== gender)
      if (newGenders.length === 0) {
        newGenders = [gender === 'damen' ? 'herren' : 'damen']
      }
    } else {
      newGenders = [...activeGenders, gender]
    }

    setActiveGenders(newGenders)
    onGenderChange?.(newGenders)
  }

  const handleSortSelect = (value: string) => {
    setCurrentSort(value)
    onSortChange?.(value)
    setActiveDropdown(null)
  }

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    )
  }

  const hasActiveFilters = selectedBrands.length > 0 || activeGenders.length === 1
  const currentSortLabel = SORT_OPTIONS.find(o => o.value === currentSort)?.label || 'Sortieren'

  return (
    <div ref={dropdownRef} className="border-y border-gray-100 bg-white">
      <div className="flex justify-between items-center px-6 lg:px-12 py-4">
        {/* Left: Article Count - McQueen minimal style */}
        <span
          className="text-[11px] text-enunas-gray-medium tracking-[0.05em] uppercase"
          style={{ fontFamily: 'var(--font-league-spartan)' }}
        >
          {articleCount} Artikel
        </span>

        {/* Right: Filter Controls - McQueen elegant buttons */}
        <div className="flex items-center gap-6">
          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('sort')}
              className="group flex items-center gap-2 text-[11px] text-enunas-gray-dark hover:text-enunas-black transition-colors duration-300"
              style={{ fontFamily: 'var(--font-league-spartan)' }}
            >
              <span className="tracking-[0.05em] uppercase">{currentSortLabel}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-300 ${
                  activeDropdown === 'sort' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Sort Dropdown Panel */}
            <div
              className={`
                absolute top-full right-0 mt-3 bg-white border border-gray-100 z-50 min-w-[200px]
                transition-all duration-300 origin-top
                ${activeDropdown === 'sort'
                  ? 'opacity-100 scale-100 translate-y-0'
                  : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }
              `}
            >
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortSelect(option.value)}
                  className={`
                    w-full text-left px-5 py-3.5 text-[11px] tracking-[0.03em]
                    transition-all duration-200
                    ${currentSort === option.value
                      ? 'text-enunas-black bg-enunas-off-white'
                      : 'text-enunas-gray-medium hover:text-enunas-black hover:bg-gray-50'
                    }
                  `}
                  style={{ fontFamily: 'var(--font-league-spartan)' }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-4 w-px bg-gray-200" />

          {/* Filter Button */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('filter')}
              className="group flex items-center gap-2 text-[11px] text-enunas-gray-dark hover:text-enunas-black transition-colors duration-300"
              style={{ fontFamily: 'var(--font-league-spartan)' }}
            >
              <span className="tracking-[0.05em] uppercase">Filtern</span>
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-enunas-purple" />
              )}
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-300 ${
                  activeDropdown === 'filter' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Filter Dropdown Panel */}
            <div
              className={`
                absolute top-full right-0 mt-3 bg-white border border-gray-100 z-50 min-w-[300px]
                transition-all duration-300 origin-top
                ${activeDropdown === 'filter'
                  ? 'opacity-100 scale-100 translate-y-0'
                  : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }
              `}
            >
              {/* Gender Filter Section */}
              <div className="px-5 py-5 border-b border-gray-100">
                <p
                  className="text-[10px] uppercase tracking-[0.15em] text-enunas-gray-medium mb-4"
                  style={{ fontFamily: 'var(--font-league-spartan)' }}
                >
                  Geschlecht
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleGenderToggle('damen')}
                    className={`
                      px-5 py-2.5 text-[11px] tracking-[0.05em] uppercase border
                      transition-all duration-300
                      ${activeGenders.includes('damen')
                        ? 'border-enunas-black text-enunas-black bg-white'
                        : 'border-gray-200 text-enunas-gray-medium hover:border-gray-400 hover:text-enunas-gray-dark'
                      }
                    `}
                    style={{ fontFamily: 'var(--font-league-spartan)' }}
                  >
                    Damen
                  </button>
                  <button
                    onClick={() => handleGenderToggle('herren')}
                    className={`
                      px-5 py-2.5 text-[11px] tracking-[0.05em] uppercase border
                      transition-all duration-300
                      ${activeGenders.includes('herren')
                        ? 'border-enunas-black text-enunas-black bg-white'
                        : 'border-gray-200 text-enunas-gray-medium hover:border-gray-400 hover:text-enunas-gray-dark'
                      }
                    `}
                    style={{ fontFamily: 'var(--font-league-spartan)' }}
                  >
                    Herren
                  </button>
                </div>
              </div>

              {/* Brands Filter Section */}
              <div className="px-5 py-5 border-b border-gray-100">
                <p
                  className="text-[10px] uppercase tracking-[0.15em] text-enunas-gray-medium mb-4"
                  style={{ fontFamily: 'var(--font-league-spartan)' }}
                >
                  Marken
                </p>
                <div className="flex flex-wrap gap-2">
                  {BRANDS.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => handleBrandToggle(brand)}
                      className={`
                        px-4 py-2 text-[11px] tracking-[0.02em] border
                        transition-all duration-300
                        ${selectedBrands.includes(brand)
                          ? 'border-enunas-black text-enunas-black bg-white'
                          : 'border-gray-200 text-enunas-gray-medium hover:border-gray-400 hover:text-enunas-gray-dark'
                        }
                      `}
                      style={{ fontFamily: 'var(--font-league-spartan)' }}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="px-5 py-4">
                  <button
                    onClick={() => {
                      setActiveGenders(['damen', 'herren'])
                      setSelectedBrands([])
                      onGenderChange?.(['damen', 'herren'])
                      onCategoryReset?.()
                    }}
                    className="group flex items-center gap-2 text-[11px] text-enunas-gray-medium hover:text-enunas-black transition-colors duration-300"
                    style={{ fontFamily: 'var(--font-league-spartan)' }}
                  >
                    <X className="w-3 h-3" />
                    <span className="tracking-[0.03em]">Filter zurücksetzen</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
