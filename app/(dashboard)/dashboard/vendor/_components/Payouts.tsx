'use client'

import { useState, useEffect } from 'react'
import {
  VPageHeader, VKPIGrid, VKPI, VCard, WaterfallChart, GaugeArc,
  Grid21, Grid2, VStatus, VTH, VTD, VTR, fmtEur, fmtK, fmtPct,
  VAreaChart, DonutMulti, VBtn,
} from './vshared'

// ─── Types ────────────────────────────────────────────────────────────────────
interface PayoutStatement {
  id: string
  period: string          // e.g. "Mai 2026"
  periodKey: string       // e.g. "2026-05"
  gross: number
  commission: number      // platform fee
  returns: number         // return deductions
  adjustments: number     // other adjustments
  net: number
  status: 'paid' | 'processing' | 'pending'
  paidDate?: string
  iban?: string
}

interface CurrentMonthData {
  orders: number
  grossRevenue: number
  returnRate: number
  pendingOrders: number
}

// ─── Seed data ────────────────────────────────────────────────────────────────
const SEED_STATEMENTS: PayoutStatement[] = [
  { id: 'PAY-082', period: 'Apr 2026', periodKey: '2026-04', gross: 16840, commission: 3031, returns: 841, adjustments: 0,   net: 12968, status: 'paid',       paidDate: '28. Apr 2026' },
  { id: 'PAY-081', period: 'Mär 2026', periodKey: '2026-03', gross: 14620, commission: 2632, returns: 612, adjustments: 0,   net: 11376, status: 'paid',       paidDate: '28. Mär 2026' },
  { id: 'PAY-080', period: 'Feb 2026', periodKey: '2026-02', gross: 11980, commission: 2156, returns: 489, adjustments: 120, net: 9215,  status: 'paid',       paidDate: '28. Feb 2026' },
  { id: 'PAY-079', period: 'Jan 2026', periodKey: '2026-01', gross: 13240, commission: 2383, returns: 730, adjustments: 0,   net: 10127, status: 'paid',       paidDate: '28. Jan 2026' },
  { id: 'PAY-078', period: 'Dez 2025', periodKey: '2025-12', gross: 19840, commission: 3571, returns: 980, adjustments: 0,   net: 15289, status: 'paid',       paidDate: '28. Dez 2025' },
  { id: 'PAY-077', period: 'Nov 2025', periodKey: '2025-11', gross: 17200, commission: 3096, returns: 840, adjustments: 200, net: 13064, status: 'paid',       paidDate: '28. Nov 2025' },
  { id: 'PAY-076', period: 'Okt 2025', periodKey: '2025-10', gross: 15640, commission: 2815, returns: 720, adjustments: 0,   net: 12105, status: 'paid',       paidDate: '28. Okt 2025' },
  { id: 'PAY-075', period: 'Sep 2025', periodKey: '2025-09', gross: 12480, commission: 2246, returns: 560, adjustments: 80,  net: 9594,  status: 'paid',       paidDate: '28. Sep 2025' },
  { id: 'PAY-074', period: 'Aug 2025', periodKey: '2025-08', gross: 9820,  commission: 1768, returns: 410, adjustments: 0,   net: 7642,  status: 'paid',       paidDate: '28. Aug 2025' },
  { id: 'PAY-073', period: 'Jul 2025', periodKey: '2025-07', gross: 8260,  commission: 1487, returns: 340, adjustments: 0,   net: 6433,  status: 'paid',       paidDate: '28. Jul 2025' },
  { id: 'PAY-072', period: 'Jun 2025', periodKey: '2025-06', gross: 6840,  commission: 1231, returns: 280, adjustments: 0,   net: 5329,  status: 'paid',       paidDate: '28. Jun 2025' },
  { id: 'PAY-071', period: 'Mai 2025', periodKey: '2025-05', gross: 5400,  commission: 972,  returns: 210, adjustments: 0,   net: 4218,  status: 'paid',       paidDate: '28. Mai 2025' },
]

const SEED_CURRENT: CurrentMonthData = {
  orders: 47,
  grossRevenue: 18420,
  returnRate: 4.8,
  pendingOrders: 8,
}

const LS_KEY_STATEMENTS = 'enunas_vendor_payout_statements'
const LS_KEY_CURRENT    = 'enunas_vendor_payout_current'

function loadOrSeed<T>(key: string, seed: T): T {
  if (typeof window === 'undefined') return seed
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw) as T
    localStorage.setItem(key, JSON.stringify(seed))
    return seed
  } catch {
    return seed
  }
}

const YTD_GOAL = 120_000

// ─── Pending statement for current month ─────────────────────────────────────
function buildCurrentStatement(cur: CurrentMonthData): PayoutStatement {
  const commission  = Math.round(cur.grossRevenue * 0.18)
  const returns     = Math.round(cur.grossRevenue * (cur.returnRate / 100))
  const net         = cur.grossRevenue - commission - returns
  return {
    id: 'PAY-083',
    period: 'Mai 2026',
    periodKey: '2026-05',
    gross: cur.grossRevenue,
    commission,
    returns,
    adjustments: 0,
    net,
    status: 'processing',
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Payouts() {
  const [statements, setStatements] = useState<PayoutStatement[]>([])
  const [current, setCurrent]       = useState<CurrentMonthData>(SEED_CURRENT)
  const [hydrated, setHydrated]     = useState(false)

  useEffect(() => {
    setStatements(loadOrSeed(LS_KEY_STATEMENTS, SEED_STATEMENTS))
    setCurrent(loadOrSeed(LS_KEY_CURRENT, SEED_CURRENT))
    setHydrated(true)
  }, [])

  if (!hydrated) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 rounded-full border-2 border-[#E8E8E8] border-t-[#370E4D] animate-spin" />
      </div>
    )
  }

  const currentStmt = buildCurrentStatement(current)

  // KPI calculations
  const ytdGross   = statements.filter(s => s.periodKey.startsWith('2026')).reduce((a, s) => a + s.gross, 0) + currentStmt.gross
  const ytdNet     = statements.filter(s => s.periodKey.startsWith('2026')).reduce((a, s) => a + s.net,   0) + currentStmt.net
  const ytdPct     = Math.min(99, Math.round((ytdGross / YTD_GOAL) * 100))
  const avgNet     = Math.round(ytdNet / (statements.filter(s => s.periodKey.startsWith('2026')).length + 1))

  // Waterfall for current month
  const waterfall = [
    { label: 'Brutto',        value: currentStmt.gross,       type: 'base'  as const },
    { label: 'Provision 18%', value: currentStmt.commission,  type: 'sub'   as const },
    { label: 'Rücksendungen', value: currentStmt.returns,     type: 'sub'   as const },
    { label: 'Netto',         value: currentStmt.net,         type: 'total' as const },
  ]

  // Trend chart — last 12 statements (oldest → newest) + current
  const trendData    = [...statements].reverse()
  const trendLabels  = [...trendData.map(s => s.period.split(' ')[0]), 'Mai']
  const trendGross   = [...trendData.map(s => s.gross),  currentStmt.gross]
  const trendNet     = [...trendData.map(s => s.net),    currentStmt.net]

  // Donut for deduction split (current month)
  const donutSegments = [
    { label: 'Netto',         value: currentStmt.net,         color: '#370E4D' },
    { label: 'Provision',     value: currentStmt.commission,  color: '#C9B8D6' },
    { label: 'Rücksendungen', value: currentStmt.returns,     color: '#8B1E3F' },
  ]

  const allRows = [currentStmt, ...statements]

  return (
    <div className="space-y-4">
      <VPageHeader
        eyebrow="Brand Portal"
        title="Auszahlungen"
        italicTitle="Mai 2026"
        sub="Umsatz, Abzüge und Netto-Auszahlungen in der Übersicht."
      />

      {/* KPI strip */}
      <VKPIGrid cols={4}>
        <VKPI
          label="Brutto MTD"
          value={fmtK(currentStmt.gross)}
          delta={`${current.orders} Bestellungen`}
          deltaTone="muted"
          spark={trendGross.slice(-6)}
        />
        <VKPI
          label="Nächste Auszahlung"
          value={fmtK(currentStmt.net)}
          delta="~28. Mai 2026"
          deltaTone="muted"
        />
        <VKPI
          label="Ø Monatsnetto"
          value={fmtK(avgNet)}
          delta="Ø 2026"
          deltaTone="muted"
          spark={trendNet.slice(-6)}
        />
        <VKPI
          label="YTD Brutto"
          value={fmtK(ytdGross)}
          delta={`Ziel: ${fmtK(YTD_GOAL)}`}
          deltaTone={ytdPct >= 80 ? 'up' : 'muted'}
        />
      </VKPIGrid>

      {/* Current month breakdown + gauge */}
      <Grid21>
        <VCard eyebrow="Aktueller Monat" title="Auszahlungsstruktur — Mai 2026">
          <WaterfallChart steps={waterfall} fmt={fmtEur} height={260} />
        </VCard>

        <div className="space-y-4">
          <VCard eyebrow="Jahresziel 2026" title="YTD-Fortschritt">
            <div className="flex justify-center py-4">
              <GaugeArc
                pct={ytdPct}
                label="Jahresziel"
                sub={`${fmtK(ytdGross)} von ${fmtK(YTD_GOAL)} Ziel`}
                size={180}
              />
            </div>
          </VCard>

          <VCard eyebrow="Abzüge Mai 2026" title="Kostenverteilung">
            <DonutMulti
              segments={donutSegments}
              centerValue={fmtPct(Math.round((currentStmt.net / currentStmt.gross) * 100))}
              centerLabel="Nettoquote"
            />
          </VCard>
        </div>
      </Grid21>

      {/* Deduction detail table for current month */}
      <VCard eyebrow="Mai 2026 — Abzugsdetails" title="Kostenaufschlüsselung">
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <VTH>Position</VTH>
              <VTH>Basis</VTH>
              <VTH right>Satz</VTH>
              <VTH right>Betrag</VTH>
            </tr>
          </thead>
          <tbody>
            <VTR>
              <VTD><span style={{ fontWeight: 500, color: '#0A0A0A' }}>Bruttoumsatz</span></VTD>
              <VTD><span style={{ color: '#6B6B6B', fontSize: 11 }}>{current.orders} Bestellungen</span></VTD>
              <VTD right>—</VTD>
              <VTD right><span style={{ fontWeight: 600, color: '#0A0A0A' }}>{fmtEur(currentStmt.gross)}</span></VTD>
            </VTR>
            <VTR>
              <VTD muted>Plattformprovision</VTD>
              <VTD><span style={{ color: '#6B6B6B', fontSize: 11 }}>Enunas Marketplace-Gebühr</span></VTD>
              <VTD right muted>18.0%</VTD>
              <VTD right muted>−{fmtEur(currentStmt.commission)}</VTD>
            </VTR>
            <VTR>
              <VTD muted>Rücksendungen</VTD>
              <VTD><span style={{ color: '#6B6B6B', fontSize: 11 }}>Retourenquote {current.returnRate}%</span></VTD>
              <VTD right muted>{current.returnRate.toFixed(1)}%</VTD>
              <VTD right muted>−{fmtEur(currentStmt.returns)}</VTD>
            </VTR>
            <VTR>
              <VTD muted>Sonstige Anpassungen</VTD>
              <VTD><span style={{ color: '#6B6B6B', fontSize: 11 }}>Streitigkeiten, Gutschriften</span></VTD>
              <VTD right muted>—</VTD>
              <VTD right muted>{fmtEur(currentStmt.adjustments)}</VTD>
            </VTR>
            <VTR>
              <VTD><span style={{ fontWeight: 600, color: '#370E4D' }}>Nettobetrag</span></VTD>
              <VTD><span style={{ color: '#6B6B6B', fontSize: 11 }}>Auszahlung ~28. Mai</span></VTD>
              <VTD right><span style={{ color: '#6B6B6B', fontSize: 11 }}>{fmtPct(Math.round((currentStmt.net / currentStmt.gross) * 100))}</span></VTD>
              <VTD right><span style={{ fontWeight: 700, color: '#370E4D', fontSize: 14 }}>{fmtEur(currentStmt.net)}</span></VTD>
            </VTR>
          </tbody>
        </table>

        {/* Pending info banner */}
        <div style={{ margin: '12px 0 0', padding: '10px 14px', background: 'rgba(55,14,77,0.05)', borderLeft: '3px solid #370E4D', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#370E4D', flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 11.5, color: '#370E4D', letterSpacing: '0.04em' }}>
            {current.pendingOrders} Bestellungen stehen noch aus und werden erst nach Versandbestätigung verrechnet.
          </span>
        </div>
      </VCard>

      {/* Trend chart */}
      <VCard eyebrow="Umsatzentwicklung" title="Brutto vs. Netto — letzte 12 Monate"
        action={<VBtn sm variant="ghost">CSV exportieren</VBtn>}>
        <VAreaChart
          data={trendGross}
          compare={trendNet}
          labels={trendLabels}
          fmt={fmtEur}
          height={220}
        />
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-1.5" style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 10.5, color: '#6B6B6B' }}>
            <span style={{ width: 24, height: 2, background: '#370E4D', display: 'block' }} />
            Brutto
          </div>
          <div className="flex items-center gap-1.5" style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 10.5, color: '#6B6B6B' }}>
            <span style={{ width: 24, height: 1, background: 'transparent', display: 'block', borderTop: '1.5px dashed #C9C9C9' }} />
            Netto
          </div>
        </div>
      </VCard>

      {/* Full statement history */}
      <VCard eyebrow="Auszahlungshistorie" title="Kontoauszüge" flush
        action={<VBtn sm variant="ghost">Alle exportieren</VBtn>}>
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <VTH>Periode</VTH>
              <VTH>Referenz</VTH>
              <VTH right>Brutto</VTH>
              <VTH right>Provision</VTH>
              <VTH right>Retouren</VTH>
              <VTH right>Netto</VTH>
              <VTH>Datum</VTH>
              <VTH>Status</VTH>
            </tr>
          </thead>
          <tbody>
            {allRows.map(s => (
              <VTR key={s.id}>
                <VTD><span style={{ fontWeight: 500, color: '#0A0A0A' }}>{s.period}</span></VTD>
                <VTD mono>{s.id}</VTD>
                <VTD right>{fmtEur(s.gross)}</VTD>
                <VTD right muted>−{fmtEur(s.commission)}</VTD>
                <VTD right muted>−{fmtEur(s.returns)}</VTD>
                <VTD right>
                  <span style={{ fontWeight: 600, color: s.status === 'processing' ? '#370E4D' : '#0A0A0A' }}>
                    {fmtEur(s.net)}
                  </span>
                </VTD>
                <VTD muted>
                  {s.paidDate ?? (s.status === 'processing' ? '~28. Mai 2026' : '—')}
                </VTD>
                <VTD>
                  {s.status === 'paid'       && <VStatus tone="success">Ausgezahlt</VStatus>}
                  {s.status === 'processing' && <VStatus tone="purple">In Bearbeitung</VStatus>}
                  {s.status === 'pending'    && <VStatus tone="warn">Ausstehend</VStatus>}
                </VTD>
              </VTR>
            ))}
          </tbody>
        </table>

        {/* Summary footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #E8E8E8', display: 'flex', justifyContent: 'flex-end', gap: 32 }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9B9B9B', marginBottom: 4 }}>
              Gesamt Brutto (alle Zeit)
            </p>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 22, color: '#0A0A0A' }}>
              {fmtEur(allRows.reduce((a, s) => a + s.gross, 0))}
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9B9B9B', marginBottom: 4 }}>
              Gesamt Netto (alle Zeit)
            </p>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 22, color: '#370E4D' }}>
              {fmtEur(allRows.reduce((a, s) => a + s.net, 0))}
            </span>
          </div>
        </div>
      </VCard>
    </div>
  )
}
