'use client'

import { useState, useEffect } from 'react'
import { brandApi } from '@/lib/api/modules/brandApi'
import type { AdminApiProduct, ApiOrder } from '@/types/api'
import {
  VPageHeader, VKPIGrid, VKPI, VCard, VAreaChart, DonutMulti,
  Grid3, VStatus, VChip, VBtn, fmtEur, fmtK, fmtPct, Loader,
} from './vshared'

const MOCK_DAYS = ["16","17","18","19","20","21","22","23","24","25","26","27","28","29"]
const MOCK_REV  = [820, 940, 760, 1120, 1380, 1180, 1620, 1480, 1320, 1640, 2110, 1820, 2410, 2680]
const MOCK_PREV = [620, 700, 680, 880,  940,  920, 1240, 1180, 1080, 1280, 1480, 1320, 1620, 1740]
const MOCK_CAT  = [
  { label: 'Streetwear', value: 12600, color: '#370E4D' },
  { label: 'Culture',    value: 5800,  color: '#9B7BB5' },
  { label: 'Athleisure', value: 3400,  color: '#C9B8D6' },
]
const MOCK_LOW_STOCK = [
  { name: 'Worlds End Denim Boxer Jacket', sku: 'WEW-WED-BLK', stock: 4, tone: 'warn'  as const },
  { name: 'Embossed Cap, Aubergine',       sku: 'WEW-CAP-PRP', stock: 0, tone: 'error' as const },
]

export default function Overview({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [products, setProducts] = useState<AdminApiProduct[]>([])
  const [orders, setOrders]     = useState<ApiOrder[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      brandApi.products.getMy().catch(() => [] as AdminApiProduct[]),
      brandApi.orders.getAll().catch(() => [] as ApiOrder[]),
    ]).then(([p, o]) => { setProducts(p); setOrders(o) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  const useMock = orders.length === 0

  const now        = new Date()
  const startMTD   = new Date(now.getFullYear(), now.getMonth(), 1)
  const mtdOrders  = orders.filter(o => new Date(o.createdAt) >= startMTD)
  const revMTD     = mtdOrders.reduce((s, o) => s + (o.totalAmount ?? 0), 0)
  const grossMTD   = useMock ? 21820 : (revMTD || 21820)
  // Brand partner receives gross minus 18% platform commission
  const netMTD     = Math.round(grossMTD * 0.82)

  const openOrders     = useMock ? 14 : orders.filter(o => ['PAID', 'PROCESSING'].includes(o.status)).length
  const returnOrders   = orders.filter(o => ['RETURN_REQUESTED', 'RETURN_RECEIVED', 'REFUNDED'].includes(o.status))
  const pendingReturns = useMock ? 3  : orders.filter(o => o.status === 'RETURN_REQUESTED').length
  const returnRate     = (useMock || orders.length === 0) ? 6.8 : (returnOrders.length / orders.length) * 100
  const toShip         = orders.filter(o => o.status === 'PAID').slice(0, 3)

  return (
    <div className="space-y-4">
      <VPageHeader
        eyebrow="Brand Portal"
        title="Übersicht"
        italicTitle="Mai 2026"
        sub="Deine Performance auf einen Blick."
        actions={<VBtn variant="ghost" sm onClick={() => onNavigate('analytics')}>Vollständige Analyse</VBtn>}
      />

      {/* 6-KPI row */}
      <VKPIGrid cols={6}>
        <VKPI label="Umsatz MTD"      value={fmtK(grossMTD)}    delta="+18% vs. Vorperiode"                                              deltaTone="up"   spark={MOCK_REV} />
        <VKPI label="Offen"           value={openOrders}          delta="Bestellungen"                                                     deltaTone="muted" />
        <VKPI label="Offene Retouren" value={pendingReturns}      delta={pendingReturns > 0 ? 'Aktion erforderlich' : 'Keine offenen'}     deltaTone={pendingReturns > 0 ? 'down' : 'muted'} />
        <VKPI label="Nächste Zahlung" value={fmtK(netMTD)}        delta="~28. Mai"                                                         deltaTone="muted" />
        <VKPI label="Retourenquote"   value={fmtPct(returnRate)}  delta="−0.4 pp MTD"                                                      deltaTone="up"   />
        <VKPI label="Conversion"      value="3.7%"                delta="+0.5 pp"                                                          deltaTone="up"   />
      </VKPIGrid>

      {/* Revenue chart — full width */}
      <VCard eyebrow="Umsatz — letzte 14 Tage" title="Umsatzverlauf" action={<VChip tone="ghost">Mai</VChip>}>
        <VAreaChart data={MOCK_REV} compare={MOCK_PREV} labels={MOCK_DAYS} fmt={fmtEur} height={230} />
      </VCard>

      {/* Donut + action feed */}
      <Grid3>
        <VCard eyebrow="Kategorien" title="Umsatz-Mix">
          <DonutMulti segments={MOCK_CAT} centerValue={fmtK(grossMTD)} centerLabel="Gesamt" />
        </VCard>

        <VCard eyebrow="Aktionen" title="Offene Punkte" style={{ gridColumn: 'span 2' }}>
          <div className="divide-y divide-[#F5F5F0]">
            {/* Ship items */}
            {toShip.length > 0 ? toShip.map(o => (
              <div key={o.id} className="flex items-start justify-between py-3">
                <div>
                  <p style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 12, color: '#0A0A0A', fontWeight: 500 }}>
                    Bestellung #{o.id.slice(0, 8).toUpperCase()} versandbereit
                  </p>
                  <p style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 11, color: '#9B9B9B', marginTop: 2 }}>
                    {fmtEur(o.totalAmount)} · Bezahlt
                  </p>
                </div>
                <button onClick={() => onNavigate('orders')} style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#370E4D', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Versenden →
                </button>
              </div>
            )) : (
              <div className="flex items-start justify-between py-3">
                <div>
                  <p style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 12, color: '#0A0A0A', fontWeight: 500 }}>
                    3 Bestellungen versandbereit
                  </p>
                  <p style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 11, color: '#9B9B9B', marginTop: 2 }}>
                    € 842 · Bezahlt
                  </p>
                </div>
                <button onClick={() => onNavigate('orders')} style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#370E4D', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Versenden →
                </button>
              </div>
            )}

            {/* Low stock */}
            {MOCK_LOW_STOCK.map(item => (
              <div key={item.sku} className="flex items-start justify-between py-3">
                <div>
                  <p style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 12, color: '#0A0A0A', fontWeight: 500 }}>
                    {item.stock === 0 ? 'Ausverkauft' : 'Niedriger Lagerbestand'} — {item.name}
                  </p>
                  <p style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 11, color: '#9B9B9B', marginTop: 2 }}>
                    {item.sku} · {item.stock === 0 ? 'Kein Bestand' : `${item.stock} Einh. verbleibend`}
                  </p>
                </div>
                <VStatus tone={item.tone}>{item.stock === 0 ? 'Ausverkauft' : 'Niedrig'}</VStatus>
              </div>
            ))}

            {/* Campaign */}
            <div className="flex items-start justify-between py-3">
              <div>
                <p style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 12, color: '#0A0A0A', fontWeight: 500 }}>
                  Kampagne aktiv — Spring Drop Vol.1
                </p>
                <p style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 11, color: '#9B9B9B', marginTop: 2 }}>
                  ROAS 7.0× · € 8.420 Umsatz · Instagram + Newsletter
                </p>
              </div>
              <VStatus tone="success">Aktiv</VStatus>
            </div>
          </div>
        </VCard>
      </Grid3>
    </div>
  )
}
