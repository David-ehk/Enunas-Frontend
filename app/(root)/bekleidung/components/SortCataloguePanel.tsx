'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ProductSort } from '@/lib/productSorts'
import { CATALOGUE_OPTIONS } from './CatalogueDropdown'

export interface CatalogueChoice {
  value: string
  onChange: (id: string) => void
}

interface SortCataloguePanelProps {
  open: boolean
  onClose: () => void
  sorts: ProductSort[]
  value: string
  onSort: (id: string) => void
  catalogue: CatalogueChoice
  align: 'left' | 'right'
  dropUp: boolean
}

const SORT_ACCENT = '#370E4D'

/** The phone's Sortieren menu: the Catalogue menu's look, with the catalogue lines under the sorts. */
export default function SortCataloguePanel({
  open, onClose, sorts, value, onSort, catalogue, align, dropUp,
}: SortCataloguePanelProps) {
  const pathname = usePathname()
  const [hovered, setHovered] = useState<number | null>(null)
  const activeLine = CATALOGUE_OPTIONS.find(o => pathname === o.href)?.id ?? catalogue.value

  // Rows are all one height, so a row's index is also the highlight's position.
  // Order: the sorts, the "Catalogue" label, the lines.
  const firstLineRow = sorts.length + 1
  const highlight = hovered ?? sorts.findIndex(s => s.id === value)
  const accent = highlight >= firstLineRow
    ? CATALOGUE_OPTIONS[highlight - firstLineRow].color
    : SORT_ACCENT

  const rowProps = (row: number) => ({
    className: 'catalogue-menu-item',
    'data-highlighted': highlight === row,
    style: { transitionDelay: `${row * 30}ms` },
    onMouseEnter: () => setHovered(row),
    onFocus: () => setHovered(row),
    onBlur: () => setHovered(null),
  })
  const choose = () => { setHovered(null); onClose() }

  return (
    <div
      className="catalogue-menu"
      data-open={open}
      data-direction={dropUp ? 'up' : 'down'}
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
          color: accent,
        }}
      />
      {sorts.map((sort, i) => (
        <button
          key={sort.id}
          type="button"
          {...rowProps(i)}
          aria-pressed={value === sort.id}
          onClick={() => { onSort(sort.id); choose() }}
        >
          {sort.label}
        </button>
      ))}
      <div
        className="catalogue-menu-item catalogue-menu-label"
        style={{ transitionDelay: `${sorts.length * 30}ms` }}
      >
        Catalogue
      </div>
      {CATALOGUE_OPTIONS.map((line, i) => {
        const selected = activeLine === line.id
        return (
          <Link
            key={line.id}
            href={line.href}
            {...rowProps(firstLineRow + i)}
            aria-current={selected ? 'page' : undefined}
            onClick={() => { catalogue.onChange(selected ? '' : line.id); choose() }}
          >
            <span className="catalogue-menu-dot" style={{ background: line.color }} />
            {line.label}
          </Link>
        )
      })}
    </div>
  )
}
