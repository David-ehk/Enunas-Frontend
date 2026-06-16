'use client'

import { useState, useEffect, type RefObject } from 'react'
import SortDropdown from './SortDropdown'
import CatalogueDropdown from './CatalogueDropdown'
import { useIsMobile } from '@/hooks/use-mobile'

const GENDER_ACCENT: Record<'damen' | 'herren', string> = {
  damen:  '#C41E3A',
  herren: '#2457A3',
}

interface BlurFilterBarProps {
  watchRef: RefObject<HTMLElement | null>
  selectedGenders: ('damen' | 'herren')[]
  onGenderToggle: (g: 'damen' | 'herren') => void
  activeFilterCount: number
  onOpenFilter: () => void
  onOpenAt: (section: string) => void
  sortValue: string
  onSort: (id: string) => void
  catalogueValue: string
  onCatalogue: (id: string) => void
}

// ── Desktop sub-components ────────────────────────────────────────────────────

function Divider({ full = false }: { full?: boolean }) {
  return (
    <span style={{
      display: 'block',
      width: 1,
      alignSelf: full ? 'stretch' : undefined,
      height: full ? undefined : 14,
      background: '#E0E0E0',
      flexShrink: 0,
      margin: full ? '0' : '0 2px',
    }} />
  )
}

function BarButton({
  children,
  onClick,
  style: extraStyle,
}: {
  children: React.ReactNode
  onClick?: () => void
  style?: React.CSSProperties
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        padding: '15px 16px',
        fontFamily: "'League Spartan', sans-serif",
        fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
        whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8,
        color: hovered ? '#370E4D' : '#0A0A0A',
        transition: 'color 200ms cubic-bezier(0.16,1,0.3,1)',
        ...extraStyle,
      }}
    >
      {children}
    </button>
  )
}

function GenderButton({
  label, id, selectedGenders, onToggle, mobile = false,
}: {
  label: string
  id: 'damen' | 'herren'
  selectedGenders: ('damen' | 'herren')[]
  onToggle: (g: 'damen' | 'herren') => void
  mobile?: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const noneSelected = selectedGenders.length === 0
  const isSelected   = selectedGenders.includes(id)
  const isActive     = noneSelected || isSelected
  const accentColor  = GENDER_ACCENT[id]

  return (
    <button
      onClick={() => onToggle(id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: 'none', border: 'none', cursor: 'pointer',
        // Mobile: tall touch target, column layout with dot indicator
        // Desktop: horizontal with underline
        padding: mobile ? '0 10px' : '15px 16px 17px',
        minWidth: mobile ? 44 : undefined,
        minHeight: mobile ? 44 : undefined,
        display: 'flex',
        flexDirection: mobile ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: mobile ? 'center' : undefined,
        gap: mobile ? 5 : 0,
        fontFamily: "'League Spartan', sans-serif",
        fontSize: mobile ? 9 : 10,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        color: isActive ? (hovered && !isSelected ? '#370E4D' : '#0A0A0A') : '#BBBBBB',
        fontWeight: isSelected ? 600 : 400,
        transition: 'color 200ms cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {label}

      {mobile ? (
        /* Mobile: small colored dot below label */
        <span style={{
          width: isSelected ? 16 : 0,
          height: 2,
          background: accentColor,
          borderRadius: 1,
          transition: 'width 350ms cubic-bezier(0.16,1,0.3,1)',
          flexShrink: 0,
        }} />
      ) : (
        /* Desktop: colored underline animates with scaleX */
        <span style={{
          position: 'absolute',
          left: 16, right: 16, bottom: 8,
          height: 2,
          background: accentColor,
          borderRadius: 1,
          transformOrigin: 'left',
          transform: isSelected ? 'scaleX(1)' : 'scaleX(0)',
          transition: 'transform 350ms cubic-bezier(0.16,1,0.3,1)',
          pointerEvents: 'none',
        }} />
      )}
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function BlurFilterBar({
  watchRef,
  selectedGenders,
  onGenderToggle,
  activeFilterCount,
  onOpenFilter,
  onOpenAt,
  sortValue,
  onSort,
  catalogueValue,
  onCatalogue,
}: BlurFilterBarProps) {
  const [visible, setVisible] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    const onScroll = () => {
      if (!watchRef.current) return
      const gone = watchRef.current.getBoundingClientRect().bottom < 0
      setVisible(gone)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [watchRef])

  // ── Mobile: full-width bottom bar ─────────────────────────────────────────
  if (isMobile) {
    return (
      <div
        aria-hidden={!visible}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          pointerEvents: visible ? 'auto' : 'none',
          transition: 'transform 450ms cubic-bezier(0.16, 1, 0.3, 1)',
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'stretch',
          height: 56,
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(232, 232, 232, 0.9)',
          // Safe area for phones with home indicator
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}>

          {/* ── Section 1: Gender toggles ── */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            borderRight: '1px solid #E8E8E8',
          }}>
            <GenderButton
              label="Damen" id="damen"
              selectedGenders={selectedGenders}
              onToggle={onGenderToggle}
              mobile
            />
            <GenderButton
              label="Herren" id="herren"
              selectedGenders={selectedGenders}
              onToggle={onGenderToggle}
              mobile
            />
          </div>

          {/* ── Section 2: Filter ── */}
          <button
            onClick={onOpenFilter}
            style={{
              flex: 1,
              position: 'relative',
              background: 'none',
              border: 'none',
              borderRight: '1px solid #E8E8E8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'League Spartan', sans-serif",
              fontSize: 10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: activeFilterCount > 0 ? '#370E4D' : '#0A0A0A',
              fontWeight: activeFilterCount > 0 ? 600 : 400,
              transition: 'color 200ms',
              gap: 6,
            }}
          >
            Filter
            {activeFilterCount > 0 && (
              <span style={{
                background: '#370E4D',
                color: '#fff',
                fontSize: 8,
                width: 14,
                height: 14,
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontFamily: "'League Spartan', sans-serif",
                flexShrink: 0,
              }}>
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* ── Section 3: Sort dropdown ── */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}>
            <SortDropdown
              value={sortValue}
              onChange={onSort}
              align="right"
              dropUp
            />
          </div>

        </div>
      </div>
    )
  }

  // ── Desktop: centered floating pill ──────────────────────────────────────
  return (
    <div
      aria-hidden={!visible}
      style={{
        position: 'fixed',
        bottom: 28,
        left: '50%',
        zIndex: 50,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'transform 550ms cubic-bezier(0.16, 1, 0.3, 1), opacity 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        transform: visible
          ? 'translateX(-50%) translateY(0px)'
          : 'translateX(-50%) translateY(calc(100% + 36px))',
        opacity: visible ? 1 : 0,
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.90)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(232, 232, 232, 0.9)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05)',
      }}>

        <GenderButton label="Damen"  id="damen"  selectedGenders={selectedGenders} onToggle={onGenderToggle} />
        <GenderButton label="Herren" id="herren" selectedGenders={selectedGenders} onToggle={onGenderToggle} />

        <Divider />

        <div style={{ padding: '0 16px', display: 'flex', alignItems: 'center' }}>
          <CatalogueDropdown
            value={catalogueValue}
            onChange={onCatalogue}
            align="right"
            dropUp
          />
        </div>

        <Divider />

        <div style={{ position: 'relative' }}>
          <BarButton onClick={onOpenFilter}>Filter</BarButton>
          {activeFilterCount > 0 && (
            <span style={{
              position: 'absolute',
              top: 8, right: 6,
              background: '#370E4D', color: '#fff',
              fontSize: 8, width: 13, height: 13, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 600, fontFamily: "'League Spartan', sans-serif",
              pointerEvents: 'none',
            }}>
              {activeFilterCount}
            </span>
          )}
        </div>

        <Divider />

        <div style={{ padding: '0 20px 0 16px', display: 'flex', alignItems: 'center' }}>
          <SortDropdown value={sortValue} onChange={onSort} align="right" dropUp />
        </div>

      </div>
    </div>
  )
}
