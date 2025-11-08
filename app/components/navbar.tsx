'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`sm:px-10 px-4 py-2 fixed z-10 w-full shadow-sm transition-all duration-300 ${
      scrolled ? 'bg-white' : 'bg-transparent'
    }`}>
    <nav className="flex justify-between items-center max-w-screen xl: mx-auto ">

        {/* Hamburger zukünftig suche - Linke Hälfte */}
         <div className="w-1/4">
          <Image src="/assets/icons/hamburger.svg" alt="hamburger" width= {25} height={25}/>
         </div>

        <a href="/" className="w-1/2 items-center flex justify-center ">
         <h1 className=" sm:text-3xl md:text-5xl lg:text-6xl "> Enunas </h1>    
        </a>

        {/* Account, Gefällt mir, Warenkorp - Rechte Hälfte */}
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