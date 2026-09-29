'use client'

import { useState, useEffect } from 'react'
import { brandApi } from '@/lib/api/modules/brandApi'
import type { AdminApiProduct } from '@/types/api'
import { EmptyState, Loader } from '../../../admin/_components/shared'
import { Check } from 'lucide-react'
import { INPUT } from './constants'

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
export function toggleLookSelection(prev: string[], id: string): string[] {
  if (prev.includes(id)) return prev.filter(x => x !== id)
  if (prev.length >= MAX_LOOK_PRODUCTS) return prev
  return [...prev, id]
}

// Shared by the edit panel and the create wizard's Look step, so a look is curated the same way
// wherever you start from. `excludeProductId` is omitted during creation — the product does not
// exist yet, so there is nothing to filter out of its own candidate list.
export function LookPicker({
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
