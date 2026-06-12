'use client'

import { useState, useEffect, useMemo } from 'react'
import { brandApi } from '@/lib/api/modules/brandApi'
import type { AdminApiProduct, ApiOrder, AdminApiVariant } from '@/types/api'
import {
  VPageHeader, VKPIGrid, VKPI, VCard, VAreaChart, DonutMulti,
  Grid3, VStatus, VChip, VBtn, fmtEur, fmtK, Loader, EmptyState,
} from './vshared'

// Umsatzrelevante Status — unbezahlte (PENDING) und stornierte Bestellungen zählen nicht
const REVENUE_STATUSES = ['PAID', 'SHIPPED', 'DELIVERED', 'RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_RECEIVED', 'REFUNDED']

const DONUT_COLORS = ['#370E4D', '#9B7BB5', '#C9B8D6', '#6B4226', '#1A5A3C']

const LOW_STOCK_THRESHOLD = 5

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

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

  const now = new Date()
  const monthLabel = now.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })

  const {
    grossMTD, netMTD, openOrders, pendingReturns, toShip,
    chartData, chartCompare, chartLabels, categoryMix, lowStock,
  } = useMemo(() => {
    const startMTD = new Date(now.getFullYear(), now.getMonth(), 1)
    const revenueOrders = orders.filter(o => REVENUE_STATUSES.includes(o.status))

    const mtd      = revenueOrders.filter(o => new Date(o.createdAt) >= startMTD)
    const grossMTD = mtd.reduce((s, o) => s + (o.totalAmount ?? 0), 0)
    // Brand erhält Brutto abzüglich 18 % Plattform-Provision (Backend: commission-rate 0.18)
    const netMTD   = Math.round(grossMTD * 0.82)

    const openOrders     = orders.filter(o => o.status === 'PAID').length
    const pendingReturns = orders.filter(o => o.status === 'RETURN_REQUESTED').length
    const toShip         = orders.filter(o => o.status === 'PAID').slice(0, 3)

    // Umsatzverlauf — letzte 14 Tage aus echten Bestellungen, Vergleich: die 14 Tage davor
    const byDay = new Map<string, number>()
    for (const o of revenueOrders) {
      const k = dayKey(new Date(o.createdAt))
      byDay.set(k, (byDay.get(k) ?? 0) + (o.totalAmount ?? 0))
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
    const catByProduct = new Map<string, string>()
    for (const p of products) {
      const cat = Array.isArray(p.catalogueCategory) ? p.catalogueCategory[0] : p.catalogueCategory
      catByProduct.set(String(p.id), cat ?? 'Sonstige')
    }
    const mixMap = new Map<string, number>()
    for (const o of revenueOrders) {
      for (const item of o.items ?? []) {
        const cat = catByProduct.get(String(item.productId)) ?? 'Sonstige'
        mixMap.set(cat, (mixMap.get(cat) ?? 0) + (item.price ?? 0) * (item.quantity ?? 1))
      }
    }
    const categoryMix = [...mixMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({
        label: label.charAt(0) + label.slice(1).toLowerCase(),
        value,
        color: DONUT_COLORS[i % DONUT_COLORS.length],
      }))

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

    return { grossMTD, netMTD, openOrders, pendingReturns, toShip, chartData, chartCompare, chartLabels, categoryMix, lowStock }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, products])

  if (loading) return <Loader />

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
        <VKPI label="Umsatz MTD"      value={fmtK(grossMTD)}  delta={`${monthLabel}`}                                               deltaTone="muted" />
        <VKPI label="Offen"           value={openOrders}        delta="bezahlt, noch nicht versandt"                                  deltaTone={openOrders > 0 ? 'down' : 'muted'} />
        <VKPI label="Offene Retouren" value={pendingReturns}    delta={pendingReturns > 0 ? 'Aktion erforderlich' : 'Keine offenen'}  deltaTone={pendingReturns > 0 ? 'down' : 'muted'} />
        <VKPI label="Nächste Zahlung" value={fmtK(netMTD)}      delta="nach Abrechnung (− 18 % Provision)"                            deltaTone="muted" />
        <VKPI label="Retourenquote"   value="—"                 delta="Phase 3"                                                       deltaTone="muted" />
        <VKPI label="Conversion"      value="—"                 delta="Phase 3"                                                       deltaTone="muted" />
      </VKPIGrid>

      {/* Umsatzverlauf — echte Tagesumsätze der letzten 14 Tage */}
      <VCard eyebrow="Umsatz — letzte 14 Tage" title="Umsatzverlauf"
        action={<VChip tone="ghost">{now.toLocaleDateString('de-DE', { month: 'short' })}</VChip>}>
        <VAreaChart data={chartData} compare={chartCompare} labels={chartLabels} fmt={fmtEur} height={230} />
      </VCard>

      {/* Donut + action feed */}
      <Grid3>
        <VCard eyebrow="Kategorien" title="Umsatz-Mix">
          {categoryMix.length > 0 ? (
            <DonutMulti segments={categoryMix} centerValue={fmtK(grossMTD)} centerLabel="Gesamt" />
          ) : (
            <EmptyState message="Noch keine Verkäufe — der Mix erscheint mit der ersten Bestellung." />
          )}
        </VCard>

        <VCard eyebrow="Aktionen" title="Offene Punkte" style={{ gridColumn: 'span 2' }}>
          <div className="divide-y divide-[#F5F5F0]">
            {toShip.length === 0 && lowStock.length === 0 && (
              <p className="py-3 text-[12px] text-[#9B9B9B]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                Keine offenen Punkte.
              </p>
            )}

            {/* Versandbereite Bestellungen — echt */}
            {toShip.map(o => (
              <div key={o.id} className="flex items-start justify-between py-3">
                <div>
                  <p style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 12, color: '#0A0A0A', fontWeight: 500 }}>
                    Bestellung #{String(o.id).slice(0, 8).toUpperCase()} versandbereit
                  </p>
                  <p style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 11, color: '#9B9B9B', marginTop: 2 }}>
                    {fmtEur(o.totalAmount)} · Bezahlt
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
