'use client'

import { useState, useEffect, Fragment } from 'react'
import { brandApi } from '@/lib/api/modules/brandApi'
import type { CreateProductDto, CreateProductVariantDto, CreateListingDto } from '@/lib/api/modules/brandApi'
import type { AdminApiProduct, AdminApiVariant, ApiListing, ApiProductImage } from '@/types/api'
import {
  StatusBadge, SectionCard, EmptyState, Loader,
  TH, TD, TableRow, FilterBar, SearchInput, fmt, fmtEur,
} from '../../admin/_components/shared'
import {
  Plus, Trash2, ChevronLeft, Check, X, Edit2,
  Package, ChevronDown, ChevronUp, ImagePlus,
} from 'lucide-react'

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

const STATUS_FILTERS = [
  { id: 'ALL',         label: 'Alle' },
  { id: 'PENDING',     label: 'Ausstehend' },
  { id: 'APPROVED',    label: 'Genehmigt' },
  { id: 'REJECTED',    label: 'Abgelehnt' },
  { id: 'DEACTIVATED', label: 'Deaktiviert' },
]

// ─── Shared input styles ─────────────────────────────────────────────────────
const INPUT = 'w-full text-[13px] border border-[#E8E8E8] bg-white rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#370E4D]/50 focus:ring-2 focus:ring-[#370E4D]/8 transition-all duration-200 placeholder:text-[#C0C0BC]'
const LABEL = 'block text-[10px] uppercase tracking-[0.12em] text-[#6B6B6B] font-medium mb-1.5'
const BTN_PRIMARY = 'flex items-center gap-2 h-9 px-5 rounded-lg text-[12px] font-medium text-white transition-all duration-200 disabled:opacity-40'
const BTN_GHOST = 'flex items-center gap-2 h-9 px-4 rounded-lg text-[12px] text-[#6B6B6B] border border-[#E8E8E8] hover:bg-[#F5F5F0] transition-all duration-200'

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

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: 'Grunddaten' },
    { n: 2, label: 'Varianten' },
    { n: 3, label: 'Überprüfung' },
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
            <div className="w-12 h-px mx-3" style={{ background: step > n ? '#370E4D' : '#E8E8E8' }} />
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
    <div className="flex items-center gap-3 p-3.5 bg-[#F5F5F0] rounded-xl border border-[#E8E8E8]">
      <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-semibold"
        style={{ background: '#370E4D', color: '#fff', fontFamily: 'var(--font-league-spartan)' }}>
        {index + 1}
      </div>
      <div className="flex-1 grid grid-cols-4 gap-2">
        <div>
          <p className="text-[9px] uppercase tracking-[0.1em] text-[#9B9B9B] mb-1" style={{ fontFamily: 'var(--font-league-spartan)' }}>Farbe</p>
          <input
            type="text"
            value={variant.color}
            onChange={e => onChange('color', e.target.value)}
            placeholder="Schwarz"
            className="w-full text-[12px] border border-[#E8E8E8] bg-white rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#370E4D]/50"
            style={{ fontFamily: 'var(--font-league-spartan)' }}
          />
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-[0.1em] text-[#9B9B9B] mb-1" style={{ fontFamily: 'var(--font-league-spartan)' }}>Größe</p>
          <select
            value={variant.size}
            onChange={e => onChange('size', e.target.value)}
            className="w-full text-[12px] border border-[#E8E8E8] bg-white rounded-md px-2 py-1.5 focus:outline-none focus:border-[#370E4D]/50"
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
            className="w-full text-[12px] border border-[#E8E8E8] bg-white rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#370E4D]/50"
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
            className="w-full text-[12px] border border-[#E8E8E8] bg-white rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#370E4D]/50"
            style={{ fontFamily: 'var(--font-league-spartan)' }}
          />
        </div>
      </div>
      <button
        onClick={onRemove}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9B9B9B] hover:text-[#8B1E3F] hover:bg-rose-50 transition-all duration-150 shrink-0"
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
  const [variants, setVariants]   = useState<AdminApiVariant[]>([])
  const [loading, setLoading]     = useState(true)
  const [newRow, setNewRow]       = useState<VariantRow>({ color: '', size: 'M', stockQuantity: 0, weightGrams: 0 })
  const [adding, setAdding]       = useState(false)
  const [saving, setSaving]       = useState<string | null>(null)
  const [err, setErr]             = useState<string | null>(null)

  useEffect(() => {
    brandApi.variants.list(product.id)
      .then(setVariants)
      .catch(() => setVariants([]))
      .finally(() => setLoading(false))
  }, [product.id])

  async function addVariant() {
    if (!newRow.color.trim()) { setErr('Farbe ist erforderlich.'); return }
    setAdding(true); setErr(null)
    try {
      const created = await brandApi.variants.create(product.id, newRow)
      setVariants(prev => [...prev, created])
      setNewRow({ color: '', size: 'M', stockQuantity: 0, weightGrams: 0 })
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
              <div key={v.id} className="flex items-center gap-3 p-3 bg-[#FAFAF8] rounded-xl border border-[#E8E8E8]">
                <div className="flex-1 grid grid-cols-4 gap-3 text-[12px]">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.1em] text-[#9B9B9B] mb-0.5" style={{ fontFamily: 'var(--font-league-spartan)' }}>Farbe</p>
                    <p className="font-medium text-[#2D2D2D]" style={{ fontFamily: 'var(--font-league-spartan)' }}>{v.color ?? '—'}</p>
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
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#C0C0BC] hover:text-[#8B1E3F] hover:bg-rose-50 transition-all duration-150 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Add variant */}
            <div className="pt-3 border-t border-[#F0F0EB]">
              <p className="text-[11px] font-semibold text-[#0A0A0A] mb-3" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                Neue Variante hinzufügen
              </p>
              <div className="grid grid-cols-4 gap-2 mb-3">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.1em] text-[#9B9B9B] mb-1" style={{ fontFamily: 'var(--font-league-spartan)' }}>Farbe *</p>
                  <input type="text" value={newRow.color} onChange={e => setNewRow(r => ({ ...r, color: e.target.value }))}
                    placeholder="Schwarz"
                    className="w-full text-[12px] border border-[#E8E8E8] bg-white rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#370E4D]/50"
                    style={{ fontFamily: 'var(--font-league-spartan)' }}
                  />
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.1em] text-[#9B9B9B] mb-1" style={{ fontFamily: 'var(--font-league-spartan)' }}>Größe</p>
                  <select value={newRow.size} onChange={e => setNewRow(r => ({ ...r, size: e.target.value }))}
                    className="w-full text-[12px] border border-[#E8E8E8] bg-white rounded-md px-2 py-1.5 focus:outline-none"
                    style={{ fontFamily: 'var(--font-league-spartan)' }}
                  >
                    {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.1em] text-[#9B9B9B] mb-1" style={{ fontFamily: 'var(--font-league-spartan)' }}>Bestand</p>
                  <input type="number" min={0} value={newRow.stockQuantity}
                    onChange={e => setNewRow(r => ({ ...r, stockQuantity: Number(e.target.value) }))}
                    className="w-full text-[12px] border border-[#E8E8E8] bg-white rounded-md px-2.5 py-1.5 focus:outline-none"
                    style={{ fontFamily: 'var(--font-league-spartan)' }}
                  />
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.1em] text-[#9B9B9B] mb-1" style={{ fontFamily: 'var(--font-league-spartan)' }}>Gewicht (g)</p>
                  <input type="number" min={0} value={newRow.weightGrams}
                    onChange={e => setNewRow(r => ({ ...r, weightGrams: Number(e.target.value) }))}
                    className="w-full text-[12px] border border-[#E8E8E8] bg-white rounded-md px-2.5 py-1.5 focus:outline-none"
                    style={{ fontFamily: 'var(--font-league-spartan)' }}
                  />
                </div>
              </div>
              {err && <p className="text-[11px] text-[#8B1E3F] mb-2" style={{ fontFamily: 'var(--font-league-spartan)' }}>{err}</p>}
              <button
                onClick={addVariant}
                disabled={adding}
                className={BTN_PRIMARY}
                style={{ background: '#370E4D', fontFamily: 'var(--font-league-spartan)' }}
              >
                <Plus className="w-3.5 h-3.5" />
                {adding ? 'Hinzufügen…' : 'Variante hinzufügen'}
              </button>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  )
}

// ─── Images section ────────────────────────────────────────────────────────────
function ImagesSection({ product }: { product: AdminApiProduct }) {
  const [images, setImages]     = useState<ApiProductImage[]>([])
  const [loading, setLoading]   = useState(true)
  const [urlInput, setUrl]      = useState('')
  const [adding, setAdding]     = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [err, setErr]           = useState<string | null>(null)

  useEffect(() => {
    brandApi.images.list(product.id)
      .then(setImages)
      .catch(() => setImages([]))
      .finally(() => setLoading(false))
  }, [product.id])

  async function addImage() {
    if (!urlInput.trim()) { setErr('URL ist erforderlich.'); return }
    setAdding(true); setErr(null)
    try {
      const created = await brandApi.images.add(product.id, urlInput.trim())
      setImages(prev => [...prev, created])
      setUrl('')
    } catch { setErr('Bild konnte nicht hinzugefügt werden.') }
    finally { setAdding(false) }
  }

  async function deleteImage(imageId: string) {
    setDeleting(imageId)
    try {
      await brandApi.images.delete(product.id, imageId)
      setImages(prev => prev.filter(i => i.id !== imageId))
    } catch { /* silent */ }
    finally { setDeleting(null) }
  }

  return (
    <SectionCard title="Produktbilder">
      <div className="p-6">
        {loading ? <Loader /> : (
          <>
            {images.length > 0 ? (
              <div className="grid grid-cols-4 gap-3 mb-5">
                {images.map(img => (
                  <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-[3/4] bg-[#F5F5F0]">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => deleteImage(img.id)}
                      disabled={deleting === img.id}
                      className="absolute top-1.5 right-1.5 w-7 h-7 rounded-lg bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-150 hover:bg-rose-600"
                    >
                      {deleting === img.id ? <span className="text-[10px]">…</span> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-[#E8E8E8] rounded-xl p-8 text-center mb-5">
                <div className="w-11 h-11 rounded-xl bg-[#F5F5F0] flex items-center justify-center mx-auto mb-3">
                  <ImagePlus className="w-5 h-5 text-[#C0C0BC]" />
                </div>
                <p className="text-[13px] text-[#9B9B9B]" style={{ fontFamily: 'var(--font-league-spartan)' }}>Noch keine Bilder hochgeladen</p>
                <p className="text-[11px] text-[#C0C0BC] mt-1" style={{ fontFamily: 'var(--font-league-spartan)' }}>JPG, PNG bis 10 MB je Bild</p>
              </div>
            )}
            <div className="flex gap-2 items-end pt-1">
              <div className="flex-1">
                <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Bild-URL (S3)</label>
                <input
                  className={INPUT}
                  value={urlInput}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addImage()}
                  placeholder="https://s3.amazonaws.com/enunas/…"
                  style={{ fontFamily: 'var(--font-league-spartan)' }}
                />
              </div>
              <button
                onClick={addImage}
                disabled={adding || !urlInput.trim()}
                className={BTN_PRIMARY}
                style={{ background: '#370E4D', fontFamily: 'var(--font-league-spartan)' }}
              >
                <Plus className="w-3.5 h-3.5" />
                {adding ? '…' : 'Hinzufügen'}
              </button>
            </div>
            {err && <p className="text-[11px] text-[#8B1E3F] mt-2" style={{ fontFamily: 'var(--font-league-spartan)' }}>{err}</p>}
            <p className="text-[11px] text-[#C0C0BC] mt-2" style={{ fontFamily: 'var(--font-league-spartan)' }}>
              Datei in S3 hochladen, dann die URL hier eintragen.
            </p>
          </>
        )}
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

function ListingsSection({ product }: { product: AdminApiProduct }) {
  const [listings, setListings]   = useState<ApiListing[]>([])
  const [loading, setLoading]     = useState(true)
  const [price, setPrice]         = useState('')
  const [region, setRegion]       = useState('DE')
  const [adding, setAdding]       = useState(false)
  const [deleting, setDeleting]   = useState<string | null>(null)
  const [err, setErr]             = useState<string | null>(null)

  useEffect(() => {
    brandApi.listings.list(product.id)
      .then(setListings)
      .catch(() => setListings([]))
      .finally(() => setLoading(false))
  }, [product.id])

  async function addListing() {
    const p = parseFloat(price.replace(',', '.'))
    if (!price || isNaN(p) || p <= 0) { setErr('Gültigen Preis eingeben.'); return }
    setAdding(true); setErr(null)
    try {
      const dto: CreateListingDto = { price: p, currency: 'EUR', region }
      const created = await brandApi.listings.create(product.id, dto)
      setListings(prev => [...prev, created])
      setPrice('')
    } catch { setErr('Listing konnte nicht erstellt werden.') }
    finally { setAdding(false) }
  }

  async function deleteListing(listingId: string) {
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
                  <div key={l.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#FAFAF8] border border-[#E8E8E8]">
                    <div className="flex items-center gap-4">
                      <span className="text-[11px] font-medium text-[#6B6B6B] bg-[#F0F0EB] px-2.5 py-1 rounded-full"
                        style={{ fontFamily: 'var(--font-league-spartan)' }}>
                        {LISTING_REGIONS.find(r => r.id === l.region)?.label ?? l.region ?? 'Global'}
                      </span>
                      <span className="text-[15px] font-semibold text-[#0A0A0A] tabular-nums"
                        style={{ fontFamily: 'var(--font-league-spartan)' }}>
                        {fmtEur(l.price)}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteListing(l.id)}
                      disabled={deleting === l.id}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[#C0C0BC] hover:text-[#8B1E3F] hover:bg-rose-50 transition-all duration-150"
                    >
                      {deleting === l.id ? <span className="text-[10px]">…</span> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-[12px] text-[#9B9B9B] border border-dashed border-[#E8E8E8] rounded-xl"
                style={{ fontFamily: 'var(--font-league-spartan)' }}>
                Noch kein Listing — Produkt ist ohne Preis nicht kaufbar.
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#F0F0EB]">
              <div>
                <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Region</label>
                <select value={region} onChange={e => setRegion(e.target.value)}
                  className={INPUT} style={{ fontFamily: 'var(--font-league-spartan)' }}>
                  {LISTING_REGIONS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Preis (EUR)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  className={INPUT}
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addListing()}
                  placeholder="89,99"
                  style={{ fontFamily: 'var(--font-league-spartan)' }}
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={addListing}
                  disabled={adding}
                  className={BTN_PRIMARY + ' w-full justify-center'}
                  style={{ background: '#370E4D', fontFamily: 'var(--font-league-spartan)' }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  {adding ? 'Erstellen…' : 'Listing hinzufügen'}
                </button>
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
}: {
  product: AdminApiProduct
  onBack: () => void
  onSaved: (p: AdminApiProduct) => void
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

      <ImagesSection product={product} />

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
    </div>
  )
}

// ─── Create wizard ────────────────────────────────────────────────────────────
function CreateWizard({ onBack, onCreated }: { onBack: () => void; onCreated: (p: AdminApiProduct) => void }) {
  const [step, setStep]       = useState<1 | 2 | 3>(1)
  const [data, setData]       = useState<WizardData>(EMPTY_WIZARD)
  const [variants, setVariants] = useState<VariantRow[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr]         = useState<string | null>(null)

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

  function addVariantRow() {
    setVariants(v => [...v, { _key: `${Date.now()}-${Math.random().toString(36).slice(2)}`, color: '', size: 'M', stockQuantity: 1, weightGrams: 250 }])
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
    for (const v of variants) {
      if (!v.color.trim()) { setErr('Alle Varianten benötigen eine Farbe.'); return false }
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
          size: v.size,
          stockQuantity: v.stockQuantity,
          weightGrams: v.weightGrams,
        })),
        completeTheLookEnabled: false,
        completeTheLookProductIds: [],
      }
      const created = await brandApi.products.create(dto)
      onCreated(created)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Produkt konnte nicht erstellt werden.'
      setErr(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const totalStock = variants.reduce((s, v) => s + v.stockQuantity, 0)

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
                className="border-2 border-dashed border-[#E8E8E8] rounded-xl p-8 text-center"
                style={{ background: '#FAFAF8', opacity: 0.7 }}
              >
                <div className="flex justify-center gap-2.5 mb-4">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="rounded-lg bg-[#F0F0EB] border border-[#E8E8E8] flex items-center justify-center"
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
                      className="flex-1 py-2 rounded-lg border text-[11px] font-medium transition-all duration-150"
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
          <div className="p-6 space-y-3">
            <p className="text-[12px] text-[#6B6B6B]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
              Füge alle Farb- und Größenkombinationen mit Bestand und Gewicht hinzu.
            </p>

            {variants.length === 0 && (
              <div className="py-10 text-center text-[12px] text-[#9B9B9B]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                Noch keine Varianten hinzugefügt.
              </div>
            )}

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

            <button
              onClick={addVariantRow}
              className="flex items-center gap-2 w-full py-3 border-2 border-dashed border-[#E8E8E8] rounded-xl text-[12px] text-[#9B9B9B] hover:border-[#370E4D]/40 hover:text-[#370E4D] transition-all duration-200 justify-center"
              style={{ fontFamily: 'var(--font-league-spartan)' }}
            >
              <Plus className="w-3.5 h-3.5" /> Variante hinzufügen
            </button>

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
                Weiter: Überprüfung →
              </button>
            </div>
          </div>
        </SectionCard>
      )}

      {/* ── Step 3: Review ── */}
      {step === 3 && (
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
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] uppercase tracking-[0.1em] text-[#9B9B9B]" style={{ fontFamily: 'var(--font-league-spartan)' }}>{label}</p>
                  <p className="text-[13px] text-[#2D2D2D] mt-0.5" style={{ fontFamily: 'var(--font-league-spartan)' }}>{value}</p>
                </div>
              ))}
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

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800" style={{ fontFamily: 'var(--font-league-spartan)' }}>
              Das Produkt wird nach der Erstellung zur Überprüfung eingereicht und muss vom Enunas-Team genehmigt werden.
            </div>

            {err && <p className="text-[11px] text-[#8B1E3F]" style={{ fontFamily: 'var(--font-league-spartan)' }}>{err}</p>}

            <div className="flex items-center justify-between pt-2">
              <button onClick={() => { setErr(null); setStep(2) }} className={BTN_GHOST} style={{ fontFamily: 'var(--font-league-spartan)' }}>
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
  const [products, setProducts]     = useState<AdminApiProduct[]>([])
  const [loading, setLoading]       = useState(true)
  const [view, setView]             = useState<View>('list')
  const [selected, setSelected]     = useState<AdminApiProduct | null>(null)
  const [filter, setFilter]         = useState('ALL')
  const [search, setSearch]         = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleting, setDeleting]     = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => {
    brandApi.products.getMy()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  function reload() {
    setLoading(true)
    brandApi.products.getMy()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }

  async function deleteProduct(id: string) {
    setDeleting(id)
    try {
      await brandApi.products.delete(id)
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch { /* silent */ }
    finally { setDeleting(null); setConfirmDelete(null) }
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
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <FilterBar options={STATUS_FILTERS} value={filter} onChange={setFilter} />
          <div className="w-56">
            <SearchInput value={search} onChange={setSearch} placeholder="Suche nach Produkten…" />
          </div>
        </div>
        <button
          onClick={() => setView('create')}
          className={BTN_PRIMARY}
          style={{ background: '#370E4D', fontFamily: 'var(--font-league-spartan)' }}
        >
          <Plus className="w-3.5 h-3.5" /> Neues Produkt
        </button>
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
                          <img src={p.images[0]} alt="" className="w-8 h-10 object-cover rounded bg-[#F5F5F0] shrink-0" />
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
                    <TD className="font-semibold text-[#0A0A0A]">{fmtEur(p.price)}</TD>
                    <TD><StatusBadge status={p.status} /></TD>
                    <TD className="text-[#9B9B9B]">{fmt(p.createdAt)}</TD>
                    <TD>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setSelected(p); setView('edit') }}
                          className="h-7 px-2.5 rounded-lg border border-[#E8E8E8] text-[11px] text-[#6B6B6B] hover:border-[#370E4D]/40 hover:text-[#370E4D] transition-all duration-150 flex items-center gap-1"
                          style={{ fontFamily: 'var(--font-league-spartan)' }}
                        >
                          <Edit2 className="w-3 h-3" /> Bearbeiten
                        </button>
                        <button
                          onClick={() => { setSelected(p); setView('variants') }}
                          className="h-7 px-2.5 rounded-lg border border-[#E8E8E8] text-[11px] text-[#6B6B6B] hover:border-[#370E4D]/40 hover:text-[#370E4D] transition-all duration-150"
                          style={{ fontFamily: 'var(--font-league-spartan)' }}
                        >
                          Varianten
                        </button>
                        <button
                          onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                          className="h-7 w-7 rounded-lg border border-[#E8E8E8] flex items-center justify-center text-[#9B9B9B] hover:border-[#E8E8E8] hover:text-[#6B6B6B] transition-all duration-150"
                        >
                          {expandedId === p.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        {confirmDelete === p.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => deleteProduct(p.id)}
                              disabled={deleting === p.id}
                              className="h-7 px-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-700 hover:bg-rose-100 transition-all duration-150"
                              style={{ fontFamily: 'var(--font-league-spartan)' }}
                            >
                              {deleting === p.id ? '…' : 'Löschen bestätigen'}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="h-7 w-7 rounded-lg border border-[#E8E8E8] flex items-center justify-center text-[#9B9B9B] hover:text-[#6B6B6B]"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(p.id)}
                            className="h-7 w-7 rounded-lg border border-[#E8E8E8] flex items-center justify-center text-[#C0C0BC] hover:border-rose-200 hover:text-rose-500 hover:bg-rose-50 transition-all duration-150"
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
        <span className="text-[#1A5A3C]">{products.filter(p => p.status === 'APPROVED').length} genehmigt</span>
        <span>·</span>
        <span className="text-[#7A5C1E]">{products.filter(p => p.status === 'PENDING').length} ausstehend</span>
        <span>·</span>
        <span className="text-[#8B1E3F]">{products.filter(p => p.status === 'REJECTED').length} abgelehnt</span>
        <button onClick={reload} className="ml-auto text-[#370E4D] hover:underline">Aktualisieren</button>
      </div>
    </div>
  )
}
