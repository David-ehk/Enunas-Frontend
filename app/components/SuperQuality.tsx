'use client'

import { useState } from 'react'

export default function SuperQuality() {
  const [activeKategorie, setActiveKategorie] = useState('kategorie1')

  const kategorie = [
    {
      id: 'kategorie1',
      name: 'Streetwear',
      image: "/assets/images/Test1.WebP",
      color: 'bg-[#0011A5]',
    },
    {
      id: 'kategorie2',
      name: 'Experimental',
      image: '/assets/images/Test2.WebP',
      color: 'bg-[#630393]',
    },
    {
      id: 'kategorie3',
      name: 'Athleisure',
      image: '/assets/images/Test3.WebP',
      color: 'bg-[#C91E1E]',
    },
    {
      id: 'kategorie4',
      name: 'Cultural',
      image: '/assets/images/Test4.WebP',
      color: 'bg-[#EA9575]',
    },
    {
      id: 'kategorie5',
      name: 'Star',
      image: '/assets/images/Test1.WebP',
      color: 'bg-[#C59F02]',
    }
  ]

  const currentImage = kategorie.find(a => a.id === activeKategorie)?.image

  return (
    <section className="w-full min-h-screen px-8 sm:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Linke Seite - Liste */}
          <div className="space-y-6">
            <p className="text-sm tracking-widest text-gray-600">
              Kategorien
            </p>
            
            <ul className="space-y-4">
              {kategorie.map((Kategorie) => (
                <li key={Kategorie.id}>
                  <button
                    onMouseEnter={() => setActiveKategorie(Kategorie.id)}
                    className={`relative group text-left text-4xl sm:text-5xl lg:text-6xl font-light leading-tight transition-all duration-300 ${
                      activeKategorie === Kategorie.id 
                        ? 'opacity-100' 
                        : 'opacity-50 hover:opacity-70'
                    }`}
                  >
                    {Kategorie.name}
                    <span className={`absolute bottom-0 left-0 h-1 ${Kategorie.color} w-0 group-hover:w-full transition-all duration-500 ease-out`}/>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Rechte Seite - Bild */}
          <div className="relative h-[700px] lg:h-[700px] sm:h-[750px] overflow-hidden shadow-2xl ">
            <img 
              src={currentImage}
              alt={kategorie.find(a => a.id === activeKategorie)?.name} 
              sizes="(max-width: 768px) 100vw, 50vw"
              className="w-full h-full object-cover transition-opacity duration-500"
              key={activeKategorie}
            
            />
          </div>

        </div>
      </div>
    </section>
  )
}
