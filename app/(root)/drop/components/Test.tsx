import React from 'react'

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
    </div>
  );
}

export default Test;