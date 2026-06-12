'use client'

import { useState, useEffect } from 'react'
import { brandApi } from '@/lib/api/modules/brandApi'
import type { ApiOrder } from '@/types/api'
import {
  VPageHeader, VKPIGrid, VKPI, VCard, VComboChart, Funnel, HBar,
  Grid21, VTH, VTD, VTR, fmtEur, fmtPct, Loader,
  SHOW_PREVIEW_DATA, Phase2Panel,
} from './vshared'

const MOCK_DAYS     = ["16","17","18","19","20","21","22","23","24","25","26","27","28","29"]
const MOCK_SESSIONS = [1820, 2140, 1960, 2380, 2720, 2540, 3080, 2860, 2640, 3120, 3840, 3380, 4220, 4680]
const MOCK_CONV     = [2.4, 2.6, 2.5, 2.8, 2.9, 2.7, 3.1, 3.0, 2.8, 3.1, 3.4, 3.2, 3.6, 3.7]
const MOCK_FUNNEL   = [
  { label: 'Storefront-Besuche', value: 14820 },
  { label: 'Produktaufrufe',     value: 8940  },
  { label: 'In den Warenkorb',   value: 1820  },
  { label: 'Zur Kasse',          value: 742   },
  { label: 'Gekauft',            value: 459   },
]
const MOCK_CHANNELS = [
  { label: 'Direkt',            value: 5630, sub: '38%' },
  { label: 'Organische Suche',  value: 3558, sub: '24%' },
  { label: 'Instagram',         value: 2668, sub: '18%' },
  { label: 'Newsletter',        value: 1778, sub: '12%' },
  { label: 'Editorial',         value: 1186, sub: '8%'  },
]
const MOCK_TOP_PRODUCTS = [
  { label: 'Drop Hoodie Vol.1',         value: 7968, sub: '32 verkauft' },
  { label: 'Worlds End Denim Boxer',    value: 6846, sub: '14 verkauft' },
  { label: 'Atelier Overcoat, Crema',  value: 4494, sub: '6 verkauft'  },
  { label: 'Volume Tee, Charcoal',      value: 2492, sub: '28 verkauft' },
  { label: 'Embossed Cap, Aubergine',   value: 276,  sub: '4 verkauft'  },
]
const GEO_DATA = [
  { market: 'Deutschland',  orders: 218, rev: 12480, pct: 57 },
  { market: 'Österreich',   orders: 58,  rev: 3280,  pct: 15 },
  { market: 'Schweiz',      orders: 46,  rev: 2640,  pct: 12 },
  { market: 'Niederlande',  orders: 32,  rev: 1820,  pct: 8  },
  { market: 'Sonstige',     orders: 28,  rev: 1600,  pct: 8  },
]

export default function Analytics() {
  const [orders, setOrders] = useState<ApiOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    brandApi.orders.getAll().catch(() => [] as ApiOrder[]).then(setOrders).finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  // Prod: keine erfundenen Zahlen — Sessions/Conversion/Funnel haben (noch) keine Backend-Quelle
  if (!SHOW_PREVIEW_DATA) {
    return (
      <div className="space-y-4">
        <VPageHeader eyebrow="Brand Portal" title="Analytics" sub="Traffic, Conversion und Top-Performance." />
        <Phase2Panel
          title="Analytics"
          sub="Sobald das Tracking live ist, siehst du hier echte Zahlen zu deinem Storefront-Traffic. Geplante Metriken:"
          metrics={['Sessions', 'Add-to-Cart-Rate', 'Conversion', 'Ø Bestellwert', 'Conversion-Funnel', 'Umsatz nach Produkt', 'Traffic-Kanäle', 'Märkte']}
        />
      </div>
    )
  }

  const aov        = orders.length > 0 ? orders.reduce((s, o) => s + (o.totalAmount ?? 0), 0) / orders.length : 47.54
  const sessions   = MOCK_SESSIONS[MOCK_SESSIONS.length - 1]
  const conversion = MOCK_CONV[MOCK_CONV.length - 1]
  const cartRate   = (MOCK_FUNNEL[2].value / MOCK_FUNNEL[0].value) * 100

  return (
    <div className="space-y-4">
      <VPageHeader
        eyebrow="Brand Portal"
        title="Analytics"
        italicTitle="Mai 2026"
        sub="Traffic, Conversion und Top-Performance."
      />

      <VKPIGrid cols={4}>
        <VKPI label="Sessions (heute)"  value={sessions.toLocaleString('de-DE')} delta="+12% vs. Vortag"           deltaTone="up"   />
        <VKPI label="Add-to-Cart"       value={fmtPct(cartRate)}                  delta="+2.1 pp"                    deltaTone="up"   />
        <VKPI label="Conversion"        value={`${conversion}%`}                  delta="+0.5 pp"                    deltaTone="up"   />
        <VKPI label="Ø Bestellwert"     value={fmtEur(aov)}                       delta="vs. € 43 Vormonat"          deltaTone="up"   spark={[43, 44, 45, 44, 46, 47, 47.54]} />
      </VKPIGrid>

      <Grid21>
        <VCard eyebrow="Traffic & Conversion" title="Sessions + Conversion-Rate">
          <VComboChart
            bars={MOCK_SESSIONS}
            line={MOCK_CONV}
            labels={MOCK_DAYS}
            barFmt={v => v.toLocaleString('de-DE')}
            lineFmt={v => `${v}%`}
            height={220}
          />
        </VCard>
        <VCard eyebrow="Kaufprozess" title="Conversion-Funnel">
          <Funnel stages={MOCK_FUNNEL} />
        </VCard>
      </Grid21>

      <Grid21>
        <VCard eyebrow="Top-Produkte" title="Umsatz nach Produkt">
          <HBar items={MOCK_TOP_PRODUCTS} fmt={fmtEur} />
        </VCard>
        <VCard eyebrow="Traffic-Kanäle" title="Umsatz nach Kanal">
          <HBar items={MOCK_CHANNELS} fmt={fmtEur} />
        </VCard>
      </Grid21>

      <VCard eyebrow="Geografie" title="Märkte" flush>
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <VTH>Markt</VTH>
              <VTH>Bestellungen</VTH>
              <VTH right>Umsatz</VTH>
              <VTH right>Anteil</VTH>
            </tr>
          </thead>
          <tbody>
            {GEO_DATA.map(r => (
              <VTR key={r.market}>
                <VTD><span style={{ fontWeight: 500, color: '#0A0A0A' }}>{r.market}</span></VTD>
                <VTD muted>{r.orders}</VTD>
                <VTD right>{fmtEur(r.rev)}</VTD>
                <VTD right>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                    <div style={{ width: 60, height: 4, background: '#E8E8E8' }}>
                      <div style={{ height: '100%', width: `${r.pct}%`, background: '#370E4D' }} />
                    </div>
                    <span style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 11, color: '#6B6B6B', minWidth: 28, textAlign: 'right' }}>
                      {r.pct}%
                    </span>
                  </div>
                </VTD>
              </VTR>
            ))}
          </tbody>
        </table>
      </VCard>
    </div>
  )
}
