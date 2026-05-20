'use client'

import { ArrowLeftRight, Bell } from 'lucide-react'

type Role = 'brand-partner' | 'admin'

const PAGE_TITLES: Record<string, string> = {
  overview: 'Overview',
  products: 'My Products',
  orders: 'Orders',
  payouts: 'Payouts',
  analytics: 'Analytics',
  settings: 'Settings',
  brands: 'Brand Partners',
  applications: 'Applications',
}

interface TopBarProps {
  role: Role
  activePage: string
  onToggleRole: () => void
}

export default function TopBar({ role, activePage, onToggleRole }: TopBarProps) {
  const title = PAGE_TITLES[activePage] ?? 'Dashboard'
  const isBrand = role === 'brand-partner'

  return (
    <header
      className="h-16 flex items-center justify-between px-6 lg:px-8 flex-shrink-0 border-b"
      style={{ background: '#FFFFFF', borderColor: '#E8E8E8' }}
    >
      {/* Left: greeting / title */}
      <div>
        {activePage === 'overview' ? (
          <div>
            <p
              className="text-[11px] uppercase tracking-[0.15em] mb-0.5"
              style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B' }}
            >
              {isBrand ? 'Brand Partner' : 'Admin'}
            </p>
            <h1
              className="text-xl text-[#0A0A0A] leading-none"
              style={{ fontFamily: 'var(--font-Cormorant-Garamond)', fontWeight: 500 }}
            >
              {isBrand ? 'Welcome back, Krauss Studio' : 'Enunas Admin'}
            </h1>
          </div>
        ) : (
          <h1
            className="text-xl text-[#0A0A0A]"
            style={{ fontFamily: 'var(--font-Cormorant-Garamond)', fontWeight: 500 }}
          >
            {title}
          </h1>
        )}
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-3">
        {/* Role badge */}
        <span
          className="hidden sm:inline-flex px-2.5 py-1 text-[10px] uppercase tracking-[0.1em]"
          style={{
            fontFamily: 'var(--font-league-spartan)',
            background: isBrand ? 'rgba(55,14,77,0.08)' : 'rgba(26,90,60,0.08)',
            color: isBrand ? '#370E4D' : '#1A5A3C',
          }}
        >
          {isBrand ? 'Brand Partner' : 'Admin'}
        </span>

        {/* Notification */}
        <button
          className="relative w-9 h-9 flex items-center justify-center transition-colors duration-200 hover:bg-[#F5F5F0]"
          style={{ borderRadius: '4px' }}
          aria-label="Notifications"
        >
          <Bell size={16} color="#6B6B6B" />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: '#370E4D' }}
          />
        </button>

        {/* Toggle */}
        <button
          onClick={onToggleRole}
          className="flex items-center gap-2 px-3 py-2 border text-[11px] uppercase tracking-[0.1em] transition-all duration-200 hover:bg-[#370E4D] hover:text-white hover:border-[#370E4D]"
          style={{
            fontFamily: 'var(--font-league-spartan)',
            borderColor: '#E8E8E8',
            color: '#370E4D',
            borderRadius: '4px',
          }}
        >
          <ArrowLeftRight size={12} />
          <span className="hidden sm:inline">
            {isBrand ? 'Admin view' : 'Brand view'}
          </span>
        </button>
      </div>
    </header>
  )
}
