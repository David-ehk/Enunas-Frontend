

const BannerBild = () => {
  return (
    <section>
       
     <div className="relative w-full h-[600px] mb-12">
    <img 
      src="https://www.viviennewestwood.com/dw/image/v2/BJGV_PRD/on/demandware.static/-/Library-Sites-viviennewestwood-global-content/default/dwbf118223/images/hp/2025/Wk%2043/VW_HERO_AW2526_October.jpg?sw=1920&sh=1200&q=80" 
      alt="New in"
      className="w-full h-full object-cover"
    />
    
    <div className="absolute inset-0 bg-black/30"></div>
    
    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
      <p className="text-xs uppercase tracking-widest mb-1">NEW IN</p>
      <h2 className="text-4xl md:text-6xl font-bold">Beliebte Produkte</h2>
    </div>
  </div>
    </section>
  )
}

export default BannerBild