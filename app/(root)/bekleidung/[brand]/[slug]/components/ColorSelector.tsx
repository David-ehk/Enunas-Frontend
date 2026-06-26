'use client'

import { useState, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import type { Color } from '@/lib/color'

interface ColorSelectorProps {
  colors: Color[]
  selectedColor?: Color | null
  maxVisible?: number
  onColorSelect?: (color: Color) => void
  sku?: string
}

export default function ColorSelector({
  colors,
  selectedColor = null,
  maxVisible = 3,
  onColorSelect,
  sku,
}: ColorSelectorProps) {
  const [hoveredColor, setHoveredColor] = useState<Color | null>(null)
  const [copied, setCopied] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!colors || colors.length === 0) return null

  const visibleColors = colors.slice(0, maxVisible)
  const remainingCount = Math.max(0, colors.length - maxVisible)
  const displayName = hoveredColor?.name || selectedColor?.name || ''

  const handleCopySku = async () => {
    if (!sku) return
    try { await navigator.clipboard.writeText(sku) } catch { /* noop */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  const handleSelect = (color: Color) => {
    onColorSelect?.(color)
    setSidebarOpen(false)
  }

  const nameStyle: React.CSSProperties = {
    fontFamily: 'var(--font-league-spartan)',
    fontSize: '11px',
    letterSpacing: '0.25em',
    textTransform: 'uppercase',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  }

  return (
    <>
      {/*
        The container is w-full (inherits max-w-[460px] from ProductDetails wrapper).
        Both sides of the | are flex-1, so the | sits at the exact horizontal centre.
        The swatch row uses justify-center, so the middle swatch lands under the |.
      */}
      <div className="w-full">

        {/* ── Name | SKU row ── */}
        <div className="flex items-center w-full mb-4" style={{ minHeight: '18px' }}>

          {/* Left: colour name — right-aligned, fills half the container */}
          <div className="flex-1 flex justify-end pr-2.5 min-w-0">
            <span className="text-enunas-black truncate" style={nameStyle}>
              {displayName}
            </span>
          </div>

          {/* Centre: divider */}
          <span
            aria-hidden
            className="flex-shrink-0 inline-block w-px bg-enunas-black/25"
            style={{ height: '14px' }}
          />

          {/* Right: SKU + copy — left-aligned, fills half the container */}
          <div className="flex-1 flex justify-start pl-2.5 min-w-0">
            {sku ? (
              <button
                type="button"
                onClick={handleCopySku}
                title={copied ? 'Kopiert' : 'Produktnummer kopieren'}
                aria-label={`Produktnummer ${sku} kopieren`}
                className="group inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.08em] text-enunas-gray-medium hover:text-enunas-black transition-colors duration-200 focus:outline-none"
              >
                <span className="select-all truncate">{sku}</span>
                {copied ? (
                  <CheckIcon className="h-3 w-3 text-enunas-purple flex-shrink-0" />
                ) : (
                  <CopyIcon className="h-3 w-3 opacity-55 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                )}
              </button>
            ) : (
              <span />
            )}
          </div>
        </div>

        {/* ── Swatch row — centred so the middle swatch sits under the | ── */}
        <div className="flex justify-center items-start gap-3.5">
          {visibleColors.map((color) => {
            const isSelected = selectedColor?.id === color.id
            return (
              <button
                key={color.id}
                type="button"
                onClick={() => handleSelect(color)}
                onMouseEnter={() => setHoveredColor(color)}
                onMouseLeave={() => setHoveredColor(null)}
                aria-label={`Farbe ${color.name} auswählen`}
                aria-pressed={isSelected}
                className="flex flex-col items-center flex-shrink-0 focus:outline-none"
              >
                <div
                  className="transition-all duration-150"
                  style={{
                    width: '22px', height: '22px',
                    backgroundColor: color.hex,
                    border: isSelected ? '1.5px solid #0A0A0A' : '1px solid #E8E8E8',
                  }}
                />
                <div
                  className="transition-opacity duration-150"
                  style={{
                    width: '26px', height: '1px',
                    marginTop: '4px',
                    backgroundColor: '#0A0A0A',
                    opacity: isSelected ? 1 : 0,
                  }}
                />
              </button>
            )
          })}

          {remainingCount > 0 && (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label={`${remainingCount} weitere Farben anzeigen`}
              className="flex-shrink-0 hover:text-enunas-purple transition-colors duration-200"
              style={{
                fontFamily: 'var(--font-Cormorant-Garamond)',
                fontSize: '18px',
                fontWeight: 400,
                color: '#0A0A0A',
                background: 'none',
                border: 'none',
                borderBottom: '1px solid currentColor',
                paddingBottom: '1px',
                cursor: 'pointer',
                lineHeight: 1,
              }}
            >
              +{remainingCount}
            </button>
          )}
        </div>
      </div>

      <ColorSidebar
        colors={colors}
        selectedColor={selectedColor}
        onColorSelect={handleSelect}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </>
  )
}

// ── Color picker sidebar ──────────────────────────────────────
interface SidebarProps {
  colors: Color[]
  selectedColor: Color | null
  onColorSelect: (color: Color) => void
  open: boolean
  onClose: () => void
}

function ColorSidebar({ colors, selectedColor, onColorSelect, open, onClose }: SidebarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [open, handleKey])

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
        onClick={onClose}
        aria-hidden
      />

      {/* Sliding panel */}
      <div
        role="dialog"
        aria-modal
        aria-label="Farbe wählen"
        className="fixed top-0 right-0 h-full bg-white z-[70] flex flex-col"
        style={{
          width: '340px',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 480ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-enunas-gray-light flex-shrink-0">
          <h3
            className="text-enunas-black"
            style={{
              fontFamily: 'var(--font-league-spartan)',
              fontSize: '11px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              fontWeight: 500,
            }}
          >
            Farbe wählen
          </h3>
          <button
            onClick={onClose}
            aria-label="Schließen"
            className="p-1 text-enunas-gray-medium hover:text-enunas-black transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected indicator */}
        {selectedColor && (
          <div
            className="px-8 py-3 border-b border-enunas-gray-light flex items-center gap-3 flex-shrink-0"
            style={{ background: 'rgba(55,14,77,0.04)' }}
          >
            <div
              className="w-4 h-4 border border-enunas-gray-light flex-shrink-0"
              style={{ backgroundColor: selectedColor.hex }}
            />
            <span
              className="text-enunas-purple"
              style={{
                fontFamily: 'var(--font-league-spartan)',
                fontSize: '10px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              {selectedColor.name}
            </span>
          </div>
        )}

        {/* Color grid */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="grid grid-cols-4 gap-x-4 gap-y-6">
            {colors.map((color) => {
              const isSelected = selectedColor?.id === color.id
              const isHovered = hoveredId === color.id
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => onColorSelect(color)}
                  onMouseEnter={() => setHoveredId(color.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  aria-label={`Farbe ${color.name} auswählen`}
                  aria-pressed={isSelected}
                  className="flex flex-col items-center gap-2 focus:outline-none"
                >
                  <div
                    className="w-full aspect-square transition-all duration-200"
                    style={{
                      backgroundColor: color.hex,
                      border: isSelected
                        ? '2px solid #0A0A0A'
                        : isHovered
                        ? '1.5px solid #6B6B6B'
                        : '1px solid #E8E8E8',
                    }}
                  />
                  <span
                    className="text-center leading-tight transition-colors duration-150"
                    style={{
                      fontFamily: 'var(--font-league-spartan)',
                      fontSize: '9px',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: isSelected ? '#0A0A0A' : '#6B6B6B',
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    {color.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

// ── Icons ─────────────────────────────────────────────────────
function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="5" y="5" width="8.5" height="8.5" rx="1" />
      <path d="M11 5V3.5A1 1 0 0 0 10 2.5H3.5A1 1 0 0 0 2.5 3.5V10A1 1 0 0 0 3.5 11H5" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 8.5 6.5 12 13 4.5" />
    </svg>
  )
}
