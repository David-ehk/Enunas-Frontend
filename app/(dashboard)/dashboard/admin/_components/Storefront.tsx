'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { getCuration, saveCuration, type CurationData, type Segment } from '@/lib/curation'
import type { AdminApiProduct } from '@/types/api'
import { GripVertical, X, Plus, Check, Save, Trash2 } from 'lucide-react'
import { PageHeader, SearchInput, SelectFilter } from './shared'

type SectionTab = 'trendy' | 'drops' | 'recommendations'
type DragState =
  | { type: 'left'; id: string }
  | { type: 'right'; id: string; from: number }

const SECTION_TABS: { id: SectionTab; label: string }[] = [
  { id: 'trendy',          label: 'Trendy' },
  { id: 'drops',           label: 'Drops' },
  { id: 'recommendations', label: 'Empfehlungen' },
]

const SEGMENTS: { id: Segment; label: string; desc: string }[] = [
  { id: 'streetwear',    label: 'Streetwear',    desc: 'Kunden mit höchstem Streetwear-Spend' },
  { id: 'cultural',      label: 'Cultural',      desc: 'Kunden mit höchstem Cultural-Spend' },
  { id: 'athleisure',    label: 'Athleisure',    desc: 'Kunden mit höchstem Athleisure-Spend' },
  { id: 'experimental',  label: 'Experimental',  desc: 'Kunden mit höchstem Experimental-Spend' },
  { id: 'star',          label: 'Star',          desc: 'Top-Käufer — höchster Gesamt-Spend' },
]

function getIds(c: CurationData, section: SectionTab, seg: Segment): string[] {
  if (section === 'trendy') return c.trendy
  if (section === 'drops')  return c.drops
  return c.recommendations[seg] ?? []
}

function setIds(c: CurationData, section: SectionTab, seg: Segment, ids: string[]): CurationData {
  if (section === 'trendy') return { ...c, trendy: ids }
  if (section === 'drops')  return { ...c, drops: ids }
  return { ...c, recommendations: { ...c.recommendations, [seg]: ids } }
}

function getCats(p: AdminApiProduct): string[] {
  if (!p.catalogueCategory) return []
  return Array.isArray(p.catalogueCategory) ? p.catalogueCategory : [p.catalogueCategory]
}

function AvailableCard({ product, isDragOver, onAdd, onDragStart }: {
  product: AdminApiProduct
  isDragOver?: boolean
  onAdd: () => void
  onDragStart: (e: React.DragEvent) => void
}) {
  const img = product.images?.[0]
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onAdd}
      className="group flex items-center gap-3 px-3 py-2 rounded-lg cursor-grab active:cursor-grabbing transition-all duration-150"
      style={{ background: isDragOver ? '#F0F0EB' : 'transparent' }}
      onMouseEnter={e => { e.currentTarget.style.background = '#F5F5F0' }}
      onMouseLeave={e => { e.currentTarget.style.background = isDragOver ? '#F0F0EB' : 'transparent' }}
    >
      <div className="w-10 h-10 rounded-lg bg-[#F0F0EB] flex-shrink-0 overflow-hidden">
        {img
          ? <img src={img} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold text-[#0A0A0A] truncate leading-tight"
          style={{ fontFamily: 'var(--font-league-spartan)' }}>
          {product.name}
        </p>
        <p className="text-[10px] text-[#9B9B9B] truncate mt-0.5"
          style={{ fontFamily: 'var(--font-league-spartan)' }}>
          {product.brandName}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] text-[#6B6B6B] tabular-nums"
          style={{ fontFamily: 'var(--font-league-spartan)' }}>
          €{Math.round(product.price ?? 0)}
        </span>
        <div className="w-5 h-5 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          style={{ background: '#370E4D' }}>
          <Plus className="w-3 h-3 text-white" />
        </div>
      </div>
    </div>
  )
}

function SelectedCard({ product, index, isDragOver, isAboveFold, onRemove, onDragStart, onDragOver, onDrop }: {
  product: AdminApiProduct | undefined
  index: number
  isDragOver: boolean
  isAboveFold: boolean
  onRemove: () => void
  onDragStart: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
}) {
  const img = product?.images?.[0]
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg border transition-all duration-100 cursor-grab active:cursor-grabbing"
      style={{
        borderColor: isDragOver ? '#370E4D' : isAboveFold ? '#370E4D' : '#E8E8E8',
        borderTopWidth: isDragOver ? 2 : 1,
        borderLeftWidth: isAboveFold ? 3 : 1,
        background: isAboveFold ? 'rgba(55,14,77,0.025)' : 'white',
      }}
    >
      <span
        className="text-[9px] font-bold w-4 text-center shrink-0 tabular-nums"
        style={{ fontFamily: 'var(--font-league-spartan)', color: isAboveFold ? '#370E4D' : '#CDCDCD' }}
      >
        {index + 1}
      </span>
      <GripVertical className="w-3 h-3 text-[#D4D4D4] shrink-0" />
      <div className="w-8 h-8 rounded-md bg-[#F0F0EB] flex-shrink-0 overflow-hidden">
        {img
          ? <img src={img} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold text-[#0A0A0A] truncate leading-tight"
          style={{ fontFamily: 'var(--font-league-spartan)' }}>
          {product?.name ?? '—'}
        </p>
        <p className="text-[10px] text-[#9B9B9B] truncate mt-0.5"
          style={{ fontFamily: 'var(--font-league-spartan)' }}>
          {product?.brandName}
        </p>
      </div>
      <button
        onClick={onRemove}
        className="w-5 h-5 rounded flex items-center justify-center transition-colors duration-150 shrink-0 hover:bg-rose-50 group/rm"
      >
        <X className="w-3 h-3 text-[#CDCDCD] group-hover/rm:text-rose-400 transition-colors" />
      </button>
    </div>
  )
}

function DropZoneEmpty() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 text-center px-4">
      <div className="w-10 h-10 rounded-xl border-2 border-dashed border-[#E8E8E8] flex items-center justify-center mb-3">
        <Plus className="w-4 h-4 text-[#CDCDCD]" />
      </div>
      <p className="text-[11px] text-[#9B9B9B]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
        Produkte hierher ziehen oder links anklicken
      </p>
    </div>
  )
}

export default function Storefront({ products }: { products: AdminApiProduct[] }) {
  const [curation, setCuration] = useState<CurationData>(() => getCuration())
  const [section, setSection]   = useState<SectionTab>('trendy')
  const [segment, setSegment]   = useState<Segment>('streetwear')
  const [search, setSearch]     = useState('')
  const [brandFilter, setBrand] = useState('all')
  const [catFilter, setCat]     = useState('all')
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [dropZoneActive, setDropZoneActive] = useState(false)
  const [saved, setSaved] = useState(false)
  const dragRef = useRef<DragState | null>(null)

  useEffect(() => {
    setSearch(''); setBrand('all'); setCat('all')
  }, [section])

  const approved = useMemo(() => products.filter(p => p.status === 'APPROVED'), [products])

  const selectedIds = useMemo(() => getIds(curation, section, segment), [curation, section, segment])

  const selectedProducts = useMemo(() =>
    selectedIds.map(id => approved.find(p => p.id === id)).filter((p): p is AdminApiProduct => !!p),
    [selectedIds, approved]
  )

  const available = useMemo(() => {
    const sel = new Set(selectedIds)
    return approved.filter(p => {
      if (sel.has(p.id)) return false
      if (search) {
        const q = search.toLowerCase()
        if (!p.name.toLowerCase().includes(q) && !p.brandName?.toLowerCase().includes(q)) return false
      }
      if (brandFilter !== 'all' && p.brandName !== brandFilter) return false
      if (catFilter !== 'all' && !getCats(p).includes(catFilter)) return false
      return true
    })
  }, [approved, selectedIds, search, brandFilter, catFilter])

  const brandOptions = useMemo(() => {
    const set = new Set(approved.map(p => p.brandName).filter(Boolean))
    return [{ value: 'all', label: 'Alle Marken' }, ...Array.from(set).sort().map(b => ({ value: b, label: b }))]
  }, [approved])

  const catOptions = useMemo(() => {
    const set = new Set<string>()
    approved.forEach(p => getCats(p).forEach(c => set.add(c)))
    return [{ value: 'all', label: 'Alle Kategorien' }, ...Array.from(set).sort().map(c => ({ value: c, label: c }))]
  }, [approved])

  function add(id: string) {
    const cur = getIds(curation, section, segment)
    if (cur.includes(id)) return
    setCuration(c => setIds(c, section, segment, [...cur, id]))
  }

  function remove(index: number) {
    const cur = getIds(curation, section, segment)
    const next = [...cur]; next.splice(index, 1)
    setCuration(c => setIds(c, section, segment, next))
  }

  function clearAll() { setCuration(c => setIds(c, section, segment, [])) }

  function save() {
    saveCuration(curation)
    setSaved(true)
    setTimeout(() => setSaved(false), 2200)
  }

  function handleLeftDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.effectAllowed = 'copy'
    dragRef.current = { type: 'left', id }
  }

  function handleRightDragStart(e: React.DragEvent, id: string, from: number) {
    e.dataTransfer.effectAllowed = 'move'
    dragRef.current = { type: 'right', id, from }
  }

  function handleItemDragOver(e: React.DragEvent, index: number) {
    e.preventDefault(); e.stopPropagation()
    setDragOverIndex(index)
  }

  function handleItemDrop(e: React.DragEvent, targetIndex: number) {
    e.preventDefault(); e.stopPropagation()
    const drag = dragRef.current
    if (!drag) return
    const cur = getIds(curation, section, segment)

    if (drag.type === 'left') {
      if (cur.includes(drag.id)) return
      const next = [...cur]; next.splice(targetIndex, 0, drag.id)
      setCuration(c => setIds(c, section, segment, next))
    } else {
      const from = drag.from
      if (from === targetIndex) return
      const next = [...cur]
      const [moved] = next.splice(from, 1)
      next.splice(from < targetIndex ? targetIndex - 1 : targetIndex, 0, moved)
      setCuration(c => setIds(c, section, segment, next))
    }
    dragRef.current = null; setDragOverIndex(null)
  }

  function handleContainerDragOver(e: React.DragEvent) {
    e.preventDefault(); setDropZoneActive(true)
  }

  function handleContainerDrop(e: React.DragEvent) {
    e.preventDefault(); setDropZoneActive(false)
    const drag = dragRef.current
    if (!drag || drag.type !== 'left') { dragRef.current = null; setDragOverIndex(null); return }
    const cur = getIds(curation, section, segment)
    if (!cur.includes(drag.id)) setCuration(c => setIds(c, section, segment, [...cur, drag.id]))
    dragRef.current = null; setDragOverIndex(null)
  }

  const currentSegment = SEGMENTS.find(s => s.id === segment)

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Schaufenster"
        title="Sortiment"
        italicTitle="kuratieren."
        noBorder
      />

      {/* Section tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ background: 'white', border: '1px solid #E8E8E8' }}>
        {SECTION_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setSection(t.id)}
            className="px-5 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200"
            style={{
              fontFamily: 'var(--font-league-spartan)',
              letterSpacing: '0.06em',
              background: section === t.id ? '#370E4D' : 'transparent',
              color: section === t.id ? '#fff' : '#6B6B6B',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Segment selector (recommendations only) */}
      {section === 'recommendations' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            {SEGMENTS.map(s => (
              <button
                key={s.id}
                onClick={() => setSegment(s.id)}
                className="px-3.5 py-1.5 rounded-lg text-[10px] font-semibold border transition-all duration-150"
                style={{
                  fontFamily: 'var(--font-league-spartan)',
                  letterSpacing: '0.08em',
                  background: segment === s.id ? '#370E4D' : 'white',
                  color: segment === s.id ? '#fff' : '#6B6B6B',
                  borderColor: segment === s.id ? '#370E4D' : '#E8E8E8',
                }}
              >
                {s.label}
                {(curation.recommendations[s.id]?.length ?? 0) > 0 && (
                  <span className="ml-1.5 tabular-nums opacity-70">
                    {curation.recommendations[s.id].length}
                  </span>
                )}
              </button>
            ))}
          </div>
          {currentSegment && (
            <p className="text-[10px] text-[#9B9B9B] uppercase tracking-[0.1em]"
              style={{ fontFamily: 'var(--font-league-spartan)' }}>
              {currentSegment.desc}
            </p>
          )}
        </div>
      )}

      {/* Two-panel layout */}
      <div className="flex gap-5" style={{ minHeight: 520 }}>

        {/* ── Left: Available products ── */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#6B6B6B]"
              style={{ fontFamily: 'var(--font-league-spartan)' }}>
              Alle Produkte
              <span className="ml-1.5 text-[#9B9B9B] font-normal">{available.length}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-[160px]">
              <SearchInput value={search} onChange={setSearch} placeholder="Name oder Marke…" />
            </div>
            <SelectFilter value={brandFilter} onChange={setBrand} options={brandOptions} />
            <SelectFilter value={catFilter}   onChange={setCat}   options={catOptions} />
          </div>

          <div className="flex-1 overflow-y-auto rounded-xl p-2"
            style={{ background: 'white', border: '1px solid #E8E8E8', maxHeight: 480 }}>
            {available.length === 0
              ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-[11px] text-[#9B9B9B]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                    Keine Produkte gefunden
                  </p>
                </div>
              )
              : (
                <div className="space-y-0.5">
                  {available.map(p => (
                    <AvailableCard
                      key={p.id}
                      product={p}
                      onAdd={() => add(p.id)}
                      onDragStart={e => handleLeftDragStart(e, p.id)}
                    />
                  ))}
                </div>
              )
            }
          </div>
        </div>

        {/* ── Right: Curated selection ── */}
        <div className="w-[300px] flex-shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between h-5">
            <p className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#6B6B6B]"
              style={{ fontFamily: 'var(--font-league-spartan)' }}>
              Kuratierte Auswahl
              <span className="ml-1.5 text-[#9B9B9B] font-normal">{selectedIds.length}</span>
            </p>
            {selectedIds.length > 0 && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-[10px] text-[#9B9B9B] hover:text-rose-500 transition-colors duration-150"
                style={{ fontFamily: 'var(--font-league-spartan)' }}
              >
                <Trash2 className="w-3 h-3" /> Alle entfernen
              </button>
            )}
          </div>

          {/* fold indicator legend */}
          <div className="h-8 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md"
              style={{ background: 'rgba(55,14,77,0.07)', border: '1px solid rgba(55,14,77,0.15)' }}>
              <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: '#370E4D' }} />
              <span className="text-[9px] font-semibold uppercase tracking-[0.1em]"
                style={{ fontFamily: 'var(--font-league-spartan)', color: '#370E4D' }}>
                Direkt sichtbar (1–4)
              </span>
            </span>
            {selectedIds.length > 4 && (
              <span className="text-[9px] text-[#9B9B9B]"
                style={{ fontFamily: 'var(--font-league-spartan)' }}>
                +{selectedIds.length - 4} auf Klick
              </span>
            )}
          </div>

          <div
            className="flex-1 overflow-y-auto rounded-xl p-2 transition-all duration-150"
            style={{
              background: dropZoneActive ? '#F8F8F5' : 'white',
              border: `1px solid ${dropZoneActive ? '#370E4D' : '#E8E8E8'}`,
              maxHeight: 480,
            }}
            onDragOver={handleContainerDragOver}
            onDragLeave={() => { setDropZoneActive(false); setDragOverIndex(null) }}
            onDrop={handleContainerDrop}
          >
            {selectedIds.length === 0
              ? <DropZoneEmpty />
              : (
                <div className="space-y-1">
                  {selectedProducts.map((p, i) => (
                    <React.Fragment key={p.id}>
                      <SelectedCard
                        product={p}
                        index={i}
                        isDragOver={dragOverIndex === i}
                        isAboveFold={i < 4}
                        onRemove={() => remove(i)}
                        onDragStart={e => handleRightDragStart(e, p.id, i)}
                        onDragOver={e => handleItemDragOver(e, i)}
                        onDrop={e => handleItemDrop(e, i)}
                      />
                      {i === 3 && selectedProducts.length > 4 && (
                        <div className="flex items-center gap-2 py-1.5 px-1">
                          <div className="flex-1 h-px" style={{ background: '#E8E8E8' }} />
                          <span className="text-[9px] uppercase tracking-[0.14em] text-[#9B9B9B] shrink-0"
                            style={{ fontFamily: 'var(--font-league-spartan)' }}>
                            nur auf "Weitere anzeigen"
                          </span>
                          <div className="flex-1 h-px" style={{ background: '#E8E8E8' }} />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )
            }
          </div>
        </div>
      </div>

      {/* Save footer */}
      <div className="flex items-center justify-end pt-2">
        <button
          onClick={save}
          className="flex items-center gap-2 h-9 px-5 rounded-xl text-[11px] font-semibold transition-all duration-200"
          style={{
            fontFamily: 'var(--font-league-spartan)',
            letterSpacing: '0.06em',
            background: saved ? '#1A5A3C' : '#370E4D',
            color: '#fff',
          }}
        >
          {saved
            ? <><Check className="w-3.5 h-3.5" /> Gespeichert</>
            : <><Save className="w-3.5 h-3.5" /> Änderungen speichern</>}
        </button>
      </div>
    </div>
  )
}
