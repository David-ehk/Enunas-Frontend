import Link from 'next/link'
import React from 'react'

const categories = [
  {
    title: "Marken",
    image: "https://amq-mcq.dam.kering.com/asset/fed593c2-f470-4c31-ba1d-f785e81a065b/Original-Ecom/WEBSITE-DESKTOP2.jpg",
    link: "/marken"
  },
  {
    title: "Accessoires",
    image: "https://amq-mcq.dam.kering.com/asset/a20b4d87-9d8e-46de-a25f-7a6921c8929e/Original-Ecom/McQUEEN-SS26-PRE-CO_STILL-LIFE-HOLIDAY_16X9-2.jpg",
    link: "/accessoires"
  }
]

const CategorySection = () => {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
        {categories.map((cat, idx) => (
          <div key={idx} className="relative group h-[70vh] sm:h-screen">
            <Link href={cat.link}>
              {/* Titel */}
              <div className="sticky top-0 z-10 p-6 pt-5">
                <h2 className="text-3xl sm:text-4xl md:text-5xl tracking-wider text-white pt-20 z-10">
                  {cat.title.toUpperCase()}
                </h2>
              </div>

              {/* Bild */}
              <div className="absolute inset-0 cursor-pointer">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Dark Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CategorySection