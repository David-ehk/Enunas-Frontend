import Link from 'next/link'
import Image from 'next/image'
import React from 'react'

const categories = [

  {
    title: "Marken",
    image: "https://5btl2wh3w0.ufs.sh/f/XBXTuU9dmEWbCgz4ViX2F4izT8Pb0mBSqCJruKUGf7hogwct",
    link: "/marken"
  },
  {
    title: "Accessoires",
    image: "https://5btl2wh3w0.ufs.sh/f/XBXTuU9dmEWbcagNPYL6qcKb9sxEz3MlZgPn4fyvweX5hYFp",
    link: "/bekleidung?cat=accessoires"
  }
]

const CategorySection = () => {
  return (

  <div >
        {/* GRID mit 2 oder 4 Spalten */}
     <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
         {categories.map((cat, idx) => (

           /* RELATIVE Container - Gibt Scroll-Raum */
          <div key={idx} className="relative group aspect-[2/3] md:aspect-auto md:h-screen">
            <Link  href={cat.link}>

              {/* STICKY Titel - Bleibt OBEN im Container */}
              <div className="sticky top-0 z-10 p-6 pt-5">
                <h2 className="text-3xl sm:text-4xl md:text-3xl lg:text-5xl tracking-wider text-white pt-20 z-10 transition-all duration-500 group-hover:tracking-[0.08em]">
                  {cat.title.toUpperCase()}
                </h2>
              </div>

              {/* BILD - Scrollt durch */}
              <div className="absolute inset-0 group cursor-pointer">
               <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                 className="object-cover"
                 />
              </div>

              {/*Dark Overlay*/}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-500" />
           </Link>
         </div>
         ))}
      </div>
    </div>
  )
}

export default CategorySection
