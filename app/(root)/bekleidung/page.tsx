'use client'

import React, { Suspense, useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import PopularProductCard from '@/app/Homepage/components/PopularProductCard'
import { productApi, apiProductToCardShape } from '@/lib/api'
import type { ProductCardShape } from '@/lib/api'
import { useIsMobile } from '@/hooks/use-mobile'
import BlurFilterBar from './components/BlurFilterBar'
import SortDropdown from './components/SortDropdown'
import CatalogueDropdown from './components/CatalogueDropdown'

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
  { id: 'neu',       label: 'Neuheiten'         },
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
  catalogue:  string
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

// Custom checkbox / radio row — defined outside to preserve useState between renders
function CheckRow({ checked, onToggle, label, radio = false }: {
  checked: boolean
  onToggle: () => void
  label: string
  radio?: boolean
}) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={onToggle}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '11px 32px',
        cursor: 'pointer',
        background: hov ? '#F5F5F0' : 'transparent',
        transition: 'background 200ms ease',
        userSelect: 'none',
      }}
    >
      {/* Custom box / circle */}
      <div style={{
        width: 14,
        height: 14,
        flexShrink: 0,
        border: `1px solid ${checked ? '#0A0A0A' : hov ? '#888888' : '#CCCCCC'}`,
        borderRadius: radio ? '50%' : 0,
        background: (!radio && checked) ? '#0A0A0A' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'border-color 180ms ease, background 180ms ease',
      }}>
        {!radio && checked && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3.5 6L8 1" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        {radio && checked && (
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0A0A0A' }} />
        )}
      </div>
      <span style={{
        fontSize: 13,
        color: '#0A0A0A',
        letterSpacing: '0.01em',
        lineHeight: 1.4,
        flex: 1,
      }}>
        {label}
      </span>
    </div>
  )
}

// Color swatch button — large square like Gucci reference
function SwatchBtn({ name, hex, border, selected, onClick }: {
  name: string
  hex: string
  border?: boolean
  selected: boolean
  onClick: () => void
}) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={name}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
    >
      <div style={{
        width: '100%',
        aspectRatio: '1 / 1',
        background: hex,
        transform: hov && !selected ? 'scale(1.04)' : 'scale(1)',
        outline: selected
          ? '2px solid #0A0A0A'
          : border ? '1px solid #CCCCCC' : '1px solid transparent',
        outlineOffset: selected ? 2 : 0,
        transition: 'transform 280ms cubic-bezier(0.16,1,0.3,1), outline 160ms ease, outline-offset 160ms ease',
      }} />
      <span style={{
        display: 'block',
        marginTop: 7,
        fontSize: 11,
        color: selected ? '#0A0A0A' : '#6B6B6B',
        letterSpacing: '0.02em',
        lineHeight: 1.3,
        transition: 'color 160ms ease',
      }}>
        {name}
      </span>
    </button>
  )
}

function FilterSidebar({
  open, onClose, filters, setFilters,
  openSections, toggleSection, toggleFilter, resetFilters,
  resultCount, availableMarken,
}: FilterSidebarProps) {

  // Accordion section — stagger-animates on open via `open` closure + animDelay prop
  function Section({ id, label, children, animDelay = 0 }: { id: string; label: string; children: React.ReactNode; animDelay?: number }) {
    const isOpen = openSections.includes(id)
    const hasActive =
      (id === 'kategorien' && filters.kategorien.length > 0) ||
      (id === 'farben'     && filters.farben.length > 0)     ||
      (id === 'groessen'   && filters.groessen.length > 0)   ||
      (id === 'marken'     && filters.marken.length > 0)

    return (
      <div style={{
        borderBottom: '1px solid #EBEBEB',
        opacity: open ? 1 : 0,
        transform: open ? 'translateY(0)' : 'translateY(10px)',
        transition: open
          ? `opacity 420ms cubic-bezier(0.16,1,0.3,1) ${animDelay}ms, transform 420ms cubic-bezier(0.16,1,0.3,1) ${animDelay}ms`
          : 'opacity 120ms ease, transform 120ms ease',
      }}>
        <button
          onClick={() => toggleSection(id)}
          style={{
            width: '100%',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '19px 32px',
            fontFamily: 'inherit',
          }}
        >
          <span style={{
            fontSize: 13,
            color: '#0A0A0A',
            letterSpacing: '0.02em',
            fontWeight: hasActive ? 600 : 400,
          }}>
            {label}
          </span>
          <svg
            width="10" height="6" viewBox="0 0 10 6" fill="none"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 380ms cubic-bezier(0.16,1,0.3,1)',
              flexShrink: 0,
            }}
          >
            <path d="M1 1l4 4 4-4" stroke="#0A0A0A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* maxHeight transition for smooth open/close */}
        <div style={{
          overflow: 'hidden',
          maxHeight: isOpen ? 1200 : 0,
          transition: `max-height ${isOpen ? '520ms' : '300ms'} cubic-bezier(0.16,1,0.3,1)`,
        }}>
          {/* Fade + slight upward slide on open */}
          <div style={{
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'translateY(0)' : 'translateY(-6px)',
            transition: `opacity 260ms ease ${isOpen ? '90ms' : '0ms'}, transform 300ms cubic-bezier(0.16,1,0.3,1) ${isOpen ? '60ms' : '0ms'}`,
            paddingBottom: 8,
          }}>
            {children}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Scrim */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 998,
          background: 'rgba(10,8,14,0.36)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 420ms cubic-bezier(0.16,1,0.3,1)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed',
        top: 0, right: 0, bottom: 0,
        zIndex: 999,
        width: 'min(420px, 92vw)',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 620ms cubic-bezier(0.16,1,0.3,1)',
        boxShadow: '-4px 0 56px rgba(0,0,0,0.07)',
      }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '30px 32px 26px',
          borderBottom: '1px solid #EBEBEB',
          flexShrink: 0,
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(0)' : 'translateY(-4px)',
          transition: open
            ? 'opacity 350ms cubic-bezier(0.16,1,0.3,1) 50ms, transform 350ms cubic-bezier(0.16,1,0.3,1) 50ms'
            : 'opacity 100ms ease',
        }}>
          <span style={{
            fontFamily: "'League Spartan', sans-serif",
            fontSize: 11,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            fontWeight: 700,
            color: '#0A0A0A',
          }}>
            Filtern &amp; Sortieren
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <button
              onClick={resetFilters}
              onMouseEnter={e => { e.currentTarget.style.color = '#0A0A0A' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#888888' }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                fontFamily: 'inherit',
                fontSize: 12,
                color: '#888888',
                textDecoration: 'underline',
                textUnderlineOffset: 3,
                transition: 'color 180ms ease',
              }}
            >
              Alle löschen
            </button>
            <button
              onClick={onClose}
              onMouseEnter={e => { e.currentTarget.style.background = '#2D2D2D' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#0A0A0A' }}
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: '#0A0A0A',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 200ms ease',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Scrollable body — rows manage their own horizontal padding ── */}
        <div style={{ flex: 1, overflowY: 'auto' }}>

          <Section id="kategorien" label="Kategorien" animDelay={90}>
            {SIDEBAR_CATEGORIES.map(k => (
              <CheckRow
                key={k.id}
                checked={filters.kategorien.includes(k.id)}
                onToggle={() => toggleFilter('kategorien', k.id)}
                label={k.label}
              />
            ))}
          </Section>

          <Section id="farben" label="Farben" animDelay={130}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 10,
              padding: '4px 32px 0',
            }}>
              {FARBEN.map(f => (
                <SwatchBtn
                  key={f.name}
                  name={f.name}
                  hex={f.hex}
                  border={f.border}
                  selected={filters.farben.includes(f.name)}
                  onClick={() => toggleFilter('farben', f.name)}
                />
              ))}
            </div>
          </Section>

          <Section id="groessen" label="Größen" animDelay={170}>
            {GROESSEN.map(g => (
              <CheckRow
                key={g}
                checked={filters.groessen.includes(g)}
                onToggle={() => toggleFilter('groessen', g)}
                label={g}
              />
            ))}
          </Section>

          <Section id="marken" label="Marken" animDelay={210}>
            {availableMarken.length === 0
              ? (
                <p style={{
                  fontSize: 13,
                  color: '#9B9B9B',
                  padding: '10px 32px',
                  fontStyle: 'italic',
                  margin: 0,
                }}>
                  Keine verfügbar
                </p>
              )
              : availableMarken.map(m => (
                <CheckRow
                  key={m}
                  checked={filters.marken.includes(m)}
                  onToggle={() => toggleFilter('marken', m)}
                  label={m}
                />
              ))
            }
          </Section>

          <Section id="sortieren" label="Sortieren nach" animDelay={250}>
            {SORT_OPTIONS.map(s => (
              <CheckRow
                key={s.id}
                checked={filters.sortieren === s.id}
                onToggle={() => setFilters(prev => ({ ...prev, sortieren: s.id }))}
                label={s.label}
                radio
              />
            ))}
          </Section>

        </div>

        {/* ── CTA ── */}
        <div style={{
          padding: '20px 32px 32px',
          flexShrink: 0,
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(0)' : 'translateY(6px)',
          transition: open
            ? 'opacity 380ms cubic-bezier(0.16,1,0.3,1) 320ms, transform 380ms cubic-bezier(0.16,1,0.3,1) 320ms'
            : 'opacity 100ms ease',
        }}>
          <button
            onClick={onClose}
            onMouseEnter={e => { e.currentTarget.style.background = '#1E1E1E' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#0A0A0A' }}
            style={{
              width: '100%',
              padding: '17px 0',
              background: '#0A0A0A',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontFamily: "'League Spartan', sans-serif",
              fontSize: 10,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              fontWeight: 600,
              transition: 'background 220ms ease',
            }}
          >
            {resultCount} Artikel anzeigen
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
  const isMobile      = useIsMobile()

  const filterBarRef = useRef<HTMLDivElement>(null)

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
  const [gender, setGender]             = useState<('damen' | 'herren')[]>([])
  const [filterOpen, setFilterOpen]     = useState(false)
  const [openSections, setOpenSections] = useState<string[]>(['kategorien'])
  const [filters, setFilters]           = useState<FilterState>({
    kategorien: [], farben: [], groessen: [], marken: [], sortieren: 'neu', catalogue: '',
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
    if (filters.catalogue)              r = r.filter(p => (p.catalogue ?? []).includes(filters.catalogue))
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

  const resetFilters = () => setFilters({ kategorien: [], farben: [], groessen: [], marken: [], sortieren: 'neu', catalogue: '' })
  const toggleGender = (g: 'damen' | 'herren') =>
    setGender(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])
  const openAt = (section: string) => {
    setOpenSections(prev => prev.includes(section) ? prev : [...prev, section])
    setFilterOpen(true)
  }
  const toggleSection = (id: string) =>
    setOpenSections(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])

  const pageTitle = searchQuery ? `Suchergebnisse für „${searchQuery}"` : 'Bekleidung'

  return (
    <div style={{ background: '#fff', fontFamily: "'League Spartan', sans-serif", color: '#0A0A0A', minHeight: '100vh' }}>

      {/* ── Editorial header ── */}
      <section style={{ textAlign: 'center', padding: isMobile ? '40px 20px 36px' : '72px 24px 56px', borderBottom: '1px solid #E8E8E8' }}>
        {!searchQuery && (
          <p style={{
            fontFamily: 'inherit',
            fontSize: 9,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: '#9B9B9B',
            margin: '0 0 16px',
            fontWeight: 400,
          }}>
            Neue Kollektion 2026
          </p>
        )}
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(36px, 10vw, 88px)',
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

      {/* ── Category strip — sticky flush below navbar ── */}
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
          padding: isMobile ? '0 16px' : '0 48px',
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

      {/* ── Filter bar ── */}
      <div ref={filterBarRef} style={{
        maxWidth: 1800,
        margin: '0 auto',
        padding: isMobile ? '12px 16px' : '14px 48px',
        borderBottom: '1px solid #E8E8E8',
        display: 'flex',
        flexWrap: isMobile ? 'wrap' : 'nowrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: isMobile ? '10px' : 0,
      }}>

        {/* Left — gender toggles */}
        <div style={{ display: 'flex', gap: 0, alignItems: 'center' }}>
          {(['Damen', 'Herren'] as const).map((label) => {
            const id = label.toLowerCase() as 'damen' | 'herren'
            const noneSelected = gender.length === 0
            const isSelected   = gender.includes(id)
            const isActive     = noneSelected || isSelected
            const accentColor  = id === 'damen' ? '#C41E3A' : '#2457A3'
            return (
              <button key={id}
                onClick={() => toggleGender(id)}
                style={{
                  position: 'relative',
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '2px 16px 5px 0',
                  fontFamily: 'inherit',
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: isActive ? '#0A0A0A' : '#BBBBBB',
                  fontWeight: isSelected ? 600 : isActive ? 400 : 400,
                  transition: 'color 200ms cubic-bezier(0.16,1,0.3,1)',
                }}>
                {label}
                <span style={{
                  position: 'absolute',
                  left: 0,
                  right: 16,
                  bottom: 0,
                  height: 2,
                  background: accentColor,
                  transformOrigin: 'left',
                  transform: isSelected ? 'scaleX(1)' : 'scaleX(0)',
                  transition: 'transform 350ms cubic-bezier(0.16,1,0.3,1)',
                  borderRadius: 1,
                }} />
              </button>
            )
          })}
        </div>

        {/* Right — filter controls */}
        <div style={{ display: 'flex', gap: isMobile ? 16 : 24, alignItems: 'center' }}>
          {!isMobile && (
            <CatalogueDropdown
              value={filters.catalogue}
              onChange={(id) => setFilters(prev => ({ ...prev, catalogue: id }))}
              align="right"
            />
          )}

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

          <SortDropdown
            value={filters.sortieren}
            onChange={(id) => setFilters(prev => ({ ...prev, sortieren: id }))}
            align="right"
          />
        </div>
      </div>

      {/* ── Product grid ── */}
      <section style={{
        maxWidth: 1800,
        margin: '0 auto',
        padding: isMobile ? '24px 16px 72px' : '40px 48px 96px',
      }}>
        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            columnGap: isMobile ? 12 : 16, rowGap: isMobile ? 36 : 48,
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
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            columnGap: isMobile ? 12 : 16, rowGap: isMobile ? 36 : 52,
          }}>
            {visibleProducts.map(p => (
              <PopularProductCard key={p.id} {...p} />
            ))}
          </div>
        )}
      </section>

      {/* ── Filter sidebar ── */}
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

      {/* ── Floating blur filter bar ── */}
      <BlurFilterBar
        watchRef={filterBarRef}
        selectedGenders={gender}
        onGenderToggle={toggleGender}
        activeFilterCount={activeFilterCount}
        onOpenFilter={() => setFilterOpen(true)}
        onOpenAt={openAt}
        sortValue={filters.sortieren}
        onSort={(id) => setFilters(prev => ({ ...prev, sortieren: id }))}
        catalogueValue={filters.catalogue}
        onCatalogue={(id) => setFilters(prev => ({ ...prev, catalogue: id }))}
      />
    </div>
  )
}
