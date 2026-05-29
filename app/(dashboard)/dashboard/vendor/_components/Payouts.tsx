'use client'

import { useState, useEffect } from 'react'
import { brandApi } from '@/lib/api/modules/brandApi'
import type { ApiOrder } from '@/types/api'
import {
  VPageHeader, VKPIGrid, VKPI, VCard, WaterfallChart, GaugeArc,
  Grid21, VStatus, VTH, VTD, VTR, fmtEur, fmtK, fmtPct, Loader,
} from './vshared'

const YTD_GOAL = 100_000
const STATEMENTS = [
  { id: 'PAY-082', period: 'Apr 2026', gross: 16840, deductions: 3031, net: 13809 },
  { id: 'PAY-081', period: 'Mär 2026', gross: 14620, deductions: 2632, net: 11988 },
  { id: 'PAY-080', period: 'Feb 2026', gross: 11980, deductions: 2156, net: 9824  },
  { id: 'PAY-079', period: 'Jan 2026', gross: 13240, deductions: 2383, net: 10857 },
  { id: 'PAY-078', period: 'Dez 2025', gross: 8420,  deductions: 1516, net: 6904  },
]

export default function Payouts() {
  const [orders, setOrders] = useState<ApiOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    brandApi.orders.getAll().catch(() => [] as ApiOrder[]).then(setOrders).finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  const revTotal   = orders.reduce((s, o) => s + (o.totalAmount ?? 0), 0)
  const grossMTD   = revTotal || 18420
  const netMTD     = Math.round(grossMTD * 0.82)
  const effectPct  = ((grossMTD - netMTD) / grossMTD) * 100
  const ytdGross   = revTotal + STATEMENTS.reduce((s, p) => s + p.gross, 0)
  const ytdPct     = Math.min(99, Math.round((ytdGross / YTD_GOAL) * 100))

  const waterfall = [
    { label: 'Brutto',        value: grossMTD,                          type: 'base'  as const },
    { label: 'Provision 18%', value: Math.round(grossMTD * 0.18),       type: 'sub'   as const },
    { label: 'Rücksendungen', value: Math.round(grossMTD * 0.051),      type: 'sub'   as const },
    { label: 'Netto',         value: netMTD,                            type: 'total' as const },
  ]

  return (
    <div className="space-y-4">
      <VPageHeader
        eyebrow="Brand Portal"
        title="Auszahlungen"
        italicTitle="Mai 2026"
        sub="Umsatz, Abzüge und Netto-Auszahlungen."
      />

      <VKPIGrid cols={4}>
        <VKPI
          label="Brutto MTD"
          value={fmtK(grossMTD)}
          delta="vor Abzügen"
          deltaTone="muted"
          spark={[8420, 11980, 13240, 14620, 16840, grossMTD]}
        />
        <VKPI label="Nächste Auszahlung" value={fmtK(netMTD)}        delta="~28. Mai"            deltaTone="muted" />
        <VKPI label="Effektiver Satz"    value={fmtPct(effectPct)}    delta="Provision + Gebühren" deltaTone="muted" />
        <VKPI label="YTD Brutto"         value={fmtK(ytdGross)}       delta={`Ziel: ${fmtK(YTD_GOAL)}`} deltaTone="muted" />
      </VKPIGrid>

      <Grid21>
        <VCard eyebrow="Umsatzverteilung" title="Auszahlungsstruktur — Mai 2026">
          <WaterfallChart steps={waterfall} fmt={fmtEur} height={260} />
        </VCard>
        <VCard eyebrow="Jahresziel" title="YTD-Fortschritt">
          <div className="flex justify-center py-6">
            <GaugeArc
              pct={ytdPct}
              label="Jahresziel"
              sub={`${fmtK(ytdGross)} von ${fmtK(YTD_GOAL)} Ziel`}
              size={195}
            />
          </div>
        </VCard>
      </Grid21>

      <VCard eyebrow="Auszahlungshistorie" title="Kontoauszüge" flush>
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <VTH>Periode</VTH>
              <VTH>Referenz</VTH>
              <VTH right>Brutto</VTH>
              <VTH right>Abzüge</VTH>
              <VTH right>Netto</VTH>
              <VTH>Status</VTH>
            </tr>
          </thead>
          <tbody>
            {STATEMENTS.map(s => (
              <VTR key={s.id}>
                <VTD><span style={{ fontWeight: 500, color: '#0A0A0A' }}>{s.period}</span></VTD>
                <VTD mono>{s.id}</VTD>
                <VTD right>{fmtEur(s.gross)}</VTD>
                <VTD right muted>−{fmtEur(s.deductions)}</VTD>
                <VTD right><span style={{ fontWeight: 600, color: '#0A0A0A' }}>{fmtEur(s.net)}</span></VTD>
                <VTD><VStatus tone="success">Ausgezahlt</VStatus></VTD>
              </VTR>
            ))}
          </tbody>
        </table>
      </VCard>
    </div>
  )
}
