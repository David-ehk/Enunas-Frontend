'use client'

import { useState, useEffect } from 'react'
import { brandApi } from '@/lib/api/modules/brandApi'
import type { AdminApiProduct, AdminApiVariant } from '@/types/api'
import { SectionCard, EmptyState, Loader } from '../../../admin/_components/shared'
import { ChevronLeft, Trash2, Plus } from 'lucide-react'
import { COLORS, COLOR_LABELS, COLOR_SWATCHES, SIZES, BTN_PRIMARY } from './constants'

// Existing-product variant management — add/remove/adjust stock for a product that already
// exists. Distinct from VariantCard (CreateWizard.tsx), which edits variants before the product
// is created.
export default function VariantsPanel({
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
