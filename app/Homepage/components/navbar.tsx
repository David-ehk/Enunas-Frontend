"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Sidebar from './Sidebar'

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
 
  // Scrolleffekt transparenz
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50) //wenn um mehr als 50px gescrolled wird wird scrolled auf true gesetz
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

// Sidebaropen


  return (
    <header className={`sm:px-10 px-4 py-2 fixed z-50 w-full transition-all duration-300 ${
      scrolled ? 'bg-white shadow-sm' : 'bg-transparent border-b-gray-300/20 border-b-1'
    }`}>
      <nav className="flex justify-between items-center max-w-screen xl:mx-auto z-50">
        
        {/* Hamburger / Suche - Linke Hälfte */}
        <div className="w-1/4">
        <button onClick={() => setSidebarOpen(true)}>
          <Image 
            src="/assets/icons/hamburger.svg" 
            alt="hamburger" 
            width={25} 
            height={25}
          />
          </button>

          <Sidebar isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          />

        </div>
        
        {/* Logo - Mitte */}
        <a href="/" className="w-1/2 items-center flex justify-center">
          <h1 className="text-4xl md:text-5xl ">Enunas</h1>    
        </a>
        
        {/* Account, Gefällt mir, Warenkorb - Rechte Hälfte */}
        <div className="flex gap-4 items-center text-base w-1/4 justify-end">
          <div className="sm:hidden">🔍</div>
          <h2 className="hidden sm:block">Suche</h2>
          
          <div className="sm:hidden">👤</div>
          <h2 className="hidden sm:block">OAuth</h2>
          
          <div className="sm:hidden">❤️</div>
          <h2 className="hidden sm:block">Herz</h2>
          
          <div className="sm:hidden">🛒</div>
          <h2 className="hidden sm:block">Warenkorb</h2>
        </div>
        
      </nav>
    </header>
  )
}

export default Navbar
