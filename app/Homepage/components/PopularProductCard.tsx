import Link from "next/link"

// Bug href ist falsch muss zum nächsten produkt weirter zeigen

const PopularProductCard = ({imgURL,Brandname, name,colour, colourname, price, href}) => {

  return (
 <div className="flex flex-1 flex-col w-full group">
      <a href={href} className="block">
        {/* Bild Container mit Favorite Icon */}
        <div className="relative w-full aspect-[4/5] mb-2 overflow-hidden">
          <img 
            className="w-full h-full object-cover" 
            src={imgURL}
            alt={name}
          />
          
          {/* Favorite Star Icon - oben rechts braucht ein bessres Icon */}
          <button className="absolute top-4 right-4 p-2 ">
            <span className="text-lg">♡</span>
          </button>

        </div>

        {/* Text Content mit mehr Weißraum */}
        <div >
          {/* Neu Badge und Brand Name in einer Zeile */}
          <div className=" ">
            {/*isNew && (
              <span className="text-xs font-light text-gray-400 tracking-wide">
                Neu Eingetroffen
              </span>
            )*/}

           
              <div>
                 <p className="text-lg font-light text-black/60 tracking-wide hover:text-purple-900 ">
                   {Brandname}
                 </p>
              </div>
            
          </div>

          {/* Produktname in eleganter Serif Italic */}
          <h3 className="text-base font-serif leading-relaxed">
            {name}
          </h3>

          {/* Preis - prominent */}
          <p className="text-sm font-light text-gray-900 mt-1">
            {price}
          </p>

          {/* Farboptionen - klein und dezent am Ende */}
          <div className="flex items-center gap-2 mt-1">
            <div 
              className={`w-5 h-5 rounded-sm border border-gray-200 ${colour}`}
              aria-label={colour}
            />

            <div 
              className="w-5 h-5 rounded-sm border border-gray-200 bg-gray-800"
              aria-label="Schwarz"
            />

          </div>
          
        </div>
      </a>
    </div> 
  )
}

export default PopularProductCard