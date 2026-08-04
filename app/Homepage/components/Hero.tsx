"use client"
import React, { useState, useEffect } from 'react'

const Hero = () => {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 800)
    return () => clearTimeout(timer)
  }, [])

  // The homepage should always open on the hero video, not wherever the
  // browser's native scroll restoration (e.g. after using the back button)
  // last left the page.
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    window.scrollTo(0, 0)
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
