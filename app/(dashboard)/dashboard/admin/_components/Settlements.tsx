'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { settlementApi, FetchError } from '@/lib/api'
import type { SettlementRow } from '@/lib/api'
import {
  PageHeader, SectionCard, EmptyState, Loader, TH, TD, TableRow,
} from './shared'
import { Copy, Check, X, ChevronDown, ChevronUp, AlertTriangle, History } from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtEurDe(v: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency', currency: 'EUR',
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(v)
}

function getDefaultPeriod(): string {
  const now = new Date()
  const d = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function getCurrentPeriod(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function isPeriodOpen(period: string): boolean {
  const [y, m] = period.split('-').map(Number)
  const now = new Date()
  return y > now.getFullYear() || (y === now.getFullYear() && m >= now.getMonth() + 1)
}

function fmtPeriodLabel(period: string): string {
  const [y, m] = period.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleString('de-DE', { month: 'long', year: 'numeric' })
}

function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  } catch { return '—' }
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyBtn({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState(false)
  function copy() {
    navigator.clipboard.writeText(value).then(() => {
      setDone(true)
      setTimeout(() => setDone(false), 1500)
    })
  }
  return (
    <button
      onClick={copy}
      title={`${label} kopieren`}
      className="inline-flex items-center justify-center w-6 h-6 rounded transition-all duration-150"
      style={{ color: done ? '#1A5A3C' : '#C0C0BC' }}
      onMouseEnter={e => { if (!done) e.currentTarget.style.color = '#370E4D' }}
      onMouseLeave={e => { if (!done) e.currentTarget.style.color = '#C0C0BC' }}
    >
      {done ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
    </button>
  )
}

// ─── Document type badge ──────────────────────────────────────────────────────

function DocTypeBadge({ row }: { row: SettlementRow }) {
  if (row.isCreditNote) {
    return (
      <span className="inline-block text-[10px] uppercase tracking-[0.1em] font-medium px-2 py-0.5 rounded-md border"
        style={{ fontFamily: 'var(--font-league-spartan)', background: 'rgba(139,30,63,0.08)', color: '#8B1E3F', borderColor: 'rgba(139,30,63,0.2)' }}>
        Gutschrift
      </span>
    )
  }
  if (!row.domestic) {
    return (
      <span className="inline-block text-[10px] uppercase tracking-[0.1em] font-medium px-2 py-0.5 rounded-md border"
        style={{ fontFamily: 'var(--font-league-spartan)', background: 'rgba(122,92,30,0.08)', color: '#7A5C1E', borderColor: 'rgba(122,92,30,0.2)' }}>
        Reverse Charge
      </span>
    )
  }
  return (
    <span className="inline-block text-[10px] uppercase tracking-[0.1em] font-medium px-2 py-0.5 rounded-md border"
      style={{ fontFamily: 'var(--font-league-spartan)', background: 'rgba(26,90,60,0.08)', color: '#1A5A3C', borderColor: 'rgba(26,90,60,0.2)' }}>
      Inland · 19 % USt
    </span>
  )
}

// ─── Confirmation dialog ──────────────────────────────────────────────────────

function CheckItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <Check className="w-3.5 h-3.5 text-[#1A5A3C] shrink-0 mt-0.5" />
      <p className="text-[12px] text-[#2D2D2D] leading-snug" style={{ fontFamily: 'var(--font-league-spartan)' }}>
        {text}
      </p>
    </div>
  )
}

interface ConfirmDialogProps {
  row: SettlementRow
  period: string
  onConfirm: (ref: string) => void
  onCancel: () => void
  submitting: boolean
}

function ConfirmDialog({ row, period, onConfirm, onCancel, submitting }: ConfirmDialogProps) {
  const [ref, setRef] = useState('')
  const negPayout = row.payoutAmount < 0

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-[480px] bg-[#F8F8F5] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-start justify-between px-7 pt-6 pb-5 bg-white border-b border-[#EBEBEB]">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] font-medium text-[#9B9B9B] mb-1.5"
                style={{ fontFamily: 'var(--font-league-spartan)' }}>
                Abrechnung bestätigen · {fmtPeriodLabel(period)}
              </p>
              <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 22, fontWeight: 300, color: '#0A0A0A', lineHeight: 1 }}>
                {row.brandName}
              </h2>
              <p className="mt-1 text-[11px] text-[#6B6B6B]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                Provision {fmtEurDe(row.commissionGross)} · Auszahlung {fmtEurDe(row.payoutAmount)}
              </p>
            </div>
            <button onClick={onCancel} className="p-2 rounded-xl text-[#9B9B9B] hover:text-[#0A0A0A] hover:bg-[#F0F0EB] transition-all duration-200">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-7 py-5 space-y-4">
            <div className="space-y-2.5">
              <CheckItem text={
                row.isCreditNote
                  ? 'Gutschrift/Rechnungskorrektur in lexoffice erstellt'
                  : row.domestic
                    ? 'Provisionsrechnung inkl. 19 % USt in lexoffice erstellt'
                    : 'Rechnung netto (Reverse Charge) in lexoffice erstellt — USt-IdNr geprüft'
              } />
              {!negPayout && (
                <CheckItem text={`${fmtEurDe(row.payoutAmount)} per SEPA an ${row.brandName} überwiesen`} />
              )}
              {negPayout && (
                <div className="flex items-start gap-2.5 text-[11px] text-[#7A5C1E] px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200"
                  style={{ fontFamily: 'var(--font-league-spartan)' }}>
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  Negativer Betrag — kein SEPA-Ausgang. Wird über outstandingDebt verrechnet.
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.12em] text-[#6B6B6B] font-medium mb-1.5"
                style={{ fontFamily: 'var(--font-league-spartan)' }}>
                Rechnungsreferenz (optional)
              </label>
              <input
                type="text"
                value={ref}
                onChange={e => setRef(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !submitting) onConfirm(ref) }}
                placeholder="LEX-2026-06-001"
                className="w-full text-[13px] border border-[#E8E8E8] bg-white rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#370E4D]/40 focus:ring-2 focus:ring-[#370E4D]/08 transition-all duration-200 placeholder:text-[#C0C0BC]"
                style={{ fontFamily: 'var(--font-league-spartan)' }}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 px-7 py-4 bg-white border-t border-[#EBEBEB]">
            <button
              onClick={onCancel}
              type="button"
              className="h-9 px-4 rounded-lg text-[11px] font-medium text-[#6B6B6B] border border-[#E8E8E8] hover:bg-[#F5F5F0] transition-all duration-200"
              style={{ fontFamily: 'var(--font-league-spartan)', letterSpacing: '0.06em', textTransform: 'uppercase' }}
            >
              Abbrechen
            </button>
            <button
              onClick={() => onConfirm(ref)}
              disabled={submitting}
              type="button"
              className="h-9 px-5 rounded-lg text-[11px] font-medium text-white transition-all duration-200 disabled:opacity-40 hover:bg-[#4A1566]"
              style={{ fontFamily: 'var(--font-league-spartan)', background: '#370E4D', letterSpacing: '0.06em', textTransform: 'uppercase' }}
            >
              {submitting ? 'Wird markiert…' : 'Als abgerechnet markieren'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────

interface ToastState { msg: string; variant: 'success' | 'warn' | 'error' }

function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  const colors = {
    success: { bg: 'rgba(26,90,60,0.06)',   border: 'rgba(26,90,60,0.2)',   text: '#1A5A3C' },
    warn:    { bg: 'rgba(122,92,30,0.06)',  border: 'rgba(122,92,30,0.2)',  text: '#7A5C1E' },
    error:   { bg: 'rgba(139,30,63,0.06)', border: 'rgba(139,30,63,0.2)', text: '#8B1E3F' },
  }
  const c = colors[toast.variant]
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border text-[12px]"
      style={{ fontFamily: 'var(--font-league-spartan)', background: c.bg, borderColor: c.border, color: c.text }}>
      <span>{toast.msg}</span>
      <button onClick={onDismiss}><X className="w-3.5 h-3.5" /></button>
    </div>
  )
}

// ─── History table row (settled, read-only) ───────────────────────────────────

function HistoryTableRow({ row }: { row: SettlementRow }) {
  const negComm = row.commissionGross < 0
  return (
    <TableRow>
      <TD>
        <p className="text-[13px] font-semibold text-[#0A0A0A]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
          {row.brandName}
        </p>
        <p className="text-[10px] text-[#9B9B9B] font-mono mt-0.5">#{row.brandId}</p>
      </TD>
      <TD><DocTypeBadge row={row} /></TD>
      <TD className="text-right">
        <span className={`tabular-nums text-[13px] font-semibold ${negComm ? 'text-[#8B1E3F]' : 'text-[#0A0A0A]'}`}
          style={{ fontFamily: 'var(--font-league-spartan)' }}>
          {fmtEurDe(row.commissionNet)}
        </span>
      </TD>
      <TD className="text-right">
        <span className="tabular-nums text-[13px] text-[#6B6B6B]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
          {fmtEurDe(row.commissionVat)}
        </span>
      </TD>
      <TD className="text-right">
        <span className={`tabular-nums text-[13px] font-bold ${negComm ? 'text-[#8B1E3F]' : 'text-[#0A0A0A]'}`}
          style={{ fontFamily: 'var(--font-league-spartan)' }}>
          {fmtEurDe(row.commissionGross)}
        </span>
      </TD>
      <TD className="text-right">
        <span className={`tabular-nums text-[13px] font-bold ${row.payoutAmount < 0 ? 'text-[#8B1E3F]' : 'text-[#1A5A3C]'}`}
          style={{ fontFamily: 'var(--font-league-spartan)' }}>
          {fmtEurDe(row.payoutAmount)}
        </span>
        {row.payoutAmount <= 0 && (
          <p className="text-[9px] text-[#8B1E3F] text-right mt-0.5" style={{ fontFamily: 'var(--font-league-spartan)' }}>
            kein SEPA
          </p>
        )}
      </TD>
      <TD>
        <p className="text-[11px] font-mono text-[#6B6B6B]">{fmtDateTime(row.settledAt)}</p>
      </TD>
      <TD>
        {row.invoiceReference ? (
          <div className="flex items-center gap-1">
            <span className="text-[12px] font-mono text-[#2D2D2D]">{row.invoiceReference}</span>
            <CopyBtn value={row.invoiceReference} label="Referenz" />
          </div>
        ) : (
          <span className="text-[11px] text-[#C0C0BC]" style={{ fontFamily: 'var(--font-league-spartan)' }}>—</span>
        )}
      </TD>
    </TableRow>
  )
}

// ─── Shared table row ─────────────────────────────────────────────────────────

function SettlementTableRow({
  row, periodOpen, onMark, isSepa,
}: {
  row: SettlementRow
  periodOpen: boolean
  onMark: () => void
  isSepa: boolean
}) {
  const negComm = row.commissionGross < 0
  return (
    <TableRow>
      {/* Brand */}
      <TD>
        <p className="text-[13px] font-semibold text-[#0A0A0A]"
          style={{ fontFamily: 'var(--font-league-spartan)' }}>
          {row.brandName}
        </p>
        <p className="text-[10px] text-[#9B9B9B] font-mono mt-0.5">#{row.brandId}</p>
      </TD>

      {/* Type + hints */}
      <TD>
        <div className="space-y-1.5">
          <DocTypeBadge row={row} />
          {row.isCreditNote && (
            <p className="text-[10px] text-[#8B1E3F] leading-snug"
              style={{ fontFamily: 'var(--font-league-spartan)' }}>
              Mehr Refunds als Umsatz — Gutschrift/Rechnungskorrektur erstellen, keine Rechnung.
            </p>
          )}
          {!row.domestic && !row.isCreditNote && (
            <p className="text-[10px] text-[#7A5C1E] leading-snug"
              style={{ fontFamily: 'var(--font-league-spartan)' }}>
              Rechnung netto, ohne USt, mit Reverse-Charge-Hinweis. USt-IdNr Pflicht.
            </p>
          )}
        </div>
      </TD>

      {/* VAT ID / Tax number */}
      <TD>
        <div className="space-y-1">
          {row.vatId ? (
            <div className="flex items-center gap-1">
              <span className="text-[12px] font-mono text-[#2D2D2D]">{row.vatId}</span>
              <CopyBtn value={row.vatId} label="USt-IdNr" />
            </div>
          ) : (
            <span className="text-[11px] text-[#C0C0BC]"
              style={{ fontFamily: 'var(--font-league-spartan)' }}>
              {!row.domestic ? '⚠ Keine USt-Id' : '—'}
            </span>
          )}
          {row.taxNumber && (
            <p className="text-[10px] text-[#9B9B9B] font-mono">{row.taxNumber}</p>
          )}
        </div>
      </TD>

      {/* Commission net */}
      <TD className="text-right">
        <div className="flex items-center justify-end gap-1">
          <span className={`tabular-nums text-[13px] font-semibold ${negComm ? 'text-[#8B1E3F]' : 'text-[#0A0A0A]'}`}
            style={{ fontFamily: 'var(--font-league-spartan)' }}>
            {fmtEurDe(row.commissionNet)}
          </span>
          <CopyBtn value={String(row.commissionNet)} label="Provision netto" />
        </div>
      </TD>

      {/* VAT */}
      <TD className="text-right">
        <div className="flex items-center justify-end gap-1">
          <span className="tabular-nums text-[13px] text-[#6B6B6B]"
            style={{ fontFamily: 'var(--font-league-spartan)' }}>
            {fmtEurDe(row.commissionVat)}
          </span>
          <CopyBtn value={String(row.commissionVat)} label="USt" />
        </div>
      </TD>

      {/* Commission gross */}
      <TD className="text-right">
        <span className={`tabular-nums text-[13px] font-bold ${negComm ? 'text-[#8B1E3F]' : 'text-[#0A0A0A]'}`}
          style={{ fontFamily: 'var(--font-league-spartan)' }}>
          {fmtEurDe(row.commissionGross)}
        </span>
      </TD>

      {/* Payout */}
      <TD className="text-right">
        <div className="flex items-center justify-end gap-1">
          <span className={`tabular-nums text-[13px] font-bold ${!isSepa ? 'text-[#8B1E3F]' : 'text-[#1A5A3C]'}`}
            style={{ fontFamily: 'var(--font-league-spartan)' }}>
            {fmtEurDe(row.payoutAmount)}
          </span>
          <CopyBtn value={String(row.payoutAmount)} label="Auszahlung" />
        </div>
        {!isSepa && (
          <p className="text-[9px] text-[#8B1E3F] text-right mt-0.5 leading-tight"
            style={{ fontFamily: 'var(--font-league-spartan)' }}>
            kein SEPA
          </p>
        )}
        {isSepa && (
          <p className="text-[9px] text-[#1A5A3C] text-right mt-0.5 leading-tight"
            style={{ fontFamily: 'var(--font-league-spartan)' }}>
            überweisen
          </p>
        )}
      </TD>

      {/* Orders/Refunds */}
      <TD>
        <p className="text-[12px] text-[#6B6B6B] tabular-nums"
          style={{ fontFamily: 'var(--font-league-spartan)' }}>
          {row.orderCount} Best.
        </p>
        {row.refundCount > 0 && (
          <p className="text-[11px] text-[#8B1E3F] tabular-nums mt-0.5"
            style={{ fontFamily: 'var(--font-league-spartan)' }}>
            {row.refundCount} Rückg.
          </p>
        )}
      </TD>

      {/* Action */}
      <TD>
        <button
          onClick={onMark}
          disabled={periodOpen}
          title={periodOpen ? 'Erst ab dem 1. des Folgemonats abrechenbar.' : undefined}
          className="h-8 px-3 rounded-lg text-[11px] font-medium text-white whitespace-nowrap transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ fontFamily: 'var(--font-league-spartan)', letterSpacing: '0.04em', background: '#370E4D' }}
          onMouseEnter={e => { if (!periodOpen) e.currentTarget.style.background = '#4A1566' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#370E4D' }}
        >
          {isSepa ? 'SEPA + Abrechnen' : 'Abrechnen'}
        </button>
      </TD>
    </TableRow>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Settlements() {
  const [period, setPeriod]         = useState(getDefaultPeriod())
  const [view, setView]             = useState<'open' | 'settled'>('open')
  const [rows, setRows]             = useState<SettlementRow[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [confirmRow, setConfirmRow] = useState<SettlementRow | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast]           = useState<ToastState | null>(null)
  const [guideOpen, setGuideOpen]   = useState(false)

  const periodOpen = isPeriodOpen(period)

  function showToast(msg: string, variant: ToastState['variant']) {
    setToast({ msg, variant })
    setTimeout(() => setToast(null), 5000)
  }

  async function loadRows(p: string, settled: boolean) {
    setLoading(true)
    setError(null)
    try {
      setRows(await settlementApi.getSettlements(p, settled))
    } catch {
      setError('Abrechnungsdaten konnten nicht geladen werden.')
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadRows(period, view === 'settled') }, [period, view])

  async function handleMarkSettled(ref: string) {
    if (!confirmRow) return
    const row = confirmRow
    setSubmitting(true)
    try {
      await settlementApi.markSettled(row.brandId, period, ref.trim() || undefined)
      setRows(prev => prev.filter(r => r.brandId !== row.brandId))
      showToast(`${row.brandName} abgerechnet${ref.trim() ? ` · ${ref.trim()}` : ''}.`, 'success')
    } catch (err) {
      if (err instanceof FetchError) {
        if (err.status === 409) {
          setRows(prev => prev.filter(r => r.brandId !== row.brandId))
          showToast(`${row.brandName} war bereits abgerechnet.`, 'warn')
        } else if (err.status === 422) {
          showToast('Periode noch nicht abgeschlossen — erst ab dem 1. des Folgemonats abrechenbar.', 'warn')
        } else {
          showToast('Fehler beim Markieren. Bitte erneut versuchen.', 'error')
        }
      } else {
        showToast('Unerwarteter Fehler.', 'error')
      }
    } finally {
      setSubmitting(false)
      setConfirmRow(null)
    }
  }

  // Split into SEPA (positive payout) and no-SEPA (zero/negative payout) groups
  const { sepaRows, noSepaRows, sepaTotal, commissionNetTotal, commissionGrossTotal } = useMemo(() => {
    const sepa   = rows.filter(r => r.payoutAmount > 0)
    const noSepa = rows.filter(r => r.payoutAmount <= 0)
    return {
      sepaRows:             sepa,
      noSepaRows:           noSepa,
      sepaTotal:            sepa.reduce((s, r) => s + r.payoutAmount,    0),
      commissionNetTotal:   rows.reduce((s, r) => s + r.commissionNet,   0),
      commissionGrossTotal: rows.reduce((s, r) => s + r.commissionGross, 0),
    }
  }, [rows])

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Finanzen"
        title="Monatliche"
        italicTitle="Abrechnung."
        sub="Provision und Auszahlungen je Brand — prüfen, in lexoffice erstellen, als abgerechnet markieren."
      />

      {/* Toast notification */}
      {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}

      {/* Workflow guide — collapsible */}
      <div className="rounded-xl border border-[#E8E8E8] overflow-hidden">
        <button
          onClick={() => setGuideOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors duration-150"
          style={{ background: guideOpen ? '#F5F5F0' : '#FAFAF8' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#F5F5F0' }}
          onMouseLeave={e => { e.currentTarget.style.background = guideOpen ? '#F5F5F0' : '#FAFAF8' }}
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#6B6B6B]"
            style={{ fontFamily: 'var(--font-league-spartan)' }}>
            Workflow · Manueller Abrechnungsablauf
          </p>
          {guideOpen
            ? <ChevronUp className="w-4 h-4 text-[#9B9B9B]" />
            : <ChevronDown className="w-4 h-4 text-[#9B9B9B]" />}
        </button>
        {guideOpen && (
          <div className="px-5 py-4 bg-white border-t border-[#F0F0EB] space-y-3">
            {([
              { n: '1', t: 'Zahlen prüfen. Badge zeigt Belegtyp: Inland (inkl. 19 % USt), Reverse Charge (netto) oder Gutschrift (Rechnungskorrektur).' },
              { n: '2', t: 'Beleg in lexoffice erstellen. Werte per Copy-Button übernehmen — verhindert Tippfehler.' },
              { n: '3', t: 'Auszahlung per SEPA überweisen — nur wenn payoutAmount positiv. Negativer Betrag: kein Ausgang, Schuld wird über outstandingDebt verrechnet.' },
              { n: '4', t: 'Hier „Als abgerechnet markieren" — mit optionaler Rechnungsreferenz. Zeile verschwindet danach aus der Liste.' },
            ] as { n: string; t: string }[]).map(({ n, t }) => (
              <div key={n} className="flex gap-3">
                <span className="w-5 h-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: '#370E4D', fontFamily: 'var(--font-league-spartan)' }}>
                  {n}
                </span>
                <p className="text-[12px] text-[#2D2D2D] leading-relaxed" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                  {t}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View tabs */}
      <div className="inline-flex rounded-lg border border-[#E8E8E8] overflow-hidden">
        {([
          { id: 'open',    label: 'Offen',         icon: null },
          { id: 'settled', label: 'Abgerechnet',   icon: <History className="w-3 h-3" /> },
        ] as { id: 'open' | 'settled'; label: string; icon: React.ReactNode }[]).map(tab => (
          <button
            key={tab.id}
            onClick={() => { setView(tab.id); setRows([]) }}
            className="inline-flex items-center gap-1.5 h-9 px-4 text-[11px] font-medium transition-all duration-150"
            style={{
              fontFamily: 'var(--font-league-spartan)',
              letterSpacing: '0.06em',
              background: view === tab.id ? '#370E4D' : '#fff',
              color:      view === tab.id ? '#fff'    : '#6B6B6B',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <label className="block text-[10px] uppercase tracking-[0.12em] text-[#6B6B6B] font-medium mb-1"
            style={{ fontFamily: 'var(--font-league-spartan)' }}>
            Periode
          </label>
          <input
            type="month"
            value={period}
            max={getCurrentPeriod()}
            onChange={e => { if (e.target.value) setPeriod(e.target.value) }}
            className="h-9 px-3 text-[13px] border border-[#E8E8E8] bg-white rounded-lg focus:outline-none focus:border-[#370E4D]/40 transition-all duration-200"
            style={{ fontFamily: 'var(--font-league-spartan)' }}
          />
        </div>
        {periodOpen && (
          <div className="flex items-center gap-2 text-[11px] text-[#7A5C1E] bg-amber-50 border border-amber-200 rounded-lg px-3 py-2"
            style={{ fontFamily: 'var(--font-league-spartan)' }}>
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            Periode noch nicht abgeschlossen — Markieren gesperrt.
          </div>
        )}
      </div>

      {/* Summary — only shown for open view */}
      {view === 'open' && !loading && !error && rows.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* SEPA fällig — green accent, most important */}
          <div className="rounded-xl border px-4 py-3.5" style={{ background: 'rgba(26,90,60,0.06)', borderColor: 'rgba(26,90,60,0.2)' }}>
            <p className="text-[9px] uppercase tracking-[0.14em] mb-1 text-[#1A5A3C]"
              style={{ fontFamily: 'var(--font-league-spartan)' }}>
              SEPA fällig · {sepaRows.length} Brand{sepaRows.length !== 1 ? 's' : ''}
            </p>
            <p className="text-[18px] font-bold tabular-nums leading-none text-[#1A5A3C]"
              style={{ fontFamily: 'var(--font-league-spartan)' }}>
              {fmtEurDe(sepaTotal)}
            </p>
            <p className="text-[10px] text-[#1A5A3C]/60 mt-1" style={{ fontFamily: 'var(--font-league-spartan)' }}>
              jetzt überweisen
            </p>
          </div>
          {/* Kein SEPA */}
          <div className="rounded-xl border px-4 py-3.5" style={{ background: noSepaRows.length ? 'rgba(139,30,63,0.04)' : '#FAFAF8', borderColor: noSepaRows.length ? 'rgba(139,30,63,0.15)' : '#E8E8E8' }}>
            <p className="text-[9px] uppercase tracking-[0.14em] mb-1"
              style={{ fontFamily: 'var(--font-league-spartan)', color: noSepaRows.length ? '#8B1E3F' : '#9B9B9B' }}>
              Kein SEPA · {noSepaRows.length} Brand{noSepaRows.length !== 1 ? 's' : ''}
            </p>
            <p className="text-[18px] font-semibold tabular-nums leading-none"
              style={{ fontFamily: 'var(--font-league-spartan)', color: noSepaRows.length ? '#8B1E3F' : '#C0C0BC' }}>
              {noSepaRows.length > 0 ? 'Kein Ausgang' : '—'}
            </p>
            <p className="text-[10px] mt-1" style={{ fontFamily: 'var(--font-league-spartan)', color: noSepaRows.length ? '#8B1E3F' : '#C0C0BC' }}>
              {noSepaRows.length > 0 ? 'outstandingDebt' : 'alle positiv'}
            </p>
          </div>
          {/* Σ Provision netto */}
          <div className="rounded-xl border border-[#E8E8E8] bg-white px-4 py-3.5">
            <p className="text-[9px] uppercase tracking-[0.14em] mb-1 text-[#9B9B9B]"
              style={{ fontFamily: 'var(--font-league-spartan)' }}>
              Σ Provision netto
            </p>
            <p className="text-[18px] font-semibold tabular-nums leading-none"
              style={{ fontFamily: 'var(--font-league-spartan)', color: commissionNetTotal < 0 ? '#8B1E3F' : '#0A0A0A' }}>
              {fmtEurDe(commissionNetTotal)}
            </p>
          </div>
          {/* Σ Provision brutto */}
          <div className="rounded-xl border px-4 py-3.5" style={{ background: '#370E4D', borderColor: '#370E4D' }}>
            <p className="text-[9px] uppercase tracking-[0.14em] mb-1" style={{ fontFamily: 'var(--font-league-spartan)', color: 'rgba(255,255,255,0.45)' }}>
              Σ Provision brutto
            </p>
            <p className="text-[18px] font-bold tabular-nums leading-none text-white"
              style={{ fontFamily: 'var(--font-league-spartan)' }}>
              {fmtEurDe(commissionGrossTotal)}
            </p>
          </div>
        </div>
      )}

      {/* ── Settled history view ── */}
      {view === 'settled' && (
        <SectionCard title="Abgerechnete Rechnungen" count={rows.length}>
          <div className="px-6 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2 text-[11px] text-[#7A5C1E]"
            style={{ fontFamily: 'var(--font-league-spartan)' }}>
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            Benötigt Backend-Unterstützung (<code className="font-mono">includeSettled=true</code>). Sobald das Backend den Parameter liefert, erscheinen hier alle abgerechneten Einträge.
          </div>
          {loading ? <Loader /> : error ? (
            <div className="py-12 text-center">
              <p className="text-[12px] text-[#8B1E3F]" style={{ fontFamily: 'var(--font-league-spartan)' }}>{error}</p>
            </div>
          ) : rows.length === 0 ? (
            <EmptyState message="Keine abgerechneten Einträge für diesen Monat gefunden." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <TH>Brand</TH>
                    <TH>Typ</TH>
                    <TH right>Provision netto</TH>
                    <TH right>USt</TH>
                    <TH right>Provision brutto</TH>
                    <TH right>Auszahlung</TH>
                    <TH>Abgerechnet am</TH>
                    <TH>Referenz</TH>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => <HistoryTableRow key={row.brandId} row={row} />)}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      )}

      {/* ── Open settlements table ── */}
      {view === 'open' && (
      <SectionCard title="Offene Abrechnungen" count={rows.length}>
        {loading ? (
          <Loader />
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-[12px] text-[#8B1E3F]" style={{ fontFamily: 'var(--font-league-spartan)' }}>{error}</p>
            <button
              onClick={() => loadRows(period, false)}
              className="mt-3 text-[11px] text-[#370E4D] underline"
              style={{ fontFamily: 'var(--font-league-spartan)' }}
            >
              Erneut versuchen
            </button>
          </div>
        ) : rows.length === 0 ? (
          <EmptyState message="Für diesen Monat ist alles abgerechnet — oder keine Aktivität." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <TH>Brand</TH>
                  <TH>Typ &amp; Hinweise</TH>
                  <TH>USt-ID / Steuernr.</TH>
                  <TH right>Provision netto</TH>
                  <TH right>USt</TH>
                  <TH right>Provision brutto</TH>
                  <TH right>Auszahlung</TH>
                  <TH>Orders</TH>
                  <TH>Aktion</TH>
                </tr>
              </thead>
              <tbody>
                {/* ── Section 1: SEPA-Überweisung fällig ── */}
                {sepaRows.length > 0 && (
                  <tr>
                    <td colSpan={9} style={{ background: 'rgba(26,90,60,0.06)', borderTop: '2px solid rgba(26,90,60,0.15)', borderBottom: '1px solid rgba(26,90,60,0.12)', padding: '8px 20px' }}>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#1A5A3C]"
                          style={{ fontFamily: 'var(--font-league-spartan)' }}>
                          <Check className="w-3 h-3" />
                          SEPA-Überweisung fällig
                        </span>
                        <span className="text-[10px] text-[#1A5A3C]/60" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                          {sepaRows.length} Brand{sepaRows.length !== 1 ? 's' : ''} · Gesamt: {fmtEurDe(sepaTotal)}
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
                {sepaRows.map(row => <SettlementTableRow key={row.brandId} row={row} periodOpen={periodOpen} onMark={() => setConfirmRow(row)} isSepa />)}

                {/* ── Section 2: Kein SEPA-Ausgang ── */}
                {noSepaRows.length > 0 && (
                  <tr>
                    <td colSpan={9} style={{ background: 'rgba(139,30,63,0.04)', borderTop: '2px solid rgba(139,30,63,0.12)', borderBottom: '1px solid rgba(139,30,63,0.08)', padding: '8px 20px' }}>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8B1E3F]"
                          style={{ fontFamily: 'var(--font-league-spartan)' }}>
                          <X className="w-3 h-3" />
                          Kein SEPA-Ausgang
                        </span>
                        <span className="text-[10px] text-[#8B1E3F]/60" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                          {noSepaRows.length} Brand{noSepaRows.length !== 1 ? 's' : ''} · Brand schuldet — outstandingDebt wird verrechnet
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
                {noSepaRows.map(row => <SettlementTableRow key={row.brandId} row={row} periodOpen={periodOpen} onMark={() => setConfirmRow(row)} isSepa={false} />)}
              </tbody>
            </table>

          </div>
        )}
      </SectionCard>
      )}

      {/* Confirm dialog */}
      {confirmRow && (
        <ConfirmDialog
          row={confirmRow}
          period={period}
          onConfirm={handleMarkSettled}
          onCancel={() => setConfirmRow(null)}
          submitting={submitting}
        />
      )}
    </div>
  )
}
