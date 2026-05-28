'use client'

import { useMemo, useState } from 'react'
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader, KPIGrid, KPICell, HealthBar, fmtEur, StatusBadge, MetricBadge } from './shared'
import type { AdminBrand, AdminCustomer, AdminApiProduct, ApiOrder } from '@/types/api'
import { TrendingUp, ShoppingBag, Store, Activity, Search, X } from 'lucide-react'

interface Props {
  orders: ApiOrder[]
  brands: AdminBrand[]
  products: AdminApiProduct[]
  customers: AdminCustomer[]
}

function dayKey(iso: string) { return iso?.slice(0, 10) ?? '' }
function last30() {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i)); return d.toISOString().slice(0, 10)
  })
}
function isToday(iso: string) { return dayKey(iso) === new Date().toISOString().slice(0, 10) }
function inLast(iso: string, days: number) { return new Date(iso) >= new Date(Date.now() - days * 86400000) }
function isThisMonth(iso: string) {
  const d = new Date(iso), now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000), hr = Math.floor(diff / 3600000), day = Math.floor(diff / 86400000)
  if (min < 1) return 'gerade'
  if (min < 60) return `${min} Min.`
  if (hr < 24) return `${hr} Std.`
  if (day < 7) return `${day}d`
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
}

function brandInitials(name: string) {
  return name.split(/\s+/).map(w => w[0] ?? '').slice(0, 2).join('').toUpperCase() || '?'
}

const PURPLE = '#370E4D'
const PURPLE_SOFT = '#7B4F9A'

const ORDER_EVENT: Record<string, { title: string; dot: string }> = {
  PENDING:          { title: 'Neue Bestellung',     dot: '#7A5C1E' },
  PAID:             { title: 'Zahlung eingegangen', dot: '#1A5A3C' },
  PROCESSING:       { title: 'In Bearbeitung',      dot: '#7A5C1E' },
  SHIPPED:          { title: 'Versandt',            dot: '#370E4D' },
  DELIVERED:        { title: 'Zugestellt',          dot: '#1A5A3C' },
  CANCELLED:        { title: 'Storniert',           dot: '#8B1E3F' },
  REFUNDED:         { title: 'Erstattet',           dot: '#9B9B9B' },
  RETURN_REQUESTED: { title: 'Rückgabe beantragt',  dot: '#C05C1E' },
  RETURN_APPROVED:  { title: 'Rückgabe genehmigt',  dot: '#0284C7' },
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean; payload?: { value: number; name: string }[]; label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#EBEBEB] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] px-3.5 py-2.5">
      <p className="text-[#6B6B6B] mb-1.5 text-[10px] uppercase tracking-[0.08em]"
        style={{ fontFamily: 'var(--font-league-spartan)' }}>{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: PURPLE }} />
          <span className="text-[12px] text-[#0A0A0A] font-medium">
            {typeof p.value === 'number' && p.name === 'Umsatz' ? fmtEur(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function Overview({ orders, brands, products, customers }: Props) {
  const days = last30()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  // ── Trend chart data ──
  const trendData = useMemo(() => days.map(date => {
    const dayOrders = orders.filter(o => dayKey(o.createdAt) === date)
    return {
      date: date.slice(5).replace('-', '/'),
      Umsatz: parseFloat(dayOrders.reduce((s, o) => s + o.totalAmount, 0).toFixed(2)),
      Bestellungen: dayOrders.length,
    }
  }), [orders, days])

  // ── KPI values ──
  const revenue      = orders.reduce((s, o) => s + o.totalAmount, 0)
  const revenueToday = orders.filter(o => isToday(o.createdAt)).reduce((s, o) => s + o.totalAmount, 0)
  const revenue7d    = orders.filter(o => inLast(o.createdAt, 7)).reduce((s, o) => s + o.totalAmount, 0)
  const revenue30d   = orders.filter(o => inLast(o.createdAt, 30)).reduce((s, o) => s + o.totalAmount, 0)
  const ordersToday  = orders.filter(o => isToday(o.createdAt)).length
  const openOrders   = orders.filter(o => ['PENDING', 'PROCESSING', 'PAID'].includes(o.status)).length
  const returns      = orders.filter(o => o.status === 'RETURN_REQUESTED').length
  const pendingBrands   = brands.filter(b => b.status === 'PENDING').length
  const pendingProducts = products.filter(p => p.status === 'PENDING').length
  const activeBrands    = brands.filter(b => ['APPROVED', 'VERIFIED'].includes(b.status)).length
  const activeCustomers = customers.filter(c => c.status !== 'SUSPENDED' && c.status !== 'DEACTIVATED').length
  const aov = orders.length > 0 ? revenue / orders.length : 0
  const approvedProducts = products.filter(p => p.status === 'APPROVED').length
  const deliveredOrders  = orders.filter(o => o.status === 'DELIVERED').length
  const orders30d        = orders.filter(o => inLast(o.createdAt, 30)).length
  const brandHealthPct   = brands.length   > 0 ? Math.round(activeBrands / brands.length * 100) : 0
  const productHealthPct = products.length > 0 ? Math.round(approvedProducts / products.length * 100) : 0
  const orderFulfillPct  = orders.length   > 0 ? Math.round(deliveredOrders / orders.length * 100) : 0
  const activityPct      = Math.min(100, Math.round(orders30d / Math.max(orders.length, 1) * 100))

  // ── MTD revenue per brand ──
  const productBrandMap = useMemo(() => {
    const m: Record<string, string> = {}
    products.forEach(p => { m[p.id] = p.brandName })
    return m
  }, [products])

  const mtdRevenueByBrand = useMemo(() => {
    const m: Record<string, number> = {}
    orders.filter(o => isThisMonth(o.createdAt)).forEach(o => {
      o.items.forEach(item => {
        const brand = productBrandMap[item.productId]
        if (brand) m[brand] = (m[brand] ?? 0) + item.price * item.quantity
      })
    })
    return m
  }, [orders, productBrandMap])

  const currentMonthLabel = new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })

  const rankedBrands = useMemo(() =>
    [...brands]
      .sort((a, b) => {
        const ra = mtdRevenueByBrand[a.brandName] ?? 0
        const rb = mtdRevenueByBrand[b.brandName] ?? 0
        if (ra !== rb) return rb - ra
        return (b.productsCount ?? 0) - (a.productsCount ?? 0)
      })
      .slice(0, 8)
  , [brands, mtdRevenueByBrand])

  const hasMtdRevenue = Object.values(mtdRevenueByBrand).some(v => v > 0)
  const maxBrandVal = Math.max(
    ...rankedBrands.map(b => hasMtdRevenue ? (mtdRevenueByBrand[b.brandName] ?? 0) : (b.productsCount ?? 0)),
    1,
  )

  // ── Activity feed ──
  const activityEvents = useMemo(() => {
    type AEvent = { id: string; title: string; sub: string; at: string; dot: string }
    const events: AEvent[] = []
    orders.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 15)
      .forEach(o => {
        const ev = ORDER_EVENT[o.status] ?? { title: 'Bestellung', dot: '#9B9B9B' }
        events.push({ id: `order-${o.id}`, title: ev.title, sub: `#${String(o.id).slice(0, 8).toUpperCase()} · ${fmtEur(o.totalAmount)}`, at: o.createdAt, dot: ev.dot })
      })
    brands.filter(b => b.createdAt).sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()).slice(0, 6)
      .forEach(b => {
        const isActive = ['APPROVED', 'VERIFIED'].includes(b.status)
        events.push({ id: `brand-${b.id}`, title: b.status === 'PENDING' ? 'Marke beantragt' : isActive ? 'Marke aktiv' : b.status === 'REJECTED' ? 'Marke abgelehnt' : 'Marke gesperrt', sub: b.brandName, at: b.createdAt!, dot: b.status === 'PENDING' ? '#7A5C1E' : isActive ? '#1A5A3C' : '#8B1E3F' })
      })
    products.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6)
      .forEach(p => {
        events.push({ id: `product-${p.id}`, title: p.status === 'PENDING' ? 'Produkt eingereicht' : p.status === 'APPROVED' ? 'Produkt freigegeben' : 'Produkt abgelehnt', sub: p.name.length > 32 ? p.name.slice(0, 30) + '…' : p.name, at: p.createdAt, dot: p.status === 'PENDING' ? '#7A5C1E' : p.status === 'APPROVED' ? '#1A5A3C' : '#8B1E3F' })
      })
    return events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 18)
  }, [orders, brands, products])

  // ── Global search ──
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (q.length < 2) return null
    const matchBrands = brands.filter(b =>
      b.brandName.toLowerCase().includes(q) || b.email.toLowerCase().includes(q)
    ).slice(0, 4)
    const matchProducts = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brandName.toLowerCase().includes(q) ||
      (p.sku ?? '').toLowerCase().includes(q)
    ).slice(0, 4)
    const matchOrders = orders.filter(o =>
      String(o.id).toLowerCase().includes(q) ||
      o.status.toLowerCase().includes(q) ||
      fmtEur(o.totalAmount).includes(q)
    ).slice(0, 4)
    const matchCustomers = customers.filter(c =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    ).slice(0, 4)
    const total = matchBrands.length + matchProducts.length + matchOrders.length + matchCustomers.length
    return { matchBrands, matchProducts, matchOrders, matchCustomers, total }
  }, [searchQuery, brands, products, orders, customers])

  const ChartCard = ({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) => (
    <Card className="border-[#E8E8E8] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] rounded-xl overflow-hidden">
      <CardHeader className="pb-3 px-6 pt-5 border-b border-[#F0F0EB] bg-[#FAFAF8]">
        <CardTitle className="text-[12px] font-semibold text-[#0A0A0A] flex items-center gap-2"
          style={{ fontFamily: 'var(--font-league-spartan)', letterSpacing: '0.02em' }}>
          {icon && <span className="text-[#370E4D]">{icon}</span>}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pt-5 pb-5">{children}</CardContent>
    </Card>
  )

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="text-[10px] uppercase tracking-[0.18em] text-[#9B9B9B] mb-3 font-medium"
      style={{ fontFamily: 'var(--font-league-spartan)' }}>
      {children}
    </p>
  )

  const ResultSection = ({ label, count, children }: { label: string; count: number; children: React.ReactNode }) => (
    <div>
      <div className="px-4 py-2 flex items-center gap-2" style={{ borderBottom: '1px solid #F5F5F0' }}>
        <span className="text-[9px] uppercase tracking-[0.18em] font-medium text-[#9B9B9B]"
          style={{ fontFamily: 'var(--font-league-spartan)' }}>{label}</span>
        <span className="text-[9px] font-medium text-[#C0C0BC] bg-[#F5F5F0] rounded-full px-1.5 py-0.5">{count}</span>
      </div>
      {children}
    </div>
  )

  const ResultRow = ({ primary, secondary, badge, mono }: {
    primary: string; secondary?: string; badge?: string; mono?: string
  }) => (
    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#FAFAF8] transition-colors duration-100 cursor-default"
      style={{ borderBottom: '1px solid #F9F9F6' }}>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-[#0A0A0A] truncate" style={{ fontFamily: 'var(--font-league-spartan)' }}>{primary}</p>
        {secondary && <p className="text-[10px] text-[#9B9B9B] truncate mt-0.5" style={{ fontFamily: 'var(--font-league-spartan)' }}>{secondary}</p>}
      </div>
      {mono && <span className="font-mono text-[10px] text-[#6B6B6B] shrink-0">{mono}</span>}
      {badge && <StatusBadge status={badge} />}
    </div>
  )

  return (
    <div className="space-y-7">

      <PageHeader
        eyebrow={new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        title="Plattform"
        italicTitle="übersicht."
        sub="Alle Marken, alle Bestellungen, alle Umsätze."
      />

      {/* ── Global Search ── */}
      <div className="relative">
        <div
          className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 transition-all duration-200"
          style={{
            border: searchOpen ? '1px solid rgba(55,14,77,0.3)' : '1px solid #E8E8E8',
            boxShadow: searchOpen ? '0 0 0 3px rgba(55,14,77,0.06)' : 'none',
          }}
        >
          <Search className="w-4 h-4 shrink-0" style={{ color: searchOpen ? '#370E4D' : '#9B9B9B' }} />
          <input
            type="text"
            placeholder="Marken, Produkte, Bestellungen, Kunden durchsuchen…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setTimeout(() => setSearchOpen(false), 160)}
            className="flex-1 bg-transparent focus:outline-none text-[13px] text-[#0A0A0A] placeholder:text-[#C0C0BC]"
            style={{ fontFamily: 'var(--font-league-spartan)' }}
          />
          {searchQuery ? (
            <button
              onMouseDown={e => { e.preventDefault(); setSearchQuery('') }}
              className="shrink-0 text-[#C0C0BC] hover:text-[#6B6B6B] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="shrink-0 text-[10px] text-[#C0C0BC] border border-[#EBEBEB] rounded px-1.5 py-0.5 font-mono">
              ⌘K
            </kbd>
          )}
        </div>

        {/* Results panel */}
        {searchOpen && searchResults && (
          <div
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl overflow-hidden z-50"
            style={{ border: '1px solid #E8E8E8', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
          >
            {searchResults.total === 0 ? (
              <div className="px-4 py-5 text-center">
                <p className="text-[12px] text-[#9B9B9B]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                  Keine Ergebnisse für &ldquo;{searchQuery}&rdquo;
                </p>
              </div>
            ) : (
              <>
                {searchResults.matchBrands.length > 0 && (
                  <ResultSection label="Marken" count={searchResults.matchBrands.length}>
                    {searchResults.matchBrands.map(b => (
                      <ResultRow key={b.id} primary={b.brandName} secondary={b.email} badge={b.status} />
                    ))}
                  </ResultSection>
                )}
                {searchResults.matchProducts.length > 0 && (
                  <ResultSection label="Produkte" count={searchResults.matchProducts.length}>
                    {searchResults.matchProducts.map(p => (
                      <ResultRow key={p.id} primary={p.name} secondary={p.brandName} mono={p.sku} badge={p.status} />
                    ))}
                  </ResultSection>
                )}
                {searchResults.matchOrders.length > 0 && (
                  <ResultSection label="Bestellungen" count={searchResults.matchOrders.length}>
                    {searchResults.matchOrders.map(o => (
                      <ResultRow
                        key={o.id}
                        primary={`#${String(o.id).slice(0, 8).toUpperCase()}`}
                        secondary={new Date(o.createdAt).toLocaleDateString('de-DE')}
                        mono={fmtEur(o.totalAmount)}
                        badge={o.status}
                      />
                    ))}
                  </ResultSection>
                )}
                {searchResults.matchCustomers.length > 0 && (
                  <ResultSection label="Kunden" count={searchResults.matchCustomers.length}>
                    {searchResults.matchCustomers.map(c => (
                      <ResultRow key={c.id} primary={`${c.firstName} ${c.lastName}`} secondary={c.email} badge={c.status} />
                    ))}
                  </ResultSection>
                )}
                <div className="px-4 py-2 bg-[#FAFAF8]" style={{ borderTop: '1px solid #F0F0EB' }}>
                  <p className="text-[10px] uppercase tracking-[0.1em] text-[#C0C0BC]"
                    style={{ fontFamily: 'var(--font-league-spartan)' }}>
                    {searchResults.total} Ergebnis{searchResults.total !== 1 ? 'se' : ''} gefunden
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Revenue KPIs ── */}
      <section>
        <SectionLabel>Umsatz</SectionLabel>
        <KPIGrid>
          <KPICell accent label="Gesamtumsatz" value={fmtEur(revenue)} sub={`${orders.length} Bestellungen gesamt`} />
          <KPICell label="Heute"   value={fmtEur(revenueToday)} sub={`${ordersToday} Bestellungen`} />
          <KPICell label="7 Tage"  value={fmtEur(revenue7d)}   sub={`${orders.filter(o => inLast(o.createdAt, 7)).length} Bestellungen`} />
          <KPICell label="30 Tage" value={fmtEur(revenue30d)}  sub={`${orders30d} Bestellungen`} />
        </KPIGrid>
      </section>

      {/* ── Ops KPIs ── */}
      <section>
        <SectionLabel>Operativ</SectionLabel>
        <KPIGrid>
          <KPICell label="Offene Bestellungen" value={openOrders}      sub="Pending · Processing" />
          <KPICell label="Pending Brands"       value={pendingBrands}   sub="Warten auf Freigabe" />
          <KPICell label="Pending Produkte"     value={pendingProducts} sub="Warten auf Freigabe" />
          <KPICell label="Rückgabeanfragen"     value={returns}         sub="Offen" />
        </KPIGrid>
      </section>

      {/* ── Platform KPIs ── */}
      <section>
        <SectionLabel>Plattform</SectionLabel>
        <KPIGrid>
          <KPICell label="Aktive Kunden"    value={activeCustomers || customers.length} sub="Registriert" />
          <KPICell label="Aktive Marken"    value={activeBrands}                         sub="Approved · Verified" />
          <KPICell label="Ø Warenkorbwert"  value={fmtEur(aov)}                          sub="Alle Bestellungen" />
          <KPICell label="Payment Failures" value="—"                                    sub="Mollie Sync ausstehend" />
        </KPIGrid>
      </section>

      {/* ── Platform Health ── */}
      <section>
        <SectionLabel>Platform Health</SectionLabel>
        <Card className="border-[#E8E8E8] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] rounded-xl overflow-hidden">
          <CardHeader className="pb-3.5 px-6 pt-5 border-b border-[#F0F0EB] bg-[#FAFAF8] flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[12px] font-semibold text-[#0A0A0A] flex items-center gap-2"
              style={{ fontFamily: 'var(--font-league-spartan)', letterSpacing: '0.02em' }}>
              <Activity className="w-3.5 h-3.5 text-[#370E4D]" />
              Platform Health Score
            </CardTitle>
            <div className="flex items-center gap-2">
              <MetricBadge label="Brands"    value={`${activeBrands}/${brands.length}`}       variant="purple" />
              <MetricBadge label="Produkte"  value={`${approvedProducts}/${products.length}`} variant="default" />
              <MetricBadge label="Geliefert" value={`${deliveredOrders}/${orders.length}`}    variant="success" />
            </div>
          </CardHeader>
          <CardContent className="px-6 py-6">
            <div className="grid grid-cols-2 gap-x-10 gap-y-5">
              <HealthBar label="Brand Approval Rate"    value={brandHealthPct}   sub={`${activeBrands} von ${brands.length} aktiv`}               color="#370E4D" />
              <HealthBar label="Product Catalog Health" value={productHealthPct} sub={`${approvedProducts} von ${products.length} freigegeben`}    color="#4A1566" />
              <HealthBar label="Order Fulfillment Rate" value={orderFulfillPct}  sub={`${deliveredOrders} von ${orders.length} geliefert`}          color="#1A5A3C" />
              <HealthBar label="30-Tage-Aktivität"      value={activityPct}      sub={`${orders30d} Bestellungen in letzten 30 Tagen`}              color="#7A5C1E" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── Charts ── */}
      <section>
        <SectionLabel>Zeitverlauf — 30 Tage</SectionLabel>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="Umsatzverlauf" icon={<TrendingUp className="w-3.5 h-3.5" />}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="#F0F0EB" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9B9B9B', fontFamily: 'var(--font-league-spartan)' }} tickLine={false} axisLine={false} interval={6} />
                <YAxis tick={{ fontSize: 9, fill: '#9B9B9B' }} tickLine={false} axisLine={false} tickFormatter={v => `€${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="Umsatz" stroke={PURPLE} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: PURPLE, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Bestellungen pro Tag" icon={<ShoppingBag className="w-3.5 h-3.5" />}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="#F0F0EB" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9B9B9B', fontFamily: 'var(--font-league-spartan)' }} tickLine={false} axisLine={false} interval={6} />
                <YAxis tick={{ fontSize: 9, fill: '#9B9B9B' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Bestellungen" fill={PURPLE} radius={[3, 3, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </section>

      {/* ── Top Brands + Activity Feed ── */}
      <section>
        <SectionLabel>Rankings & Aktivität</SectionLabel>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Top Brands MTD */}
          <Card className="border-[#E8E8E8] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] rounded-xl overflow-hidden">
            <CardHeader className="pb-3 px-6 pt-5 border-b border-[#F0F0EB] bg-[#FAFAF8] flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-[12px] font-semibold text-[#0A0A0A] flex items-center gap-2"
                style={{ fontFamily: 'var(--font-league-spartan)', letterSpacing: '0.02em' }}>
                <Store className="w-3.5 h-3.5 text-[#370E4D]" />
                Top Marken
              </CardTitle>
              <span className="text-[10px] uppercase tracking-[0.1em] text-[#9B9B9B]"
                style={{ fontFamily: 'var(--font-league-spartan)' }}>
                {hasMtdRevenue ? `Umsatz · ${currentMonthLabel}` : `Produkte · ${currentMonthLabel}`}
              </span>
            </CardHeader>
            <CardContent className="px-6 py-2">
              {rankedBrands.length === 0 ? (
                <p className="text-[12px] text-[#6B6B6B] text-center py-10">Keine Marken vorhanden.</p>
              ) : rankedBrands.map((brand, i) => {
                const rank = i + 1
                const val = hasMtdRevenue ? (mtdRevenueByBrand[brand.brandName] ?? 0) : (brand.productsCount ?? 0)
                const pct = Math.round((val / maxBrandVal) * 100)
                return (
                  <div key={brand.id} className="flex items-center gap-3 py-3"
                    style={{ borderBottom: i < rankedBrands.length - 1 ? '1px solid #F5F5F0' : 'none' }}>
                    <span className="shrink-0 w-5 text-center tabular-nums"
                      style={{ fontFamily: 'var(--font-cormorant)', fontSize: 17, fontWeight: 300, color: rank === 1 ? '#370E4D' : '#CDCDC5' }}>
                      {rank}
                    </span>
                    <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: rank === 1 ? '#370E4D' : '#F5F5F0', color: rank === 1 ? '#fff' : '#9B9B9B', fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-league-spartan)' }}>
                      {brandInitials(brand.brandName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[12px] font-semibold text-[#0A0A0A] truncate"
                          style={{ fontFamily: 'var(--font-league-spartan)' }}>
                          {brand.brandName}
                        </span>
                        <StatusBadge status={brand.status} />
                      </div>
                      <div className="h-[3px] bg-[#F0F0EB] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: rank === 1 ? '#370E4D' : PURPLE_SOFT, opacity: 0.45 + 0.55 * (pct / 100) }} />
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[12px] font-semibold text-[#0A0A0A]"
                        style={{ fontFamily: 'var(--font-league-spartan)' }}>
                        {hasMtdRevenue ? fmtEur(mtdRevenueByBrand[brand.brandName] ?? 0) : (brand.productsCount ?? 0)}
                      </p>
                      <p className="text-[9px] uppercase tracking-[0.08em] text-[#9B9B9B]"
                        style={{ fontFamily: 'var(--font-league-spartan)' }}>
                        {hasMtdRevenue ? 'MTD Umsatz' : 'Produkte'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Live Activity Feed */}
          <Card className="border-[#E8E8E8] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] rounded-xl overflow-hidden">
            <CardHeader className="pb-3 px-6 pt-5 border-b border-[#F0F0EB] bg-[#FAFAF8] flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-[12px] font-semibold text-[#0A0A0A] flex items-center gap-2"
                style={{ fontFamily: 'var(--font-league-spartan)', letterSpacing: '0.02em' }}>
                <Activity className="w-3.5 h-3.5 text-[#370E4D]" />
                Letzte Aktivität
              </CardTitle>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1A5A3C] animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.1em] text-[#9B9B9B]"
                  style={{ fontFamily: 'var(--font-league-spartan)' }}>Live</span>
              </span>
            </CardHeader>
            <CardContent className="px-6 py-2" style={{ maxHeight: 420, overflowY: 'auto' }}>
              {activityEvents.length === 0 ? (
                <p className="text-[12px] text-[#6B6B6B] text-center py-10">Keine Aktivität vorhanden.</p>
              ) : activityEvents.map((event, i) => (
                <div key={event.id} className="flex items-start gap-3 py-3"
                  style={{ borderBottom: i < activityEvents.length - 1 ? '1px solid #F5F5F0' : 'none' }}>
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: event.dot }} />
                    {i < activityEvents.length - 1 && (
                      <div className="w-px flex-1 mt-1.5" style={{ background: '#F0F0EB', minHeight: 14 }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-[#0A0A0A] leading-tight"
                      style={{ fontFamily: 'var(--font-league-spartan)' }}>{event.title}</p>
                    <p className="text-[11px] text-[#6B6B6B] mt-0.5 truncate"
                      style={{ fontFamily: 'var(--font-league-spartan)' }}>{event.sub}</p>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.06em] shrink-0 mt-1"
                    style={{ fontFamily: 'var(--font-league-spartan)', color: '#9B9B9B' }}>
                    {relativeTime(event.at)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>
      </section>

    </div>
  )
}
