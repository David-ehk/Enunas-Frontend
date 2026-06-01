'use client'

import { cn } from '@/lib/utils'
import { useAuth } from '@/app/context/AuthContext'

export type AccountSection =
  | 'uebersicht'
  | 'bestellungen'
  | 'wunschliste'
  | 'adressen'
  | 'zahlungen'
  | 'newsletter'
  | 'einstellungen'

interface NavItem {
  id: AccountSection;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'uebersicht',    label: 'Übersicht' },
  { id: 'bestellungen',  label: 'Bestellungen' },
  { id: 'wunschliste',   label: 'Wunschliste' },
  { id: 'adressen',      label: 'Adressen' },
  { id: 'zahlungen',     label: 'Zahlungsmethoden' },
  { id: 'newsletter',    label: 'Newsletter' },
  { id: 'einstellungen', label: 'Einstellungen' },
]

interface AccountSidebarProps {
  active: AccountSection;
  onChange: (s: AccountSection) => void;
}

export default function AccountSidebar({ active, onChange }: AccountSidebarProps) {
  const { logout } = useAuth()

  return (
    <>
      {/* Desktop — vertical sidebar */}
      <aside className="hidden md:block">
        <ul className="flex flex-col">
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.id
            return (
              <li key={item.id}>
                <button
                  onClick={() => onChange(item.id)}
                  className={cn(
                    'group flex items-center justify-between w-full',
                    'py-3 border-b border-enunas-off-white',
                    'font-league-spartan text-xs tracking-[0.15em] uppercase',
                    'transition-colors duration-300 ease-out-expo text-left',
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
                      isActive && 'opacity-100 text-enunas-purple'
                    )}
                    aria-hidden
                  >
                    →
                  </span>
                </button>
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
            const isActive = active === item.id
            return (
              <li key={item.id}>
                <button
                  onClick={() => onChange(item.id)}
                  className={cn(
                    'font-league-spartan text-[11px] tracking-[0.15em] uppercase pb-2 inline-block transition-colors duration-300',
                    isActive
                      ? 'text-enunas-purple border-b border-enunas-purple'
                      : 'text-enunas-gray-medium border-b border-transparent hover:text-enunas-black'
                  )}
                >
                  {item.label}
                </button>
              </li>
            )
          })}
          <li>
            <button
              onClick={logout}
              className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-gray-medium pb-2 hover:text-enunas-black transition-colors"
            >
              Abmelden
            </button>
          </li>
        </ul>
      </nav>
    </>
  )
}
