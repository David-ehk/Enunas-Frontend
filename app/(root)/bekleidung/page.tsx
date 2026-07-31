'use client'

import React, { Suspense, useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import PopularProductCard from '@/app/Homepage/components/PopularProductCard'
import { productApi, apiProductToCardShape } from '@/lib/api'
import type { ProductCardShape } from '@/lib/api'
import { useIsMobile } from '@/hooks/use-mobile'
import BlurFilterBar from './components/BlurFilterBar'
import SortDropdown from './components/SortDropdown'
import CatalogueDropdown from './components/CatalogueDropdown'
import CategoryNavigation from './components/CategoryNavigation'
import FilterSidebar, { FilterState, CATEGORIES, catMatchesProduct, parsePriceNum, genderMatchesProduct } from './components/FilterSidebar'

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

  const [navH, setNavH] = useState(60)
  useEffect(() => {
    const header = document.querySelector('header')
    if (header) setNavH(header.getBoundingClientRect().height)
  }, [])

  const [allProducts, setAllProducts]   = useState<ProductCardShape[]>([])
  const [loading, setLoading]           = useState(true)
  const catParam    = searchParams.get('cat')
  const genderParam = searchParams.get('gender')
  const [activeCat, setActiveCat] = useState(() =>
    catParam && CATEGORIES.some(c => c.id === catParam) ? catParam : 'alle'
  )
  const [gender, setGender] = useState<('damen' | 'herren')[]>(() =>
    genderParam === 'damen' ? ['damen'] : genderParam === 'herren' ? ['herren'] : []
  )
  const [filterOpen, setFilterOpen]     = useState(false)
  const [openSections, setOpenSections] = useState<string[]>(['kategorien'])
  const [filters, setFilters]           = useState<FilterState>({
    kategorien: [], farben: [], groessen: [], marken: [], sortieren: 'neu', catalogue: '',
  })

  // Keep activeCat in sync when the URL changes via CategoryNavigation links
  useEffect(() => {
    const cat = searchParams.get('cat')
    setActiveCat(cat && CATEGORIES.some(c => c.id === cat) ? cat : 'alle')
  }, [searchParams])

  useEffect(() => {
    setLoading(true)
    const p = searchQuery
      ? productApi.search(searchQuery).then(r => r.content.map(apiProductToCardShape))
      : productApi.list({ size: 200 }).then(r => r.content.map(apiProductToCardShape))
    p.then(setAllProducts).catch(() => setAllProducts([])).finally(() => setLoading(false))
  }, [searchQuery])

  useEffect(() => {
    document.body.style.overflow = filterOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [filterOpen])

  const availableMarken = useMemo(
    () => [...new Set(allProducts.map(p => p.brandName))].sort(),
    [allProducts]
  )

  const visibleProducts = useMemo(() => {
    let r = allProducts
    if (activeCat !== 'alle')           r = r.filter(p => catMatchesProduct(activeCat, p))
    if (gender.length > 0)              r = r.filter(p => genderMatchesProduct(gender, p))
    if (filters.kategorien.length > 0)  r = r.filter(p => filters.kategorien.some(k => catMatchesProduct(k, p)))
    if (filters.farben.length > 0)      r = r.filter(p => p.colours.some(c =>
      filters.farben.some(f =>
        (c.colorFamily ? c.colorFamily.toUpperCase() === f.toUpperCase() : false) ||
        c.name.toLowerCase() === f.toLowerCase()
      )
    ))
    if (filters.groessen.length > 0)    r = r.filter(p => p.sizes?.some(s => filters.groessen.includes(s)))
    if (filters.marken.length > 0)      r = r.filter(p => filters.marken.includes(p.brandName))
    if (filters.catalogue)              r = r.filter(p => (p.catalogue ?? []).some(c => c.toLowerCase() === filters.catalogue.toLowerCase()))
    if (filters.sortieren === 'preis-auf') return [...r].sort((a, b) => parsePriceNum(a.price) - parsePriceNum(b.price))
    if (filters.sortieren === 'preis-ab')  return [...r].sort((a, b) => parsePriceNum(b.price) - parsePriceNum(a.price))
    if (filters.sortieren === 'name')      return [...r].sort((a, b) => a.productName.localeCompare(b.productName))
    return r
  }, [allProducts, activeCat, gender, filters])

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
        <CategoryNavigation />
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
                : 'Zurzeit sind keine Artikel verfügbar'}
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
