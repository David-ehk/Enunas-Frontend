'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { orderApi, FetchError } from '@/lib/api'
import { useAuth } from '@/app/context/AuthContext'
import type { ApiOrder, ReturnReason } from '@/types/api'
import { formatDateLong } from '@/lib/account'
import { describeShipment } from '@/lib/orderShipments'
import { isItemActive } from '@/lib/orderItemCancellation'
import { describeOrderItem } from '@/lib/orderItemDisplay'
import { mergeOrderUpdate } from '@/lib/mergeOrderUpdate'
import { returnableLines, buildReturnRequest, toReturnsWithOrder, customerRefundText, effectiveRefundState, RETURN_STAGE_LABELS } from '@/lib/api/modules/returnsApi'
import { returnRequestErrorMessage } from '@/lib/api/errorCopy'
import OrderItemThumb from '@/components/ui/OrderItemThumb'
import AccountButton from './AccountButton'

// ── Helpers ───────────────────────────────────────────────────

function formatEuroDecimal(amount?: number | null): string {
  if (amount == null) return '—'
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    currencyDisplay: 'symbol',
  }).format(amount)
}

const STATUS_META: Record<string, { label: string; toneClass: string }> = {
  PENDING:          { label: 'Zahlung ausstehend',  toneClass: 'text-enunas-warning' },
  PAID:             { label: 'Bezahlt',             toneClass: 'text-enunas-success' },
  SHIPPED:          { label: 'Versandt',            toneClass: 'text-enunas-success' },
  PARTIALLY_SHIPPED: { label: 'Teilweise versandt', toneClass: 'text-enunas-success' },
  DELIVERED:        { label: 'Zugestellt',          toneClass: 'text-enunas-success' },
  SHIPPING_PROBLEM: { label: 'Versandproblem',      toneClass: 'text-enunas-error' },
  AWAITING_ADMIN:   { label: 'In Prüfung',          toneClass: 'text-enunas-warning' },
  MANUAL_REVIEW:    { label: 'Manuelle Prüfung',    toneClass: 'text-enunas-warning' },
  RETURN_REQUESTED: { label: 'Retoure beantragt',   toneClass: 'text-enunas-gray-medium' },
  RETURN_APPROVED:  { label: 'Retoure genehmigt',   toneClass: 'text-enunas-gray-medium' },
  RETURN_RECEIVED:  { label: 'Retoure erhalten',    toneClass: 'text-enunas-gray-medium' },
  REFUNDED:         { label: 'Erstattet',           toneClass: 'text-enunas-success' },
  CANCELLED:        { label: 'Storniert',           toneClass: 'text-enunas-error' },
}

const RETURN_REASONS: { value: ReturnReason; label: string }[] = [
  { value: 'WRONG_SIZE',        label: 'Falsche Größe' },
  { value: 'WRONG_COLOR',       label: 'Falsche Farbe' },
  { value: 'DAMAGED',           label: 'Beschädigt angekommen' },
  { value: 'DEFECTIVE',         label: 'Defekt / nicht funktionsfähig' },
  { value: 'NOT_AS_DESCRIBED',  label: 'Nicht wie beschrieben' },
  { value: 'NO_LONGER_WANTED',  label: 'Nicht mehr benötigt' },
  { value: 'OTHER',             label: 'Sonstiges' },
]

function getStatusMeta(status: string) {
  return STATUS_META[status] ?? { label: status, toneClass: 'text-enunas-gray-medium' }
}

// ── OrderRow ──────────────────────────────────────────────────

function OrderRow({
  order,
  onUpdated,
}: {
  order: ApiOrder
  onUpdated: (updated: ApiOrder) => void
}) {
  const [open, setOpen] = useState(false)
  const [returnOpen, setReturnOpen] = useState(false)
  const [returnReason, setReturnReason] = useState<ReturnReason>('WRONG_SIZE')
  const [returnDesc, setReturnDesc] = useState('')
  const [returnItemIds, setReturnItemIds] = useState<string[]>([])
  // Units to return per selected line; absent = every remaining unit.
  const [returnQty, setReturnQty] = useState<Record<string, number>>({})
  const [returnLoading, setReturnLoading] = useState(false)
  const [returnError, setReturnError] = useState<string | null>(null)

  const statusMeta = getStatusMeta(String(order.status))
  const total = order.total ?? order.totalAmount

  async function submitReturn(e: React.FormEvent) {
    e.preventDefault()
    setReturnError(null)
    if (returnItemIds.length === 0) {
      setReturnError('Bitte wähle mindestens einen Artikel aus.')
      return
    }
    setReturnLoading(true)
    try {
      // One request per selected line (with its quantity) so the customer returns only what
      // they picked. The backend adds units to the brand's open REQUESTED return.
      let updated: ApiOrder | null = null
      for (const itemId of returnItemIds) {
        const remaining = returnableItems.find(i => i.id === itemId)?.remaining ?? 1
        updated = await orderApi.requestReturn(order.id, buildReturnRequest({
          orderItemId: itemId,
          quantity: returnQty[itemId] ?? remaining,
          remaining,
          reason: returnReason,
          description: returnDesc,
        }))
        onUpdated(updated)
      }
      setReturnOpen(false)
      setReturnDesc('')
      setReturnItemIds([])
      setReturnQty({})
    } catch (err) {
      setReturnError(
        err instanceof FetchError
          ? returnRequestErrorMessage(err.status)
          : 'Retoure konnte nicht vollständig beantragt werden.'
      )
    } finally {
      setReturnLoading(false)
    }
  }

  // Lines with units left to return (cancelled lines and units already on a return excluded).
  // Also available after a first partial return, so the remaining units can follow later.
  const returnableItems = returnableLines(order)
  const canReturn = returnableItems.length > 0
  const orderReturns = toReturnsWithOrder(order)
  const hasReturn = orderReturns.length > 0

  return (
    <article className="border border-enunas-gray-light">
      {/* Header row */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex flex-wrap gap-y-3 gap-x-6 md:grid md:grid-cols-[1fr_140px_120px_100px_40px] items-center p-5 md:p-6 text-left hover:bg-enunas-off-white transition-colors duration-200"
      >
        <div>
          <p className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-gray-medium mb-1">Bestellung</p>
          <p className="font-league-spartan text-sm font-medium text-enunas-black">
            {order.orderNumber ?? String(order.id)}
          </p>
        </div>
        <div>
          <p className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-gray-medium mb-1">Datum</p>
          <p className="font-league-spartan text-sm text-enunas-black">{formatDateLong(order.createdAt)}</p>
        </div>
        <div>
          <p className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-gray-medium mb-1">Status</p>
          <span className={cn('font-league-spartan text-xs tracking-[0.1em] uppercase font-semibold inline-flex items-center gap-1.5', statusMeta.toneClass)}>
            <span aria-hidden>●</span>{statusMeta.label}
          </span>
        </div>
        <div>
          <p className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-gray-medium mb-1">Gesamt</p>
          <p className="font-league-spartan text-sm font-medium text-enunas-black">{formatEuroDecimal(total)}</p>
        </div>
        <span className={cn('hidden md:block text-enunas-gray-medium transition-transform duration-300', open && 'rotate-90')} aria-hidden>
          →
        </span>
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="border-t border-enunas-off-white px-5 md:px-6 py-5 bg-[#FAFAF8]">

          {/* A failed payment initiation now leaves a real PENDING order behind — the backend
              commits the order before calling the payment provider so a payment can never exist
              without one. There is no checkout URL to resume; an expiry job cancels it within
              30 minutes and emails the customer. Say so rather than offering a dead action. */}
          {order.status === 'PENDING' && (
            <p className="mb-4 pb-3 border-b border-enunas-gray-light font-league-spartan text-xs text-enunas-gray-medium leading-relaxed">
              Diese Bestellung wartet noch auf den Zahlungsabschluss. Falls die Zahlung nicht
              zustande kommt, wird sie innerhalb von 30 Minuten automatisch storniert — du musst
              nichts weiter tun.
            </p>
          )}

          {/* Cancelled order: if it was paid, show refund status. */}
          {order.status === 'CANCELLED' && order.paidAt && (
            <p className="mb-4 pb-3 border-b border-enunas-gray-light font-league-spartan text-xs text-enunas-gray-medium leading-relaxed">
              Diese Bestellung wurde storniert. Die Erstattung ist unterwegs und sollte innerhalb von
              5–10 Werktagen auf deiner ursprünglichen Zahlungsmethode erscheinen.
            </p>
          )}

          {/* Items list */}
          {order.items.length > 0 && (
            <div className="mb-4 space-y-3">
              {order.items.map((item) => {
                const active = isItemActive(item)
                const d = describeOrderItem(item)
                return (
                  <div key={item.id} className="flex items-start justify-between gap-4">
                    <OrderItemThumb
                      src={item.imageUrl}
                      alt={d.label}
                      width={44}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'font-league-spartan text-sm leading-snug',
                        active ? 'text-enunas-black' : 'text-enunas-gray-medium line-through'
                      )}>
                        {d.label}
                      </p>
                      {(d.variant || item.quantity > 1) && (
                        <p className="font-league-spartan text-[11px] text-enunas-gray-medium mt-0.5">
                          {d.variant}
                          {item.quantity > 1 && (d.variant ? ` · ×${item.quantity}` : `×${item.quantity}`)}
                        </p>
                      )}
                      {!active && (
                        <p className="font-league-spartan text-[11px] text-enunas-error mt-0.5">
                          Storniert &amp; erstattet
                        </p>
                      )}
                    </div>
                    <p className="font-league-spartan text-xs text-enunas-black flex-shrink-0">
                      {formatEuroDecimal(d.lineTotal)}
                    </p>
                  </div>
                )
              })}
            </div>
          )}

          {/* Shipping breakdown — shippingSnapshots is frozen per brand at checkout. An empty
              or missing array means this order predates the shipping feature (no backfill);
              treated as "no data", never shown as free shipping. */}
          {(order.shippingSnapshots && order.shippingSnapshots.length > 0) || order.shippingTotal != null ? (
            <div className="mb-4 pt-3 border-t border-enunas-gray-light space-y-1.5">
              {order.shippingSnapshots && order.shippingSnapshots.length > 0 ? (
                order.shippingSnapshots.map((line) => (
                  <div key={line.brandId} className="flex items-center justify-between">
                    <p className="font-league-spartan text-xs text-enunas-gray-medium">Versand — {line.brandName}</p>
                    <p className="font-league-spartan text-xs text-enunas-black">
                      {line.amount === 0 ? 'Kostenlos' : formatEuroDecimal(line.amount)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-between">
                  <p className="font-league-spartan text-xs text-enunas-gray-medium">Versand</p>
                  <p className="font-league-spartan text-xs text-enunas-black">
                    {order.shippingTotal === 0 ? 'Kostenlos' : formatEuroDecimal(order.shippingTotal)}
                  </p>
                </div>
              )}
            </div>
          ) : null}

          {/* Per-brand fulfilment. Each brand ships independently, so an order can be part-shipped. */}
          {order.shipments && order.shipments.length > 0 && (
            <div className="mb-4 pt-3 border-t border-enunas-gray-light space-y-2">
              <p className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-gray-medium">
                Sendungen
              </p>
              {order.shipments.map((s) => {
                const { label, trackingNumber } = describeShipment(s)
                return (
                  <div key={String(s.brandId)} className="flex items-baseline justify-between gap-4">
                    <p className="font-league-spartan text-xs text-enunas-black">{s.brandName}</p>
                    <div className="text-right">
                      <p className="font-league-spartan text-xs text-enunas-gray-medium">{label}</p>
                      {trackingNumber && (
                        <Link
                          href={`/sendungsverfolgung?tracking=${trackingNumber}`}
                          className="font-league-spartan text-[11px] tracking-[0.15em] uppercase text-enunas-black underline underline-offset-4 hover:text-enunas-purple transition-colors duration-300"
                        >
                          Sendung verfolgen →
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-6 flex-wrap">
            {order.trackingNumber && !(order.shipments && order.shipments.length > 0) && (
              <Link
                href={`/sendungsverfolgung?tracking=${order.trackingNumber}`}
                className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-black underline underline-offset-4 hover:text-enunas-purple transition-colors duration-300"
              >
                Sendung verfolgen →
              </Link>
            )}
            {canReturn && !returnOpen && (
              <button
                onClick={() => {
                  setReturnItemIds(returnableItems.length === 1 ? returnableItems.map((i) => i.id) : [])
                  setReturnOpen(true)
                }}
                className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-gray-medium hover:text-enunas-black transition-colors duration-300"
              >
                Retoure einleiten
              </button>
            )}
          </div>

          {/* Return request form — DELIVERED only */}
          {canReturn && returnOpen && (
            <form onSubmit={submitReturn} className="mt-4 border-t border-enunas-gray-light pt-4 space-y-3">
              <p className="font-league-spartan text-[11px] tracking-[0.15em] uppercase text-enunas-gray-medium">
                Retoure beantragen
              </p>
              {returnableItems.length > 0 && (
                <div>
                  <label className="font-league-spartan text-[11px] text-enunas-gray-medium mb-1.5 block">
                    Artikel auswählen *
                  </label>
                  <div className="space-y-1.5">
                    {returnableItems.map((item) => {
                      const d = describeOrderItem(item)
                      return (
                        <label key={item.id} className="flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={returnItemIds.includes(item.id)}
                            onChange={(e) =>
                              setReturnItemIds((prev) =>
                                e.target.checked
                                  ? [...prev, item.id]
                                  : prev.filter((id) => id !== item.id)
                              )
                            }
                            className="mt-0.5 accent-enunas-purple"
                          />
                          <OrderItemThumb
                            src={item.imageUrl}
                            alt={d.label}
                            width={32}
                          />
                          <span className="font-league-spartan text-xs text-enunas-black leading-snug">
                            {d.label}
                            {d.variant && (
                              <span className="text-enunas-gray-medium">{' · '}{d.variant}</span>
                            )}
                            {item.remaining < item.quantity && (
                              <span className="text-enunas-gray-medium">{` · noch ${item.remaining} von ${item.quantity}`}</span>
                            )}
                            {item.remaining === item.quantity && item.quantity > 1 && (
                              <span className="text-enunas-gray-medium">{` · ×${item.quantity}`}</span>
                            )}
                          </span>
                          {returnItemIds.includes(item.id) && item.remaining > 1 && (
                            <select
                              aria-label={`Menge für ${d.label}`}
                              value={returnQty[item.id] ?? item.remaining}
                              onChange={(e) => setReturnQty((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))}
                              className="ml-auto border border-enunas-gray-light px-2 py-1 font-league-spartan text-xs text-enunas-black bg-white focus:outline-none focus:border-enunas-purple transition-colors duration-200"
                            >
                              {Array.from({ length: item.remaining }, (_, i) => i + 1).map((n) => (
                                <option key={n} value={n}>{n} Stk.</option>
                              ))}
                            </select>
                          )}
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}
              <div>
                <label className="font-league-spartan text-[11px] text-enunas-gray-medium mb-1 block">
                  Grund *
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value as ReturnReason)}
                  className="w-full border border-enunas-gray-light px-3 py-2 font-league-spartan text-sm text-enunas-black bg-white focus:outline-none focus:border-enunas-purple transition-colors duration-200"
                >
                  {RETURN_REASONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-league-spartan text-[11px] text-enunas-gray-medium mb-1 block">
                  Beschreibung (optional)
                </label>
                <textarea
                  value={returnDesc}
                  onChange={(e) => setReturnDesc(e.target.value)}
                  rows={3}
                  placeholder="Weitere Details zur Rückgabe …"
                  className="w-full border border-enunas-gray-light px-3 py-2 font-league-spartan text-sm text-enunas-black bg-white focus:outline-none focus:border-enunas-purple transition-colors duration-200 resize-none"
                />
              </div>
              {returnError && (
                <p className="font-league-spartan text-xs text-enunas-error">{returnError}</p>
              )}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={returnLoading}
                  className="font-league-spartan text-[11px] tracking-[0.15em] uppercase px-5 py-2.5 bg-enunas-purple text-white hover:bg-enunas-purple-light disabled:opacity-50 transition-colors duration-200"
                >
                  {returnLoading ? 'Wird gesendet …' : 'Retoure beantragen'}
                </button>
                <button
                  type="button"
                  onClick={() => { setReturnOpen(false); setReturnError(null); setReturnItemIds([]); setReturnQty({}) }}
                  className="font-league-spartan text-[11px] tracking-[0.15em] uppercase px-5 py-2.5 border border-enunas-gray-light text-enunas-gray-medium hover:text-enunas-black hover:border-enunas-black transition-colors duration-200"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          )}

          {/* Returns — one per brand, each with its own units, address and refund status */}
          {hasReturn && (
            <div className="mt-4 border-t border-enunas-gray-light pt-4 space-y-5">
              {orderReturns.map((r) => {
                const refundText = customerRefundText(r)
                return (
                  <div key={r.returnNumber} className="space-y-2">
                    <div className="flex items-baseline justify-between gap-4 flex-wrap">
                      <p className="font-league-spartan text-[11px] text-enunas-gray-medium">
                        Retoure <span className="font-medium text-enunas-black font-mono">{r.returnNumber}</span>
                        {r.brandName && <>{' · '}{r.brandName}</>}
                      </p>
                      <p className="font-league-spartan text-[11px] tracking-[0.15em] uppercase text-enunas-gray-dark">
                        {RETURN_STAGE_LABELS[r.status] ?? r.status}
                      </p>
                    </div>
                    <ul className="font-league-spartan text-xs text-enunas-black space-y-0.5">
                      {r.lines.map((l) => {
                        const d = describeOrderItem(l)
                        return (
                          <li key={l.id}>
                            {l.quantityReturned}× {d.label}
                            {d.variant && <span className="text-enunas-gray-medium">{' · '}{d.variant}</span>}
                          </li>
                        )
                      })}
                    </ul>
                    <p className={cn('font-league-spartan text-xs leading-relaxed', effectiveRefundState(r) === 'REFUNDED' ? 'text-enunas-success' : 'text-enunas-gray-dark')}>
                      {refundText ?? (
                        r.status === 'REQUESTED' ? 'Dein Antrag ist eingegangen und wird geprüft. Du kannst die Ware bereits an die unten stehende Adresse zurücksenden.'
                        : r.status === 'APPROVED' ? 'Genehmigt — bitte sende die Ware innerhalb von 14 Tagen an die unten stehende Adresse zurück.'
                        : r.status === 'RECEIVED' ? 'Deine Rücksendung ist eingegangen. Die Erstattung wird vorbereitet.'
                        : null
                      )}
                    </p>
                    {(r.status === 'REQUESTED' || r.status === 'APPROVED') && r.shipToAddress && (
                      <pre className="font-league-spartan text-sm text-enunas-black whitespace-pre-line leading-relaxed">
                        {r.shipToAddress}
                      </pre>
                    )}
                  </div>
                )
              })}

              {orderReturns.some((r) => r.status === 'REQUESTED' || r.status === 'APPROVED') && (
                <div>
                  <p className="font-league-spartan text-[10px] tracking-[0.2em] uppercase text-enunas-gray-medium mb-2">
                    So sendest du zurück
                  </p>
                  <ol className="font-league-spartan text-xs text-enunas-gray-dark leading-relaxed list-decimal pl-4 space-y-1">
                    <li>Artikel ungetragen, ungewaschen und mit Originaletiketten einpacken — nach Möglichkeit im Originalkarton.</li>
                    <li>Die Retourennummer außen am Paket vermerken oder gut sichtbar beilegen.</li>
                    <li>Paket über einen Versanddienst deiner Wahl an die Rücksendeadresse schicken. Die unmittelbaren Kosten der Rücksendung trägst du selbst.</li>
                    <li>Einlieferungsbeleg und Sendungsnummer bis zum Abschluss der Erstattung aufbewahren.</li>
                  </ol>
                  <p className="font-league-spartan text-[11px] text-enunas-gray-medium mt-2">
                    Ein vorfrankiertes Retourenlabel bieten wir derzeit nicht an.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  )
}

// ── Bestellungen ──────────────────────────────────────────────

export default function Bestellungen() {
  const { user, isLoading: authLoading } = useAuth()
  const [orders, setOrders] = useState<ApiOrder[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (p: number) => {
    setLoading(true)
    setError(null)
    try {
      const result = await orderApi.getMyOrders(p, 10)
      setOrders(result.content)
      setTotalPages(result.totalPages)
    } catch (err) {
      setError(
        err instanceof FetchError ? err.message : 'Bestellungen konnten nicht geladen werden.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Re-fetches the order page once auth resolves and whenever the page changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!authLoading && user?.role === 'CUSTOMER') load(page)
    else if (!authLoading) setLoading(false)
  }, [authLoading, user, load, page])

  const handleUpdated = (updated: ApiOrder) => {
    setOrders((prev) =>
      prev.map((o) => String(o.id) === String(updated.id) ? mergeOrderUpdate(o, updated) : o)
    )
  }

  return (
    <section>
      <h2 className="font-cormorant text-2xl md:text-[28px] font-normal text-enunas-black mb-8">
        Meine Bestellungen
      </h2>

      {loading && (
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-enunas-gray-light p-5 md:p-6 animate-pulse">
              <div className="h-4 w-48 bg-enunas-gray-light rounded mb-2" />
              <div className="h-3 w-32 bg-enunas-off-white rounded" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="border border-enunas-error/30 bg-enunas-error/5 p-6 text-center">
          <p className="font-league-spartan text-sm text-enunas-error mb-4">{error}</p>
          <AccountButton onClick={() => load(page)}>Erneut versuchen</AccountButton>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="border border-enunas-gray-light p-12 text-center">
          <h3 className="font-cormorant text-2xl text-enunas-black mb-3">Noch keine Bestellungen</h3>
          <p className="font-league-spartan text-sm text-enunas-gray-medium mb-6">
            Sobald du eine Bestellung aufgegeben hast, findest du sie hier.
          </p>
          <AccountButton onClick={() => { window.location.href = '/bekleidung' }}>
            Kollektion entdecken
          </AccountButton>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <>
          <div className="flex flex-col gap-3">
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} onUpdated={handleUpdated} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="font-league-spartan text-[11px] tracking-[0.15em] uppercase text-enunas-gray-medium hover:text-enunas-black disabled:opacity-30 transition-colors duration-200"
              >
                ← Vorherige
              </button>
              <span className="font-league-spartan text-[11px] text-enunas-gray-medium">
                Seite {page + 1} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="font-league-spartan text-[11px] tracking-[0.15em] uppercase text-enunas-gray-medium hover:text-enunas-black disabled:opacity-30 transition-colors duration-200"
              >
                Nächste →
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
