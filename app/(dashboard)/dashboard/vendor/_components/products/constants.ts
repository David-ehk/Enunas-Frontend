// Shared constants and wizard types for the vendor product-management screens — split out of a
// single 2,420-line Products.tsx (Sep 2026). See ../Products.tsx for how the pieces fit together.

import type { PriceInputMode } from '@/types/api'

export const CATALOGUE_OPTS = [
  { id: 'STREETWEAR',   label: 'Streetwear' },
  { id: 'CULTURAL',     label: 'Cultural' },
  { id: 'EXPERIMENTAL', label: 'Experimental' },
  { id: 'ATHLEISURE',   label: 'Athleisure' },
  { id: 'STAR',         label: 'Star' },
]

export const GENDERS = [
  { id: 'MALE',   label: 'Herren' },
  { id: 'FEMALE', label: 'Damen' },
  { id: 'UNISEX', label: 'Unisex' },
]

// Full backend ProductType enum (23 values) — the dropdown submits the value verbatim, so any
// value not in the backend enum hard-fails product creation. Order/grouping mirrors the backend
// source: tops, bottoms, dress, outerwear, footwear, accessories, other.
export const PRODUCT_TYPES = [
  'T_SHIRT', 'LONGSLEEVE', 'SHIRT', 'HOODIE', 'ZIP_HOODIE', 'SWEATER',
  'JEANS', 'CARGO_PANTS', 'JOGGER', 'SHORTS', 'PANTS', 'SKIRT',
  'DRESS',
  'JACKET', 'COAT',
  'SNEAKERS', 'BOOTS',
  'CAP', 'BEANIE', 'BAG', 'BELT', 'JEWELRY',
  'OTHER',
]

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']

export const COLORS = [
  'BLACK', 'WHITE', 'GREY', 'BEIGE', 'BROWN',
  'RED', 'PINK', 'ORANGE', 'YELLOW', 'GREEN', 'BLUE', 'PURPLE',
  'MULTICOLOR', 'METALLIC', 'OTHER',
] as const

export const COLOR_LABELS: Record<string, string> = {
  BLACK: 'Schwarz', WHITE: 'Weiß', GREY: 'Grau', BEIGE: 'Beige', BROWN: 'Braun',
  RED: 'Rot', PINK: 'Pink', ORANGE: 'Orange', YELLOW: 'Gelb', GREEN: 'Grün',
  BLUE: 'Blau', PURPLE: 'Lila', MULTICOLOR: 'Mehrfarbig', METALLIC: 'Metallic', OTHER: 'Sonstige',
}

export const COLOR_SWATCHES: Record<string, string> = {
  BLACK: '#0A0A0A', WHITE: '#F0F0EB', GREY: '#9B9B9B', BEIGE: '#D4C5A9', BROWN: '#6B4226',
  RED: '#C41E3A', PINK: '#FF69B4', ORANGE: '#FF8C00', YELLOW: '#FFD700', GREEN: '#228B22',
  BLUE: '#1E3A8A', PURPLE: '#370E4D', MULTICOLOR: '#C0C0BC', METALLIC: '#B8B8B8', OTHER: '#E8E8E8',
}

export const STATUS_FILTERS = [
  { id: 'ALL',         label: 'Alle' },
  { id: 'PENDING',     label: 'Ausstehend' },
  { id: 'APPROVED',    label: 'Genehmigt' },
  { id: 'REJECTED',    label: 'Abgelehnt' },
  { id: 'DEACTIVATED', label: 'Deaktiviert' },
]

// ─── Shared input styles ─────────────────────────────────────────────────────
export const INPUT = 'w-full text-[13px] border border-[#E8E8E8] bg-white rounded-none px-3.5 py-2.5 focus:outline-none focus:border-[#370E4D]/50 focus:ring-2 focus:ring-[#370E4D]/8 transition-all duration-200 placeholder:text-[#C0C0BC]'
export const LABEL = 'block text-[10px] uppercase tracking-[0.12em] text-[#6B6B6B] font-medium mb-1.5'
export const BTN_PRIMARY = 'flex items-center gap-2 h-9 px-5 rounded-none text-[12px] font-medium text-white transition-all duration-200 disabled:opacity-40'
export const BTN_GHOST = 'flex items-center gap-2 h-9 px-4 rounded-none text-[12px] text-[#6B6B6B] border border-[#E8E8E8] hover:bg-[#F5F5F0] transition-all duration-200'

// ─── Wizard step types ────────────────────────────────────────────────────────
export interface WizardData {
  name: string
  description: string
  inspirationStory: string
  category: string
  gender: string
  productType: string
  material: string
  originCountry: string
  careInstructions: string
  collectionName: string
  releaseDate: string
  returnPeriodDays: number
  catalogueCategory: string[]
}

export interface VariantRow {
  _key?: string
  color: string
  size: string
  stockQuantity: number
  weightGrams: number
}

export const EMPTY_WIZARD: WizardData = {
  name: '',
  description: '',
  inspirationStory: '',
  category: 'CLOTHING',
  gender: 'UNISEX',
  productType: 'T_SHIRT',
  material: '',
  originCountry: '',
  careInstructions: '',
  collectionName: '',
  releaseDate: '',
  returnPeriodDays: 14,
  catalogueCategory: [],
}

// The Look step is optional — it can be skipped straight through to the review.
export type WizardStep = 1 | 2 | 3 | 4 | 5

// ─── Listings / pricing (price per region) ─────────────────────────────────────
// Shared by ListingsSection (existing products) and CreateWizard's own price step.
export const LISTING_REGIONS = [
  { id: 'DE', label: 'Deutschland' },
  { id: 'EU', label: 'Europa' },
  { id: 'GLOBAL', label: 'Global' },
  { id: 'US', label: 'USA' },
]

// Matches backend HALF_UP, 2 dp rounding. toFixed(4) intermediate step
// avoids float drift (e.g. 10.50 × 0.19 = 1.9949… → "199.5000" → 200 → 2.00 ✓)
export function round2(v: number): number {
  return Math.round(Number((v * 100).toFixed(4))) / 100
}

export const PRICE_MODE_CONFIG: Record<PriceInputMode, {
  priceLabel: string
  priceHint: string
  discountLabel: string
}> = {
  GROSS: {
    priceLabel: 'Preis (brutto) – inkl. 19 % MwSt.',
    priceHint: 'Der Preis, den der Endkunde sieht (z. B. 89,95 €). Die MwSt. wird automatisch abgezogen.',
    discountLabel: 'Sale-Preis (brutto) – optional',
  },
  NET: {
    priceLabel: 'Preis (netto) – exkl. MwSt.',
    priceHint: 'Nettopreis ohne dt. MwSt. Der Endkundenpreis wird automatisch +19 % berechnet.',
    discountLabel: 'Sale-Preis (netto) – optional',
  },
}
