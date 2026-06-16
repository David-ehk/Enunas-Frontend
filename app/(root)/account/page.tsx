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
import { authApi } from '@/lib/api/modules/authApi'
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

function AuthGate({ onSuccess }: { onSuccess: () => void }) {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  // Backend RegisterUserDto only accepts { email, password } — no firstName/lastName.
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { refreshUser } = useAuth()

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await authApi.login({ email: form.email, password: form.password })
      await refreshUser()
      onSuccess()
    } catch {
      setError('E-Mail oder Passwort falsch.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      // Signup returns UserResponseDto (no token). Login separately to get token.
      await authApi.signup({ email: form.email, password: form.password })
      await authApi.login({ email: form.email, password: form.password })
      await refreshUser()
      onSuccess()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : null
      setError(msg ?? 'Registrierung fehlgeschlagen. Bitte versuche es erneut.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full border border-[#E8E8E8] px-4 py-3 text-[14px] text-[#0A0A0A] placeholder-[#6B6B6B] focus:outline-none focus:border-[#370E4D] transition-colors duration-200'

  return (
    <div className="max-w-md mx-auto py-12" style={{ fontFamily: 'var(--font-league-spartan)' }}>
      <div className="flex border-b border-[#E8E8E8] mb-8">
        {(['login', 'register'] as const).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setError(null) }}
            className={`flex-1 py-3 text-[11px] uppercase tracking-[0.15em] transition-colors duration-200 ${
              tab === t
                ? 'border-b-2 border-[#370E4D] text-[#370E4D]'
                : 'text-[#6B6B6B] hover:text-[#370E4D]'
            }`}
          >
            {t === 'login' ? 'Anmelden' : 'Registrieren'}
          </button>
        ))}
      </div>

      {tab === 'login' ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="E-Mail" value={form.email} onChange={set('email')} required className={inputClass} />
          <input type="password" placeholder="Passwort" value={form.password} onChange={set('password')} required className={inputClass} />
          {error && <p className="text-[13px] text-[#8B1E3F]">{error}</p>}
          <button type="submit" disabled={submitting}
            className="w-full py-3 bg-[#370E4D] text-white text-[11px] uppercase tracking-[0.15em] hover:bg-[#4A1566] transition-colors duration-200 disabled:opacity-60">
            {submitting ? 'Bitte warten…' : 'Anmelden'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4">
          <input type="email" placeholder="E-Mail" value={form.email} onChange={set('email')} required className={inputClass} />
          <input type="password" placeholder="Passwort (mind. 8 Zeichen)" value={form.password} onChange={set('password')} required minLength={8} className={inputClass} />
          <p className="text-[12px] text-[#6B6B6B]">
            Du kannst deinen Namen nach der Anmeldung unter Einstellungen ergänzen.
          </p>
          {error && <p className="text-[13px] text-[#8B1E3F]">{error}</p>}
          <button type="submit" disabled={submitting}
            className="w-full py-3 bg-[#370E4D] text-white text-[11px] uppercase tracking-[0.15em] hover:bg-[#4A1566] transition-colors duration-200 disabled:opacity-60">
            {submitting ? 'Bitte warten…' : 'Konto erstellen'}
          </button>
        </form>
      )}
    </div>
  )
}

export default function AccountPage() {
  const [activeSection, setActiveSection] = useState<AccountSection>('uebersicht')
  const [lastOrder, setLastOrder] = useState<ApiOrder | null | undefined>(undefined)
  const [wishlistItems, setWishlistItems] = useState<WishlistEntry[]>([])

  const { user, customer, isAuthenticated, isLoading } = useAuth()
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

  if (!isLoading && !isAuthenticated) {
    return (
      <>
        <Navbar />
        <div
          className="min-h-screen bg-white pb-20 px-4 sm:px-8 lg:px-16"
          style={{ paddingTop: '96px' }}
        >
          <div className="max-w-[1280px] mx-auto">
            <div className="mb-10 lg:mb-14">
              <p className="font-league-spartan text-[11px] tracking-[0.35em] uppercase text-enunas-gray-medium mb-3">
                Mein Konto
              </p>
              <h1 className="font-cormorant text-4xl lg:text-5xl font-light text-enunas-black leading-tight mb-2">
                Willkommen.
              </h1>
              <p className="font-cormorant italic text-lg lg:text-xl text-enunas-gray-dark">
                Melde dich an oder erstelle ein Konto.
              </p>
            </div>
            <AuthGate onSuccess={() => {}} />
          </div>
        </div>
        <Footer />
      </>
    )
  }

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
