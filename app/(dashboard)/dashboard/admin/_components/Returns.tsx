'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { adminApi } from '@/lib/api'
import type { ApiOrder, AdminCustomer } from '@/types/api'
import { PageHeader, KPIGrid, KPICell, SectionCard, StatusBadge, EmptyState, Loader, TH, TD, TableRow, fmt, fmtEur, dailyCounts, dailySumByKey, weekDeltaStr } from './shared'
import { RotateCcw, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react'

function ActionBtn({
  onClick, disabled, variant, children,
}: {
  onClick: () => void
  disabled?: boolean
  variant: 'danger' | 'success' | 'purple'
  children: React.ReactNode
}) {
  const styles = {
    danger:  'border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600',
    success: 'border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600',
    purple:  'border-[#370E4D]/30 text-[#370E4D] hover:bg-[#370E4D] hover:text-white hover:border-[#370E4D]',
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

const REASON_LABELS: Record<string, string> = {
  WRONG_SIZE:        'Falsche Größe',
  WRONG_COLOR:       'Falsche Farbe',
  DAMAGED:           'Beschädigt',
  DEFECTIVE:         'Defekt',
  NOT_AS_DESCRIBED:  'Nicht wie beschrieben',
  NO_LONGER_WANTED:  'Nicht mehr gewünscht',
  OTHER:             'Sonstiges',
}

export default function Returns({ customers = [] }: { customers?: AdminCustomer[] }) {
  const [orders, setOrders]     = useState<ApiOrder[]>([])
  const [loading, setLoading]   = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [acting, setActing]     = useState<string | null>(null)
  const [refundingId, setRefundingId]   = useState<string | null>(null)
  const [refundAmount, setRefundAmount] = useState('')

  function getCustomerLabel(userId?: string) {
    if (!userId) return '—'
    const c = customers.find(c => c.id === userId || c.userId === userId)
    if (c) return [c.firstName, c.lastName].filter(Boolean).join(' ') || c.email
    return String(userId).slice(0, 8)
  }

  useEffect(() => {
    adminApi.orders.getAll().catch(() => [])
      .then(all => setOrders(all.filter(o =>
        ['RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_RECEIVED', 'REFUNDED'].includes(o.status)
      )))
      .finally(() => setLoading(false))
  }, [])

  const requested = orders.filter(o => o.status === 'RETURN_REQUESTED')
  const approved  = orders.filter(o => o.status === 'RETURN_APPROVED')
  const refunded  = orders.filter(o => o.status === 'REFUNDED')

  const kpiData = useMemo(() => {
    const now = Date.now()
    const w7  = 7 * 86400000
    const w14 = 14 * 86400000
    const inW7  = (s: string) => now - new Date(s).getTime() < w7
    const inW14 = (s: string) => { const t = now - new Date(s).getTime(); return t >= w7 && t < w14 }
    const req = orders.filter(o => o.status === 'RETURN_REQUESTED')
    const appr = orders.filter(o => o.status === 'RETURN_APPROVED')
    const ref  = orders.filter(o => o.status === 'REFUNDED')
    return {
      requestedSpark: dailyCounts(req),
      approvedSpark:  dailyCounts(appr),
      refundedSpark:  dailySumByKey(ref, 'totalAmount'),
      allSpark:       dailyCounts(orders),
      requestedDelta: weekDeltaStr(req.filter(o => inW7(o.createdAt)).length, req.filter(o => inW14(o.createdAt)).length),
      refundedDelta:  weekDeltaStr(ref.filter(o => inW7(o.createdAt)).length, ref.filter(o => inW14(o.createdAt)).length),
    }
  }, [orders])

  async function approveReturn(orderId: string) {
    setActing(orderId)
    try {
      const updated = await adminApi.orders.approveReturn(orderId)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated } : o))
    } catch { /* silent */ } finally { setActing(null) }
  }

  // Backend flow: RETURN_APPROVED → receive (stock restored) → RETURN_RECEIVED → refund
  async function receiveReturn(orderId: string) {
    setActing(orderId)
    try {
      const updated = await adminApi.orders.receiveReturn(orderId)
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

  async function reject(orderId: string) {
    setActing(orderId)
    try {
      await adminApi.orders.updateStatus(orderId, 'DELIVERED')
      setOrders(prev => prev.filter(o => o.id !== orderId))
    } catch { /* silent */ } finally { setActing(null) }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finanzen"
        title="Rückgaben &"
        italicTitle="Erstattungen."
      />

      <KPIGrid>
        <KPICell accent
          label="Angefragt"
          value={requested.length}
          sub="Warten auf Prüfung"
          delta={kpiData.requestedDelta}
          period="vs. Vorwoche"
          spark={kpiData.requestedSpark}
          inverseTrend
        />
        <KPICell
          label="Genehmigt"
          value={approved.length}
          sub="Rückgabe bestätigt"
          spark={kpiData.approvedSpark}
        />
        <KPICell
          label="Erstattet"
          value={refunded.length}
          sub={fmtEur(refunded.reduce((s, o) => s + o.totalAmount, 0))}
          delta={kpiData.refundedDelta}
          period="vs. Vorwoche"
          spark={kpiData.refundedSpark}
          inverseTrend
        />
        <KPICell
          label="Gesamt"
          value={orders.length}
          sub="Alle Vorgänge"
          spark={kpiData.allSpark}
        />
      </KPIGrid>

      <SectionCard title="Rückgabeanfragen" count={orders.length}>
        {loading ? <Loader /> : orders.length === 0 ? <EmptyState message="Keine Rückgabeanfragen." /> : (
          <table className="w-full">
            <thead>
              <tr>
                <TH>Bestellung</TH>
                <TH>Kunde</TH>
                <TH>Grund</TH>
                <TH>Datum</TH>
                <TH>Betrag</TH>
                <TH>Status</TH>
                <TH>Aktionen</TH>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <React.Fragment key={order.id}>
                  <TableRow>
                    <TD className="font-mono font-semibold text-[#0A0A0A]">#{String(order.id).slice(0, 8).toUpperCase()}</TD>
                    <TD className="text-[#6B6B6B]">{getCustomerLabel(order.userId)}</TD>
                    <TD>
                      {order.returnReason ? (
                        <span className="text-[11px] text-[#2D2D2D]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                          {REASON_LABELS[order.returnReason] ?? order.returnReason}
                        </span>
                      ) : <span className="text-[#C9C9C9]">—</span>}
                    </TD>
                    <TD className="text-[#6B6B6B]">{fmt(order.createdAt)}</TD>
                    <TD className="font-medium text-[#0A0A0A]">{fmtEur(order.totalAmount)}</TD>
                    <TD><StatusBadge status={order.status} /></TD>
                    <TD>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                          className="p-1.5 rounded-lg hover:bg-[#F5F5F0] text-[#9B9B9B] hover:text-[#6B6B6B] transition-all duration-200"
                        >
                          {expanded === order.id
                            ? <ChevronUp className="w-3.5 h-3.5" />
                            : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        {order.status === 'RETURN_REQUESTED' && (
                          <>
                            <ActionBtn variant="success" disabled={acting === order.id} onClick={() => approveReturn(order.id)}>
                              <CheckCircle className="w-3 h-3" /> Genehmigen
                            </ActionBtn>
                            <ActionBtn variant="danger" disabled={acting === order.id} onClick={() => reject(order.id)}>
                              <XCircle className="w-3 h-3" /> Ablehnen
                            </ActionBtn>
                          </>
                        )}
                        {order.status === 'RETURN_APPROVED' && (
                          <ActionBtn variant="success" disabled={acting === order.id} onClick={() => receiveReturn(order.id)}>
                            <CheckCircle className="w-3 h-3" /> Wareneingang bestätigen
                          </ActionBtn>
                        )}
                        {order.status === 'RETURN_RECEIVED' && (
                          refundingId !== order.id ? (
                            <ActionBtn variant="purple" disabled={acting === order.id} onClick={() => { setRefundingId(order.id); setRefundAmount(String(order.totalAmount)) }}>
                              <RotateCcw className="w-3 h-3" /> Refund ({fmtEur(order.totalAmount)})
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
                          )
                        )}
                      </div>
                    </TD>
                  </TableRow>

                  {expanded === order.id && (
                    <tr className="border-b border-[#F0F0EB]" style={{ background: '#F8F8F5' }}>
                      <td colSpan={7} className="px-6 py-5">
                        <div className="grid grid-cols-3 gap-6">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.12em] text-[#9B9B9B] font-medium mb-2">Artikel</p>
                            {order.items?.map(item => (
                              <div key={item.id} className="text-[12px] text-[#0A0A0A]">
                                {item.name} × {item.quantity} — <span className="text-[#6B6B6B]">{fmtEur(item.price)}</span>
                              </div>
                            ))}
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.12em] text-[#9B9B9B] font-medium mb-2">Rückgabegrund</p>
                            {order.returnReason ? (
                              <div className="text-[12px] text-[#0A0A0A]">
                                <p className="font-medium">{REASON_LABELS[order.returnReason] ?? order.returnReason}</p>
                                {order.returnDescription && (
                                  <p className="text-[#6B6B6B] mt-1 italic" style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300 }}>
                                    &ldquo;{order.returnDescription}&rdquo;
                                  </p>
                                )}
                                {order.returnNumber && (
                                  <p className="text-[10px] font-mono text-[#9B9B9B] mt-1">{order.returnNumber}</p>
                                )}
                              </div>
                            ) : <p className="text-[11px] text-[#9B9B9B]">—</p>}
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.12em] text-[#9B9B9B] font-medium mb-2">Lieferadresse</p>
                            {order.shippingAddress ? (
                              <div className="text-[12px] text-[#0A0A0A] space-y-0.5">
                                <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                                <p className="text-[#6B6B6B]">{order.shippingAddress.street}, {order.shippingAddress.postalCode} {order.shippingAddress.city}</p>
                              </div>
                            ) : <p className="text-[11px] text-[#9B9B9B]">—</p>}
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
