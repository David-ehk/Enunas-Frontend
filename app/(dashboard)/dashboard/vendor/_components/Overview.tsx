'use client'

import { useState, useEffect, useMemo } from 'react'
import { brandApi } from '@/lib/api/modules/brandApi'
import type { AdminApiProduct, ApiOrder, AdminApiVariant, AdminPayout, ApiBrandPartner } from '@/types/api'
import {
  ownSkus, ownItems, itemGross, isRevenueOrder, participatesIn,
  grossProductAmount, refundedAmount, summarise, partnerSettlementAmount,
} from '@/lib/brandRevenue'
import {
  VPageHeader, VKPIGrid, VKPI, VCard, VAreaChart, DonutMulti,
  Grid3, VStatus, VChip, VBtn, fmtEur, fmtEurExact, fmtK, Loader, EmptyState,
} from './vshared'

// Umsatzdefinition lebt in lib/brandRevenue (isRevenueOrder): bezahlte Bestellungen zählen,
// PENDING/CANCELLED nicht — und Erstattungen werden als BETRAG abgezogen, statt die Bestellung
// per Status auszuschließen. Sonst verschwänden Verkauf und Erstattung gemeinsam.

const DONUT_COLORS = ['#370E4D', '#9B7BB5', '#C9B8D6', '#6B4226', '#1A5A3C']

const LOW_STOCK_THRESHOLD = 5

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function Overview({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [products, setProducts] = useState<AdminApiProduct[]>([])
  const [orders, setOrders]     = useState<ApiOrder[]>([])
  // Needed to pick this brand's own shipping snapshot and its own returns off a shared order.
  const [brand, setBrand]       = useState<ApiBrandPartner | null>(null)
  const brandId = brand ? String(brand.id) : null
  // Server-computed settlement. The only source for a commission-adjusted figure — the
  // frontend must not re-derive one.
  const [payouts, setPayouts]   = useState<AdminPayout[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      brandApi.products.getMy().catch(() => [] as AdminApiProduct[]),
      brandApi.orders.getAll().catch(() => [] as ApiOrder[]),
      brandApi.getMe().catch(() => null),
      brandApi.payouts.getMine().catch(() => [] as AdminPayout[]),
    ]).then(([p, o, b, pay]) => { setProducts(p); setOrders(o); setBrand(b); setPayouts(pay) })
      .finally(() => setLoading(false))
  }, [])

  const now = new Date()
  const monthLabel = now.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })

  const {
    merchandiseMTD, refundedMTD, shippingMTD, settlementAmount,
    openOrders, pendingReturns, toShip,
    chartData, chartCompare, chartLabels, categoryMix, mixTotal, lowStock,
  } = useMemo(() => {
    const startMTD = new Date(now.getFullYear(), now.getMonth(), 1)

    // /brand/orders liefert ganze Bestellungen — bei Multi-Brand-Bestellungen also auch die
    // Positionen anderer Marken. Deshalb NICHT die Order-Summe nehmen, sondern nur die eigenen
    // Positionen (Join über variantSku) und die eigene Versand-/Retouren-Zeile.
    const skus = ownSkus(products)
    const revenueOrders = orders.filter(o => isRevenueOrder(o) && participatesIn(o, brandId))

    const mtd = revenueOrders.filter(o => new Date(o.createdAt) >= startMTD)
    const ledger = summarise(mtd, skus, brandId)

    // Warenumsatz = eigener Bruttoumsatz − eigene Erstattungen. KEINE Provisionslogik.
    const merchandiseMTD = ledger.netMerchandiseValue
    const refundedMTD    = ledger.refundedAmount
    const shippingMTD    = ledger.shippingAmount
    // Auszahlung kommt ausschließlich aus den serverseitig berechneten Payouts. null = noch
    // nicht abgerechnet — dann zeigt die Kachel "—" statt einer erfundenen Zahl.
    const settlementAmount = partnerSettlementAmount(payouts)

    // Auch diese Zähler nur über die eigenen Bestellungen — sonst zeigt eine Marke Aufgaben an,
    // die zu einer anderen Marke derselben Bestellung gehören.
    const ownOrders      = revenueOrders
    const openOrders     = ownOrders.filter(o => o.status === 'PAID').length
    const toShip         = ownOrders.filter(o => o.status === 'PAID').slice(0, 3)
    // Retouren gehören einer Marke, nicht der Bestellung — deshalb über returns[].brandId
    // zählen statt über den Order-Status.
    const pendingReturns = ownOrders.reduce((n, o) =>
      n + (o.returns ?? []).filter(r =>
        String(r.brandId) === String(brandId) && r.status === 'REQUESTED').length, 0)

    // Umsatzverlauf — letzte 14 Tage, Vergleich: die 14 Tage davor. Wie die KPI netto nach
    // Erstattungen, damit Kachel und Kurve dieselbe Zahl erzählen. Die Erstattung wird dem Tag
    // der Bestellung zugeordnet (nicht dem Erstattungsdatum), damit sich die Kurve zur MTD-Summe
    // aufaddiert.
    const byDay = new Map<string, number>()
    for (const o of revenueOrders) {
      const k = dayKey(new Date(o.createdAt))
      const net = grossProductAmount(o, skus) - refundedAmount(o, brandId)
      byDay.set(k, (byDay.get(k) ?? 0) + net)
    }
    const chartData: number[] = []
    const chartCompare: number[] = []
    const chartLabels: string[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i)
      const prev = new Date(now); prev.setDate(now.getDate() - i - 14)
      chartData.push(byDay.get(dayKey(d)) ?? 0)
      chartCompare.push(byDay.get(dayKey(prev)) ?? 0)
      chartLabels.push(String(d.getDate()))
    }

    // Umsatz-Mix nach Katalogkategorie — aus echten Order-Items + eigenen Produkten
    // Zuordnung über variantSku statt productId/price — die sendet das Backend nicht
    // (siehe ApiOrderItem in types/api.ts), der Mix wäre sonst dauerhaft leer.
    const catBySku = new Map<string, string>()
    for (const p of products) {
      const cat = Array.isArray(p.catalogueCategory) ? p.catalogueCategory[0] : p.catalogueCategory
      for (const v of p.variants ?? []) {
        if (v.sku) catBySku.set(v.sku, cat ?? 'Sonstige')
      }
    }
    const mixMap = new Map<string, number>()
    for (const o of revenueOrders) {
      for (const item of ownItems(o, skus)) {
        const cat = catBySku.get(item.variantSku ?? '') ?? 'Sonstige'
        mixMap.set(cat, (mixMap.get(cat) ?? 0) + itemGross(item))
      }
    }
    const categoryMix = [...mixMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({
        label: label.charAt(0) + label.slice(1).toLowerCase(),
        value,
        color: DONUT_COLORS[i % DONUT_COLORS.length],
      }))
    // Mitte des Donuts aus den Segmenten selbst — so kann sie nie von ihnen abweichen. Der Mix
    // ist brutto vor Erstattungen, deshalb NICHT merchandiseMTD verwenden.
    const mixTotal = categoryMix.reduce((s, seg) => s + seg.value, 0)

    // Lagerwarnungen — echte Varianten mit niedrigem Bestand
    const lowStock = products.flatMap(p =>
      (p.variants ?? [])
        .filter((v: AdminApiVariant) => (v.stockQuantity ?? 0) <= LOW_STOCK_THRESHOLD)
        .map((v: AdminApiVariant) => ({
          name: `${p.name} — ${[v.color, v.size].filter(Boolean).join(' / ')}`,
          sku: v.sku ?? '—',
          stock: v.stockQuantity ?? 0,
        }))
    ).slice(0, 4)

    return {
      merchandiseMTD, refundedMTD, shippingMTD, settlementAmount,
      openOrders, pendingReturns, toShip, chartData, chartCompare, chartLabels, categoryMix, mixTotal, lowStock,
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, products, brandId, payouts])

  if (loading) return <Loader />

  // Blank return address ⇒ the storefront falls back to the legal/business address on every
  // new return. Nudge the brand to set a dedicated one.
  const needsReturnAddress =
    brand != null && !((brand.returnStreet ?? '').trim() && (brand.returnCity ?? '').trim())

  return (
    <div className="space-y-4">
      <VPageHeader
        eyebrow="Brand Portal"
        title="Übersicht"
        italicTitle={monthLabel}
        sub="Deine Performance auf einen Blick — live aus deinen Bestellungen."
        actions={<VBtn variant="ghost" sm onClick={() => onNavigate('analytics')}>Vollständige Analyse</VBtn>}
      />

      {/* 6-KPI row — alles live; Retourenquote & Conversion folgen in Phase 3 */}
      <VKPIGrid cols={6}>
        <VKPI label="Warenumsatz MTD" value={fmtEurExact(merchandiseMTD)}
              delta={refundedMTD > 0 ? `${monthLabel} · abzgl. ${fmtEurExact(refundedMTD)} Erstattungen` : `${monthLabel} · ohne Versand`}
              deltaTone={refundedMTD > 0 ? 'down' : 'muted'} />
        <VKPI label="Offen"           value={openOrders}        delta="bezahlt, noch nicht versandt"                                  deltaTone={openOrders > 0 ? 'down' : 'muted'} />
        <VKPI label="Offene Retouren" value={pendingReturns}    delta={pendingReturns > 0 ? 'Aktion erforderlich' : 'Keine offenen'}  deltaTone={pendingReturns > 0 ? 'down' : 'muted'} />
        <VKPI label="Offene Auszahlung"
              value={settlementAmount === null ? '—' : fmtEurExact(settlementAmount)}
              delta={settlementAmount === null ? 'noch nicht abgerechnet' : 'laut Abrechnung, nach Provision'}
              deltaTone="muted" />
        <VKPI label="Retourenquote"   value="—"                 delta="Phase 3"                                                       deltaTone="muted" />
        <VKPI label="Conversion"      value="—"                 delta="Phase 3"                                                       deltaTone="muted" />
      </VKPIGrid>

      {/* Umsatzverlauf — echte Tagesumsätze der letzten 14 Tage */}
      {/* Versanderlöse sind eine eigene Ledger-Zeile: keine Provision darauf, deshalb getrennt
          vom Warenumsatz ausgewiesen statt hineingerechnet. */}
      <VCard eyebrow="Umsatz — letzte 14 Tage" title="Umsatzverlauf"
        action={<VChip tone="ghost">{`Versanderlöse MTD ${fmtEurExact(shippingMTD)}`}</VChip>}>
        <VAreaChart data={chartData} compare={chartCompare} labels={chartLabels} fmt={fmtEur} height={230} />
      </VCard>

      {/* Donut + action feed */}
      <Grid3>
        <VCard eyebrow="Kategorien" title="Umsatz-Mix">
          {categoryMix.length > 0 ? (
            <DonutMulti segments={categoryMix} centerValue={fmtK(mixTotal)} centerLabel="Gesamt" />
          ) : (
            <EmptyState message="Noch keine Verkäufe — der Mix erscheint mit der ersten Bestellung." />
          )}
        </VCard>

        <VCard eyebrow="Aktionen" title="Offene Punkte" style={{ gridColumn: 'span 2' }}>
          <div className="divide-y divide-[#F5F5F0]">
            {toShip.length === 0 && lowStock.length === 0 && !needsReturnAddress && (
              <p className="py-3 text-[12px] text-[#9B9B9B]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                Keine offenen Punkte.
              </p>
            )}

            {needsReturnAddress && (
              <div className="flex items-start justify-between py-3">
                <div>
                  <p style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 12, color: '#0A0A0A', fontWeight: 500 }}>
                    Retourenadresse hinterlegen
                  </p>
                  <p style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 11, color: '#9B9B9B', marginTop: 2 }}>
                    Ohne eigene Retourenadresse gehen Rücksendungen an deine Geschäftsadresse.
                  </p>
                </div>
                <button onClick={() => onNavigate('settings')} style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#370E4D', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Einrichten →
                </button>
              </div>
            )}

            {/* Versandbereite Bestellungen — echt */}
            {toShip.map(o => (
              <div key={o.id} className="flex items-start justify-between py-3">
                <div>
                  <p style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 12, color: '#0A0A0A', fontWeight: 500 }}>
                    Bestellung {o.orderNumber ?? `#${String(o.id).slice(0, 8).toUpperCase()}`} versandbereit
                  </p>
                  <p style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 11, color: '#9B9B9B', marginTop: 2 }}>
                    {fmtEur(o.total ?? o.totalAmount ?? 0)} · Bezahlt
                  </p>
                </div>
                <button onClick={() => onNavigate('orders')} style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#370E4D', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Versenden →
                </button>
              </div>
            ))}

            {/* Lagerwarnungen — echte Varianten-Bestände */}
            {lowStock.map(item => (
              <div key={`${item.sku}-${item.name}`} className="flex items-start justify-between py-3">
                <div>
                  <p style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 12, color: '#0A0A0A', fontWeight: 500 }}>
                    {item.stock === 0 ? 'Ausverkauft' : 'Niedriger Lagerbestand'} — {item.name}
                  </p>
                  <p style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 11, color: '#9B9B9B', marginTop: 2 }}>
                    {item.sku} · {item.stock === 0 ? 'Kein Bestand' : `${item.stock} Einh. verbleibend`}
                  </p>
                </div>
                <VStatus tone={item.stock === 0 ? 'error' : 'warn'}>{item.stock === 0 ? 'Ausverkauft' : 'Niedrig'}</VStatus>
              </div>
            ))}
          </div>
        </VCard>
      </Grid3>
    </div>
  )
}
