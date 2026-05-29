'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { brandApi } from '@/lib/api/modules/brandApi'
import type { ApiBrandPartner } from '@/types/api'
import { LayoutDashboard, Package, ShoppingBag, BarChart2, RotateCcw, CreditCard, Megaphone, Settings2, LogOut } from 'lucide-react'
import { StatusBadge } from '../admin/_components/shared'
import Overview from './_components/Overview'
import Products from './_components/Products'
import Fulfillment from './_components/Fulfillment'
import SettingsTab from './_components/Settings'
import Analytics from './_components/Analytics'
import VendorReturns from './_components/VendorReturns'
import Payouts from './_components/Payouts'
import Marketing from './_components/Marketing'

type Tab = 'overview' | 'orders' | 'products' | 'analytics' | 'returns' | 'payouts' | 'marketing' | 'settings'

const NAV: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview',   label: 'Übersicht',     icon: LayoutDashboard },
  { id: 'orders',     label: 'Bestellungen',  icon: ShoppingBag },
  { id: 'products',   label: 'Produkte',      icon: Package },
  { id: 'analytics',  label: 'Analytics',     icon: BarChart2 },
  { id: 'returns',    label: 'Retouren',      icon: RotateCcw },
  { id: 'payouts',    label: 'Auszahlungen',  icon: CreditCard },
  { id: 'marketing',  label: 'Marketing',     icon: Megaphone },
  { id: 'settings',   label: 'Einstellungen', icon: Settings2 },
]

export default function VendorPage() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('overview')
  const [brand, setBrand] = useState<ApiBrandPartner | null>(null)

  useEffect(() => {
    if (isLoading) return
    if (!user || user.role !== 'BRAND_PARTNER') { router.replace('/dashboard/login'); return }
    brandApi.getMe().catch(() => null).then(b => { if (b) setBrand(b) })
  }, [isLoading, user, router])

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#F5F5F0' }}>
      <div className="w-8 h-8 border-2 border-[#370E4D]/20 border-t-[#370E4D] rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex min-h-screen">
      <aside className="w-[220px] fixed inset-y-0 flex flex-col z-20" style={{ background: '#370E4D' }}>
        <div className="px-6 py-8 border-b border-white/10">
          <h1 className="text-white" style={{ fontFamily: 'var(--font-cormorant)', fontSize: 28, fontWeight: 300, letterSpacing: '0.05em' }}>
            Enunas
          </h1>
          <p className="text-white/40 mt-0.5" style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 9, letterSpacing: '0.4em', textTransform: 'uppercase' }}>
            Brand Portal
          </p>
        </div>

        {brand && (
          <div className="px-6 py-4 border-b border-white/10">
            <p className="text-white font-medium text-sm truncate" style={{ fontFamily: 'var(--font-league-spartan)' }}>
              {brand.brandName}
            </p>
            <div className="mt-1.5"><StatusBadge status={brand.status} /></div>
          </div>
        )}

        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors duration-150 text-left ${
                tab === id ? 'bg-white/15 text-white' : 'text-white/55 hover:bg-white/8 hover:text-white/90'
              }`}
              style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 12, letterSpacing: '0.06em' }}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
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

      <main className="flex-1 min-h-screen" style={{ marginLeft: 220, background: '#F5F5F0' }}>
        <div className="bg-white border-b border-[#E8E8E8] px-8 h-14 flex items-center sticky top-0 z-10">
          <h2 className="text-[#0A0A0A] font-semibold" style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 14, letterSpacing: '0.04em' }}>
            {NAV.find(n => n.id === tab)?.label}
          </h2>
        </div>
        <div className="p-8 space-y-6">
          {tab === 'overview'   && <Overview    onNavigate={(t) => setTab(t as Tab)} />}
          {tab === 'orders'     && <Fulfillment />}
          {tab === 'products'   && <Products />}
          {tab === 'analytics'  && <Analytics />}
          {tab === 'returns'    && <VendorReturns />}
          {tab === 'payouts'    && <Payouts />}
          {tab === 'marketing'  && <Marketing />}
          {tab === 'settings'   && <SettingsTab brand={brand} onUpdate={setBrand} />}
        </div>
      </main>
    </div>
  )
}
