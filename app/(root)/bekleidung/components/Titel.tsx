import React from 'react'

function Titel() {
  return (
    <section className=" bg-white sm:pt-30 pt-20">

          <br/>
          <div className="flex justify-center">
          <h2 className="text-black mb-2 text-4xl sm:text-5xl font-light">Bekleidung</h2>
          </div>
          <br/>
          <div className="flex justify-center ">
          <p className="text-black font-light text-lg md:text-xl">Deine <span className="text-[#C4A47C]">Geschichte</span>, dein <span className="text-[#C4A47C]">Style</span>. Jeder <span className="text-[#C4A47C]">Look</span>, ein <span className="text-[#C4A47C]">Statement</span>.</p>
          </div>
        


          {/* Muss Dynamisch zu den Artikel sein*/}
        <div className="flex justify-center sm:pt-10 pt-5">
          <p className="text-black font-light text-sm sm:text-lg"> 32 Artikel</p>
       </div>

        <br className="pt-10"/>
        
    </section>
  )
}

export default Titel