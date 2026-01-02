
const HeroNew = () => {

return (
    <section>
        <div className="relative w-full h-[600px] pt-16">
      <img 
      src="/assets/images/TRENDY.jpg" 
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
    Diese Pieces sind unsere absoluten Top-Seller und Streetwear-Essentials. Sie kombinieren angesagte Silhouetten mit alltagstauglichem Komfort und sind der Beweis: Style muss keine Kompromisse machen. Der Look, der bei unserer Community immer trifft.
    </p>
       {/* Artikelanzahl muss noch dynamisch gemacht werden */}
        <p className='text-black/75 font-light text-sm sm:text-lg flex justify-center mb-12'>
            20 Artikel
        </p>
  </div>
    </section>


)}

export default HeroNew