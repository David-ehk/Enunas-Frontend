'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { settlementApi, FetchError } from '@/lib/api'
import type { SettlementRow, SettlementDashboard } from '@/lib/api'
import {
  PageHeader, SectionCard, EmptyState, Loader, TH, TD, TableRow,
  KPIGrid, KPICell,
} from './shared'
import { Copy, Check, X, ChevronDown, ChevronUp, AlertTriangle, History, Info, RefreshCw } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

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

// Theoretical 19% VAT that would apply if the RC brand were domestic
function fiktiveVat(row: SettlementRow): number {
  if (row.domestic || row.isCreditNote || row.commissionNet <= 0) return 0
  return Math.round(row.commissionNet * 0.19 * 100) / 100
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_VERSION = 'v3'
const LS_OPEN_KEY    = 'enunas_admin_settlements_open'
const LS_SETTLED_KEY = 'enunas_admin_settlements_settled'
const LS_TREND_KEY   = 'enunas_admin_settlements_trend'
const LS_VER_KEY     = 'enunas_admin_settlements_ver'

const SEED_OPEN: Record<string, SettlementRow[]> = {
  // ── May 2026 (default period) ─────────────────────────────────────────────
  '2026-05': [
    {
      brandId: 1, brandName: 'Velva Athletic', domestic: true,
      vatId: 'DE123456789', taxNumber: '123/456/78901',
      commissionNet: 2850, commissionVat: 541, commissionGross: 3391,
      payoutAmount: 15449, orderCount: 92, refundCount: 6, isCreditNote: false,
    },
    {
      brandId: 2, brandName: 'Noir Atelier', domestic: true,
      vatId: 'DE987654321', taxNumber: null,
      commissionNet: 2002, commissionVat: 381, commissionGross: 2383,
      payoutAmount: 10857, orderCount: 71, refundCount: 5, isCreditNote: false,
    },
    {
      brandId: 7, brandName: 'Vantage Berlin', domestic: true,
      vatId: 'DE555666777', taxNumber: '555/666/77788',
      commissionNet: 1307, commissionVat: 248, commissionGross: 1555,
      payoutAmount: 7085, orderCount: 44, refundCount: 3, isCreditNote: false,
    },
    {
      brandId: 3, brandName: 'Lumière Paris', domestic: false,
      vatId: 'FR12345678901', taxNumber: null,
      commissionNet: 1771, commissionVat: 0, commissionGross: 1771,
      payoutAmount: 8069, orderCount: 54, refundCount: 4, isCreditNote: false,
    },
    {
      brandId: 4, brandName: 'Kroft London', domestic: false,
      vatId: 'GB123456789', taxNumber: null,
      commissionNet: 1303, commissionVat: 0, commissionGross: 1303,
      payoutAmount: 5937, orderCount: 38, refundCount: 2, isCreditNote: false,
    },
    {
      brandId: 6, brandName: 'Drape Studio', domestic: false,
      vatId: 'NL123456789B01', taxNumber: null,
      commissionNet: 886, commissionVat: 0, commissionGross: 886,
      payoutAmount: 4034, orderCount: 26, refundCount: 1, isCreditNote: false,
    },
    {
      brandId: 8, brandName: 'Maison Zuri', domestic: false,
      vatId: null, taxNumber: null,
      commissionNet: 642, commissionVat: 0, commissionGross: 642,
      payoutAmount: 2924, orderCount: 19, refundCount: 2, isCreditNote: false,
    },
    {
      brandId: 5, brandName: 'Reborn Collective', domestic: true,
      vatId: 'DE111222333', taxNumber: '111/222/33344',
      commissionNet: -278, commissionVat: -53, commissionGross: -331,
      payoutAmount: -1509, orderCount: 12, refundCount: 18, isCreditNote: true,
    },
  ],
  // ── April 2026 ────────────────────────────────────────────────────────────
  '2026-04': [
    {
      brandId: 1, brandName: 'Velva Athletic', domestic: true,
      vatId: 'DE123456789', taxNumber: '123/456/78901',
      commissionNet: 2547, commissionVat: 484, commissionGross: 3031,
      payoutAmount: 13809, orderCount: 84, refundCount: 7, isCreditNote: false,
    },
    {
      brandId: 2, brandName: 'Noir Atelier', domestic: true,
      vatId: 'DE987654321', taxNumber: null,
      commissionNet: 1700, commissionVat: 323, commissionGross: 2023,
      payoutAmount: 9217, orderCount: 62, refundCount: 4, isCreditNote: false,
    },
    {
      brandId: 3, brandName: 'Lumière Paris', domestic: false,
      vatId: 'FR12345678901', taxNumber: null,
      commissionNet: 1555, commissionVat: 0, commissionGross: 1555,
      payoutAmount: 7085, orderCount: 48, refundCount: 3, isCreditNote: false,
    },
    {
      brandId: 4, brandName: 'Kroft London', domestic: false,
      vatId: 'GB123456789', taxNumber: null,
      commissionNet: 1102, commissionVat: 0, commissionGross: 1102,
      payoutAmount: 5018, orderCount: 31, refundCount: 2, isCreditNote: false,
    },
    {
      brandId: 5, brandName: 'Reborn Collective', domestic: true,
      vatId: 'DE111222333', taxNumber: '111/222/33344',
      commissionNet: -278, commissionVat: -53, commissionGross: -331,
      payoutAmount: -1509, orderCount: 12, refundCount: 18, isCreditNote: true,
    },
  ],
  // ── March 2026 ────────────────────────────────────────────────────────────
  '2026-03': [
    {
      brandId: 1, brandName: 'Velva Athletic', domestic: true,
      vatId: 'DE123456789', taxNumber: '123/456/78901',
      commissionNet: 2211, commissionVat: 420, commissionGross: 2631,
      payoutAmount: 11989, orderCount: 74, refundCount: 5, isCreditNote: false,
    },
    {
      brandId: 3, brandName: 'Lumière Paris', domestic: false,
      vatId: 'FR12345678901', taxNumber: null,
      commissionNet: 1296, commissionVat: 0, commissionGross: 1296,
      payoutAmount: 5904, orderCount: 41, refundCount: 2, isCreditNote: false,
    },
    {
      brandId: 6, brandName: 'Drape Studio', domestic: false,
      vatId: 'NL123456789B01', taxNumber: null,
      commissionNet: 840, commissionVat: 0, commissionGross: 840,
      payoutAmount: 3820, orderCount: 24, refundCount: 1, isCreditNote: false,
    },
  ],
}

const SEED_SETTLED: Record<string, SettlementRow[]> = {
  '2026-05': [],
  '2026-04': [
    {
      brandId: 1, brandName: 'Velva Athletic', domestic: true,
      vatId: 'DE123456789', taxNumber: '123/456/78901',
      commissionNet: 2547, commissionVat: 484, commissionGross: 3031,
      payoutAmount: 13809, orderCount: 84, refundCount: 7, isCreditNote: false,
      settled: true, settledAt: '2026-05-01T09:14:22Z', invoiceReference: 'LEX-2026-04-047',
    },
    {
      brandId: 2, brandName: 'Noir Atelier', domestic: true,
      vatId: 'DE987654321', taxNumber: null,
      commissionNet: 1700, commissionVat: 323, commissionGross: 2023,
      payoutAmount: 9217, orderCount: 62, refundCount: 4, isCreditNote: false,
      settled: true, settledAt: '2026-05-01T09:31:07Z', invoiceReference: 'LEX-2026-04-048',
    },
    {
      brandId: 3, brandName: 'Lumière Paris', domestic: false,
      vatId: 'FR12345678901', taxNumber: null,
      commissionNet: 1555, commissionVat: 0, commissionGross: 1555,
      payoutAmount: 7085, orderCount: 48, refundCount: 3, isCreditNote: false,
      settled: true, settledAt: '2026-05-01T10:02:44Z', invoiceReference: 'LEX-2026-04-049',
    },
    {
      brandId: 4, brandName: 'Kroft London', domestic: false,
      vatId: 'GB123456789', taxNumber: null,
      commissionNet: 1102, commissionVat: 0, commissionGross: 1102,
      payoutAmount: 5018, orderCount: 31, refundCount: 2, isCreditNote: false,
      settled: true, settledAt: '2026-05-01T10:19:55Z', invoiceReference: 'LEX-2026-04-050',
    },
    {
      brandId: 5, brandName: 'Reborn Collective', domestic: true,
      vatId: 'DE111222333', taxNumber: '111/222/33344',
      commissionNet: -278, commissionVat: -53, commissionGross: -331,
      payoutAmount: -1509, orderCount: 12, refundCount: 18, isCreditNote: true,
      settled: true, settledAt: '2026-05-01T10:45:30Z', invoiceReference: 'LEX-2026-04-KN-051',
    },
  ],
  '2026-03': [
    {
      brandId: 1, brandName: 'Velva Athletic', domestic: true,
      vatId: 'DE123456789', taxNumber: '123/456/78901',
      commissionNet: 2211, commissionVat: 420, commissionGross: 2631,
      payoutAmount: 11989, orderCount: 74, refundCount: 5, isCreditNote: false,
      settled: true, settledAt: '2026-04-01T09:14:22Z', invoiceReference: 'LEX-2026-03-041',
    },
    {
      brandId: 3, brandName: 'Lumière Paris', domestic: false,
      vatId: 'FR12345678901', taxNumber: null,
      commissionNet: 1296, commissionVat: 0, commissionGross: 1296,
      payoutAmount: 5904, orderCount: 41, refundCount: 2, isCreditNote: false,
      settled: true, settledAt: '2026-04-01T10:02:44Z', invoiceReference: 'LEX-2026-03-042',
    },
    {
      brandId: 6, brandName: 'Drape Studio', domestic: false,
      vatId: 'NL123456789B01', taxNumber: null,
      commissionNet: 840, commissionVat: 0, commissionGross: 840,
      payoutAmount: 3820, orderCount: 24, refundCount: 1, isCreditNote: false,
      settled: true, settledAt: '2026-04-01T10:19:55Z', invoiceReference: 'LEX-2026-03-043',
    },
  ],
  '2026-02': [
    {
      brandId: 1, brandName: 'Velva Athletic', domestic: true,
      vatId: 'DE123456789', taxNumber: '123/456/78901',
      commissionNet: 1815, commissionVat: 345, commissionGross: 2160,
      payoutAmount: 9840, orderCount: 60, refundCount: 4, isCreditNote: false,
      settled: true, settledAt: '2026-03-01T08:55:10Z', invoiceReference: 'LEX-2026-02-038',
    },
    {
      brandId: 3, brandName: 'Lumière Paris', domestic: false,
      vatId: 'FR12345678901', taxNumber: null,
      commissionNet: 1008, commissionVat: 0, commissionGross: 1008,
      payoutAmount: 4592, orderCount: 33, refundCount: 2, isCreditNote: false,
      settled: true, settledAt: '2026-03-01T09:12:33Z', invoiceReference: 'LEX-2026-02-039',
    },
  ],
}

const TREND_DATA = [
  { label: 'Apr 25', commission: 5840,  sepa: 22400 },
  { label: 'Mai 25', commission: 6240,  sepa: 24100 },
  { label: 'Jun 25', commission: 4890,  sepa: 18900 },
  { label: 'Jul 25', commission: 5420,  sepa: 20800 },
  { label: 'Aug 25', commission: 6180,  sepa: 23700 },
  { label: 'Sep 25', commission: 7240,  sepa: 27800 },
  { label: 'Okt 25', commission: 8640,  sepa: 33200 },
  { label: 'Nov 25', commission: 9840,  sepa: 37800 },
  { label: 'Dez 25', commission: 12480, sepa: 48000 },
  { label: 'Jan 26', commission: 8920,  sepa: 34300 },
  { label: 'Feb 26', commission: 7840,  sepa: 30100 },
  { label: 'Mär 26', commission: 9120,  sepa: 35000 },
  { label: 'Apr 26', commission: 7711,  sepa: 29900 },
  { label: 'Mai 26', commission: 9929,  sepa: 51430 },
]

// ─── Local storage helpers ────────────────────────────────────────────────────

function getMockRows(p: string, settled: boolean): SettlementRow[] {
  if (typeof window === 'undefined') return []
  try {
    const key = settled ? LS_SETTLED_KEY : LS_OPEN_KEY
    const map = JSON.parse(localStorage.getItem(key) ?? '{}') as Record<string, SettlementRow[]>
    return map[p] ?? []
  } catch { return [] }
}

function persistOpenRemoval(brandId: number, p: string, invoiceRef: string) {
  try {
    const openMap    = JSON.parse(localStorage.getItem(LS_OPEN_KEY)    ?? '{}') as Record<string, SettlementRow[]>
    const settledMap = JSON.parse(localStorage.getItem(LS_SETTLED_KEY) ?? '{}') as Record<string, SettlementRow[]>
    const row = (openMap[p] ?? []).find(r => r.brandId === brandId)
    if (row) {
      openMap[p]    = (openMap[p] ?? []).filter(r => r.brandId !== brandId)
      settledMap[p] = [...(settledMap[p] ?? []), { ...row, settled: true, settledAt: new Date().toISOString(), invoiceReference: invoiceRef || null }]
      localStorage.setItem(LS_OPEN_KEY,    JSON.stringify(openMap))
      localStorage.setItem(LS_SETTLED_KEY, JSON.stringify(settledMap))
    }
  } catch { /* ignore */ }
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyBtn({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState(false)
  function copy() {
    navigator.clipboard.writeText(value).then(() => {
      setDone(true); setTimeout(() => setDone(false), 1500)
    })
  }
  return (
    <button onClick={copy} title={`${label} kopieren`}
      className="inline-flex items-center justify-center w-6 h-6 rounded transition-all duration-150"
      style={{ color: done ? '#1A5A3C' : '#C0C0BC' }}
      onMouseEnter={e => { if (!done) e.currentTarget.style.color = '#370E4D' }}
      onMouseLeave={e => { if (!done) e.currentTarget.style.color = '#C0C0BC' }}>
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

// ─── Fiktive USt cell ─────────────────────────────────────────────────────────

function FiktiveVatCell({ row }: { row: SettlementRow }) {
  const amount = fiktiveVat(row)
  if (amount === 0) {
    return (
      <TD className="text-right">
        <span style={{ color: '#C0C0BC', fontSize: 12, fontFamily: 'var(--font-league-spartan)' }}>—</span>
      </TD>
    )
  }
  return (
    <TD className="text-right">
      <div className="flex items-center justify-end gap-1">
        <div>
          <span className="tabular-nums text-[13px] font-semibold"
            style={{ fontFamily: 'var(--font-league-spartan)', color: '#7A5C1E' }}>
            {fmtEurDe(amount)}
          </span>
          <p style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 9, color: '#7A5C1E', textAlign: 'right', marginTop: 1 }}>§ 13b UStG</p>
        </div>
        <CopyBtn value={amount.toFixed(2)} label="Fiktive USt" />
      </div>
    </TD>
  )
}

// ─── Confirmation dialog ──────────────────────────────────────────────────────

function CheckItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <Check className="w-3.5 h-3.5 text-[#1A5A3C] shrink-0 mt-0.5" />
      <p className="text-[12px] text-[#2D2D2D] leading-snug" style={{ fontFamily: 'var(--font-league-spartan)' }}>{text}</p>
    </div>
  )
}

interface ConfirmDialogProps {
  row: SettlementRow; period: string
  onConfirm: (ref: string) => void; onCancel: () => void; submitting: boolean
}

function ConfirmDialog({ row, period, onConfirm, onCancel, submitting }: ConfirmDialogProps) {
  const [ref, setRef] = useState('')
  const negPayout = row.payoutAmount < 0
  const fv = fiktiveVat(row)

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-[480px] bg-[#F8F8F5] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
          onClick={e => e.stopPropagation()}>
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
                row.isCreditNote ? 'Gutschrift/Rechnungskorrektur in lexoffice erstellt'
                  : row.domestic ? 'Provisionsrechnung inkl. 19 % USt in lexoffice erstellt'
                  : 'Rechnung netto (Reverse Charge) in lexoffice erstellt — USt-IdNr geprüft'
              } />
              {!negPayout && <CheckItem text={`${fmtEurDe(row.payoutAmount)} per SEPA an ${row.brandName} überwiesen`} />}
              {negPayout && (
                <div className="flex items-start gap-2.5 text-[11px] text-[#7A5C1E] px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200"
                  style={{ fontFamily: 'var(--font-league-spartan)' }}>
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  Negativer Betrag — kein SEPA-Ausgang. Wird über outstandingDebt verrechnet.
                </div>
              )}
            </div>

            {/* Reverse charge reminder in dialog */}
            {fv > 0 && (
              <div className="flex items-start gap-2.5 text-[11px] px-3 py-2.5 rounded-lg border"
                style={{ fontFamily: 'var(--font-league-spartan)', background: 'rgba(122,92,30,0.04)', borderColor: 'rgba(122,92,30,0.2)', color: '#7A5C1E' }}>
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>Fiktive USt {fmtEurDe(fv)} (§ 13b UStG) — in der USt-Voranmeldung unter steuerfreie sonstige Leistungen EU-Ausland erfassen.</span>
              </div>
            )}

            <div>
              <label className="block text-[10px] uppercase tracking-[0.12em] text-[#6B6B6B] font-medium mb-1.5"
                style={{ fontFamily: 'var(--font-league-spartan)' }}>
                Rechnungsreferenz (optional)
              </label>
              <input type="text" value={ref} onChange={e => setRef(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !submitting) onConfirm(ref) }}
                placeholder="LEX-2026-06-001"
                className="w-full text-[13px] border border-[#E8E8E8] bg-white rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#370E4D]/40 transition-all duration-200 placeholder:text-[#C0C0BC]"
                style={{ fontFamily: 'var(--font-league-spartan)' }} />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 px-7 py-4 bg-white border-t border-[#EBEBEB]">
            <button onClick={onCancel} type="button"
              className="h-9 px-4 rounded-lg text-[11px] font-medium text-[#6B6B6B] border border-[#E8E8E8] hover:bg-[#F5F5F0] transition-all duration-200"
              style={{ fontFamily: 'var(--font-league-spartan)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Abbrechen
            </button>
            <button onClick={() => onConfirm(ref)} disabled={submitting} type="button"
              className="h-9 px-5 rounded-lg text-[11px] font-medium text-white transition-all duration-200 disabled:opacity-40 hover:bg-[#4A1566]"
              style={{ fontFamily: 'var(--font-league-spartan)', background: '#370E4D', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
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

// ─── History table row ────────────────────────────────────────────────────────

function HistoryTableRow({ row }: { row: SettlementRow }) {
  const negComm = row.commissionGross < 0
  return (
    <TableRow>
      <TD>
        <p className="text-[13px] font-semibold text-[#0A0A0A]" style={{ fontFamily: 'var(--font-league-spartan)' }}>{row.brandName}</p>
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
      <FiktiveVatCell row={row} />
      <TD className="text-right">
        <span className={`tabular-nums text-[13px] font-bold ${row.payoutAmount < 0 ? 'text-[#8B1E3F]' : 'text-[#1A5A3C]'}`}
          style={{ fontFamily: 'var(--font-league-spartan)' }}>
          {fmtEurDe(row.payoutAmount)}
        </span>
        {row.payoutAmount <= 0 && (
          <p className="text-[9px] text-[#8B1E3F] text-right mt-0.5" style={{ fontFamily: 'var(--font-league-spartan)' }}>kein SEPA</p>
        )}
      </TD>
      <TD><p className="text-[11px] font-mono text-[#6B6B6B]">{fmtDateTime(row.settledAt)}</p></TD>
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

// ─── Open settlement row ──────────────────────────────────────────────────────

function SettlementTableRow({ row, periodOpen, onMark, isSepa }: {
  row: SettlementRow; periodOpen: boolean; onMark: () => void; isSepa: boolean
}) {
  const negComm = row.commissionGross < 0
  return (
    <TableRow>
      <TD>
        <p className="text-[13px] font-semibold text-[#0A0A0A]" style={{ fontFamily: 'var(--font-league-spartan)' }}>{row.brandName}</p>
        <p className="text-[10px] text-[#9B9B9B] font-mono mt-0.5">#{row.brandId}</p>
      </TD>
      <TD>
        <div className="space-y-1.5">
          <DocTypeBadge row={row} />
          {row.isCreditNote && (
            <p className="text-[10px] text-[#8B1E3F] leading-snug" style={{ fontFamily: 'var(--font-league-spartan)' }}>
              Mehr Refunds als Umsatz — Gutschrift erstellen.
            </p>
          )}
          {!row.domestic && !row.isCreditNote && (
            <p className="text-[10px] text-[#7A5C1E] leading-snug" style={{ fontFamily: 'var(--font-league-spartan)' }}>
              Netto-Rechnung, kein USt-Ausweis, Reverse-Charge-Hinweis Pflicht.
            </p>
          )}
        </div>
      </TD>
      <TD>
        <div className="space-y-1">
          {row.vatId ? (
            <div className="flex items-center gap-1">
              <span className="text-[12px] font-mono text-[#2D2D2D]">{row.vatId}</span>
              <CopyBtn value={row.vatId} label="USt-IdNr" />
            </div>
          ) : (
            <span className="text-[11px]" style={{ fontFamily: 'var(--font-league-spartan)', color: !row.domestic ? '#8B1E3F' : '#C0C0BC' }}>
              {!row.domestic ? '⚠ Keine USt-Id' : '—'}
            </span>
          )}
          {row.taxNumber && <p className="text-[10px] text-[#9B9B9B] font-mono">{row.taxNumber}</p>}
        </div>
      </TD>
      <TD className="text-right">
        <div className="flex items-center justify-end gap-1">
          <span className={`tabular-nums text-[13px] font-semibold ${negComm ? 'text-[#8B1E3F]' : 'text-[#0A0A0A]'}`}
            style={{ fontFamily: 'var(--font-league-spartan)' }}>
            {fmtEurDe(row.commissionNet)}
          </span>
          <CopyBtn value={String(row.commissionNet)} label="Provision netto" />
        </div>
      </TD>
      <TD className="text-right">
        <div className="flex items-center justify-end gap-1">
          <span className="tabular-nums text-[13px] text-[#6B6B6B]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
            {fmtEurDe(row.commissionVat)}
          </span>
          <CopyBtn value={String(row.commissionVat)} label="USt" />
        </div>
      </TD>
      <TD className="text-right">
        <span className={`tabular-nums text-[13px] font-bold ${negComm ? 'text-[#8B1E3F]' : 'text-[#0A0A0A]'}`}
          style={{ fontFamily: 'var(--font-league-spartan)' }}>
          {fmtEurDe(row.commissionGross)}
        </span>
      </TD>
      <FiktiveVatCell row={row} />
      <TD className="text-right">
        <div className="flex items-center justify-end gap-1">
          <span className={`tabular-nums text-[13px] font-bold ${!isSepa ? 'text-[#8B1E3F]' : 'text-[#1A5A3C]'}`}
            style={{ fontFamily: 'var(--font-league-spartan)' }}>
            {fmtEurDe(row.payoutAmount)}
          </span>
          <CopyBtn value={String(row.payoutAmount)} label="Auszahlung" />
        </div>
        <p className="text-[9px] text-right mt-0.5 leading-tight"
          style={{ fontFamily: 'var(--font-league-spartan)', color: isSepa ? '#1A5A3C' : '#8B1E3F' }}>
          {isSepa ? 'überweisen' : 'kein SEPA'}
        </p>
      </TD>
      <TD>
        <p className="text-[12px] text-[#6B6B6B] tabular-nums" style={{ fontFamily: 'var(--font-league-spartan)' }}>
          {row.orderCount} Best.
        </p>
        {row.refundCount > 0 && (
          <p className="text-[11px] text-[#8B1E3F] tabular-nums mt-0.5" style={{ fontFamily: 'var(--font-league-spartan)' }}>
            {row.refundCount} Rückg.
          </p>
        )}
      </TD>
      <TD>
        <button onClick={onMark} disabled={periodOpen}
          title={periodOpen ? 'Erst ab dem 1. des Folgemonats abrechenbar.' : undefined}
          className="h-8 px-3 rounded-lg text-[11px] font-medium text-white whitespace-nowrap transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ fontFamily: 'var(--font-league-spartan)', letterSpacing: '0.04em', background: '#370E4D' }}
          onMouseEnter={e => { if (!periodOpen) e.currentTarget.style.background = '#4A1566' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#370E4D' }}>
          {isSepa ? 'SEPA + Abrechnen' : 'Abrechnen'}
        </button>
      </TD>
    </TableRow>
  )
}

// ─── Commission trend chart ───────────────────────────────────────────────────

function CommissionTrend({ data }: { data: typeof TREND_DATA }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="commGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#370E4D" stopOpacity={0.12} />
            <stop offset="100%" stopColor="#370E4D" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 0" stroke="#F0F0EB" vertical={false} />
        <XAxis dataKey="label" tick={{ fontFamily: 'var(--font-league-spartan)', fontSize: 9.5, fill: '#9B9B9B' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontFamily: 'monospace', fontSize: 9.5, fill: '#9B9B9B' }} tickLine={false} axisLine={false} width={48}
          tickFormatter={(v: number) => `€${(v / 1000).toFixed(0)}K`} />
        <Tooltip contentStyle={{ fontFamily: 'var(--font-league-spartan)', fontSize: 11, border: '1px solid #E8E8E8', borderRadius: 0, background: '#fff' }}
          formatter={(v: unknown, name: unknown) => [
            `€ ${Number(v).toLocaleString('de-DE')}`,
            name === 'commission' ? 'Provision brutto' : 'SEPA-Ausgänge',
          ]}
          labelStyle={{ color: '#6B6B6B', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase' }} />
        <Area type="monotone" dataKey="sepa" stroke="#E8E8E8" strokeWidth={1.5} fill="none" dot={false} strokeDasharray="4 3" />
        <Area type="monotone" dataKey="commission" stroke="#370E4D" strokeWidth={2} fill="url(#commGrad)" dot={false}
          activeDot={{ r: 4, fill: '#370E4D', stroke: '#fff', strokeWidth: 2 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Settlements() {
  const [period, setPeriod]         = useState(getDefaultPeriod())
  const [view, setView]             = useState<'open' | 'settled'>('open')
  const [rows, setRows]             = useState<SettlementRow[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [usingMock, setUsingMock]   = useState(false)
  const [confirmRow, setConfirmRow]   = useState<SettlementRow | null>(null)
  const [submitting, setSubmitting]   = useState(false)
  const [generating, setGenerating]   = useState(false)
  const [toast, setToast]             = useState<ToastState | null>(null)
  const [dashboard, setDashboard]     = useState<SettlementDashboard | null>(null)
  const [guideOpen, setGuideOpen]     = useState(false)
  const [trendOpen, setTrendOpen]     = useState(true)
  const [trendData]                   = useState(() => {
    if (typeof window === 'undefined') return TREND_DATA
    try { return JSON.parse(localStorage.getItem(LS_TREND_KEY) ?? 'null') ?? TREND_DATA } catch { return TREND_DATA }
  })

  const periodOpen = isPeriodOpen(period)

  function showToast(msg: string, variant: ToastState['variant']) {
    setToast({ msg, variant }); setTimeout(() => setToast(null), 5000)
  }

  // Version-gated seed — resets localStorage when SEED_VERSION bumps
  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(LS_VER_KEY)
    if (stored !== SEED_VERSION) {
      localStorage.setItem(LS_OPEN_KEY,    JSON.stringify(SEED_OPEN))
      localStorage.setItem(LS_SETTLED_KEY, JSON.stringify(SEED_SETTLED))
      localStorage.setItem(LS_TREND_KEY,   JSON.stringify(TREND_DATA))
      localStorage.setItem(LS_VER_KEY,     SEED_VERSION)
    }
  }, [])

  async function loadRows(p: string, settled: boolean) {
    setLoading(true); setError(null)
    try {
      const data = await settlementApi.getSettlements(p, settled)
      if (data.length > 0) {
        setRows(data); setUsingMock(false)
      } else {
        // Backend returned empty — fall back to seed/preview data if available
        const mock = getMockRows(p, settled)
        setRows(mock); setUsingMock(mock.length > 0)
      }
    } catch {
      setRows(getMockRows(p, settled)); setUsingMock(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRows(period, view === 'settled')
  }, [period, view])

  // Load global payout dashboard stats once on mount
  useEffect(() => {
    settlementApi.getDashboard().then(setDashboard).catch(() => { /* non-critical */ })
  }, [])

  async function handleMarkSettled(ref: string) {
    if (!confirmRow) return
    const row = confirmRow
    setSubmitting(true)
    try {
      await settlementApi.markSettled(row.brandId, period, ref.trim() || undefined, row.id)
      persistOpenRemoval(row.brandId, period, ref.trim())
      setRows(prev => prev.filter(r => r.brandId !== row.brandId))
      // Refresh global dashboard totals
      settlementApi.getDashboard().then(setDashboard).catch(() => {})
      showToast(`${row.brandName} abgerechnet${ref.trim() ? ` · ${ref.trim()}` : ''}.`, 'success')
    } catch (err) {
      if (err instanceof FetchError && err.status === 409) {
        persistOpenRemoval(row.brandId, period, ref.trim())
        setRows(prev => prev.filter(r => r.brandId !== row.brandId))
        showToast(`${row.brandName} war bereits abgerechnet.`, 'warn')
      } else if (err instanceof FetchError && err.status === 422) {
        showToast('Periode noch nicht abgeschlossen.', 'warn')
      } else {
        // Network error / offline — still persist locally
        persistOpenRemoval(row.brandId, period, ref.trim())
        setRows(prev => prev.filter(r => r.brandId !== row.brandId))
        showToast(`${row.brandName} abgerechnet (Offline-Modus)${ref.trim() ? ` · ${ref.trim()}` : ''}.`, 'warn')
      }
    } finally {
      setSubmitting(false); setConfirmRow(null)
    }
  }

  async function handleGenerate() {
    setGenerating(true)
    try {
      const generated = await settlementApi.generateSettlements(period)
      await loadRows(period, false)
      // Refresh dashboard totals after generating
      settlementApi.getDashboard().then(setDashboard).catch(() => {})
      showToast(
        generated.length > 0
          ? `${generated.length} Abrechnungen für ${fmtPeriodLabel(period)} generiert.`
          : `Abrechnungen für ${fmtPeriodLabel(period)} generiert.`,
        'success'
      )
    } catch (err) {
      if (err instanceof FetchError && err.status === 409) {
        showToast('Abrechnungen für diese Periode existieren bereits.', 'warn')
        await loadRows(period, false)
      } else {
        showToast('Generierung fehlgeschlagen — Backend nicht erreichbar.', 'error')
      }
    } finally {
      setGenerating(false)
    }
  }

  const { sepaRows, noSepaRows, sepaTotal, commissionNetTotal, commissionGrossTotal, totalFiktiveVat, rcRows } = useMemo(() => {
    const sepa   = rows.filter(r => r.payoutAmount > 0)
    const noSepa = rows.filter(r => r.payoutAmount <= 0)
    const rc     = rows.filter(r => !r.domestic && !r.isCreditNote)
    return {
      sepaRows: sepa,
      noSepaRows: noSepa,
      rcRows: rc,
      sepaTotal:            sepa.reduce((s, r) => s + r.payoutAmount,    0),
      commissionNetTotal:   rows.reduce((s, r) => s + r.commissionNet,   0),
      commissionGrossTotal: rows.reduce((s, r) => s + r.commissionGross, 0),
      totalFiktiveVat:      rc.reduce((s, r) => s + fiktiveVat(r), 0),
    }
  }, [rows])

  const ytdCommission = dashboard?.totalPaid != null && dashboard.totalPaid > 0
    ? dashboard.totalPaid
    : trendData.filter((d: { label: string }) => d.label.includes('26')).reduce((s: number, d: { commission: number }) => s + d.commission, 0)

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Finanzen"
        title="Monatliche"
        italicTitle="Abrechnung."
        sub="Provision und Auszahlungen je Brand — prüfen, in lexoffice erstellen, als abgerechnet markieren."
      />

      {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}

      {usingMock && (
        <div className="flex items-center gap-2 text-[11px] text-[#7A5C1E] bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5"
          style={{ fontFamily: 'var(--font-league-spartan)' }}>
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          Backend nicht erreichbar — Vorschaudaten aus lokalem Speicher werden angezeigt.
        </div>
      )}

      {/* KPI strip */}
      <KPIGrid>
        <KPICell
          label="SEPA fällig"
          value={fmtEurDe(sepaTotal)}
          sub={`${sepaRows.length} Brand${sepaRows.length !== 1 ? 's' : ''} · ${fmtPeriodLabel(period)}`}
          delta={sepaRows.length > 0 ? `+${sepaRows.length}` : '—'}
          spark={trendData.map((d: { sepa: number }) => d.sepa)}
        />
        <KPICell
          label="Σ Provision brutto"
          value={fmtEurDe(commissionGrossTotal)}
          sub={`Netto: ${fmtEurDe(commissionNetTotal)}`}
          spark={trendData.map((d: { commission: number }) => d.commission)}
        />
        <KPICell
          label="YTD Provision"
          value={`€${(ytdCommission / 1000).toFixed(0)}K`}
          sub="Jan–Mai 2026"
        />
        <KPICell
          label="Brands diesen Monat"
          value={rows.length}
          sub={`${noSepaRows.length > 0 ? `${noSepaRows.length} Gutschrift${noSepaRows.length > 1 ? 'en' : ''}` : 'alle positiv'}`}
          accent
        />
      </KPIGrid>

      {/* Reverse Charge Steuerlast banner — only when RC brands exist in current view */}
      {view === 'open' && !loading && rcRows.length > 0 && (
        <div className="rounded-xl border px-5 py-4"
          style={{ background: 'rgba(122,92,30,0.04)', borderColor: 'rgba(122,92,30,0.25)' }}>
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#7A5C1E' }} />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-1.5"
                  style={{ fontFamily: 'var(--font-league-spartan)', color: '#7A5C1E' }}>
                  Reverse Charge — Steuerlast Finanzamt (§ 13b UStG)
                </p>
                <p className="text-[11.5px] leading-relaxed" style={{ fontFamily: 'var(--font-league-spartan)', color: '#5C4515', maxWidth: 620 }}>
                  Für {rcRows.length} ausländische Brand{rcRows.length > 1 ? 's' : ''} wird keine USt in Rechnung gestellt.
                  Die fiktive 19 %-Steuerlast ({fmtEurDe(totalFiktiveVat)}) bleibt beim Leistungsempfänger — du erfasst diese
                  Umsätze als <strong>steuerfreie sonstige Leistungen EU-Ausland</strong> in der USt-Voranmeldung und der
                  Zusammenfassenden Meldung (ZM). Der Betrag steht in der Spalte <em>Fiktive USt</em> je Brand.
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[9px] uppercase tracking-[0.2em] mb-1" style={{ fontFamily: 'var(--font-league-spartan)', color: '#7A5C1E' }}>
                Gesamte fiktive USt
              </p>
              <p className="tabular-nums font-bold" style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 20, color: '#7A5C1E', lineHeight: 1 }}>
                {fmtEurDe(totalFiktiveVat)}
              </p>
              <p className="text-[9px] mt-1" style={{ fontFamily: 'var(--font-league-spartan)', color: '#9B7B3A' }}>
                nicht eingenommen · USt-Voranmeldung
              </p>
            </div>
          </div>

          {/* Per-brand breakdown */}
          <div className="mt-3 pt-3 border-t flex flex-wrap gap-x-6 gap-y-1"
            style={{ borderColor: 'rgba(122,92,30,0.15)' }}>
            {rcRows.map(r => (
              <div key={r.brandId} className="flex items-center gap-2" style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 11 }}>
                <span style={{ color: '#7A5C1E', fontWeight: 600 }}>{r.brandName}</span>
                <span style={{ color: '#9B9B9B' }}>Netto {fmtEurDe(r.commissionNet)}</span>
                <span style={{ color: '#7A5C1E' }}>→ fikt. USt {fmtEurDe(fiktiveVat(r))}</span>
                {r.vatId
                  ? <span className="font-mono text-[10px]" style={{ color: '#6B6B6B' }}>{r.vatId}</span>
                  : <span style={{ color: '#8B1E3F', fontSize: 10 }}>⚠ keine USt-IdNr</span>
                }
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Commission trend */}
      <div className="rounded-xl border border-[#E8E8E8] overflow-hidden bg-white">
        <button onClick={() => setTrendOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors duration-150"
          style={{ background: trendOpen ? '#FAFAF8' : '#fff' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#F5F5F0' }}
          onMouseLeave={e => { e.currentTarget.style.background = trendOpen ? '#FAFAF8' : '#fff' }}>
          <div className="flex items-center gap-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#6B6B6B]"
              style={{ fontFamily: 'var(--font-league-spartan)' }}>
              Provision &amp; SEPA-Ausgänge — letzte 14 Monate
            </p>
            <div className="flex items-center gap-3" style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 10.5, color: '#9B9B9B' }}>
              <span className="flex items-center gap-1.5">
                <span style={{ width: 16, height: 2, background: '#370E4D', display: 'inline-block' }} />
                Provision brutto
              </span>
              <span className="flex items-center gap-1.5">
                <span style={{ width: 16, height: 0, borderTop: '1.5px dashed #C9C9C9', display: 'inline-block' }} />
                SEPA-Ausgänge
              </span>
            </div>
          </div>
          {trendOpen ? <ChevronUp className="w-4 h-4 text-[#9B9B9B]" /> : <ChevronDown className="w-4 h-4 text-[#9B9B9B]" />}
        </button>
        {trendOpen && (
          <div className="px-5 pb-4 pt-2 border-t border-[#F0F0EB]">
            <CommissionTrend data={trendData} />
          </div>
        )}
      </div>

      {/* Workflow guide */}
      <div className="rounded-xl border border-[#E8E8E8] overflow-hidden">
        <button onClick={() => setGuideOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors duration-150"
          style={{ background: guideOpen ? '#F5F5F0' : '#FAFAF8' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#F5F5F0' }}
          onMouseLeave={e => { e.currentTarget.style.background = guideOpen ? '#F5F5F0' : '#FAFAF8' }}>
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#6B6B6B]"
            style={{ fontFamily: 'var(--font-league-spartan)' }}>
            Workflow · Manueller Abrechnungsablauf
          </p>
          {guideOpen ? <ChevronUp className="w-4 h-4 text-[#9B9B9B]" /> : <ChevronDown className="w-4 h-4 text-[#9B9B9B]" />}
        </button>
        {guideOpen && (
          <div className="px-5 py-4 bg-white border-t border-[#F0F0EB] space-y-3">
            {([
              { n: '1', t: 'Zahlen prüfen. Badge zeigt Belegtyp: Inland (inkl. 19 % USt), Reverse Charge (Netto) oder Gutschrift.' },
              { n: '2', t: 'Beleg in lexoffice erstellen. Werte per Copy-Button übernehmen — verhindert Tippfehler.' },
              { n: '3', t: 'Für RC-Brands: Fiktive USt-Spalte beachten. Netto-Umsatz in USt-Voranmeldung und ZM eintragen — du erhältst kein Geld, musst es aber melden.' },
              { n: '4', t: 'Auszahlung per SEPA überweisen — nur wenn payoutAmount positiv.' },
              { n: '5', t: 'Hier „Als abgerechnet markieren" mit optionaler Rechnungsreferenz.' },
            ] as { n: string; t: string }[]).map(({ n, t }) => (
              <div key={n} className="flex gap-3">
                <span className="w-5 h-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: '#370E4D', fontFamily: 'var(--font-league-spartan)' }}>{n}</span>
                <p className="text-[12px] text-[#2D2D2D] leading-relaxed" style={{ fontFamily: 'var(--font-league-spartan)' }}>{t}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs + period */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="inline-flex rounded-lg border border-[#E8E8E8] overflow-hidden">
          {([
            { id: 'open',    label: 'Offen',       icon: null },
            { id: 'settled', label: 'Abgerechnet', icon: <History className="w-3 h-3" /> },
          ] as { id: 'open' | 'settled'; label: string; icon: React.ReactNode }[]).map(tab => (
            <button key={tab.id} onClick={() => { setView(tab.id); setRows([]) }}
              className="inline-flex items-center gap-1.5 h-9 px-4 text-[11px] font-medium transition-all duration-150"
              style={{
                fontFamily: 'var(--font-league-spartan)', letterSpacing: '0.06em',
                background: view === tab.id ? '#370E4D' : '#fff',
                color:      view === tab.id ? '#fff'    : '#6B6B6B',
              }}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {periodOpen && (
            <div className="flex items-center gap-2 text-[11px] text-[#7A5C1E] bg-amber-50 border border-amber-200 rounded-lg px-3 py-2"
              style={{ fontFamily: 'var(--font-league-spartan)' }}>
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              Periode noch nicht abgeschlossen — Markieren gesperrt.
            </div>
          )}
          <div>
            <label className="block text-[10px] uppercase tracking-[0.12em] text-[#6B6B6B] font-medium mb-1"
              style={{ fontFamily: 'var(--font-league-spartan)' }}>
              Periode
            </label>
            <input type="month" value={period} max={getCurrentPeriod()}
              onChange={e => { if (e.target.value) setPeriod(e.target.value) }}
              className="h-9 px-3 text-[13px] border border-[#E8E8E8] bg-white rounded-lg focus:outline-none focus:border-[#370E4D]/40 transition-all duration-200"
              style={{ fontFamily: 'var(--font-league-spartan)' }} />
          </div>
          {view === 'open' && (
            <div>
              <label className="block text-[10px] uppercase tracking-[0.12em] text-[#6B6B6B] font-medium mb-1 opacity-0"
                style={{ fontFamily: 'var(--font-league-spartan)' }}>
                &nbsp;
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerate}
                  disabled={generating || loading}
                  title="Auszahlungen für diesen Monat im Backend berechnen und anlegen"
                  className="h-9 inline-flex items-center gap-2 px-4 rounded-lg text-[11px] font-medium border border-[#E8E8E8] bg-white text-[#6B6B6B] hover:border-[#370E4D]/40 hover:text-[#370E4D] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'var(--font-league-spartan)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
                  {generating ? 'Generiert…' : 'Generieren'}
                </button>
                <button
                  onClick={() => loadRows(period, false)}
                  disabled={loading}
                  title="Ansicht neu laden"
                  className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-[#9B9B9B] border border-[#E8E8E8] bg-white hover:border-[#370E4D]/40 hover:text-[#370E4D] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed">
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary cards — open view */}
      {view === 'open' && !loading && rows.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-xl border px-4 py-3.5" style={{ background: 'rgba(26,90,60,0.06)', borderColor: 'rgba(26,90,60,0.2)' }}>
            <p className="text-[9px] uppercase tracking-[0.14em] mb-1 text-[#1A5A3C]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
              SEPA fällig · {sepaRows.length} Brand{sepaRows.length !== 1 ? 's' : ''}
            </p>
            <p className="text-[18px] font-bold tabular-nums leading-none text-[#1A5A3C]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
              {fmtEurDe(sepaTotal)}
            </p>
            <p className="text-[10px] text-[#1A5A3C]/60 mt-1" style={{ fontFamily: 'var(--font-league-spartan)' }}>jetzt überweisen</p>
          </div>
          <div className="rounded-xl border border-[#E8E8E8] bg-white px-4 py-3.5">
            <p className="text-[9px] uppercase tracking-[0.14em] mb-1 text-[#9B9B9B]" style={{ fontFamily: 'var(--font-league-spartan)' }}>Σ Provision netto</p>
            <p className="text-[18px] font-semibold tabular-nums leading-none" style={{ fontFamily: 'var(--font-league-spartan)', color: commissionNetTotal < 0 ? '#8B1E3F' : '#0A0A0A' }}>
              {fmtEurDe(commissionNetTotal)}
            </p>
          </div>
          <div className="rounded-xl border px-4 py-3.5" style={{ background: 'rgba(122,92,30,0.04)', borderColor: 'rgba(122,92,30,0.2)' }}>
            <p className="text-[9px] uppercase tracking-[0.14em] mb-1" style={{ fontFamily: 'var(--font-league-spartan)', color: '#7A5C1E' }}>
              Fiktive USt (RC) · {rcRows.length} Brand{rcRows.length !== 1 ? 's' : ''}
            </p>
            <p className="text-[18px] font-semibold tabular-nums leading-none" style={{ fontFamily: 'var(--font-league-spartan)', color: '#7A5C1E' }}>
              {fmtEurDe(totalFiktiveVat)}
            </p>
            <p className="text-[10px] mt-1" style={{ fontFamily: 'var(--font-league-spartan)', color: '#9B7B3A' }}>§ 13b · USt-Voranmeldung</p>
          </div>
          <div className="rounded-xl border px-4 py-3.5" style={{ background: '#370E4D', borderColor: '#370E4D' }}>
            <p className="text-[9px] uppercase tracking-[0.14em] mb-1" style={{ fontFamily: 'var(--font-league-spartan)', color: 'rgba(255,255,255,0.45)' }}>Σ Provision brutto</p>
            <p className="text-[18px] font-bold tabular-nums leading-none text-white" style={{ fontFamily: 'var(--font-league-spartan)' }}>
              {fmtEurDe(commissionGrossTotal)}
            </p>
          </div>
        </div>
      )}

      {/* Settled view */}
      {view === 'settled' && (
        <SectionCard title="Abgerechnete Rechnungen" count={rows.length}>
          {loading ? <Loader /> : rows.length === 0 ? (
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
                    <TH right>Fiktive USt 19%</TH>
                    <TH right>Auszahlung</TH>
                    <TH>Abgerechnet am</TH>
                    <TH>Referenz</TH>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => <HistoryTableRow key={row.brandId} row={row} />)}
                </tbody>
              </table>
              <div className="flex justify-end gap-8 px-5 py-3 border-t border-[#F0F0EB] bg-[#FAFAF8]">
                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-[0.18em] text-[#9B9B9B] mb-1" style={{ fontFamily: 'var(--font-league-spartan)' }}>Ausgegangen (SEPA)</p>
                  <p className="text-[15px] font-semibold tabular-nums text-[#1A5A3C]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                    {fmtEurDe(rows.filter(r => r.payoutAmount > 0).reduce((s, r) => s + r.payoutAmount, 0))}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-[0.18em] text-[#9B9B9B] mb-1" style={{ fontFamily: 'var(--font-league-spartan)' }}>Fiktive USt (RC)</p>
                  <p className="text-[15px] font-semibold tabular-nums" style={{ fontFamily: 'var(--font-league-spartan)', color: '#7A5C1E' }}>
                    {fmtEurDe(rows.filter(r => !r.domestic && !r.isCreditNote).reduce((s, r) => s + fiktiveVat(r), 0))}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-[0.18em] text-[#9B9B9B] mb-1" style={{ fontFamily: 'var(--font-league-spartan)' }}>Σ Provision brutto</p>
                  <p className="text-[15px] font-bold tabular-nums text-[#370E4D]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                    {fmtEurDe(rows.reduce((s, r) => s + r.commissionGross, 0))}
                  </p>
                </div>
              </div>
            </div>
          )}
        </SectionCard>
      )}

      {/* Open settlements table */}
      {view === 'open' && (
        <SectionCard title="Offene Abrechnungen" count={rows.length}>
          {loading ? <Loader /> : error ? (
            <div className="py-12 text-center">
              <p className="text-[12px] text-[#8B1E3F]" style={{ fontFamily: 'var(--font-league-spartan)' }}>{error}</p>
              <button onClick={() => loadRows(period, false)}
                className="mt-3 text-[11px] text-[#370E4D] underline" style={{ fontFamily: 'var(--font-league-spartan)' }}>
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
                    <TH right>
                      <span style={{ color: '#7A5C1E' }}>Fiktive USt 19%</span>
                    </TH>
                    <TH right>Auszahlung</TH>
                    <TH>Orders</TH>
                    <TH>Aktion</TH>
                  </tr>
                </thead>
                <tbody>
                  {sepaRows.length > 0 && (
                    <tr>
                      <td colSpan={10} style={{ background: 'rgba(26,90,60,0.06)', borderTop: '2px solid rgba(26,90,60,0.15)', borderBottom: '1px solid rgba(26,90,60,0.12)', padding: '8px 20px' }}>
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#1A5A3C]"
                            style={{ fontFamily: 'var(--font-league-spartan)' }}>
                            <Check className="w-3 h-3" /> SEPA-Überweisung fällig
                          </span>
                          <span className="text-[10px] text-[#1A5A3C]/60" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                            {sepaRows.length} Brand{sepaRows.length !== 1 ? 's' : ''} · {fmtEurDe(sepaTotal)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                  {sepaRows.map(row => (
                    <SettlementTableRow key={row.brandId} row={row} periodOpen={periodOpen} onMark={() => setConfirmRow(row)} isSepa />
                  ))}

                  {noSepaRows.length > 0 && (
                    <tr>
                      <td colSpan={10} style={{ background: 'rgba(139,30,63,0.04)', borderTop: '2px solid rgba(139,30,63,0.12)', borderBottom: '1px solid rgba(139,30,63,0.08)', padding: '8px 20px' }}>
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8B1E3F]"
                            style={{ fontFamily: 'var(--font-league-spartan)' }}>
                            <X className="w-3 h-3" /> Kein SEPA-Ausgang
                          </span>
                          <span className="text-[10px] text-[#8B1E3F]/60" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                            {noSepaRows.length} Brand{noSepaRows.length !== 1 ? 's' : ''} · outstandingDebt
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                  {noSepaRows.map(row => (
                    <SettlementTableRow key={row.brandId} row={row} periodOpen={periodOpen} onMark={() => setConfirmRow(row)} isSepa={false} />
                  ))}
                </tbody>
              </table>

              {/* Table footer totals */}
              <div className="flex justify-end gap-8 px-5 py-3 border-t border-[#F0F0EB] bg-[#FAFAF8]">
                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-[0.18em] text-[#9B9B9B] mb-1" style={{ fontFamily: 'var(--font-league-spartan)' }}>SEPA-Ausgang</p>
                  <p className="text-[15px] font-semibold tabular-nums text-[#1A5A3C]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                    {fmtEurDe(sepaTotal)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-[0.18em] mb-1" style={{ fontFamily: 'var(--font-league-spartan)', color: '#7A5C1E' }}>
                    Fiktive USt (§ 13b)
                  </p>
                  <p className="text-[15px] font-semibold tabular-nums" style={{ fontFamily: 'var(--font-league-spartan)', color: '#7A5C1E' }}>
                    {fmtEurDe(totalFiktiveVat)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-[0.18em] text-[#9B9B9B] mb-1" style={{ fontFamily: 'var(--font-league-spartan)' }}>Σ Provision brutto</p>
                  <p className="text-[15px] font-bold tabular-nums text-[#370E4D]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                    {fmtEurDe(commissionGrossTotal)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </SectionCard>
      )}

      {confirmRow && (
        <ConfirmDialog row={confirmRow} period={period}
          onConfirm={handleMarkSettled} onCancel={() => setConfirmRow(null)} submitting={submitting} />
      )}
    </div>
  )
}
