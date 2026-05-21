'use client'

import React, { useState, useEffect } from 'react'
import { adminApi } from '@/lib/api'
import type { AdminApiProduct, AdminApiVariant } from '@/types/api'
import { SectionCard, StatusBadge, EmptyState, Loader, FilterBar, SearchInput, TH, TD, TableRow, fmt, fmtEur } from './shared'
import { Eye, EyeOff, Trash2, CheckCircle, XCircle, Flag, Pencil, Ban, RotateCcw } from 'lucide-react'

type Filter = 'all' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'DEACTIVATED'
type Queue  = 'all' | 'moderation'

interface EditDraft {
  name: string
  description: string
  category: string
  gender: string
  material: string
  careInstructions: string
  collectionName: string
  originCountry: string
  inspirationStory: string | null
  catalogueCategory: string[]
  status: string
  variantDrafts: AdminApiVariant[]
}

const CATALOGUE_CATEGORIES = ['Streetwear', 'Cultural', 'Athleisure', 'Experimental', 'Star']

const CATALOGUE_COLORS: Record<string, { activeBg: string; activeText: string; idleBg: string; idleText: string; idleBorder: string }> = {
  Streetwear:   { activeBg: '#0F172A', activeText: '#fff', idleBg: '#F8FAFC', idleText: '#334155', idleBorder: '#CBD5E1' },
  Cultural:     { activeBg: '#7C2D12', activeText: '#fff', idleBg: '#FFF7ED', idleText: '#9A3412', idleBorder: '#FDBA74' },
  Athleisure:   { activeBg: '#14532D', activeText: '#fff', idleBg: '#F0FDF4', idleText: '#166534', idleBorder: '#86EFAC' },
  Experimental: { activeBg: '#4C1D95', activeText: '#fff', idleBg: '#F5F3FF', idleText: '#5B21B6', idleBorder: '#C4B5FD' },
  Star:         { activeBg: '#92400E', activeText: '#fff', idleBg: '#FFFBEB', idleText: '#B45309', idleBorder: '#FCD34D' },
}

const GENDER_OPTIONS = [
  { value: '', label: '— Kein —' },
  { value: 'MALE', label: 'Herren' },
  { value: 'FEMALE', label: 'Damen' },
  { value: 'UNISEX', label: 'Unisex' },
]
const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Ausstehend' },
  { value: 'APPROVED', label: 'Genehmigt' },
  { value: 'REJECTED', label: 'Abgelehnt' },
  { value: 'DEACTIVATED', label: 'Deaktiviert' },
]

function FLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-[0.10em] text-[#9B9B9B] font-medium mb-1.5"
      style={{ fontFamily: 'var(--font-league-spartan)' }}>
      {children}
    </p>
  )
}
function FInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full text-[12px] border border-[#E8E8E8] bg-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#370E4D]/40 focus:ring-2 focus:ring-[#370E4D]/8 transition-all duration-200 placeholder:text-[#C0C0BC]"
      style={{ fontFamily: 'var(--font-league-spartan)' }} />
  )
}
function FTextarea({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows}
      className="w-full text-[12px] border border-[#E8E8E8] bg-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#370E4D]/40 focus:ring-2 focus:ring-[#370E4D]/8 transition-all duration-200 resize-none"
      style={{ fontFamily: 'var(--font-league-spartan)' }} />
  )
}
function FSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full text-[12px] border border-[#E8E8E8] bg-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#370E4D]/40 focus:ring-2 focus:ring-[#370E4D]/8 transition-all duration-200"
      style={{ fontFamily: 'var(--font-league-spartan)' }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

function parseCatalogueCategory(raw: string | string[] | undefined, fallback: string[] | undefined): string[] {
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string' && raw) return [raw]
  return fallback ?? []
}

export default function Products() {
  const [products, setProducts] = useState<AdminApiProduct[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState<Filter>('all')
  const [queue, setQueue]       = useState<Queue>('all')
  const [search, setSearch]     = useState('')
  const [acting, setActing]     = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [editing, setEditing]   = useState<string | null>(null)
  const [draft, setDraft]       = useState<EditDraft | null>(null)

  useEffect(() => {
    adminApi.products.getAll().catch(() => []).then(setProducts).finally(() => setLoading(false))
  }, [])

  const pending = products.filter(p => p.status === 'PENDING').length

  const visible = products.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.brandName.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    if (!matchSearch) return false
    if (queue === 'moderation') return p.status === 'PENDING'
    if (filter !== 'all') return p.status === filter
    return true
  })

  async function act(id: string, action: 'approve' | 'reject' | 'hide') {
    setActing(id)
    try {
      await adminApi.products[action](id)
      const nextStatus = action === 'approve' ? 'APPROVED' : 'REJECTED'
      setProducts(prev => prev.map(p => p.id === id ? { ...p, status: nextStatus } : p))
    } catch { /* silent */ } finally { setActing(null) }
  }

  async function deactivate(id: string) {
    setActing(id)
    try {
      await adminApi.products.deactivate(id)
      setProducts(prev => prev.map(p => p.id === id ? { ...p, status: 'DEACTIVATED' } : p))
    } catch { /* silent */ } finally { setActing(null) }
  }

  async function del(id: string) {
    setActing(id)
    try {
      await adminApi.products.delete(id)
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch { /* silent */ } finally { setActing(null); setConfirmDelete(null) }
  }

  function startEdit(p: AdminApiProduct) {
    setEditing(p.id)
    setDraft({
      name: p.name ?? '',
      description: p.description ?? '',
      category: p.category ?? '',
      gender: p.gender ?? '',
      material: p.material ?? p.details?.material ?? '',
      careInstructions: p.careInstructions ?? '',
      collectionName: p.collectionName ?? '',
      originCountry: p.originCountry ?? p.details?.origin ?? '',
      inspirationStory: p.inspirationStory || null,
      catalogueCategory: parseCatalogueCategory(p.catalogueCategory, p.catalogue),
      status: p.status ?? '',
      variantDrafts: p.variants ? p.variants.map(v => ({ ...v })) : [],
    })
  }

  function setField<K extends keyof EditDraft>(key: K, value: EditDraft[K]) {
    setDraft(d => d ? { ...d, [key]: value } : d)
  }

  function setVariantField(idx: number, key: string, value: string | number) {
    setDraft(d => {
      if (!d) return d
      const vd = d.variantDrafts.map((v, i) => i === idx ? { ...v, [key]: value } : v)
      return { ...d, variantDrafts: vd }
    })
  }

  async function saveEdit(p: AdminApiProduct) {
    if (!draft) return
    setActing(p.id)
    try {
      const updated = await adminApi.products.update(p.id, {
        name: draft.name,
        description: draft.description,
        category: draft.category,
        gender: draft.gender,
        material: draft.material,
        careInstructions: draft.careInstructions,
        collectionName: draft.collectionName,
        originCountry: draft.originCountry,
        inspirationStory: draft.inspirationStory,
        catalogueCategory: draft.catalogueCategory,
        status: draft.status,
      })
      for (const v of draft.variantDrafts) {
        try {
          await adminApi.products.updateVariant(p.id, v.id, {
            color: v.color,
            size: v.size,
            sku: v.sku,
            stockQuantity: v.stockQuantity,
            weightGrams: v.weightGrams,
          })
        } catch { /* individual variant failure is silent */ }
      }
      setProducts(prev => prev.map(pr => pr.id === p.id
        ? { ...pr, ...updated, variants: draft.variantDrafts } as AdminApiProduct
        : pr
      ))
      setEditing(null)
      setDraft(null)
    } catch { /* silent */ } finally { setActing(null) }
  }

  const STATUS_FILTERS: { id: Filter; label: string }[] = [
    { id: 'all',         label: 'Alle' },
    { id: 'PENDING',     label: `Ausstehend (${pending})` },
    { id: 'APPROVED',    label: `Genehmigt (${products.filter(p => p.status === 'APPROVED').length})` },
    { id: 'REJECTED',    label: `Abgelehnt (${products.filter(p => p.status === 'REJECTED').length})` },
    { id: 'DEACTIVATED', label: `Deaktiviert (${products.filter(p => p.status === 'DEACTIVATED').length})` },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <div
          className="flex items-center gap-0.5 border border-[#E8E8E8] rounded-xl p-1"
          style={{ background: '#F5F5F0' }}
        >
          <button
            onClick={() => setQueue('all')}
            className="px-3.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200"
            style={{
              fontFamily: 'var(--font-league-spartan)',
              letterSpacing: '0.03em',
              background: queue === 'all' ? '#fff' : 'transparent',
              color: queue === 'all' ? '#370E4D' : '#6B6B6B',
              boxShadow: queue === 'all' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              border: queue === 'all' ? '1px solid #E8E8E8' : '1px solid transparent',
            }}
          >
            Alle Produkte
          </button>
          <button
            onClick={() => setQueue('moderation')}
            className="px-3.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 flex items-center gap-1.5"
            style={{
              fontFamily: 'var(--font-league-spartan)',
              letterSpacing: '0.03em',
              background: queue === 'moderation' ? '#FEF3C7' : 'transparent',
              color: queue === 'moderation' ? '#92400E' : '#6B6B6B',
              boxShadow: queue === 'moderation' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              border: queue === 'moderation' ? '1px solid #FDE68A' : '1px solid transparent',
            }}
          >
            <Flag className="w-3 h-3" />
            Moderation Queue {pending > 0 && `(${pending})`}
          </button>
        </div>

        {queue === 'all' && (
          <FilterBar options={STATUS_FILTERS} value={filter} onChange={v => setFilter(v as Filter)} />
        )}

        <div className="flex-1 min-w-[200px] max-w-xs">
          <SearchInput value={search} onChange={setSearch} placeholder="Produkt, Marke oder SKU…" />
        </div>
      </div>

      <SectionCard title={queue === 'moderation' ? 'Moderation Queue' : 'Produkte'} count={visible.length}>
        {loading ? <Loader /> : visible.length === 0 ? <EmptyState message="Keine Produkte gefunden." /> : (
          <table className="w-full">
            <thead>
              <tr>
                <TH>Produkt</TH>
                <TH>Marke</TH>
                <TH>SKU</TH>
                <TH>Preis</TH>
                <TH>Kategorie</TH>
                <TH>Status</TH>
                <TH>Erstellt</TH>
                <TH>Aktionen</TH>
              </tr>
            </thead>
            <tbody>
              {visible.map(p => (
                <React.Fragment key={p.id}>
                  <TableRow>
                    <TD>
                      <div className="flex items-center gap-2.5">
                        {p.images?.[0] && (
                          <img src={p.images[0]} alt="" className="w-8 h-10 object-cover rounded-lg bg-[#F5F5F0] shrink-0" />
                        )}
                        <span className="font-medium text-[#0A0A0A]">{p.name}</span>
                      </div>
                    </TD>
                    <TD className="text-[#6B6B6B]">{p.brandName}</TD>
                    <TD className="font-mono text-[11px] text-[#9B9B9B]">{p.sku}</TD>
                    <TD className="font-medium text-[#0A0A0A]">{fmtEur(p.price)}</TD>
                    <TD className="text-[#6B6B6B] capitalize">{p.category}</TD>
                    <TD><StatusBadge status={p.status} /></TD>
                    <TD className="text-[#6B6B6B]">{fmt(p.createdAt)}</TD>
                    <TD>
                      <div className="flex items-center gap-1">
                        {/* Edit */}
                        <button
                          onClick={() => {
                            if (editing === p.id) { setEditing(null); setDraft(null) }
                            else startEdit(p)
                          }}
                          className={`p-1.5 rounded-lg transition-all duration-200 ${editing === p.id ? 'text-[#370E4D] bg-[#F0EBF4]' : 'text-[#6B6B6B] hover:bg-[#F5F5F0] hover:text-[#370E4D]'}`}
                          title="Bearbeiten"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {/* Approve / Reject */}
                        {p.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => act(p.id, 'approve')} disabled={acting === p.id}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-all duration-200 disabled:opacity-40"
                              title="Genehmigen"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => act(p.id, 'reject')} disabled={acting === p.id}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-all duration-200 disabled:opacity-40"
                              title="Ablehnen"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {/* Hide */}
                        {p.status === 'APPROVED' && (
                          <button
                            onClick={() => act(p.id, 'hide')} disabled={acting === p.id}
                            className="p-1.5 rounded-lg text-[#6B6B6B] hover:bg-[#F5F5F0] transition-all duration-200 disabled:opacity-40"
                            title="Verstecken"
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                        )}
                        {/* Deactivate */}
                        {p.status !== 'DEACTIVATED' && p.status !== 'REJECTED' && (
                          <button
                            onClick={() => deactivate(p.id)} disabled={acting === p.id}
                            className="p-1.5 rounded-lg text-[#6B6B6B] hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 disabled:opacity-40"
                            title="Deaktivieren"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {/* Reactivate */}
                        {p.status === 'DEACTIVATED' && (
                          <button
                            onClick={() => act(p.id, 'approve')} disabled={acting === p.id}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-all duration-200 disabled:opacity-40"
                            title="Reaktivieren"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {/* Delete */}
                        {confirmDelete !== p.id ? (
                          <button
                            onClick={() => setConfirmDelete(p.id)}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200"
                            title="Löschen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => del(p.id)} disabled={acting === p.id}
                              className="text-[11px] text-rose-600 font-medium hover:underline"
                              style={{ fontFamily: 'var(--font-league-spartan)' }}
                            >
                              Löschen
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="text-[11px] text-[#6B6B6B] hover:underline"
                              style={{ fontFamily: 'var(--font-league-spartan)' }}
                            >
                              Abbrechen
                            </button>
                          </div>
                        )}
                      </div>
                    </TD>
                  </TableRow>

                  {editing === p.id && draft && (
                    <tr className="border-b border-[#F0F0EB]" style={{ background: '#F8F8F5' }}>
                      <td colSpan={8} className="px-6 py-6">
                        <div className="flex gap-6">

                          {/* Product image portrait */}
                          {p.images?.[0] && (
                            <div className="shrink-0 flex flex-col items-center gap-2">
                              <img
                                src={p.images[0]}
                                alt={p.name}
                                className="rounded-xl object-cover bg-[#F0F0EB] shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
                                style={{ width: 108, aspectRatio: '3/4' }}
                              />
                              {p.images.length > 1 && (
                                <p className="text-[10px] text-[#9B9B9B]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                                  +{p.images.length - 1} weitere
                                </p>
                              )}
                            </div>
                          )}

                          {/* Form */}
                          <div className="flex-1 space-y-4">

                            {/* Name / Kategorie / Geschlecht / Status */}
                            <div className="grid grid-cols-4 gap-4">
                              <div>
                                <FLabel>Name</FLabel>
                                <FInput value={draft.name} onChange={v => setField('name', v)} />
                              </div>
                              <div>
                                <FLabel>Kategorie</FLabel>
                                <FInput value={draft.category} onChange={v => setField('category', v)} />
                              </div>
                              <div>
                                <FLabel>Geschlecht</FLabel>
                                <FSelect value={draft.gender} onChange={v => setField('gender', v)} options={GENDER_OPTIONS} />
                              </div>
                              <div>
                                <FLabel>Status</FLabel>
                                <FSelect value={draft.status} onChange={v => setField('status', v)} options={STATUS_OPTIONS} />
                              </div>
                            </div>

                            {/* Beschreibung */}
                            <div>
                              <FLabel>Beschreibung</FLabel>
                              <FTextarea value={draft.description} onChange={v => setField('description', v)} rows={3} />
                            </div>

                            {/* Material / Pflege / Kollektion / Herkunft */}
                            <div className="grid grid-cols-4 gap-4">
                              <div>
                                <FLabel>Material</FLabel>
                                <FInput value={draft.material} onChange={v => setField('material', v)} />
                              </div>
                              <div>
                                <FLabel>Pflegehinweise</FLabel>
                                <FInput value={draft.careInstructions} onChange={v => setField('careInstructions', v)} />
                              </div>
                              <div>
                                <FLabel>Kollektion</FLabel>
                                <FInput value={draft.collectionName} onChange={v => setField('collectionName', v)} />
                              </div>
                              <div>
                                <FLabel>Herkunftsland</FLabel>
                                <FInput value={draft.originCountry} onChange={v => setField('originCountry', v)} />
                              </div>
                            </div>

                            {/* Katalogkategorie — multi-chip, bis zu 3 */}
                            <div>
                              <div className="flex items-center gap-2 mb-1.5">
                                <p className="text-[10px] uppercase tracking-[0.10em] text-[#9B9B9B] font-medium"
                                  style={{ fontFamily: 'var(--font-league-spartan)' }}>
                                  Katalogkategorie
                                </p>
                                <span
                                  className="text-[10px] px-2 py-0.5 rounded-md"
                                  style={{ fontFamily: 'var(--font-league-spartan)', background: '#EBEBEB', color: '#6B6B6B' }}
                                >
                                  {draft.catalogueCategory.length > 0
                                    ? `${draft.catalogueCategory.length} / 3 gewählt`
                                    : 'optional · max. 3'}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {CATALOGUE_CATEGORIES.map(cat => {
                                  const isSelected = draft.catalogueCategory.includes(cat)
                                  const atMax = draft.catalogueCategory.length >= 3 && !isSelected
                                  const c = CATALOGUE_COLORS[cat]
                                  return (
                                    <button
                                      key={cat}
                                      type="button"
                                      disabled={atMax}
                                      onClick={() => {
                                        const next = isSelected
                                          ? draft.catalogueCategory.filter(x => x !== cat)
                                          : [...draft.catalogueCategory, cat]
                                        setField('catalogueCategory', next)
                                      }}
                                      className="px-3.5 py-1.5 rounded-full text-[11px] font-medium border transition-all duration-200"
                                      style={{
                                        fontFamily: 'var(--font-league-spartan)',
                                        letterSpacing: '0.04em',
                                        background: isSelected ? c.activeBg : atMax ? '#F5F5F0' : c.idleBg,
                                        color: isSelected ? c.activeText : atMax ? '#C0C0BC' : c.idleText,
                                        borderColor: isSelected ? c.activeBg : atMax ? '#E8E8E8' : c.idleBorder,
                                        cursor: atMax ? 'not-allowed' : 'pointer',
                                        opacity: atMax ? 0.5 : 1,
                                      }}
                                    >
                                      {cat}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>

                            {/* Inspirationsgeschichte — optional toggle */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="text-[10px] uppercase tracking-[0.10em] text-[#9B9B9B] font-medium"
                                    style={{ fontFamily: 'var(--font-league-spartan)' }}>
                                    Inspirationsgeschichte
                                  </p>
                                  <p className="text-[10px] text-[#C0C0BC] mt-0.5"
                                    style={{ fontFamily: 'var(--font-league-spartan)' }}>
                                    Optional — nicht erforderlich
                                  </p>
                                </div>
                                {/* Toggle switch */}
                                <button
                                  type="button"
                                  onClick={() => setField('inspirationStory', draft.inspirationStory === null ? '' : null)}
                                  className="flex items-center gap-2 transition-all duration-200"
                                  title={draft.inspirationStory === null ? 'Aktivieren' : 'Deaktivieren'}
                                >
                                  <span
                                    className="text-[10px] font-medium transition-colors duration-200"
                                    style={{
                                      fontFamily: 'var(--font-league-spartan)',
                                      color: draft.inspirationStory === null ? '#C0C0BC' : '#370E4D',
                                    }}
                                  >
                                    {draft.inspirationStory === null ? 'Inaktiv' : 'Aktiv'}
                                  </span>
                                  <div
                                    className="relative rounded-full transition-all duration-300"
                                    style={{
                                      width: 34,
                                      height: 18,
                                      background: draft.inspirationStory === null ? '#E8E8E8' : '#370E4D',
                                    }}
                                  >
                                    <div
                                      className="absolute rounded-full bg-white shadow-sm transition-all duration-300"
                                      style={{
                                        width: 13,
                                        height: 13,
                                        top: 2.5,
                                        left: draft.inspirationStory === null ? 2.5 : 18.5,
                                      }}
                                    />
                                  </div>
                                </button>
                              </div>

                              {draft.inspirationStory !== null ? (
                                <FTextarea
                                  value={draft.inspirationStory}
                                  onChange={v => setField('inspirationStory', v)}
                                  rows={3}
                                />
                              ) : (
                                <div
                                  className="w-full rounded-lg px-4 py-5 text-center text-[11px]"
                                  style={{
                                    border: '1.5px dashed #E8E8E8',
                                    background: '#FAFAF8',
                                    color: '#C0C0BC',
                                    fontFamily: 'var(--font-league-spartan)',
                                  }}
                                >
                                  Kein Text — Schalter aktivieren um eine Geschichte hinzuzufügen
                                </div>
                              )}
                            </div>

                            {/* Varianten */}
                            {draft.variantDrafts.length > 0 && (
                              <div>
                                <FLabel>Varianten</FLabel>
                                <div className="border border-[#E8E8E8] rounded-lg overflow-hidden">
                                  <table className="w-full">
                                    <thead>
                                      <tr style={{ background: '#FAFAF8' }}>
                                        {['Farbe', 'Größe', 'SKU', 'Bestand', 'Gewicht (g)'].map(h => (
                                          <th key={h} className="py-2 px-3 text-left text-[10px] uppercase tracking-[0.10em] text-[#9B9B9B] font-medium"
                                            style={{ fontFamily: 'var(--font-league-spartan)' }}>
                                            {h}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {draft.variantDrafts.map((v, idx) => (
                                        <tr key={v.id} className="border-t border-[#EBEBEB]">
                                          <td className="py-1.5 px-3"><FInput value={v.color ?? ''} onChange={val => setVariantField(idx, 'color', val)} /></td>
                                          <td className="py-1.5 px-3"><FInput value={v.size ?? ''} onChange={val => setVariantField(idx, 'size', val)} /></td>
                                          <td className="py-1.5 px-3"><FInput value={v.sku ?? ''} onChange={val => setVariantField(idx, 'sku', val)} /></td>
                                          <td className="py-1.5 px-3"><FInput value={String(v.stockQuantity ?? '')} onChange={val => setVariantField(idx, 'stockQuantity', Number(val) || 0)} /></td>
                                          <td className="py-1.5 px-3"><FInput value={String(v.weightGrams ?? '')} onChange={val => setVariantField(idx, 'weightGrams', Number(val) || 0)} /></td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* Save / Cancel */}
                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EBEBEB]">
                              <button
                                onClick={() => { setEditing(null); setDraft(null) }}
                                className="h-7 px-3.5 rounded-lg text-[11px] font-medium text-[#6B6B6B] border border-[#E8E8E8] hover:bg-[#F5F5F0] transition-all duration-200"
                                style={{ fontFamily: 'var(--font-league-spartan)' }}
                              >
                                Abbrechen
                              </button>
                              <button
                                onClick={() => saveEdit(p)}
                                disabled={acting === p.id}
                                className="h-7 px-3.5 rounded-lg text-[11px] font-medium text-white transition-all duration-200 disabled:opacity-40"
                                style={{ fontFamily: 'var(--font-league-spartan)', background: '#370E4D' }}
                              >
                                {acting === p.id ? 'Speichert…' : 'Speichern'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </SectionCard>
    </div>
  )
}
