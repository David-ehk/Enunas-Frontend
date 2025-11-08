const PopularProductCard = ({imgURL,Brandname, name,colour, colourname, price}) => {
  return (
 <div className="flex flex-1 flex-col w-full group">
      <a href="#" className="block">
        {/* Bild Container mit Favorite Icon */}
        <div className="relative w-full aspect-[3/4] mb-4 overflow-hidden">
          <img 
            className="w-full h-full object-cover" 
            src={imgURL}
            alt={name}
          />
          
          {/* Favorite Star Icon - oben rechts */}
          <button 
            className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
            aria-label="Add to favorites"
          >
          </button>
        </div>

        {/* Text Content mit mehr Weißraum */}
        <div className="space-y-1">
          {/* Neu Badge und Brand Name in einer Zeile */}
          <div className="flex items-center gap-3">
            {/*isNew && (
              <span className="text-xs font-light text-gray-400 tracking-wide">
                Neu Eingetroffen
              </span>
            )*/}
            <span className="text-xl sm:text-lg font-light text-gray-400 tracking-wide">
              {Brandname}
            </span>
          </div>

          {/* Produktname in eleganter Serif Italic */}
          <h3 className="text-lg sm:text-base font-serif  text-gray-700 leading-relaxed mt-2">
            {name}
          </h3>

          {/* Preis - prominent */}
          <p className="text-sm font-light text-gray-900 mt-3">
            €{price}
          </p>

          {/* Farboptionen - klein und dezent am Ende */}
          <div className="flex items-center gap-2 mt-1 pt-2">
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