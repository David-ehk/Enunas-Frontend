'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { adminReturnsApi, returnActionErrorMessage, reconcileRefundErrorMessage } from '@/lib/api/modules/adminReturnsApi'
import { RETURN_LIFECYCLE, RETURN_STAGE_LABELS, adminReturnAction, effectiveRefundState, toReturnsWithOrder, type ReturnAction } from '@/lib/api/modules/returnsApi'
import RefundReleaseDialog from './RefundReleaseDialog'
import ReturnTimeline from '@/components/ui/ReturnTimeline'
import { FetchError } from '@/lib/api'
import type { AdminCustomer, ApiOrder, ReturnStatus, ReturnWithOrder } from '@/types/api'
import {
  PageHeader, KPIGrid, KPICell, SectionCard, EmptyState, Loader,
  fmt, fmtEur, dailyCounts, weekDeltaStr,
} from './shared'
import { RotateCcw, CheckCircle, PackageCheck, Euro, RefreshCw } from 'lucide-react'
import OrderItemThumb from '@/components/ui/OrderItemThumb'
import { describeOrderItem } from '@/lib/orderItemDisplay'

const REASON_LABELS: Record<string, string> = {
  WRONG_SIZE:        'Falsche Größe',
  WRONG_COLOR:       'Falsche Farbe',
  DAMAGED:           'Beschädigt',
  DEFECTIVE:         'Defekt',
  NOT_AS_DESCRIBED:  'Nicht wie beschrieben',
  NO_LONGER_WANTED:  'Nicht mehr gewünscht',
  OTHER:             'Sonstiges',
}

const LABEL_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Ausstehend', UPLOADED_BY_BRAND: 'Von Marke hochgeladen',
  GENERATED: 'Generiert', FAILED: 'Fehlgeschlagen',
}

const ACTION_META: Record<Exclude<ReturnAction, null>, { label: string; icon: typeof CheckCircle }> = {
  approve: { label: 'Retoure genehmigen', icon: CheckCircle },
  receive: { label: 'Ware erhalten (statt Marke)', icon: PackageCheck },
  release: { label: 'Erstattung freigeben', icon: Euro },
  refresh: { label: 'Status bei Mollie prüfen', icon: RefreshCw },
  resend:  { label: 'Erneut senden', icon: Euro },
}

// Money side of a return, shown next to the physical status.
const REFUND_STATE_META: Record<string, { label: string; color: string }> = {
  PENDING:  { label: 'Erstattung läuft — wartet auf Mollie', color: '#7A5C1E' },
  FAILED:   { label: 'Erstattung fehlgeschlagen', color: '#8B1E3F' },
  REFUNDED: { label: 'Erstattung bestätigt', color: '#1A5A3C' },
}

type RowAction = Exclude<ReturnAction, null> | 'override'

function StatusPill({ status }: { status: ReturnStatus }) {
  const tone: Record<ReturnStatus, { bg: string; fg: string }> = {
    REQUESTED: { bg: '#FFF7ED', fg: '#9A3412' },
    APPROVED:  { bg: '#F3EEF7', fg: '#370E4D' },
    RECEIVED:  { bg: '#F3EEF7', fg: '#370E4D' },
    REFUNDED:  { bg: '#F1F5F3', fg: '#1A5A3C' },
  }
  const t = tone[status]
  return (
    <span className="text-[10px] uppercase tracking-[0.14em] px-2 py-1 rounded"
      style={{ fontFamily: 'var(--font-league-spartan)', background: t.bg, color: t.fg }}>
      {RETURN_STAGE_LABELS[status]}
    </span>
  )
}

function ReturnRow({
  r, customerLabel, onAction, busy, error,
}: {
  r: ReturnWithOrder
  customerLabel: string
  onAction: (r: ReturnWithOrder, action: RowAction) => void
  busy: boolean
  error: string | null
}) {
  const action = adminReturnAction(r)
  const refundState = effectiveRefundState(r)
  const refundMeta = refundState ? REFUND_STATE_META[refundState] : null

  return (
    <div className="bg-white border border-[#E8E8E8]">
      <div className="px-5 pt-4 pb-3 border-b border-[#E8E8E8]">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2.5">
              <p className="text-[13px] font-medium" style={{ fontFamily: 'var(--font-league-spartan)', color: '#0A0A0A' }}>
                {r.returnNumber}
              </p>
              <span className="text-[11px] px-2 py-0.5 border border-[#E8E8E8]"
                style={{ fontFamily: 'var(--font-league-spartan)', color: '#370E4D', background: '#FAFAF8' }}>
                {r.brandName}
              </span>
            </div>
            <p className="text-[11px] mt-1" style={{ fontFamily: 'var(--font-league-spartan)', color: '#9B9B9B' }}>
              Bestellung {r.orderNumber ?? `#${String(r.orderId).slice(0, 8).toUpperCase()}`}
              {' · '}{customerLabel}
              {r.requestedAt ? ` · ${fmt(r.requestedAt)}` : ''}
            </p>
          </div>
          <StatusPill status={r.status} />
        </div>
        <div className="mt-3"><ReturnTimeline status={r.status} /></div>
      </div>

      <div className="px-5 py-4 grid md:grid-cols-2 gap-6">
        <div>
          <p className="text-[9.5px] uppercase tracking-[0.18em] font-medium mb-2"
            style={{ fontFamily: 'var(--font-league-spartan)', color: '#9B9B9B' }}>Artikel</p>
          {r.lines.length === 0 ? (
            <p className="text-[12px]" style={{ fontFamily: 'var(--font-league-spartan)', color: '#C9C9C9' }}>
              {r.orderItemIds?.length ? `${r.orderItemIds.length} Position(en) — Details nicht in der Bestellung gefunden` : '—'}
            </p>
          ) : (
            <ul className="space-y-2">
              {r.lines.map(it => {
                const d = describeOrderItem(it)
                return (
                  <li key={it.id} className="flex items-center gap-2.5 text-[12px]" style={{ fontFamily: 'var(--font-league-spartan)', color: '#2D2D2D' }}>
                    <OrderItemThumb src={it.imageUrl} alt={d.label} width={30} />
                    <span>
                      {it.quantityReturned} von {it.quantity} · {d.label}
                      {d.variant ? ` — ${d.variant}` : ''}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}

          {r.reason && (
            <div className="mt-3">
              <p className="text-[9.5px] uppercase tracking-[0.18em] font-medium mb-1"
                style={{ fontFamily: 'var(--font-league-spartan)', color: '#9B9B9B' }}>Grund</p>
              <p className="text-[12px]" style={{ fontFamily: 'var(--font-league-spartan)', color: '#2D2D2D' }}>
                {REASON_LABELS[String(r.reason)] ?? r.reason}
              </p>
              {r.description && (
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontWeight: 300, fontSize: 12, color: '#9B9B9B', marginTop: 2 }}>
                  {r.description}
                </p>
              )}
            </div>
          )}

          {r.labelStatus && (
            <div className="mt-3">
              <p className="text-[9.5px] uppercase tracking-[0.18em] font-medium mb-1"
                style={{ fontFamily: 'var(--font-league-spartan)', color: '#9B9B9B' }}>Retourenlabel</p>
              <p className="text-[12px]" style={{ fontFamily: 'var(--font-league-spartan)', color: '#2D2D2D' }}>
                {LABEL_STATUS_LABELS[r.labelStatus] ?? r.labelStatus}
                {r.labelCarrier ? ` · ${r.labelCarrier}` : ''}
                {r.labelTrackingNumber ? ` · ${r.labelTrackingNumber}` : ''}
              </p>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-baseline gap-2 mb-2">
            <p className="text-[9.5px] uppercase tracking-[0.18em] font-medium"
              style={{ fontFamily: 'var(--font-league-spartan)', color: '#9B9B9B' }}>Zieladresse</p>
            <span className="text-[9px] uppercase tracking-[0.12em] px-1.5 py-0.5 border"
              style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B', borderColor: '#E8E8E8', background: '#FAFAF8' }}>
              Snapshot · schreibgeschützt
            </span>
          </div>
          <p className="text-[12px] whitespace-pre-line leading-[1.6]"
            style={{ fontFamily: 'var(--font-league-spartan)', color: r.shipToAddress ? '#2D2D2D' : '#C9C9C9' }}>
            {r.shipToAddress || 'Keine Adresse übermittelt.'}
          </p>

          {refundMeta && (
            <p className="text-[12px] mt-3" style={{ fontFamily: 'var(--font-league-spartan)', color: refundMeta.color }}>
              {refundMeta.label}
              {r.refundAmount != null && <> · <strong>{fmtEur(r.refundAmount)}</strong></>}
              {r.refundShippingAmount ? ` (inkl. ${fmtEur(r.refundShippingAmount)} Versand)` : ''}
            </p>
          )}
          {r.receivedBy && (
            <p className="text-[11px] mt-1" style={{ fontFamily: 'var(--font-league-spartan)', color: '#9B9B9B' }}>
              Wareneingang bestätigt von {r.receivedBy === 'BRAND' ? 'der Marke' : 'Enunas'}{r.receivedAt ? ` · ${fmt(r.receivedAt)}` : ''}
            </p>
          )}
          {r.refundOverrideReason && (
            <p className="text-[11px] mt-1" style={{ fontFamily: 'var(--font-league-spartan)', color: '#7A5C1E' }}>
              Ohne Wareneingang erstattet: {r.refundOverrideReason}
            </p>
          )}

          <div className="mt-4 pt-4 border-t border-[#E8E8E8]">
            {action === null ? (
              <p className="text-[12px]" style={{ fontFamily: 'var(--font-league-spartan)', color: '#1A5A3C' }}>
                Abgeschlossen — keine weitere Aktion.
              </p>
            ) : (
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => onAction(r, action)}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 h-8 px-3 text-[11px] font-medium border transition-all duration-200 disabled:opacity-40"
                  style={{ fontFamily: 'var(--font-league-spartan)', borderColor: '#370E4D', color: '#370E4D' }}
                >
                  {React.createElement(ACTION_META[action].icon, { className: 'w-3.5 h-3.5' })}
                  {busy ? 'Wird ausgeführt…' : ACTION_META[action].label}
                </button>
                {action === 'receive' && (
                  <button
                    onClick={() => onAction(r, 'override')}
                    disabled={busy}
                    className="text-[11px] underline underline-offset-4 transition-colors duration-200 disabled:opacity-40"
                    style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B' }}
                  >
                    Ohne Wareneingang erstatten…
                  </button>
                )}
              </div>
            )}
            {error && (
              <p className="text-[11px] mt-2 leading-[1.5]" style={{ fontFamily: 'var(--font-league-spartan)', color: '#8B1E3F' }}>
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Returns({ customers = [] }: { customers?: AdminCustomer[] }) {
  const [returns, setReturns] = useState<ReturnWithOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [filter, setFilter] = useState<ReturnStatus | 'ALL'>('ALL')
  const [dialog, setDialog] = useState<{ returnNumber: string; mode: 'release' | 'resend' | 'override' } | null>(null)

  const getCustomerLabel = useCallback((buyerEmail?: string) => {
    if (!buyerEmail) return '—'
    const c = customers.find(c => c.email === buyerEmail)
    return c ? ([c.firstName, c.lastName].filter(Boolean).join(' ') || c.email) : buyerEmail
  }, [customers])

  const load = useCallback(() => {
    setLoading(true)
    adminReturnsApi.getAdminReturns()
      .then(setReturns)
      .catch(() => setReturns([]))
      .finally(() => setLoading(false))
  }, [])

  // Initial data load on mount; load() is also invoked after each return action.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  /**
   * Applies one action to ONE return. The backend answers with the updated
   * order, so we re-derive only the returns belonging to that order — every
   * other brand's return is left exactly as it was.
   */
  // Replaces only the returns of the updated order, re-resolved from it (quantities can change);
  // every other order's returns stay exactly as they were.
  function applyUpdatedOrder(updated: ApiOrder) {
    const fresh = toReturnsWithOrder(updated)
    if (!fresh.length) { load(); return }
    setReturns(prev => prev.map(x => {
      const next = x.orderId === updated.id ? fresh.find(f => f.returnNumber === x.returnNumber) : undefined
      return next ? { ...next, buyerEmail: next.buyerEmail ?? x.buyerEmail, orderNumber: next.orderNumber ?? x.orderNumber } : x
    }))
  }

  async function runAction(r: ReturnWithOrder, action: RowAction) {
    if (action === 'release' || action === 'resend' || action === 'override') {
      setDialog({ returnNumber: r.returnNumber, mode: action })
      return
    }
    setBusy(r.returnNumber)
    setErrors(e => ({ ...e, [r.returnNumber]: '' }))
    try {
      const updated =
        action === 'approve' ? await adminReturnsApi.approveReturn(r.returnNumber)
        : action === 'receive' ? await adminReturnsApi.receiveReturn(r.returnNumber)
        : await adminReturnsApi.reconcileRefund(r.returnNumber, 'REFRESH')
      applyUpdatedOrder(updated)
    } catch (err) {
      const msg = err instanceof FetchError
        ? (action === 'refresh' ? reconcileRefundErrorMessage : returnActionErrorMessage)(err.status, err.message)
        : 'Aktion fehlgeschlagen.'
      setErrors(e => ({ ...e, [r.returnNumber]: msg }))
    } finally {
      setBusy(null)
    }
  }

  const kpi = useMemo(() => {
    const req = returns.filter(r => r.status === 'REQUESTED')
    const app = returns.filter(r => r.status === 'APPROVED')
    const rec = returns.filter(r => r.status === 'RECEIVED')
    const ref = returns.filter(r => r.status === 'REFUNDED')
    const refundedSum = ref.reduce((s, r) => s + (r.refundAmount ?? 0), 0)
    const dates = (xs: ReturnWithOrder[]) => xs.map(x => ({ createdAt: x.requestedAt ?? '' })).filter(x => x.createdAt)
    return {
      requested: req.length, approved: app.length, received: rec.length,
      refunded: ref.length, refundedSum,
      spark: dailyCounts(dates(returns) as never),
      delta: weekDeltaStr(req.length, app.length),
    }
  }, [returns])

  if (loading) return <Loader />

  const visible = filter === 'ALL' ? returns : returns.filter(r => r.status === filter)

  return (
    <div className="space-y-4">
      <PageHeader
        title="Rückgaben"
        sub="Jede Marke einer Bestellung hat ihre eigene Rückgabe — Aktionen gelten immer genau einer Rückgabe."
      />

      <KPIGrid>
        <KPICell label="Beantragt"   value={kpi.requested} spark={kpi.spark} />
        <KPICell label="Genehmigt"   value={kpi.approved} />
        <KPICell label="Eingegangen" value={kpi.received} />
        <KPICell label="Erstattet"   value={`${kpi.refunded} · ${fmtEur(kpi.refundedSum)}`} />
      </KPIGrid>

      <div className="flex items-center gap-2 flex-wrap">
        {(['ALL', ...RETURN_LIFECYCLE] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f as ReturnStatus | 'ALL')}
            className="text-[11px] px-3 h-7 border transition-all duration-200"
            style={{
              fontFamily: 'var(--font-league-spartan)',
              borderColor: filter === f ? '#370E4D' : '#E8E8E8',
              color: filter === f ? '#fff' : '#6B6B6B',
              background: filter === f ? '#370E4D' : 'transparent',
            }}
          >
            {f === 'ALL' ? `Alle (${returns.length})` : `${RETURN_STAGE_LABELS[f as ReturnStatus]} (${returns.filter(r => r.status === f).length})`}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <SectionCard title="Retouren">
          <EmptyState message="Keine Retouren vorhanden." />
        </SectionCard>
      ) : (
        <div className="space-y-3">
          {visible.map(r => (
            <ReturnRow
              key={r.returnNumber}
              r={r}
              customerLabel={getCustomerLabel(r.buyerEmail)}
              onAction={runAction}
              busy={busy === r.returnNumber}
              error={errors[r.returnNumber] || null}
            />
          ))}
        </div>
      )}

      {dialog && (
        <RefundReleaseDialog
          returnNumber={dialog.returnNumber}
          mode={dialog.mode}
          onClose={() => setDialog(null)}
          onDone={updated => { applyUpdatedOrder(updated); setDialog(null) }}
        />
      )}

      <p className="text-[10.5px] flex items-center gap-1.5"
        style={{ fontFamily: 'var(--font-league-spartan)', color: '#9B9B9B' }}>
        <RotateCcw className="w-3 h-3" />
        Aktionen wirken ausschließlich auf die gewählte Retoure — andere Marken derselben Bestellung bleiben unberührt.
      </p>
    </div>
  )
}
