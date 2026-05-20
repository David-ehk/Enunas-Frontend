'use client'

import {
  Home, Package, ShoppingBag, Wallet, BarChart2,
  Settings, Building2, FileText, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Role = 'brand-partner' | 'admin'

interface NavItem {
  id: string
  label: string
  icon: React.ElementType
}

const BRAND_PARTNER_NAV: NavItem[] = [
  { id: 'overview',  label: 'Overview',     icon: Home },
  { id: 'products',  label: 'My Products',  icon: Package },
  { id: 'orders',    label: 'Orders',       icon: ShoppingBag },
  { id: 'payouts',   label: 'Payouts',      icon: Wallet },
  { id: 'analytics', label: 'Analytics',    icon: BarChart2 },
  { id: 'settings',  label: 'Settings',     icon: Settings },
]

const ADMIN_NAV: NavItem[] = [
  { id: 'overview',      label: 'Overview',        icon: Home },
  { id: 'brands',        label: 'Brand Partners',  icon: Building2 },
  { id: 'products',      label: 'All Products',    icon: Package },
  { id: 'orders',        label: 'All Orders',      icon: ShoppingBag },
  { id: 'payouts',       label: 'Payouts',         icon: Wallet },
  { id: 'applications',  label: 'Applications',    icon: FileText },
  { id: 'settings',      label: 'Settings',        icon: Settings },
]

interface SidebarProps {
  role: Role
  activePage: string
  onNavigate: (page: string) => void
}

export default function Sidebar({ role, activePage, onNavigate }: SidebarProps) {
  const nav = role === 'brand-partner' ? BRAND_PARTNER_NAV : ADMIN_NAV

  return (
    <aside
      className="flex flex-col flex-shrink-0 h-full w-16 lg:w-60 transition-all duration-300 ease-out"
      style={{ background: '#370E4D' }}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 lg:px-6 border-b border-white/10 flex-shrink-0">
        <span
          className="hidden lg:block text-white text-2xl tracking-widest"
          style={{ fontFamily: 'var(--font-Cormorant-Garamond)', fontWeight: 400 }}
        >
          Enunas
        </span>
        <span
          className="lg:hidden text-white text-xl tracking-widest mx-auto"
          style={{ fontFamily: 'var(--font-Cormorant-Garamond)', fontWeight: 400 }}
        >
          E
        </span>
      </div>

      {/* Role label */}
      <div className="hidden lg:block px-6 pt-5 pb-2">
        <p
          className="text-white/40 uppercase tracking-[0.15em]"
          style={{ fontFamily: 'var(--font-league-spartan)', fontSize: '9px' }}
        >
          {role === 'brand-partner' ? 'Brand Partner' : 'Admin'}
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 lg:px-3 py-2 space-y-0.5 overflow-y-auto">
        {nav.map(item => {
          const Icon = item.icon
          const active = activePage === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 transition-all duration-200 group',
                active
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/8'
              )}
              style={{ borderRadius: '4px' }}
            >
              <Icon
                size={17}
                className={cn(
                  'flex-shrink-0 transition-colors duration-200',
                  active ? 'text-white' : 'text-white/60 group-hover:text-white'
                )}
              />
              <span
                className="hidden lg:block text-[13px] font-medium"
                style={{ fontFamily: 'var(--font-league-spartan)' }}
              >
                {item.label}
              </span>
              {active && (
                <ChevronRight size={12} className="hidden lg:block ml-auto text-white/40" />
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom: brand identifier */}
      <div className="hidden lg:flex items-center gap-3 px-5 py-5 border-t border-white/10 flex-shrink-0">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.15)', fontFamily: 'var(--font-league-spartan)' }}
        >
          {role === 'brand-partner' ? 'KS' : 'AD'}
        </div>
        <div className="min-w-0">
          <p
            className="text-white text-[12px] font-medium truncate"
            style={{ fontFamily: 'var(--font-league-spartan)' }}
          >
            {role === 'brand-partner' ? 'Krauss Studio' : 'Enunas Admin'}
          </p>
          <p
            className="text-white/40 truncate"
            style={{ fontFamily: 'var(--font-league-spartan)', fontSize: '10px' }}
          >
            {role === 'brand-partner' ? 'Brand Partner' : 'Administrator'}
          </p>
        </div>
      </div>
    </aside>
  )
}
