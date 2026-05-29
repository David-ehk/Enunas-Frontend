'use client'

import { useState, useEffect } from 'react'
import { brandApi } from '@/lib/api/modules/brandApi'
import type { ApiOrder } from '@/types/api'
import {
  VPageHeader, VKPIGrid, VKPI, VCard, VAreaChart, ReasonRow,
  Grid2, VStatus, VTH, VTD, VTR, fmtEur, fmtPct, fmt, Loader, EmptyState,
} from './vshared'

const MOCK_RETURN_MONTHS = ["Dez", "Jan", "Feb", "Mär", "Apr", "Mai"]
const MOCK_RETURN_TREND  = [9.1, 8.6, 8.2, 7.7, 7.2, 6.8]
const MOCK_REASONS = [
  { label: 'Größe passt nicht',     count: 34, meta: 'Häufigster Grund' },
  { label: 'Nicht wie beschrieben', count: 18, meta: ''                 },
  { label: 'Qualitätsproblem',      count: 12, meta: ''                 },
  { label: 'Falsch bestellt',       count: 8,  meta: ''                 },
  { label: 'Artikel beschädigt',    count: 6,  meta: ''                 },
]
const MOCK_NOTES = [
  'Die Jacke war leider eine Nummer zu groß — tolle Qualität, aber ich musste sie zurückgeben.',
  'Farbe weicht vom Foto ab, im echten Leben eher dunkelblau als schwarz.',
  '',
]
const MOCK_RETURN_ROWS = [
  { id: 'RA1B2C3D4', item: 'Drop Hoodie Vol.1',           amount: 189, date: '21.05.26', status: 'RETURN_RECEIVED' },
  { id: 'RE5F6G7H8', item: 'Worlds End Denim Boxer Jacket', amount: 489, date: '19.05.26', status: 'REFUNDED'        },
  { id: 'RI9J0K1L2', item: 'Atelier Overcoat, Crema',      amount: 749, date: '15.05.26', status: 'RETURN_REQUESTED' },
]

export default function VendorReturns() {
  const [orders, setOrders] = useState<ApiOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    brandApi.orders.getAll().catch(() => [] as ApiOrder[]).then(setOrders).finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  const returnOrders = orders.filter(o => ['RETURN_REQUESTED', 'RETURN_RECEIVED', 'REFUNDED'].includes(o.status))
  const useMock      = orders.length === 0
  const returnCount  = useMock ? 18 : returnOrders.length
  const returnRate   = (useMock || orders.length === 0) ? 6.8 : (returnOrders.length / orders.length) * 100
  const refundedVal  = useMock ? 2340 : returnOrders.filter(o => o.status === 'REFUNDED').reduce((s, o) => s + (o.totalAmount ?? 0), 0)
  const restocked    = useMock ? 72   : (returnOrders.length > 0 ? Math.round((returnOrders.filter(o => o.status !== 'RETURN_REQUESTED').length / returnOrders.length) * 100) : 0)
  const totalReasons = MOCK_REASONS.reduce((s, r) => s + r.count, 0)

  return (
    <div className="space-y-4">
      <VPageHeader
        eyebrow="Brand Portal"
        title="Retouren"
        italicTitle="Mai 2026"
        sub="Rückgaben, Quoten und Kundennotizen."
      />

      <VKPIGrid cols={4}>
        <VKPI label="Retouren"          value={returnCount}        delta="lfd. Monat"          deltaTone="muted" />
        <VKPI label="Retourenquote"     value={fmtPct(returnRate)} delta="−0.4 pp MTD"          deltaTone="up"    spark={MOCK_RETURN_TREND} />
        <VKPI label="Rückerstattungen"  value={fmtEur(refundedVal)} delta="abgeschlossen"       deltaTone="muted" />
        <VKPI label="Wieder eingelagert" value={`${restocked}%`}   delta="der zurückgekehrten" deltaTone="muted" />
      </VKPIGrid>

      <Grid2>
        <VCard eyebrow="Quoten-Trend" title="Retourenquote — 6 Monate">
          <VAreaChart data={MOCK_RETURN_TREND} labels={MOCK_RETURN_MONTHS} fmt={v => `${v}%`} height={200} />
        </VCard>
        <VCard eyebrow="Rückgabegründe" title="Analyse">
          {MOCK_REASONS.map(r => (
            <ReasonRow key={r.label} label={r.label} count={r.count} total={totalReasons} meta={r.meta} />
          ))}
        </VCard>
      </Grid2>

      <VCard eyebrow="Retouren-Auflistung" title="Rückgaben" flush>
        {!useMock && returnOrders.length === 0 ? (
          <EmptyState message="Keine Retouren vorhanden." />
        ) : (
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <VTH>Bestellung</VTH>
                <VTH>Artikel</VTH>
                <VTH right>Betrag</VTH>
                <VTH>Datum</VTH>
                <VTH>Status</VTH>
                <VTH>Kundennotiz</VTH>
              </tr>
            </thead>
            <tbody>
              {useMock
                ? MOCK_RETURN_ROWS.map((r, i) => (
                  <VTR key={r.id}>
                    <VTD mono>#{r.id}</VTD>
                    <VTD><span style={{ color: '#0A0A0A', fontWeight: 500 }}>{r.item}</span></VTD>
                    <VTD right>{fmtEur(r.amount)}</VTD>
                    <VTD muted>{r.date}</VTD>
                    <VTD>
                      <VStatus tone={r.status === 'REFUNDED' ? 'muted' : r.status === 'RETURN_REQUESTED' ? 'warn' : 'purple'}>
                        {r.status === 'REFUNDED' ? 'Erstattet' : r.status === 'RETURN_REQUESTED' ? 'Beantragt' : 'Eingegangen'}
                      </VStatus>
                    </VTD>
                    <VTD>
                      {MOCK_NOTES[i] && (
                        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontWeight: 300, fontSize: 13, color: '#6B6B6B' }}>
                          &ldquo;{MOCK_NOTES[i]}&rdquo;
                        </span>
                      )}
                    </VTD>
                  </VTR>
                ))
                : returnOrders.slice(0, 8).map((o, i) => (
                  <VTR key={o.id}>
                    <VTD mono>#{o.id.slice(0, 8).toUpperCase()}</VTD>
                    <VTD><span style={{ color: '#0A0A0A', fontWeight: 500 }}>{(o.items ?? []).map(it => it.name).join(', ') || '—'}</span></VTD>
                    <VTD right>{fmtEur(o.totalAmount)}</VTD>
                    <VTD muted>{fmt(o.createdAt)}</VTD>
                    <VTD>
                      <VStatus tone={o.status === 'REFUNDED' ? 'muted' : o.status === 'RETURN_REQUESTED' ? 'warn' : 'purple'}>
                        {o.status === 'REFUNDED' ? 'Erstattet' : o.status === 'RETURN_REQUESTED' ? 'Beantragt' : 'Eingegangen'}
                      </VStatus>
                    </VTD>
                    <VTD>
                      {MOCK_NOTES[i] && (
                        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontWeight: 300, fontSize: 13, color: '#6B6B6B' }}>
                          &ldquo;{MOCK_NOTES[i]}&rdquo;
                        </span>
                      )}
                    </VTD>
                  </VTR>
                ))
              }
            </tbody>
          </table>
        )}
      </VCard>
    </div>
  )
}
