"use client"
import React, { useState, useEffect } from 'react'

const Hero = () => {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section id="home" className="w-full min-h-screen relative">
      <video
        src="/assets/videos/Version2Enunas.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-screen object-cover"
      />

      {/* Subtle gradient at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

      {/* Scroll indicator */}
      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2
                    transition-all duration-700 ease-out
                    ${loaded ? 'opacity-60 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <span className="text-white text-[10px] tracking-[0.3em] uppercase font-light">
          Scroll
        </span>
        <div className="w-px h-6 bg-white/60" />
      </div>
    </section>
  )
}

export default Hero
