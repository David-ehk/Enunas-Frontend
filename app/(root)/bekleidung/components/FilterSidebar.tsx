'use client'

import React, { useState } from 'react'
import type { ProductCardShape } from '@/lib/api'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FilterState {
  kategorien: string[]
  farben:     string[]
  groessen:   string[]
  marken:     string[]
  sortieren:  string
  catalogue:  string
}

export interface FilterSidebarProps {
  open:            boolean
  onClose:         () => void
  filters:         FilterState
  setFilters:      React.Dispatch<React.SetStateAction<FilterState>>
  openSections:    string[]
  toggleSection:   (id: string) => void
  toggleFilter:    (key: keyof FilterState, val: string) => void
  resetFilters:    () => void
  resultCount:     number
  availableMarken: string[]
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const CATEGORIES = [
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
  { id: 'schuhe',      label: 'Schuhe'                },
  { id: 'accessoires', label: 'Accessoires'           },
]

export const SIDEBAR_CATEGORIES = CATEGORIES.filter(c => c.id !== 'alle')

// id = ColorFamily enum value from backend; name = German display label
export const FARBEN = [
  { id: 'BLACK',      name: 'Schwarz',    hex: '#0A0A0A'             },
  { id: 'WHITE',      name: 'Weiß',       hex: '#F0EEE8', border: true },
  { id: 'BEIGE',      name: 'Beige',      hex: '#DCD5C1'             },
  { id: 'BROWN',      name: 'Braun',      hex: '#5C2E1F'             },
  { id: 'GREY',       name: 'Grau',       hex: '#888888'             },
  { id: 'BLUE',       name: 'Blau',       hex: '#0011A5'             },
  { id: 'PURPLE',     name: 'Lila',       hex: '#6C169C'             },
  { id: 'GREEN',      name: 'Grün',       hex: '#1A5A3C'             },
  { id: 'RED',        name: 'Rot',        hex: '#C01B1B'             },
  { id: 'PINK',       name: 'Pink',       hex: '#E91E8C'             },
  { id: 'ORANGE',     name: 'Orange',     hex: '#E8650A'             },
  { id: 'YELLOW',     name: 'Gelb',       hex: '#E8C30A'             },
  { id: 'MULTICOLOR', name: 'Mehrfarbig', hex: '#888',   border: true },
]

export const GROESSEN = ['XS','S','M','L','XL','XXL','28','30','32','34','36','38','40','42','44','46']

export const SORT_OPTIONS = [
  { id: 'neu',       label: 'Neuheiten'         },
  { id: 'preis-auf', label: 'Preis aufsteigend' },
  { id: 'preis-ab',  label: 'Preis absteigend'  },
  { id: 'name',      label: 'Name A–Z'          },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

export function parsePriceNum(price: string): number {
  return parseFloat(price.replace('€', '').replace(',', '.').trim()) || 0
}

export function genderMatchesProduct(selected: ('damen' | 'herren')[], p: ProductCardShape): boolean {
  if (selected.length === 0) return true
  const g = (p.gender ?? '').toUpperCase()
  // Products without a gender or marked unisex appear in all filters
  if (!g || g === 'UNISEX' || g === 'GENDER_NEUTRAL') return true
  const isFemale = g === 'FEMALE' || g === 'WOMEN' || g === 'DAMEN' || g === 'W' || g === 'F'
  const isMale   = g === 'MALE'   || g === 'MEN'   || g === 'HERREN' || g === 'M'
  return (selected.includes('damen') && isFemale) || (selected.includes('herren') && isMale)
}

export function catMatchesProduct(catId: string, p: ProductCardShape): boolean {
  const slot = (p.category ?? '').toUpperCase()
  const type = (p.subcategory ?? '').toUpperCase()
  const MAP: Record<string, { slots: string[]; types: string[] }> = {
    oberteile:   { slots: ['TOP'],                   types: ['T_SHIRT', 'LONGSLEEVE', 'HOODIE', 'ZIP_HOODIE', 'SWEATER'] },
    hoodies:     { slots: [],                        types: ['HOODIE', 'ZIP_HOODIE'] },
    tshirts:     { slots: [],                        types: ['T_SHIRT', 'LONGSLEEVE'] },
    strick:      { slots: [],                        types: ['SWEATER'] },
    hemden:      { slots: [],                        types: ['LONGSLEEVE'] },
    jacken:      { slots: ['OUTERWEAR'],             types: ['JACKET'] },
    hosen:       { slots: ['BOTTOM'],                types: ['JEANS', 'CARGO_PANTS', 'JOGGER', 'SHORTS', 'PANTS'] },
    jeans:       { slots: [],                        types: ['JEANS'] },
    jogger:      { slots: [],                        types: ['JOGGER', 'CARGO_PANTS'] },
    shorts:      { slots: [],                        types: ['SHORTS'] },
    schuhe:      { slots: ['FOOTWEAR'],              types: ['SNEAKERS', 'BOOTS', 'SHOES', 'LOAFERS', 'SANDALS'] },
    accessoires: { slots: ['ACCESSORY'],             types: ['CAP', 'BEANIE', 'BAG', 'BELT', 'JEWELRY'] },
  }
  const mapping = MAP[catId]
  if (!mapping) return false
  return mapping.slots.includes(slot) || mapping.types.includes(type) || mapping.types.includes(slot)
}

// ── Sub-components (module-level to preserve useState between renders) ─────────

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

// ── FilterSidebar ─────────────────────────────────────────────────────────────

export default function FilterSidebar({
  open, onClose, filters, setFilters,
  openSections, toggleSection, toggleFilter, resetFilters,
  resultCount, availableMarken,
}: FilterSidebarProps) {

  function Section({ id, label, children, animDelay = 0 }: {
    id: string; label: string; children: React.ReactNode; animDelay?: number
  }) {
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

        <div style={{
          overflow: 'hidden',
          maxHeight: isOpen ? 1200 : 0,
          transition: `max-height ${isOpen ? '520ms' : '300ms'} cubic-bezier(0.16,1,0.3,1)`,
        }}>
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

        {/* Header */}
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

        {/* Scrollable body */}
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
                  key={f.id}
                  name={f.name}
                  hex={f.hex}
                  border={f.border}
                  selected={filters.farben.includes(f.id)}
                  onClick={() => toggleFilter('farben', f.id)}
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

        {/* CTA */}
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
