'use client'

import { useState, useEffect } from 'react'
import { brandApi } from '@/lib/api/modules/brandApi'
import type { CreateListingDto, UpdateListingDto } from '@/lib/api/modules/brandApi'
import type { AdminApiProduct, AdminApiVariant, ApiListing, PriceInputMode } from '@/types/api'
import { SectionCard, Loader, fmtEur } from '../../../admin/_components/shared'
import { Plus, Trash2, Edit2, X } from 'lucide-react'
import { INPUT, LABEL, BTN_PRIMARY, BTN_GHOST, LISTING_REGIONS, round2, PRICE_MODE_CONFIG } from './constants'

export default function ListingsSection({ product }: { product: AdminApiProduct }) {
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

