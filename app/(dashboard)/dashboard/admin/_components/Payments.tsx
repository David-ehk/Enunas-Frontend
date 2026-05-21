'use client'

import React, { useState, useEffect } from 'react'
import { adminApi } from '@/lib/api'
import type { AdminPayout, PayoutDashboard } from '@/types/api'
import { StatCard, SectionCard, StatusBadge, EmptyState, Loader, FilterBar, InlineInput, TH, TD, TableRow, fmt, fmtEur } from './shared'
import { CreditCard, CheckCircle, XCircle, Zap } from 'lucide-react'

const FILTERS = [
  { id: 'all',       label: 'Alle' },
  { id: 'PENDING',   label: 'Ausstehend' },
  { id: 'APPROVED',  label: 'Genehmigt' },
  { id: 'PAID',      label: 'Bezahlt' },
  { id: 'CANCELLED', label: 'Storniert' },
]

function ActionBtn({
  onClick, disabled, variant, children,
}: {
  onClick: () => void
  disabled?: boolean
  variant: 'danger' | 'success' | 'sky' | 'ghost'
  children: React.ReactNode
}) {
  const styles = {
    danger:  'border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600',
    success: 'border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600',
    sky:     'border-sky-200 text-sky-700 hover:bg-sky-500 hover:text-white hover:border-sky-500',
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

export default function Payments() {
  const [payouts, setPayouts]     = useState<AdminPayout[]>([])
  const [dashboard, setDashboard] = useState<PayoutDashboard | null>(null)
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState<string>('all')
  const [acting, setActing]       = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [refInput, setRefInput]   = useState<string>('')
  const [payingId, setPayingId]   = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      adminApi.payouts.getAll().catch(() => []),
      adminApi.payouts.getDashboard().catch(() => null),
    ]).then(([p, d]) => {
      setPayouts(p); setDashboard(d)
    }).finally(() => setLoading(false))
  }, [])

  const visible = filter === 'all' ? payouts : payouts.filter(p => p.status === filter)

  const totalPending   = payouts.filter(p => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0)
  const totalPaid      = payouts.filter(p => p.status === 'PAID').reduce((s, p) => s + p.amount, 0)
  const totalCancelled = payouts.filter(p => p.status === 'CANCELLED').reduce((s, p) => s + p.amount, 0)
  const successRate    = payouts.length > 0
    ? Math.round((payouts.filter(p => p.status === 'PAID').length / payouts.length) * 100)
    : 0

  async function approvePayout(id: string) {
    setActing(id)
    try {
      await adminApi.payouts.approve(id)
      setPayouts(prev => prev.map(p => p.id === id ? { ...p, status: 'APPROVED' } : p))
    } catch { /* silent */ } finally { setActing(null) }
  }

  async function cancelPayout(id: string) {
    setActing(id)
    try {
      await adminApi.payouts.cancel(id)
      setPayouts(prev => prev.map(p => p.id === id ? { ...p, status: 'CANCELLED' } : p))
    } catch { /* silent */ } finally { setActing(null) }
  }

  async function markPaid(id: string) {
    if (!refInput.trim()) return
    setActing(id)
    try {
      await adminApi.payouts.markPaid(id, refInput.trim())
      setPayouts(prev => prev.map(p => p.id === id ? { ...p, status: 'PAID' } : p))
      setPayingId(null); setRefInput('')
    } catch { /* silent */ } finally { setActing(null) }
  }

  async function generate() {
    setGenerating(true)
    try {
      const newPayouts = await adminApi.payouts.generate()
      setPayouts(prev => [...newPayouts, ...prev])
    } catch { /* silent */ } finally { setGenerating(false) }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard accent
          label="Ausstehend"
          value={fmtEur(dashboard?.totalPending ?? totalPending)}
          sub={`${payouts.filter(p => p.status === 'PENDING').length} Payouts`}
          icon={<CreditCard className="w-3 h-3" />}
        />
        <StatCard
          label="Ausgezahlt"
          value={fmtEur(dashboard?.totalPaid ?? totalPaid)}
          sub={`${payouts.filter(p => p.status === 'PAID').length} Payouts`}
        />
        <StatCard
          label="Erfolgsrate"
          value={`${successRate}%`}
          sub="Bezahlt / Gesamt"
        />
        <StatCard
          label="Storniert"
          value={fmtEur(dashboard?.totalCancelled ?? totalCancelled)}
          sub={`${payouts.filter(p => p.status === 'CANCELLED').length} Payouts`}
        />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <FilterBar options={FILTERS} value={filter} onChange={setFilter} />
        <button
          disabled={generating}
          onClick={generate}
          className="ml-auto inline-flex items-center gap-1.5 h-8 px-3.5 rounded-xl text-[11px] font-medium border border-[#370E4D]/30 text-[#370E4D] hover:bg-[#370E4D] hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontFamily: 'var(--font-league-spartan)' }}
        >
          <Zap className="w-3 h-3" />
          {generating ? 'Generiert…' : 'Payouts generieren'}
        </button>
      </div>

      <SectionCard title="Payouts" count={visible.length}>
        {loading ? <Loader /> : visible.length === 0 ? <EmptyState message="Keine Payouts gefunden." /> : (
          <table className="w-full">
            <thead>
              <tr>
                <TH>Payout-ID</TH>
                <TH>Marke</TH>
                <TH>Betrag</TH>
                <TH>Währung</TH>
                <TH>Status</TH>
                <TH>Erstellt</TH>
                <TH>Ausgezahlt</TH>
                <TH>Aktionen</TH>
              </tr>
            </thead>
            <tbody>
              {visible.map(payout => (
                <React.Fragment key={payout.id}>
                  <TableRow>
                    <TD className="font-mono text-[11px] text-[#9B9B9B]">{payout.id.slice(0, 12)}…</TD>
                    <TD className="font-medium text-[#0A0A0A]">{payout.brandName || '—'}</TD>
                    <TD className="font-medium text-[#0A0A0A]">{fmtEur(payout.amount)}</TD>
                    <TD className="font-mono text-[11px] text-[#9B9B9B] uppercase">{payout.currency}</TD>
                    <TD><StatusBadge status={payout.status} /></TD>
                    <TD className="text-[#6B6B6B]">{fmt(payout.createdAt)}</TD>
                    <TD className="text-[#6B6B6B]">{payout.paidAt ? fmt(payout.paidAt) : '—'}</TD>
                    <TD>
                      <div className="flex items-center gap-1">
                        {payout.status === 'PENDING' && (
                          <ActionBtn variant="success" disabled={acting === payout.id} onClick={() => approvePayout(payout.id)}>
                            <CheckCircle className="w-3 h-3" /> Genehmigen
                          </ActionBtn>
                        )}
                        {payout.status === 'APPROVED' && payingId !== payout.id && (
                          <ActionBtn variant="sky" disabled={acting === payout.id} onClick={() => setPayingId(payout.id)}>
                            Als bezahlt markieren
                          </ActionBtn>
                        )}
                        {payout.status !== 'CANCELLED' && payout.status !== 'PAID' && (
                          <ActionBtn variant="danger" disabled={acting === payout.id} onClick={() => cancelPayout(payout.id)}>
                            <XCircle className="w-3 h-3" />
                          </ActionBtn>
                        )}
                      </div>
                    </TD>
                  </TableRow>

                  {payingId === payout.id && (
                    <tr className="border-b border-[#F0F0EB]" style={{ background: '#EFF6FF' }}>
                      <td colSpan={8} className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <InlineInput
                            value={refInput}
                            onChange={setRefInput}
                            onKeyDown={e => e.key === 'Enter' && markPaid(payout.id)}
                            placeholder="Zahlungsreferenz / Transfer-ID…"
                            autoFocus
                          />
                          <button
                            onClick={() => markPaid(payout.id)}
                            className="inline-flex items-center h-8 px-3.5 rounded-xl text-[11px] font-medium text-white transition-all duration-200"
                            style={{ fontFamily: 'var(--font-league-spartan)', background: '#370E4D' }}
                          >
                            Bestätigen
                          </button>
                          <button
                            onClick={() => { setPayingId(null); setRefInput('') }}
                            className="inline-flex items-center h-8 px-3 rounded-xl text-[11px] font-medium text-[#6B6B6B] hover:text-[#0A0A0A] transition-all duration-200"
                            style={{ fontFamily: 'var(--font-league-spartan)' }}
                          >
                            Abbrechen
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </SectionCard>
    </div>
  )
}
