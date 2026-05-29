'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { adminApi } from '@/lib/api'
import type { AdminCustomer, ApiOrder } from '@/types/api'
import { PageHeader, KPIGrid, KPICell, SectionCard, StatusBadge, EmptyState, Loader, FilterBar, SearchInput, SelectFilter, TH, TD, TableRow, fmt, fmtEur, dailyCounts, weekDeltaStr } from './shared'
import { UserX, UserCheck, UserMinus, ChevronDown, ChevronUp } from 'lucide-react'

type Filter      = 'all' | 'active' | 'suspended' | 'new'
type SpendFilter = 'all' | 'none' | 'low' | 'mid' | 'high' | 'vip'
type SortBy      = 'newest' | 'oldest' | 'spend_desc' | 'spend_asc' | 'orders_desc' | 'name'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all',       label: 'Alle' },
  { id: 'new',       label: 'Neu (7d)' },
  { id: 'active',    label: 'Aktiv' },
  { id: 'suspended', label: 'Gesperrt' },
]

const SPEND_FILTER_OPTIONS = [
  { value: 'all',  label: 'Alle Ausgaben' },
  { value: 'none', label: 'Kein Kauf' },
  { value: 'low',  label: '< €100' },
  { value: 'mid',  label: '€100 – €499' },
  { value: 'high', label: '€500 – €999' },
  { value: 'vip',  label: 'VIP ≥ €1.000' },
]

const SORT_OPTIONS = [
  { value: 'newest',      label: 'Neueste zuerst' },
  { value: 'oldest',      label: 'Älteste zuerst' },
  { value: 'spend_desc',  label: 'Meiste Ausgaben ↓' },
  { value: 'spend_asc',   label: 'Wenigste Ausgaben ↑' },
  { value: 'orders_desc', label: 'Meiste Bestellungen ↓' },
  { value: 'name',        label: 'Name A–Z' },
]

function ActionBtn({
  onClick, disabled, variant, children,
}: {
  onClick: () => void
  disabled?: boolean
  variant: 'danger' | 'success' | 'ghost'
  children: React.ReactNode
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
      className={`inline-flex items-center gap-1 h-7 px-2.5 rounded-lg text-[11px] font-medium border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${styles[variant]}`}
      style={{ fontFamily: 'var(--font-league-spartan)' }}
    >
      {children}
    </button>
  )
}

export default function Customers({ orders = [] }: { orders?: ApiOrder[] }) {
  const [customers, setCustomers] = useState<AdminCustomer[]>([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]           = useState<Filter>('all')
  const [spendFilter, setSpendFilter] = useState<SpendFilter>('all')
  const [sortBy, setSortBy]           = useState<SortBy>('newest')
  const [search, setSearch]           = useState('')
  const [expanded, setExpanded]       = useState<string | null>(null)
  const [acting, setActing]           = useState<string | null>(null)

  useEffect(() => {
    adminApi.customers.getAll().catch(() => []).then(setCustomers).finally(() => setLoading(false))
  }, [])

  const spendMap = useMemo(() => {
    const m = new Map<string, { total: number; count: number }>()
    for (const o of orders) {
      if (!o.userId) continue
      const prev = m.get(o.userId) ?? { total: 0, count: 0 }
      m.set(o.userId, { total: prev.total + o.totalAmount, count: prev.count + 1 })
    }
    return m
  }, [orders])

  function getSpend(c: AdminCustomer) {
    return spendMap.get(c.id ?? '') ?? spendMap.get(c.userId ?? '') ?? { total: 0, count: 0 }
  }

  const visible = useMemo(() => {
    const q = search.toLowerCase()
    const cutoff7d = new Date(Date.now() - 7 * 86400000)
    const filtered = customers.filter(c => {
      const matchSearch = !q || c.email.toLowerCase().includes(q) || c.firstName?.toLowerCase().includes(q) || c.lastName?.toLowerCase().includes(q)
      if (!matchSearch) return false
      if (filter === 'active')    return c.status !== 'SUSPENDED' && c.status !== 'DEACTIVATED'
      if (filter === 'suspended') return c.status === 'SUSPENDED'
      if (filter === 'new')       return c.createdAt ? new Date(c.createdAt) > cutoff7d : false
      const spend = (spendMap.get(c.id ?? '') ?? spendMap.get(c.userId ?? ''))?.total ?? 0
      if (spendFilter === 'none') return spend === 0
      if (spendFilter === 'low')  return spend > 0 && spend < 100
      if (spendFilter === 'mid')  return spend >= 100 && spend < 500
      if (spendFilter === 'high') return spend >= 500 && spend < 1000
      if (spendFilter === 'vip')  return spend >= 1000
      return true
    })
    return [...filtered].sort((a, b) => {
      const sa = (spendMap.get(a.id ?? '') ?? spendMap.get(a.userId ?? ''))?.total ?? 0
      const sb = (spendMap.get(b.id ?? '') ?? spendMap.get(b.userId ?? ''))?.total ?? 0
      const oa = (spendMap.get(a.id ?? '') ?? spendMap.get(a.userId ?? ''))?.count ?? 0
      const ob = (spendMap.get(b.id ?? '') ?? spendMap.get(b.userId ?? ''))?.count ?? 0
      if (sortBy === 'spend_desc')  return sb - sa
      if (sortBy === 'spend_asc')   return sa - sb
      if (sortBy === 'orders_desc') return ob - oa
      if (sortBy === 'oldest')      return new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()
      if (sortBy === 'name') {
        const na = [a.firstName, a.lastName].filter(Boolean).join(' ')
        const nb = [b.firstName, b.lastName].filter(Boolean).join(' ')
        return na.localeCompare(nb, 'de')
      }
      return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    })
  }, [customers, search, filter, spendFilter, sortBy, spendMap])

  const kpiData = useMemo(() => {
    const now = new Date()
    const y = now.getFullYear(), m = now.getMonth()
    const prevY = m === 0 ? y - 1 : y
    const prevM = m === 0 ? 11 : m - 1

    const inMonth = (s?: string, ty = y, tm = m) => {
      if (!s) return false
      const d = new Date(s); return d.getFullYear() === ty && d.getMonth() === tm
    }

    const newMTD  = customers.filter(c => inMonth(c.createdAt)).length
    const newPrev = customers.filter(c => inMonth(c.createdAt, prevY, prevM)).length

    // Avg LTV: total revenue per buying customer
    const revenueMap = new Map<string, number>()
    orders.forEach(o => { if (o.userId) revenueMap.set(o.userId, (revenueMap.get(o.userId) ?? 0) + o.totalAmount) })
    const buyingCount = revenueMap.size
    const totalRev = Array.from(revenueMap.values()).reduce((s, v) => s + v, 0)
    const avgLTV = buyingCount > 0 ? totalRev / buyingCount : 0

    // 30-day retention: buyers in prev 30d who also bought in latest 30d
    const ts = Date.now()
    const d30 = 30 * 86400000
    const buyersNow  = new Set(orders.filter(o => ts - new Date(o.createdAt).getTime() < d30).map(o => o.userId).filter(Boolean))
    const buyersPrev = new Set(orders.filter(o => { const t = ts - new Date(o.createdAt).getTime(); return t >= d30 && t < d30 * 2 }).map(o => o.userId).filter(Boolean))
    const returned   = [...buyersPrev].filter(id => buyersThisSet(id, buyersNow)).length
    function buyersThisSet(id: string | undefined, set: Set<string | undefined>): boolean { return !!id && set.has(id) }
    const retentionRate = buyersPrev.size > 0 ? Math.round((returned / buyersPrev.size) * 100) : 0

    const customerSpark = dailyCounts(customers.filter(c => !!c.createdAt) as { createdAt: string }[])

    return {
      total: customers.length,
      newMTD,
      newDelta: weekDeltaStr(newMTD, newPrev),
      avgLTV,
      buyingCount,
      retentionRate,
      retentionBase: buyersPrev.size,
      customerSpark,
    }
  }, [customers, orders])

  async function act(id: string, action: 'suspend' | 'unsuspend' | 'deactivate') {
    setActing(id)
    try {
      const updated = await (action === 'suspend'
        ? adminApi.customers.suspend(id)
        : action === 'unsuspend'
        ? adminApi.customers.unsuspend(id)
        : adminApi.customers.deactivate(id))
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c))
    } catch { /* silent */ } finally { setActing(null) }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Verwaltung"
        title="Kunden"
        italicTitle="verwaltung."
      />

      <KPIGrid>
        <KPICell
          label="Kunden gesamt"
          value={kpiData.total}
          sub={`${customers.filter(c => c.status !== 'SUSPENDED' && c.status !== 'DEACTIVATED').length} aktiv`}
          spark={kpiData.customerSpark}
        />
        <KPICell accent
          label="Neu (MTD)"
          value={kpiData.newMTD}
          sub="Neukunden diesen Monat"
          delta={kpiData.newDelta}
          period="vs. Vormonat"
        />
        <KPICell
          label="Ø LTV"
          value={kpiData.buyingCount > 0 ? `€ ${Math.round(kpiData.avgLTV).toLocaleString('de-DE')}` : '—'}
          sub={`${kpiData.buyingCount} Käufer mit Bestellungen`}
        />
        <KPICell
          label="30d-Retention"
          value={kpiData.retentionBase > 0 ? `${kpiData.retentionRate}%` : '—'}
          sub={kpiData.retentionBase > 0 ? `${kpiData.retentionBase} Käufer im Vormonat` : 'Noch keine Daten'}
        />
      </KPIGrid>

      <div className="flex items-center gap-3 flex-wrap">
        <FilterBar options={FILTERS} value={filter} onChange={v => { setFilter(v as Filter); setSpendFilter('all') }} />
        <SelectFilter
          value={spendFilter}
          onChange={v => { setSpendFilter(v as SpendFilter); setFilter('all') }}
          options={SPEND_FILTER_OPTIONS}
        />
        <SelectFilter
          value={sortBy}
          onChange={v => setSortBy(v as SortBy)}
          options={SORT_OPTIONS}
        />
        <div className="flex-1 min-w-[200px] max-w-xs">
          <SearchInput value={search} onChange={setSearch} placeholder="Name oder E-Mail suchen…" />
        </div>
      </div>

      <SectionCard title="Kunden" count={visible.length}>
        {loading ? <Loader /> : visible.length === 0 ? <EmptyState message="Keine Kunden gefunden." /> : (
          <table className="w-full">
            <thead>
              <tr>
                <TH>ID</TH>
                <TH>Name</TH>
                <TH>E-Mail</TH>
                <TH>Land</TH>
                <TH>Ausgaben</TH>
                <TH>Registriert</TH>
                <TH>Status</TH>
                <TH>Aktionen</TH>
              </tr>
            </thead>
            <tbody>
              {visible.map(c => (
                <React.Fragment key={c.id}>
                  <TableRow>
                    <TD className="font-mono text-[11px] text-[#9B9B9B]">
                      {String(c.id || c.userId || '').slice(0, 8).toUpperCase()}
                    </TD>
                    <TD className="font-medium text-[#0A0A0A]">
                      {[c.firstName, c.lastName].filter(Boolean).join(' ') || '—'}
                    </TD>
                    <TD className="text-[#6B6B6B]">{c.email}</TD>
                    <TD className="text-[#6B6B6B]">{c.country || '—'}</TD>
                    <TD>
                      {(() => {
                        const s = getSpend(c)
                        if (s.count === 0) return <span className="text-[11px] text-[#C0C0BC]">—</span>
                        return (
                          <div style={{ fontFamily: 'var(--font-league-spartan)' }}>
                            <span className="text-[12px] font-medium text-[#0A0A0A]">{fmtEur(s.total)}</span>
                            <span className="text-[10px] text-[#9B9B9B] ml-1">{s.count}×</span>
                          </div>
                        )
                      })()}
                    </TD>
                    <TD className="text-[#6B6B6B]">{c.createdAt ? fmt(c.createdAt) : '—'}</TD>
                    <TD>
                      <StatusBadge status={c.status ?? 'ACTIVE'} />
                    </TD>
                    <TD>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                          className="p-1.5 rounded-lg hover:bg-[#F5F5F0] text-[#9B9B9B] hover:text-[#6B6B6B] transition-all duration-200"
                        >
                          {expanded === c.id
                            ? <ChevronUp className="w-3.5 h-3.5" />
                            : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        {(!c.status || c.status === 'ACTIVE') && (
                          <ActionBtn variant="danger" disabled={acting === c.id} onClick={() => act(c.id, 'suspend')}>
                            <UserX className="w-3 h-3" /> Sperren
                          </ActionBtn>
                        )}
                        {c.status === 'SUSPENDED' && (
                          <ActionBtn variant="success" disabled={acting === c.id} onClick={() => act(c.id, 'unsuspend')}>
                            <UserCheck className="w-3 h-3" /> Entsperren
                          </ActionBtn>
                        )}
                        {c.status !== 'DEACTIVATED' && (
                          <ActionBtn variant="ghost" disabled={acting === c.id} onClick={() => act(c.id, 'deactivate')}>
                            <UserMinus className="w-3 h-3" />
                          </ActionBtn>
                        )}
                      </div>
                    </TD>
                  </TableRow>

                  {expanded === c.id && (
                    <tr className="border-b border-[#F0F0EB]" style={{ background: '#F8F8F5' }}>
                      <td colSpan={8} className="px-6 py-5">
                        <div className="grid grid-cols-3 gap-6">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.12em] text-[#9B9B9B] font-medium mb-1.5">Kunden-ID</p>
                            <p className="font-mono text-[11px] text-[#2D2D2D]">{String(c.id || c.userId || '—')}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.12em] text-[#9B9B9B] font-medium mb-1.5">E-Mail</p>
                            <p className="text-[12px] text-[#0A0A0A]">{c.email}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.12em] text-[#9B9B9B] font-medium mb-1.5">Registriert</p>
                            <p className="text-[12px] text-[#0A0A0A]">{c.createdAt ? fmt(c.createdAt) : '—'}</p>
                          </div>
                          <div className="col-span-3 pt-3 border-t border-[#EBEBEB]">
                            <p className="text-[10px] uppercase tracking-[0.12em] text-[#9B9B9B] font-medium mb-2">Bestellhistorie / Lifetime Value</p>
                            {(() => {
                              const cOrders = orders.filter(o => o.userId === (c.id || c.userId) || o.userId === c.userId)
                              if (cOrders.length === 0) return (
                                <p className="text-[11px] text-[#9B9B9B]">Noch keine Bestellungen</p>
                              )
                              const ltv = cOrders.reduce((s, o) => s + o.totalAmount, 0)
                              return (
                                <div className="flex items-center gap-5">
                                  <div>
                                    <span className="text-[18px] font-semibold text-[#0A0A0A]"
                                      style={{ fontFamily: 'var(--font-league-spartan)' }}>
                                      {cOrders.length}
                                    </span>
                                    <span className="text-[11px] text-[#9B9B9B] ml-1.5">
                                      Bestellung{cOrders.length !== 1 ? 'en' : ''}
                                    </span>
                                  </div>
                                  <div className="w-px h-6 bg-[#E8E8E8]" />
                                  <div>
                                    <span className="text-[18px] font-semibold text-[#0A0A0A]"
                                      style={{ fontFamily: 'var(--font-league-spartan)' }}>
                                      {fmtEur(ltv)}
                                    </span>
                                    <span className="text-[11px] text-[#9B9B9B] ml-1.5">Lifetime Value</span>
                                  </div>
                                </div>
                              )
                            })()}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </SectionCard>
    </div>
  )
}
