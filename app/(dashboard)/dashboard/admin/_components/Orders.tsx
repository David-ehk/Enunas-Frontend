'use client'

import React, { useState, useEffect } from 'react'
import { adminApi } from '@/lib/api'
import type { ApiOrder, AdminCustomer } from '@/types/api'
import { PageHeader, SectionCard, StatusBadge, EmptyState, Loader, SearchInput, SelectFilter, TH, TD, TableRow, fmt, fmtEur } from './shared'
import { ChevronDown, ChevronUp, RotateCcw, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type Filter = 'all' | 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURN_REQUESTED' | 'REFUNDED'

const ORDER_STATUSES: { id: Filter; label: string }[] = [
  { id: 'all',              label: 'Alle' },
  { id: 'PENDING',          label: 'Pending' },
  { id: 'PAID',             label: 'Bezahlt' },
  { id: 'PROCESSING',       label: 'Bearbeitung' },
  { id: 'SHIPPED',          label: 'Versandt' },
  { id: 'DELIVERED',        label: 'Geliefert' },
  { id: 'RETURN_REQUESTED', label: 'Rückgabe' },
  { id: 'CANCELLED',        label: 'Storniert' },
  { id: 'REFUNDED',         label: 'Erstattet' },
]

function ActionBtn({
  onClick, disabled, variant, children,
}: {
  onClick: () => void
  disabled?: boolean
  variant: 'danger' | 'success' | 'purple' | 'ghost'
  children: React.ReactNode
}) {
  const styles = {
    danger:  'border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600',
    success: 'border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600',
    purple:  'border-[#370E4D]/30 text-[#370E4D] hover:bg-[#370E4D] hover:text-white hover:border-[#370E4D]',
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

export default function Orders({ customers = [] }: { customers?: AdminCustomer[] }) {
  const [orders, setOrders]     = useState<ApiOrder[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState<Filter>('all')
  const [search, setSearch]     = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [acting, setActing]     = useState<string | null>(null)
  const [statusInput, setStatusInput] = useState('')
  const [refundingId, setRefundingId]   = useState<string | null>(null)
  const [refundAmount, setRefundAmount] = useState('')
  const [amountFilter, setAmountFilter] = useState<string>('all')
  const [sortBy, setSortBy]             = useState<string>('newest')

  function getCustomerLabel(userId?: string) {
    if (!userId) return '—'
    const c = customers.find(c => c.id === userId || c.userId === userId)
    if (c) return [c.firstName, c.lastName].filter(Boolean).join(' ') || c.email
    return String(userId).slice(0, 8)
  }

  useEffect(() => {
    adminApi.orders.getAll().catch(() => []).then(setOrders).finally(() => setLoading(false))
  }, [])

  const visible = (() => {
    const q = search.toLowerCase()
    let arr = orders.filter(o => {
      const cLabel = getCustomerLabel(o.userId).toLowerCase()
      const matchSearch = !q || o.id.toLowerCase().includes(q) || o.userId?.toLowerCase().includes(q) || cLabel.includes(q)
      if (!matchSearch) return false
      if (filter !== 'all') return o.status === filter
      return true
    })
    if (amountFilter === 'lt50')    arr = arr.filter(o => o.totalAmount < 50)
    if (amountFilter === '50-100')  arr = arr.filter(o => o.totalAmount >= 50 && o.totalAmount < 100)
    if (amountFilter === '100-200') arr = arr.filter(o => o.totalAmount >= 100 && o.totalAmount < 200)
    if (amountFilter === '200-500') arr = arr.filter(o => o.totalAmount >= 200 && o.totalAmount < 500)
    if (amountFilter === 'gt500')   arr = arr.filter(o => o.totalAmount >= 500)
    return [...arr].sort((a, b) => {
      if (sortBy === 'highest') return b.totalAmount - a.totalAmount
      if (sortBy === 'lowest')  return a.totalAmount - b.totalAmount
      if (sortBy === 'oldest')  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  })()

  async function changeStatus(orderId: string, status: string) {
    setActing(orderId)
    try {
      const updated = await adminApi.orders.updateStatus(orderId, status)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated } : o))
    } catch { /* silent */ } finally { setActing(null); setStatusInput('') }
  }

  async function cancelOrder(orderId: string) {
    setActing(orderId)
    try {
      const updated = await adminApi.orders.cancel(orderId, 'Storniert durch Admin')
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated } : o))
    } catch { /* silent */ } finally { setActing(null) }
  }

  async function approveReturn(orderId: string) {
    setActing(orderId)
    try {
      const updated = await adminApi.orders.approveReturn(orderId)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated } : o))
    } catch { /* silent */ } finally { setActing(null) }
  }

  async function refund(orderId: string, amount: number) {
    setActing(orderId)
    try {
      const updated = await adminApi.orders.refund(orderId, amount)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated } : o))
    } catch { /* silent */ } finally { setActing(null) }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Verwaltung"
        title="Bestellungen"
        italicTitle="verwaltung."
        sub={`${orders.filter(o => o.status === 'RETURN_REQUESTED').length} Rückgaben ausstehend · ${orders.length} Bestellungen gesamt`}
      />

      <div className="flex items-center gap-3 flex-wrap">
        {/* Scrollable pill filters for all 9 statuses */}
        <div className="flex items-center gap-0.5 bg-[#F5F5F0] border border-[#E8E8E8] rounded-xl p-1 overflow-x-auto">
          {ORDER_STATUSES.map(s => (
            <button
              key={s.id}
              onClick={() => setFilter(s.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all duration-200 shrink-0',
                filter === s.id
                  ? 'bg-white text-[#370E4D] shadow-[0_1px_4px_rgba(0,0,0,0.08)] border border-[#E8E8E8]'
                  : 'text-[#6B6B6B] hover:text-[#2D2D2D]'
              )}
              style={{ fontFamily: 'var(--font-league-spartan)', letterSpacing: '0.03em' }}
            >
              {s.label}
            </button>
          ))}
        </div>
        <SelectFilter
          value={amountFilter}
          onChange={setAmountFilter}
          options={[
            { value: 'all',     label: 'Alle Beträge' },
            { value: 'lt50',    label: '< €50' },
            { value: '50-100',  label: '€50 – €100' },
            { value: '100-200', label: '€100 – €200' },
            { value: '200-500', label: '€200 – €500' },
            { value: 'gt500',   label: '> €500' },
          ]}
        />
        <SelectFilter
          value={sortBy}
          onChange={setSortBy}
          options={[
            { value: 'newest',  label: 'Neueste zuerst' },
            { value: 'oldest',  label: 'Älteste zuerst' },
            { value: 'highest', label: 'Höchster Betrag' },
            { value: 'lowest',  label: 'Niedrigster Betrag' },
          ]}
        />
        <div className="flex-1 min-w-[160px] max-w-xs">
          <SearchInput value={search} onChange={setSearch} placeholder="Order-ID, Kundenname…" />
        </div>
      </div>

      <SectionCard title="Bestellungen" count={visible.length}>
        {loading ? <Loader /> : visible.length === 0 ? <EmptyState message="Keine Bestellungen gefunden." /> : (
          <table className="w-full">
            <thead>
              <tr>
                <TH>Bestellung</TH>
                <TH>Kunde</TH>
                <TH>Datum</TH>
                <TH>Betrag</TH>
                <TH>Artikel</TH>
                <TH>Status</TH>
                <TH>Tracking</TH>
                <TH></TH>
              </tr>
            </thead>
            <tbody>
              {visible.map(order => (
                <React.Fragment key={order.id}>
                  <TableRow>
                    <TD className="font-mono font-semibold text-[#0A0A0A]">#{String(order.id).slice(0, 8).toUpperCase()}</TD>
                    <TD className="text-[#6B6B6B]">{getCustomerLabel(order.userId)}</TD>
                    <TD className="text-[#6B6B6B]">{fmt(order.createdAt)}</TD>
                    <TD className="font-medium text-[#0A0A0A]">{fmtEur(order.totalAmount)}</TD>
                    <TD className="text-[#6B6B6B]">{order.items?.length ?? 0}</TD>
                    <TD><StatusBadge status={order.status} /></TD>
                    <TD className="font-mono text-[11px] text-[#9B9B9B]">{order.trackingNumber || '—'}</TD>
                    <TD>
                      <button
                        onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                        className="p-1.5 rounded-lg hover:bg-[#F5F5F0] text-[#9B9B9B] hover:text-[#6B6B6B] transition-all duration-200"
                      >
                        {expanded === order.id
                          ? <ChevronUp className="w-3.5 h-3.5" />
                          : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </TD>
                  </TableRow>

                  {expanded === order.id && (
                    <tr className="border-b border-[#F0F0EB]" style={{ background: '#F8F8F5' }}>
                      <td colSpan={8} className="px-6 py-5">
                        <div className="grid grid-cols-3 gap-6 mb-5">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.12em] text-[#9B9B9B] font-medium mb-2">Lieferadresse</p>
                            {order.shippingAddress ? (
                              <div className="text-[12px] text-[#0A0A0A] space-y-0.5">
                                <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                                <p className="text-[#6B6B6B]">{order.shippingAddress.street}</p>
                                <p className="text-[#6B6B6B]">{order.shippingAddress.postalCode} {order.shippingAddress.city}</p>
                                <p className="text-[#6B6B6B]">{order.shippingAddress.country}</p>
                              </div>
                            ) : <p className="text-[11px] text-[#9B9B9B]">—</p>}
                          </div>

                          <div>
                            <p className="text-[10px] uppercase tracking-[0.12em] text-[#9B9B9B] font-medium mb-2">Artikel</p>
                            <div className="space-y-1">
                              {order.items?.map(item => (
                                <div key={item.id} className="text-[12px] text-[#0A0A0A]">
                                  {item.name} × {item.quantity}
                                  {item.size && <span className="text-[#9B9B9B]"> · {item.size}</span>}
                                  {item.color && <span className="text-[#9B9B9B]"> · {item.color}</span>}
                                  <span className="text-[#6B6B6B]"> — {fmtEur(item.price)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-[10px] uppercase tracking-[0.12em] text-[#9B9B9B] font-medium mb-2">Info</p>
                            <div className="text-[12px] text-[#0A0A0A] space-y-1.5">
                              <div className="flex justify-between">
                                <span className="text-[#9B9B9B]">Erstellt</span>
                                <span>{fmt(order.createdAt)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[#9B9B9B]">Aktualisiert</span>
                                <span>{fmt(order.updatedAt)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-[#9B9B9B]">Status</span>
                                <StatusBadge status={order.status} />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap border-t border-[#EBEBEB] pt-4">
                          <p className="text-[10px] uppercase tracking-[0.12em] text-[#9B9B9B] font-medium mr-1">Aktionen</p>

                          <select
                            value={statusInput}
                            onChange={e => setStatusInput(e.target.value)}
                            className="text-[11px] border border-[#E8E8E8] bg-white px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#370E4D]/40 focus:ring-2 focus:ring-[#370E4D]/8 transition-all duration-200"
                            style={{ fontFamily: 'var(--font-league-spartan)' }}
                          >
                            <option value="">Status ändern…</option>
                            {['PENDING','PAID','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED'].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          {statusInput && (
                            <button
                              disabled={acting === order.id}
                              onClick={() => changeStatus(order.id, statusInput)}
                              className="inline-flex items-center h-7 px-3 rounded-lg text-[11px] font-medium text-white transition-all duration-200 disabled:opacity-40"
                              style={{ fontFamily: 'var(--font-league-spartan)', background: '#370E4D' }}
                            >
                              Speichern
                            </button>
                          )}

                          {order.status !== 'CANCELLED' && order.status !== 'REFUNDED' && (
                            <ActionBtn variant="danger" disabled={acting === order.id} onClick={() => cancelOrder(order.id)}>
                              <XCircle className="w-3 h-3" /> Stornieren
                            </ActionBtn>
                          )}

                          {order.status === 'RETURN_REQUESTED' && (
                            <>
                              <ActionBtn variant="success" disabled={acting === order.id} onClick={() => approveReturn(order.id)}>
                                <RotateCcw className="w-3 h-3" /> Rückgabe genehmigen
                              </ActionBtn>
                              {refundingId !== order.id ? (
                                <ActionBtn variant="purple" disabled={acting === order.id} onClick={() => { setRefundingId(order.id); setRefundAmount(String(order.totalAmount)) }}>
                                  Refund ({fmtEur(order.totalAmount)})
                                </ActionBtn>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <input
                                    autoFocus
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={refundAmount}
                                    onChange={e => setRefundAmount(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && (refund(order.id, parseFloat(refundAmount) || 0), setRefundingId(null))}
                                    className="text-[11px] border border-[#370E4D]/30 bg-white rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#370E4D]/40 w-28 tabular-nums transition-all duration-200"
                                    style={{ fontFamily: 'var(--font-league-spartan)' }}
                                  />
                                  <button
                                    onClick={() => { refund(order.id, parseFloat(refundAmount) || 0); setRefundingId(null) }}
                                    disabled={acting === order.id}
                                    className="inline-flex items-center h-7 px-3 rounded-lg text-[11px] font-medium text-white transition-all duration-200 disabled:opacity-40"
                                    style={{ fontFamily: 'var(--font-league-spartan)', background: '#370E4D' }}
                                  >
                                    Bestätigen
                                  </button>
                                  <button
                                    onClick={() => setRefundingId(null)}
                                    className="inline-flex items-center h-7 px-2.5 rounded-lg text-[11px] font-medium text-[#6B6B6B] hover:text-[#0A0A0A] transition-all duration-200"
                                    style={{ fontFamily: 'var(--font-league-spartan)' }}
                                  >
                                    Abbrechen
                                  </button>
                                </div>
                              )}
                            </>
                          )}
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
