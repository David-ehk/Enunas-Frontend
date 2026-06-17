'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import PopularProductCard from '@/app/Homepage/components/PopularProductCard'
import type { ProductCardShape } from '@/lib/api'
import { useIsMobile } from '@/hooks/use-mobile'
import FilterSidebar, { FilterState, CATEGORIES, catMatchesProduct, parsePriceNum, genderMatchesProduct } from './FilterSidebar'
import SortDropdown from './SortDropdown'
import BlurFilterBar from './BlurFilterBar'
import CategoryNavigation from './CategoryNavigation'

export interface CatalogueConfig {
  name: string
  slug: string
  tagline: string
  color: string
}

interface Props {
  initialProducts: ProductCardShape[]
  config: CatalogueConfig
}

export default function CatalogueContent({ initialProducts, config }: Props) {
  const isMobile     = useIsMobile()
  const filterBarRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()

  const [navH, setNavH] = useState(60)
  useEffect(() => {
    const header = document.querySelector('header')
    if (header) setNavH(header.getBoundingClientRect().height)
  }, [])

  const [activeCat, setActiveCat] = useState(() => {
    const cat = searchParams.get('cat')
    return cat && CATEGORIES.some(c => c.id === cat) ? cat : 'alle'
  })
  const [gender, setGender]             = useState<('damen' | 'herren')[]>([])
  const [filterOpen, setFilterOpen]     = useState(false)
  const [openSections, setOpenSections] = useState<string[]>(['kategorien'])
  const [filters, setFilters]           = useState<FilterState>({
    kategorien: [], farben: [], groessen: [], marken: [], sortieren: 'neu', catalogue: '',
  })

  useEffect(() => {
    const cat = searchParams.get('cat')
    setActiveCat(cat && CATEGORIES.some(c => c.id === cat) ? cat : 'alle')
  }, [searchParams])

  useEffect(() => {
    document.body.style.overflow = filterOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [filterOpen])

  const availableMarken = useMemo(
    () => [...new Set(initialProducts.map(p => p.brandName))].sort(),
    [initialProducts]
  )

  const visibleProducts = useMemo(() => {
    let r = initialProducts
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
    if (filters.sortieren === 'preis-auf') return [...r].sort((a, b) => parsePriceNum(a.price) - parsePriceNum(b.price))
    if (filters.sortieren === 'preis-ab')  return [...r].sort((a, b) => parsePriceNum(b.price) - parsePriceNum(a.price))
    if (filters.sortieren === 'name')      return [...r].sort((a, b) => a.productName.localeCompare(b.productName))
    return r
  }, [initialProducts, activeCat, gender, filters])

  const activeFilterCount = filters.kategorien.length + filters.farben.length + filters.groessen.length + filters.marken.length

  const toggleFilter = (key: keyof FilterState, val: string) =>
    setFilters(prev => {
      const arr = prev[key] as string[]
      return { ...prev, [key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] }
    })

  const resetFilters = () =>
    setFilters({ kategorien: [], farben: [], groessen: [], marken: [], sortieren: 'neu', catalogue: '' })

  const toggleGender = (g: 'damen' | 'herren') =>
    setGender(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])

  const openAt = (section: string) => {
    setOpenSections(prev => prev.includes(section) ? prev : [...prev, section])
    setFilterOpen(true)
  }

  const toggleSection = (id: string) =>
    setOpenSections(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])

  return (
    <div style={{ background: '#fff', fontFamily: "'League Spartan', sans-serif", color: '#0A0A0A', minHeight: '100vh' }}>

      {/* ── Coloured hero — "ENUNAS CATALOGUE" + title + tagline ── */}
      <section
        style={{
          position: 'relative',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          backgroundColor: config.color,
          minHeight: isMobile ? '380px' : '520px',
          padding: isMobile ? '80px 24px 80px' : '120px 24px 100px',
        }}
      >
        {/* Back breadcrumb */}
        <Link
          href="/bekleidung"
          style={{
            position: 'absolute',
            top: isMobile ? 24 : 32,
            left: isMobile ? 20 : 32,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'rgba(255,255,255,0.55)',
            fontFamily: "'League Spartan', sans-serif",
            fontSize: 10,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            transition: 'opacity 200ms ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.7' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M8 2L4 6l4 4" />
          </svg>
          Bekleidung
        </Link>

        {/* Eyebrow */}
        <span style={{
          display: 'block',
          marginBottom: 28,
          color: 'rgba(255,255,255,0.5)',
          fontFamily: "'League Spartan', sans-serif",
          fontSize: 10,
          letterSpacing: '0.45em',
          textTransform: 'uppercase',
        }}>
          Enunas Catalogue
        </span>

        {/* Title */}
        <h1 style={{
          color: '#fff',
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: isMobile ? 'clamp(52px, 16vw, 80px)' : 'clamp(68px, 10vw, 116px)',
          fontWeight: 300,
          lineHeight: 1,
          letterSpacing: '-0.01em',
          margin: '0 0 24px',
        }}>
          {config.name}
        </h1>

        {/* Tagline */}
        <p style={{
          color: 'rgba(255,255,255,0.78)',
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: isMobile ? 16 : 19,
          fontStyle: 'italic',
          lineHeight: 1.55,
          maxWidth: 380,
          margin: 0,
        }}>
          {config.tagline}
        </p>

        {/* Article count at bottom */}
        <div style={{
          position: 'absolute',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <span style={{ display: 'block', height: 1, width: 40, background: 'rgba(255,255,255,0.22)' }} />
          <span style={{
            color: 'rgba(255,255,255,0.45)',
            fontFamily: "'League Spartan', sans-serif",
            fontSize: 10,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}>
            {visibleProducts.length} Artikel
          </span>
          <span style={{ display: 'block', height: 1, width: 40, background: 'rgba(255,255,255,0.22)' }} />
        </div>
      </section>

      {/* ── Category strip — sticky, white ── */}
      <div style={{
        position: 'sticky',
        top: navH,
        zIndex: 20,
        background: '#fff',
        borderBottom: '1px solid #E8E8E8',
      }}>
        <CategoryNavigation basePath={`/bekleidung/${config.slug}`} />
      </div>

      {/* ── Filter bar — white, identical to /bekleidung ── */}
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
            const id          = label.toLowerCase() as 'damen' | 'herren'
            const noneSelected = gender.length === 0
            const isSelected  = gender.includes(id)
            const isActive    = noneSelected || isSelected
            const accentColor = id === 'damen' ? '#C41E3A' : '#2457A3'
            return (
              <button
                key={id}
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
                  fontWeight: isSelected ? 600 : 400,
                  transition: 'color 200ms cubic-bezier(0.16,1,0.3,1)',
                }}
              >
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
          <button
            onClick={() => setFilterOpen(true)}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
              color: '#0A0A0A', fontFamily: 'inherit', padding: 0,
              position: 'relative',
            }}
          >
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
        {visibleProducts.length === 0 ? (
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
              {initialProducts.length === 0 ? 'Keine Artikel verfügbar.' : 'Keine Artikel gefunden'}
            </p>
            {(activeFilterCount > 0 || activeCat !== 'alle') && (
              <>
                <p style={{
                  fontSize: 10,
                  color: '#9B9B9B',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  margin: '0 0 32px',
                }}>
                  Passe deine Filter an
                </p>
                <button
                  onClick={() => { resetFilters(); setActiveCat('alle') }}
                  style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
                    color: '#0A0A0A', fontFamily: 'inherit', padding: '2px 0',
                    borderBottom: '1px solid #0A0A0A',
                  }}
                >
                  Filter zurücksetzen
                </button>
              </>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            columnGap: isMobile ? 12 : 16,
            rowGap: isMobile ? 36 : 52,
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
        catalogueValue={config.slug}
        onCatalogue={() => {}}
      />
    </div>
  )
}
