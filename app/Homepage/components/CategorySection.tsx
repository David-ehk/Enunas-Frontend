import React from 'react'

const categories = [
  {
    title: "Neu",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
    link: "/neu"
  },
  {
    title: "Trendy",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800",
    link: "/trendy"
  },
  {
    title: "Bekleidung",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800",
    link: "/bekleidung"
  },
  {
    title: "Accessoires",
    image: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=800",
    link: "/accessoires"
  },
  {
    title: "Parfüme",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800",
    link: "/parfueme"
  }
]

export default function CategorySection() {
  return (
    <section className="py-16">
      <div className="max-container">
        <h2 className="text-center text-4xl font-bold mb-12">
          Entdecke unsere Kategorien
        </h2>
        
        {/* Kategorie Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((category, index) => (
            <a 
              key={index}
              href={category.link}
              className="group relative overflow-hidden rounded-lg aspect-[3/4] cursor-pointer"
            >
              {/* Bild */}
              <img 
                src={category.image}
                alt={category.title}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
              />
              
              {/* Dunkler Overlay */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300"></div>
              
              {/* Text */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-semibold">
                  {category.title}
                </h3>
              </div>
              
              {/* Hover Border (optional) */}
              <div className="absolute inset-0 border-4 border-transparent group-hover:border-white transition-all duration-300 rounded-lg"></div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}