
const HeroNew = () => {

return (
    <section>
        <div className="relative w-full h-[600px] pt-16">
      <img 
      src="/assets/images/NEWIN.jpg" 
      alt="New in"
      className="w-full h-full object-cover"
      />
    
  </div>

   
  <div className="py-10 px-7 sm:px-30">
    <h1 className="text-4xl flex justify-center mb-4">
        New in     
    </h1>
      {/* Beschreibung */}
      <p className="text-black font-light text-sm sm:text-lg flex justify-center mb-12 text-center">
        Wir pushen die Grenzen der Alltagswear. Unsere neuen Releases kombinieren ikonische Streetwear-Architektur mit einer mutigen, zeitgenössischen Note. Erwarte prägnante Oversize-Cuts, frische Farbpaletten und Grafiken, die für sich sprechen – für einen Look, der Selbstbewusstsein ausstrahlt.      </p>
       {/* Artikelanzahl muss noch dynamisch gemacht werden */}
        <p className='text-black/75 font-light text-sm sm:text-lg flex justify-center mb-12'>
            20 Artikel
        </p>
  </div>
    </section>


)}

export default HeroNew