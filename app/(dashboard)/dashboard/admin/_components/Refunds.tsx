'use client'

import { useCallback, useEffect, useState } from 'react'
import { adminReturnsApi, canReconcileRefund, reconcileRefundErrorMessage } from '@/lib/api/modules/adminReturnsApi'
import { FetchError } from '@/lib/api'
import type { RefundDashboardState, RefundOverviewRow } from '@/types/api'
import { PageHeader, SectionCard, EmptyState, Loader, ActionDialog, TH, TD, TableRow, fmt, fmtEur } from './shared'
import RefundReleaseDialog from './RefundReleaseDialog'

const FONT = { fontFamily: 'var(--font-league-spartan)' }
const PAGE_SIZE = 20

const TABS: { id: RefundDashboardState; label: string; hint: string }[] = [
  { id: 'DUE',         label: 'Fällig',          hint: 'Ware erhalten, Erstattung noch nicht freigegeben.' },
  { id: 'IN_PROGRESS', label: 'In Bearbeitung',  hint: 'Freigegeben, Antwort von Mollie steht aus. Nach 5 Minuten abgleichen.' },
  { id: 'PENDING',     label: 'Ausstehend',      hint: 'Von Mollie angenommen, Bestätigung folgt.' },
  { id: 'FAILED',      label: 'Fehlgeschlagen',  hint: 'Mollie meldet einen Fehler — erneut senden.' },
  { id: 'REFUNDED',    label: 'Erstattet',       hint: 'Abgeschlossen.' },
]

const BTN = 'h-8 px-3 text-[11px] font-medium border transition-colors duration-200 disabled:opacity-40'

/** RECORD (refund exists in Mollie) / RELEASE (it doesn't) for a release stuck 5+ minutes. */
function ReconcileDialog({ row, onClose, onDone }: { row: RefundOverviewRow; onClose: () => void; onDone: () => void }) {
  const [action, setAction] = useState<'RECORD' | 'RELEASE'>('RECORD')
  const [refundId, setRefundId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    if (action === 'RECORD' && !refundId.trim()) { setError('Bitte die Mollie-Erstattungs-ID (re_…) eintragen.'); return }
    setSubmitting(true)
    setError(null)
    try {
      await adminReturnsApi.reconcileRefund(row.returnNumber, action, refundId)
      onDone()
    } catch (err) {
      setError(err instanceof FetchError ? reconcileRefundErrorMessage(err.status, err.message) : 'Abgleich fehlgeschlagen.')
      setSubmitting(false)
    }
  }

  return (
    <ActionDialog
      eyebrow="Erstattung abgleichen"
      orderLabel={row.returnNumber}
      warning={<>Zuerst in Mollie prüfen, ob für Bestellung {row.orderNumber} eine Erstattung über {fmtEur(row.total)} existiert.</>}
      error={error}
      submitLabel={action === 'RECORD' ? 'Erstattung erfassen' : 'Freigabe zurücknehmen'}
      busyLabel="Wird abgeglichen…"
      submitting={submitting}
      submitColor={action === 'RECORD' ? '#370E4D' : '#8B1E3F'}
      onSubmit={submit}
      onClose={submitting ? () => {} : onClose}
    >
      <div className="space-y-2 text-[12px]" style={{ ...FONT, color: '#2D2D2D' }}>
        <label className="flex items-start gap-2 cursor-pointer">
          <input type="radio" checked={action === 'RECORD'} onChange={() => setAction('RECORD')} className="mt-0.5 accent-[#370E4D]" />
          <span>Erstattung existiert in Mollie — erfassen</span>
        </label>
        {action === 'RECORD' && (
          <input
            value={refundId}
            onChange={e => setRefundId(e.target.value)}
            placeholder="re_…"
            className="w-full text-[12px] border border-[#E8E8E8] px-2.5 py-2 font-mono focus:outline-none focus:border-[#370E4D]/50"
          />
        )}
        <label className="flex items-start gap-2 cursor-pointer">
          <input type="radio" checked={action === 'RELEASE'} onChange={() => setAction('RELEASE')} className="mt-0.5 accent-[#370E4D]" />
          <span>Keine Erstattung in Mollie — Freigabe zurücknehmen (danach erneut freigeben möglich)</span>
        </label>
      </div>
    </ActionDialog>
  )
}

export default function Refunds() {
  const [state, setState] = useState<RefundDashboardState>('DUE')
  const [page, setPage] = useState(0)
  const [rows, setRows] = useState<RefundOverviewRow[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({})
  const [releaseFor, setReleaseFor] = useState<{ returnNumber: string; mode: 'release' | 'resend' } | null>(null)
  const [reconcileFor, setReconcileFor] = useState<RefundOverviewRow | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setLoadError(null)
    adminReturnsApi.listRefunds(state, page, PAGE_SIZE)
      .then(res => { setRows(res.content ?? []); setTotalPages(res.totalPages ?? 0) })
      .catch(() => { setRows([]); setLoadError('Erstattungen konnten nicht geladen werden.') })
      .finally(() => setLoading(false))
  }, [state, page])

  useEffect(() => { load() }, [load])

  async function refresh(row: RefundOverviewRow) {
    setBusy(row.returnNumber)
    setRowErrors(e => ({ ...e, [row.returnNumber]: '' }))
    try {
      await adminReturnsApi.reconcileRefund(row.returnNumber, 'REFRESH')
      load()
    } catch (err) {
      setRowErrors(e => ({ ...e, [row.returnNumber]: err instanceof FetchError ? reconcileRefundErrorMessage(err.status, err.message) : 'Prüfung fehlgeschlagen.' }))
    } finally {
      setBusy(null)
    }
  }

  function actionFor(row: RefundOverviewRow) {
    const disabled = busy === row.returnNumber
    switch (row.state) {
      case 'DUE':
        return row.total == null
          ? <span className="text-[11px]" style={{ ...FONT, color: '#7A5C1E' }}>Manuelle Erstattung nötig</span>
          : <button className={BTN} style={{ ...FONT, borderColor: '#370E4D', color: '#370E4D' }} disabled={disabled}
              onClick={() => setReleaseFor({ returnNumber: row.returnNumber, mode: 'release' })}>Erstattung freigeben</button>
      case 'FAILED':
        return <button className={BTN} style={{ ...FONT, borderColor: '#8B1E3F', color: '#8B1E3F' }} disabled={disabled}
          onClick={() => setReleaseFor({ returnNumber: row.returnNumber, mode: 'resend' })}>Erneut senden</button>
      case 'PENDING':
        return <button className={BTN} style={{ ...FONT, borderColor: '#E8E8E8', color: '#2D2D2D' }} disabled={disabled}
          onClick={() => refresh(row)}>{disabled ? 'Wird geprüft…' : 'Status prüfen'}</button>
      case 'IN_PROGRESS':
        return canReconcileRefund(row)
          ? <button className={BTN} style={{ ...FONT, borderColor: '#7A5C1E', color: '#7A5C1E' }}
              onClick={() => setReconcileFor(row)}>Klären…</button>
          : <span className="text-[11px]" style={{ ...FONT, color: '#9B9B9B' }}>Läuft{row.claimedAt ? ` seit ${fmt(row.claimedAt)}` : ''}</span>
      default:
        return row.refundTransactionId
          ? <span className="text-[11px] font-mono" style={{ color: '#9B9B9B' }}>{row.refundTransactionId}</span>
          : null
    }
  }

  const tab = TABS.find(t => t.id === state)!

  return (
    <div className="space-y-4">
      <PageHeader title="Erstattungen" sub="Jede Rückgabe wird genau mit dem Betrag erstattet, den der Kunde für diese Einheiten bezahlt hat." />

      <div className="flex items-center gap-2 flex-wrap">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => { setState(t.id); setPage(0) }}
            className="text-[11px] px-3 h-7 border transition-all duration-200"
            style={{
              ...FONT,
              borderColor: state === t.id ? '#370E4D' : '#E8E8E8',
              color: state === t.id ? '#fff' : '#6B6B6B',
              background: state === t.id ? '#370E4D' : 'transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p className="text-[11px]" style={{ ...FONT, color: '#9B9B9B' }}>{tab.hint}</p>

      {loading ? <Loader /> : (
        <SectionCard title={tab.label}>
          {loadError ? <EmptyState message={loadError} /> : rows.length === 0 ? <EmptyState message="Keine Einträge." /> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <TH>Retoure</TH><TH>Bestellung</TH><TH>Marke</TH>
                    <TH right>Artikel</TH><TH right>Versand</TH><TH right>Gesamt</TH>
                    <TH>Eingang</TH><TH>Aktion</TH>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => (
                    <TableRow key={row.returnNumber}>
                      <TD className="font-medium">{row.returnNumber}</TD>
                      <TD>{row.orderNumber}</TD>
                      <TD>{row.brandName}</TD>
                      <TD className="text-right tabular-nums">{row.itemsAmount != null ? fmtEur(row.itemsAmount) : '—'}</TD>
                      <TD className="text-right tabular-nums">{row.shippingAmount != null ? fmtEur(row.shippingAmount) : '—'}</TD>
                      <TD className="text-right tabular-nums font-medium">{row.total != null ? fmtEur(row.total) : '—'}</TD>
                      <TD>
                        {row.receivedAt ? `${row.receivedBy === 'BRAND' ? 'Marke' : row.receivedBy === 'ADMIN' ? 'Enunas' : '—'} · ${fmt(row.receivedAt)}` : (row.overrideReason ? 'ohne Eingang' : '—')}
                      </TD>
                      <TD>
                        {actionFor(row)}
                        {rowErrors[row.returnNumber] && (
                          <p className="text-[11px] mt-1 max-w-[260px]" style={{ ...FONT, color: '#8B1E3F' }}>{rowErrors[row.returnNumber]}</p>
                        )}
                      </TD>
                    </TableRow>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      )}

      {totalPages > 1 && (
        <div className="flex items-center gap-3 text-[11px]" style={FONT}>
          <button className={BTN} style={{ borderColor: '#E8E8E8' }} disabled={page === 0} onClick={() => setPage(p => p - 1)}>Zurück</button>
          <span style={{ color: '#9B9B9B' }}>Seite {page + 1} von {totalPages}</span>
          <button className={BTN} style={{ borderColor: '#E8E8E8' }} disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Weiter</button>
        </div>
      )}

      {releaseFor && (
        <RefundReleaseDialog
          returnNumber={releaseFor.returnNumber}
          mode={releaseFor.mode}
          onClose={() => setReleaseFor(null)}
          onDone={() => { setReleaseFor(null); load() }}
        />
      )}
      {reconcileFor && (
        <ReconcileDialog row={reconcileFor} onClose={() => setReconcileFor(null)} onDone={() => { setReconcileFor(null); load() }} />
      )}
    </div>
  )
}
