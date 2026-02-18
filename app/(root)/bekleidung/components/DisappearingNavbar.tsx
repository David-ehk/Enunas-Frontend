'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '@/app/context/CartContext'
import Sidebar from '@/app/Homepage/components/Sidebar'
import SearchBar from '@/app/Homepage/components/Suchleiste'

export default function DisappearingNavbar() {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { openCart, itemCount } = useCart()

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false)
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Icons - same as Homepage navbar
  const HamburgerIconSvg = () => (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  const SearchIconSvg = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 19L13.8 13.8M16 8.5C16 12.6421 12.6421 16 8.5 16C4.35786 16 1 12.6421 1 8.5C1 4.35786 4.35786 1 8.5 1C12.6421 1 16 4.35786 16 8.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  const AccountIconSvg = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16.6668 17.5V15.8333C16.6668 14.9493 16.3156 14.1014 15.6905 13.4763C15.0654 12.8512 14.2176 12.5 13.3335 12.5H6.66683C5.78277 12.5 4.93493 12.8512 4.30981 13.4763C3.68469 14.1014 3.3335 14.9493 3.3335 15.8333V17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.0002 9.16667C11.8412 9.16667 13.3335 7.67428 13.3335 5.83333C13.3335 3.99238 11.8412 2.5 10.0002 2.5C8.15921 2.5 6.66683 3.99238 6.66683 5.83333C6.66683 7.67428 8.15921 9.16667 10.0002 9.16667Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  const HeartIconSvg = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.0002 17.5L8.75016 16.3604C4.50016 12.52 1.66683 9.96 1.66683 6.75C1.66683 4.19 3.68349 2.16667 6.2335 2.16667C7.66683 2.16667 9.05016 2.85 10.0002 3.93333C10.9502 2.85 12.3335 2.16667 13.7668 2.16667C16.3168 2.16667 18.3335 4.19 18.3335 6.75C18.3335 9.96 15.5002 12.52 11.2502 16.3696L10.0002 17.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  const CartIconSvg = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 1.66667L2.5 5.00001V16.6667C2.5 17.1087 2.67559 17.5326 2.98816 17.8452C3.30072 18.1577 3.72464 18.3333 4.16667 18.3333H15.8333C16.2754 18.3333 16.6993 18.1577 17.0118 17.8452C17.3244 17.5326 17.5 17.1087 17.5 16.6667V5.00001L15 1.66667H5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.5 5H17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.3332 8.33333C13.3332 9.2174 12.9821 10.0652 12.357 10.6904C11.7319 11.3155 10.884 11.6667 9.99984 11.6667C9.11579 11.6667 8.26794 11.3155 7.64282 10.6904C7.0177 10.0652 6.6665 9.2174 6.6665 8.33333" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  const ICON_BADGE_CLASSES = "absolute z-2 top-[-6px] right-[-8px] bg-[#370E4D] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center"

  return (
    <>
      <header
        className={`
          sm:px-10 px-4 py-3 fixed z-50 w-full bg-white
          border-b border-gray-200
          transition-all duration-500 ease-out
          ${isVisible ? 'translate-y-0' : '-translate-y-full'}
        `}
      >
        <nav className="flex justify-between items-center max-w-[1800px] mx-auto">
          {/* Left: Hamburger + Search */}
          <div className="w-1/4 flex items-center gap-4 md:gap-6">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Menü öffnen"
              className="text-enunas-black hover:text-enunas-purple transition-colors duration-300"
            >
              <HamburgerIconSvg />
            </button>

            <div className="sm:hidden">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Suche öffnen"
                className="text-enunas-black hover:text-enunas-purple transition-colors duration-300"
              >
                <SearchIconSvg />
              </button>
            </div>
          </div>

          {/* Center: Logo - McQueen elegant typography */}
          <Link href="/" className="w-1/2 flex justify-center">
            <h1
              className="text-2xl sm:text-3xl tracking-[0.05em] text-enunas-black font-normal"
              style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
            >
              Enunas
            </h1>
          </Link>

          {/* Right: Icons - balanced spacing */}
          <div className="w-1/4 flex items-center gap-4 md:gap-6 justify-end">
            <div className="hidden sm:block">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Suche öffnen"
                className="text-enunas-black hover:text-enunas-purple transition-colors duration-300"
              >
                <SearchIconSvg />
              </button>
            </div>

            <button
              className="text-enunas-black hover:text-enunas-purple transition-colors duration-300"
              aria-label="Mein Konto"
            >
              <AccountIconSvg />
            </button>

            <button
              className="hidden sm:block text-enunas-black hover:text-enunas-purple transition-colors duration-300"
              aria-label="Wunschliste"
            >
              <HeartIconSvg />
            </button>

            <button
              className="relative text-enunas-black hover:text-enunas-purple transition-colors duration-300"
              onClick={openCart}
              aria-label={`Warenkorb mit ${itemCount} Artikeln`}
            >
              <CartIconSvg />
              {itemCount > 0 && (
                <span className={ICON_BADGE_CLASSES}>{itemCount > 99 ? '99+' : itemCount}</span>
              )}
            </button>
          </div>
        </nav>
      </header>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <SearchBar isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
