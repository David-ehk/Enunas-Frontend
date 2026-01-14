'use client'

import React, { useState } from 'react'
import { ChevronDown, X } from 'lucide-react'

interface FilterProps {
  onFilterChange?: (filters: FilterState) => void
}

interface FilterState {
  gender: string | null
  brands: string[]
  categories: string[]
  priceRange: [number, number] | null
  sortBy: string
}

const brands = ['Nike', 'Adidas', 'Puma', 'Gucci', 'Balenciaga', 'Off-White']
const categories = ['Jacken', 'Hosen', 'T-Shirts', 'Schuhe', 'Accessoires']
const sortOptions = [
  { value: 'newest', label: 'Neueste zuerst' },
  { value: 'price-asc', label: 'Preis aufsteigend' },
  { value: 'price-desc', label: 'Preis absteigend' },
  { value: 'popular', label: 'Beliebtheit' },
]

const Filter = ({ onFilterChange }: FilterProps) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    gender: null,
    brands: [],
    categories: [],
    priceRange: null,
    sortBy: 'newest',
  })

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown)
  }

  const updateFilter = (key: keyof FilterState, value: FilterState[keyof FilterState]) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const toggleArrayFilter = (key: 'brands' | 'categories', value: string) => {
    const currentArray = filters[key]
    const newArray = currentArray.includes(value)
      ? currentArray.filter((v) => v !== value)
      : [...currentArray, value]
    updateFilter(key, newArray)
  }

  const clearFilters = () => {
    const resetFilters: FilterState = {
      gender: null,
      brands: [],
      categories: [],
      priceRange: null,
      sortBy: 'newest',
    }
    setFilters(resetFilters)
    onFilterChange?.(resetFilters)
  }

  const hasActiveFilters = filters.gender || filters.brands.length > 0 || filters.categories.length > 0

  return (
    <div className="bg-white border-t-2 border-b-2 border-black my-2 py-4 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Gender Selection */}
        <div className="flex gap-2">
          <button
            onClick={() => updateFilter('gender', filters.gender === 'damen' ? null : 'damen')}
            className={`px-4 py-2 text-sm border transition-colors ${
              filters.gender === 'damen'
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-gray-300 hover:border-black'
            }`}
          >
            Damen
          </button>
          <button
            onClick={() => updateFilter('gender', filters.gender === 'herren' ? null : 'herren')}
            className={`px-4 py-2 text-sm border transition-colors ${
              filters.gender === 'herren'
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-gray-300 hover:border-black'
            }`}
          >
            Herren
          </button>
        </div>

        {/* Filter Options */}
        <div className="flex flex-wrap gap-2 sm:gap-4">
          {/* Brands Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('brands')}
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
            >
              <span>Marken</span>
              {filters.brands.length > 0 && (
                <span className="bg-black text-white text-xs px-1.5 py-0.5 rounded-full">
                  {filters.brands.length}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'brands' ? 'rotate-180' : ''}`} />
            </button>
            {activeDropdown === 'brands' && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-lg z-20 min-w-[200px]">
                {brands.map((brand) => (
                  <label
                    key={brand}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filters.brands.includes(brand)}
                      onChange={() => toggleArrayFilter('brands', brand)}
                      className="w-4 h-4 accent-black"
                    />
                    <span className="text-sm">{brand}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Categories Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('categories')}
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
            >
              <span>Kategorie</span>
              {filters.categories.length > 0 && (
                <span className="bg-black text-white text-xs px-1.5 py-0.5 rounded-full">
                  {filters.categories.length}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'categories' ? 'rotate-180' : ''}`} />
            </button>
            {activeDropdown === 'categories' && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-lg z-20 min-w-[200px]">
                {categories.map((category) => (
                  <label
                    key={category}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(category)}
                      onChange={() => toggleArrayFilter('categories', category)}
                      className="w-4 h-4 accent-black"
                    />
                    <span className="text-sm">{category}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('sort')}
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
            >
              <span>Sortieren</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'sort' ? 'rotate-180' : ''}`} />
            </button>
            {activeDropdown === 'sort' && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 shadow-lg z-20 min-w-[200px]">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      updateFilter('sortBy', option.value)
                      setActiveDropdown(null)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      filters.sortBy === option.value ? 'bg-gray-100 font-medium' : ''
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-4 py-2 text-sm text-gray-600 hover:text-black transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Filter zurücksetzen</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
          {filters.gender && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-sm">
              {filters.gender === 'damen' ? 'Damen' : 'Herren'}
              <button onClick={() => updateFilter('gender', null)} className="hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.brands.map((brand) => (
            <span key={brand} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-sm">
              {brand}
              <button onClick={() => toggleArrayFilter('brands', brand)} className="hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {filters.categories.map((category) => (
            <span key={category} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-sm">
              {category}
              <button onClick={() => toggleArrayFilter('categories', category)} className="hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default Filter
