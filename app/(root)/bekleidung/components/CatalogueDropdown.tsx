'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const CATALOGUE_OPTIONS = [
  { id: 'streetwear',   label: 'Streetwear',   color: '#0011A5', href: '/bekleidung/streetwear'   },
  { id: 'experimental', label: 'Experimental', color: '#6C169C', href: '/bekleidung/experimental' },
  { id: 'athleisure',   label: 'Athleisure',   color: '#C01B1B', href: '/bekleidung/athleisure'   },
  { id: 'culture',      label: 'Culture',       color: '#EA9575', href: '/bekleidung/cultural'     },
  { id: 'star',         label: 'Star',         color: '#0A0A0A', href: '/bekleidung/star'         },
]

interface CatalogueDropdownProps {
  value?: string
  onChange?: (id: string) => void
  align?: 'left' | 'right'
  dropUp?: boolean
}

export default function CatalogueDropdown({
  value,
  onChange,
  align = 'right',
  dropUp = false,
}: CatalogueDropdownProps) {
  const [open, setOpen] = useState(false)
  // The entry under the pointer or keyboard focus; the row highlight glides to it.
  const [hovered, setHovered] = useState<number | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Detect active from current route first, fall back to prop value
  const activeId = CATALOGUE_OPTIONS.find(o => pathname === o.href)?.id ?? value ?? ''
  const activeOption = CATALOGUE_OPTIONS.find(o => o.id === activeId)
  const activeIndex = CATALOGUE_OPTIONS.findIndex(o => o.id === activeId)
  // At rest the highlight sits on the current line, or hides when there is none.
  const highlight = hovered ?? activeIndex

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const isActive = !!activeId
  const triggerColor = activeOption?.color ?? '#0A0A0A'

  return (
    <div ref={ref} style={{ position: 'relative' }}>

      {/* ── Trigger ── */}
      <button
        onClick={() => setOpen(p => !p)}
        aria-expanded={open}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          fontFamily: "'League Spartan', sans-serif",
          fontSize: 10,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: open ? '#370E4D' : isActive ? triggerColor : '#0A0A0A',
          fontWeight: isActive ? 600 : 400,
          transition: 'color 200ms cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {activeOption?.label ?? 'Catalogue'}
        <svg
          width="7" height="5" viewBox="0 0 8 6" fill="none"
          style={{
            flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 320ms cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <path
            d="M0 0C0 0 3.83 6 3.94 6C4.17 6 8 0 8 0H0Z"
            fill={open ? '#370E4D' : isActive ? triggerColor : '#0A0A0A'}
            style={{ transition: 'fill 200ms' }}
          />
        </svg>
      </button>

      {/* ── Dropdown panel ── */}
      <div
        className="catalogue-menu"
        data-open={open}
        data-direction={dropUp ? 'up' : 'down'}
        // Closed entries must not be reachable by keyboard or screen reader.
        inert={!open}
        onMouseLeave={() => setHovered(null)}
        style={{
          ...(dropUp ? { bottom: 'calc(100% + 16px)' } : { top: 'calc(100% + 18px)' }),
          ...(align === 'right' ? { right: 0 } : { left: 0 }),
        }}
      >
        <span
          aria-hidden
          className="catalogue-menu-highlight"
          style={{
            opacity: open && highlight >= 0 ? 1 : 0,
            transform: `translateY(calc(${Math.max(highlight, 0)} * var(--catalogue-row)))`,
            // The highlight's edge bar takes the line's own colour.
            color: CATALOGUE_OPTIONS[Math.max(highlight, 0)].color,
          }}
        />
        {CATALOGUE_OPTIONS.map((opt, i) => {
          const isItemActive = activeId === opt.id

          return (
            <Link
              key={opt.id}
              href={opt.href}
              onClick={() => { onChange?.(isItemActive ? '' : opt.id); setOpen(false) }}
              onMouseEnter={() => setHovered(i)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              aria-current={isItemActive ? 'page' : undefined}
              className="catalogue-menu-item"
              data-highlighted={highlight === i}
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              {/* Category colour dot */}
              <span className="catalogue-menu-dot" style={{ background: opt.color }} />
              {opt.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
