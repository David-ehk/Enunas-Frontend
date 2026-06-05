'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, Pencil, Power, Tag } from 'lucide-react'
import { discountsApi } from '@/lib/api'
import type { DiscountResponse } from '@/types/api'
import {
  VPageHeader, VKPIGrid, VKPI, VCard, VStatus,
  VTH, VTD, VTR, Loader, EmptyState,
} from './vshared'
import DiscountForm from '../../admin/_components/DiscountForm'

type ActiveFilter = 'all' | 'active' | 'inactive'
const BRAND_MAX_PERCENT = 15

function fmtDateTime(iso: string | null): string {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  } catch {
    return '—'
  }
}

function CreateButton({ onClick, size = 'md' }: { onClick: () => void; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { h: 30, fs: 10.5, px: 14, iconSize: 12 },
    md: { h: 38, fs: 11,   px: 18, iconSize: 14 },
    lg: { h: 46, fs: 12,   px: 22, iconSize: 16 },
  }
  const s = sizes[size]
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        height: s.h,
        padding: `0 ${s.px}px`,
        fontFamily: 'var(--font-league-spartan)',
        fontSize: s.fs,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        fontWeight: 500,
        background: '#370E4D',
        color: '#fff',
        border: '1px solid #370E4D',
        cursor: 'pointer',
        transition: 'background 150ms, transform 150ms',
        boxShadow: '0 2px 8px rgba(55,14,77,0.25)',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#4A1566' }}
      onMouseLeave={e => { e.currentTarget.style.background = '#370E4D' }}
    >
      <Plus style={{ width: s.iconSize, height: s.iconSize }} strokeWidth={2.4} />
      Neuen Rabattcode erstellen
    </button>
  )
}

function ActiveDot({ active }: { active: boolean }) {
  return (
    <VStatus tone={active ? 'success' : 'muted'}>{active ? 'Aktiv' : 'Inaktiv'}</VStatus>
  )
}

function RowBtn({
  onClick, disabled, variant, children,
}: {
  onClick: () => void
  disabled?: boolean
  variant: 'ghost' | 'danger' | 'success'
  children: React.ReactNode
}) {
  const colors = {
    ghost:   { c: '#6B6B6B', bd: '#E8E8E8',  hbg: '#F5F5F0', hc: '#2D2D2D' },
    danger:  { c: '#8B1E3F', bd: '#FECDD3',  hbg: '#8B1E3F', hc: '#fff'    },
    success: { c: '#1A5A3C', bd: '#A7F3D0',  hbg: '#1A5A3C', hc: '#fff'    },
  }
  const v = colors[variant]
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        height: 28, padding: '0 10px',
        fontFamily: 'var(--font-league-spartan)', fontSize: 10.5,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        color: v.c, background: 'transparent', border: `1px solid ${v.bd}`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'all 150ms',
      }}
      onMouseEnter={e => {
        if (disabled) return
        e.currentTarget.style.background = v.hbg
        e.currentTarget.style.color = v.hc
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = v.c
      }}
    >
      {children}
    </button>
  )
}

export default function Discounts() {
  const [items, setItems] = useState<DiscountResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all')
  const [search, setSearch] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<DiscountResponse | null>(null)
  const [acting, setActing] = useState<number | null>(null)

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      const data = await discountsApi.brand.list()
      setItems(data)
    } catch {
      setError('Rabattcodes konnten nicht geladen werden.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter(d => {
      if (activeFilter === 'active' && !d.active) return false
      if (activeFilter === 'inactive' && d.active) return false
      if (q && !d.code.toLowerCase().includes(q)) return false
      return true
    })
  }, [items, activeFilter, search])

  const counts = useMemo(() => {
    const totalUsed = items.reduce((s, d) => s + d.usedCount, 0)
    const activeCount = items.filter(d => d.active).length
    const avgPct = items.length ? items.reduce((s, d) => s + d.percent, 0) / items.length : 0
    return { total: items.length, active: activeCount, used: totalUsed, avgPct }
  }, [items])

  async function toggleActive(d: DiscountResponse) {
    const verb = d.active ? 'deaktivieren' : 'aktivieren'
    if (!confirm(`Code „${d.code}" wirklich ${verb}?`)) return
    setActing(d.id)
    try {
      await discountsApi.brand.update(d.id, { active: !d.active })
      setItems(prev => prev.map(x => x.id === d.id ? { ...x, active: !d.active } : x))
    } catch {
      alert('Aktion fehlgeschlagen.')
    } finally {
      setActing(null)
    }
  }

  return (
    <div className="space-y-4">
      <VPageHeader
        eyebrow="Brand Portal"
        title="Rabatt"
        italicTitle="codes"
        sub={`Eigene Marken-Codes erstellen und verwalten (max. ${BRAND_MAX_PERCENT}%).`}
        actions={<CreateButton onClick={openCreate} size="md" />}
      />

      <VKPIGrid cols={4}>
        <VKPI label="Aktive Codes" value={counts.active}  delta={`${counts.total} gesamt`} deltaTone="muted" />
        <VKPI label="Verwendungen" value={counts.used}    delta="Bisher eingelöst"          deltaTone="muted" />
        <VKPI label="Ø Rabatt"     value={`${(counts.avgPct * 100).toFixed(1).replace(/\.0$/, '')}%`} delta={`Limit: ${BRAND_MAX_PERCENT}%`} deltaTone="muted" />
        <VKPI label="Marken-Limit" value={`${BRAND_MAX_PERCENT}%`} delta="pro Code" deltaTone="muted" />
      </VKPIGrid>

      {/* Filterbar */}
      <div className="flex items-center gap-3 flex-wrap" style={{ marginTop: 8 }}>
        <select
          value={activeFilter}
          onChange={e => setActiveFilter(e.target.value as ActiveFilter)}
          style={{
            height: 32, padding: '0 30px 0 12px',
            fontFamily: 'var(--font-league-spartan)', fontSize: 11,
            letterSpacing: '0.06em',
            border: '1px solid #E8E8E8', background: '#fff',
            color: '#2D2D2D', cursor: 'pointer',
            appearance: 'none',
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10' fill='none' stroke='%239B9B9B' stroke-width='1.5'><path d='M2 3.5l3 3 3-3' stroke-linecap='round' stroke-linejoin='round'/></svg>\")",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 10px center',
          }}
        >
          <option value="all">Status: Alle</option>
          <option value="active">Status: Aktiv</option>
          <option value="inactive">Status: Inaktiv</option>
        </select>

        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Code suchen…"
          style={{
            height: 32, padding: '0 12px',
            fontFamily: 'var(--font-league-spartan)', fontSize: 11,
            letterSpacing: '0.04em',
            border: '1px solid #E8E8E8', background: '#fff',
            color: '#2D2D2D', minWidth: 220,
          }}
        />
      </div>

      <VCard
        eyebrow="Eigene Marken-Codes"
        title="Rabattcodes"
        action={items.length > 0 ? <CreateButton onClick={openCreate} size="sm" /> : undefined}
        flush
      >
        {loading ? (
          <Loader />
        ) : error ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 12, color: '#8B1E3F' }}>{error}</p>
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: '64px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 56, height: 56, borderRadius: 28,
                background: 'rgba(55,14,77,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Tag style={{ width: 22, height: 22, color: '#370E4D' }} strokeWidth={1.4} />
            </div>
            <div>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 22, color: '#0A0A0A', margin: 0 }}>
                Noch keine Rabattcodes
              </p>
              <p style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 12, color: '#6B6B6B', marginTop: 8, maxWidth: 360, lineHeight: 1.55 }}>
                Erstelle deinen ersten Marken-Rabattcode. Kunden können ihn beim Checkout
                einlösen — bis zu {BRAND_MAX_PERCENT}% Nachlass auf deine Produkte.
              </p>
            </div>
            <div style={{ marginTop: 8 }}>
              <CreateButton onClick={openCreate} size="lg" />
            </div>
          </div>
        ) : visible.length === 0 ? (
          <EmptyState message="Keine Codes entsprechen den Filtern." />
        ) : (
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <VTH>Code</VTH>
                <VTH>Prozent</VTH>
                <VTH>Gültigkeit</VTH>
                <VTH>Verwendet</VTH>
                <VTH>Status</VTH>
                <VTH right>Aktionen</VTH>
              </tr>
            </thead>
            <tbody>
              {visible.map(d => (
                <VTR key={d.id}>
                  <VTD mono>{d.code}</VTD>
                  <VTD>
                    <span style={{ fontWeight: 600, color: '#0A0A0A' }}>
                      {(d.percent * 100).toFixed(1).replace(/\.0$/, '')}%
                    </span>
                  </VTD>
                  <VTD muted>
                    <span style={{ fontSize: 11 }}>
                      {fmtDateTime(d.validFrom)} → {fmtDateTime(d.validUntil)}
                    </span>
                  </VTD>
                  <VTD>
                    <span style={{ color: '#2D2D2D' }}>
                      {d.usedCount} / {d.maxUses != null ? d.maxUses : '∞'}
                    </span>
                  </VTD>
                  <VTD><ActiveDot active={d.active} /></VTD>
                  <VTD right>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <RowBtn
                        variant="ghost"
                        onClick={() => { setEditing(d); setFormOpen(true) }}
                      >
                        <Pencil style={{ width: 11, height: 11 }} />
                        Bearbeiten
                      </RowBtn>
                      <RowBtn
                        variant={d.active ? 'danger' : 'success'}
                        disabled={acting === d.id}
                        onClick={() => toggleActive(d)}
                      >
                        <Power style={{ width: 11, height: 11 }} />
                        {d.active ? 'Deaktivieren' : 'Aktivieren'}
                      </RowBtn>
                    </div>
                  </VTD>
                </VTR>
              ))}
            </tbody>
          </table>
        )}
      </VCard>

      <DiscountForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editing}
        maxPercent={BRAND_MAX_PERCENT}
        isAdmin={false}
        canEditAllFields
        onCreate={dto => discountsApi.brand.create(dto)}
        onUpdate={(id, dto) => discountsApi.brand.update(id, dto)}
        onSaved={refresh}
      />
    </div>
  )
}
