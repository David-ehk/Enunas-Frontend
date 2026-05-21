'use client'

import { useMemo } from 'react'
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard, HealthBar, fmtEur, StatusBadge, MetricBadge } from './shared'
import type { AdminBrand, AdminCustomer, AdminApiProduct, ApiOrder } from '@/types/api'
import {
  TrendingUp, ShoppingBag, Users, Store, RotateCcw,
  Clock, AlertCircle, CreditCard, Target, Activity,
} from 'lucide-react'

interface Props {
  orders: ApiOrder[]
  brands: AdminBrand[]
  products: AdminApiProduct[]
  customers: AdminCustomer[]
}

function dayKey(iso: string) { return iso?.slice(0, 10) ?? '' }

function last30() {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    return d.toISOString().slice(0, 10)
  })
}

function isToday(iso: string) { return dayKey(iso) === new Date().toISOString().slice(0, 10) }
function inLast(iso: string, days: number) {
  return new Date(iso) >= new Date(Date.now() - days * 86400000)
}

const PURPLE = '#370E4D'
const PURPLE_SOFT = '#7B4F9A'

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#EBEBEB] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] px-3.5 py-2.5 text-xs">
      <p className="text-[#6B6B6B] mb-1.5 text-[10px] uppercase tracking-[0.08em]"
        style={{ fontFamily: 'var(--font-league-spartan)' }}>
        {label}
      </p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: PURPLE }} />
          <span className="text-[#0A0A0A] font-medium">
            {typeof p.value === 'number' && p.name === 'Umsatz' ? fmtEur(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function Overview({ orders, brands, products, customers }: Props) {
  const days = last30()

  const trendData = useMemo(() => days.map(date => {
    const dayOrders = orders.filter(o => dayKey(o.createdAt) === date)
    return {
      date: date.slice(5).replace('-', '/'),
      Umsatz: parseFloat(dayOrders.reduce((s, o) => s + o.totalAmount, 0).toFixed(2)),
      Bestellungen: dayOrders.length,
    }
  }), [orders, days])

  const topBrandsData = useMemo(() => {
    const counts: Record<string, number> = {}
    products.forEach(p => { counts[p.brandName] = (counts[p.brandName] || 0) + 1 })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1]).slice(0, 6)
      .map(([name, count]) => ({ name: name.length > 14 ? name.slice(0, 12) + '…' : name, Produkte: count }))
  }, [products])

  const topProductsData = useMemo(() =>
    [...products].sort((a, b) => b.price - a.price).slice(0, 6)
      .map(p => ({ name: p.name.length > 16 ? p.name.slice(0, 14) + '…' : p.name, Preis: p.price }))
  , [products])

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

  const approvedProducts  = products.filter(p => p.status === 'APPROVED').length
  const deliveredOrders   = orders.filter(o => o.status === 'DELIVERED').length
  const orders30d         = orders.filter(o => inLast(o.createdAt, 30)).length

  const brandHealthPct    = brands.length   > 0 ? Math.round(activeBrands / brands.length * 100)       : 0
  const productHealthPct  = products.length > 0 ? Math.round(approvedProducts / products.length * 100) : 0
  const orderFulfillPct   = orders.length   > 0 ? Math.round(deliveredOrders / orders.length * 100)    : 0
  const activityPct       = Math.min(100, Math.round(orders30d / Math.max(orders.length, 1) * 100))

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8)

  const ChartCard = ({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) => (
    <Card className="border-[#E8E8E8] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] rounded-xl overflow-hidden">
      <CardHeader className="pb-3 px-6 pt-5 border-b border-[#F0F0EB] bg-[#FAFAF8]">
        <CardTitle
          className="text-[12px] font-semibold text-[#0A0A0A] flex items-center gap-2"
          style={{ fontFamily: 'var(--font-league-spartan)', letterSpacing: '0.02em' }}
        >
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

  return (
    <div className="space-y-7">

      {/* ── Revenue row ── */}
      <section>
        <SectionLabel>Umsatz</SectionLabel>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard accent label="Gesamtumsatz" value={fmtEur(revenue)}
            sub={`${orders.length} Bestellungen gesamt`} icon={<TrendingUp className="w-3 h-3" />} />
          <StatCard label="Heute"   value={fmtEur(revenueToday)} sub={`${ordersToday} Bestellungen`} />
          <StatCard label="7 Tage"  value={fmtEur(revenue7d)}   sub={`${orders.filter(o => inLast(o.createdAt, 7)).length} Bestellungen`} />
          <StatCard label="30 Tage" value={fmtEur(revenue30d)}  sub={`${orders30d} Bestellungen`} />
        </div>
      </section>

      {/* ── Ops row ── */}
      <section>
        <SectionLabel>Operativ</SectionLabel>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Offene Bestellungen"  value={openOrders}       sub="Pending · Processing" icon={<ShoppingBag className="w-3 h-3" />} />
          <StatCard label="Pending Brands"        value={pendingBrands}    sub="Warten auf Freigabe"  icon={<Store className="w-3 h-3" />} />
          <StatCard label="Pending Produkte"      value={pendingProducts}  sub="Warten auf Freigabe"  icon={<Clock className="w-3 h-3" />} />
          <StatCard label="Rückgabeanfragen"      value={returns}          sub="Offen"                icon={<RotateCcw className="w-3 h-3" />} />
        </div>
      </section>

      {/* ── Platform row ── */}
      <section>
        <SectionLabel>Plattform</SectionLabel>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Aktive Kunden"     value={activeCustomers || customers.length} sub="Registriert"          icon={<Users className="w-3 h-3" />} />
          <StatCard label="Aktive Marken"     value={activeBrands}                         sub="Approved · Verified"  icon={<Store className="w-3 h-3" />} />
          <StatCard label="AOV"               value={fmtEur(aov)}                          sub="Ø Warenkorbwert"      icon={<Target className="w-3 h-3" />} />
          <StatCard label="Payment Failures"  value="—"                                    sub="Mollie Sync ausstehend" icon={<CreditCard className="w-3 h-3" />} />
        </div>
      </section>

      {/* ── Platform health (Skill visualization) ── */}
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
              <MetricBadge label="Brands" value={`${activeBrands}/${brands.length}`} variant="purple" />
              <MetricBadge label="Produkte" value={`${approvedProducts}/${products.length}`} variant="default" />
              <MetricBadge label="Geliefert" value={`${deliveredOrders}/${orders.length}`} variant="success" />
            </div>
          </CardHeader>
          <CardContent className="px-6 py-6">
            <div className="grid grid-cols-2 gap-x-10 gap-y-5">
              <HealthBar
                label="Brand Approval Rate"
                value={brandHealthPct}
                sub={`${activeBrands} von ${brands.length} aktiv`}
                color="#370E4D"
              />
              <HealthBar
                label="Product Catalog Health"
                value={productHealthPct}
                sub={`${approvedProducts} von ${products.length} freigegeben`}
                color="#4A1566"
              />
              <HealthBar
                label="Order Fulfillment Rate"
                value={orderFulfillPct}
                sub={`${deliveredOrders} von ${orders.length} geliefert`}
                color="#1A5A3C"
              />
              <HealthBar
                label="30-Tage-Aktivität"
                value={activityPct}
                sub={`${orders30d} Bestellungen in letzten 30 Tagen`}
                color="#7A5C1E"
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── Charts row 1 ── */}
      <section>
        <SectionLabel>Zeitverlauf — 30 Tage</SectionLabel>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="Umsatzverlauf" icon={<TrendingUp className="w-3.5 h-3.5" />}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={PURPLE} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={PURPLE} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="#F0F0EB" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9B9B9B', fontFamily: 'var(--font-league-spartan)' }}
                  tickLine={false} axisLine={false} interval={6} />
                <YAxis tick={{ fontSize: 9, fill: '#9B9B9B' }} tickLine={false} axisLine={false}
                  tickFormatter={v => `€${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="Umsatz" stroke={PURPLE} strokeWidth={2}
                  dot={false} activeDot={{ r: 4, fill: PURPLE, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Bestellungen pro Tag" icon={<ShoppingBag className="w-3.5 h-3.5" />}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="#F0F0EB" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9B9B9B', fontFamily: 'var(--font-league-spartan)' }}
                  tickLine={false} axisLine={false} interval={6} />
                <YAxis tick={{ fontSize: 9, fill: '#9B9B9B' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Bestellungen" fill={PURPLE} radius={[3, 3, 0, 0]}
                  opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </section>

      {/* ── Charts row 2 ── */}
      <section>
        <SectionLabel>Top Listen</SectionLabel>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="Top Marken — nach Produktanzahl" icon={<Store className="w-3.5 h-3.5" />}>
            {topBrandsData.length === 0 ? (
              <p className="text-[12px] text-[#6B6B6B] text-center py-8">Keine Daten</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={topBrandsData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="#F0F0EB" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 9, fill: '#9B9B9B' }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#2D2D2D' }}
                    tickLine={false} axisLine={false} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Produkte" fill={PURPLE_SOFT} radius={[0, 3, 3, 0]} opacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Top Produkte — nach Preis" icon={<Package className="w-3.5 h-3.5" />}>
            {topProductsData.length === 0 ? (
              <p className="text-[12px] text-[#6B6B6B] text-center py-8">Keine Daten</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={topProductsData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="#F0F0EB" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 9, fill: '#9B9B9B' }} tickLine={false} axisLine={false}
                    tickFormatter={v => `€${v}`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#2D2D2D' }}
                    tickLine={false} axisLine={false} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Preis" fill={PURPLE} radius={[0, 3, 3, 0]} opacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      </section>

      {/* ── Recent orders ── */}
      <section>
        <SectionLabel>Letzte Aktivität</SectionLabel>
        <Card className="border-[#E8E8E8] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] rounded-xl overflow-hidden">
          <CardHeader className="border-b border-[#F0F0EB] pb-3.5 px-6 pt-5 bg-[#FAFAF8] flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[12px] font-semibold text-[#0A0A0A] flex items-center gap-2"
              style={{ fontFamily: 'var(--font-league-spartan)', letterSpacing: '0.02em' }}>
              <TrendingUp className="w-3.5 h-3.5 text-[#370E4D]" />
              Letzte Bestellungen
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentOrders.length === 0 ? (
              <p className="text-[12px] text-[#6B6B6B] px-6 py-10 text-center">Keine Bestellungen vorhanden.</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid #F0F0EB' }}>
                    {['Bestellung', 'Datum', 'Betrag', 'Status'].map(h => (
                      <th key={h} className="text-[10px] uppercase tracking-[0.12em] text-[#9B9B9B] font-medium py-3 px-5 text-left bg-[#FAFAF8]"
                        style={{ fontFamily: 'var(--font-league-spartan)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid #F5F5F0' }}
                      className="transition-colors duration-150 hover:bg-[#FAFAF8]">
                      <td className="py-3.5 px-5 font-mono text-[12px] font-semibold text-[#0A0A0A]">
                        #{String(order.id).slice(0, 8).toUpperCase()}
                      </td>
                      <td className="py-3.5 px-5 text-[12px] text-[#6B6B6B]">
                        {new Date(order.createdAt).toLocaleDateString('de-DE')}
                      </td>
                      <td className="py-3.5 px-5 text-[12px] font-semibold text-[#0A0A0A]">
                        {fmtEur(order.totalAmount)}
                      </td>
                      <td className="py-3.5 px-5">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </section>

    </div>
  )
}

function Package({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
