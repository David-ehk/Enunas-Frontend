'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { adminApi } from '@/lib/api'
import type { AdminBrand, AdminCustomer, AdminApiProduct, ApiOrder } from '@/types/api'
import {
  LayoutDashboard, Users, Store, Package,
  ShoppingBag, RotateCcw, BarChart2,
  ShieldAlert, MessageSquare, LogOut, AlertCircle, Sparkles, Tag, Receipt,
} from 'lucide-react'

import Overview    from './_components/Overview'
import Customers   from './_components/Customers'
import Brands      from './_components/Brands'
import Products    from './_components/Products'
import Orders      from './_components/Orders'
import Returns      from './_components/Returns'
import Analytics    from './_components/Analytics'
import Storefront   from './_components/Storefront'
import Discounts    from './_components/Discounts'
import Settlements  from './_components/Settlements'

type Tab =
  | 'overview' | 'customers' | 'brands' | 'products'
  | 'orders'   | 'returns'   | 'discounts' | 'settlements'
  | 'analytics'| 'content'   | 'support'   | 'storefront'

interface NavItem { id: Tab; label: string; icon: React.ElementType; phase2?: boolean }

const NAV_SECTIONS: { group: string; items: NavItem[] }[] = [
  {
    group: '',
    items: [
      { id: 'overview',   label: 'Übersicht',     icon: LayoutDashboard },
    ],
  },
  {
    group: 'Verwaltung',
    items: [
      { id: 'customers',   label: 'Kunden',         icon: Users },
      { id: 'brands',      label: 'Marken',         icon: Store },
      { id: 'products',    label: 'Produkte',       icon: Package },
      { id: 'orders',      label: 'Bestellungen',   icon: ShoppingBag },
      { id: 'storefront',  label: 'Schaufenster',   icon: Sparkles },
    ],
  },
  {
    group: 'Finanzen',
    items: [
      { id: 'returns',      label: 'Rückgaben',      icon: RotateCcw },
      { id: 'discounts',    label: 'Rabattcodes',    icon: Tag },
      { id: 'settlements',  label: 'Abrechnung',     icon: Receipt },
    ],
  },
  {
    group: 'Phase 2',
    items: [
      { id: 'analytics',  label: 'Analytics',      icon: BarChart2,      phase2: true },
      { id: 'content',    label: 'Content',        icon: ShieldAlert,    phase2: true },
      { id: 'support',    label: 'Support',        icon: MessageSquare,  phase2: true },
    ],
  },
]

const TITLES: Record<Tab, string> = {
  overview:    'Übersicht',
  customers:   'Kunden',
  brands:      'Marken',
  products:    'Produkte',
  orders:      'Bestellungen',
  returns:     'Rückgaben',
  discounts:   'Rabattcodes',
  settlements: 'Abrechnung',
  analytics:   'Analytics',
  content:     'Content Moderation',
  support:     'Support',
  storefront:  'Schaufenster',
}

const SUBTITLES: Record<Tab, string> = {
  overview:    'Plattformüberblick & KPIs',
  customers:   'Kundenverwaltung',
  brands:      'Markenverwaltung & Genehmigungen',
  products:    'Produktkatalog & Freigaben',
  orders:      'Bestellungsverwaltung',
  returns:     'Rückgaben & Erstattungen',
  discounts:   'Plattform- & Marken-Rabattcodes',
  settlements: 'Monatliche Provisionsabrechnung & Auszahlungen je Brand',
  analytics:   'Phase 2',
  content:     'Phase 2',
  support:     'Phase 2',
  storefront:  'Sortiment kuratieren — Trendy, Drops & Empfehlungen',
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white border border-[#E8E8E8] shadow-[0_2px_12px_rgba(0,0,0,0.06)] flex items-center justify-center mb-5">
        <ShieldAlert className="w-6 h-6 text-[#6B6B6B]" />
      </div>
      <p className="text-[14px] font-semibold text-[#0A0A0A]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
        {title}
      </p>
      <p className="text-[12px] text-[#6B6B6B] mt-2">Wird in Phase 2 aktiviert.</p>
    </div>
  )
}

export default function AdminPage() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [brands, setBrands]       = useState<AdminBrand[]>([])
  const [products, setProducts]   = useState<AdminApiProduct[]>([])
  const [orders, setOrders]       = useState<ApiOrder[]>([])
  const [customers, setCustomers] = useState<AdminCustomer[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    if (isLoading) return
    if (!user || user.role !== 'ADMIN') { router.replace('/dashboard/login'); return }
    Promise.all([
      adminApi.brands.getAll().catch(() => []),
      adminApi.products.getAll().catch(() => []),
      adminApi.orders.getAll().catch(() => []),
      adminApi.customers.getAll().catch(() => []),
    ]).then(([b, p, o, c]) => {
      setBrands(b); setProducts(p); setOrders(o); setCustomers(c)
    }).finally(() => setLoading(false))
  }, [isLoading, user, router])

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#F2F2EC' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-full border-2 border-[#E8E8E8]" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#370E4D] animate-spin" />
          </div>
          <p className="text-[11px] text-[#6B6B6B] uppercase tracking-[0.15em]"
            style={{ fontFamily: 'var(--font-league-spartan)' }}>
            Wird geladen
          </p>
        </div>
      </div>
    )
  }

  const pendingBrands   = brands.filter(b => b.status === 'PENDING').length
  const pendingProducts = products.filter(p => p.status === 'PENDING').length
  const pendingReturns  = orders.filter(o => o.status === 'RETURN_REQUESTED').length
  const totalAlerts     = pendingBrands + pendingProducts + pendingReturns

  const BADGES: Partial<Record<Tab, number>> = {
    brands:   pendingBrands,
    products: pendingProducts,
    returns:  pendingReturns,
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Sidebar ── */}
      <aside
        className="w-[228px] fixed inset-y-0 flex flex-col z-20 overflow-y-auto"
        style={{
          background: 'linear-gradient(180deg, #3A1058 0%, #370E4D 40%, #2D0A40 100%)',
          boxShadow: '1px 0 0 rgba(0,0,0,0.12), 4px 0 16px rgba(0,0,0,0.12)',
        }}
      >
        {/* Logo */}
        <div className="px-6 py-7 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: 15, color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>E</span>
            </div>
            <div>
              <h1 className="text-white leading-none"
                style={{ fontFamily: 'var(--font-cormorant)', fontSize: 18, fontWeight: 400, letterSpacing: '0.04em' }}>
                Enunas
              </h1>
              <p className="text-white/35 mt-0.5"
                style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 8, letterSpacing: '0.35em', textTransform: 'uppercase' }}>
                Admin Portal
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4">
          {NAV_SECTIONS.map(({ group, items }) => (
            <div key={group} className="mb-5">
              {group && (
                <p className="px-3 mb-1.5 text-[9px] uppercase tracking-[0.25em] font-medium"
                  style={{ fontFamily: 'var(--font-league-spartan)', color: 'rgba(255,255,255,0.2)' }}>
                  {group}
                </p>
              )}
              <div className="space-y-0.5">
                {items.map(({ id, label, icon: Icon, phase2 }) => {
                  const isActive = activeTab === id
                  return (
                    <div key={id} className="relative">
                      <div
                        className="absolute inset-y-1 left-0 w-0.5 rounded-r-sm transition-all duration-200"
                        style={{ background: isActive ? 'rgba(255,255,255,0.55)' : 'transparent' }}
                      />
                      <button
                        onClick={() => setActiveTab(id)}
                        className="w-full flex items-center gap-2.5 pl-4 pr-3 py-2 rounded-lg text-left transition-all duration-200"
                        style={{
                          fontFamily: 'var(--font-league-spartan)',
                          fontSize: 12,
                          letterSpacing: '0.04em',
                          background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                          color: isActive ? '#fff' : phase2 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.55)',
                          boxShadow: isActive ? 'inset 0 0 0 1px rgba(255,255,255,0.1)' : 'none',
                          cursor: phase2 ? 'default' : 'pointer',
                        }}
                        onMouseEnter={e => {
                          if (!isActive && !phase2)
                            e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                        }}
                        onMouseLeave={e => {
                          if (!isActive)
                            e.currentTarget.style.background = 'transparent'
                        }}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="flex-1 font-medium">{label}</span>
                        {BADGES[id] ? (
                          <span className="text-[9px] font-bold bg-amber-400 text-amber-900 rounded-full px-1.5 py-0.5 leading-none">
                            {BADGES[id]}
                          </span>
                        ) : phase2 ? (
                          <span className="text-[8px] font-medium rounded-md px-1.5 py-0.5 leading-none"
                            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.2)' }}>
                            bald
                          </span>
                        ) : null}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="px-3 py-4 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="px-3 py-3 mb-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span className="text-white text-[11px] font-semibold">
                  {user?.email?.[0]?.toUpperCase() ?? 'A'}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-white/45 text-[9px] uppercase tracking-[0.1em]"
                  style={{ fontFamily: 'var(--font-league-spartan)' }}>
                  Admin
                </p>
                <p className="text-white/75 text-[11px] truncate mt-0.5">{user?.email}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => { logout(); router.replace('/dashboard/login') }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 mt-1"
            style={{
              fontFamily: 'var(--font-league-spartan)',
              fontSize: 11,
              letterSpacing: '0.04em',
              color: 'rgba(255,255,255,0.4)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'rgba(255,255,255,0.4)'
            }}
          >
            <LogOut className="w-3.5 h-3.5" />
            Abmelden
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main
        className="flex-1 min-h-screen"
        style={{ marginLeft: 228, background: '#F2F2EC' }}
      >
        {/* Top bar */}
        <div
          className="bg-white px-8 h-14 flex items-center justify-between sticky top-0 z-10"
          style={{ borderBottom: '1px solid #EBEBEB', boxShadow: '0 1px 0 #EBEBEB, 0 4px 12px rgba(0,0,0,0.03)' }}
        >
          <div className="flex items-center gap-3">
            <div>
              <h2
                className="text-[#0A0A0A] leading-tight"
                style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 13, fontWeight: 600, letterSpacing: '0.03em' }}
              >
                {TITLES[activeTab]}
              </h2>
              <p
                className="text-[10px] uppercase tracking-[0.1em] mt-0.5"
                style={{ fontFamily: 'var(--font-league-spartan)', color: '#9B9B9B' }}
              >
                {SUBTITLES[activeTab]}
              </p>
            </div>
          </div>
          {totalAlerts > 0 && (
            <div className="flex items-center gap-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200/80 px-3.5 py-1.5 rounded-xl font-medium"
              style={{ fontFamily: 'var(--font-league-spartan)' }}>
              <AlertCircle className="w-3.5 h-3.5" />
              {totalAlerts} ausstehende Aktion{totalAlerts > 1 ? 'en' : ''}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-7 max-w-[1600px]">
          {activeTab === 'overview'  && <Overview orders={orders} brands={brands} products={products} customers={customers} />}
          {activeTab === 'customers' && <Customers orders={orders} />}
          {activeTab === 'brands'    && <Brands />}
          {activeTab === 'products'  && <Products orders={orders} />}
          {activeTab === 'orders'    && <Orders customers={customers} />}
          {activeTab === 'returns'   && <Returns customers={customers} />}
          {activeTab === 'discounts'   && <Discounts />}
          {activeTab === 'settlements' && <Settlements />}
          {activeTab === 'analytics'   && <Analytics />}
          {activeTab === 'storefront'  && <Storefront products={products} />}
          {activeTab === 'content'     && <ComingSoon title="Content Moderation" />}
          {activeTab === 'support'     && <ComingSoon title="Support" />}
        </div>
      </main>
    </div>
  )
}
