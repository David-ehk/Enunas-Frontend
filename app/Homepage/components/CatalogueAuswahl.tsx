'use client'

import { useState } from 'react'

export default function KategorieAuswahl() {
  const [activeKategorie, setActiveKategorie] = useState('kategorie1')

  const kategorie = [
    {
      id: 'kategorie1',
      name: 'Streetwear',
      image: "/assets/images/Test1.WebP",
      color: 'bg-[#0011A5]',
      link: "/Bekleidung/Streetwear"
    },
    {
      id: 'kategorie2',
      name: 'Experimental',
      image: "https://cdn.rickowens.eu/products/205600/large/RL02E1719_CTW_09_01.jpg?1757411991",
      color: 'bg-[#630393]',
      link: "/Bekleidung/Experimental"
    },
    {
      id: 'kategorie3',
      name: 'Athleisure',
      image: '/assets/images/Test3.WebP',
      color: 'bg-[#C91E1E]',
      link: "/Bekleidung/Athleisure"
    },
    {
      id: 'kategorie4',
      name: 'Cultural',
      image: '/assets/images/Test4.WebP',
      color: 'bg-[#EA9575]',
      link: "/Bekleidung/Cultural"
    },
    {
      id: 'kategorie5',
      name: 'Star',
      image: '/assets/images/Test1.WebP',
      color: 'bg-[#C59F02]',
      link: "/Bekleidung/Star"
    }
  ]

  const currentImage = kategorie.find(a => a.id === activeKategorie)?.image

  return (
    <section className="w-full  px-8 sm:px-16 sm:py-8 ">
      <div className=" max-w-7xl mx-auto max-sm:hidden">
        <div className="grid grid-cols-2 gap-12 items-center">
          
          {/* Linke Seite - Liste */}
          <div className="space-y-6">
            {/*"<- zu allen Kategorien" hinzufügen noch  */}
            <p className="text-sm  tracking-widest text-gray-600">
              Catalogue
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
          <div className="relative h-[700px] lg:h-[700px] sm:h-[750px] overflow-hidden ">
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
