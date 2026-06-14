'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { orderApi, FetchError } from '@/lib/api'
import { useAuth } from '@/app/context/AuthContext'
import type { ApiOrder, ApiOrderItem, ReturnReason } from '@/types/api'
import { formatDateLong } from '@/lib/account'
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

function resolveItemTotal(item: ApiOrderItem): number | undefined {
  if (item.lineTotal != null) return item.lineTotal
  const unit = item.priceAtPurchase ?? item.price
  return unit != null ? unit * item.quantity : undefined
}

const STATUS_META: Record<string, { label: string; toneClass: string }> = {
  PENDING:          { label: 'Ausstehend',         toneClass: 'text-enunas-warning' },
  PAID:             { label: 'Bezahlt',             toneClass: 'text-enunas-success' },
  SHIPPED:          { label: 'Versandt',            toneClass: 'text-enunas-success' },
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
  const [returnLoading, setReturnLoading] = useState(false)
  const [returnError, setReturnError] = useState<string | null>(null)

  const statusMeta = getStatusMeta(String(order.status))
  const total = order.total ?? order.totalAmount

  async function submitReturn(e: React.FormEvent) {
    e.preventDefault()
    setReturnError(null)
    setReturnLoading(true)
    try {
      const updated = await orderApi.requestReturn(order.id, {
        reason: returnReason,
        description: returnDesc.trim() || undefined,
      })
      onUpdated(updated)
      setReturnOpen(false)
      setReturnDesc('')
    } catch (err) {
      setReturnError(
        err instanceof FetchError ? err.message : 'Retoure konnte nicht beantragt werden.'
      )
    } finally {
      setReturnLoading(false)
    }
  }

  const canReturn = order.status === 'DELIVERED'
  const hasReturn = [
    'RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_RECEIVED', 'REFUNDED',
  ].includes(String(order.status))

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

          {/* Items list */}
          {order.items.length > 0 && (
            <div className="mb-4 space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-league-spartan text-sm text-enunas-black leading-snug">
                      {item.productName ?? item.name ?? '—'}
                    </p>
                    {(item.variantSize || item.variantColor || item.size || item.color) && (
                      <p className="font-league-spartan text-[11px] text-enunas-gray-medium mt-0.5">
                        {[item.variantSize ?? item.size, item.variantColor ?? item.color]
                          .filter(Boolean)
                          .join(' · ')}
                        {item.quantity > 1 && ` · ×${item.quantity}`}
                      </p>
                    )}
                  </div>
                  <p className="font-league-spartan text-xs text-enunas-black flex-shrink-0">
                    {formatEuroDecimal(resolveItemTotal(item))}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-6 flex-wrap">
            {order.trackingNumber && (
              <Link
                href={`/sendungsverfolgung?tracking=${order.trackingNumber}`}
                className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-black underline underline-offset-4 hover:text-enunas-purple transition-colors duration-300"
              >
                Sendung verfolgen →
              </Link>
            )}
            {canReturn && !returnOpen && (
              <button
                onClick={() => setReturnOpen(true)}
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
                  onClick={() => { setReturnOpen(false); setReturnError(null) }}
                  className="font-league-spartan text-[11px] tracking-[0.15em] uppercase px-5 py-2.5 border border-enunas-gray-light text-enunas-gray-medium hover:text-enunas-black hover:border-enunas-black transition-colors duration-200"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          )}

          {/* Return details — shown once a return exists */}
          {hasReturn && (
            <div className="mt-4 border-t border-enunas-gray-light pt-4">
              {order.returnShipToAddress && (
                <>
                  <p className="font-league-spartan text-[10px] tracking-[0.2em] uppercase text-enunas-gray-medium mb-2">
                    Retourenadresse
                  </p>
                  <pre className="font-league-spartan text-sm text-enunas-black whitespace-pre-line leading-relaxed mb-2">
                    {order.returnShipToAddress}
                  </pre>
                </>
              )}
              {order.returnNumber && (
                <p className="font-league-spartan text-[11px] text-enunas-gray-medium">
                  Retourennummer:{' '}
                  <span className="font-medium text-enunas-black font-mono">{order.returnNumber}</span>
                </p>
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
    if (!authLoading && user?.role === 'CUSTOMER') load(page)
    else if (!authLoading) setLoading(false)
  }, [authLoading, user, load, page])

  const handleUpdated = (updated: ApiOrder) => {
    setOrders((prev) =>
      prev.map((o) => String(o.id) === String(updated.id) ? updated : o)
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
