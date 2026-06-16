'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const CATALOGUE_OPTIONS = [
  { id: 'star',         label: 'Star',         color: '#0A0A0A', href: '/bekleidung/star'         },
  { id: 'streetwear',   label: 'Streetwear',   color: '#0011A5', href: '/bekleidung/streetwear'   },
  { id: 'experimental', label: 'Experimental', color: '#6C169C', href: '/bekleidung/experimental' },
  { id: 'athleisure',   label: 'Athleisure',   color: '#C01B1B', href: '/bekleidung/athleisure'   },
  { id: 'culture',      label: 'Culture',       color: '#EA9575', href: '/bekleidung/cultural'     },
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
  const ref = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Detect active from current route first, fall back to prop value
  const activeId = CATALOGUE_OPTIONS.find(o => pathname === o.href)?.id ?? value ?? ''
  const activeOption = CATALOGUE_OPTIONS.find(o => o.id === activeId)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const isActive = !!activeId
  const triggerColor = activeOption?.color ?? '#0A0A0A'

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
        aria-hidden={!open}
        style={{
          position: 'absolute',
          ...(dropUp ? { bottom: 'calc(100% + 16px)' } : { top: 'calc(100% + 18px)' }),
          ...(align === 'right' ? { right: 0 } : { left: 0 }),
          zIndex: 200,
          pointerEvents: open ? 'auto' : 'none',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {CATALOGUE_OPTIONS.map((opt, i) => {
          const isItemActive = activeId === opt.id
          const isLast       = i === CATALOGUE_OPTIONS.length - 1
          const delay        = `${i * 0.05}s`

          const borderTop    = !dropUp && i === 0 ? '1px solid #E8E8E8' : 'none'
          const borderBottom = dropUp && isLast
            ? '1px solid rgba(232,232,232,0.9)'
            : !isLast
            ? '1px solid #F0EFEA'
            : 'none'

          return (
            <Link
              key={opt.id}
              href={opt.href}
              onClick={() => { onChange?.(isItemActive ? '' : opt.id); setOpen(false) }}
              style={{
                background: '#fff',
                textDecoration: 'none',
                border: 'none',
                borderTop,
                borderBottom,
                cursor: 'pointer',
                padding: '12px 24px 12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontFamily: "'League Spartan', sans-serif",
                fontSize: 10,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                color: isItemActive ? opt.color : '#0A0A0A',
                fontWeight: isItemActive ? 600 : 400,
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
              {/* Category colour dot */}
              <span style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: opt.color,
                flexShrink: 0,
                opacity: isItemActive ? 1 : 0.55,
                transition: 'opacity 150ms ease',
              }} />
              {opt.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
