'use client'

import { useState, useRef, useEffect } from 'react'
import { STANDARD_SORTS, type ProductSort } from '@/lib/productSorts'

interface SortDropdownProps {
  /** Defaults to STANDARD_SORTS. */
  sorts?: ProductSort[]
  value: string
  onChange: (id: string) => void
  align?: 'left' | 'right'
  dropUp?: boolean
}

export default function SortDropdown({
  sorts = STANDARD_SORTS,
  value,
  onChange,
  align = 'right',
  dropUp = false,
}: SortDropdownProps) {
  const [open, setOpen] = useState(false)
  // The entry under the pointer or keyboard focus; the row highlight glides to it.
  const [hovered, setHovered] = useState<number | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  // At rest the highlight sits on the current sort.
  const highlight = hovered ?? sorts.findIndex(o => o.id === value)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

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
          color: open ? '#370E4D' : '#0A0A0A',
          transition: 'color 200ms cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        Sortieren
        <svg
          width="7"
          height="5"
          viewBox="0 0 8 6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 320ms cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <path
            d="M0 0C0 0 3.83 6 3.94 6C4.17 6 8 0 8 0H0Z"
            fill={open ? '#370E4D' : '#0A0A0A'}
            style={{ transition: 'fill 200ms' }}
          />
        </svg>
      </button>

      {/* ── Dropdown panel — the Catalogue menu's design ── */}
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
            color: '#370E4D',
          }}
        />
        {sorts.map((opt, i) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => { onChange(opt.id); setHovered(null); setOpen(false) }}
            onMouseEnter={() => setHovered(i)}
            onFocus={() => setHovered(i)}
            onBlur={() => setHovered(null)}
            aria-current={value === opt.id ? 'true' : undefined}
            className="catalogue-menu-item"
            data-highlighted={highlight === i}
            style={{ transitionDelay: `${i * 50}ms` }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
