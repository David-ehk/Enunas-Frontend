'use client'

import { useState, useEffect, Fragment } from 'react'
import { brandApi } from '@/lib/api/modules/brandApi'
import { FetchError } from '@/lib/api'
import { errorRemedies, type ErrorRemedy } from '@/lib/api/errorCopy'
import type { CreateProductDto, CreateListingDto, UpdateListingDto } from '@/lib/api/modules/brandApi'
import type { AdminApiProduct, AdminApiVariant, ApiListing, ApiProductColor, ApiProductImage, PriceInputMode } from '@/types/api'
import {
  StatusBadge, SectionCard, EmptyState, Loader,
  TH, TD, TableRow, FilterBar, SearchInput, fmt, fmtEur,
} from '../../admin/_components/shared'
import { VPageHeader } from './vshared'
import ImageDropzone from '@/components/ui/ImageDropzone'
import {
  Plus, Trash2, ChevronLeft, Check, X, Edit2,
  Package, ChevronDown, ChevronUp, ImagePlus, Star,
} from 'lucide-react'
import { isProductLive } from '@/lib/product'

// ─── Constants ───────────────────────────────────────────────────────────────
const CATALOGUE_OPTS = [
  { id: 'STREETWEAR',   label: 'Streetwear' },
  { id: 'CULTURAL',     label: 'Cultural' },
  { id: 'EXPERIMENTAL', label: 'Experimental' },
  { id: 'ATHLEISURE',   label: 'Athleisure' },
  { id: 'STAR',         label: 'Star' },
]

const GENDERS = [
  { id: 'MALE',   label: 'Herren' },
  { id: 'FEMALE', label: 'Damen' },
  { id: 'UNISEX', label: 'Unisex' },
]

const PRODUCT_TYPES = [
  'T_SHIRT', 'HOODIE', 'JACKET', 'PANTS', 'SHORTS',
  'DRESS', 'SHIRT', 'COAT', 'SWEATER', 'SKIRT', 'OTHER',
]

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']

const COLORS = [
  'BLACK', 'WHITE', 'GREY', 'BEIGE', 'BROWN',
  'RED', 'PINK', 'ORANGE', 'YELLOW', 'GREEN', 'BLUE', 'PURPLE',
  'MULTICOLOR', 'METALLIC', 'OTHER',
] as const

const COLOR_LABELS: Record<string, string> = {
  BLACK: 'Schwarz', WHITE: 'Weiß', GREY: 'Grau', BEIGE: 'Beige', BROWN: 'Braun',
  RED: 'Rot', PINK: 'Pink', ORANGE: 'Orange', YELLOW: 'Gelb', GREEN: 'Grün',
  BLUE: 'Blau', PURPLE: 'Lila', MULTICOLOR: 'Mehrfarbig', METALLIC: 'Metallic', OTHER: 'Sonstige',
}

const COLOR_SWATCHES: Record<string, string> = {
  BLACK: '#0A0A0A', WHITE: '#F0F0EB', GREY: '#9B9B9B', BEIGE: '#D4C5A9', BROWN: '#6B4226',
  RED: '#C41E3A', PINK: '#FF69B4', ORANGE: '#FF8C00', YELLOW: '#FFD700', GREEN: '#228B22',
  BLUE: '#1E3A8A', PURPLE: '#370E4D', MULTICOLOR: '#C0C0BC', METALLIC: '#B8B8B8', OTHER: '#E8E8E8',
}

const STATUS_FILTERS = [
  { id: 'ALL',         label: 'Alle' },
  { id: 'PENDING',     label: 'Ausstehend' },
  { id: 'APPROVED',    label: 'Genehmigt' },
  { id: 'REJECTED',    label: 'Abgelehnt' },
  { id: 'DEACTIVATED', label: 'Deaktiviert' },
]

// ─── Shared input styles ─────────────────────────────────────────────────────
const INPUT = 'w-full text-[13px] border border-[#E8E8E8] bg-white rounded-none px-3.5 py-2.5 focus:outline-none focus:border-[#370E4D]/50 focus:ring-2 focus:ring-[#370E4D]/8 transition-all duration-200 placeholder:text-[#C0C0BC]'
const LABEL = 'block text-[10px] uppercase tracking-[0.12em] text-[#6B6B6B] font-medium mb-1.5'
const BTN_PRIMARY = 'flex items-center gap-2 h-9 px-5 rounded-none text-[12px] font-medium text-white transition-all duration-200 disabled:opacity-40'
const BTN_GHOST = 'flex items-center gap-2 h-9 px-4 rounded-none text-[12px] text-[#6B6B6B] border border-[#E8E8E8] hover:bg-[#F5F5F0] transition-all duration-200'

// ─── Wizard step types ────────────────────────────────────────────────────────
interface WizardData {
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

interface VariantRow {
  _key?: string
  color: string
  size: string
  stockQuantity: number
  weightGrams: number
}

const EMPTY_WIZARD: WizardData = {
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
type WizardStep = 1 | 2 | 3 | 4 | 5

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: WizardStep }) {
  const steps = [
    { n: 1, label: 'Grunddaten' },
    { n: 2, label: 'Varianten' },
    { n: 3, label: 'Preis' },
    { n: 4, label: 'Look' },
    { n: 5, label: 'Überprüfung' },
  ]
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map(({ n, label }, i) => (
        <div key={n} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all duration-200"
              style={{
                background: step >= n ? '#370E4D' : '#F0F0EB',
                color: step >= n ? '#fff' : '#9B9B9B',
                fontFamily: 'var(--font-league-spartan)',
              }}
            >
              {step > n ? <Check className="w-3.5 h-3.5" /> : n}
            </div>
            <span
              className="text-[11px] font-medium"
              style={{
                fontFamily: 'var(--font-league-spartan)',
                color: step >= n ? '#0A0A0A' : '#9B9B9B',
              }}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="w-8 h-px mx-2.5" style={{ background: step > n ? '#370E4D' : '#E8E8E8' }} />
          )}
        </div>
      ))}
    </div>
  )
}

function VariantCard({
  variant, index, onChange, onRemove,
}: {
  variant: VariantRow
  index: number
  onChange: (field: keyof VariantRow, value: string | number) => void
  onRemove: () => void
}) {
  return (
    <div className="flex items-center gap-3 p-3.5 bg-[#F5F5F0] rounded-none border border-[#E8E8E8]">
      <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-semibold"
        style={{ background: '#370E4D', color: '#fff', fontFamily: 'var(--font-league-spartan)' }}>
        {index + 1}
      </div>
      <div className="flex-1 grid grid-cols-4 gap-2">
        <div>
          <p className="text-[9px] uppercase tracking-[0.1em] text-[#9B9B9B] mb-1" style={{ fontFamily: 'var(--font-league-spartan)' }}>Farbe</p>
          <select
            value={variant.color}
            onChange={e => onChange('color', e.target.value)}
            className="w-full text-[12px] border border-[#E8E8E8] bg-white rounded-none px-2 py-1.5 focus:outline-none focus:border-[#370E4D]/50"
            style={{ fontFamily: 'var(--font-league-spartan)' }}
          >
            {COLORS.map(c => <option key={c} value={c}>{COLOR_LABELS[c]}</option>)}
          </select>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-[0.1em] text-[#9B9B9B] mb-1" style={{ fontFamily: 'var(--font-league-spartan)' }}>Größe</p>
          <select
            value={variant.size}
            onChange={e => onChange('size', e.target.value)}
            className="w-full text-[12px] border border-[#E8E8E8] bg-white rounded-none px-2 py-1.5 focus:outline-none focus:border-[#370E4D]/50"
            style={{ fontFamily: 'var(--font-league-spartan)' }}
          >
            {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-[0.1em] text-[#9B9B9B] mb-1" style={{ fontFamily: 'var(--font-league-spartan)' }}>Bestand</p>
          <input
            type="number"
            min={0}
            value={variant.stockQuantity}
            onChange={e => onChange('stockQuantity', Number(e.target.value))}
            className="w-full text-[12px] border border-[#E8E8E8] bg-white rounded-none px-2.5 py-1.5 focus:outline-none focus:border-[#370E4D]/50"
            style={{ fontFamily: 'var(--font-league-spartan)' }}
          />
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-[0.1em] text-[#9B9B9B] mb-1" style={{ fontFamily: 'var(--font-league-spartan)' }}>Gewicht (g)</p>
          <input
            type="number"
            min={0}
            value={variant.weightGrams}
            onChange={e => onChange('weightGrams', Number(e.target.value))}
            className="w-full text-[12px] border border-[#E8E8E8] bg-white rounded-none px-2.5 py-1.5 focus:outline-none focus:border-[#370E4D]/50"
            style={{ fontFamily: 'var(--font-league-spartan)' }}
          />
        </div>
      </div>
      <button
        onClick={onRemove}
        className="w-7 h-7 rounded-none flex items-center justify-center text-[#9B9B9B] hover:text-[#8B1E3F] hover:bg-rose-50 transition-all duration-150 shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// ─── Variant management panel (for existing products) ─────────────────────────
function VariantsPanel({
  product,
  onBack,
}: {
  product: AdminApiProduct
  onBack: () => void
}) {
  const [variants, setVariants]     = useState<AdminApiVariant[]>([])
  const [loading, setLoading]       = useState(true)
  const [batchColor, setBatchColor] = useState<string>('BLACK')
  const [batchSizes, setBatchSizes] = useState<string[]>([])
  const [batchStock, setBatchStock] = useState(1)
  const [batchWeight, setBatchWeight] = useState(250)
  const [adding, setAdding]         = useState(false)
  const [saving, setSaving]         = useState<string | null>(null)
  const [err, setErr]               = useState<string | null>(null)

  useEffect(() => {
    brandApi.variants.list(product.id)
      .then(setVariants)
      .catch(() => setVariants([]))
      .finally(() => setLoading(false))
  }, [product.id])

  async function addVariant() {
    if (batchSizes.length === 0) { setErr('Mind. eine Größe wählen.'); return }
    setAdding(true); setErr(null)
    try {
      for (const size of batchSizes) {
        const created = await brandApi.variants.create(product.id, {
          color: batchColor, colorFamily: batchColor, size, stockQuantity: batchStock, weightGrams: batchWeight,
        })
        setVariants(prev => [...prev, created])
      }
      setBatchSizes([])
    } catch { setErr('Variante konnte nicht hinzugefügt werden.') }
    finally { setAdding(false) }
  }

  async function updateStock(variantId: string, stockQuantity: number) {
    setSaving(variantId)
    try {
      const updated = await brandApi.variants.update(product.id, variantId, { stockQuantity })
      setVariants(prev => prev.map(v => v.id === variantId ? updated : v))
    } catch { /* silent */ }
    finally { setSaving(null) }
  }

  async function removeVariant(variantId: string) {
    try {
      await brandApi.variants.delete(product.id, variantId)
      setVariants(prev => prev.filter(v => v.id !== variantId))
    } catch { /* silent */ }
  }

  const totalStock = variants.reduce((s, v) => s + (v.stockQuantity ?? 0), 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-[12px] text-[#6B6B6B] hover:text-[#370E4D] transition-colors" style={{ fontFamily: 'var(--font-league-spartan)' }}>
          <ChevronLeft className="w-3.5 h-3.5" /> Zurück
        </button>
        <div className="w-px h-4 bg-[#E8E8E8]" />
        <div className="flex items-center gap-2">
          {product.images?.[0] && (
            <img src={product.images[0]} alt="" className="w-8 h-10 object-cover rounded bg-[#F5F5F0]" />
          )}
          <div>
            <p className="text-[13px] font-semibold text-[#0A0A0A]" style={{ fontFamily: 'var(--font-league-spartan)' }}>{product.name}</p>
            <p className="text-[11px] text-[#6B6B6B]">{variants.length} Varianten · {totalStock} Stk. gesamt</p>
          </div>
        </div>
      </div>

      <SectionCard title="Varianten">
        {loading ? <Loader /> : (
          <div className="p-5 space-y-3">
            {variants.length === 0 && <EmptyState message="Noch keine Varianten hinzugefügt." />}
            {variants.map(v => (
              <div key={v.id} className="flex items-center gap-3 p-3 bg-[#FAFAF8] rounded-none border border-[#E8E8E8]">
                <div className="flex-1 grid grid-cols-4 gap-3 text-[12px]">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.1em] text-[#9B9B9B] mb-0.5" style={{ fontFamily: 'var(--font-league-spartan)' }}>Farbe</p>
                    <p className="font-medium text-[#2D2D2D] flex items-center gap-1.5" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                      {v.color && COLOR_SWATCHES[v.color] && (
                        <span className="w-3 h-3 shrink-0 border border-black/10" style={{ background: COLOR_SWATCHES[v.color] }} />
                      )}
                      {v.color ? (COLOR_LABELS[v.color] ?? v.color) : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.1em] text-[#9B9B9B] mb-0.5" style={{ fontFamily: 'var(--font-league-spartan)' }}>Größe</p>
                    <p className="font-medium text-[#2D2D2D]" style={{ fontFamily: 'var(--font-league-spartan)' }}>{v.size ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.1em] text-[#9B9B9B] mb-0.5" style={{ fontFamily: 'var(--font-league-spartan)' }}>Bestand</p>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateStock(v.id, Math.max(0, (v.stockQuantity ?? 0) - 1))}
                        className="w-5 h-5 rounded border border-[#E8E8E8] flex items-center justify-center text-[#6B6B6B] hover:border-[#370E4D] hover:text-[#370E4D] transition-all"
                      >—</button>
                      <span className="text-[13px] font-semibold text-[#0A0A0A] tabular-nums w-6 text-center"
                        style={{ fontFamily: 'var(--font-league-spartan)', color: (v.stockQuantity ?? 0) === 0 ? '#8B1E3F' : (v.stockQuantity ?? 0) < 5 ? '#7A5C1E' : '#0A0A0A' }}>
                        {saving === v.id ? '…' : v.stockQuantity ?? 0}
                      </span>
                      <button
                        onClick={() => updateStock(v.id, (v.stockQuantity ?? 0) + 1)}
                        className="w-5 h-5 rounded border border-[#E8E8E8] flex items-center justify-center text-[#6B6B6B] hover:border-[#370E4D] hover:text-[#370E4D] transition-all"
                      >+</button>
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.1em] text-[#9B9B9B] mb-0.5" style={{ fontFamily: 'var(--font-league-spartan)' }}>SKU</p>
                    <p className="font-mono text-[11px] text-[#6B6B6B]">{v.sku ?? '—'}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeVariant(v.id)}
                  className="w-7 h-7 rounded-none flex items-center justify-center text-[#C0C0BC] hover:text-[#8B1E3F] hover:bg-rose-50 transition-all duration-150 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Batch add */}
            <div className="pt-3 border-t border-[#F0F0EB] space-y-3">
              <p className="text-[10px] uppercase tracking-[0.12em] text-[#9B9B9B] font-medium"
                style={{ fontFamily: 'var(--font-league-spartan)' }}>
                Varianten hinzufügen
              </p>

              {/* Color */}
              <div className="flex flex-wrap gap-1.5">
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setBatchColor(c)}
                    className="flex items-center gap-1.5 px-2 py-1 border text-[11px] font-medium transition-all duration-150"
                    style={{
                      fontFamily: 'var(--font-league-spartan)',
                      background:  batchColor === c ? '#370E4D' : '#fff',
                      color:       batchColor === c ? '#fff'    : '#6B6B6B',
                      borderColor: batchColor === c ? '#370E4D' : '#E8E8E8',
                    }}>
                    <span className="w-2.5 h-2.5 shrink-0 border border-black/10"
                      style={{ background: COLOR_SWATCHES[c] }} />
                    {COLOR_LABELS[c]}
                  </button>
                ))}
              </div>

              {/* Sizes */}
              <div className="flex flex-wrap gap-1.5">
                {SIZES.map(s => {
                  const on = batchSizes.includes(s)
                  return (
                    <button key={s} type="button"
                      onClick={() => setBatchSizes(prev => on ? prev.filter(x => x !== s) : [...prev, s])}
                      className="w-11 py-1.5 border text-[12px] font-semibold transition-all duration-150"
                      style={{
                        fontFamily: 'var(--font-league-spartan)',
                        background:  on ? '#370E4D' : '#fff',
                        color:       on ? '#fff'    : '#6B6B6B',
                        borderColor: on ? '#370E4D' : '#E8E8E8',
                      }}>
                      {s}
                    </button>
                  )
                })}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.1em] text-[#9B9B9B] mb-1" style={{ fontFamily: 'var(--font-league-spartan)' }}>Bestand je Größe</p>
                  <input type="number" min={0} value={batchStock}
                    onChange={e => setBatchStock(Number(e.target.value))}
                    className="w-full text-[12px] border border-[#E8E8E8] bg-white rounded-none px-2.5 py-1.5 focus:outline-none focus:border-[#370E4D]/50"
                    style={{ fontFamily: 'var(--font-league-spartan)' }}
                  />
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.1em] text-[#9B9B9B] mb-1" style={{ fontFamily: 'var(--font-league-spartan)' }}>Gewicht (g)</p>
                  <input type="number" min={0} value={batchWeight}
                    onChange={e => setBatchWeight(Number(e.target.value))}
                    className="w-full text-[12px] border border-[#E8E8E8] bg-white rounded-none px-2.5 py-1.5 focus:outline-none focus:border-[#370E4D]/50"
                    style={{ fontFamily: 'var(--font-league-spartan)' }}
                  />
                </div>
              </div>

              {err && <p className="text-[11px] text-[#8B1E3F]" style={{ fontFamily: 'var(--font-league-spartan)' }}>{err}</p>}

              <button
                onClick={addVariant}
                disabled={adding || batchSizes.length === 0}
                className={BTN_PRIMARY + ' disabled:opacity-40 disabled:cursor-not-allowed'}
                style={{ background: '#370E4D', fontFamily: 'var(--font-league-spartan)' }}
              >
                <Plus className="w-3.5 h-3.5" />
                {adding ? 'Hinzufügen…' : batchSizes.length > 0
                  ? `${batchSizes.length} Variante${batchSizes.length > 1 ? 'n' : ''} hinzufügen (${COLOR_LABELS[batchColor]})`
                  : 'Größen wählen'}
              </button>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  )
}

// ─── Images section ────────────────────────────────────────────────────────────
// An image is either tagged to one colourway or left "shared" (productColorId null — shown for
// every colourway). The PDP gallery for a swatch = its own images ∪ all shared images. Images are
// managed in colour groups: "Alle Farben (geteilt)" plus one per colourway.
const SHARED_GROUP_ID = null as number | null

interface ColourGroup {
  id: number | null   // null = the shared group
  label: string
  hex: string | null
}

function colourGroupsFor(product: AdminApiProduct): ColourGroup[] {
  const shared: ColourGroup = { id: SHARED_GROUP_ID, label: 'Alle Farben (geteilt)', hex: null }

  // Prefer the backend's colors[] (real ProductColor ids); fall back to distinct variant colours.
  const fromColors: ApiProductColor[] = product.colors ?? []
  const source = fromColors.length > 0
    ? fromColors.map(c => ({ id: c.id, key: c.colorFamily ?? c.color, name: c.color }))
    : Array.from(
        new Map(
          (product.variants ?? [])
            .filter(v => v.colorId != null)
            .map(v => [v.colorId as number, { id: v.colorId as number, key: v.colorFamily ?? v.color ?? '', name: v.color ?? '' }]),
        ).values(),
      )

  return [
    shared,
    ...source.map(c => ({
      id: c.id,
      label: COLOR_LABELS[c.key] ?? c.name ?? 'Farbe',
      hex: COLOR_SWATCHES[c.key] ?? '#E8E8E8',
    })),
  ]
}

function ImagesSection({
  product,
  onImagesChanged,
}: {
  product: AdminApiProduct
  /** Keeps the product list's row thumbnail in sync — it used to show the empty placeholder
   *  until the brand hit "Aktualisieren", which read as a failed upload. */
  onImagesChanged?: (imageUrls: string[]) => void
}) {
  const [images, setImages]     = useState<ApiProductImage[]>([])
  const [loading, setLoading]   = useState(true)
  const [uploadErr, setUploadErr] = useState<string | null>(null)
  const [busyId, setBusyId]     = useState<string | null>(null)

  const groups = colourGroupsFor(product)
  const hasColourways = groups.length > 1

  useEffect(() => {
    brandApi.images.list(product.id)
      .then(setImages)
      .catch(() => setImages([]))
      .finally(() => setLoading(false))
  }, [product.id])

  function publish(next: ApiProductImage[]) {
    setImages(next)
    onImagesChanged?.(next.map(i => i.imageUrl))
  }

  // Canonical re-fetch after a mutation — the backend owns the one-primary-per-group rule, so
  // reconciling it client-side would only drift.
  async function refresh() {
    try {
      publish(await brandApi.images.list(product.id))
    } catch { /* keep the optimistic state */ }
  }

  function uploadFor(colourId: number | null) {
    return async (key: string) => {
      setUploadErr(null)
      try {
        await brandApi.images.add(product.id, key, colourId != null ? { productColorId: colourId } : {})
        await refresh()
      } catch {
        setUploadErr('Bild konnte nicht gespeichert werden.')
      }
    }
  }

  async function deleteImage(imageId: string) {
    setBusyId(imageId)
    try {
      await brandApi.images.delete(product.id, imageId)
      publish(images.filter(i => i.id !== imageId))
    } catch { /* silent */ }
    finally { setBusyId(null) }
  }

  async function setPrimary(imageId: string) {
    setBusyId(imageId)
    try {
      await brandApi.images.update(product.id, imageId, { primary: true })
      await refresh()
    } catch { /* silent */ }
    finally { setBusyId(null) }
  }

  async function reassignColour(imageId: string, colourId: number | null) {
    setBusyId(imageId)
    try {
      await brandApi.images.update(
        product.id, imageId,
        colourId != null ? { productColorId: colourId } : { unassignColor: true },
      )
      await refresh()
    } catch { /* silent */ }
    finally { setBusyId(null) }
  }

  const sharedCount = images.filter(i => (i.productColorId ?? null) === SHARED_GROUP_ID).length
  const showNudge = hasColourways && groups.length > 2 && sharedCount > 0

  return (
    <SectionCard title="Produktbilder">
      <div className="p-6 space-y-6">
        {loading ? <Loader /> : (
          <>
            {showNudge && (
              <p className="text-[11px] text-[#7A5C1E] bg-[#7A5C1E]/8 border border-[#7A5C1E]/20 px-3 py-2"
                style={{ fontFamily: 'var(--font-league-spartan)' }}>
                Tipp: Weise Bilder einer Farbe zu, damit Kund:innen pro Farbvariante die passenden Fotos sehen.
              </p>
            )}

            {groups.map(group => {
              const groupImages = images.filter(i => (i.productColorId ?? null) === group.id)
              const isShared = group.id === SHARED_GROUP_ID
              return (
                <div key={group.id ?? 'shared'} className="space-y-3">
                  <div className="flex items-center gap-2">
                    {group.hex
                      ? <span className="w-3.5 h-3.5 shrink-0 border border-black/10" style={{ background: group.hex }} />
                      : <span className="w-3.5 h-3.5 shrink-0 border border-dashed border-[#C0C0BC]" />}
                    <p className="text-[11px] uppercase tracking-[0.12em] text-[#2D2D2D] font-medium"
                      style={{ fontFamily: 'var(--font-league-spartan)' }}>
                      {group.label}
                    </p>
                    <span className="text-[10px] text-[#C0C0BC]">{groupImages.length}</span>
                  </div>

                  {isShared && hasColourways && (
                    <p className="text-[10px] text-[#9B9B9B]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                      Diese Bilder werden für alle Farbvarianten angezeigt.
                    </p>
                  )}

                  {groupImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-3">
                      {groupImages.map(img => (
                        <div key={img.id} className="space-y-1.5">
                          <div className="relative group rounded-none overflow-hidden aspect-[3/4] bg-[#F5F5F0]">
                            <img src={img.imageUrl} alt={img.altText ?? ''} className="w-full h-full object-cover" />
                            {img.primary && (
                              <span className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-[#370E4D] text-white text-[9px] px-1.5 py-0.5 uppercase tracking-[0.08em]"
                                style={{ fontFamily: 'var(--font-league-spartan)' }}>
                                <Star className="w-2.5 h-2.5 fill-current" /> Titel
                              </span>
                            )}
                            <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                              {!img.primary && (
                                <button
                                  onClick={() => setPrimary(img.id)}
                                  disabled={busyId === img.id}
                                  title="Als Titelbild setzen"
                                  className="w-7 h-7 rounded-none bg-black/60 flex items-center justify-center text-white hover:bg-[#370E4D] transition-colors"
                                >
                                  <Star className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteImage(img.id)}
                                disabled={busyId === img.id}
                                title="Bild löschen"
                                className="w-7 h-7 rounded-none bg-black/60 flex items-center justify-center text-white hover:bg-rose-600 transition-colors"
                              >
                                {busyId === img.id ? <span className="text-[10px]">…</span> : <Trash2 className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                          {hasColourways && (
                            <select
                              value={img.productColorId ?? ''}
                              onChange={e => reassignColour(img.id, e.target.value === '' ? null : Number(e.target.value))}
                              disabled={busyId === img.id}
                              className="w-full text-[10px] border border-[#E8E8E8] bg-white rounded-none px-1.5 py-1 focus:outline-none focus:border-[#370E4D]/50"
                              style={{ fontFamily: 'var(--font-league-spartan)' }}
                            >
                              {groups.map(g => (
                                <option key={g.id ?? 'shared'} value={g.id ?? ''}>{g.label}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="max-w-xs">
                    <ImageDropzone
                      label={groupImages.length > 0 ? 'Weiteres Bild hinzufügen' : 'Bild hinzufügen'}
                      hint="JPG, PNG, WebP · max. 10 MB"
                      maxSizeMB={10}
                      aspect="aspect-[3/4]"
                      getUploadUrl={(contentType, contentLength) => brandApi.images.getUploadUrl(product.id, contentType, contentLength)}
                      onUploaded={uploadFor(group.id)}
                    />
                  </div>
                </div>
              )
            })}

            {uploadErr && <p className="text-[11px] text-[#8B1E3F]" style={{ fontFamily: 'var(--font-league-spartan)' }}>{uploadErr}</p>}
          </>
        )}
      </div>
    </SectionCard>
  )
}

// ─── Complete the look ────────────────────────────────────────────────────────
// The PDP already renders a curated "Vervollständige den Look" row and prefers it over its
// category-query fallback (app/(root)/bekleidung/[brand]/[slug]/page.tsx). Until now nothing in
// the portal could actually curate one — the create wizard hardcoded the flag off and sent an
// empty id list — so every product fell back to "same category" suggestions.
const MAX_LOOK_PRODUCTS = 4

// /products/my returns `images` as ProductImageResponseDto objects, while locally-updated state
// (see ImagesSection.onImagesChanged) holds plain URL strings. Tolerate both.
function coverImageUrl(p: AdminApiProduct): string | null {
  const first = p.images?.[0]
  if (!first) return null
  return typeof first === 'string' ? first : (first as { imageUrl?: string }).imageUrl ?? null
}

// Toggling an already-selected id always removes it; adding past the cap is a no-op rather
// than silently evicting an earlier pick.
function toggleLookSelection(prev: string[], id: string): string[] {
  if (prev.includes(id)) return prev.filter(x => x !== id)
  if (prev.length >= MAX_LOOK_PRODUCTS) return prev
  return [...prev, id]
}

// Shared by the edit panel and the create wizard's Look step, so a look is curated the same way
// wherever you start from. `excludeProductId` is omitted during creation — the product does not
// exist yet, so there is nothing to filter out of its own candidate list.
function LookPicker({
  excludeProductId,
  enabled,
  onEnabledChange,
  selected,
  onToggle,
  onCandidatesLoaded,
}: {
  excludeProductId?: string
  enabled: boolean
  onEnabledChange: (v: boolean) => void
  selected: string[]
  onToggle: (id: string) => void
  /** id -> name for everything offered, so a caller holding only ids can label them. */
  onCandidatesLoaded?: (names: Record<string, string>) => void
}) {
  const [candidates, setCandidates] = useState<AdminApiProduct[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')

  useEffect(() => {
    let cancelled = false
    brandApi.products.getMy()
      .then(all => {
        if (cancelled) return
        const usable = all.filter(p => p.id !== excludeProductId)
        setCandidates(usable)
        onCandidatesLoaded?.(Object.fromEntries(usable.map(p => [p.id, p.name])))
      })
      .catch(() => { if (!cancelled) setCandidates([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
    // onCandidatesLoaded is a setter from the caller and is deliberately not a dependency —
    // including it would refetch on every parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [excludeProductId])

  const visible = candidates.filter(c =>
    !search.trim() || c.name.toLowerCase().includes(search.trim().toLowerCase()),
  )

  return (
    <>
      <p className="text-[12px] text-[#6B6B6B] leading-relaxed" style={{ fontFamily: 'var(--font-league-spartan)' }}>
        Wähle bis zu {MAX_LOOK_PRODUCTS} Produkte, die zu diesem Produkt passen. Sie erscheinen auf der
        Produktseite unter „Vervollständige den Look“. Ohne Auswahl zeigt die Seite automatisch
        Produkte aus derselben Kategorie.
      </p>

      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={enabled}
          onChange={e => onEnabledChange(e.target.checked)}
          className="w-3.5 h-3.5 accent-[#370E4D] cursor-pointer"
        />
        <span className="text-[12px] text-[#0A0A0A]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
          Eigenen Look für dieses Produkt kuratieren
        </span>
      </label>

      {enabled && (
        loading ? <Loader /> : candidates.length === 0 ? (
          <EmptyState message="Noch keine weiteren Produkte vorhanden — lege zuerst ein zweites Produkt an." />
        ) : (
          <>
            <input
              className={INPUT}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Produkte durchsuchen…"
              style={{ fontFamily: 'var(--font-league-spartan)' }}
            />
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#9B9B9B]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
              {selected.length}/{MAX_LOOK_PRODUCTS} gewählt
            </p>
            <div className="grid grid-cols-4 gap-3">
              {visible.map(c => {
                const isSelected = selected.includes(c.id)
                const atMax = !isSelected && selected.length >= MAX_LOOK_PRODUCTS
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onToggle(c.id)}
                    disabled={atMax}
                    className="text-left group disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <div
                      className="relative aspect-[3/4] bg-[#F5F5F0] overflow-hidden border transition-colors duration-200"
                      style={{ borderColor: isSelected ? '#370E4D' : '#E8E8E8' }}
                    >
                      {coverImageUrl(c)
                        ? <img src={coverImageUrl(c)!} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-[9px] tracking-[0.15em] text-[#C0C0BC]">LEER</div>}
                      {isSelected && (
                        <span className="absolute top-1.5 right-1.5 w-5 h-5 flex items-center justify-center" style={{ background: '#370E4D' }}>
                          <Check className="w-3 h-3 text-white" />
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-[11px] text-[#2D2D2D] leading-tight line-clamp-2" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                      {c.name}
                    </p>
                  </button>
                )
              })}
            </div>
          </>
        )
      )}
    </>
  )
}

function CompleteTheLookSection({
  product,
  onSaved,
}: {
  product: AdminApiProduct
  onSaved: (p: AdminApiProduct) => void
}) {
  const [enabled, setEnabled]   = useState<boolean>(product.completeTheLookEnabled ?? false)
  const [selected, setSelected] = useState<string[]>(
    (product.completeTheLookProducts ?? []).map(p => String(p.id)),
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [err, setErr]       = useState<string | null>(null)

  async function save() {
    setSaving(true); setErr(null)
    try {
      const updated = await brandApi.products.update(product.id, {
        completeTheLookEnabled: enabled,
        completeTheLookProductIds: enabled ? selected.map(Number) : [],
      })
      onSaved(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      setErr(e instanceof FetchError ? e.message : 'Look konnte nicht gespeichert werden.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SectionCard title="Vervollständige den Look">
      <div className="p-6 space-y-4">
        <LookPicker
          excludeProductId={product.id}
          enabled={enabled}
          onEnabledChange={v => { setEnabled(v); setSaved(false) }}
          selected={selected}
          onToggle={id => { setSaved(false); setSelected(prev => toggleLookSelection(prev, id)) }}
        />

        {err && <p className="text-[11px] text-[#8B1E3F]" style={{ fontFamily: 'var(--font-league-spartan)' }}>{err}</p>}

        <button
          onClick={save}
          disabled={saving}
          className={BTN_PRIMARY}
          style={{ background: '#370E4D', fontFamily: 'var(--font-league-spartan)' }}
        >
          {saving ? 'Speichert…' : saved ? <><Check className="w-3.5 h-3.5" /> Gespeichert</> : 'Look speichern'}
        </button>
      </div>
    </SectionCard>
  )
}

// ─── Listings section (price per region) ──────────────────────────────────────
const LISTING_REGIONS = [
  { id: 'DE', label: 'Deutschland' },
  { id: 'EU', label: 'Europa' },
  { id: 'GLOBAL', label: 'Global' },
  { id: 'US', label: 'USA' },
]

// Matches backend HALF_UP, 2 dp rounding. toFixed(4) intermediate step
// avoids float drift (e.g. 10.50 × 0.19 = 1.9949… → "199.5000" → 200 → 2.00 ✓)
function round2(v: number): number {
  return Math.round(Number((v * 100).toFixed(4))) / 100
}

const PRICE_MODE_CONFIG: Record<PriceInputMode, {
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

function ListingsSection({ product }: { product: AdminApiProduct }) {
  const [listings, setListings]             = useState<ApiListing[]>([])
  const [variants, setVariants]             = useState<AdminApiVariant[]>([])
  const [loading, setLoading]               = useState(true)
  const [editingListing, setEditingListing] = useState<ApiListing | null>(null)
  const [variantSel, setVariantSel]         = useState<string>('')
  const [priceInputMode, setPriceInputMode] = useState<PriceInputMode>('GROSS')
  const [price, setPrice]                   = useState('')
  const [discountPrice, setDiscountPrice]   = useState('')
  const [region, setRegion]                 = useState('DE')
  const [saving, setSaving]                 = useState(false)
  const [deleting, setDeleting]             = useState<string | null>(null)
  const [err, setErr]                       = useState<string | null>(null)

  // Listings sind pro Variante (Backend: CreateListingDto.variantId @NotNull) —
  // Varianten werden für die Pflicht-Auswahl mitgeladen.
  useEffect(() => {
    Promise.all([
      brandApi.listings.list(product.id).catch(() => [] as ApiListing[]),
      brandApi.variants.list(product.id).catch(() => [] as AdminApiVariant[]),
    ]).then(([ls, vs]) => {
      setListings(ls)
      setVariants(vs)
      if (vs.length > 0) setVariantSel(String(vs[0].id))
    }).finally(() => setLoading(false))
  }, [product.id])

  const variantLabel = (v: AdminApiVariant) =>
    [v.color, v.size, v.sku ? `· ${v.sku}` : ''].filter(Boolean).join(' ')

  // Live breakdown
  const parsedPrice = parseFloat(price.replace(',', '.'))
  const validPrice  = !isNaN(parsedPrice) && parsedPrice > 0
  const grossPrice  = validPrice ? (priceInputMode === 'GROSS' ? parsedPrice : round2(parsedPrice * 1.19)) : null
  const netPrice    = validPrice ? (priceInputMode === 'NET'   ? parsedPrice : round2(parsedPrice / 1.19)) : null
  // Derived as difference of primary values (not round2(net×0.19)), so the three displayed values always reconcile
  const vatAmount   = grossPrice !== null && netPrice !== null ? round2(grossPrice - netPrice) : null

  const { priceLabel, priceHint, discountLabel } = PRICE_MODE_CONFIG[priceInputMode]

  // User-triggered toggle — resets fields (intentional UX, prevents stale values)
  function handleModeToggle(mode: PriceInputMode) {
    setPriceInputMode(mode)
    setPrice('')
    setDiscountPrice('')
  }

  // Hydrate form from an existing listing — does NOT trigger field reset
  function startEdit(l: ApiListing) {
    setEditingListing(l)
    setPriceInputMode(l.priceInputMode ?? 'GROSS')
    setPrice(String(l.price))
    setDiscountPrice(l.discountPrice != null ? String(l.discountPrice) : '')
    setErr(null)
  }

  function cancelEdit() {
    setEditingListing(null)
    setPriceInputMode('GROSS')
    setPrice('')
    setDiscountPrice('')
    setErr(null)
  }

  async function saveForm() {
    const p = parseFloat(price.replace(',', '.'))
    if (!price || isNaN(p) || p <= 0) { setErr('Gültigen Preis eingeben.'); return }
    const dp = discountPrice ? parseFloat(discountPrice.replace(',', '.')) : null
    if (dp !== null && (isNaN(dp) || dp <= 0 || dp >= p)) {
      setErr('Sale-Preis muss kleiner als der reguläre Preis sein (gleiche Basis).')
      return
    }
    if (!editingListing && !variantSel) {
      setErr('Variante wählen — Listings gelten pro Variante.')
      return
    }
    setSaving(true); setErr(null)
    try {
      if (editingListing) {
        const dto: UpdateListingDto = {
          price: p,
          priceInputMode,
          discountPrice: dp ?? undefined,
        }
        const updated = await brandApi.listings.update(product.id, editingListing.id, dto)
        setListings(prev => prev.map(l => l.id === editingListing.id ? updated : l))
        cancelEdit()
      } else {
        const dto: CreateListingDto = {
          variantId: Number(variantSel),
          price: p,
          priceInputMode,
          currency: 'EUR',
          region,
          ...(dp !== null && { discountPrice: dp }),
        }
        const created = await brandApi.listings.create(product.id, dto)
        setListings(prev => [...prev, created])
        setPrice('')
        setDiscountPrice('')
      }
    } catch {
      setErr(editingListing ? 'Aktualisieren fehlgeschlagen.' : 'Listing konnte nicht erstellt werden.')
    } finally { setSaving(false) }
  }

  async function deleteListing(listingId: string) {
    if (editingListing?.id === listingId) cancelEdit()
    setDeleting(listingId)
    try {
      await brandApi.listings.delete(product.id, listingId)
      setListings(prev => prev.filter(l => l.id !== listingId))
    } catch { /* silent */ }
    finally { setDeleting(null) }
  }

  return (
    <SectionCard title="Preisgestaltung">
      <div className="p-6 space-y-4">
        <p className="text-[12px] text-[#6B6B6B]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
          Lege den Verkaufspreis je Region fest. Ohne ein aktives Listing ist das Produkt nicht kaufbar.
        </p>

        {loading ? <Loader /> : (
          <>
            {listings.length > 0 ? (
              <div className="space-y-2">
                {listings.map(l => (
                  <div key={l.id}
                    className="flex items-center justify-between px-4 py-3 rounded-none border transition-colors duration-150"
                    style={{
                      background: editingListing?.id === l.id ? 'rgba(55,14,77,0.04)' : '#FAFAF8',
                      borderColor: editingListing?.id === l.id ? 'rgba(55,14,77,0.2)' : '#E8E8E8',
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-[11px] font-medium text-[#6B6B6B] bg-[#F0F0EB] px-2.5 py-1 rounded-full"
                        style={{ fontFamily: 'var(--font-league-spartan)' }}>
                        {LISTING_REGIONS.find(r => r.id === l.region)?.label ?? l.region ?? 'Global'}
                      </span>
                      {(l.variantColor || l.variantSize || l.variantSku) && (
                        <span className="text-[11px] text-[#6B6B6B]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                          {[l.variantColor, l.variantSize].filter(Boolean).join(' / ')}
                          {l.variantSku && <span className="font-mono text-[10px] text-[#9B9B9B] ml-1.5">{l.variantSku}</span>}
                        </span>
                      )}
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-[15px] font-semibold text-[#0A0A0A] tabular-nums"
                            style={{ fontFamily: 'var(--font-league-spartan)' }}>
                            {fmtEur(l.priceGross ?? l.price)}
                          </span>
                          {(l.discountPriceGross ?? l.discountPrice) != null && (
                            <span className="text-[12px] font-semibold text-[#1A5A3C] tabular-nums"
                              style={{ fontFamily: 'var(--font-league-spartan)' }}>
                              Sale: {fmtEur((l.discountPriceGross ?? l.discountPrice)!)}
                            </span>
                          )}
                        </div>
                        {/* Netto · USt · Brutto verbatim aus den API-Feldern — keine Client-Neuberechnung */}
                        {l.priceNet != null && l.priceVat != null && (
                          <p className="text-[10px] text-[#9B9B9B] tabular-nums mt-0.5" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                            Netto {fmtEur(l.priceNet)} + USt {fmtEur(l.priceVat)} = {fmtEur(l.priceGross ?? l.price)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => editingListing?.id === l.id ? cancelEdit() : startEdit(l)}
                        className="w-7 h-7 rounded-none flex items-center justify-center transition-all duration-150"
                        style={{ color: editingListing?.id === l.id ? '#370E4D' : '#C0C0BC' }}
                        title="Bearbeiten"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteListing(l.id)}
                        disabled={deleting === l.id}
                        className="w-7 h-7 rounded-none flex items-center justify-center text-[#C0C0BC] hover:text-[#8B1E3F] hover:bg-rose-50 transition-all duration-150"
                        title="Löschen"
                      >
                        {deleting === l.id ? <span className="text-[10px]">…</span> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-[12px] text-[#9B9B9B] border border-dashed border-[#E8E8E8] rounded-none"
                style={{ fontFamily: 'var(--font-league-spartan)' }}>
                Noch kein Listing — Produkt ist ohne Preis nicht kaufbar.
              </div>
            )}

            <div className="space-y-3 pt-3 border-t border-[#F0F0EB]">
              {editingListing && (
                <div className="flex items-center justify-between px-3 py-2 rounded-none bg-[rgba(55,14,77,0.05)] border border-[rgba(55,14,77,0.15)]">
                  <p className="text-[11px] text-[#370E4D]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                    Listing bearbeiten — {LISTING_REGIONS.find(r => r.id === editingListing.region)?.label ?? editingListing.region}
                  </p>
                  <button onClick={cancelEdit} className="text-[#370E4D]/60 hover:text-[#370E4D] transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Eingabemodus-Toggle — explizite Wahl, Default GROSS, Reset nur bei User-Interaktion */}
              <div>
                <p className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Eingabemodus</p>
                <div className="inline-flex rounded-none border border-[#E8E8E8] overflow-hidden">
                  {(['GROSS', 'NET'] as PriceInputMode[]).map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => handleModeToggle(mode)}
                      className="h-8 px-4 text-[11px] font-medium transition-all duration-150"
                      style={{
                        fontFamily: 'var(--font-league-spartan)',
                        letterSpacing: '0.06em',
                        background: priceInputMode === mode ? '#370E4D' : '#fff',
                        color:      priceInputMode === mode ? '#fff'    : '#6B6B6B',
                      }}
                    >
                      {mode === 'GROSS' ? 'Brutto (inkl. MwSt.)' : 'Netto (exkl. MwSt.)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Varianten-Auswahl — Pflicht beim Anlegen (Backend: variantId @NotNull) */}
              {!editingListing && (
                <div>
                  <p className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Variante *</p>
                  {variants.length === 0 ? (
                    <p className="text-[11px] text-[#8B1E3F]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                      Keine Varianten vorhanden — bitte zuerst im Bereich „Varianten &amp; Bestand“ anlegen.
                    </p>
                  ) : (
                    <select value={variantSel} onChange={e => setVariantSel(e.target.value)}
                      className={INPUT} style={{ fontFamily: 'var(--font-league-spartan)' }}>
                      {variants.map(v => <option key={v.id} value={String(v.id)}>{variantLabel(v)}</option>)}
                    </select>
                  )}
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Region</p>
                  {editingListing ? (
                    <div className="h-10 flex items-center px-3.5 rounded-none border border-[#E8E8E8] bg-[#FAFAF8]">
                      <span className="text-[13px] text-[#6B6B6B]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                        {LISTING_REGIONS.find(r => r.id === editingListing.region)?.label ?? editingListing.region}
                      </span>
                    </div>
                  ) : (
                    <select value={region} onChange={e => setRegion(e.target.value)}
                      className={INPUT} style={{ fontFamily: 'var(--font-league-spartan)' }}>
                      {LISTING_REGIONS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                    </select>
                  )}
                </div>
                <div>
                  <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>{priceLabel}</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    className={INPUT}
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveForm()}
                    placeholder="89,95"
                    style={{ fontFamily: 'var(--font-league-spartan)' }}
                  />
                  <p className="text-[10px] text-[#C0C0BC] mt-1 leading-snug" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                    {priceHint}
                  </p>
                </div>
                <div>
                  <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>{discountLabel}</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    className={INPUT}
                    value={discountPrice}
                    onChange={e => setDiscountPrice(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveForm()}
                    placeholder="69,95"
                    style={{ fontFamily: 'var(--font-league-spartan)' }}
                  />
                </div>
              </div>

              {/* Live-Breakdown */}
              {validPrice && grossPrice !== null && netPrice !== null && vatAmount !== null && (
                <div className="grid grid-cols-3 gap-px rounded-none overflow-hidden border border-[#F0F0EB] bg-[#F0F0EB]">
                  {([
                    { label: 'Netto',          value: netPrice,   color: '#2D2D2D' },
                    { label: 'MwSt. 19 %',     value: vatAmount,  color: '#2D2D2D' },
                    { label: 'Endkundenpreis', value: grossPrice, color: '#370E4D' },
                  ] as { label: string; value: number; color: string }[]).map(({ label, value, color }) => (
                    <div key={label} className="bg-[#FAFAF8] px-4 py-3">
                      <p className="text-[9px] uppercase tracking-[0.12em] text-[#9B9B9B] mb-1"
                        style={{ fontFamily: 'var(--font-league-spartan)' }}>
                        {label}
                      </p>
                      <p className="text-[14px] font-semibold tabular-nums"
                        style={{ fontFamily: 'var(--font-league-spartan)', color }}>
                        {fmtEur(value)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={saveForm}
                  disabled={saving}
                  className={BTN_PRIMARY + ' flex-1 justify-center'}
                  style={{ background: '#370E4D', fontFamily: 'var(--font-league-spartan)' }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  {saving ? '…' : editingListing ? 'Aktualisieren' : 'Listing hinzufügen'}
                </button>
                {editingListing && (
                  <button onClick={cancelEdit} className={BTN_GHOST} style={{ fontFamily: 'var(--font-league-spartan)' }}>
                    Abbrechen
                  </button>
                )}
              </div>
            </div>
            {err && <p className="text-[11px] text-[#8B1E3F]" style={{ fontFamily: 'var(--font-league-spartan)' }}>{err}</p>}
          </>
        )}
      </div>
    </SectionCard>
  )
}

// ─── Edit product panel ───────────────────────────────────────────────────────
function EditPanel({
  product,
  onBack,
  onSaved,
  onImagesChanged,
}: {
  product: AdminApiProduct
  onBack: () => void
  onSaved: (p: AdminApiProduct) => void
  onImagesChanged?: (imageUrls: string[]) => void
}) {
  const [form, setForm] = useState({
    name:             product.name,
    description:      product.description ?? '',
    material:         product.material ?? '',
    careInstructions: product.careInstructions ?? '',
    collectionName:   product.collectionName ?? '',
    inspirationStory: product.inspirationStory ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [err, setErr]       = useState<string | null>(null)

  function set(field: keyof typeof form, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function save() {
    if (!form.name.trim()) { setErr('Name ist erforderlich.'); return }
    setSaving(true); setErr(null)
    try {
      const updated = await brandApi.products.update(product.id, {
        name: form.name.trim(),
        description: form.description,
        material: form.material,
        careInstructions: form.careInstructions,
        collectionName: form.collectionName,
        inspirationStory: form.inspirationStory,
      })
      onSaved(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch { setErr('Speichern fehlgeschlagen.') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-[12px] text-[#6B6B6B] hover:text-[#370E4D] transition-colors" style={{ fontFamily: 'var(--font-league-spartan)' }}>
          <ChevronLeft className="w-3.5 h-3.5" /> Zurück
        </button>
        <div className="w-px h-4 bg-[#E8E8E8]" />
        <div className="flex items-center gap-2">
          <Edit2 className="w-3.5 h-3.5 text-[#370E4D]" />
          <div>
            <p className="text-[13px] font-semibold text-[#0A0A0A]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
              Produkt bearbeiten — {product.name}
            </p>
            {product.sku && (
              <p className="text-[10px] font-mono text-[#9B9B9B] mt-0.5">{product.sku}</p>
            )}
          </div>
        </div>
      </div>

      <ImagesSection product={product} onImagesChanged={onImagesChanged} />

      <SectionCard title="Produktdetails">
        <div className="p-6 space-y-4">
          <div>
            <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Name *</label>
            <input className={INPUT} value={form.name} onChange={e => set('name', e.target.value)} style={{ fontFamily: 'var(--font-league-spartan)' }} />
          </div>
          <div>
            <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Beschreibung</label>
            <textarea rows={3} className={INPUT} value={form.description} onChange={e => set('description', e.target.value)} style={{ fontFamily: 'var(--font-league-spartan)', resize: 'vertical' }} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Material</label>
              <input className={INPUT} value={form.material} onChange={e => set('material', e.target.value)} placeholder="100% Baumwolle" style={{ fontFamily: 'var(--font-league-spartan)' }} />
            </div>
            <div>
              <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Kollektion</label>
              <input className={INPUT} value={form.collectionName} onChange={e => set('collectionName', e.target.value)} placeholder="Sommer 2026" style={{ fontFamily: 'var(--font-league-spartan)' }} />
            </div>
          </div>
          <div>
            <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Pflegehinweise</label>
            <input className={INPUT} value={form.careInstructions} onChange={e => set('careInstructions', e.target.value)} placeholder="30°C Maschinenwäsche" style={{ fontFamily: 'var(--font-league-spartan)' }} />
          </div>
          <div>
            <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Inspirationsgeschichte</label>
            <textarea rows={3} className={INPUT} value={form.inspirationStory} onChange={e => set('inspirationStory', e.target.value)} style={{ fontFamily: 'var(--font-league-spartan)', resize: 'vertical' }} />
          </div>

          {err && <p className="text-[11px] text-[#8B1E3F]" style={{ fontFamily: 'var(--font-league-spartan)' }}>{err}</p>}

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={save}
              disabled={saving}
              className={BTN_PRIMARY}
              style={{ background: '#370E4D', fontFamily: 'var(--font-league-spartan)' }}
            >
              {saving ? 'Speichert…' : saved ? <><Check className="w-3.5 h-3.5" /> Gespeichert</> : 'Speichern'}
            </button>
            <button onClick={onBack} className={BTN_GHOST} style={{ fontFamily: 'var(--font-league-spartan)' }}>Abbrechen</button>
          </div>
        </div>
      </SectionCard>

      <ListingsSection product={product} />

      <CompleteTheLookSection product={product} onSaved={onSaved} />
    </div>
  )
}

// ─── Create wizard ────────────────────────────────────────────────────────────
function CreateWizard({ onBack, onCreated }: { onBack: () => void; onCreated: (p: AdminApiProduct) => void }) {
  const [step, setStep]         = useState<WizardStep>(1)
  const [data, setData]         = useState<WizardData>(EMPTY_WIZARD)
  const [variants, setVariants] = useState<VariantRow[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr]           = useState<string | null>(null)

  // Batch add state
  const [batchColor, setBatchColor]   = useState<string>('BLACK')
  const [batchSizes, setBatchSizes]   = useState<string[]>([])
  const [batchStock, setBatchStock]   = useState(1)
  const [batchWeight, setBatchWeight] = useState(250)

  // Look step state — sent with the create call, so no follow-up request is needed.
  const [lookEnabled, setLookEnabled]   = useState(false)
  const [lookSelected, setLookSelected] = useState<string[]>([])
  const [lookNames, setLookNames]       = useState<Record<string, string>>({})

  // Price step state
  const [priceMode, setPriceMode]         = useState<PriceInputMode>('GROSS')
  const [price, setPrice]                 = useState('')
  const [discountPrice, setDiscountPrice] = useState('')
  const [region, setRegion]               = useState('DE')

  function setField<K extends keyof WizardData>(k: K, v: WizardData[K]) {
    setData(d => ({ ...d, [k]: v }))
  }

  function toggleCatalogue(id: string) {
    setData(d => {
      if (d.catalogueCategory.includes(id))
        return { ...d, catalogueCategory: d.catalogueCategory.filter(c => c !== id) }
      if (d.catalogueCategory.length >= 3) return d
      return { ...d, catalogueCategory: [...d.catalogueCategory, id] }
    })
  }

  function addBatchVariants() {
    if (batchSizes.length === 0) { setErr('Mind. eine Größe wählen.'); return }
    const newRows: VariantRow[] = batchSizes.map(size => ({
      _key: `${Date.now()}-${Math.random().toString(36).slice(2)}-${size}`,
      color: batchColor,
      size,
      stockQuantity: batchStock,
      weightGrams: batchWeight,
    }))
    setVariants(v => [...v, ...newRows])
    setBatchSizes([])
    setErr(null)
  }

  function toggleBatchSize(size: string) {
    setBatchSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size])
  }

  function updateVariantRow(idx: number, field: keyof VariantRow, value: string | number) {
    setVariants(v => v.map((row, i) => i === idx ? { ...row, [field]: value } : row))
  }

  function removeVariantRow(idx: number) {
    setVariants(v => v.filter((_, i) => i !== idx))
  }

  function validateStep1() {
    if (!data.name.trim()) { setErr('Name ist erforderlich.'); return false }
    if (!data.description.trim()) { setErr('Beschreibung ist erforderlich.'); return false }
    if (!data.material.trim()) { setErr('Material ist erforderlich.'); return false }
    if (!data.originCountry.trim()) { setErr('Herkunftsland ist erforderlich.'); return false }
    if (!data.careInstructions.trim()) { setErr('Pflegehinweise sind erforderlich.'); return false }
    if (data.catalogueCategory.length === 0) { setErr('Mindestens eine Katalogart wählen.'); return false }
    return true
  }

  function validateStep2() {
    if (variants.length === 0) { setErr('Mindestens eine Variante hinzufügen.'); return false }
    return true
  }

  function validateStep3() {
    const p = parseFloat(price.replace(',', '.'))
    if (!price || isNaN(p) || p <= 0) { setErr('Gültigen Preis eingeben.'); return false }
    const dp = discountPrice ? parseFloat(discountPrice.replace(',', '.')) : null
    if (dp !== null && (isNaN(dp) || dp <= 0 || dp >= p)) {
      setErr('Sale-Preis muss kleiner als der reguläre Preis sein (gleiche Basis).')
      return false
    }
    return true
  }

  async function submit() {
    setSubmitting(true); setErr(null)
    try {
      const dto: CreateProductDto = {
        ...data,
        variants: variants.map(v => ({
          color: v.color,
          colorFamily: v.color,
          size: v.size,
          stockQuantity: v.stockQuantity,
          weightGrams: v.weightGrams,
        })),
        completeTheLookEnabled: lookEnabled,
        completeTheLookProductIds: lookEnabled ? lookSelected.map(Number) : [],
      }
      const created = await brandApi.products.create(dto)

      // Preis = Listing pro Variante (Backend: CreateListingDto.variantId @NotNull).
      // Best-effort: ein Listing je angelegter Variante mit demselben Preis; schlägt eines fehl,
      // existiert das Produkt trotzdem und der Preis kann in der Preisgestaltung gesetzt werden.
      const p  = parseFloat(price.replace(',', '.'))
      const dp = discountPrice ? parseFloat(discountPrice.replace(',', '.')) : null
      for (const v of created.variants ?? []) {
        const listingDto: CreateListingDto = {
          variantId: Number(v.id),
          price: p,
          priceInputMode: priceMode,
          currency: 'EUR',
          region,
          ...(dp !== null && { discountPrice: dp }),
        }
        try {
          await brandApi.listings.create(created.id, listingDto)
        } catch { /* Produkt existiert; Preis kann im Edit-Panel nachgetragen werden */ }
      }

      onCreated(created)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Produkt konnte nicht erstellt werden.'
      setErr(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const totalStock = variants.reduce((s, v) => s + v.stockQuantity, 0)

  // Live price breakdown (same rounding as backend / ListingsSection)
  const parsedPrice = parseFloat(price.replace(',', '.'))
  const validPrice  = !isNaN(parsedPrice) && parsedPrice > 0
  const grossPrice  = validPrice ? (priceMode === 'GROSS' ? parsedPrice : round2(parsedPrice * 1.19)) : null
  const netPrice    = validPrice ? (priceMode === 'NET'   ? parsedPrice : round2(parsedPrice / 1.19)) : null
  const vatAmount   = grossPrice !== null && netPrice !== null ? round2(grossPrice - netPrice) : null
  const priceCfg    = PRICE_MODE_CONFIG[priceMode]

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-[12px] text-[#6B6B6B] hover:text-[#370E4D] transition-colors" style={{ fontFamily: 'var(--font-league-spartan)' }}>
          <ChevronLeft className="w-3.5 h-3.5" /> Zurück
        </button>
        <div className="w-px h-4 bg-[#E8E8E8]" />
        <p className="text-[13px] font-semibold text-[#0A0A0A]" style={{ fontFamily: 'var(--font-league-spartan)' }}>Neues Produkt erstellen</p>
      </div>

      <StepIndicator step={step} />

      {/* ── Step 1: Basic Info ── */}
      {step === 1 && (
        <SectionCard title="Grunddaten">
          <div className="p-6 space-y-4">
            {/* ── Image upload placeholder (active in EditPanel after creation) ── */}
            <div>
              <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>
                Produktbilder
                <span className="normal-case tracking-normal text-[#C0C0BC] ml-2" style={{ fontSize: 10 }}>
                  — nach Erstellung verfügbar
                </span>
              </label>
              <div
                className="border-2 border-dashed border-[#E8E8E8] rounded-none p-8 text-center"
                style={{ background: '#FAFAF8', opacity: 0.7 }}
              >
                <div className="flex justify-center gap-2.5 mb-4">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="rounded-none bg-[#F0F0EB] border border-[#E8E8E8] flex items-center justify-center"
                      style={{ width: 52, aspectRatio: '3/4' }}
                    >
                      <ImagePlus className="w-4 h-4 text-[#D0D0CC]" />
                    </div>
                  ))}
                </div>
                <p className="text-[13px] text-[#9B9B9B]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                  Bilder nach Erstellung hochladen
                </p>
                <p className="text-[11px] text-[#C0C0BC] mt-1" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                  JPG, PNG, WebP · max. 10 MB je Bild · bis zu 8 Bilder
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Produktname *</label>
                <input className={INPUT} value={data.name} onChange={e => setField('name', e.target.value)} placeholder="z.B. Essentials Hoodie" style={{ fontFamily: 'var(--font-league-spartan)' }} />
              </div>
              <div className="col-span-2">
                <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Beschreibung *</label>
                <textarea rows={3} className={INPUT} value={data.description} onChange={e => setField('description', e.target.value)} placeholder="Produktbeschreibung…" style={{ fontFamily: 'var(--font-league-spartan)', resize: 'vertical' }} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Geschlecht</label>
                <div className="flex gap-1.5 mt-1">
                  {GENDERS.map(g => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setField('gender', g.id)}
                      className="flex-1 py-2 rounded-none border text-[11px] font-medium transition-all duration-150"
                      style={{
                        fontFamily: 'var(--font-league-spartan)',
                        background: data.gender === g.id ? '#370E4D' : '#fff',
                        color: data.gender === g.id ? '#fff' : '#6B6B6B',
                        borderColor: data.gender === g.id ? '#370E4D' : '#E8E8E8',
                      }}
                    >{g.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Produkttyp</label>
                <select className={INPUT} value={data.productType} onChange={e => setField('productType', e.target.value)} style={{ fontFamily: 'var(--font-league-spartan)' }}>
                  {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Rückgabefrist (Tage)</label>
                <input type="number" min={0} max={30} className={INPUT} value={data.returnPeriodDays}
                  onChange={e => setField('returnPeriodDays', Number(e.target.value))}
                  style={{ fontFamily: 'var(--font-league-spartan)' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Material *</label>
                <input className={INPUT} value={data.material} onChange={e => setField('material', e.target.value)} placeholder="100% Baumwolle" style={{ fontFamily: 'var(--font-league-spartan)' }} />
              </div>
              <div>
                <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Herkunftsland *</label>
                <input className={INPUT} value={data.originCountry} onChange={e => setField('originCountry', e.target.value)} placeholder="Deutschland" style={{ fontFamily: 'var(--font-league-spartan)' }} />
              </div>
              <div>
                <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Pflegehinweise *</label>
                <input className={INPUT} value={data.careInstructions} onChange={e => setField('careInstructions', e.target.value)} placeholder="30°C Maschinenwäsche" style={{ fontFamily: 'var(--font-league-spartan)' }} />
              </div>
              <div>
                <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Kollektion</label>
                <input className={INPUT} value={data.collectionName} onChange={e => setField('collectionName', e.target.value)} placeholder="Sommer 2026" style={{ fontFamily: 'var(--font-league-spartan)' }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Release-Datum</label>
                <input type="date" className={INPUT} value={data.releaseDate} onChange={e => setField('releaseDate', e.target.value)} style={{ fontFamily: 'var(--font-league-spartan)' }} />
              </div>
            </div>

            <div>
              <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>
                Katalog-Kategorien * <span className="normal-case tracking-normal text-[#C0C0BC]">(max. 3, {data.catalogueCategory.length}/3 gewählt)</span>
              </label>
              <div className="flex flex-wrap gap-2 mt-1">
                {CATALOGUE_OPTS.map(opt => {
                  const selected = data.catalogueCategory.includes(opt.id)
                  const atMax = data.catalogueCategory.length >= 3 && !selected
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={atMax}
                      onClick={() => toggleCatalogue(opt.id)}
                      className="px-3.5 py-1.5 rounded-full border text-[11px] font-medium transition-all duration-150"
                      style={{
                        fontFamily: 'var(--font-league-spartan)',
                        background: selected ? '#370E4D' : atMax ? '#F5F5F0' : '#fff',
                        color: selected ? '#fff' : atMax ? '#C0C0BC' : '#6B6B6B',
                        borderColor: selected ? '#370E4D' : '#E8E8E8',
                        cursor: atMax ? 'not-allowed' : 'pointer',
                        opacity: atMax ? 0.5 : 1,
                      }}
                    >
                      {selected && <Check className="w-3 h-3 inline mr-1" />}
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Inspirationsgeschichte</label>
              <textarea rows={2} className={INPUT} value={data.inspirationStory} onChange={e => setField('inspirationStory', e.target.value)} placeholder="Was inspirierte dieses Produkt?" style={{ fontFamily: 'var(--font-league-spartan)', resize: 'vertical' }} />
            </div>

            {err && <p className="text-[11px] text-[#8B1E3F]" style={{ fontFamily: 'var(--font-league-spartan)' }}>{err}</p>}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => { setErr(null); if (validateStep1()) { setErr(null); setStep(2) } }}
                className={BTN_PRIMARY}
                style={{ background: '#370E4D', fontFamily: 'var(--font-league-spartan)' }}
              >
                Weiter: Varianten →
              </button>
            </div>
          </div>
        </SectionCard>
      )}

      {/* ── Step 2: Variants ── */}
      {step === 2 && (
        <SectionCard title={`Varianten (${variants.length})`}>
          <div className="p-6 space-y-4">

            {/* ── Batch add panel ── */}
            <div className="border border-[#E8E8E8] bg-[#FAFAF8] p-4 space-y-4">
              {/* Color */}
              <div>
                <p className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Farbe</p>
                <div className="flex flex-wrap gap-1.5">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setBatchColor(c)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 border text-[11px] font-medium transition-all duration-150"
                      style={{
                        fontFamily: 'var(--font-league-spartan)',
                        background: batchColor === c ? '#370E4D' : '#fff',
                        color:      batchColor === c ? '#fff'    : '#6B6B6B',
                        borderColor: batchColor === c ? '#370E4D' : '#E8E8E8',
                      }}
                    >
                      <span className="w-3 h-3 shrink-0 border border-black/10"
                        style={{ background: COLOR_SWATCHES[c] }} />
                      {COLOR_LABELS[c]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes (multi-select) */}
              <div>
                <p className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>
                  Größen
                  <span className="normal-case tracking-normal text-[#C0C0BC] ml-2" style={{ fontSize: 10 }}>
                    — Mehrfachauswahl
                  </span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SIZES.map(s => {
                    const on = batchSizes.includes(s)
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleBatchSize(s)}
                        className="w-12 py-2 border text-[12px] font-semibold transition-all duration-150"
                        style={{
                          fontFamily: 'var(--font-league-spartan)',
                          background:  on ? '#370E4D' : '#fff',
                          color:       on ? '#fff'    : '#6B6B6B',
                          borderColor: on ? '#370E4D' : '#E8E8E8',
                        }}
                      >
                        {s}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Stock + Weight */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Bestand je Größe</label>
                  <input
                    type="number" min={0}
                    value={batchStock}
                    onChange={e => setBatchStock(Number(e.target.value))}
                    className={INPUT}
                    style={{ fontFamily: 'var(--font-league-spartan)' }}
                  />
                </div>
                <div>
                  <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Gewicht (g)</label>
                  <input
                    type="number" min={0}
                    value={batchWeight}
                    onChange={e => setBatchWeight(Number(e.target.value))}
                    className={INPUT}
                    style={{ fontFamily: 'var(--font-league-spartan)' }}
                  />
                </div>
              </div>

              <button
                onClick={addBatchVariants}
                disabled={batchSizes.length === 0}
                className={BTN_PRIMARY + ' disabled:opacity-40 disabled:cursor-not-allowed'}
                style={{ background: '#370E4D', fontFamily: 'var(--font-league-spartan)' }}
              >
                <Plus className="w-3.5 h-3.5" />
                {batchSizes.length > 0
                  ? `${batchSizes.length} Variante${batchSizes.length > 1 ? 'n' : ''} hinzufügen (${COLOR_LABELS[batchColor]})`
                  : 'Größen wählen'}
              </button>
            </div>

            {/* ── Added variants list ── */}
            {variants.length > 0 && (
              <div className="space-y-2">
                {variants.map((v, i) => (
                  <VariantCard
                    key={v._key ?? String(i)}
                    variant={v}
                    index={i}
                    onChange={(field, value) => updateVariantRow(i, field, value)}
                    onRemove={() => removeVariantRow(i)}
                  />
                ))}
              </div>
            )}

            {variants.length === 0 && (
              <div className="py-6 text-center text-[12px] text-[#C0C0BC] border border-dashed border-[#E8E8E8]"
                style={{ fontFamily: 'var(--font-league-spartan)' }}>
                Noch keine Varianten — Farbe + Größen wählen und hinzufügen.
              </div>
            )}

            {err && <p className="text-[11px] text-[#8B1E3F]" style={{ fontFamily: 'var(--font-league-spartan)' }}>{err}</p>}

            <div className="flex items-center justify-between pt-2">
              <button onClick={() => { setErr(null); setStep(1) }} className={BTN_GHOST} style={{ fontFamily: 'var(--font-league-spartan)' }}>
                ← Zurück
              </button>
              <button
                onClick={() => { setErr(null); if (validateStep2()) { setErr(null); setStep(3) } }}
                className={BTN_PRIMARY}
                style={{ background: '#370E4D', fontFamily: 'var(--font-league-spartan)' }}
              >
                Weiter: Preis →
              </button>
            </div>
          </div>
        </SectionCard>
      )}

      {/* ── Step 3: Price ── */}
      {step === 3 && (
        <SectionCard title="Preis">
          <div className="p-6 space-y-4">
            <p className="text-[12px] text-[#6B6B6B]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
              Lege den Verkaufspreis für die Hauptregion fest. Weitere Regionen kannst du nach der Erstellung in der Preisgestaltung hinzufügen.
            </p>

            {/* Eingabemodus-Toggle */}
            <div>
              <p className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Eingabemodus</p>
              <div className="inline-flex border border-[#E8E8E8] overflow-hidden">
                {(['GROSS', 'NET'] as PriceInputMode[]).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => { setPriceMode(mode); setPrice(''); setDiscountPrice(''); setErr(null) }}
                    className="h-8 px-4 text-[11px] font-medium transition-all duration-150"
                    style={{
                      fontFamily: 'var(--font-league-spartan)',
                      letterSpacing: '0.06em',
                      background: priceMode === mode ? '#370E4D' : '#fff',
                      color:      priceMode === mode ? '#fff'    : '#6B6B6B',
                    }}
                  >
                    {mode === 'GROSS' ? 'Brutto (inkl. MwSt.)' : 'Netto (exkl. MwSt.)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Region + price + discount */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Region</label>
                <select value={region} onChange={e => setRegion(e.target.value)}
                  className={INPUT} style={{ fontFamily: 'var(--font-league-spartan)' }}>
                  {LISTING_REGIONS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>{priceCfg.priceLabel}</label>
                <input
                  type="text"
                  inputMode="decimal"
                  className={INPUT}
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="89,95"
                  style={{ fontFamily: 'var(--font-league-spartan)' }}
                />
                <p className="text-[10px] text-[#C0C0BC] mt-1 leading-snug" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                  {priceCfg.priceHint}
                </p>
              </div>
              <div>
                <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>{priceCfg.discountLabel}</label>
                <input
                  type="text"
                  inputMode="decimal"
                  className={INPUT}
                  value={discountPrice}
                  onChange={e => setDiscountPrice(e.target.value)}
                  placeholder="69,95"
                  style={{ fontFamily: 'var(--font-league-spartan)' }}
                />
              </div>
            </div>

            {/* Live breakdown */}
            {validPrice && grossPrice !== null && netPrice !== null && vatAmount !== null && (
              <div className="grid grid-cols-3 gap-px overflow-hidden border border-[#F0F0EB] bg-[#F0F0EB]">
                {([
                  { label: 'Netto',          value: netPrice,   color: '#2D2D2D' },
                  { label: 'MwSt. 19 %',     value: vatAmount,  color: '#2D2D2D' },
                  { label: 'Endkundenpreis', value: grossPrice, color: '#370E4D' },
                ] as { label: string; value: number; color: string }[]).map(({ label, value, color }) => (
                  <div key={label} className="bg-[#FAFAF8] px-4 py-3">
                    <p className="text-[9px] uppercase tracking-[0.12em] text-[#9B9B9B] mb-1"
                      style={{ fontFamily: 'var(--font-league-spartan)' }}>
                      {label}
                    </p>
                    <p className="text-[14px] font-semibold tabular-nums"
                      style={{ fontFamily: 'var(--font-league-spartan)', color }}>
                      {fmtEur(value)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {err && <p className="text-[11px] text-[#8B1E3F]" style={{ fontFamily: 'var(--font-league-spartan)' }}>{err}</p>}

            <div className="flex items-center justify-between pt-2">
              <button onClick={() => { setErr(null); setStep(2) }} className={BTN_GHOST} style={{ fontFamily: 'var(--font-league-spartan)' }}>
                ← Zurück
              </button>
              <button
                onClick={() => { setErr(null); if (validateStep3()) { setErr(null); setStep(4) } }}
                className={BTN_PRIMARY}
                style={{ background: '#370E4D', fontFamily: 'var(--font-league-spartan)' }}
              >
                Weiter: Look →
              </button>
            </div>
          </div>
        </SectionCard>
      )}

      {/* ── Step 4: Complete the look (optional) ── */}
      {step === 4 && (
        <SectionCard title="Vervollständige den Look">
          <div className="p-6 space-y-4">
            <LookPicker
              enabled={lookEnabled}
              onEnabledChange={setLookEnabled}
              selected={lookSelected}
              onToggle={id => setLookSelected(prev => toggleLookSelection(prev, id))}
              onCandidatesLoaded={setLookNames}
            />

            <div className="flex items-center justify-between pt-2">
              <button onClick={() => { setErr(null); setStep(3) }} className={BTN_GHOST} style={{ fontFamily: 'var(--font-league-spartan)' }}>
                ← Zurück
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setErr(null); setLookEnabled(false); setLookSelected([]); setStep(5) }}
                  className={BTN_GHOST}
                  style={{ fontFamily: 'var(--font-league-spartan)' }}
                >
                  Überspringen
                </button>
                <button
                  onClick={() => { setErr(null); setStep(5) }}
                  className={BTN_PRIMARY}
                  style={{ background: '#370E4D', fontFamily: 'var(--font-league-spartan)' }}
                >
                  Weiter →
                </button>
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* ── Step 5: Review ── */}
      {step === 5 && (
        <SectionCard title="Überprüfung">
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Name',          value: data.name },
                { label: 'Kategorie',     value: data.category },
                { label: 'Geschlecht',    value: data.gender },
                { label: 'Produkttyp',    value: data.productType },
                { label: 'Material',      value: data.material },
                { label: 'Herkunftsland', value: data.originCountry },
                { label: 'Pflegehinweise', value: data.careInstructions },
                { label: 'Kollektion',    value: data.collectionName || '—' },
                { label: 'Rückgabefrist', value: `${data.returnPeriodDays} Tage` },
                { label: 'Varianten',     value: `${variants.length} Stk. · ${totalStock} Stk. Bestand gesamt` },
                { label: `Preis (${LISTING_REGIONS.find(r => r.id === region)?.label ?? region})`,
                  value: grossPrice !== null
                    ? (() => {
                        const dpRaw = discountPrice ? parseFloat(discountPrice.replace(',', '.')) : null
                        const dpGross = dpRaw !== null && !isNaN(dpRaw)
                          ? (priceMode === 'NET' ? round2(dpRaw * 1.19) : dpRaw)
                          : null
                        return `${fmtEur(grossPrice)} brutto${dpGross !== null ? ` · Sale ${fmtEur(dpGross)}` : ''}`
                      })()
                    : '—' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] uppercase tracking-[0.1em] text-[#9B9B9B]" style={{ fontFamily: 'var(--font-league-spartan)' }}>{label}</p>
                  <p className="text-[13px] text-[#2D2D2D] mt-0.5" style={{ fontFamily: 'var(--font-league-spartan)' }}>{value}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.1em] text-[#9B9B9B] mb-2" style={{ fontFamily: 'var(--font-league-spartan)' }}>Vervollständige den Look</p>
              <p className="text-[13px] text-[#2D2D2D]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                {lookEnabled && lookSelected.length > 0
                  ? lookSelected.map(id => lookNames[id] ?? id).join(' · ')
                  : 'Übersprungen — die Produktseite zeigt automatisch Produkte aus derselben Kategorie.'}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.1em] text-[#9B9B9B] mb-2" style={{ fontFamily: 'var(--font-league-spartan)' }}>Katalog-Kategorien</p>
              <div className="flex flex-wrap gap-1.5">
                {data.catalogueCategory.map(c => (
                  <span key={c} className="px-3 py-1 bg-[#370E4D] text-white text-[10px] rounded-full uppercase tracking-[0.06em]"
                    style={{ fontFamily: 'var(--font-league-spartan)' }}>{c}</span>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-none bg-amber-50 border border-amber-200 text-[11px] text-amber-800" style={{ fontFamily: 'var(--font-league-spartan)' }}>
              Das Produkt wird nach der Erstellung zur Überprüfung eingereicht und muss vom Enunas-Team genehmigt werden.
            </div>

            {err && <p className="text-[11px] text-[#8B1E3F]" style={{ fontFamily: 'var(--font-league-spartan)' }}>{err}</p>}

            <div className="flex items-center justify-between pt-2">
              <button onClick={() => { setErr(null); setStep(4) }} className={BTN_GHOST} style={{ fontFamily: 'var(--font-league-spartan)' }}>
                ← Zurück
              </button>
              <button
                onClick={submit}
                disabled={submitting}
                className={BTN_PRIMARY}
                style={{ background: '#370E4D', fontFamily: 'var(--font-league-spartan)' }}
              >
                <Package className="w-3.5 h-3.5" />
                {submitting ? 'Wird erstellt…' : 'Produkt erstellen'}
              </button>
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  )
}

// ─── Main Products component ─────────────────────────────────────────────────
type View = 'list' | 'create' | 'edit' | 'variants'

export default function Products() {
  const [products, setProducts] = useState<AdminApiProduct[]>([])
  const [loading, setLoading]   = useState(true)
  const [view, setView]         = useState<View>('list')
  const [selected, setSelected]     = useState<AdminApiProduct | null>(null)
  const [filter, setFilter]         = useState('ALL')
  const [search, setSearch]         = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleting, setDeleting]     = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  // `remedies` comes from the backend error code, not from the message — it decides which ways
  // out are actually offered, so the UI never suggests a step the backend has already ruled out.
  const [deleteError, setDeleteError] =
    useState<{ id: string; message: string; remedies: ErrorRemedy[] } | null>(null)
  const [archiving, setArchiving] = useState<string | null>(null)
  const [clearingListings, setClearingListings] = useState<string | null>(null)
  // productId → Brutto-Preise der Listings (ProductResponseDto trägt keinen Preis;
  // Preise leben auf Listings — niemals € 0,00 anzeigen)
  const [priceMap, setPriceMap] = useState<Record<string, number[]>>({})

  useEffect(() => {
    brandApi.products.getMy()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (products.length === 0) return
    let alive = true
    Promise.all(products.map(p =>
      brandApi.listings.list(p.id)
        .then(ls => [p.id, ls.map(l => l.priceGross ?? l.price).filter((v): v is number => v != null && v > 0)] as const)
        .catch(() => [p.id, [] as number[]] as const)
    )).then(entries => { if (alive) setPriceMap(Object.fromEntries(entries)) })
    return () => { alive = false }
  }, [products])

  function PriceCell({ productId }: { productId: string }) {
    const prices = priceMap[productId]
    if (!prices) return <span className="text-[12px] text-[#C0C0BC]">…</span>
    const distinct = [...new Set(prices)]
    if (distinct.length === 0) {
      return (
        <span className="text-[11px] italic text-[#9B9B9B]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
          Kein Preis gesetzt
        </span>
      )
    }
    const min = Math.min(...distinct)
    return (
      <span className="font-semibold text-[#0A0A0A]">
        {distinct.length > 1 ? `ab ${fmtEur(min)}` : fmtEur(min)}
      </span>
    )
  }

  function reload() {
    setLoading(true)
    brandApi.products.getMy()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }

  async function deleteProduct(id: string) {
    setDeleting(id)
    setDeleteError(null)
    try {
      await brandApi.products.delete(id)
      setProducts(prev => prev.filter(p => p.id !== id))
      setConfirmDelete(null)
    } catch (err) {
      // Branch on the stable `code`, never on the message — that text is English human copy and
      // is reworded over time. An error with no code, or one we don't recognise yet, simply
      // offers no remedy rather than guessing at one.
      setDeleteError({
        id,
        message: err instanceof FetchError ? err.message : 'Produkt konnte nicht gelöscht werden.',
        remedies: err instanceof FetchError ? errorRemedies(err.code) : [],
      })
    } finally {
      setDeleting(null)
    }
  }

  // PRODUCT_HAS_LISTINGS is the one recoverable delete failure: clear the listings, then retry
  // the delete in the same click so the brand doesn't have to walk into the detail view.
  async function clearListingsAndRetryDelete(id: string) {
    setClearingListings(id)
    setDeleteError(null)
    try {
      const listings = await brandApi.listings.list(id)
      for (const l of listings) {
        await brandApi.listings.delete(id, String(l.id))
      }
      await brandApi.products.delete(id)
      setProducts(prev => prev.filter(p => p.id !== id))
      setConfirmDelete(null)
    } catch (err) {
      setDeleteError({
        id,
        message: err instanceof FetchError ? err.message : 'Produkt konnte nicht gelöscht werden.',
        remedies: err instanceof FetchError ? errorRemedies(err.code) : [],
      })
    } finally {
      setClearingListings(null)
    }
  }

  async function archiveProduct(id: string) {
    setArchiving(id)
    try {
      const updated = await brandApi.products.update(id, { status: 'ARCHIVED' })
      setProducts(prev => prev.map(p => (p.id === id ? updated : p)))
      setDeleteError(null)
      setConfirmDelete(null)
    } catch (err) {
      setDeleteError({
        id,
        message: err instanceof FetchError ? err.message : 'Produkt konnte nicht archiviert werden.',
        remedies: err instanceof FetchError ? errorRemedies(err.code) : [],
      })
    } finally {
      setArchiving(null)
    }
  }

  const filtered = products.filter(p => {
    const matchStatus = filter === 'ALL' || p.status === filter
    const q = search.toLowerCase()
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  if (loading) return <Loader />

  if (view === 'create') {
    return (
      <CreateWizard
        onBack={() => setView('list')}
        onCreated={(p) => {
          setProducts(prev => [p, ...prev])
          setSelected(p)
          setView('edit')
          // silent reload to pick up server-generated fields (SKU, etc.)
          brandApi.products.getMy().then(setProducts).catch(() => {})
        }}
      />
    )
  }

  if (view === 'edit' && selected) {
    return (
      <EditPanel
        product={selected}
        onBack={() => { setView('list'); setSelected(null) }}
        onSaved={(updated) => {
          setProducts(prev => prev.map(p => p.id === updated.id ? updated : p))
          setSelected(updated)
        }}
        onImagesChanged={(imageUrls) => {
          setProducts(prev => prev.map(p => p.id === selected.id ? { ...p, images: imageUrls } : p))
          setSelected(prev => prev ? { ...prev, images: imageUrls } : prev)
        }}
      />
    )
  }

  if (view === 'variants' && selected) {
    return (
      <VariantsPanel
        product={selected}
        onBack={() => { setView('list'); setSelected(null) }}
      />
    )
  }

  return (
    <div className="space-y-5">
      <VPageHeader
        eyebrow="Brand Portal"
        title="Produkt"
        italicTitle="verwaltung."
        sub="Eigene Produkte erstellen, bearbeiten und Listings verwalten."
        actions={
          <button
            onClick={() => setView('create')}
            className={BTN_PRIMARY}
            style={{ background: '#370E4D', fontFamily: 'var(--font-league-spartan)' }}
          >
            <Plus className="w-3.5 h-3.5" /> Neues Produkt
          </button>
        }
      />

      {/* Filter + search */}
      <div className="flex items-center gap-3">
        <FilterBar options={STATUS_FILTERS} value={filter} onChange={setFilter} />
        <div className="w-56">
          <SearchInput value={search} onChange={setSearch} placeholder="Suche nach Produkten…" />
        </div>
      </div>

      <SectionCard title="Produkte" count={filtered.length}>
        {filtered.length === 0 ? (
          <EmptyState message={search ? 'Keine Produkte gefunden.' : 'Noch keine Produkte erstellt.'} />
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <TH>Produkt</TH>
                <TH>Kategorie</TH>
                <TH>Preis</TH>
                <TH>Status</TH>
                <TH>Erstellt</TH>
                <TH>Aktionen</TH>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <Fragment key={p.id}>
                  <TableRow>
                    <TD>
                      <div className="flex items-center gap-3">
                        {p.images?.[0] ? (
                          <img
                            src={typeof p.images[0] === 'string' ? p.images[0] : (p.images[0] as { imageUrl?: string }).imageUrl}
                            alt="" className="w-8 h-10 object-cover rounded bg-[#F5F5F0] shrink-0" />
                        ) : (
                          <div className="w-8 h-10 bg-[#F5F5F0] rounded shrink-0 flex items-center justify-center">
                            <Package className="w-3.5 h-3.5 text-[#C0C0BC]" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-[#0A0A0A] text-[13px]" style={{ fontFamily: 'var(--font-league-spartan)' }}>{p.name}</p>
                          <p className="text-[10px] text-[#9B9B9B] font-mono mt-0.5">{p.sku ?? '—'}</p>
                        </div>
                      </div>
                    </TD>
                    <TD className="text-[#6B6B6B] capitalize">{p.category?.toLowerCase()}</TD>
                    <TD><PriceCell productId={p.id} /></TD>
                    <TD><StatusBadge status={p.status} /></TD>
                    <TD className="text-[#9B9B9B]">{fmt(p.createdAt)}</TD>
                    <TD>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setSelected(p); setView('edit') }}
                          className="h-7 px-2.5 rounded-none border border-[#E8E8E8] text-[11px] text-[#6B6B6B] hover:border-[#370E4D]/40 hover:text-[#370E4D] transition-all duration-150 flex items-center gap-1"
                          style={{ fontFamily: 'var(--font-league-spartan)' }}
                        >
                          <Edit2 className="w-3 h-3" /> Bearbeiten
                        </button>
                        <button
                          onClick={() => { setSelected(p); setView('variants') }}
                          className="h-7 px-2.5 rounded-none border border-[#E8E8E8] text-[11px] text-[#6B6B6B] hover:border-[#370E4D]/40 hover:text-[#370E4D] transition-all duration-150"
                          style={{ fontFamily: 'var(--font-league-spartan)' }}
                        >
                          Varianten
                        </button>
                        <button
                          onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                          className="h-7 w-7 rounded-none border border-[#E8E8E8] flex items-center justify-center text-[#9B9B9B] hover:border-[#E8E8E8] hover:text-[#6B6B6B] transition-all duration-150"
                        >
                          {expandedId === p.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        {confirmDelete === p.id ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => deleteProduct(p.id)}
                                disabled={deleting === p.id}
                                className="h-7 px-2.5 rounded-none bg-rose-50 border border-rose-200 text-[11px] text-rose-700 hover:bg-rose-100 transition-all duration-150"
                                style={{ fontFamily: 'var(--font-league-spartan)' }}
                              >
                                {deleting === p.id ? '…' : 'Löschen bestätigen'}
                              </button>
                              {deleteError?.id === p.id && deleteError.remedies.includes('delete-listings') && (
                                <button
                                  onClick={() => clearListingsAndRetryDelete(p.id)}
                                  disabled={clearingListings === p.id}
                                  className="h-7 px-2.5 rounded-none border border-[#E8E8E8] text-[11px] text-[#6B6B6B] hover:border-[#370E4D]/40 hover:text-[#370E4D] transition-all duration-150"
                                  style={{ fontFamily: 'var(--font-league-spartan)' }}
                                >
                                  {clearingListings === p.id ? '…' : 'Listings löschen & erneut versuchen'}
                                </button>
                              )}
                              {deleteError?.id === p.id && deleteError.remedies.includes('archive') && (
                                <button
                                  onClick={() => archiveProduct(p.id)}
                                  disabled={archiving === p.id}
                                  className="h-7 px-2.5 rounded-none border border-[#E8E8E8] text-[11px] text-[#6B6B6B] hover:border-[#370E4D]/40 hover:text-[#370E4D] transition-all duration-150"
                                  style={{ fontFamily: 'var(--font-league-spartan)' }}
                                >
                                  {archiving === p.id ? '…' : 'Stattdessen archivieren'}
                                </button>
                              )}
                              <button
                                onClick={() => { setConfirmDelete(null); setDeleteError(null) }}
                                className="h-7 w-7 rounded-none border border-[#E8E8E8] flex items-center justify-center text-[#9B9B9B] hover:text-[#6B6B6B]"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {deleteError?.id === p.id && (
                              <p
                                className="max-w-[420px] text-[11px] leading-snug text-rose-700"
                                style={{ fontFamily: 'var(--font-league-spartan)' }}
                              >
                                {deleteError.message}
                              </p>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(p.id)}
                            className="h-7 w-7 rounded-none border border-[#E8E8E8] flex items-center justify-center text-[#C0C0BC] hover:border-rose-200 hover:text-rose-500 hover:bg-rose-50 transition-all duration-150"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </TD>
                  </TableRow>
                  {/* Expanded row */}
                  {expandedId === p.id && (
                    <tr className="bg-[#FAFAF8]">
                      <td colSpan={6} className="px-6 py-4 border-b border-[#F5F5F0]">
                        <div className="grid grid-cols-3 gap-4 text-[12px]">
                          {[
                            { label: 'Beschreibung', value: p.description || '—' },
                            { label: 'Material', value: (p as AdminApiProduct & { material?: string }).material || '—' },
                            { label: 'Herkunft', value: (p as AdminApiProduct & { originCountry?: string }).originCountry || '—' },
                          ].map(({ label, value }) => (
                            <div key={label}>
                              <p className="text-[9px] uppercase tracking-[0.1em] text-[#9B9B9B] mb-0.5" style={{ fontFamily: 'var(--font-league-spartan)' }}>{label}</p>
                              <p className="text-[#2D2D2D]" style={{ fontFamily: 'var(--font-league-spartan)' }}>{value}</p>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </SectionCard>

      {/* Summary bar */}
      <div className="flex items-center gap-4 text-[11px] text-[#9B9B9B]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
        <span>{products.length} Produkte gesamt</span>
        <span>·</span>
        <span className="text-[#1A5A3C]">{products.filter(p => isProductLive(p.status)).length} genehmigt</span>
        <span>·</span>
        <span className="text-[#7A5C1E]">{products.filter(p => p.status === 'PENDING').length} ausstehend</span>
        <span>·</span>
        <span className="text-[#8B1E3F]">{products.filter(p => p.status === 'REJECTED').length} abgelehnt</span>
        <button onClick={reload} className="ml-auto text-[#370E4D] hover:underline">Aktualisieren</button>
      </div>
    </div>
  )
}
