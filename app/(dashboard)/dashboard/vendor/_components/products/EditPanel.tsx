'use client'

import { useState } from 'react'
import { brandApi } from '@/lib/api/modules/brandApi'
import type { AdminApiProduct } from '@/types/api'
import { SectionCard } from '../../../admin/_components/shared'
import { ChevronLeft, Edit2, Check } from 'lucide-react'
import { INPUT, LABEL, BTN_PRIMARY, BTN_GHOST } from './constants'
import ImagesSection from './ImagesSection'
import ListingsSection from './ListingsSection'
import CompleteTheLookSection from './CompleteTheLookSection'

export default function EditPanel({
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
