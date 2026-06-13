'use client'

import { useState, useEffect } from 'react'
import { brandApi } from '@/lib/api/modules/brandApi'
import type { ApiOrder, ApiBrandPartner } from '@/types/api'
import {
  VPageHeader, VKPIGrid, VKPI, VCard,
  VStatus, VTH, VTD, VTR, fmtEur, fmt, Loader, EmptyState,
  SHOW_PREVIEW_DATA, Phase2Tile,
} from './vshared'

const RETURN_STATUSES = ['RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_RECEIVED', 'REFUNDED']

const REASON_LABELS: Record<string, string> = {
  WRONG_SIZE:        'Falsche Größe',
  WRONG_COLOR:       'Falsche Farbe',
  DAMAGED:           'Beschädigt',
  DEFECTIVE:         'Defekt',
  NOT_AS_DESCRIBED:  'Nicht wie beschrieben',
  NO_LONGER_WANTED:  'Nicht mehr gewünscht',
  OTHER:             'Sonstiges',
}

const MOCK_RETURN_ROWS = [
  { id: 'RA1B2C3D4', item: 'Drop Hoodie Vol.1',             amount: 189, date: '21.05.26', status: 'RETURN_RECEIVED',  reason: 'WRONG_SIZE',       desc: '' },
  { id: 'RE5F6G7H8', item: 'Worlds End Denim Boxer Jacket',  amount: 489, date: '19.05.26', status: 'REFUNDED',         reason: 'NOT_AS_DESCRIBED', desc: 'Farbe weicht vom Foto ab' },
  { id: 'RI9J0K1L2', item: 'Atelier Overcoat, Crema',        amount: 749, date: '15.05.26', status: 'RETURN_REQUESTED', reason: 'WRONG_SIZE',       desc: '' },
]

function returnStatusMeta(s: string): { label: string; tone: 'warn' | 'purple' | 'muted' } {
  switch (s) {
    case 'RETURN_REQUESTED': return { label: 'Beantragt',   tone: 'warn'   }
    case 'RETURN_APPROVED':  return { label: 'Genehmigt',   tone: 'purple' }
    case 'RETURN_RECEIVED':  return { label: 'Eingegangen', tone: 'purple' }
    case 'REFUNDED':         return { label: 'Erstattet',   tone: 'muted'  }
    default:                 return { label: s,             tone: 'muted'  }
  }
}

export default function VendorReturns() {
  const [orders, setOrders]   = useState<ApiOrder[]>([])
  const [brand, setBrand]     = useState<ApiBrandPartner | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      brandApi.orders.getAll().catch(() => [] as ApiOrder[]),
      brandApi.getMe().catch(() => null),
    ]).then(([o, b]) => { setOrders(o); setBrand(b) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  const returnOrders = orders.filter(o => RETURN_STATUSES.includes(o.status))
  const useMock      = SHOW_PREVIEW_DATA && orders.length === 0
  const returnCount  = useMock ? 18 : returnOrders.length
  const refundedVal  = useMock ? 2340 : returnOrders
    .filter(o => o.status === 'REFUNDED')
    .reduce((s, o) => s + (o.totalAmount ?? 0), 0)

  const returnAddress = brand
    ? [brand.addressStreet, brand.addressPostalCode && brand.addressCity
        ? `${brand.addressPostalCode} ${brand.addressCity}`
        : brand.addressCity ?? brand.addressPostalCode,
       brand.addressCountry]
        .filter(Boolean).join(', ')
    : null

  return (
    <div className="space-y-4">
      <VPageHeader
        eyebrow="Brand Portal"
        title="Retouren"
        sub="Rückgaben und Rückerstattungen — live aus deinen Bestellungen."
      />

      <VKPIGrid cols={4}>
        <VKPI label="Retouren"          value={returnCount}         delta="lfd. Monat"    deltaTone="muted" />
        <Phase2Tile label="Retourenquote" />
        <VKPI label="Rückerstattungen"  value={fmtEur(refundedVal)} delta="abgeschlossen" deltaTone="muted" />
        <Phase2Tile label="Wieder eingelagert" />
      </VKPIGrid>

      {/* Return address info — shown once brand data is loaded */}
      {returnAddress && (
        <div className="bg-white border border-[#E8E8E8] px-6 py-4 flex items-start gap-4">
          <div className="flex-1">
            <p className="text-[9.5px] uppercase tracking-[0.18em] font-medium mb-1"
              style={{ fontFamily: 'var(--font-league-spartan)', color: '#9B9B9B' }}>
              Retourenadresse
            </p>
            <p style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 13, color: '#0A0A0A', fontWeight: 500 }}>
              {brand?.legalName ?? brand?.brandName}
            </p>
            <p style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 12, color: '#6B6B6B', marginTop: 2 }}>
              {returnAddress}
            </p>
          </div>
          <p className="text-[11px] leading-relaxed max-w-xs text-right"
            style={{ fontFamily: 'var(--font-league-spartan)', color: '#9B9B9B' }}>
            Kunden senden genehmigte Retouren an diese Adresse. Adresse ändern unter Einstellungen.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Phase2Tile label="Retourenquote — 6-Monats-Trend" />
        <Phase2Tile label="Rückgabegründe-Analyse" />
      </div>

      <VCard eyebrow="Retouren-Auflistung" title="Rückgaben" flush>
        {!useMock && returnOrders.length === 0 ? (
          <EmptyState message="Keine Retouren vorhanden." />
        ) : (
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <VTH>Bestellung</VTH>
                <VTH>Artikel</VTH>
                <VTH>Grund</VTH>
                <VTH right>Betrag</VTH>
                <VTH>Datum</VTH>
                <VTH>Status</VTH>
              </tr>
            </thead>
            <tbody>
              {useMock
                ? MOCK_RETURN_ROWS.map(r => {
                    const { label, tone } = returnStatusMeta(r.status)
                    return (
                      <VTR key={r.id}>
                        <VTD mono>#{r.id}</VTD>
                        <VTD><span style={{ color: '#0A0A0A', fontWeight: 500 }}>{r.item}</span></VTD>
                        <VTD>
                          <span style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 12, color: '#2D2D2D' }}>
                            {REASON_LABELS[r.reason] ?? r.reason}
                          </span>
                          {r.desc && (
                            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontWeight: 300, fontSize: 12, color: '#9B9B9B', marginTop: 2 }}>
                              {r.desc}
                            </p>
                          )}
                        </VTD>
                        <VTD right>{fmtEur(r.amount)}</VTD>
                        <VTD muted>{r.date}</VTD>
                        <VTD><VStatus tone={tone}>{label}</VStatus></VTD>
                      </VTR>
                    )
                  })
                : returnOrders.slice(0, 50).map(o => {
                    const { label, tone } = returnStatusMeta(o.status)
                    return (
                      <VTR key={o.id}>
                        <VTD mono>#{String(o.id).slice(0, 8).toUpperCase()}</VTD>
                        <VTD><span style={{ color: '#0A0A0A', fontWeight: 500 }}>{(o.items ?? []).map(it => it.name).join(', ') || '—'}</span></VTD>
                        <VTD>
                          {o.returnReason ? (
                            <>
                              <span style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 12, color: '#2D2D2D' }}>
                                {REASON_LABELS[o.returnReason] ?? o.returnReason}
                              </span>
                              {o.returnDescription && (
                                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontWeight: 300, fontSize: 12, color: '#9B9B9B', marginTop: 2 }}>
                                  {o.returnDescription}
                                </p>
                              )}
                            </>
                          ) : (
                            <span style={{ color: '#C9C9C9' }}>—</span>
                          )}
                        </VTD>
                        <VTD right>{fmtEur(o.totalAmount ?? 0)}</VTD>
                        <VTD muted>{fmt(o.updatedAt ?? o.createdAt)}</VTD>
                        <VTD><VStatus tone={tone}>{label}</VStatus></VTD>
                      </VTR>
                    )
                  })
              }
            </tbody>
          </table>
        )}
      </VCard>
    </div>
  )
}

/* ─── Phase-2/3-Referenz: ursprüngliche Implementierung ──────────────────────
   Retourenquote und Wieder-eingelagert-Rate brauchen eine dedizierte Returns-
   Quelle (Zeitreihendaten) — z. B. /brand/returns Endpunkt.

const MOCK_RETURN_MONTHS = ["Dez", "Jan", "Feb", "Mär", "Apr", "Mai"]
const MOCK_RETURN_TREND  = [9.1, 8.6, 8.2, 7.7, 7.2, 6.8]
const MOCK_REASONS = [
  { label: 'Größe passt nicht',     count: 34, meta: 'Häufigster Grund' },
  { label: 'Nicht wie beschrieben', count: 18, meta: ''                 },
  { label: 'Qualitätsproblem',      count: 12, meta: ''                 },
  { label: 'Falsch bestellt',       count: 8,  meta: ''                 },
  { label: 'Artikel beschädigt',    count: 6,  meta: ''                 },
]

// KPI-Berechnungen:
// const returnRate = orders.length > 0 ? (returnOrders.length / orders.length) * 100 : null
// const restocked  = returnOrders.length > 0
//   ? Math.round((returnOrders.filter(o => o.status !== 'RETURN_REQUESTED').length / returnOrders.length) * 100)
//   : null

// Trend + Gründe (Grid2):
// import { VAreaChart, ReasonRow, Grid2 } from './vshared'
// <Grid2>
//   <VCard eyebrow="Quoten-Trend" title="Retourenquote — 6 Monate">
//     <VAreaChart data={MOCK_RETURN_TREND} labels={MOCK_RETURN_MONTHS} fmt={v => `${v}%`} height={200} />
//   </VCard>
//   <VCard eyebrow="Rückgabegründe" title="Analyse">
//     {MOCK_REASONS.map(r => {
//       const totalReasons = MOCK_REASONS.reduce((s, r) => s + r.count, 0)
//       return <ReasonRow key={r.label} label={r.label} count={r.count} total={totalReasons} meta={r.meta} />
//     })}
//   </VCard>
// </Grid2>
*/
