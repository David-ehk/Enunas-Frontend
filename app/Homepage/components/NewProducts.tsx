"use client"
import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import { cn } from '@/lib/utils'
import PopularProductCard from './PopularProductCard'
import { generateSlug } from "@/lib/product"

const products = [{
  imgURL: "https://www.manieredevoir.com/cdn/shop/files/GEN-WD-23-10-2025.jpg?crop=center&height=2095&v=1761206881&width=1920",
    Brandname: "Puma",
    name: "nike air shoes 5 auch hier richtig lange ohne Grund",
    colour: "bg-[#DE0000]",
    colourname: "red",
    price: "220€",
    href: `/bekleidung/bekleidung/schuhe/${generateSlug("nike air shoes 5 auch hier richtig lange ohne Grund")}`
  },
  {
    imgURL: "https://www.viviennewestwood.com/dw/image/v2/BJGV_PRD/on/demandware.static/-/Sites-viviennewestwood-master-catalog/default/dw69896e20/images/2G01000A-J001M-_GREY-MELANGE_001_large.jpeg?q=80",
    Brandname: "Addidas",
    name: "Worlds End Denim Boxer Jacket einfach zum test blablabla",
    colour: "bg-[#630393]",
    colourname: "purple",
    price: "220€",
    href: `/bekleidung/bekleidung/jacken/${generateSlug("Worlds End Denim Boxer Jacket einfach zum test blablabla")}`
  },
  {
    imgURL: "https://eu.manieredevoir.com/cdn/shop/files/MDV_0030_MDV2_be0fab84-a04c-4251-adc9-1fefaa4175c4.jpg?v=1759502594",
    Brandname: "Maison Louis",
    name: "D.D. Shell hooded-padded jacket",
    colour: "bg-[#FFFFFF]",
    colourname: "white",
    price: "220€",
    href: `/bekleidung/bekleidung/jacken/${generateSlug("D.D. Shell hooded-padded jacket")}`
  },
  {
    imgURL: "https://www.viviennewestwood.com/dw/image/v2/BJGV_PRD/on/demandware.static/-/Library-Sites-viviennewestwood-global-content/default/dw8c63789d/images/collections/autumn-winter-25_26/AW2526%20Lookbook/2x3/VW_AW2526_Lookbook_Look_02.jpg?sw=632&sh=948&q=80",
    Brandname: "Gucci",
    name: "Produktbeschreibung random blabalba soll richtig lange sein",
    colour: "bg-black",
    colourname: "black",
    price: "220€",
    href: `/bekleidung/bekleidung/oberteile/${generateSlug("Produktbeschreibung random blabalba soll richtig lange sein")}`
  }
]

export default function NewProducts() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 })

  return (
    <section ref={ref as React.RefObject<HTMLElement>}>
      {/* Section header */}
      <div
        className={cn(
          "flex justify-center gap-4 items-center px-7 mb-4 transition-all duration-700",
          isVisible ? "opacity-100" : "opacity-0"
        )}
      >
        <hr className="flex-1 max-w-20 border-gray-300" />
        <p className="text-lg sm:text-xl md:text-2xl whitespace-nowrap tracking-wide">
          Neue Arrivals
        </p>
        <hr className="flex-1 max-w-20 border-gray-300" />
      </div>

      {/* Product grid with stagger */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {products.map((product, index) => (
          <div
            key={product.name}
            className={cn(
              "transition-all duration-700 ease-out",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
            style={{ transitionDelay: isVisible ? `${index * 100}ms` : '0ms' }}
          >
            <PopularProductCard {...product} />
          </div>
        ))}
      </div>

      {/* Button */}
      <div className="py-2 mt-5 flex justify-center items-center">
        <button className="relative w-full py-4 px-6 tracking-widest text-black/80 bg-[#F5F5F0] overflow-hidden group transition-colors duration-600">
          <span className="absolute left-1/2 -translate-x-1/2 top-[10%] w-full h-[1px] bg-black transition-all duration-500 ease-out group-hover:w-[75%]" />
          <span className="text-black text-xl">Mehr entdecken</span>
          <span className="absolute left-1/2 -translate-x-1/2 bottom-[10%] w-full h-[1px] bg-black transition-all duration-500 ease-out group-hover:w-[75%]" />
        </button>
      </div>
    </section>
  )
}
