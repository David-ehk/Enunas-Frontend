'use client'

import { useState } from 'react'
import { brandApi } from '@/lib/api/modules/brandApi'
import type { AdminApiVariant } from '@/types/api'
import { restockUpdates } from '@/lib/shopVisibility'
import { COLOR_LABELS, BTN_PRIMARY, BTN_GHOST, LABEL } from './constants'

const FONT = { fontFamily: 'var(--font-league-spartan)' }
const FIELD = 'w-24 text-[12px] border border-[#E8E8E8] bg-white px-2.5 py-1.5 focus:outline-none focus:border-[#370E4D]/50'

/** Puts a sold-out product back in stock: a quantity per variant, or one for all of them. */
export default function RestockPanel({
  productId, variants, onVariantsChange, onClose,
}: {
  productId: string
  variants: AdminApiVariant[]
  onVariantsChange: (variants: AdminApiVariant[]) => void
  onClose: () => void
}) {
  const [quantities, setQuantities] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const updates = restockUpdates(quantities)

  function fillAll(value: string) {
    setQuantities(Object.fromEntries(variants.map(v => [v.id, value])))
  }

  async function save() {
    setSaving(true)
    setError(null)
    // Kept up to date per variant, so a failure halfway still shows what was saved.
    let current = variants
    try {
      for (const { id, stockQuantity } of updates) {
        await brandApi.variants.update(productId, id, { stockQuantity })
        current = current.map(v => (String(v.id) === id ? { ...v, stockQuantity } : v))
        onVariantsChange(current)
      }
      onClose()
    } catch {
      setError('Nicht alle Varianten konnten aufgefüllt werden. Bitte erneut versuchen.')
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className={LABEL} style={FONT} htmlFor={`restock-all-${productId}`}>Menge für alle Varianten</label>
        <input id={`restock-all-${productId}`} type="number" min={1} inputMode="numeric" className={FIELD} style={FONT}
          onChange={e => fillAll(e.target.value)} />
      </div>
      <div className="flex flex-wrap gap-4">
        {variants.map(v => {
          const name = `${v.color ? COLOR_LABELS[v.color] ?? v.color : '—'} / ${v.size ?? '—'}`
          return (
            <label key={v.id} className="block">
              <span className={LABEL} style={FONT}>{name}</span>
              <input type="number" min={1} inputMode="numeric" className={FIELD} style={FONT}
                value={quantities[v.id] ?? ''}
                onChange={e => setQuantities(q => ({ ...q, [v.id]: e.target.value }))} />
            </label>
          )
        })}
      </div>
      {error && <p role="alert" className="text-[11px] text-[#8B1E3F]" style={FONT}>{error}</p>}
      <div className="flex items-center gap-3">
        <button type="button" onClick={save} disabled={saving || updates.length === 0} className={BTN_PRIMARY} style={{ ...FONT, background: '#370E4D' }}>
          {saving ? 'Speichert…' : 'Bestand auffüllen'}
        </button>
        <button type="button" onClick={onClose} className={BTN_GHOST} style={FONT}>Abbrechen</button>
      </div>
    </div>
  )
}
