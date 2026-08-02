'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { adminReturnsApi, returnActionErrorMessage } from '@/lib/api/modules/adminReturnsApi'
import { RETURN_LIFECYCLE, returnStageIndex, nextAction, type ReturnAction } from '@/lib/api/modules/returnsApi'
import { FetchError } from '@/lib/api'
import type { AdminCustomer, ReturnStatus, ReturnWithOrder } from '@/types/api'
import {
  PageHeader, KPIGrid, KPICell, SectionCard, EmptyState, Loader,
  fmt, fmtEur, dailyCounts, weekDeltaStr,
} from './shared'
import { RotateCcw, CheckCircle, PackageCheck, Euro } from 'lucide-react'

const REASON_LABELS: Record<string, string> = {
  WRONG_SIZE:        'Falsche Größe',
  WRONG_COLOR:       'Falsche Farbe',
  DAMAGED:           'Beschädigt',
  DEFECTIVE:         'Defekt',
  NOT_AS_DESCRIBED:  'Nicht wie beschrieben',
  NO_LONGER_WANTED:  'Nicht mehr gewünscht',
  OTHER:             'Sonstiges',
}

const STATUS_LABELS: Record<ReturnStatus, string> = {
  REQUESTED: 'Beantragt', APPROVED: 'Genehmigt', RECEIVED: 'Eingegangen', REFUNDED: 'Erstattet',
}

const LABEL_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Ausstehend', UPLOADED_BY_BRAND: 'Von Marke hochgeladen',
  GENERATED: 'Generiert', FAILED: 'Fehlgeschlagen',
}

const ACTION_META: Record<Exclude<ReturnAction, null>, { label: string; icon: typeof CheckCircle }> = {
  approve: { label: 'Retoure genehmigen', icon: CheckCircle },
  receive: { label: 'Wareneingang buchen', icon: PackageCheck },
  refund:  { label: 'Erstattung auslösen', icon: Euro },
}

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
      {STATUS_LABELS[status]}
    </span>
  )
}

function Timeline({ status }: { status: ReturnStatus }) {
  const current = returnStageIndex(status)
  return (
    <div className="flex items-center gap-1.5">
      {RETURN_LIFECYCLE.map((stage, i) => (
        <div key={stage} className="flex items-center gap-1.5">
          <span className="text-[9.5px] uppercase tracking-[0.14em]"
            style={{
              fontFamily: 'var(--font-league-spartan)',
              color: current >= i ? '#370E4D' : '#C9C9C9',
              fontWeight: current === i ? 600 : 400,
            }}>
            {STATUS_LABELS[stage]}
          </span>
          {i < RETURN_LIFECYCLE.length - 1 && (
            <span className="w-4 h-[1px]" style={{ background: current > i ? '#370E4D' : '#E8E8E8' }} />
          )}
        </div>
      ))}
    </div>
  )
}

function ReturnRow({
  r, customerLabel, onAction, busy, error,
}: {
  r: ReturnWithOrder
  customerLabel: string
  onAction: (r: ReturnWithOrder, action: Exclude<ReturnAction, null>, amount?: number) => void
  busy: boolean
  error: string | null
}) {
  const action = nextAction(r.status)
  const [amount, setAmount] = useState('')

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
        <div className="mt-3"><Timeline status={r.status} /></div>
      </div>

      <div className="px-5 py-4 grid md:grid-cols-2 gap-6">
        <div>
          <p className="text-[9.5px] uppercase tracking-[0.18em] font-medium mb-2"
            style={{ fontFamily: 'var(--font-league-spartan)', color: '#9B9B9B' }}>Artikel</p>
          {r.items.length === 0 ? (
            <p className="text-[12px]" style={{ fontFamily: 'var(--font-league-spartan)', color: '#C9C9C9' }}>
              {r.orderItemIds?.length ? `${r.orderItemIds.length} Position(en) — Details nicht in der Bestellung gefunden` : '—'}
            </p>
          ) : (
            <ul className="space-y-1">
              {r.items.map(it => (
                <li key={it.id} className="text-[12px]" style={{ fontFamily: 'var(--font-league-spartan)', color: '#2D2D2D' }}>
                  {it.quantity ? `${it.quantity}× ` : ''}{it.productName ?? it.name ?? 'Artikel'}
                  {(it.variantSize || it.variantColor) ? ` — ${[it.variantSize, it.variantColor].filter(Boolean).join(' · ')}` : ''}
                </li>
              ))}
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

          {r.refundAmount != null && (
            <p className="text-[12px] mt-3" style={{ fontFamily: 'var(--font-league-spartan)', color: '#2D2D2D' }}>
              Erstattet: <strong>{fmtEur(r.refundAmount)}</strong>
            </p>
          )}

          <div className="mt-4 pt-4 border-t border-[#E8E8E8]">
            {action === null ? (
              <p className="text-[12px]" style={{ fontFamily: 'var(--font-league-spartan)', color: '#1A5A3C' }}>
                Abgeschlossen — keine weitere Aktion.
              </p>
            ) : (
              <div className="space-y-2">
                {action === 'refund' && (
                  <div>
                    <p className="text-[9.5px] uppercase tracking-[0.18em] font-medium mb-1"
                      style={{ fontFamily: 'var(--font-league-spartan)', color: '#9B9B9B' }}>
                      Betrag (optional)
                    </p>
                    <input
                      type="number" step="0.01" min="0" value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="Leer = voller offener Betrag dieser Marke"
                      className="w-full text-[12px] border border-[#E8E8E8] px-2.5 py-2 focus:outline-none focus:border-[#370E4D]/50"
                      style={{ fontFamily: 'var(--font-league-spartan)' }}
                    />
                  </div>
                )}
                <button
                  onClick={() => onAction(r, action, action === 'refund' && amount.trim() ? Number(amount) : undefined)}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 h-8 px-3 text-[11px] font-medium border transition-all duration-200 disabled:opacity-40"
                  style={{ fontFamily: 'var(--font-league-spartan)', borderColor: '#370E4D', color: '#370E4D' }}
                >
                  {React.createElement(ACTION_META[action].icon, { className: 'w-3.5 h-3.5' })}
                  {busy ? 'Wird ausgeführt…' : ACTION_META[action].label}
                </button>
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

  useEffect(() => { load() }, [load])

  /**
   * Applies one action to ONE return. The backend answers with the updated
   * order, so we re-derive only the returns belonging to that order — every
   * other brand's return is left exactly as it was.
   */
  async function runAction(r: ReturnWithOrder, action: Exclude<ReturnAction, null>, amount?: number) {
    setBusy(r.returnNumber)
    setErrors(e => ({ ...e, [r.returnNumber]: '' }))
    try {
      const updated =
        action === 'approve' ? await adminReturnsApi.approveReturn(r.returnNumber)
        : action === 'receive' ? await adminReturnsApi.receiveReturn(r.returnNumber)
        : await adminReturnsApi.refundReturn(r.returnNumber, amount)

      const fresh = (updated.returns ?? []).reduce<Record<string, ReturnWithOrder['status']>>((acc, x) => {
        acc[x.returnNumber] = x.status
        return acc
      }, {})
      setReturns(prev => prev.map(x => {
        const next = updated.returns?.find(u => u.returnNumber === x.returnNumber)
        // Only returns present on the updated order are touched; and within that
        // order only the fields the backend actually returned.
        return next && x.orderId === updated.id
          ? { ...x, ...next, items: x.items, orderId: x.orderId, orderNumber: x.orderNumber, currency: x.currency }
          : x
      }))
      if (!Object.keys(fresh).length) load()
    } catch (err) {
      const msg = err instanceof FetchError
        ? returnActionErrorMessage(err.status, err.message)
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
            {f === 'ALL' ? `Alle (${returns.length})` : `${STATUS_LABELS[f as ReturnStatus]} (${returns.filter(r => r.status === f).length})`}
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

      <p className="text-[10.5px] flex items-center gap-1.5"
        style={{ fontFamily: 'var(--font-league-spartan)', color: '#9B9B9B' }}>
        <RotateCcw className="w-3 h-3" />
        Aktionen wirken ausschließlich auf die gewählte Retoure — andere Marken derselben Bestellung bleiben unberührt.
      </p>
    </div>
  )
}
