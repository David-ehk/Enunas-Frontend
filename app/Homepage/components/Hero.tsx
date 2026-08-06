"use client"
import React, { useState, useEffect, useRef } from 'react'

const Hero = () => {
  const [loaded, setLoaded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 800)
    return () => clearTimeout(timer)
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

  // Some mobile browsers (iOS Low Power Mode, Android Chrome Data Saver) reject
  // muted autoplay outright as a policy decision, not because the video hasn't
  // buffered yet — so the canplaythrough retry above never fires and the video
  // sits on a native "tap to play" state. Starting playback on the very first
  // touch/scroll/click anywhere on the page (not just on the video itself)
  // means it starts the instant the visitor does anything, rather than
  // requiring them to find and press a play button.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const tryPlay = () => { video.play().catch(() => {}) }
    const events: Array<keyof DocumentEventMap> = ['touchstart', 'pointerdown', 'click', 'scroll']
    events.forEach(event => document.addEventListener(event, tryPlay, { once: true, passive: true }))
    return () => {
      events.forEach(event => document.removeEventListener(event, tryPlay))
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
