"use client"
import React, { useState, useEffect, useRef } from 'react'

const Hero = () => {
  const [loaded, setLoaded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

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

  // Chrome (and other browsers) can fail to honor the muted/autoPlay JSX attributes on first
  // paint — React sets them as DOM attributes, but the browser's autoplay gate checks the live
  // `.muted` PROPERTY at the exact moment it decides whether to play, and that property isn't
  // always synced in time during hydration. Setting it imperatively and calling .play()
  // explicitly — with the rejected promise caught and retried once more data is buffered — is
  // the reliable fix for this across browsers, not just relying on the attributes below.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = true
    video.defaultMuted = true
    const playPromise = video.play()
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        const retry = () => { video.play().catch(() => {}) }
        video.addEventListener('canplaythrough', retry, { once: true })
      })
    }
  }, [])

  return (
    <section id="home" className="w-full min-h-screen relative">
      <video
        ref={videoRef}
        src="https://5btl2wh3w0.ufs.sh/f/XBXTuU9dmEWb5ezDfSckFBwi6nOgty0VquJsRoKMNzL9PZxC"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="w-full h-screen object-cover"
      />

      {/* Subtle gradient at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

      
    </section>
  )
}

export default Hero
