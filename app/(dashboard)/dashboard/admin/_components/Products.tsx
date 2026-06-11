'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { adminApi, brandApi } from '@/lib/api'
import type { AdminApiProduct, ApiOrder, ApiProductImage } from '@/types/api'
import { PageHeader, SectionCard, StatusBadge, EmptyState, Loader, FilterBar, SearchInput, SelectFilter, TH, TD, TableRow, fmt, fmtEur } from './shared'
import { Eye, EyeOff, Trash2, CheckCircle, XCircle, Flag, Pencil, RotateCcw, ImagePlus, X, Link2 } from 'lucide-react'

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
  const values = Array.isArray(raw) ? raw : typeof raw === 'string' && raw ? [raw] : fallback ?? []
  // Normalize API values (e.g. 'STREETWEAR') to the display names used by the chip buttons
  return values.map(v => CATALOGUE_CATEGORIES.find(c => c.toUpperCase() === v.toUpperCase()) ?? v)
}

// ─── MediaEditor ────────────────────────────────────────────────────────────
function MediaEditor({ productId }: { productId: string }) {
  const [images, setImages]   = useState<ApiProductImage[]>([])
  const [loadingImgs, setLoadingImgs] = useState(true)
  const [urlInput, setUrl]    = useState('')
  const [adding, setAdding]   = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    brandApi.images.list(productId)
      .then(setImages).catch(() => setImages([]))
      .finally(() => setLoadingImgs(false))
  }, [productId])

  async function addUrl(url: string) {
    const trimmed = url.trim()
    if (!trimmed) return
    setAdding(true)
    try {
      const created = await brandApi.images.add(productId, trimmed)
      setImages(prev => [...prev, created])
      setUrl('')
    } catch { /* silent */ } finally { setAdding(false) }
  }

  async function removeImage(id: string) {
    setDeleting(id)
    try {
      await brandApi.images.delete(productId, id)
      setImages(prev => prev.filter(i => i.id !== id))
    } catch { /* silent */ } finally { setDeleting(null) }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const uri = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain')
    if (uri && (uri.startsWith('http://') || uri.startsWith('https://'))) {
      addUrl(uri)
    }
  }

  return (
    <div className="shrink-0 flex flex-col gap-2.5" style={{ width: 190 }}>
      <p className="text-[10px] uppercase tracking-[0.10em] text-[#9B9B9B] font-medium"
        style={{ fontFamily: 'var(--font-league-spartan)' }}>
        Bilder & Videos
      </p>

      {/* existing images */}
      {loadingImgs
        ? <div className="h-16 flex items-center justify-center"><div className="w-4 h-4 rounded-full border-2 border-[#E8E8E8] border-t-[#370E4D] animate-spin" /></div>
        : images.length > 0
          ? (
            <div className="grid grid-cols-2 gap-1.5">
              {images.map(img => (
                <div key={img.id} className="relative group rounded-lg overflow-hidden bg-[#F0F0EB]" style={{ aspectRatio: '3/4' }}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(img.id)}
                    disabled={deleting === img.id}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 disabled:opacity-40"
                    style={{ background: 'rgba(0,0,0,0.65)' }}
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )
          : <p className="text-[10px] text-[#C0C0BC]" style={{ fontFamily: 'var(--font-league-spartan)' }}>Keine Bilder</p>
      }

      {/* drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className="rounded-lg p-3 text-center transition-all duration-150"
        style={{
          border: `1.5px dashed ${dragOver ? '#370E4D' : '#D4D4CE'}`,
          background: dragOver ? 'rgba(55,14,77,0.05)' : '#FAFAF8',
        }}
      >
        <ImagePlus className="w-4 h-4 mx-auto mb-1" style={{ color: dragOver ? '#370E4D' : '#CDCDCD' }} />
        <p className="text-[9px] leading-snug" style={{ fontFamily: 'var(--font-league-spartan)', color: dragOver ? '#370E4D' : '#9B9B9B' }}>
          Bild-URL aus Browser hierher ziehen
        </p>
      </div>

      {/* URL input */}
      <div className="flex gap-1">
        <div className="relative flex-1">
          <Link2 className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#C0C0BC]" />
          <input
            type="text"
            value={urlInput}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addUrl(urlInput)}
            placeholder="https://…"
            className="w-full text-[11px] border border-[#E8E8E8] bg-white rounded-lg pl-6 pr-2 py-1.5 focus:outline-none focus:border-[#370E4D]/40 transition-all placeholder:text-[#D0D0CC]"
            style={{ fontFamily: 'var(--font-league-spartan)' }}
          />
        </div>
        <button
          onClick={() => addUrl(urlInput)}
          disabled={adding || !urlInput.trim()}
          className="h-7 px-2.5 rounded-lg text-[11px] font-semibold text-white disabled:opacity-40 transition-all duration-150"
          style={{ background: '#370E4D', fontFamily: 'var(--font-league-spartan)' }}
        >
          {adding ? '…' : '+'}
        </button>
      </div>
    </div>
  )
}

export default function Products({ orders = [] }: { orders?: ApiOrder[] }) {
  const [products, setProducts] = useState<AdminApiProduct[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState<Filter>('all')
  const [queue, setQueue]       = useState<Queue>('all')
  const [search, setSearch]     = useState('')
  const [acting, setActing]     = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [editing, setEditing]   = useState<string | null>(null)
  const [draft, setDraft]       = useState<EditDraft | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [rejectingId, setRejectingId]   = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [brandFilter, setBrandFilter]   = useState<string>('all')
  const [catFilter, setCatFilter]       = useState<string>('all')
  const [sortBy, setSortBy]             = useState<string>('newest')

  useEffect(() => {
    adminApi.products.getAll().catch(() => []).then(setProducts).finally(() => setLoading(false))
  }, [])

  const pending = products.filter(p => p.status === 'PENDING').length

  const uniqueBrands = useMemo(() =>
    [...new Set(products.map(p => p.brandName))].filter(Boolean).sort()
  , [products])

  const salesMap = useMemo(() => {
    const m = new Map<string, { count: number; revenue: number }>()
    for (const order of orders) {
      for (const item of (order.items ?? [])) {
        if (!item.productId) continue
        const prev = m.get(item.productId) ?? { count: 0, revenue: 0 }
        m.set(item.productId, {
          count:   prev.count   + (item.quantity ?? 1),
          revenue: prev.revenue + (item.price ?? 0) * (item.quantity ?? 1),
        })
      }
    }
    return m
  }, [orders])

  const visible = useMemo(() => {
    const q = search.toLowerCase()
    const result = products.filter(p => {
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.brandName.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
      if (!matchSearch) return false
      if (queue === 'moderation') return p.status === 'PENDING'
      if (filter !== 'all' && p.status !== filter) return false
      if (brandFilter !== 'all' && p.brandName !== brandFilter) return false
      if (catFilter !== 'all') {
        const cats = parseCatalogueCategory(p.catalogueCategory, p.catalogue)
        if (!cats.map(c => c.toUpperCase()).includes(catFilter.toUpperCase())) return false
      }
      return true
    })
    return [...result].sort((a, b) => {
      if (sortBy === 'oldest')     return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      if (sortBy === 'price_desc') return (b.price ?? 0) - (a.price ?? 0)
      if (sortBy === 'price_asc')  return (a.price ?? 0) - (b.price ?? 0)
      if (sortBy === 'name')       return a.name.localeCompare(b.name, 'de')
      if (sortBy === 'sales_desc') return (salesMap.get(b.id)?.count ?? 0) - (salesMap.get(a.id)?.count ?? 0)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [products, search, filter, queue, brandFilter, catFilter, sortBy])

  async function act(id: string, action: 'approve' | 'hide') {
    setActing(id)
    try {
      await adminApi.products[action](id)
      const nextStatus = action === 'approve' ? 'APPROVED' : 'HIDDEN'
      setProducts(prev => prev.map(p => p.id === id ? { ...p, status: nextStatus } : p))
    } catch { /* silent */ } finally { setActing(null) }
  }

  async function rejectProduct(id: string, reason: string) {
    setActing(id)
    try {
      await adminApi.products.reject(id, reason || undefined)
      setProducts(prev => prev.map(p => p.id === id ? { ...p, status: 'REJECTED' } : p))
      setRejectingId(null)
      setRejectReason('')
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
    })
  }

  function setField<K extends keyof EditDraft>(key: K, value: EditDraft[K]) {
    setDraft(d => d ? { ...d, [key]: value } : d)
  }

  async function saveEdit(p: AdminApiProduct) {
    if (!draft) return
    setActing(p.id)
    setSaveError(null)
    try {
      // Backend UpdateProductDto: no status/price (status via approve/hide, prices on listings),
      // variants are BRAND_PARTNER-only — only these fields are actually persisted.
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
        catalogueCategory: draft.catalogueCategory.map(c => c.toUpperCase()),
      })
      setProducts(prev => prev.map(pr => pr.id === p.id
        ? { ...pr, ...updated } as AdminApiProduct
        : pr
      ))
      setEditing(null)
      setDraft(null)
    } catch {
      setSaveError('Speichern fehlgeschlagen — Änderungen wurden nicht übernommen.')
    } finally { setActing(null) }
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
      <PageHeader
        eyebrow="Verwaltung"
        title="Produkt"
        italicTitle="katalog."
      />

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

        <SelectFilter
          value={brandFilter}
          onChange={setBrandFilter}
          options={[
            { value: 'all', label: 'Alle Marken' },
            ...uniqueBrands.map(b => ({ value: b, label: b })),
          ]}
        />
        <SelectFilter
          value={catFilter}
          onChange={setCatFilter}
          options={[
            { value: 'all', label: 'Alle Kategorien' },
            ...CATALOGUE_CATEGORIES.map(c => ({ value: c, label: c })),
          ]}
        />
        <SelectFilter
          value={sortBy}
          onChange={setSortBy}
          options={[
            { value: 'newest',     label: 'Neueste zuerst' },
            { value: 'oldest',     label: 'Älteste zuerst' },
            { value: 'price_desc', label: 'Preis ↓' },
            { value: 'price_asc',  label: 'Preis ↑' },
            { value: 'name',       label: 'Name A–Z' },
            { value: 'sales_desc', label: 'Meistverkauft' },
          ]}
        />
        <div className="flex-1 min-w-[160px] max-w-xs">
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
                <TH>Verkäufe</TH>
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
                    <TD>
                      {(() => {
                        const s = salesMap.get(p.id)
                        return s ? (
                          <div style={{ fontFamily: 'var(--font-league-spartan)' }}>
                            <span className="text-[12px] font-medium text-[#0A0A0A]">{s.count}×</span>
                            <span className="text-[11px] text-[#6B6B6B] ml-1">{fmtEur(s.revenue)}</span>
                          </div>
                        ) : <span className="text-[11px] text-[#C0C0BC]">—</span>
                      })()}
                    </TD>
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
                            {rejectingId !== p.id ? (
                              <button
                                onClick={() => { setRejectingId(p.id); setRejectReason('') }}
                                disabled={acting === p.id}
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-all duration-200 disabled:opacity-40"
                                title="Ablehnen"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <input
                                  autoFocus
                                  type="text"
                                  value={rejectReason}
                                  onChange={e => setRejectReason(e.target.value)}
                                  onKeyDown={e => e.key === 'Enter' && rejectProduct(p.id, rejectReason)}
                                  placeholder="Ablehnungsgrund…"
                                  className="text-[11px] border border-rose-200 bg-white rounded-lg px-2.5 py-1 focus:outline-none focus:border-rose-400 w-40 transition-all duration-200"
                                  style={{ fontFamily: 'var(--font-league-spartan)' }}
                                />
                                <button
                                  onClick={() => rejectProduct(p.id, rejectReason)}
                                  disabled={acting === p.id}
                                  className="h-6 px-2.5 rounded-lg text-[10px] font-medium text-white bg-rose-600 hover:bg-rose-700 transition-all duration-200 disabled:opacity-40"
                                  style={{ fontFamily: 'var(--font-league-spartan)' }}
                                >
                                  OK
                                </button>
                                <button
                                  onClick={() => setRejectingId(null)}
                                  className="h-6 px-2 rounded-lg text-[11px] text-[#6B6B6B] hover:text-[#0A0A0A] transition-all duration-200"
                                  style={{ fontFamily: 'var(--font-league-spartan)' }}
                                >
                                  ×
                                </button>
                              </div>
                            )}
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
                        {/* Reactivate (hidden products) */}
                        {(p.status === 'HIDDEN' || p.status === 'DEACTIVATED') && (
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
                      <td colSpan={9} className="px-6 py-6">
                        <div className="flex gap-6">

                          {/* Media editor */}
                          <MediaEditor productId={p.id} />

                          {/* Form */}
                          <div className="flex-1 space-y-4">

                            {/* Name / Kategorie / Geschlecht — Preis liegt auf Listings,
                                Status wird über Genehmigen/Verstecken gesteuert */}
                            <div className="grid grid-cols-3 gap-4">
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

                            {/* Varianten — read-only: Varianten-Updates sind BRAND_PARTNER-only */}
                            {(p.variants?.length ?? 0) > 0 && (
                              <div>
                                <FLabel>Varianten (nur Ansicht — Pflege durch die Marke)</FLabel>
                                <div className="border border-[#E8E8E8] rounded-lg overflow-hidden">
                                  <table className="w-full">
                                    <thead>
                                      <tr style={{ background: '#FAFAF8' }}>
                                        {['Farbe', 'Größe', 'SKU', 'Bestand', 'Gewicht (g)'].map((h, i) => (
                                          <th key={h} className="py-2 px-3 text-left text-[10px] uppercase tracking-[0.10em] font-medium"
                                            style={{ fontFamily: 'var(--font-league-spartan)', color: i === 2 ? '#C0C0BC' : '#9B9B9B' }}>
                                            {h}{i === 2 && ' (auto)'}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(p.variants ?? []).map(v => (
                                        <tr key={v.id} className="border-t border-[#EBEBEB]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                                          <td className="py-1.5 px-3 text-[12px] text-[#2D2D2D]">{v.color ?? '—'}</td>
                                          <td className="py-1.5 px-3 text-[12px] text-[#2D2D2D]">{v.size ?? '—'}</td>
                                          <td className="py-1.5 px-3 font-mono text-[11px] text-[#9B9B9B]">{v.sku ?? '—'}</td>
                                          <td className="py-1.5 px-3 text-[12px] text-[#2D2D2D]">{v.stockQuantity ?? '—'}</td>
                                          <td className="py-1.5 px-3 text-[12px] text-[#2D2D2D]">{v.weightGrams ?? '—'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* Save / Cancel */}
                            {saveError && (
                              <p className="text-[11px] font-medium text-right" style={{ fontFamily: 'var(--font-league-spartan)', color: '#8B1E3F' }}>
                                {saveError}
                              </p>
                            )}
                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EBEBEB]">
                              <button
                                onClick={() => { setEditing(null); setDraft(null); setSaveError(null) }}
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
