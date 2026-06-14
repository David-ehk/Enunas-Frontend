'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { orderApi } from '@/lib/api/modules/orderApi'
import { wardrobeApi } from '@/lib/api/modules/wardrobeApi'
import type { ApiOrder, ApiWardrobeItem } from '@/types/api'
import type { WishlistEntry } from '@/lib/account'

function wardrobeToWishlist(item: ApiWardrobeItem): WishlistEntry {
  const p = item.product
  return {
    id: item.id,
    imgURL: p.images[0] ?? '',
    brandName: p.brandName,
    productName: p.name,
    price: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(p.price),
    href: `/bekleidung/${p.category}/${p.slug}`,
    colours: p.colours,
    createdAt: item.addedAt,
    sizes: p.sizes,
    catalogue: p.catalogue,
  }
}

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
  const [lastOrder, setLastOrder] = useState<ApiOrder | null | undefined>(undefined)
  const [wishlistItems, setWishlistItems] = useState<WishlistEntry[]>([])

  const { user, customer, isLoading } = useAuth()
  const greetingName = customer?.firstName ?? user?.email?.split('@')[0] ?? ''

  const loadOverview = useCallback(async () => {
    if (!user || user.role !== 'CUSTOMER') {
      setLastOrder(null)
      return
    }
    try {
      const [orderPage, wardrobe] = await Promise.all([
        orderApi.getMyOrders(0, 1).catch(() => null),
        wardrobeApi.getAll().catch((): ApiWardrobeItem[] => []),
      ])
      setLastOrder(orderPage?.content[0] ?? null)
      setWishlistItems(wardrobe.map(wardrobeToWishlist))
    } catch {
      setLastOrder(null)
    }
  }, [user])

  useEffect(() => {
    if (!isLoading) loadOverview()
  }, [isLoading, loadOverview])

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
              {isLoading ? 'Willkommen.' : greetingName ? `Guten Tag, ${greetingName}.` : 'Mein Konto.'}
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
                  <StatCards
                    ordersCount={customer?.totalOrders ?? 0}
                    wishlistCount={wishlistItems.length}
                    totalSpent={customer?.totalSpent}
                  />
                  {lastOrder !== undefined && (
                    <RecentOrder
                      order={lastOrder}
                      onSeeAll={() => setActiveSection('bestellungen')}
                    />
                  )}
                  <WishlistPreview items={wishlistItems} />
                </>
              )}

              {activeSection === 'bestellungen'  && <Bestellungen />}
              {activeSection === 'wunschliste'   && <WishlistPreview items={wishlistItems} />}
              {activeSection === 'adressen'      && <Adressen />}
              {activeSection === 'zahlungen'     && <Zahlungen />}
              {activeSection === 'newsletter'    && <Newsletter />}
              {activeSection === 'einstellungen' && <Einstellungen />}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
