'use client'

import React, { useState, useEffect } from 'react'
import { adminApi } from '@/lib/api'
import type { AdminCustomer, ApiOrder } from '@/types/api'
import { SectionCard, StatusBadge, EmptyState, Loader, FilterBar, SearchInput, TH, TD, TableRow, fmt, fmtEur } from './shared'
import { UserX, UserCheck, UserMinus, ChevronDown, ChevronUp } from 'lucide-react'

type Filter = 'all' | 'active' | 'suspended' | 'new'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all',       label: 'Alle' },
  { id: 'new',       label: 'Neu (7d)' },
  { id: 'active',    label: 'Aktiv' },
  { id: 'suspended', label: 'Gesperrt' },
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
  const [filter, setFilter]       = useState<Filter>('all')
  const [search, setSearch]       = useState('')
  const [expanded, setExpanded]   = useState<string | null>(null)
  const [acting, setActing]       = useState<string | null>(null)

  useEffect(() => {
    adminApi.customers.getAll().catch(() => []).then(setCustomers).finally(() => setLoading(false))
  }, [])

  const cutoff7d = new Date(Date.now() - 7 * 86400000)

  const visible = customers.filter(c => {
    const q = search.toLowerCase()
    const matchSearch = !q || c.email.toLowerCase().includes(q) || c.firstName?.toLowerCase().includes(q) || c.lastName?.toLowerCase().includes(q)
    if (!matchSearch) return false
    if (filter === 'active')    return c.status !== 'SUSPENDED' && c.status !== 'DEACTIVATED'
    if (filter === 'suspended') return c.status === 'SUSPENDED'
    if (filter === 'new')       return c.createdAt ? new Date(c.createdAt) > cutoff7d : false
    return true
  })

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
      <div className="flex items-center gap-3 flex-wrap">
        <FilterBar options={FILTERS} value={filter} onChange={v => setFilter(v as Filter)} />
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
                      <td colSpan={7} className="px-6 py-5">
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
