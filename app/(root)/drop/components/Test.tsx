import React from 'react'
import ASCIIText from "@/components/ASCIIText";


// Component ported and enhanced from https://codepen.io/JuanFuentes/pen/eYEeoyE
  


function Test() {
  return (
     
    <div className="pt-16 min-h-screen">
      <div className="relative">
        <video src="/assets/videos/Inspiration.mp4" autoPlay loop muted playsInline className="w-full h-screen object-cover"/>
        <span className="absolut inset-0 bg-black/30"></span>
      </div>
      <div className="flex-1 flex items-center justify-center pt-20 min-h-screen">
      <h2 className="text-white text-4xl md:text-6xl font-light">Comming soon</h2>
      </div>
      <ASCIIText
        text="Drops!"
        enableWaves
        asciiFontSize={14}
      />
    </div>
  );
}

export default Test;