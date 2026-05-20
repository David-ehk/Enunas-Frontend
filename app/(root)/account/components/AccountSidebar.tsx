'use client'

// ============================================================
// ENUNAS — Account navigation sidebar
// Drop into: enunas/app/(root)/account/components/AccountSidebar.tsx
// ============================================================

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/app/context/AuthContext'

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Übersicht',         href: '/account' },
  { label: 'Bestellungen',      href: '/account/bestellungen' },
  { label: 'Wunschliste',       href: '/saved-lists' },
  { label: 'Adressen',          href: '/account/adressen' },
  { label: 'Zahlungsmethoden',  href: '/account/zahlungen' },
  { label: 'Newsletter',        href: '/account/newsletter' },
  { label: 'Einstellungen',     href: '/account/einstellungen' },
]

export default function AccountSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <>
      {/* Desktop — vertical sidebar */}
      <aside className="hidden md:block">
        <ul className="flex flex-col">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'group flex items-center justify-between',
                    'py-3 border-b border-enunas-off-white',
                    'font-league-spartan text-xs tracking-[0.15em] uppercase',
                    'transition-colors duration-300 ease-out-expo',
                    isActive
                      ? 'text-enunas-purple font-semibold'
                      : 'text-enunas-black hover:text-enunas-purple'
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      'text-base opacity-40 transition-transform duration-300 ease-out-expo',
                      'group-hover:translate-x-1 group-hover:opacity-100',
                      isActive && 'opacity-100'
                    )}
                    aria-hidden
                  >
                    →
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
        <button
          onClick={logout}
          className="mt-6 font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-gray-medium hover:text-enunas-black transition-colors duration-300"
        >
          Abmelden
        </button>
      </aside>

      {/* Mobile — horizontal scroll tabs */}
      <nav
        className="md:hidden -mx-4 px-4 overflow-x-auto"
        aria-label="Konto Navigation"
        style={{ scrollbarWidth: 'none' }}
      >
        <ul className="flex gap-6 pb-3 border-b border-enunas-gray-light whitespace-nowrap">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'font-league-spartan text-[11px] tracking-[0.15em] uppercase pb-2 inline-block transition-colors duration-300',
                    isActive
                      ? 'text-enunas-purple border-b border-enunas-purple'
                      : 'text-enunas-gray-medium border-b border-transparent'
                  )}
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
          <li>
            <button
              onClick={logout}
              className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-gray-medium pb-2"
            >
              Abmelden
            </button>
          </li>
        </ul>
      </nav>
    </>
  )
}
