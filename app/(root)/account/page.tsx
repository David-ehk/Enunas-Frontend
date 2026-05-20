'use client'

// ============================================================
// ENUNAS — /account page (Dashboard / Übersicht)
// Drop into: enunas/app/(root)/account/page.tsx (replaces placeholder)
// ============================================================

import Navbar from '@/app/Homepage/components/navbar'
import Footer from '@/app/Homepage/components/footer'
import { useAuth } from '@/app/context/AuthContext'
import AccountSidebar from './components/AccountSidebar'
import StatCards from './components/StatCards'
import RecentOrder from './components/RecentOrder'
import WishlistPreview from './components/WishlistPreview'
import { getMockAccountSummary, getMockWishlist } from '@/lib/account'

export default function AccountPage() {
  // TODO: Replace mock loaders with real API calls (e.g. SWR/React Query)
  //   const { data: summary } = useAccountSummary()
  //   const { data: wishlist } = useWishlist({ limit: 4 })
  const summary = getMockAccountSummary()
  const wishlist = getMockWishlist()

  const { user, isLoading } = useAuth()
  const greetingName = user?.email?.split('@')[0] ?? summary.firstName

  return (
    <>
      <Navbar />

      {/* <main> und <header> kollidieren mit globals.css-Resets:
          main { padding: 0 } schlägt Tailwind-Layers → inline paddingTop
          header { position: fixed } macht Begrüßungsblock fixed → <div> */}
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

          {/* Layout */}
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-10 lg:gap-12">
            <AccountSidebar />

            <div>
              <StatCards stats={summary.stats} />
              <RecentOrder order={summary.lastOrder} />
              <WishlistPreview items={wishlist} />
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-enunas-purple w-full px-4 sm:px-8 lg:px-16 pb-8" style={{ paddingTop: '96px' }}>
        <Footer />
      </footer>
    </>
  )
}
