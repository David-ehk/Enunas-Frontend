'use client'

import { useState, useEffect, Fragment } from 'react'
import { brandApi } from '@/lib/api/modules/brandApi'
import { FetchError } from '@/lib/api'
import { errorRemedies, type ErrorRemedy } from '@/lib/api/errorCopy'
import type { AdminApiProduct } from '@/types/api'
import {
  StatusBadge, SectionCard, EmptyState, Loader,
  TH, TD, TableRow, FilterBar, SearchInput, fmt, fmtEur,
} from '../../admin/_components/shared'
import { VPageHeader } from './vshared'
import { ChevronDown, ChevronUp, Edit2, Package, Plus, Trash2, X } from 'lucide-react'
import { isProductLive } from '@/lib/product'
import { STATUS_FILTERS, BTN_PRIMARY } from './products/constants'
import CreateWizard from './products/CreateWizard'
import EditPanel from './products/EditPanel'
import VariantsPanel from './products/VariantsPanel'

// Product management, split across app/(dashboard)/dashboard/vendor/_components/products/ —
// this file is now just the list view plus the small state machine that switches between it,
// the creation wizard, the edit panel and the variants panel. It was a single 2,420-line file
// (create wizard alone was 685 lines) until Sep 2026; see that folder for the module map:
//   constants.ts              — shared consts/types (colours, sizes, product types, wizard shape)
//   CreateWizard.tsx          — new-product wizard (StepIndicator, VariantCard, CreateWizard)
//   EditPanel.tsx             — edit an existing product's core fields
//   VariantsPanel.tsx         — add/remove variants + stock on an existing product
//   ImagesSection.tsx         — per-colourway product photo management
//   ListingsSection.tsx       — per-region pricing/listings
//   CompleteTheLookSection.tsx + LookPicker.tsx — "Vervollständige den Look" curation

type View = 'list' | 'create' | 'edit' | 'variants'

export default function Products() {
  const [products, setProducts] = useState<AdminApiProduct[]>([])
  const [loading, setLoading]   = useState(true)
  const [view, setView]         = useState<View>('list')
  const [selected, setSelected]     = useState<AdminApiProduct | null>(null)
  const [filter, setFilter]         = useState('ALL')
  const [search, setSearch]         = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleting, setDeleting]     = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  // `remedies` comes from the backend error code, not from the message — it decides which ways
  // out are actually offered, so the UI never suggests a step the backend has already ruled out.
  const [deleteError, setDeleteError] =
    useState<{ id: string; message: string; remedies: ErrorRemedy[] } | null>(null)
  const [archiving, setArchiving] = useState<string | null>(null)
  const [clearingListings, setClearingListings] = useState<string | null>(null)
  // productId → Brutto-Preise der Listings (ProductResponseDto trägt keinen Preis;
  // Preise leben auf Listings — niemals € 0,00 anzeigen)
  const [priceMap, setPriceMap] = useState<Record<string, number[]>>({})

  useEffect(() => {
    brandApi.products.getMy()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (products.length === 0) return
    let alive = true
    Promise.all(products.map(p =>
      brandApi.listings.list(p.id)
        .then(ls => [p.id, ls.map(l => l.priceGross ?? l.price).filter((v): v is number => v != null && v > 0)] as const)
        .catch(() => [p.id, [] as number[]] as const)
    )).then(entries => { if (alive) setPriceMap(Object.fromEntries(entries)) })
    return () => { alive = false }
  }, [products])

  function PriceCell({ productId }: { productId: string }) {
    const prices = priceMap[productId]
    if (!prices) return <span className="text-[12px] text-[#C0C0BC]">…</span>
    const distinct = [...new Set(prices)]
    if (distinct.length === 0) {
      return (
        <span className="text-[11px] italic text-[#9B9B9B]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
          Kein Preis gesetzt
        </span>
      )
    }
    const min = Math.min(...distinct)
    return (
      <span className="font-semibold text-[#0A0A0A]">
        {distinct.length > 1 ? `ab ${fmtEur(min)}` : fmtEur(min)}
      </span>
    )
  }

  function reload() {
    setLoading(true)
    brandApi.products.getMy()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }

  async function deleteProduct(id: string) {
    setDeleting(id)
    setDeleteError(null)
    try {
      await brandApi.products.delete(id)
      setProducts(prev => prev.filter(p => p.id !== id))
      setConfirmDelete(null)
    } catch (err) {
      // Branch on the stable `code`, never on the message — that text is English human copy and
      // is reworded over time. An error with no code, or one we don't recognise yet, simply
      // offers no remedy rather than guessing at one.
      setDeleteError({
        id,
        message: err instanceof FetchError ? err.message : 'Produkt konnte nicht gelöscht werden.',
        remedies: err instanceof FetchError ? errorRemedies(err.code) : [],
      })
    } finally {
      setDeleting(null)
    }
  }

  // PRODUCT_HAS_LISTINGS is the one recoverable delete failure: clear the listings, then retry
  // the delete in the same click so the brand doesn't have to walk into the detail view.
  async function clearListingsAndRetryDelete(id: string) {
    setClearingListings(id)
    setDeleteError(null)
    try {
      const listings = await brandApi.listings.list(id)
      for (const l of listings) {
        await brandApi.listings.delete(id, String(l.id))
      }
      await brandApi.products.delete(id)
      setProducts(prev => prev.filter(p => p.id !== id))
      setConfirmDelete(null)
    } catch (err) {
      setDeleteError({
        id,
        message: err instanceof FetchError ? err.message : 'Produkt konnte nicht gelöscht werden.',
        remedies: err instanceof FetchError ? errorRemedies(err.code) : [],
      })
    } finally {
      setClearingListings(null)
    }
  }

  async function archiveProduct(id: string) {
    setArchiving(id)
    try {
      const updated = await brandApi.products.update(id, { status: 'ARCHIVED' })
      setProducts(prev => prev.map(p => (p.id === id ? updated : p)))
      setDeleteError(null)
      setConfirmDelete(null)
    } catch (err) {
      setDeleteError({
        id,
        message: err instanceof FetchError ? err.message : 'Produkt konnte nicht archiviert werden.',
        remedies: err instanceof FetchError ? errorRemedies(err.code) : [],
      })
    } finally {
      setArchiving(null)
    }
  }

  const filtered = products.filter(p => {
    const matchStatus = filter === 'ALL' || p.status === filter
    const q = search.toLowerCase()
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  if (loading) return <Loader />

  if (view === 'create') {
    return (
      <CreateWizard
        onBack={() => setView('list')}
        onCreated={(p) => {
          setProducts(prev => [p, ...prev])
          setSelected(p)
          setView('edit')
          // silent reload to pick up server-generated fields (SKU, etc.)
          brandApi.products.getMy().then(setProducts).catch(() => {})
        }}
      />
    )
  }

  if (view === 'edit' && selected) {
    return (
      <EditPanel
        product={selected}
        onBack={() => { setView('list'); setSelected(null) }}
        onSaved={(updated) => {
          setProducts(prev => prev.map(p => p.id === updated.id ? updated : p))
          setSelected(updated)
        }}
        onImagesChanged={(imageUrls) => {
          setProducts(prev => prev.map(p => p.id === selected.id ? { ...p, images: imageUrls } : p))
          setSelected(prev => prev ? { ...prev, images: imageUrls } : prev)
        }}
      />
    )
  }

  if (view === 'variants' && selected) {
    return (
      <VariantsPanel
        product={selected}
        onBack={() => { setView('list'); setSelected(null) }}
      />
    )
  }

  return (
    <div className="space-y-5">
      <VPageHeader
        eyebrow="Brand Portal"
        title="Produkt"
        italicTitle="verwaltung."
        sub="Eigene Produkte erstellen, bearbeiten und Listings verwalten."
        actions={
          <button
            onClick={() => setView('create')}
            className={BTN_PRIMARY}
            style={{ background: '#370E4D', fontFamily: 'var(--font-league-spartan)' }}
          >
            <Plus className="w-3.5 h-3.5" /> Neues Produkt
          </button>
        }
      />

      {/* Filter + search */}
      <div className="flex items-center gap-3">
        <FilterBar options={STATUS_FILTERS} value={filter} onChange={setFilter} />
        <div className="w-56">
          <SearchInput value={search} onChange={setSearch} placeholder="Suche nach Produkten…" />
        </div>
      </div>

      <SectionCard title="Produkte" count={filtered.length}>
        {filtered.length === 0 ? (
          <EmptyState message={search ? 'Keine Produkte gefunden.' : 'Noch keine Produkte erstellt.'} />
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <TH>Produkt</TH>
                <TH>Kategorie</TH>
                <TH>Preis</TH>
                <TH>Status</TH>
                <TH>Erstellt</TH>
                <TH>Aktionen</TH>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <Fragment key={p.id}>
                  <TableRow>
                    <TD>
                      <div className="flex items-center gap-3">
                        {p.images?.[0] ? (
                          <img
                            src={typeof p.images[0] === 'string' ? p.images[0] : (p.images[0] as { imageUrl?: string }).imageUrl}
                            alt="" className="w-8 h-10 object-cover rounded bg-[#F5F5F0] shrink-0" />
                        ) : (
                          <div className="w-8 h-10 bg-[#F5F5F0] rounded shrink-0 flex items-center justify-center">
                            <Package className="w-3.5 h-3.5 text-[#C0C0BC]" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-[#0A0A0A] text-[13px]" style={{ fontFamily: 'var(--font-league-spartan)' }}>{p.name}</p>
                          <p className="text-[10px] text-[#9B9B9B] font-mono mt-0.5">{p.sku ?? '—'}</p>
                        </div>
                      </div>
                    </TD>
                    <TD className="text-[#6B6B6B] capitalize">{p.category?.toLowerCase()}</TD>
                    <TD><PriceCell productId={p.id} /></TD>
                    <TD><StatusBadge status={p.status} /></TD>
                    <TD className="text-[#9B9B9B]">{fmt(p.createdAt)}</TD>
                    <TD>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setSelected(p); setView('edit') }}
                          className="h-7 px-2.5 rounded-none border border-[#E8E8E8] text-[11px] text-[#6B6B6B] hover:border-[#370E4D]/40 hover:text-[#370E4D] transition-all duration-150 flex items-center gap-1"
                          style={{ fontFamily: 'var(--font-league-spartan)' }}
                        >
                          <Edit2 className="w-3 h-3" /> Bearbeiten
                        </button>
                        <button
                          onClick={() => { setSelected(p); setView('variants') }}
                          className="h-7 px-2.5 rounded-none border border-[#E8E8E8] text-[11px] text-[#6B6B6B] hover:border-[#370E4D]/40 hover:text-[#370E4D] transition-all duration-150"
                          style={{ fontFamily: 'var(--font-league-spartan)' }}
                        >
                          Varianten
                        </button>
                        <button
                          onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                          className="h-7 w-7 rounded-none border border-[#E8E8E8] flex items-center justify-center text-[#9B9B9B] hover:border-[#E8E8E8] hover:text-[#6B6B6B] transition-all duration-150"
                        >
                          {expandedId === p.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        {confirmDelete === p.id ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => deleteProduct(p.id)}
                                disabled={deleting === p.id}
                                className="h-7 px-2.5 rounded-none bg-rose-50 border border-rose-200 text-[11px] text-rose-700 hover:bg-rose-100 transition-all duration-150"
                                style={{ fontFamily: 'var(--font-league-spartan)' }}
                              >
                                {deleting === p.id ? '…' : 'Löschen bestätigen'}
                              </button>
                              {deleteError?.id === p.id && deleteError.remedies.includes('delete-listings') && (
                                <button
                                  onClick={() => clearListingsAndRetryDelete(p.id)}
                                  disabled={clearingListings === p.id}
                                  className="h-7 px-2.5 rounded-none border border-[#E8E8E8] text-[11px] text-[#6B6B6B] hover:border-[#370E4D]/40 hover:text-[#370E4D] transition-all duration-150"
                                  style={{ fontFamily: 'var(--font-league-spartan)' }}
                                >
                                  {clearingListings === p.id ? '…' : 'Listings löschen & erneut versuchen'}
                                </button>
                              )}
                              {deleteError?.id === p.id && deleteError.remedies.includes('archive') && (
                                <button
                                  onClick={() => archiveProduct(p.id)}
                                  disabled={archiving === p.id}
                                  className="h-7 px-2.5 rounded-none border border-[#E8E8E8] text-[11px] text-[#6B6B6B] hover:border-[#370E4D]/40 hover:text-[#370E4D] transition-all duration-150"
                                  style={{ fontFamily: 'var(--font-league-spartan)' }}
                                >
                                  {archiving === p.id ? '…' : 'Stattdessen archivieren'}
                                </button>
                              )}
                              <button
                                onClick={() => { setConfirmDelete(null); setDeleteError(null) }}
                                className="h-7 w-7 rounded-none border border-[#E8E8E8] flex items-center justify-center text-[#9B9B9B] hover:text-[#6B6B6B]"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {deleteError?.id === p.id && (
                              <p
                                className="max-w-[420px] text-[11px] leading-snug text-rose-700"
                                style={{ fontFamily: 'var(--font-league-spartan)' }}
                              >
                                {deleteError.message}
                              </p>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(p.id)}
                            className="h-7 w-7 rounded-none border border-[#E8E8E8] flex items-center justify-center text-[#C0C0BC] hover:border-rose-200 hover:text-rose-500 hover:bg-rose-50 transition-all duration-150"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </TD>
                  </TableRow>
                  {/* Expanded row */}
                  {expandedId === p.id && (
                    <tr className="bg-[#FAFAF8]">
                      <td colSpan={6} className="px-6 py-4 border-b border-[#F5F5F0]">
                        <div className="grid grid-cols-3 gap-4 text-[12px]">
                          {[
                            { label: 'Beschreibung', value: p.description || '—' },
                            { label: 'Material', value: (p as AdminApiProduct & { material?: string }).material || '—' },
                            { label: 'Herkunft', value: (p as AdminApiProduct & { originCountry?: string }).originCountry || '—' },
                          ].map(({ label, value }) => (
                            <div key={label}>
                              <p className="text-[9px] uppercase tracking-[0.1em] text-[#9B9B9B] mb-0.5" style={{ fontFamily: 'var(--font-league-spartan)' }}>{label}</p>
                              <p className="text-[#2D2D2D]" style={{ fontFamily: 'var(--font-league-spartan)' }}>{value}</p>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </SectionCard>

      {/* Summary bar */}
      <div className="flex items-center gap-4 text-[11px] text-[#9B9B9B]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
        <span>{products.length} Produkte gesamt</span>
        <span>·</span>
        <span className="text-[#1A5A3C]">{products.filter(p => isProductLive(p.status)).length} genehmigt</span>
        <span>·</span>
        <span className="text-[#7A5C1E]">{products.filter(p => p.status === 'PENDING').length} ausstehend</span>
        <span>·</span>
        <span className="text-[#8B1E3F]">{products.filter(p => p.status === 'REJECTED').length} abgelehnt</span>
        <button onClick={reload} className="ml-auto text-[#370E4D] hover:underline">Aktualisieren</button>
      </div>
    </div>
  )
}
