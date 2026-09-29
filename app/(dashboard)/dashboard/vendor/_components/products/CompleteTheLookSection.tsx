'use client'

import { useState } from 'react'
import { brandApi } from '@/lib/api/modules/brandApi'
import { FetchError } from '@/lib/api'
import type { AdminApiProduct } from '@/types/api'
import { SectionCard } from '../../../admin/_components/shared'
import { Check } from 'lucide-react'
import { BTN_PRIMARY } from './constants'
import { LookPicker, toggleLookSelection } from './LookPicker'

export default function CompleteTheLookSection({
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
