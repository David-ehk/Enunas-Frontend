'use client'

import { useState } from 'react'
import Navbar from '@/app/Homepage/components/navbar'
import Footer from '@/app/Homepage/components/footer'
import { useAuth } from '@/app/context/AuthContext'
import AccountSidebar, { type AccountSection } from './components/AccountSidebar'
import StatCards from './components/StatCards'
import RecentOrder from './components/RecentOrder'
import WishlistPreview from './components/WishlistPreview'
import Bestellungen from './components/Bestellungen'
import Adressen from './components/Adressen'
import Zahlungen from './components/Zahlungen'
import Newsletter from './components/Newsletter'
import Einstellungen from './components/Einstellungen'
import { getMockAccountSummary, getMockWishlist } from '@/lib/account'

const SECTION_TITLES: Record<AccountSection, string> = {
  uebersicht:    'Übersicht',
  bestellungen:  'Bestellungen',
  wunschliste:   'Wunschliste',
  adressen:      'Adressen',
  zahlungen:     'Zahlungsmethoden',
  newsletter:    'Newsletter',
  einstellungen: 'Einstellungen',
}

export default function AccountPage() {
  const [activeSection, setActiveSection] = useState<AccountSection>('uebersicht')

  const summary = getMockAccountSummary()
  const wishlist = getMockWishlist()

  const { user, isLoading } = useAuth()
  const greetingName = user?.email?.split('@')[0] ?? summary.firstName

  return (
    <>
      <Navbar />

      <div
        className="min-h-screen bg-white pb-20 px-4 sm:px-8 lg:px-16"
        style={{ paddingTop: '96px' }}
      >
        <div className="max-w-[1280px] mx-auto">

          {/* Page header */}
          <div className="mb-10 lg:mb-14">
            <p className="font-league-spartan text-[11px] tracking-[0.35em] uppercase text-enunas-gray-medium mb-3 animate-fade-in">
              Mein Konto
            </p>
            <h1
              className="font-cormorant text-4xl lg:text-5xl font-light text-enunas-black leading-tight mb-2 animate-fade-in-up"
              style={{ animationDelay: '100ms' }}
            >
              {isLoading ? 'Willkommen.' : `Guten Tag, ${greetingName}.`}
            </h1>
            <p
              className="font-cormorant italic text-lg lg:text-xl text-enunas-gray-dark animate-fade-in-up"
              style={{ animationDelay: '200ms' }}
            >
              Schön, dass du wieder da bist.
            </p>
          </div>

          {/* Layout: sidebar + content */}
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-10 lg:gap-12">
            <AccountSidebar active={activeSection} onChange={setActiveSection} />

            <div>
              {/* Section heading for non-overview sections */}
              {activeSection !== 'uebersicht' && (
                <div className="mb-8 pb-6 border-b border-enunas-gray-light md:hidden">
                  <p className="font-league-spartan text-[11px] tracking-[0.35em] uppercase text-enunas-gray-medium">
                    {SECTION_TITLES[activeSection]}
                  </p>
                </div>
              )}

              {activeSection === 'uebersicht' && (
                <>
                  <StatCards stats={summary.stats} />
                  <RecentOrder order={summary.lastOrder} />
                  <WishlistPreview items={wishlist} />
                </>
              )}

              {activeSection === 'bestellungen' && <Bestellungen />}
              {activeSection === 'wunschliste'  && <WishlistPreview items={wishlist} />}
              {activeSection === 'adressen'     && <Adressen />}
              {activeSection === 'zahlungen'    && <Zahlungen />}
              {activeSection === 'newsletter'   && <Newsletter />}
              {activeSection === 'einstellungen' && <Einstellungen />}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
