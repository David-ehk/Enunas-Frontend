'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { brandApi, productApi } from '@/lib/api'
import type { ApiBrandPartner, BrandOrder, ApiProduct } from '@/types/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  LayoutDashboard, Package, ShoppingBag, LogOut,
  TrendingUp, Truck, ChevronRight,
} from 'lucide-react'

type Tab = 'overview' | 'orders' | 'products'

const NAV: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview',  label: 'Übersicht',   icon: LayoutDashboard },
  { id: 'orders',   label: 'Bestellungen', icon: ShoppingBag },
  { id: 'products', label: 'Produkte',     icon: Package },
]

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  APPROVED:   { label: 'Genehmigt',       cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  VERIFIED:   { label: 'Verifiziert',     cls: 'bg-sky-50 text-sky-700 border-sky-200' },
  PENDING:    { label: 'Ausstehend',      cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  REJECTED:   { label: 'Abgelehnt',      cls: 'bg-rose-50 text-rose-700 border-rose-200' },
  SUSPENDED:  { label: 'Gesperrt',       cls: 'bg-gray-100 text-gray-500 border-gray-200' },
  PAID:       { label: 'Bezahlt',        cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  PROCESSING: { label: 'In Bearbeitung', cls: 'bg-sky-50 text-sky-700 border-sky-200' },
  SHIPPED:    { label: 'Versandt',       cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  DELIVERED:  { label: 'Geliefert',      cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CANCELLED:  { label: 'Storniert',      cls: 'bg-rose-50 text-rose-700 border-rose-200' },
  REFUNDED:   { label: 'Erstattet',      cls: 'bg-gray-100 text-gray-500 border-gray-200' },
}

function StatusBadge({ status }: { status: string }) {
  const { label, cls } = STATUS_MAP[status] ?? { label: status, cls: 'bg-gray-100 text-gray-500 border-gray-200' }
  return (
    <Badge variant="outline" className={`text-[10px] uppercase tracking-[0.05em] font-normal ${cls}`}>
      {label}
    </Badge>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Card className="border-[#E8E8E8] bg-white shadow-none">
      <CardHeader className="pb-2 pt-5 px-5">
        <CardTitle
          className="text-[10px] text-[#6B6B6B] uppercase tracking-[0.12em]"
          style={{ fontFamily: 'var(--font-league-spartan)', fontWeight: 400 }}
        >
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <p className="text-2xl font-semibold text-[#0A0A0A]">{value}</p>
        {sub && <p className="text-xs text-[#6B6B6B] mt-1">{sub}</p>}
      </CardContent>
    </Card>
  )
}

export default function VendorPage() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()

  const [activeTab, setActiveTab]         = useState<Tab>('overview')
  const [brandProfile, setBrandProfile]   = useState<ApiBrandPartner | null>(null)
  const [orders, setOrders]               = useState<BrandOrder[]>([])
  const [products, setProducts]           = useState<ApiProduct[]>([])
  const [loading, setLoading]             = useState(true)
  const [shippingId, setShippingId]       = useState<string | null>(null)
  const [trackingInput, setTrackingInput] = useState('')

  useEffect(() => {
    if (isLoading) return
    if (!user || user.role !== 'BRAND_PARTNER') { router.replace('/dashboard/login'); return }
    Promise.all([
      brandApi.getMe().catch(() => null),
      brandApi.getOrders().catch(() => []),
      productApi.getMy().catch(() => []),
    ]).then(([bp, o, p]) => {
      setBrandProfile(bp)
      const orderList = Array.isArray(o) ? o : ((o as { content?: BrandOrder[] })?.content ?? [])
      const productList = Array.isArray(p) ? p : ((p as { content?: ApiProduct[] })?.content ?? [])
      setOrders(orderList)
      setProducts(productList)
    }).finally(() => setLoading(false))
  }, [isLoading, user, router])

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#F5F5F0' }}>
        <div className="w-8 h-8 border-2 border-[#370E4D]/20 border-t-[#370E4D] rounded-full animate-spin" />
      </div>
    )
  }

  const revenue         = orders.reduce((s, o) => s + (o.totalAmount ?? 0), 0)
  const pendingProducts = products.filter(p => p.status === 'PENDING')
  const readyToShip     = orders.filter(o => o.status === 'PAID')
  const recentOrders    = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)

  function handleShip(orderId: string) {
    if (!trackingInput.trim()) return
    brandApi.shipOrder(orderId, trackingInput.trim()).then(() => {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'SHIPPED' as const } : o))
      setShippingId(null)
      setTrackingInput('')
    })
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Sidebar ── */}
      <aside className="w-[220px] fixed inset-y-0 flex flex-col z-20" style={{ background: '#370E4D' }}>
        <div className="px-6 py-8 border-b border-white/10">
          <h1
            className="text-white"
            style={{ fontFamily: 'var(--font-cormorant)', fontSize: 28, fontWeight: 300, letterSpacing: '0.05em' }}
          >
            Enunas
          </h1>
          <p
            className="text-white/40 mt-0.5"
            style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 9, letterSpacing: '0.4em', textTransform: 'uppercase' }}
          >
            Vendor Portal
          </p>
        </div>

        {/* Brand info */}
        {brandProfile && (
          <div className="px-6 py-4 border-b border-white/10">
            <p className="text-white font-medium text-sm truncate" style={{ fontFamily: 'var(--font-league-spartan)' }}>
              {brandProfile.brandName}
            </p>
            <div className="mt-1">
              <StatusBadge status={brandProfile.status} />
            </div>
          </div>
        )}

        <nav className="flex-1 px-3 py-5 space-y-0.5">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors duration-150 text-left ${
                activeTab === id
                  ? 'bg-white/15 text-white'
                  : 'text-white/55 hover:bg-white/8 hover:text-white/90'
              }`}
              style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 12, letterSpacing: '0.06em' }}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {id === 'orders' && readyToShip.length > 0 && (
                <span className="ml-auto text-[10px] bg-amber-400 text-amber-900 rounded-full px-1.5 py-0.5 leading-none font-semibold">
                  {readyToShip.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <div className="px-3 py-2 mb-1">
            <p className="text-white/35 text-[10px] uppercase tracking-[0.1em]">Angemeldet als</p>
            <p className="text-white/80 text-xs mt-0.5 truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => { logout(); router.replace('/dashboard/login') }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-white/55 hover:bg-white/8 hover:text-white/90 transition-colors duration-150"
            style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 12, letterSpacing: '0.06em' }}
          >
            <LogOut className="w-4 h-4" />
            Abmelden
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="ml-[220px] flex-1 min-h-screen" style={{ background: '#F5F5F0' }}>
        {/* Top bar */}
        <div className="bg-white border-b border-[#E8E8E8] px-8 h-14 flex items-center sticky top-0 z-10">
          <h2
            className="text-[#0A0A0A] font-semibold"
            style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 14, letterSpacing: '0.04em' }}
          >
            {NAV.find(n => n.id === activeTab)?.label ?? 'Übersicht'}
          </h2>
        </div>

        <div className="p-8 space-y-6">

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Umsatz"
                  value={`€ ${revenue.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  sub={`${orders.length} Bestellungen`}
                />
                <StatCard
                  label="Bestellungen"
                  value={orders.length}
                  sub={readyToShip.length > 0 ? `${readyToShip.length} versandbereit` : 'Keine offenen'}
                />
                <StatCard
                  label="Produkte"
                  value={products.length}
                  sub={`${products.filter(p => p.status === 'APPROVED').length} aktiv`}
                />
                <StatCard
                  label="Zur Freigabe"
                  value={pendingProducts.length}
                  sub="Produkte in Prüfung"
                />
              </div>

              {/* Ready to ship */}
              {readyToShip.length > 0 && (
                <Card className="border-amber-200 bg-amber-50 shadow-none">
                  <CardHeader className="pb-3 px-6 pt-5">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-amber-800" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                      <Truck className="w-4 h-4" />
                      {readyToShip.length} Bestellung{readyToShip.length > 1 ? 'en' : ''} versandbereit
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-5">
                    <Button
                      size="sm"
                      className="text-xs"
                      style={{ background: '#370E4D' }}
                      onClick={() => setActiveTab('orders')}
                    >
                      Bestellungen anzeigen <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Recent orders */}
              <Card className="border-[#E8E8E8] bg-white shadow-none">
                <CardHeader className="border-b border-[#E8E8E8] pb-3 px-6 pt-5 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-[#0A0A0A]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                    <TrendingUp className="w-4 h-4 text-[#370E4D]" />
                    Letzte Bestellungen
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-xs text-[#370E4D] hover:text-[#4A1566] h-auto p-0 gap-0.5"
                    onClick={() => setActiveTab('orders')}>
                    Alle anzeigen <ChevronRight className="w-3 h-3" />
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {recentOrders.length === 0 ? (
                    <p className="text-sm text-[#6B6B6B] px-6 py-10 text-center">Keine Bestellungen vorhanden.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#E8E8E8] hover:bg-transparent">
                          <TableHead className="text-[10px] uppercase tracking-[0.1em] text-[#6B6B6B] font-normal pl-6">Bestellung</TableHead>
                          <TableHead className="text-[10px] uppercase tracking-[0.1em] text-[#6B6B6B] font-normal">Datum</TableHead>
                          <TableHead className="text-[10px] uppercase tracking-[0.1em] text-[#6B6B6B] font-normal">Betrag</TableHead>
                          <TableHead className="text-[10px] uppercase tracking-[0.1em] text-[#6B6B6B] font-normal pr-6">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentOrders.map(order => (
                          <TableRow key={order.id} className="border-[#E8E8E8]">
                            <TableCell className="pl-6 font-mono text-sm font-medium text-[#0A0A0A]">#{order.id.slice(0, 8).toUpperCase()}</TableCell>
                            <TableCell className="text-[#6B6B6B] text-sm">{new Date(order.createdAt).toLocaleDateString('de-DE')}</TableCell>
                            <TableCell className="font-medium text-[#0A0A0A]">€{order.totalAmount.toFixed(2)}</TableCell>
                            <TableCell className="pr-6"><StatusBadge status={order.status} /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* ── ORDERS ── */}
          {activeTab === 'orders' && (
            <Card className="border-[#E8E8E8] bg-white shadow-none">
              <CardHeader className="border-b border-[#E8E8E8] pb-3 px-6 pt-5">
                <CardTitle className="text-sm font-semibold text-[#0A0A0A]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                  Alle Bestellungen ({orders.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#E8E8E8] hover:bg-transparent">
                      <TableHead className="text-[10px] uppercase tracking-[0.1em] text-[#6B6B6B] font-normal pl-6">Bestellung</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-[0.1em] text-[#6B6B6B] font-normal">Datum</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-[0.1em] text-[#6B6B6B] font-normal">Betrag</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-[0.1em] text-[#6B6B6B] font-normal">Status</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-[0.1em] text-[#6B6B6B] font-normal pr-6">Versand</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center text-[#6B6B6B] py-16">Keine Bestellungen vorhanden.</TableCell></TableRow>
                    ) : orders.map(order => (
                      <>
                        <TableRow key={order.id} className="border-[#E8E8E8]">
                          <TableCell className="pl-6 font-mono text-sm font-medium text-[#0A0A0A]">#{order.id.slice(0, 8).toUpperCase()}</TableCell>
                          <TableCell className="text-[#6B6B6B] text-sm">{new Date(order.createdAt).toLocaleDateString('de-DE')}</TableCell>
                          <TableCell className="font-medium text-[#0A0A0A]">€{order.totalAmount.toFixed(2)}</TableCell>
                          <TableCell><StatusBadge status={order.status} /></TableCell>
                          <TableCell className="pr-6">
                            {order.status === 'PAID' && shippingId !== order.id && (
                              <Button size="sm" variant="outline" className="h-7 text-xs border-[#370E4D] text-[#370E4D] hover:bg-[#370E4D] hover:text-white transition-colors"
                                onClick={() => { setShippingId(order.id); setTrackingInput('') }}>
                                <Truck className="w-3 h-3 mr-1" /> Versenden
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                        {shippingId === order.id && (
                          <TableRow key={`${order.id}-ship`} className="border-[#E8E8E8] bg-[#F5F5F0]">
                            <TableCell colSpan={5} className="pl-6 pr-6 py-3">
                              <div className="flex items-center gap-3">
                                <input
                                  type="text"
                                  placeholder="Sendungsnummer eingeben…"
                                  value={trackingInput}
                                  onChange={e => setTrackingInput(e.target.value)}
                                  onKeyDown={e => e.key === 'Enter' && handleShip(order.id)}
                                  className="flex-1 text-sm border border-[#E8E8E8] bg-white px-3 py-2 focus:outline-none focus:border-[#370E4D] transition-colors"
                                  style={{ fontFamily: 'var(--font-league-spartan)' }}
                                  autoFocus
                                />
                                <Button size="sm" className="text-xs h-9" style={{ background: '#370E4D' }}
                                  onClick={() => handleShip(order.id)}>
                                  Bestätigen
                                </Button>
                                <Button size="sm" variant="ghost" className="text-xs h-9 text-[#6B6B6B]"
                                  onClick={() => setShippingId(null)}>
                                  Abbrechen
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* ── PRODUCTS ── */}
          {activeTab === 'products' && (
            <Card className="border-[#E8E8E8] bg-white shadow-none">
              <CardHeader className="border-b border-[#E8E8E8] pb-3 px-6 pt-5">
                <CardTitle className="text-sm font-semibold text-[#0A0A0A]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                  Meine Produkte ({products.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#E8E8E8] hover:bg-transparent">
                      <TableHead className="text-[10px] uppercase tracking-[0.1em] text-[#6B6B6B] font-normal pl-6">Produkt</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-[0.1em] text-[#6B6B6B] font-normal">SKU</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-[0.1em] text-[#6B6B6B] font-normal">Kategorie</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-[0.1em] text-[#6B6B6B] font-normal">Preis</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-[0.1em] text-[#6B6B6B] font-normal pr-6">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center text-[#6B6B6B] py-16">Keine Produkte vorhanden.</TableCell></TableRow>
                    ) : products.map(product => (
                      <TableRow key={product.id} className="border-[#E8E8E8]">
                        <TableCell className="pl-6 font-medium text-[#0A0A0A]">{product.name}</TableCell>
                        <TableCell className="text-[#6B6B6B] font-mono text-xs">{product.sku}</TableCell>
                        <TableCell className="text-[#6B6B6B] text-sm capitalize">{product.category}</TableCell>
                        <TableCell className="font-medium text-[#0A0A0A]">€{product.price.toFixed(2)}</TableCell>
                        <TableCell className="pr-6"><StatusBadge status={product.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

        </div>
      </main>
    </div>
  )
}
