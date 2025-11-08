import React from 'react'
import PopularProductCard from './PopularProductCard'

const products =[{ imgURL: "https://www.manieredevoir.com/cdn/shop/files/GEN-WD-23-10-2025.jpg?crop=center&height=2095&v=1761206881&width=1920",
    Brandname: "Puma",
    name: "nike air shoes 5 auch hier richtig lange ohne Grund",
    colour: "bg-[#DE0000]",
    colourname: "red",
    price: "220€"
  },
  {
    imgURL: "https://www.viviennewestwood.com/dw/image/v2/BJGV_PRD/on/demandware.static/-/Sites-viviennewestwood-master-catalog/default/dw69896e20/images/2G01000A-J001M-_GREY-MELANGE_001_large.jpeg?q=80",
    Brandname: "Addidas",
    name: "Worlds End Denim Boxer Jacket einfach zum test blablabla",
    colour: "bg-[#630393]",        
    colourname: "purple",       
    price: "220€"
  },
  {
    imgURL: "https://eu.manieredevoir.com/cdn/shop/files/MDV_0030_MDV2_be0fab84-a04c-4251-adc9-1fefaa4175c4.jpg?v=1759502594",
    Brandname: "Maison Louis",
    name: "D.D. Shell hooded-padded jacket",
    colour: "bg-[#FFFFFF]",       
    colourname: "white",      
    price: "220€"
  },
  {
    imgURL: "https://www.viviennewestwood.com/dw/image/v2/BJGV_PRD/on/demandware.static/-/Library-Sites-viviennewestwood-global-content/default/dw8c63789d/images/collections/autumn-winter-25_26/AW2526%20Lookbook/2x3/VW_AW2526_Lookbook_Look_02.jpg?sw=632&sh=948&q=80",
    Brandname: "Gucci",
    name: "Produktbeschreibung random blabalba soll richtig lange sein",
    colour: "bg-black",       
    colourname: "black",      
    price: "220€"}
]

export default function NewProducts() {
  
  return (
    <section>
        <div className="py-4 sm:px-3 px-4 ">
           <p className="2xl md:3xl lg:4xl mb-3">Neue Arrivals</p> 
           
           <h4 className="text-base md:text-xl text-gray-600 "> Frisch eingetroffen – Die neuesten Trendsetter der Saison</h4>
        </div>

        <br/>
        
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {products.map((product) => {
          return <PopularProductCard key={product.name} {...product}/>
        })}
      </div>
    </section>
  )
}
