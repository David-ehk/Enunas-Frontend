
//Code analysieren und lernen
// Code anpassen keine Ramen sondern Hover soll sich nach oben bewegen
//sm: muss angepasst werden sieht kacke aus
import React from 'react'

const categories = [
  
  {
    title: "Marken",
    image: "https://amq-mcq.dam.kering.com/asset/fed593c2-f470-4c31-ba1d-f785e81a065b/Original-Ecom/WEBSITE-DESKTOP2.jpg",
    link: "/bekleidung"
  },
  {
    title: "Accessoires",
    image: "https://amq-mcq.dam.kering.com/asset/a20b4d87-9d8e-46de-a25f-7a6921c8929e/Original-Ecom/McQUEEN-SS26-PRE-CO_STILL-LIFE-HOLIDAY_16X9-2.jpg",
    link: "/accessoires"
  }
]

export default function CategorySection() {
  return (

    <div >

        {/* GRID mit 2 oder 4 Spalten */}
       <div className="grid grid-cols-2  gap-0">
        
         {categories.map((cat, idx) => (
          
           /* RELATIVE Container - Gibt Scroll-Raum */
           <div 
              key={idx}
              className="relative"
              style={{ height: '100vh' }}
            >
              <a  href={cat.link}>

              {/* STICKY Titel - Bleibt OBEN im Container */}
              <div className="sticky top-0 z-10 p-6 pt-5">
                <h2 className="text-3xl sm:text-4xl md:text-5xl tracking-wider text-white pt-20 z-10">
                  {cat.title.toUpperCase()}
                </h2 >
              </div>

              {/* BILD - Scrollt durch */}
              <div className="absolute inset-0 group cursor-pointer">
               <img 
                  src={cat.image}
                  alt={cat.title}
                 className="h-full w-full object-cover"
                 />
              </div>   
         </a>
      </div>
 ))}
          </div>

    </div>
  )
}