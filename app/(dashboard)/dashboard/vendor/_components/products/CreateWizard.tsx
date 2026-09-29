'use client'

import { useState } from 'react'
import { brandApi } from '@/lib/api/modules/brandApi'
import type { CreateProductDto, CreateListingDto } from '@/lib/api/modules/brandApi'
import type { AdminApiProduct, PriceInputMode } from '@/types/api'
import { SectionCard, fmtEur } from '../../../admin/_components/shared'
import { Plus, Check, ChevronLeft, Package, ImagePlus, X } from 'lucide-react'
import {
  CATALOGUE_OPTS, GENDERS, PRODUCT_TYPES, SIZES, COLORS, COLOR_LABELS, COLOR_SWATCHES,
  INPUT, LABEL, BTN_PRIMARY, BTN_GHOST, LISTING_REGIONS, round2, PRICE_MODE_CONFIG,
  EMPTY_WIZARD, type WizardData, type VariantRow, type WizardStep,
} from './constants'
import { LookPicker, toggleLookSelection } from './LookPicker'

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

export default function CreateWizard({ onBack, onCreated }: { onBack: () => void; onCreated: (p: AdminApiProduct) => void }) {
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

