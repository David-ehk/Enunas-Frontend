'use client'

import { useState } from 'react'
import { brandApi } from '@/lib/api/modules/brandApi'
import type { ApiListing } from '@/types/api'
import { shopState, listingsToSwitch } from '@/lib/shopVisibility'

const FONT = { fontFamily: 'var(--font-league-spartan)' }

/** "Im Shop" on/off for one released, approved product. Taking it out asks first. */
export default function ShopSwitch({
  productId, listings, onListingsChange,
}: {
  productId: string
  listings: ApiListing[]
  onListingsChange: (listings: ApiListing[]) => void
}) {
  const [confirming, setConfirming] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const state = shopState(listings)
  if (state === 'no-listing') return null
  const on = state === 'active'

  async function switchTo(active: boolean) {
    setSaving(true)
    setError(null)
    setConfirming(false)
    try {
      for (const l of listingsToSwitch(listings, active)) {
        await brandApi.listings.update(productId, String(l.id), { active })
      }
    } catch {
      setError('Umschalten fehlgeschlagen. Bitte erneut versuchen.')
    }
    // Show what the backend really has now — a failure can leave only some listings switched.
    try {
      onListingsChange(await brandApi.listings.list(productId))
    } catch {
      setError('Status konnte nicht geladen werden. Bitte Seite neu laden.')
    }
    setSaving(false)
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label="Im Shop sichtbar"
        disabled={saving}
        onClick={() => (on ? setConfirming(c => !c) : switchTo(true))}
        className="flex items-center gap-2 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#370E4D]"
      >
        <span className={`relative block h-[18px] w-[32px] rounded-full transition-colors duration-200 ${on ? 'bg-[#1A5A3C]' : 'bg-[#C0C0BC]'}`}>
          <span className={`absolute left-[2px] top-[2px] block h-[14px] w-[14px] rounded-full bg-white transition-transform duration-200 ease-out-expo ${on ? 'translate-x-[14px]' : ''}`} />
        </span>
        <span className="text-[11px] text-[#2D2D2D]" style={FONT}>
          {saving ? 'Speichert…' : on ? 'Im Shop' : 'Nicht im Shop'}
        </span>
      </button>
      {confirming && (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => switchTo(false)}
            className="h-7 px-2.5 border border-[#8B1E3F]/40 bg-rose-50 text-[11px] text-[#8B1E3F]"
            style={FONT}
          >
            Aus dem Shop nehmen
          </button>
          <button type="button" onClick={() => setConfirming(false)} className="text-[11px] text-[#6B6B6B] hover:underline" style={FONT}>
            Abbrechen
          </button>
        </div>
      )}
      {error && <p role="alert" className="max-w-[200px] text-[11px] leading-snug text-[#8B1E3F]" style={FONT}>{error}</p>}
    </div>
  )
}
