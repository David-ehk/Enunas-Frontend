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
        src="https://5btl2wh3w0.ufs.sh/f/XBXTuU9dmEWb5ezDfSckFBwi6nOgty0VquJsRoKMNzL9PZxC"
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-screen object-cover"
      />

      {/* Subtle gradient at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

      
    </section>
  )
}

export default Hero
