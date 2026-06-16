'use client'

import React, { Suspense, useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import PopularProductCard from '@/app/Homepage/components/PopularProductCard'
import { productApi, apiProductToCardShape } from '@/lib/api'
import type { ProductCardShape } from '@/lib/api'

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'alle',        label: 'Alle ansehen'          },
  { id: 'oberteile',   label: 'Oberteile'             },
  { id: 'hoodies',     label: 'Hoodies & Sweatshirts' },
  { id: 'jacken',      label: 'Jacken'                },
  { id: 'tshirts',     label: 'T-Shirts'              },
  { id: 'strick',      label: 'Pullover & Strick'     },
  { id: 'hemden',      label: 'Hemden'                },
  { id: 'hosen',       label: 'Hosen'                 },
  { id: 'jeans',       label: 'Jeans'                 },
  { id: 'jogger',      label: 'Jogger'                },
  { id: 'shorts',      label: 'Shorts'                },
  { id: 'accessoires', label: 'Accessoires'           },
]

const SIDEBAR_CATEGORIES = CATEGORIES.filter(c => c.id !== 'alle')

const FARBEN = [
  { name: 'Schwarz', hex: '#0A0A0A' },
  { name: 'Weiß',    hex: '#F0EEE8', border: true },
  { name: 'Beige',   hex: '#DCD5C1' },
  { name: 'Braun',   hex: '#5C2E1F' },
  { name: 'Grau',    hex: '#888888' },
  { name: 'Blau',    hex: '#0011A5' },
  { name: 'Lila',    hex: '#6C169C' },
  { name: 'Grün',    hex: '#1A5A3C' },
  { name: 'Rot',     hex: '#C01B1B' },
]

const GROESSEN = ['XS','S','M','L','XL','XXL','28','30','32','34','36','38','40','42','44','46']

const SORT_OPTIONS = [
  { id: 'neu',       label: 'Neuankömmlinge'    },
  { id: 'preis-auf', label: 'Preis aufsteigend' },
  { id: 'preis-ab',  label: 'Preis absteigend'  },
  { id: 'name',      label: 'Name A–Z'          },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function parsePriceNum(price: string): number {
  return parseFloat(price.replace('€', '').replace(',', '.').trim()) || 0
}

function catMatchesProduct(catId: string, p: ProductCardShape): boolean {
  const sub = p.subcategory ?? ''
  const cat = p.catalogue ?? []
  const MAP: Record<string, string[]> = {
    hoodies:     ['hoodie', 'hoodies'],
    tshirts:     ['tshirts', 't-shirts', 'tshirt'],
    strick:      ['sweater', 'strick', 'pullover'],
    hemden:      ['hemden', 'hemd'],
    jeans:       ['jeans', 'denim'],
    jogger:      ['jogging', 'jogger'],
    shorts:      ['shorts'],
    oberteile:   ['oberteile'],
    jacken:      ['jacken', 'jacket'],
    hosen:       ['hosen', 'pants'],
    accessoires: ['accessoires', 'accessory'],
  }
  const aliases = MAP[catId] ?? [catId]
  return aliases.some(a => sub === a || cat.includes(a))
}

// ── Filter State Type ─────────────────────────────────────────────────────────

interface FilterState {
  kategorien: string[]
  farben:     string[]
  groessen:   string[]
  marken:     string[]
  sortieren:  string
}

// ── Filter Sidebar ────────────────────────────────────────────────────────────

interface FilterSidebarProps {
  open:           boolean
  onClose:        () => void
  filters:        FilterState
  setFilters:     React.Dispatch<React.SetStateAction<FilterState>>
  openSections:   string[]
  toggleSection:  (id: string) => void
  toggleFilter:   (key: keyof FilterState, val: string) => void
  resetFilters:   () => void
  resultCount:    number
  availableMarken: string[]
}

function FilterSidebar({
  open, onClose, filters, setFilters,
  openSections, toggleSection, toggleFilter, resetFilters,
  resultCount, availableMarken,
}: FilterSidebarProps) {

  function Accordion({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
    const isOpen = openSections.includes(id)
    const hasActive =
      (id === 'kategorien' && filters.kategorien.length > 0) ||
      (id === 'farben'     && filters.farben.length > 0)     ||
      (id === 'groessen'   && filters.groessen.length > 0)   ||
      (id === 'marken'     && filters.marken.length > 0)

    return (
      <div style={{ borderBottom: '1px solid #E8E8E8' }}>
        <button onClick={() => toggleSection(id)} style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 0', fontFamily: 'inherit',
        }}>
          <span style={{
            fontSize: 13, letterSpacing: '0.05em',
            color: hasActive ? '#370E4D' : '#0A0A0A',
            fontWeight: hasActive ? 500 : 400,
            transition: 'color 200ms',
          }}>
            {label}
          </span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke={hasActive ? '#370E4D' : '#6B6B6B'} strokeWidth="1.5" strokeLinecap="round"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 360ms cubic-bezier(0.16,1,0.3,1)',
              flexShrink: 0,
            }}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        <div style={{
          overflow: 'hidden',
          maxHeight: isOpen ? 600 : 0,
          opacity: isOpen ? 1 : 0,
          transition: 'max-height 400ms cubic-bezier(0.16,1,0.3,1), opacity 250ms ease',
        }}>
          <div style={{ paddingBottom: 16 }}>{children}</div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Scrim */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 998,
        background: 'rgba(10,8,14,0.45)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity 400ms cubic-bezier(0.16,1,0.3,1)',
        backdropFilter: 'blur(1px)',
      }} />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 999,
        width: 400, background: '#fff',
        display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 600ms cubic-bezier(0.16,1,0.3,1)',
        boxShadow: '-16px 0 56px rgba(0,0,0,0.12)',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '24px 28px 20px', borderBottom: '1px solid #E8E8E8', flexShrink: 0,
        }}>
          <span style={{
            fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase',
            fontWeight: 600, color: '#0A0A0A',
          }}>
            Filtern &amp; Sortieren
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={resetFilters} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.06em',
              color: '#6B6B6B', textDecoration: 'underline', textUnderlineOffset: 3,
            }}>
              Alle löschen
            </button>
            <button onClick={onClose} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 6,
              display: 'flex', color: '#0A0A0A', marginRight: -6,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 28px' }}>

          <Accordion id="kategorien" label="Kategorien">
            {SIDEBAR_CATEGORIES.map(k => {
              const on = filters.kategorien.includes(k.id)
              return (
                <label key={k.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 0', cursor: 'pointer', borderBottom: '1px solid #F5F5F0',
                }}>
                  <span style={{ fontSize: 13, color: on ? '#370E4D' : '#2D2D2D', transition: 'color 150ms' }}>
                    {k.label}
                  </span>
                  <input type="checkbox" checked={on}
                    onChange={() => toggleFilter('kategorien', k.id)}
                    style={{ accentColor: '#370E4D', width: 13, height: 13, cursor: 'pointer' }} />
                </label>
              )
            })}
          </Accordion>

          <Accordion id="farben" label="Farben">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, paddingTop: 4 }}>
              {FARBEN.map(f => {
                const on = filters.farben.includes(f.name)
                return (
                  <button key={f.name} onClick={() => toggleFilter('farben', f.name)} title={f.name}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{
                      width: 24, height: 24,
                      background: f.hex,
                      border: on ? '2px solid #370E4D' : `1px solid ${f.border ? '#CCC' : 'transparent'}`,
                      outline: on ? '2px solid #fff' : 'none',
                      outlineOffset: on ? -3 : 0,
                      boxShadow: '0 0 0 1px #E8E8E8',
                      transition: 'all 150ms',
                    }} />
                    <span style={{ fontSize: 9, color: '#6B6B6B', letterSpacing: '0.08em', lineHeight: 1 }}>
                      {f.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </Accordion>

          <Accordion id="groessen" label="Größen">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, paddingTop: 4 }}>
              {GROESSEN.map(g => {
                const on = filters.groessen.includes(g)
                return (
                  <button key={g} onClick={() => toggleFilter('groessen', g)} style={{
                    padding: '6px 10px',
                    border: on ? '1px solid #0A0A0A' : '1px solid #E8E8E8',
                    background: on ? '#0A0A0A' : 'transparent',
                    color: on ? '#fff' : '#0A0A0A',
                    fontSize: 11, letterSpacing: '0.08em',
                    cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all 150ms',
                  }}>{g}</button>
                )
              })}
            </div>
          </Accordion>

          <Accordion id="marken" label="Marken">
            {availableMarken.length === 0
              ? <p style={{ fontSize: 12, color: '#9B9B9B', padding: '8px 0', fontStyle: 'italic' }}>Keine verfügbar</p>
              : availableMarken.map(m => {
                const on = filters.marken.includes(m)
                return (
                  <label key={m} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 0', cursor: 'pointer', borderBottom: '1px solid #F5F5F0',
                  }}>
                    <span style={{ fontSize: 13, color: on ? '#370E4D' : '#2D2D2D', transition: 'color 150ms' }}>
                      {m}
                    </span>
                    <input type="checkbox" checked={on}
                      onChange={() => toggleFilter('marken', m)}
                      style={{ accentColor: '#370E4D', width: 13, height: 13, cursor: 'pointer' }} />
                  </label>
                )
              })
            }
          </Accordion>

          <Accordion id="sortieren" label="Sortieren nach">
            {SORT_OPTIONS.map(s => {
              const on = filters.sortieren === s.id
              return (
                <label key={s.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 0', cursor: 'pointer', borderBottom: '1px solid #F5F5F0',
                }}>
                  <span style={{ fontSize: 13, color: on ? '#370E4D' : '#2D2D2D', transition: 'color 150ms' }}>
                    {s.label}
                  </span>
                  <input type="radio" name="sb-sort" value={s.id} checked={on}
                    onChange={() => setFilters(prev => ({ ...prev, sortieren: s.id }))}
                    style={{ accentColor: '#370E4D', width: 13, height: 13, cursor: 'pointer' }} />
                </label>
              )
            })}
          </Accordion>

        </div>

        {/* Bottom CTA */}
        <div style={{ padding: '16px 28px 24px', flexShrink: 0, borderTop: '1px solid #E8E8E8' }}>
          <button onClick={onClose} style={{
            width: '100%', padding: '16px 0',
            background: '#0A0A0A', color: '#fff', border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 10, letterSpacing: '0.26em', textTransform: 'uppercase',
            transition: 'background 200ms',
          }}>
            {resultCount} {resultCount === 1 ? 'Artikel' : 'Artikel'} anzeigen
          </button>
        </div>
      </div>
    </>
  )
}

// ── Loading Skeletons ─────────────────────────────────────────────────────────

function ProductSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-[3/4] bg-[#F5F5F0] animate-pulse" />
      <div className="h-2.5 w-1/2 bg-[#F0EFEA] animate-pulse" />
      <div className="h-3.5 w-2/3 bg-[#F0EFEA] animate-pulse" />
      <div className="h-2.5 w-1/4 bg-[#F0EFEA] animate-pulse" />
    </div>
  )
}

// ── Suspense Wrapper ──────────────────────────────────────────────────────────

export default function BekleidungPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <BekleidungContent />
    </Suspense>
  )
}

// ── Main Content ──────────────────────────────────────────────────────────────

function BekleidungContent() {
  const searchParams  = useSearchParams()
  const searchQuery   = searchParams.get('q') || ''

  // Measure the fixed navbar height at runtime so the category strip
  // sticks flush beneath it with zero gap.
  const [navH, setNavH] = useState(60)

  useEffect(() => {
    const header = document.querySelector('header')
    if (header) setNavH(header.getBoundingClientRect().height)
  }, [])

  // Product data
  const [allProducts, setAllProducts]   = useState<ProductCardShape[]>([])
  const [loading, setLoading]           = useState(true)

  // Filter state
  const [activeCat, setActiveCat]       = useState('alle')
  const [gender, setGender]             = useState<'alle' | 'damen' | 'herren'>('alle')
  const [filterOpen, setFilterOpen]     = useState(false)
  const [openSections, setOpenSections] = useState<string[]>(['kategorien'])
  const [filters, setFilters]           = useState<FilterState>({
    kategorien: [], farben: [], groessen: [], marken: [], sortieren: 'neu',
  })

  // Fetch
  useEffect(() => {
    setLoading(true)
    const p = searchQuery
      ? productApi.search(searchQuery).then(r => r.content.map(apiProductToCardShape))
      : productApi.list({ size: 200 }).then(r => r.content.map(apiProductToCardShape))
    p.then(setAllProducts).catch(() => setAllProducts([])).finally(() => setLoading(false))
  }, [searchQuery])

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = filterOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [filterOpen])

  // Derived options
  const availableMarken = useMemo(
    () => [...new Set(allProducts.map(p => p.brandName))].sort(),
    [allProducts]
  )

  // Client-side filtering + sorting
  const visibleProducts = useMemo(() => {
    let r = allProducts
    if (activeCat !== 'alle')           r = r.filter(p => catMatchesProduct(activeCat, p))
    if (filters.kategorien.length > 0)  r = r.filter(p => filters.kategorien.some(k => catMatchesProduct(k, p)))
    if (filters.farben.length > 0)      r = r.filter(p => p.colours.some(c => filters.farben.includes(c.name)))
    if (filters.groessen.length > 0)    r = r.filter(p => p.sizes?.some(s => filters.groessen.includes(s)))
    if (filters.marken.length > 0)      r = r.filter(p => filters.marken.includes(p.brandName))
    if (filters.sortieren === 'preis-auf') return [...r].sort((a, b) => parsePriceNum(a.price) - parsePriceNum(b.price))
    if (filters.sortieren === 'preis-ab')  return [...r].sort((a, b) => parsePriceNum(b.price) - parsePriceNum(a.price))
    if (filters.sortieren === 'name')      return [...r].sort((a, b) => a.productName.localeCompare(b.productName))
    return r
  }, [allProducts, activeCat, filters])

  const activeFilterCount = filters.kategorien.length + filters.farben.length + filters.groessen.length + filters.marken.length

  const toggleFilter = (key: keyof FilterState, val: string) =>
    setFilters(prev => {
      const arr = prev[key] as string[]
      return { ...prev, [key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] }
    })

  const resetFilters = () => setFilters({ kategorien: [], farben: [], groessen: [], marken: [], sortieren: 'neu' })
  const openAt = (section: string) => {
    setOpenSections(prev => prev.includes(section) ? prev : [...prev, section])
    setFilterOpen(true)
  }
  const toggleSection = (id: string) =>
    setOpenSections(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])

  const pageTitle = searchQuery ? `Suchergebnisse für „${searchQuery}"` : 'Bekleidung'

  return (
    <div style={{ background: '#fff', fontFamily: "'League Spartan', sans-serif", color: '#0A0A0A', minHeight: '100vh' }}>

      {/* ── Editorial header ── above strip so it's always visible on load ─ */}
      <section style={{ textAlign: 'center', padding: '72px 24px 56px', borderBottom: '1px solid #E8E8E8' }}>
        {!searchQuery && (
          <p style={{
            fontFamily: 'inherit',
            fontSize: 9,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: '#9B9B9B',
            margin: '0 0 20px',
            fontWeight: 400,
          }}>
            Neue Kollektion 2026
          </p>
        )}
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(52px, 6.5vw, 88px)',
          fontWeight: 300,
          letterSpacing: searchQuery ? '0.01em' : '0.06em',
          margin: 0,
          lineHeight: 0.95,
          color: '#0A0A0A',
          textTransform: searchQuery ? 'none' : 'uppercase',
        }}>
          {pageTitle}
        </h1>
        {!searchQuery && (
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontSize: 'clamp(15px, 1.5vw, 18px)',
            fontWeight: 400,
            color: '#6B6B6B',
            maxWidth: 420,
            margin: '22px auto 0',
            lineHeight: 1.65,
            letterSpacing: '0.01em',
          }}>
            Kuratierte Auswahl an Premium-Streetwear und Designermode.
          </p>
        )}
        <p style={{
          fontSize: 10,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#BBBBBB',
          margin: '20px 0 0',
          fontFamily: 'inherit',
        }}>
          {loading ? '—' : `${visibleProducts.length} Artikel`}
        </p>
      </section>

      {/* ── Category strip ── sticky flush below navbar ───────────────────── */}
      <div style={{
        position: 'sticky',
        top: navH,
        zIndex: 20,
        background: '#fff',
        borderBottom: '1px solid #E8E8E8',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          maxWidth: 1800,
          margin: '0 auto',
          padding: '0 48px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}>
          {CATEGORIES.map(c => {
            const active = activeCat === c.id
            return (
              <button
                key={c.id}
                onClick={() => setActiveCat(c.id)}
                style={{
                  position: 'relative',
                  flexShrink: 0,
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: active ? '#0A0A0A' : '#9B9B9B',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '18px 20px',
                  whiteSpace: 'nowrap',
                  fontWeight: active ? 500 : 400,
                  fontFamily: 'inherit',
                  transition: 'color 300ms cubic-bezier(0.16,1,0.3,1)',
                }}
              >
                {c.label}
                <span style={{
                  position: 'absolute',
                  left: 20,
                  right: 20,
                  bottom: 0,
                  height: 1,
                  background: '#0A0A0A',
                  transform: active ? 'scaleX(1)' : 'scaleX(0)',
                  transformOrigin: active ? 'left' : 'right',
                  transition: 'transform 400ms cubic-bezier(0.16,1,0.3,1)',
                }} />
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Filter bar ───────────────────────────────────────────────────── */}
      <div style={{
        maxWidth: 1800,
        margin: '0 auto',
        padding: '14px 48px',
        borderBottom: '1px solid #E8E8E8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>

        {/* Left — gender toggles */}
        <div style={{ display: 'flex', gap: 0, alignItems: 'center' }}>
          {(['Damen', 'Herren'] as const).map((label, i) => {
            const id = label.toLowerCase() as 'damen' | 'herren'
            const active = gender === 'alle' || gender === id
            return (
              <button key={id}
                onClick={() => setGender(prev => prev === id ? 'alle' : id)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '0 16px 0 0',
                  fontFamily: 'inherit',
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: active ? '#0A0A0A' : '#BBBBBB',
                  fontWeight: active ? 500 : 400,
                  transition: 'color 200ms cubic-bezier(0.16,1,0.3,1)',
                  paddingLeft: i === 0 ? 0 : 0,
                }}>
                {label}
              </button>
            )
          })}
        </div>

        {/* Right — filter controls */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          {[
            { label: 'Marken',     section: 'marken'     },
            { label: 'Kategorien', section: 'kategorien' },
          ].map(({ label, section }) => (
            <button key={section} onClick={() => openAt(section)} style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
              color: '#0A0A0A', fontFamily: 'inherit', padding: 0,
              transition: 'color 200ms',
            }}>
              {label}
            </button>
          ))}

          <button onClick={() => setFilterOpen(true)} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: '#0A0A0A', fontFamily: 'inherit', padding: 0,
            position: 'relative',
          }}>
            Filter
            {activeFilterCount > 0 && (
              <span style={{
                position: 'absolute', top: -7, right: -11,
                background: '#370E4D', color: '#fff', fontSize: 8,
                width: 13, height: 13, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 600,
              }}>
                {activeFilterCount}
              </span>
            )}
          </button>

          <span style={{ width: 1, height: 12, background: '#D8D8D8', flexShrink: 0 }} />

          <button onClick={() => openAt('sortieren')} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: '#0A0A0A', fontFamily: 'inherit', padding: 0,
          }}>
            Sortieren
          </button>
        </div>
      </div>

      {/* ── Product grid ────────────────────────────────────────────────── */}
      <section style={{
        maxWidth: 1800,
        margin: '0 auto',
        padding: '40px 48px 96px',
      }}>
        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            columnGap: 16, rowGap: 48,
          }}>
            {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : visibleProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0 140px' }}>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontSize: 30,
              fontWeight: 300,
              color: '#0A0A0A',
              margin: '0 0 12px',
              letterSpacing: '0.01em',
            }}>
              Keine Artikel gefunden
            </p>
            <p style={{ fontSize: 10, color: '#9B9B9B', letterSpacing: '0.16em', textTransform: 'uppercase', margin: '0 0 32px' }}>
              {activeFilterCount > 0 || activeCat !== 'alle'
                ? 'Passe deine Filter an'
                : 'Bitte melde dich an, um die Kollektion zu sehen'}
            </p>
            {(activeFilterCount > 0 || activeCat !== 'alle') && (
              <button onClick={() => { resetFilters(); setActiveCat('alle') }} style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
                color: '#0A0A0A', fontFamily: 'inherit', padding: '2px 0',
                borderBottom: '1px solid #0A0A0A',
              }}>
                Filter zurücksetzen
              </button>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            columnGap: 16, rowGap: 52,
          }}>
            {visibleProducts.map(p => (
              <PopularProductCard key={p.id} {...p} />
            ))}
          </div>
        )}
      </section>

      {/* ── Filter sidebar ──────────────────────────────────────────────── */}
      <FilterSidebar
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        openSections={openSections}
        toggleSection={toggleSection}
        toggleFilter={toggleFilter}
        resetFilters={resetFilters}
        resultCount={visibleProducts.length}
        availableMarken={availableMarken}
      />
    </div>
  )
}
