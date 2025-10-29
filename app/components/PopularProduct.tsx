import PopularProductCard from "../components/PopularProductCard"
import { shoe4,shoe5,shoe6, shoe7 } from "../constants"

const products = [
  {
    imgURL: "https://www.manieredevoir.com/cdn/shop/files/GEN-WD-23-10-2025.jpg?crop=center&height=2095&v=1761206881&width=1920",
    Brandname: "Nike",
    name: "nike air shoes 5",
    colour: "bg-[#DE0000]",
    colourname: "red",
    price: "220€"
  },
  {
    imgURL: "https://www.viviennewestwood.com/dw/image/v2/BJGV_PRD/on/demandware.static/-/Sites-viviennewestwood-master-catalog/default/dw69896e20/images/2G01000A-J001M-_GREY-MELANGE_001_large.jpeg?q=80",
    Brandname: "Jordan",
    name: "Worlds End Denim Boxer Jacket",
    colour: "bg-[#630393]",        // ✅ Hinzugefügt
    colourname: "pruple",       // ✅ Hinzugefügt
    price: "220€"
  },
  {
    imgURL: "https://eu.manieredevoir.com/cdn/shop/files/MDV_0030_MDV2_be0fab84-a04c-4251-adc9-1fefaa4175c4.jpg?v=1759502594",
    Brandname: "Maison Guava",
    name: "D.D. Shell hooded-padded jacket",
    colour: "bg-[#FFFFFF]",       // ✅ Hinzugefügt
    colourname: "white",      // ✅ Hinzugefügt
    price: "220€"
  },
  {
    imgURL: "https://www.viviennewestwood.com/dw/image/v2/BJGV_PRD/on/demandware.static/-/Library-Sites-viviennewestwood-global-content/default/dw8c63789d/images/collections/autumn-winter-25_26/AW2526%20Lookbook/2x3/VW_AW2526_Lookbook_Look_02.jpg?sw=632&sh=948&q=80",
    Brandname: "6pm",
    name: "Produktbeschreibung random blabalba",
    colour: "bg-black",       // ✅ Hinzugefügt
    colourname: "black",      // ✅ Hinzugefügt
    price: "220€"
  }
]




const PopularProduct = () => {
  return (
    <section id="products" className='max-container max-sm:mt-12'>
        <div className="flex flex-col justify-start gap 5">
            <p className="text-4xl">Beliebte Produkte</p>
            <br/>
              <h4> Erlebe hervorangede Qualität von Top Designern</h4>
        </div>

        <div className=" mt-16 grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 sm:gap-2 gap-2.5">
          {products.map((products)=>(
            <PopularProductCard key={products.name} {...products}/>
          ))}
        </div>
    </section>
  )
}

export default PopularProduct