'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, Pencil, Power, Trash2 } from 'lucide-react'
import { discountsApi } from '@/lib/api'
import type { DiscountResponse } from '@/types/api'
import {
  PageHeader, KPIGrid, KPICell, SectionCard, EmptyState, Loader,
  FilterBar, SearchInput, SelectFilter, TH, TD, TableRow,
} from './shared'
import DiscountForm from './DiscountForm'

type TypeFilter = 'all' | 'ADMIN' | 'BRAND'
type ActiveFilter = 'all' | 'active' | 'inactive'

const ADMIN_MAX_PERCENT = 10

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

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span
        className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: active ? '#1A5A3C' : '#8B1E3F' }}
      />
      <span
        className="text-[10px] uppercase tracking-[0.1em] font-medium text-[#2D2D2D]"
        style={{ fontFamily: 'var(--font-league-spartan)' }}
      >
        {active ? 'Aktiv' : 'Inaktiv'}
      </span>
    </span>
  )
}

function TypeBadge({ type }: { type: 'ADMIN' | 'BRAND' }) {
  const isAdmin = type === 'ADMIN'
  return (
    <span
      className="inline-block text-[10px] uppercase tracking-[0.12em] font-medium px-2 py-0.5 rounded-md border"
      style={{
        fontFamily: 'var(--font-league-spartan)',
        background: isAdmin ? 'rgba(55,14,77,0.08)' : '#F5F5F0',
        color: isAdmin ? '#370E4D' : '#2D2D2D',
        borderColor: isAdmin ? 'rgba(55,14,77,0.18)' : '#E8E8E8',
      }}
    >
      {type}
    </span>
  )
}

function RowAction({
  onClick, disabled, variant, children, title,
}: {
  onClick: () => void
  disabled?: boolean
  variant: 'danger' | 'success' | 'ghost'
  children: React.ReactNode
  title?: string
}) {
  const styles = {
    danger:  'border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600',
    success: 'border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600',
    ghost:   'border-[#E8E8E8] text-[#6B6B6B] hover:bg-[#F5F5F0] hover:text-[#2D2D2D]',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex items-center gap-1 h-7 px-2.5 rounded-lg text-[11px] font-medium border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${styles[variant]}`}
      style={{ fontFamily: 'var(--font-league-spartan)' }}
    >
      {children}
    </button>
  )
}

export default function Discounts() {
  const [items, setItems] = useState<DiscountResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all')
  const [search, setSearch] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<DiscountResponse | null>(null)
  const [acting, setActing] = useState<number | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      const data = await discountsApi.admin.list()
      setItems(data)
    } catch {
      setError('Rabattcodes konnten nicht geladen werden.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter(d => {
      if (typeFilter !== 'all' && d.type !== typeFilter) return false
      if (activeFilter === 'active' && !d.active) return false
      if (activeFilter === 'inactive' && d.active) return false
      if (q && !d.code.toLowerCase().includes(q) && !(d.brandName?.toLowerCase().includes(q))) return false
      return true
    })
  }, [items, typeFilter, activeFilter, search])

  const counts = useMemo(() => ({
    total:    items.length,
    admin:    items.filter(d => d.type === 'ADMIN').length,
    brand:    items.filter(d => d.type === 'BRAND').length,
    active:   items.filter(d => d.active).length,
    used:     items.reduce((s, d) => s + d.usedCount, 0),
  }), [items])

  async function deleteCode(d: DiscountResponse) {
    if (!confirm(`Code „${d.code}" endgültig löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) return
    setDeleting(d.id)
    try {
      await discountsApi.admin.delete(d.id)
      setItems(prev => prev.filter(x => x.id !== d.id))
    } catch {
      alert('Löschen fehlgeschlagen.')
    } finally {
      setDeleting(null)
    }
  }

  async function toggleActive(d: DiscountResponse) {
    const verb = d.active ? 'deaktivieren' : 'aktivieren'
    if (!confirm(`Code „${d.code}" wirklich ${verb}?`)) return
    setActing(d.id)
    try {
      await discountsApi.admin.update(d.id, { active: !d.active })
      setItems(prev => prev.map(x => x.id === d.id ? { ...x, active: !d.active } : x))
    } catch {
      alert('Aktion fehlgeschlagen.')
    } finally {
      setActing(null)
    }
  }

  const FILTERS: { id: TypeFilter; label: string }[] = [
    { id: 'all',    label: `Alle (${counts.total})` },
    { id: 'ADMIN',  label: `Admin (${counts.admin})` },
    { id: 'BRAND',  label: `Marken (${counts.brand})` },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Marketing"
        title="Rabatt"
        italicTitle="codes."
        sub="Plattformweite und marken-spezifische Codes verwalten."
        actions={
          <button
            onClick={() => { setEditing(null); setFormOpen(true) }}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-[11px] font-medium text-white transition-all duration-200 hover:bg-[#4A1566]"
            style={{ fontFamily: 'var(--font-league-spartan)', background: '#370E4D', letterSpacing: '0.06em', textTransform: 'uppercase' }}
          >
            <Plus className="w-3.5 h-3.5" />
            Neuer Code
          </button>
        }
      />

      <KPIGrid>
        <KPICell accent label="Aktive Codes" value={counts.active} sub={`${counts.total} gesamt`} />
        <KPICell label="Admin-Codes" value={counts.admin} sub={`Max. ${ADMIN_MAX_PERCENT}%`} />
        <KPICell label="Marken-Codes" value={counts.brand} sub="Brand Partner" />
        <KPICell label="Verwendungen" value={counts.used} sub="Gesamt eingelöst" />
      </KPIGrid>

      <div className="flex items-center gap-3 flex-wrap">
        <FilterBar options={FILTERS} value={typeFilter} onChange={v => setTypeFilter(v as TypeFilter)} />
        <SelectFilter
          value={activeFilter}
          onChange={v => setActiveFilter(v as ActiveFilter)}
          options={[
            { value: 'all',      label: 'Status: Alle' },
            { value: 'active',   label: 'Status: Aktiv' },
            { value: 'inactive', label: 'Status: Inaktiv' },
          ]}
        />
        <div className="flex-1 min-w-[200px] max-w-xs">
          <SearchInput value={search} onChange={setSearch} placeholder="Code oder Marke suchen…" />
        </div>
      </div>

      <SectionCard title="Rabattcodes" count={visible.length}>
        {loading ? (
          <Loader />
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-[12px] text-rose-600" style={{ fontFamily: 'var(--font-league-spartan)' }}>{error}</p>
          </div>
        ) : visible.length === 0 ? (
          <EmptyState message="Keine Rabattcodes gefunden." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <TH>Code</TH>
                  <TH>Typ</TH>
                  <TH>Prozent</TH>
                  <TH>Gültigkeit</TH>
                  <TH>Verwendet</TH>
                  <TH>Status</TH>
                  <TH>Aktionen</TH>
                </tr>
              </thead>
              <tbody>
                {visible.map(d => {
                  const isBrandOwned = d.type === 'BRAND'
                  return (
                    <TableRow key={d.id}>
                      <TD>
                        <div className="flex flex-col gap-0.5">
                          <span
                            className="font-mono text-[12px] font-semibold text-[#0A0A0A]"
                          >
                            {d.code}
                          </span>
                          {d.brandName && (
                            <span
                              className="text-[10px] text-[#9B9B9B]"
                              style={{ fontFamily: 'var(--font-league-spartan)' }}
                            >
                              {d.brandName}
                            </span>
                          )}
                        </div>
                      </TD>
                      <TD><TypeBadge type={d.type} /></TD>
                      <TD>
                        <span className="font-semibold text-[#0A0A0A] tabular-nums">
                          {(d.percent * 100).toFixed(1).replace(/\.0$/, '')}%
                        </span>
                      </TD>
                      <TD className="text-[#6B6B6B]">
                        <span className="text-[11px] tabular-nums">
                          {fmtDateTime(d.validFrom)} → {fmtDateTime(d.validUntil)}
                        </span>
                      </TD>
                      <TD className="text-[#2D2D2D]">
                        <span className="tabular-nums">
                          {d.usedCount} / {d.maxUses != null ? d.maxUses : '∞'}
                        </span>
                      </TD>
                      <TD><ActiveBadge active={d.active} /></TD>
                      <TD>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <RowAction
                            variant="ghost"
                            onClick={() => { setEditing(d); setFormOpen(true) }}
                            title={isBrandOwned ? 'Aktiv-Status ändern' : 'Bearbeiten'}
                          >
                            <Pencil className="w-3 h-3" />
                            {isBrandOwned ? 'Status' : 'Bearbeiten'}
                          </RowAction>
                          <RowAction
                            variant={d.active ? 'danger' : 'success'}
                            disabled={acting === d.id}
                            onClick={() => toggleActive(d)}
                          >
                            <Power className="w-3 h-3" />
                            {d.active ? 'Deaktivieren' : 'Aktivieren'}
                          </RowAction>
                          {!isBrandOwned && (
                            <RowAction
                              variant="danger"
                              disabled={deleting === d.id}
                              onClick={() => deleteCode(d)}
                              title="Admin-Code löschen"
                            >
                              <Trash2 className="w-3 h-3" />
                              Löschen
                            </RowAction>
                          )}
                        </div>
                      </TD>
                    </TableRow>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <DiscountForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editing}
        maxPercent={ADMIN_MAX_PERCENT}
        isAdmin
        canEditAllFields={!editing || editing.type === 'ADMIN'}
        onCreate={dto => discountsApi.admin.create(dto)}
        onUpdate={(id, dto) => discountsApi.admin.update(id, dto)}
        onSaved={refresh}
      />
    </div>
  )
}
