"use client"

import { useState } from "react"

const Geschlecht = () => {
  const [selectedGender, setSelectedGender] = useState<string | null>(null)

  const handleGenderSelect = (gender: string) => {
    setSelectedGender(gender)
    // Hier kannst du zur entsprechenden Route navigieren
    // z.B.: router.push(`/shop/${gender}`)
    console.log(`Ausgewählt: ${gender}`)
  }

  return (
    <section className="w-full h-screen flex">
      {/* Womenswear - Linke Hälfte */}
      <div 
        onClick={() => handleGenderSelect('women')}
        className="relative w-1/2 h-full group cursor-pointer"
      >
        <img 
          src="https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=1200&h=1600&fit=crop"
          alt="Womenswear"
          className="w-full h-full object-cover"
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 group-hover:bg-black/40 transition-all duration-500" />
        
        {/* Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <h2 className="text-white text-5xl sm:text-6xl lg:text-7xl font-light tracking-wider transition-all duration-300 group-hover:scale-105">
            WOMEN
          </h2>
        </div>
      </div>
       

      {/* Menswear - Rechte Hälfte */}
      <div 
        onClick={() => handleGenderSelect('men')}
        className="relative w-1/2 h-full group cursor-pointer"
      >
        <img 
          src="https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1200&h=1600&fit=crop"
          alt="Menswear"
          className="w-full h-full object-cover"
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 group-hover:bg-black/40 transition-all duration-500" />
        
        {/* Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <h2 className="text-white text-5xl sm:text-6xl lg:text-7xl font-light tracking-wider transition-all duration-300 group-hover:scale-105">
            MEN
          </h2>
        </div>

       
        
      </div>
    </section>
  )
}

export default Geschlecht