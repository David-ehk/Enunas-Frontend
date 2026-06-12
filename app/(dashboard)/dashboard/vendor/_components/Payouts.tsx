'use client'

import { useState, useEffect, useMemo } from 'react'
import { brandApi } from '@/lib/api/modules/brandApi'
import type { AdminPayout } from '@/types/api'
import {
  VPageHeader, VKPIGrid, VKPI, VCard, VStatus, VTH, VTD, VTR,
  fmt, Loader, EmptyState,
} from './vshared'
import { RefreshCw } from 'lucide-react'

// Lebenszyklus (vom Admin gesteuert): PENDING → APPROVED → PAID (oder CANCELLED).
// PAID = der Admin hat die SEPA-Überweisung bestätigt — Geld ist unterwegs/eingegangen.
const STATUS_META: Record<string, { label: string; tone: 'warn' | 'purple' | 'success' | 'muted' | 'error'; hint: string }> = {
  PENDING:   { label: 'Angekündigt',  tone: 'warn',    hint: 'wartet auf Freigabe durch Enunas' },
  APPROVED:  { label: 'Freigegeben',  tone: 'purple',  hint: 'Überweisung wird ausgeführt' },
  PAID:      { label: 'Überwiesen',   tone: 'success', hint: 'Zahlung ist bei dir eingegangen' },
  CANCELLED: { label: 'Storniert',    tone: 'muted',   hint: '' },
}

function fmtEur2(v: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(v)
}

export default function Payouts() {
  const [payouts, setPayouts] = useState<AdminPayout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  function load() {
    setLoading(true); setError(null)
    brandApi.payouts.getMine()
      .then(setPayouts)
      .catch(() => setError('Auszahlungen konnten nicht geladen werden — bitte neu laden.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const { openTotal, openCount, paidTotal, paidCount, lastPaid } = useMemo(() => {
    const open = payouts.filter(p => p.status === 'PENDING' || p.status === 'APPROVED')
    const paid = payouts.filter(p => p.status === 'PAID')
    const lastPaid = paid
      .filter(p => p.paidAt)
      .sort((a, b) => new Date(b.paidAt!).getTime() - new Date(a.paidAt!).getTime())[0] ?? null
    return {
      openTotal: open.reduce((s, p) => s + p.amount, 0),
      openCount: open.length,
      paidTotal: paid.reduce((s, p) => s + p.amount, 0),
      paidCount: paid.length,
      lastPaid,
    }
  }, [payouts])

  if (loading) return <Loader />

  return (
    <div className="space-y-4">
      <VPageHeader
        eyebrow="Brand Portal"
        title="Auszahlungen"
        sub={'Deine Auszahlungen — live aus der Enunas-Abrechnung. Sobald Enunas die Überweisung bestätigt, erscheint sie hier als „Überwiesen" mit Bankreferenz.'}
        actions={
          <button onClick={load} disabled={loading} title="Neu laden"
            className="h-8 w-8 inline-flex items-center justify-center border border-[#E8E8E8] bg-white text-[#9B9B9B] hover:text-[#370E4D] hover:border-[#370E4D]/40 transition-all duration-200 disabled:opacity-40">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        }
      />

      {error && (
        <div className="text-[12px] px-4 py-3 border"
          style={{ fontFamily: 'var(--font-league-spartan)', color: '#8B1E3F', background: 'rgba(139,30,63,0.06)', borderColor: 'rgba(139,30,63,0.2)' }}>
          {error}
        </div>
      )}

      <VKPIGrid cols={4}>
        <VKPI label="Offen / unterwegs" value={fmtEur2(openTotal)} delta={`${openCount} Auszahlung${openCount !== 1 ? 'en' : ''}`} deltaTone={openCount > 0 ? 'up' : 'muted'} />
        <VKPI label="Erhalten gesamt"   value={fmtEur2(paidTotal)} delta={`${paidCount} Überweisung${paidCount !== 1 ? 'en' : ''}`} deltaTone="muted" />
        <VKPI label="Letzte Zahlung"    value={lastPaid ? fmtEur2(lastPaid.amount) : '—'} delta={lastPaid?.paidAt ? `am ${fmt(lastPaid.paidAt)}` : 'noch keine'} deltaTone="muted" />
        <VKPI label="Auszahlungen"      value={payouts.length} delta="gesamt" deltaTone="muted" />
      </VKPIGrid>

      <VCard eyebrow="Verlauf" title="Auszahlungen" flush>
        {payouts.length === 0 ? (
          <EmptyState message="Noch keine Auszahlungen — sie werden von Enunas aus deinem Guthaben erzeugt, sobald Verkäufe abgerechnet sind." />
        ) : (
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <VTH>Angekündigt am</VTH>
                <VTH right>Betrag</VTH>
                <VTH>Konto</VTH>
                <VTH>Status</VTH>
                <VTH>Überwiesen am</VTH>
                <VTH>Bankreferenz</VTH>
              </tr>
            </thead>
            <tbody>
              {payouts.map(p => {
                const meta = STATUS_META[p.status] ?? { label: p.status, tone: 'muted' as const, hint: '' }
                return (
                  <VTR key={p.id}>
                    <VTD muted>{fmt(p.createdAt)}</VTD>
                    <VTD right>
                      <span style={{ fontFamily: 'var(--font-league-spartan)', fontWeight: 600, color: '#0A0A0A' }}>
                        {fmtEur2(p.amount)}
                      </span>
                      {(p.debtAbsorbed ?? 0) > 0 && (
                        <p style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 10, color: '#9B9B9B', marginTop: 2 }}>
                          {fmtEur2(p.debtAbsorbed!)} mit offenem Saldo verrechnet
                        </p>
                      )}
                    </VTD>
                    <VTD>
                      <span className="font-mono" style={{ fontSize: 11, color: '#2D2D2D' }}>{p.iban ?? '—'}</span>
                      {p.bankAccountHolder && (
                        <p style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 10, color: '#9B9B9B', marginTop: 2 }}>
                          {p.bankAccountHolder}
                        </p>
                      )}
                    </VTD>
                    <VTD>
                      <VStatus tone={meta.tone}>{meta.label}</VStatus>
                      {meta.hint && (
                        <p style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 10, color: '#9B9B9B', marginTop: 3 }}>
                          {meta.hint}
                        </p>
                      )}
                    </VTD>
                    <VTD muted>{p.paidAt ? fmt(p.paidAt) : '—'}</VTD>
                    <VTD>
                      {p.externalReference
                        ? <span className="font-mono" style={{ fontSize: 11, color: '#2D2D2D' }}>{p.externalReference}</span>
                        : <span style={{ color: '#C9C9C9' }}>—</span>}
                    </VTD>
                  </VTR>
                )
              })}
            </tbody>
          </table>
        )}
      </VCard>
    </div>
  )
}
