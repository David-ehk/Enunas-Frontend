'use client'

import { useState, useEffect, type RefObject } from 'react'

interface BlurFilterBarProps {
  watchRef: RefObject<HTMLElement | null>
  gender: 'alle' | 'damen' | 'herren'
  onGenderToggle: (g: 'damen' | 'herren') => void
  activeFilterCount: number
  onOpenFilter: () => void
  onOpenAt: (section: string) => void
  resultCount: number
}

function Divider() {
  return (
    <span style={{
      display: 'block',
      width: 1,
      height: 14,
      background: '#E8E8E8',
      flexShrink: 0,
      margin: '0 2px',
    }} />
  )
}

function BarButton({
  children,
  onClick,
  active,
  style: extraStyle,
}: {
  children: React.ReactNode
  onClick?: () => void
  active?: boolean
  style?: React.CSSProperties
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '15px 16px',
        fontFamily: "'League Spartan', sans-serif",
        fontSize: 10,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        color: active === false
          ? '#BBBBBB'
          : hovered
          ? '#370E4D'
          : '#0A0A0A',
        fontWeight: active ? 500 : 400,
        transition: 'color 200ms cubic-bezier(0.16,1,0.3,1)',
        ...extraStyle,
      }}
    >
      {children}
    </button>
  )
}

export default function BlurFilterBar({
  watchRef,
  gender,
  onGenderToggle,
  activeFilterCount,
  onOpenFilter,
  onOpenAt,
  resultCount,
}: BlurFilterBarProps) {
  const [visible, setVisible] = useState(false)

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
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(232, 232, 232, 0.9)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05)',
      }}>

        {/* Gender toggles */}
        {(['Damen', 'Herren'] as const).map((label) => {
          const id = label.toLowerCase() as 'damen' | 'herren'
          const active = gender === 'alle' || gender === id
          return (
            <BarButton
              key={id}
              onClick={() => onGenderToggle(id)}
              active={active}
              style={{ color: active ? '#0A0A0A' : '#BBBBBB' }}
            >
              {label}
            </BarButton>
          )
        })}

        <Divider />

        <BarButton onClick={() => onOpenAt('marken')}>Marken</BarButton>
        <BarButton onClick={() => onOpenAt('kategorien')}>Kategorien</BarButton>

        <Divider />

        {/* Filter button with badge */}
        <div style={{ position: 'relative' }}>
          <BarButton onClick={onOpenFilter}>
            Filter
          </BarButton>
          {activeFilterCount > 0 && (
            <span style={{
              position: 'absolute',
              top: 8,
              right: 6,
              background: '#370E4D',
              color: '#fff',
              fontSize: 8,
              width: 13,
              height: 13,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontFamily: "'League Spartan', sans-serif",
              pointerEvents: 'none',
            }}>
              {activeFilterCount}
            </span>
          )}
        </div>

        <Divider />

        {/* Sort + article count */}
        <BarButton onClick={() => onOpenAt('sortieren')} style={{ paddingRight: 20 }}>
          Sortieren
          <span style={{
            fontSize: 9,
            letterSpacing: '0.06em',
            color: '#BBBBBB',
            fontWeight: 400,
          }}>
            {resultCount}
          </span>
        </BarButton>
      </div>
    </div>
  )
}
