'use client'

import { useState, useEffect } from 'react'
import { brandApi } from '@/lib/api/modules/brandApi'
import type { ApiBrandPartner } from '@/types/api'
import { StatusBadge, SectionCard, fmt } from '../../admin/_components/shared'
import { Check } from 'lucide-react'

export default function SettingsTab({
  brand,
  onUpdate,
}: {
  brand: ApiBrandPartner | null
  onUpdate: (b: ApiBrandPartner) => void
}) {
  const [brandName, setBrandName] = useState(brand?.brandName ?? '')
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [error, setError]         = useState<string | null>(null)

  useEffect(() => {
    if (brand) setBrandName(brand.brandName)
  }, [brand])

  async function save() {
    if (!brandName.trim()) return
    setSaving(true)
    setError(null)
    try {
      const updated = await brandApi.updateMe({ brandName: brandName.trim() })
      onUpdate(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setError('Speichern fehlgeschlagen. Bitte erneut versuchen.')
    } finally {
      setSaving(false)
    }
  }

  const labelCls = 'text-[10px] uppercase tracking-[0.12em] text-[#6B6B6B] font-medium mb-1.5'
  const inputCls = 'w-full text-[13px] border border-[#E8E8E8] bg-white rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#370E4D]/50 focus:ring-2 focus:ring-[#370E4D]/8 transition-all duration-200'

  return (
    <div className="max-w-xl space-y-5">
      {/* Brand Profile */}
      <SectionCard title="Markenprofil">
        <div className="p-6 space-y-5">
          {/* Brand name */}
          <div>
            <p className={labelCls} style={{ fontFamily: 'var(--font-league-spartan)' }}>Markenname</p>
            <input
              type="text"
              value={brandName}
              onChange={e => setBrandName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && save()}
              className={inputCls}
              style={{ fontFamily: 'var(--font-league-spartan)' }}
            />
          </div>

          {/* Read-only fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={labelCls} style={{ fontFamily: 'var(--font-league-spartan)' }}>Status</p>
              <div className="py-1">
                {brand ? <StatusBadge status={brand.status} /> : <span className="text-[#9B9B9B] text-[12px]">—</span>}
              </div>
            </div>
            <div>
              <p className={labelCls} style={{ fontFamily: 'var(--font-league-spartan)' }}>Mitglied seit</p>
              <p className="text-[13px] text-[#2D2D2D]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                {brand?.createdAt ? fmt(brand.createdAt) : '—'}
              </p>
            </div>
          </div>

          <div>
            <p className={labelCls} style={{ fontFamily: 'var(--font-league-spartan)' }}>E-Mail (nicht änderbar)</p>
            <p className="text-[13px] text-[#6B6B6B]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
              {brand?.email ?? '—'}
            </p>
          </div>

          {error && (
            <p className="text-[11px] text-[#8B1E3F]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={save}
              disabled={saving || !brandName.trim() || brandName === brand?.brandName}
              className="flex items-center gap-2 h-9 px-5 rounded-lg text-[12px] font-medium text-white transition-all duration-200 disabled:opacity-40"
              style={{ fontFamily: 'var(--font-league-spartan)', background: '#370E4D' }}
            >
              {saving ? 'Speichert…' : saved ? <><Check className="w-3.5 h-3.5" /> Gespeichert</> : 'Speichern'}
            </button>
            {brandName !== brand?.brandName && !saving && (
              <button
                onClick={() => setBrandName(brand?.brandName ?? '')}
                className="h-9 px-4 rounded-lg text-[12px] text-[#6B6B6B] border border-[#E8E8E8] hover:bg-[#F5F5F0] transition-all duration-200"
                style={{ fontFamily: 'var(--font-league-spartan)' }}
              >
                Abbrechen
              </button>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Account info */}
      <SectionCard title="Konto-Informationen">
        <div className="p-6 space-y-3">
          <div className="flex items-start gap-3 p-3.5 rounded-lg bg-[#F5F5F0] border border-[#E8E8E8]">
            <div className="flex-1">
              <p className="text-[12px] font-medium text-[#2D2D2D]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                Produkt-Genehmigungen
              </p>
              <p className="text-[11px] text-[#6B6B6B] mt-0.5">
                Neue Produkte müssen vom Enunas-Team genehmigt werden, bevor sie im Shop erscheinen.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3.5 rounded-lg bg-[#F5F5F0] border border-[#E8E8E8]">
            <div className="flex-1">
              <p className="text-[12px] font-medium text-[#2D2D2D]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                Versandverantwortung
              </p>
              <p className="text-[11px] text-[#6B6B6B] mt-0.5">
                Du bist als Brand Partner für den Versand deiner Bestellungen verantwortlich. Halte Tracking-Informationen stets aktuell.
              </p>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
