'use client'

import { useState } from 'react'
import Link from 'next/link'
import Sidebar from '@/app/Homepage/components/Sidebar'
import SearchBar from '@/app/Homepage/components/Suchleiste'
import { useCart } from '@/app/context/CartContext'
import { useAuth } from '@/app/context/AuthContext'

export default function DisappearingNavbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const { itemCount } = useCart()
  const { isAuthenticated } = useAuth()

  const HamburgerIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M4 3H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 21H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M19 19L13.8 13.8M16 8.5C16 12.6421 12.6421 16 8.5 16C4.35786 16 1 12.6421 1 8.5C1 4.35786 4.35786 1 8.5 1C12.6421 1 16 4.35786 16 8.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  const AccountIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M16.6668 17.5V15.8333C16.6668 14.9493 16.3156 14.1014 15.6905 13.4763C15.0654 12.8512 14.2176 12.5 13.3335 12.5H6.66683C5.78277 12.5 4.93493 12.8512 4.30981 13.4763C3.68469 14.1014 3.3335 14.9493 3.3335 15.8333V17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.0002 9.16667C11.8412 9.16667 13.3335 7.67428 13.3335 5.83333C13.3335 3.99238 11.8412 2.5 10.0002 2.5C8.15921 2.5 6.66683 3.99238 6.66683 5.83333C6.66683 7.67428 8.15921 9.16667 10.0002 9.16667Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  const HeartIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M10.0002 17.5L8.75016 16.3604C4.50016 12.52 1.66683 9.96 1.66683 6.75C1.66683 4.19 3.68349 2.16667 6.2335 2.16667C7.66683 2.16667 9.05016 2.85 10.0002 3.93333C10.9502 2.85 12.3335 2.16667 13.7668 2.16667C16.3168 2.16667 18.3335 4.19 18.3335 6.75C18.3335 9.96 15.5002 12.52 11.2502 16.3696L10.0002 17.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  const CartIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M5 1.66667L2.5 5.00001V16.6667C2.5 17.1087 2.67559 17.5326 2.98816 17.8452C3.30072 18.1577 3.72464 18.3333 4.16667 18.3333H15.8333C16.2754 18.3333 16.6993 18.1577 17.0118 17.8452C17.3244 17.5326 17.5 17.1087 17.5 16.6667V5.00001L15 1.66667H5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.5 5H17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.3332 8.33333C13.3332 9.2174 12.9821 10.0652 12.357 10.6904C11.7319 11.3155 10.884 11.6667 9.99984 11.6667C9.11579 11.6667 8.26794 11.3155 7.64282 10.6904C7.0177 10.0652 6.6665 9.2174 6.6665 8.33333" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  const BADGE = "absolute z-[2] top-[-6px] right-[-8px] bg-enunas-purple text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center"

  // 44×44 tap target on touch devices; desktop layout unchanged. Mirrors
  // TOUCH_HIT in app/Homepage/components/navbar.tsx.
  const TOUCH_HIT = "relative pointer-coarse:after:content-[''] pointer-coarse:after:absolute pointer-coarse:after:-inset-3"

  return (
    <header className="sm:px-10 px-4 py-2 fixed z-50 w-full bg-white shadow-sm">
      <nav className="flex justify-between items-center max-w-screen xl:mx-auto z-50">

        {/* Left — Hamburger + mobile search */}
        <div className="w-1/4 flex gap-3 pointer-coarse:gap-2 md:gap-8">
          <button onClick={() => setSidebarOpen(true)} aria-label="Menü öffnen" className={TOUCH_HIT}>
            <HamburgerIcon className="w-5 h-5 hover:text-enunas-purple" />
          </button>
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <SearchBar isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

          <div className="sm:hidden">
            <button onClick={() => setSearchOpen(true)} aria-label="Suche öffnen" className={`flex items-center bg-transparent border-none cursor-pointer ${TOUCH_HIT}`}>
              <SearchIcon className="w-5 h-5 text-black/80 hover:text-enunas-purple" />
            </button>
          </div>
        </div>

        {/* Centre — Wordmark */}
        <Link href="/" className="w-1/2 flex items-center justify-center">
          <h1 className="text-3xl sm:text-4xl tracking-wide">Enunas</h1>
        </Link>

        {/* Right — Search (desktop) / Account / Heart / Cart */}
        <div className="flex items-center gap-3 pointer-coarse:gap-2 md:gap-8 w-1/4 justify-end">
          <div className="hidden sm:block">
            <button onClick={() => setSearchOpen(true)} aria-label="Suche öffnen" className={`flex items-center bg-transparent border-none cursor-pointer ${TOUCH_HIT}`}>
              <SearchIcon className="w-5 h-5 text-black/80 hover:text-enunas-purple" />
            </button>
          </div>

          <div className="relative">
            <Link href="/account" aria-label="Mein Konto" className={TOUCH_HIT}>
              <AccountIcon className="w-5 h-5 text-black/80 hover:text-enunas-purple" />
            </Link>
            {isAuthenticated && (
              <span className="absolute top-[-4px] right-[-4px] w-2 h-2 rounded-full bg-enunas-purple" />
            )}
          </div>

          <Link href="/saved-lists" aria-label="Wunschliste" className={TOUCH_HIT}>
            <HeartIcon className="w-5 h-5 text-black/80 hover:text-enunas-purple transition-colors duration-200" />
          </Link>

          <div>
            <Link href="/cart" className={TOUCH_HIT} aria-label={`Warenkorb mit ${itemCount} Artikeln`}>
              <CartIcon className="w-5 h-5 text-black/80 hover:text-enunas-purple" />
              {itemCount > 0 && (
                <span className={BADGE}>{itemCount > 99 ? '99+' : itemCount}</span>
              )}
            </Link>
          </div>
        </div>

      </nav>
    </header>
  )
}
