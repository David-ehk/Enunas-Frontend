const Subscribe = () => {
  return (
    <section className="w-full h-full ">

    <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Linke Emailliste Anmelden */}
        <div className="flex flex-col justify-center items-center px-6 py-10 md:py-15 lg:py-20">
         <h2 className="text-2xl md:text-3xl lg:text-4xl mb-4">Newsletter</h2>
  
  <h4 className="text-center text-lg font-serif text-gray-700 mb-6 max-w-md">
    Subscribe to the Newsletter and be the first to receive 
    the latest news and secrets from Enunas
  </h4>
  
  {/* EMAIL INPUT */}
  <div className="w-full max-w-md">
    <input 
      type="email"
      placeholder="Deine E-Mail Adresse"
      className="w-full px-4 py-3 border border-gray-300 mb-3 focus:outline-none focus:border-black"
    />

 <button className="relative w-full py-4 px-6  tracking-widest text-white bg-[#370E4D] overflow-hidden group transition-colors duration-600">
  
  {/* Obere Linie - zentriert verkürzen */}
  <span className="absolute left-1/2 -translate-x-1/2 top-[10%] w-full h-[1px] bg-white transition-all duration-500 ease-out group-hover:w-[75%]"></span>
  
  {/* Text */}
  <span className="relative z-10">ABONNIEREN</span>
  
  {/* Untere Linie - zentriert verkürzen */}
  <span className="absolute left-1/2 -translate-x-1/2 bottom-[10%] w-full h-[1px] bg-white transition-all duration-500 ease-out group-hover:w-[75%]"></span>
  
</button>

  </div>
        </div>
        
        {/* Rechte Seite mit Logo - BEGRENZTE HÖHE */}
        <div className="relative h-[400px] md:h-[450px] lg:h-[400px] overflow-hidden flex items-center justify-center pt-5">
          <video 
            src="/assets/videos/3DLogo20sec.mp4" 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-contain"
          />
        </div>
    </div>

      {/* Seo Text C4A47C/f9dc84  */}
      <div className="py-6 sm:py-8 px-6 sm:px-12 text-lg md:text-xl">

        <h4 className="text-center">
          <span className="text-[#370E4D] font-bold">Enunas </span> ist die  Anlaufstelle für neue, innovative Designer im Bereich Luxus- und
  Streetwear. Wir verbinden aufstrebende Kreative mit einer Community, die mehr
  sucht als nur Kleidung – Menschen, die Ausdruck, Identität und Kultur in ihren
  Outfits tragen wollen. Als kuratierter <strong>Marktplatz</strong> und kreatives Movement bietet 
  <span className="text-[#370E4D] font-bold"> Enunas </span> exklusive Pieces, künstlerisches Storytelling und eine Plattform für 
  Designer, die die Zukunft von Mode prägen.  <span className="text-[#370E4D] font-bold">Enunas </span> ist nicht nur ein Shop, 
  sondern ein Ort für Stil, <span className="text-[#A4B7ED]"> Seele </span> und <span className="text-[#C4A47C]">Vision</span>.
        </h4>
      </div>
    </section>
  )
}

export default Subscribe