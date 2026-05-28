'use client'

import { useState, useEffect, useCallback } from 'react'
import { brandApi } from '@/lib/api/modules/brandApi'
import type { ApiOrder, ApiOrderItem } from '@/types/api'
import {
  StatusBadge, SectionCard, EmptyState, Loader,
  TH, TD, TableRow, FilterBar, SearchInput, fmt, fmtEur,
} from '../../admin/_components/shared'
import {
  Truck, AlertTriangle, X, Check, Package,
  ChevronDown, ChevronUp, ExternalLink, RefreshCw,
} from 'lucide-react'

// ─── Constants ───────────────────────────────────────────────────────────────
const CARRIERS = ['DHL', 'UPS', 'DPD', 'FedEx', 'Other'] as const
type Carrier = typeof CARRIERS[number]

const STATUS_TABS = [
  { id: 'ALL',              label: 'Alle' },
  { id: 'PAID',             label: 'Versandbereit' },
  { id: 'SHIPPED',          label: 'Versandt' },
  { id: 'DELIVERED',        label: 'Geliefert' },
  { id: 'RETURN_REQUESTED', label: 'Rückgabe' },
  { id: 'CANCELLED',        label: 'Storniert' },
]

function trackingUrl(carrier: Carrier, trackingNumber: string): string {
  switch (carrier) {
    case 'DHL':   return `https://www.dhl.de/de/privatkunden/dhl-sendungsverfolgung.html?piececode=${trackingNumber}`
    case 'UPS':   return `https://www.ups.com/track?loc=de_DE&tracknum=${trackingNumber}`
    case 'DPD':   return `https://tracking.dpd.de/status/de_DE/parcel/${trackingNumber}`
    case 'FedEx': return `https://www.fedex.com/de-de/tracking.html?trknbr=${trackingNumber}`
    default:      return ''
  }
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const INPUT = 'w-full text-[13px] border border-[#E8E8E8] bg-white rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#370E4D]/50 focus:ring-2 focus:ring-[#370E4D]/8 transition-all duration-200 placeholder:text-[#C0C0BC]'
const LABEL = 'block text-[10px] uppercase tracking-[0.12em] text-[#6B6B6B] font-medium mb-1.5'
const BTN_PRIMARY = 'flex items-center gap-2 h-9 px-5 rounded-lg text-[12px] font-medium text-white transition-all duration-200 disabled:opacity-40'
const BTN_GHOST = 'flex items-center gap-2 h-9 px-4 rounded-lg text-[12px] text-[#6B6B6B] border border-[#E8E8E8] hover:bg-[#F5F5F0] transition-all duration-200'

// ─── Ship Order Modal ─────────────────────────────────────────────────────────
function ShipModal({
  order,
  onClose,
  onShipped,
}: {
  order: ApiOrder
  onClose: () => void
  onShipped: (updated: ApiOrder) => void
}) {
  const [carrier, setCarrier]           = useState<Carrier>('DHL')
  const [trackingNumber, setTracking]   = useState('')
  const [estimatedDelivery, setEta]     = useState('')
  const [submitting, setSubmitting]     = useState(false)
  const [err, setErr]                   = useState<string | null>(null)

  async function submit() {
    if (!trackingNumber.trim()) { setErr('Tracking-Nummer ist erforderlich.'); return }
    setSubmitting(true); setErr(null)
    try {
      const updated = await brandApi.orders.ship(order.id, {
        carrier,
        trackingNumber: trackingNumber.trim(),
        estimatedDelivery: estimatedDelivery || undefined,
      })
      onShipped(updated)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Versand konnte nicht bestätigt werden.'
      setErr(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const url = trackingNumber ? trackingUrl(carrier, trackingNumber) : ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-[0_24px_48px_rgba(0,0,0,0.18)] w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0F0EB]" style={{ background: '#FAFAF8' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#370E4D] flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#0A0A0A]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                Versand bestätigen
              </p>
              <p className="text-[11px] text-[#9B9B9B]">
                Bestellung #{order.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-[#9B9B9B] hover:bg-[#F5F5F0] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Order summary */}
        <div className="px-6 py-4 bg-[#F5F5F0] border-b border-[#E8E8E8]">
          <p className="text-[10px] uppercase tracking-[0.1em] text-[#9B9B9B] mb-2" style={{ fontFamily: 'var(--font-league-spartan)' }}>
            Bestellte Artikel
          </p>
          <div className="space-y-1">
            {(order.items ?? []).slice(0, 3).map((item: ApiOrderItem) => (
              <div key={item.id} className="flex items-center justify-between text-[12px]">
                <span className="text-[#2D2D2D]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                  {item.name} {item.size ? `(${item.size})` : ''} × {item.quantity}
                </span>
                <span className="font-medium text-[#0A0A0A]">{fmtEur(item.price * item.quantity)}</span>
              </div>
            ))}
            {(order.items ?? []).length > 3 && (
              <p className="text-[11px] text-[#9B9B9B]">+{order.items.length - 3} weitere Artikel</p>
            )}
          </div>
          {order.shippingAddress && (
            <div className="mt-3 pt-3 border-t border-[#E0E0DB]">
              <p className="text-[10px] uppercase tracking-[0.1em] text-[#9B9B9B] mb-1" style={{ fontFamily: 'var(--font-league-spartan)' }}>Lieferadresse</p>
              <p className="text-[12px] text-[#2D2D2D]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
                {order.shippingAddress.street}<br />
                {order.shippingAddress.postalCode} {order.shippingAddress.city}, {order.shippingAddress.country}
              </p>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4">
          {/* Carrier */}
          <div>
            <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Versanddienstleister *</label>
            <div className="flex flex-wrap gap-1.5">
              {CARRIERS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCarrier(c)}
                  className="px-3.5 py-2 rounded-lg border text-[12px] font-medium transition-all duration-150"
                  style={{
                    fontFamily: 'var(--font-league-spartan)',
                    background: carrier === c ? '#370E4D' : '#fff',
                    color: carrier === c ? '#fff' : '#6B6B6B',
                    borderColor: carrier === c ? '#370E4D' : '#E8E8E8',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Tracking number */}
          <div>
            <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Tracking-Nummer *</label>
            <input
              type="text"
              className={INPUT}
              value={trackingNumber}
              onChange={e => setTracking(e.target.value)}
              placeholder="z.B. 1Z999AA10123456784"
              style={{ fontFamily: 'monospace' }}
            />
            {url && (
              <a href={url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-1.5 text-[11px] text-[#370E4D] hover:underline"
                style={{ fontFamily: 'var(--font-league-spartan)' }}>
                <ExternalLink className="w-3 h-3" /> Tracking-Link testen
              </a>
            )}
          </div>

          {/* ETA */}
          <div>
            <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Voraussichtliche Lieferung</label>
            <input
              type="date"
              className={INPUT}
              value={estimatedDelivery}
              onChange={e => setEta(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={{ fontFamily: 'var(--font-league-spartan)' }}
            />
          </div>

          {err && (
            <p className="text-[11px] text-[#8B1E3F]" style={{ fontFamily: 'var(--font-league-spartan)' }}>{err}</p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={submit}
              disabled={submitting || !trackingNumber.trim()}
              className={BTN_PRIMARY}
              style={{ background: '#370E4D', fontFamily: 'var(--font-league-spartan)', flex: 1, justifyContent: 'center' }}
            >
              <Truck className="w-3.5 h-3.5" />
              {submitting ? 'Wird versendet…' : 'Versand bestätigen'}
            </button>
            <button onClick={onClose} className={BTN_GHOST} style={{ fontFamily: 'var(--font-league-spartan)' }}>
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Problem Modal ────────────────────────────────────────────────────────────
function ProblemModal({
  order,
  onClose,
  onReported,
}: {
  order: ApiOrder
  onClose: () => void
  onReported: () => void
}) {
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [err, setErr]                 = useState<string | null>(null)

  async function submit() {
    if (!description.trim()) { setErr('Beschreibung ist erforderlich.'); return }
    setSubmitting(true); setErr(null)
    try {
      await brandApi.orders.problem(order.id, description.trim())
      onReported()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Problem konnte nicht gemeldet werden.'
      setErr(msg)
    } finally { setSubmitting(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-[0_24px_48px_rgba(0,0,0,0.18)] w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0F0EB]" style={{ background: '#FAFAF8' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#0A0A0A]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                Problem melden
              </p>
              <p className="text-[11px] text-[#9B9B9B]">Bestellung #{order.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-[#9B9B9B] hover:bg-[#F5F5F0] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-[12px] text-[#6B6B6B]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
            Beschreibe das Versandproblem so detailliert wie möglich. Das Enunas-Team wird sich darum kümmern.
          </p>
          <div>
            <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Beschreibung *</label>
            <textarea
              rows={4}
              className={INPUT}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="z.B. Paket wurde beschädigt zurückgeschickt, Adresse war nicht korrekt…"
              style={{ fontFamily: 'var(--font-league-spartan)', resize: 'vertical' }}
            />
          </div>

          {err && <p className="text-[11px] text-[#8B1E3F]" style={{ fontFamily: 'var(--font-league-spartan)' }}>{err}</p>}

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={submit}
              disabled={submitting || !description.trim()}
              className={BTN_PRIMARY}
              style={{ background: '#7A5C1E', fontFamily: 'var(--font-league-spartan)', flex: 1, justifyContent: 'center' }}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              {submitting ? 'Wird gemeldet…' : 'Problem melden'}
            </button>
            <button onClick={onClose} className={BTN_GHOST} style={{ fontFamily: 'var(--font-league-spartan)' }}>
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Order row ────────────────────────────────────────────────────────────────
function OrderRow({
  order,
  onShip,
  onProblem,
}: {
  order: ApiOrder
  onShip: (o: ApiOrder) => void
  onProblem: (o: ApiOrder) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const isPaid     = order.status === 'PAID'
  const isShipped  = order.status === 'SHIPPED' || order.status === 'PROCESSING'
  const trackingUrl = order.trackingNumber
    ? `https://www.dhl.de/de/privatkunden/dhl-sendungsverfolgung.html?piececode=${order.trackingNumber}`
    : null

  return (
    <>
      <TableRow key={order.id}>
        <TD>
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold text-[12px] text-[#0A0A0A]">
              #{order.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
        </TD>
        <TD>
          <div className="text-[12px] text-[#6B6B6B] max-w-[200px]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
            {(order.items ?? []).slice(0, 2).map(i => i.name).join(', ') || '—'}
            {(order.items ?? []).length > 2 && (
              <span className="text-[#9B9B9B]"> +{order.items.length - 2}</span>
            )}
          </div>
        </TD>
        <TD className="font-semibold text-[#0A0A0A]">{fmtEur(order.totalAmount)}</TD>
        <TD className="text-[#9B9B9B]">{fmt(order.createdAt)}</TD>
        <TD><StatusBadge status={order.status} /></TD>
        <TD>
          <div className="flex items-center gap-1">
            {isPaid && (
              <button
                onClick={() => onShip(order)}
                className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-[11px] font-medium text-white transition-all duration-150"
                style={{ background: '#370E4D', fontFamily: 'var(--font-league-spartan)' }}
              >
                <Truck className="w-3 h-3" /> Versenden
              </button>
            )}
            {isShipped && order.trackingNumber && (
              <a
                href={trackingUrl ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-[11px] font-medium border border-[#E8E8E8] text-[#370E4D] hover:bg-[#F5F5F0] transition-all duration-150"
                style={{ fontFamily: 'var(--font-league-spartan)' }}
              >
                <ExternalLink className="w-3 h-3" /> Tracking
              </a>
            )}
            {(isPaid || isShipped) && (
              <button
                onClick={() => onProblem(order)}
                className="h-7 w-7 rounded-lg border border-[#E8E8E8] flex items-center justify-center text-[#9B9B9B] hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50 transition-all duration-150"
                title="Problem melden"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setExpanded(e => !e)}
              className="h-7 w-7 rounded-lg border border-[#E8E8E8] flex items-center justify-center text-[#9B9B9B] hover:text-[#6B6B6B] transition-all duration-150"
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </TD>
      </TableRow>

      {expanded && (
        <tr className="bg-[#FAFAF8]">
          <td colSpan={6} className="px-6 py-4 border-b border-[#F5F5F0]">
            <div className="grid grid-cols-3 gap-6">
              {/* Items */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-[#9B9B9B] mb-2" style={{ fontFamily: 'var(--font-league-spartan)' }}>Artikel</p>
                <div className="space-y-1.5">
                  {(order.items ?? []).map(item => (
                    <div key={item.id} className="flex items-center justify-between text-[12px]">
                      <span className="text-[#2D2D2D]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                        {item.name}
                        {item.size ? <span className="text-[#9B9B9B]"> — {item.size}</span> : null}
                        {item.color ? <span className="text-[#9B9B9B]"> / {item.color}</span> : null}
                        <span className="text-[#9B9B9B]"> × {item.quantity}</span>
                      </span>
                      <span className="font-medium text-[#0A0A0A] tabular-nums">{fmtEur(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping address */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-[#9B9B9B] mb-2" style={{ fontFamily: 'var(--font-league-spartan)' }}>Lieferadresse</p>
                {order.shippingAddress ? (
                  <div className="text-[12px] text-[#2D2D2D] space-y-0.5" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                    <p className="font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                    <p>{order.shippingAddress.street}</p>
                    <p>{order.shippingAddress.postalCode} {order.shippingAddress.city}</p>
                    <p className="text-[#9B9B9B]">{order.shippingAddress.country}</p>
                  </div>
                ) : (
                  <p className="text-[12px] text-[#9B9B9B]">—</p>
                )}
              </div>

              {/* Tracking */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-[#9B9B9B] mb-2" style={{ fontFamily: 'var(--font-league-spartan)' }}>Sendungsverfolgung</p>
                {order.trackingNumber ? (
                  <div className="space-y-1">
                    <p className="font-mono text-[12px] font-semibold text-[#0A0A0A]">{order.trackingNumber}</p>
                    {trackingUrl && (
                      <a href={trackingUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-[#370E4D] hover:underline"
                        style={{ fontFamily: 'var(--font-league-spartan)' }}>
                        <ExternalLink className="w-3 h-3" /> Tracking öffnen
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-[12px] text-[#9B9B9B]">Noch nicht versandt</p>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// ─── Stats bar ────────────────────────────────────────────────────────────────
function StatsRow({ orders }: { orders: ApiOrder[] }) {
  const paid      = orders.filter(o => o.status === 'PAID').length
  const shipped   = orders.filter(o => o.status === 'SHIPPED' || o.status === 'PROCESSING').length
  const delivered = orders.filter(o => o.status === 'DELIVERED').length
  const returned  = orders.filter(o => o.status === 'RETURN_REQUESTED' || o.status === 'RETURN_APPROVED').length

  const cards = [
    { label: 'Versandbereit', value: paid,      color: '#7A5C1E', bg: '#FFFBEB', border: '#FDE68A', icon: Package },
    { label: 'Versandt',      value: shipped,   color: '#6B6B6B', bg: '#F5F5F0', border: '#E8E8E8', icon: Truck },
    { label: 'Geliefert',     value: delivered, color: '#1A5A3C', bg: '#F0FDF4', border: '#BBF7D0', icon: Check },
    { label: 'Rückgabe',      value: returned,  color: '#8B1E3F', bg: '#FFF1F2', border: '#FECDD3', icon: AlertTriangle },
  ]

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map(({ label, value, color, bg, border, icon: Icon }) => (
        <div
          key={label}
          className="rounded-xl border p-4 flex items-center gap-3"
          style={{ background: bg, borderColor: border }}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: color + '18' }}>
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          <div>
            <p className="text-[22px] font-bold leading-none" style={{ color, fontFamily: 'var(--font-league-spartan)' }}>{value}</p>
            <p className="text-[10px] mt-1 uppercase tracking-[0.08em]" style={{ color, opacity: 0.7, fontFamily: 'var(--font-league-spartan)' }}>{label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Fulfillment component ───────────────────────────────────────────────
export default function Fulfillment() {
  const [orders, setOrders]         = useState<ApiOrder[]>([])
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter]         = useState('ALL')
  const [search, setSearch]         = useState('')
  const [shipOrder, setShipOrder]   = useState<ApiOrder | null>(null)
  const [problemOrder, setProblem]  = useState<ApiOrder | null>(null)
  const [toast, setToast]           = useState<string | null>(null)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const data = await brandApi.orders.getAll()
      setOrders(data)
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  function handleShipped(updated: ApiOrder) {
    setOrders(prev => prev.map(o => o.id === updated.id ? updated : o))
    setShipOrder(null)
    showToast('Versand erfolgreich bestätigt!')
  }

  function handleProblemReported() {
    setProblem(null)
    showToast('Problem wurde gemeldet. Unser Team kümmert sich darum.')
  }

  const filtered = orders.filter(o => {
    const matchStatus = filter === 'ALL' || o.status === filter
    const q = search.toLowerCase()
    const matchSearch = !q
      || o.id.toLowerCase().includes(q)
      || (o.items ?? []).some(i => i.name.toLowerCase().includes(q))
      || (o.shippingAddress?.city?.toLowerCase().includes(q) ?? false)
    return matchStatus && matchSearch
  })

  const sortedFiltered = [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  if (loading) return <Loader />

  return (
    <div className="space-y-6">
      {/* Stats */}
      <StatsRow orders={orders} />

      {/* Ready-to-ship highlight */}
      {orders.filter(o => o.status === 'PAID').length > 0 && filter !== 'PAID' && (
        <div
          className="flex items-center justify-between px-5 py-4 rounded-xl border cursor-pointer"
          style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}
          onClick={() => setFilter('PAID')}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
              <Truck className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-amber-800" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                {orders.filter(o => o.status === 'PAID').length} Bestellung
                {orders.filter(o => o.status === 'PAID').length > 1 ? 'en' : ''} warten auf Versand
              </p>
              <p className="text-[11px] text-amber-700/70 mt-0.5">Bezahlt — bereit zum Versenden</p>
            </div>
          </div>
          <div className="text-[11px] font-medium text-amber-800" style={{ fontFamily: 'var(--font-league-spartan)' }}>
            Jetzt versenden →
          </div>
        </div>
      )}

      {/* Filters + search */}
      <div className="flex items-center justify-between gap-4">
        <FilterBar options={STATUS_TABS} value={filter} onChange={setFilter} />
        <div className="flex items-center gap-2">
          <div className="w-52">
            <SearchInput value={search} onChange={setSearch} placeholder="Bestell-Nr., Produkt, Stadt…" />
          </div>
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="h-9 w-9 rounded-xl border border-[#E8E8E8] flex items-center justify-center text-[#9B9B9B] hover:text-[#370E4D] hover:border-[#370E4D]/30 transition-all duration-150 bg-white"
            title="Aktualisieren"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Orders table */}
      <SectionCard
        title={filter === 'ALL' ? 'Alle Bestellungen' : STATUS_TABS.find(t => t.id === filter)?.label ?? 'Bestellungen'}
        count={sortedFiltered.length}
      >
        {sortedFiltered.length === 0 ? (
          <EmptyState message={search ? 'Keine Bestellungen gefunden.' : 'Keine Bestellungen in dieser Kategorie.'} />
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <TH>Bestellung</TH>
                <TH>Artikel</TH>
                <TH>Betrag</TH>
                <TH>Datum</TH>
                <TH>Status</TH>
                <TH>Aktionen</TH>
              </tr>
            </thead>
            <tbody>
              {sortedFiltered.map(order => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onShip={setShipOrder}
                  onProblem={setProblem}
                />
              ))}
            </tbody>
          </table>
        )}
      </SectionCard>

      {/* Carrier info */}
      <div className="rounded-xl border border-[#E8E8E8] bg-[#FAFAF8] px-5 py-4">
        <p className="text-[11px] font-semibold text-[#2D2D2D] mb-2" style={{ fontFamily: 'var(--font-league-spartan)' }}>
          Unterstützte Versanddienstleister
        </p>
        <div className="flex items-center gap-4">
          {CARRIERS.map(c => (
            <span key={c} className="text-[11px] font-medium text-[#6B6B6B] bg-white border border-[#E8E8E8] px-3 py-1.5 rounded-lg"
              style={{ fontFamily: 'var(--font-league-spartan)' }}>
              {c}
            </span>
          ))}
        </div>
        <p className="text-[10px] text-[#9B9B9B] mt-2" style={{ fontFamily: 'var(--font-league-spartan)' }}>
          Weitere Anbieter können auf Anfrage hinzugefügt werden. Tracking-URLs werden automatisch generiert.
        </p>
      </div>

      {/* Modals */}
      {shipOrder && (
        <ShipModal
          order={shipOrder}
          onClose={() => setShipOrder(null)}
          onShipped={handleShipped}
        />
      )}
      {problemOrder && (
        <ProblemModal
          order={problemOrder}
          onClose={() => setProblem(null)}
          onReported={handleProblemReported}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
          style={{ background: '#0A0A0A', color: '#fff', fontFamily: 'var(--font-league-spartan)', fontSize: 12 }}
        >
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          {toast}
        </div>
      )}
    </div>
  )
}
