'use client'

import { useState, useRef, useEffect } from 'react'

export const SORT_OPTIONS = [
  { id: 'neu',       label: 'Neuheiten'         },
  { id: 'preis-auf', label: 'Preis aufsteigend' },
  { id: 'preis-ab',  label: 'Preis absteigend'  },
  { id: 'name',      label: 'Name A–Z'          },
]

interface SortDropdownProps {
  value: string
  onChange: (id: string) => void
  align?: 'left' | 'right'
  dropUp?: boolean
}

export default function SortDropdown({
  value,
  onChange,
  align = 'right',
  dropUp = false,
}: SortDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative' }}>

      {/* ── Trigger ── */}
      <button
        onClick={() => setOpen(p => !p)}
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

      {/* ── Dropdown panel ──
          No outer border or shadow — the container is transparent.
          Each item carries its own background so items are readable,
          and the first item has a borderTop that visually anchors the
          list to the filter bar's bottom border line ("die Linie darunter").
      ── */}
      <div
        aria-hidden={!open}
        style={{
          position: 'absolute',
          ...(dropUp
            ? { bottom: 'calc(100% + 16px)' }
            : { top: 'calc(100% + 18px)' }),
          ...(align === 'right' ? { right: 0 } : { left: 0 }),
          zIndex: 200,
          pointerEvents: open ? 'auto' : 'none',
          display: 'flex',
          flexDirection: 'column',
          // No background, no border, no shadow on the container itself
        }}
      >
        {SORT_OPTIONS.map((opt, i) => {
          const isActive = value === opt.id
          const isLast   = i === SORT_OPTIONS.length - 1
          const delay    = `${i * 0.05}s`

          // Anchor line: top of first item connects to the filter bar border;
          // last item of a dropUp list connects to the BlurFilterBar top border.
          const borderTop    = !dropUp && i === 0
            ? '1px solid #E8E8E8'
            : 'none'
          const borderBottom = dropUp && isLast
            ? '1px solid rgba(232,232,232,0.9)'
            : !isLast
            ? '1px solid #F0EFEA'
            : 'none'

          return (
            <button
              key={opt.id}
              onClick={() => { onChange(opt.id); setOpen(false) }}
              style={{
                background: '#fff',
                border: 'none',
                borderTop,
                borderBottom,
                cursor: 'pointer',
                padding: '12px 28px 12px 20px',
                textAlign: align === 'right' ? 'right' : 'left',
                fontFamily: "'League Spartan', sans-serif",
                fontSize: 10,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                color: isActive ? '#370E4D' : '#0A0A0A',
                fontWeight: isActive ? 600 : 400,
                // Staggered fade + slide — Cult Gaia inspired
                opacity: open ? 1 : 0,
                transform: open
                  ? 'translateY(0px)'
                  : dropUp ? 'translateY(5px)' : 'translateY(-5px)',
                transition: [
                  `opacity 0.45s cubic-bezier(0.39,0.575,0.565,1) ${delay}`,
                  `transform 0.45s cubic-bezier(0.16,1,0.3,1) ${delay}`,
                  'color 150ms',
                ].join(', '),
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
