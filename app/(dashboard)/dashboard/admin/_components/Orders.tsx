'use client'

import React, { useState, useEffect } from 'react'
import { adminApi } from '@/lib/api'
import type { ApiOrder, ApiOrderItem, AdminCustomer, CancelReason } from '@/types/api'
import { PageHeader, SectionCard, StatusBadge, ActionDialog, ItemCancellationBadge, EmptyState, Loader, SearchInput, SelectFilter, TH, TD, TableRow, fmt, fmtEur } from './shared'
import { ChevronDown, ChevronUp, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import OrderItemThumb from '@/components/ui/OrderItemThumb'
import { canCancelOrder } from '@/lib/canCancelOrder'
import { isItemActive, hasNonActiveItems } from '@/lib/orderItemCancellation'
import { describeOrderItem } from '@/lib/orderItemDisplay'
import { mergeOrderUpdate } from '@/lib/mergeOrderUpdate'
import { cancelOrderErrorMessage } from '@/lib/api/errorCopy'
import { cancelOrderItems, reconcileCancelledItem } from '@/lib/orderItemCancellationActions'

type Filter = 'all' | 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURN_REQUESTED' | 'REFUNDED' | 'SHIPPING_PROBLEM' | 'AWAITING_ADMIN' | 'MANUAL_REVIEW'

const ORDER_STATUSES: { id: Filter; label: string }[] = [
  { id: 'all',              label: 'Alle' },
  { id: 'PENDING',          label: 'Ausstehend' },
  { id: 'PAID',             label: 'Bezahlt' },
  { id: 'SHIPPED',          label: 'Versandt' },
  { id: 'DELIVERED',        label: 'Geliefert' },
  { id: 'SHIPPING_PROBLEM', label: 'Versandproblem' },
  { id: 'AWAITING_ADMIN',   label: 'Auf Admin wartend' },
  { id: 'MANUAL_REVIEW',    label: 'Manuelle Überprüfung' },
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

// ─── Shared Styles ────────────────────────────────────────────────────────────
const LABEL = 'block text-[10px] uppercase tracking-[0.12em] text-[#6B6B6B] font-medium mb-1.5'
const INPUT = 'w-full text-[13px] border border-[#E8E8E8] bg-white rounded-none px-3.5 py-2.5 focus:outline-none focus:border-[#370E4D]/50 focus:ring-2 focus:ring-[#370E4D]/8 transition-all duration-200 placeholder:text-[#C0C0BC]'

const CANCEL_REASONS: { value: CancelReason; label: string }[] = [
  { value: 'FRAUD_SUSPICION', label: 'Verdacht auf Betrug' },
  { value: 'OUT_OF_STOCK', label: 'Ausverkauft' },
  { value: 'CUSTOMER_REQUEST', label: 'Kundenwunsch' },
  { value: 'TECHNICAL_ERROR', label: 'Technischer Fehler' },
  { value: 'OTHER', label: 'Sonstiges' },
]

// Declared at module scope (not nested in Orders()) so React doesn't recreate the component
// type — and reset its internal state — on every render of the parent.
function ItemCancelModal({
  order,
  itemIds,
  onClose,
  onSuccess,
  onOrderRefreshed,
}: {
  order: ApiOrder
  itemIds: string[]
  onClose: () => void
  onSuccess: (updated: ApiOrder) => void
  onOrderRefreshed: (updated: ApiOrder) => void
}) {
  const [reason, setReason] = useState<CancelReason>('OTHER')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function submit() {
    setSubmitting(true)
    setErr(null)
    const outcome = await cancelOrderItems(order.id, itemIds, reason, note.trim() || undefined)
    if (outcome.ok) {
      onSuccess(outcome.order)
    } else {
      // A 409 can mean the refund outcome is unknown and the item is now PENDING — refresh so
      // the admin sees the current state without closing the dialog.
      if (outcome.refreshedOrder) onOrderRefreshed(outcome.refreshedOrder)
      setErr(outcome.message)
    }
    setSubmitting(false)
  }

  return (
    <ActionDialog
      eyebrow="Artikel stornieren"
      orderLabel={order.orderNumber ?? `#${String(order.id).slice(0, 8).toUpperCase()}`}
      warning={`⚠️ ${itemIds.length} Artikel werden storniert. Der gezahlte Betrag für diese Artikel wird automatisch erstattet.`}
      error={err}
      submitLabel="Stornieren"
      busyLabel="Wird storniert…"
      submitting={submitting}
      submitColor="#8B1E3F"
      onSubmit={submit}
      onClose={onClose}
    >
      <div>
        <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Grund *</label>
        <select
          value={reason}
          onChange={e => setReason(e.target.value as CancelReason)}
          className={INPUT}
          style={{ fontFamily: 'var(--font-league-spartan)' }}
        >
          {CANCEL_REASONS.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Notiz (optional, max 500 Zeichen)</label>
        <textarea
          rows={3}
          className={INPUT}
          value={note}
          onChange={e => setNote(e.target.value.slice(0, 500))}
          placeholder="z.B. Artikel am Lager beschädigt…"
          style={{ fontFamily: 'var(--font-league-spartan)', resize: 'vertical' }}
        />
      </div>
    </ActionDialog>
  )
}

function ReconcileModal({
  order,
  item,
  onClose,
  onResolved,
  onOrderRefreshed,
}: {
  order: ApiOrder
  item: ApiOrderItem
  onClose: () => void
  onResolved: (updated: ApiOrder) => void
  onOrderRefreshed: (updated: ApiOrder) => void
}) {
  const [action, setAction] = useState<'RECORD' | 'RELEASE'>('RECORD')
  const [refundId, setRefundId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function submit() {
    if (!item.cancellationClaimKey) { setErr('Kein Claim-Key auf diesem Artikel gefunden.'); return }
    if (action === 'RECORD' && !refundId.trim()) { setErr('Erstattungs-ID ist für "Erstattung gefunden" erforderlich.'); return }
    setSubmitting(true)
    setErr(null)
    const outcome = await reconcileCancelledItem(
      order.id,
      item.cancellationClaimKey,
      action,
      action === 'RECORD' ? refundId.trim() : undefined,
    )
    if (outcome.ok) {
      onResolved(outcome.order)
    } else {
      // A 409 can mean the claim was already settled elsewhere — refresh so the admin sees the
      // current state without closing the dialog.
      if (outcome.refreshedOrder) onOrderRefreshed(outcome.refreshedOrder)
      setErr(outcome.message)
    }
    setSubmitting(false)
  }

  return (
    <ActionDialog
      eyebrow="Storno klären"
      orderLabel={order.orderNumber ?? `#${String(order.id).slice(0, 8).toUpperCase()}`}
      warning="⚠️ Prüfe zuerst in Mollie, ob eine Erstattung für diesen Artikel existiert, bevor du hier etwas bestätigst."
      error={err}
      submitLabel="Bestätigen"
      busyLabel="Wird geklärt…"
      submitting={submitting}
      submitColor="#370E4D"
      onSubmit={submit}
      onClose={onClose}
    >
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setAction('RECORD')}
          className="flex-1 h-9 text-[12px] font-medium border transition-all duration-150"
          style={{ fontFamily: 'var(--font-league-spartan)', background: action === 'RECORD' ? '#370E4D' : '#fff', color: action === 'RECORD' ? '#fff' : '#6B6B6B', borderColor: action === 'RECORD' ? '#370E4D' : '#E8E8E8' }}
        >
          Erstattung gefunden
        </button>
        <button
          type="button"
          onClick={() => setAction('RELEASE')}
          className="flex-1 h-9 text-[12px] font-medium border transition-all duration-150"
          style={{ fontFamily: 'var(--font-league-spartan)', background: action === 'RELEASE' ? '#370E4D' : '#fff', color: action === 'RELEASE' ? '#fff' : '#6B6B6B', borderColor: action === 'RELEASE' ? '#370E4D' : '#E8E8E8' }}
        >
          Keine Erstattung
        </button>
      </div>

      {action === 'RECORD' && (
        <div>
          <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Mollie-Erstattungs-ID *</label>
          <input
            type="text"
            className={INPUT}
            value={refundId}
            onChange={e => setRefundId(e.target.value.slice(0, 64))}
            placeholder="re_..."
            style={{ fontFamily: 'monospace' }}
          />
        </div>
      )}
    </ActionDialog>
  )
}

function CancelModal({
  order,
  onClose,
  onCancelled,
}: {
  order: ApiOrder
  onClose: () => void
  onCancelled: (updated: ApiOrder) => void
}) {
  const [reason, setReason] = useState<CancelReason>('OTHER')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const isPaid = !!order.paidAt || order.status === 'PAID'

  async function submit() {
    setSubmitting(true)
    setErr(null)
    try {
      const updated = await adminApi.orders.cancel(order.id, reason, note.trim() || undefined)
      onCancelled(updated)
    } catch (e: unknown) {
      const msg = cancelOrderErrorMessage(order.status, e instanceof Error ? e.message : 'Stornierung fehlgeschlagen.')
      setErr(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ActionDialog
      eyebrow="Bestellung stornieren"
      orderLabel={order.orderNumber ?? `#${String(order.id).slice(0, 8).toUpperCase()}`}
      warning={isPaid ? '⚠️ Diese Bestellung wurde bezahlt. Der vollständige Betrag wird automatisch an den Kunden erstattet und per E-Mail bestätigt.' : undefined}
      error={err}
      submitLabel="Stornieren"
      busyLabel="Wird storniert…"
      submitting={submitting}
      submitColor="#8B1E3F"
      onSubmit={submit}
      onClose={onClose}
    >
      <div>
        <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Grund *</label>
        <select
          value={reason}
          onChange={e => setReason(e.target.value as CancelReason)}
          className={INPUT}
          style={{ fontFamily: 'var(--font-league-spartan)' }}
        >
          {CANCEL_REASONS.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Notiz (optional, max 500 Zeichen)</label>
        <textarea
          rows={3}
          className={INPUT}
          value={note}
          onChange={e => setNote(e.target.value.slice(0, 500))}
          placeholder="z.B. Artikel am Lager beschädigt, Betrug erkannt…"
          style={{ fontFamily: 'var(--font-league-spartan)', resize: 'vertical' }}
        />
      </div>
    </ActionDialog>
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
  const [amountFilter, setAmountFilter] = useState<string>('all')
  const [sortBy, setSortBy]             = useState<string>('newest')
  const [cancelOrderData, setCancelOrderData] = useState<{ order: ApiOrder; showDialog: boolean } | null>(null)
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
  const [itemCancelTarget, setItemCancelTarget] = useState<ApiOrder | null>(null)
  const [reconcileTarget, setReconcileTarget] = useState<{ order: ApiOrder; item: ApiOrderItem } | null>(null)

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
      const matchSearch = !q || String(o.orderNumber ?? '').toLowerCase().includes(q) || String(o.id).toLowerCase().includes(q) || String(o.userId ?? '').toLowerCase().includes(q) || cLabel.includes(q)
      if (!matchSearch) return false
      if (filter !== 'all') return o.status === filter
      return true
    })
    const amt = (o: ApiOrder) => o.total ?? o.totalAmount ?? 0
    if (amountFilter === 'lt50')    arr = arr.filter(o => amt(o) < 50)
    if (amountFilter === '50-100')  arr = arr.filter(o => amt(o) >= 50 && amt(o) < 100)
    if (amountFilter === '100-200') arr = arr.filter(o => amt(o) >= 100 && amt(o) < 200)
    if (amountFilter === '200-500') arr = arr.filter(o => amt(o) >= 200 && amt(o) < 500)
    if (amountFilter === 'gt500')   arr = arr.filter(o => amt(o) >= 500)
    return [...arr].sort((a, b) => {
      if (sortBy === 'highest') return amt(b) - amt(a)
      if (sortBy === 'lowest')  return amt(a) - amt(b)
      if (sortBy === 'oldest')  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  })()

  async function changeStatus(orderId: string, status: string) {
    setActing(orderId)
    try {
      const updated = await adminApi.orders.updateStatus(orderId, status)
      setOrders(prev => prev.map(o => o.id === orderId ? mergeOrderUpdate(o, updated) : o))
    } catch { /* silent */ } finally { setActing(null); setStatusInput('') }
  }

  function openCancelDialog(order: ApiOrder) {
    setCancelOrderData({ order, showDialog: true })
  }

  function closeCancelDialog() {
    setCancelOrderData(null)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Verwaltung"
        title="Bestellungen"
        italicTitle="verwaltung."
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
              {visible.map(order => {
                // Item-level cancel is only offered on a paid-and-not-yet-fully-shipped order;
                // the backend still enforces the real rule (per-brand shipped state) and
                // answers 409 otherwise.
                const orderIsPaidish = order.status === 'PAID' || order.status === 'PARTIALLY_SHIPPED'
                return (
                <React.Fragment key={order.id}>
                  <TableRow>
                    <TD className="font-mono font-semibold text-[#0A0A0A]">{order.orderNumber ?? `#${String(order.id).slice(0, 8).toUpperCase()}`}</TD>
                    <TD className="text-[#6B6B6B]">{getCustomerLabel(order.userId)}</TD>
                    <TD className="text-[#6B6B6B]">{fmt(order.createdAt)}</TD>
                    <TD className="font-medium text-[#0A0A0A]">{fmtEur(order.total ?? order.totalAmount)}</TD>
                    <TD className="text-[#6B6B6B]">{order.items?.length ?? 0}</TD>
                    <TD><StatusBadge status={order.status} /></TD>
                    <TD className="font-mono text-[11px] text-[#9B9B9B]">
                      {(order.shipments ?? [])
                        .filter(s => s.trackingNumber)
                        .map(s => [s.carrier, s.trackingNumber].filter(Boolean).join(' '))
                        .join(' · ') || '—'}
                    </TD>
                    <TD>
                      <button
                        onClick={() => { setExpanded(expanded === order.id ? null : order.id); setSelectedItemIds([]) }}
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
                            <div className="space-y-2">
                              {order.items?.map(item => {
                                const d = describeOrderItem(item)
                                const active = isItemActive(item)
                                const canSelect = active && orderIsPaidish
                                return (
                                  <div key={item.id} className="flex items-center gap-2.5 text-[12px] text-[#0A0A0A]">
                                    {canSelect && (
                                      <input
                                        type="checkbox"
                                        checked={selectedItemIds.includes(item.id)}
                                        onChange={e => setSelectedItemIds(prev =>
                                          e.target.checked ? [...prev, item.id] : prev.filter(id => id !== item.id)
                                        )}
                                        className="accent-[#370E4D]"
                                      />
                                    )}
                                    <OrderItemThumb src={item.imageUrl} alt={d.label} width={30} />
                                    <span className={cn(!active && 'line-through text-[#9B9B9B]')}>
                                      {d.label} × {item.quantity}
                                      {d.variant && <span className="text-[#9B9B9B]"> · {d.variant}</span>}
                                      {d.unitPrice != null && <span className="text-[#6B6B6B]"> — {fmtEur(d.unitPrice)}</span>}
                                    </span>
                                    <ItemCancellationBadge item={item} onReconcile={() => setReconcileTarget({ order, item })} />
                                  </div>
                                )
                              })}
                              {selectedItemIds.length > 0 && (
                                <button
                                  onClick={() => setItemCancelTarget(order)}
                                  className="inline-flex items-center gap-1 h-7 px-2.5 mt-1 rounded-lg text-[11px] font-medium border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all duration-200"
                                >
                                  <XCircle className="w-3 h-3" /> Ausgewählte Artikel stornieren ({selectedItemIds.length})
                                </button>
                              )}
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
                                <span>{order.updatedAt ? fmt(order.updatedAt) : '—'}</span>
                              </div>
                              {order.paidAt && (
                                <div className="flex justify-between">
                                  <span className="text-[#9B9B9B]">Bezahlt am</span>
                                  <span>{fmt(order.paidAt)}</span>
                                </div>
                              )}
                              <div className="flex justify-between items-center">
                                <span className="text-[#9B9B9B]">Status</span>
                                <StatusBadge status={order.status} />
                              </div>
                              {order.cancellationReason && (
                                <div className="flex justify-between">
                                  <span className="text-[#9B9B9B]">Storno-Grund</span>
                                  <span>{order.cancellationReason}</span>
                                </div>
                              )}
                              {order.refundTransactionId && (
                                <div className="flex justify-between">
                                  <span className="text-[#9B9B9B]">Erstattungs-ID</span>
                                  <span className="font-mono text-[11px] text-[#6B6B6B]">{order.refundTransactionId}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {order.shipments && order.shipments.length > 0 && (
                          <div className="border-t border-[#EBEBEB] pt-4 mb-4">
                            <p className="text-[10px] uppercase tracking-[0.12em] text-[#9B9B9B] font-medium mb-2">Sendungen</p>
                            <div className="space-y-1">
                              {order.shipments.map(s => (
                                <div key={String(s.brandId)} className="flex items-baseline justify-between gap-4 text-[12px]">
                                  <span className="text-[#0A0A0A]">{s.brandName}</span>
                                  <span className="text-[#6B6B6B] font-mono text-[11px]">
                                    {[s.carrier, s.trackingNumber].filter(Boolean).join(' ') || s.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 flex-wrap border-t border-[#EBEBEB] pt-4">
                          <p className="text-[10px] uppercase tracking-[0.12em] text-[#9B9B9B] font-medium mr-1">Aktionen</p>

                          <select
                            value={statusInput}
                            onChange={e => setStatusInput(e.target.value)}
                            className="text-[11px] border border-[#E8E8E8] bg-white px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#370E4D]/40 focus:ring-2 focus:ring-[#370E4D]/8 transition-all duration-200"
                            style={{ fontFamily: 'var(--font-league-spartan)' }}
                          >
                            <option value="">Status ändern…</option>
                            {/* Nur Backend-OrderStatus-Werte; Stornieren/Refund laufen über die dedizierten Aktionen */}
                            {['PENDING','PAID','SHIPPED','DELIVERED','SHIPPING_PROBLEM','AWAITING_ADMIN','MANUAL_REVIEW'].map(s => (
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

                          {canCancelOrder(order.status) && !hasNonActiveItems(order.items) && (
                            <ActionBtn variant="danger" onClick={() => openCancelDialog(order)}>
                              <XCircle className="w-3 h-3" /> Stornieren
                            </ActionBtn>
                          )}

                          {/* Retouren-Aktionen gehören zur einzelnen Retoure (pro Marke),
                              nicht zur Bestellung — siehe Retouren-Screen. */}
                        </div>

                        {(order.returns?.length ?? 0) > 0 && (
                          <div className="mt-3 pt-3 border-t border-[#E8E8E8]">
                            <p className="text-[9.5px] uppercase tracking-[0.18em] font-medium mb-1.5"
                              style={{ fontFamily: 'var(--font-league-spartan)', color: '#9B9B9B' }}>
                              Retouren
                            </p>
                            <div className="space-y-1">
                              {order.returns!.map(r => (
                                <p key={r.returnNumber} className="text-[11.5px]"
                                  style={{ fontFamily: 'var(--font-league-spartan)', color: '#2D2D2D' }}>
                                  <span style={{ color: '#370E4D' }}>{r.brandName}</span>
                                  {' — '}{r.status}
                                  <span style={{ color: '#9B9B9B' }}> · {r.returnNumber}</span>
                                </p>
                              ))}
                            </div>
                            <p className="text-[10.5px] mt-1.5" style={{ fontFamily: 'var(--font-league-spartan)', color: '#9B9B9B' }}>
                              Bearbeitung erfolgt je Retoure im Retouren-Bereich.
                            </p>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
                )
              })}
            </tbody>
          </table>
        )}
      </SectionCard>

      {cancelOrderData?.showDialog && cancelOrderData.order && (
        <CancelModal
          order={cancelOrderData.order}
          onClose={closeCancelDialog}
          onCancelled={(updated) => {
            setOrders(prev => prev.map(o => o.id === updated.id ? mergeOrderUpdate(o, updated) : o))
            closeCancelDialog()
          }}
        />
      )}

      {itemCancelTarget && (
        <ItemCancelModal
          order={itemCancelTarget}
          itemIds={selectedItemIds}
          onClose={() => setItemCancelTarget(null)}
          onSuccess={(updated) => {
            setOrders(prev => prev.map(o => o.id === updated.id ? mergeOrderUpdate(o, updated) : o))
            setSelectedItemIds([])
            setItemCancelTarget(null)
          }}
          onOrderRefreshed={(fresh) => {
            setOrders(prev => prev.map(o => o.id === fresh.id ? mergeOrderUpdate(o, fresh) : o))
          }}
        />
      )}

      {reconcileTarget && (
        <ReconcileModal
          order={reconcileTarget.order}
          item={reconcileTarget.item}
          onClose={() => setReconcileTarget(null)}
          onResolved={(updated) => {
            setOrders(prev => prev.map(o => o.id === updated.id ? mergeOrderUpdate(o, updated) : o))
            setReconcileTarget(null)
          }}
          onOrderRefreshed={(fresh) => {
            setOrders(prev => prev.map(o => o.id === fresh.id ? mergeOrderUpdate(o, fresh) : o))
          }}
        />
      )}
    </div>
  )
}
