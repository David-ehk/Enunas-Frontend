"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import GlassCursor from '@/components/GlassCursor'

interface ImageGalleryProps {
  images: string[];
  productName: string;
  /** Wired up by ProductDetails — omitted entirely hides the heart button. */
  saved?: boolean;
  onToggleSaved?: () => void;
  /** Plays the one-shot pop when a heart is saved (not on unsave). */
  justSaved?: boolean;
  /** Omitted hides the share button. Rendered on md/sm only — see GalleryActions. */
  onShare?: () => void;
  /** Brief "Link kopiert" acknowledgment when Web Share isn't available and the URL was
      copied to the clipboard instead. */
  shareCopied?: boolean;
}

// Heart + share, overlaid top-right on the hero image — same spot and same heart used on
// product cards elsewhere (PopularProductCard.tsx), so saving reads as the same action
// everywhere. Share is native (`navigator.share`) where available, which desktop browsers
// mostly don't offer, hence `lg:hidden` — on desktop there's no OS share sheet to hand the link
// to, so the button would just always fall through to "copy link", better done in one place.
function GalleryActions({ saved, onToggleSaved, justSaved, onShare, shareCopied }: Omit<ImageGalleryProps, 'images' | 'productName'>) {
  if (!onToggleSaved && !onShare) return null
  return (
    <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
      {onToggleSaved && (
        <button
          type="button"
          onClick={onToggleSaved}
          aria-label={saved ? 'Von Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
          aria-pressed={saved}
          className="w-8 h-8 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center hover:bg-white/90 transition-colors duration-200"
        >
          <svg
            className={`w-4 h-4 transition-colors ${saved ? 'text-enunas-purple' : 'text-enunas-black'} ${justSaved ? 'animate-heart-pop' : ''}`}
            fill={saved ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      )}
      {onShare && (
        <div className="relative lg:hidden">
          <button
            type="button"
            onClick={onShare}
            aria-label="Seite teilen"
            className="w-8 h-8 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center hover:bg-white/90 transition-colors duration-200"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-enunas-black">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <path d="M8.6 10.6l6.8-3.8M8.6 13.4l6.8 3.8" />
            </svg>
          </button>
          {shareCopied && (
            <span className="absolute top-full right-0 mt-2 whitespace-nowrap bg-enunas-black text-white text-[11px] px-2.5 py-1 rounded pointer-events-none">
              Link kopiert
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Small magnifier used for both "zoom in" (on the gallery) and "zoom out" (in the viewer).
function ZoomIcon({ minus }: { minus?: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <circle cx="6.25" cy="6.25" r="5.4" stroke="currentColor" strokeWidth="1.2" />
      <path d="m10.3 10.3 3.6 3.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d={minus ? 'M3.9 6.25h4.7' : 'M3.9 6.25h4.7M6.25 3.9v4.7'} stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

// Full-width viewer, modelled on self-portrait's PDP zoom: every image takes the whole viewport
// width and the column scrolls vertically, opened so the exact spot that was clicked stays where
// the pointer is. A thumbnail strip stays on the left. Click an image, press Escape or use the
// corner icon to go back. Pinch zoom stays available on touch.
interface ZoomStart { index: number; fx: number; fy: number }

function ZoomViewer({ images, productName, start, onClose }: {
  images: string[]
  productName: string
  start: ZoomStart
  /** Called with the image that was in view when the viewer closed. */
  onClose: (lastIndex: number) => void
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const [ready, setReady] = useState(false)
  const [current, setCurrent] = useState(start.index)
  const currentRef = useRef(start.index)

  const close = useCallback(() => onClose(currentRef.current), [onClose])

  const indexInView = useCallback(() => {
    const sc = scrollerRef.current
    if (!sc) return 0
    const mid = sc.scrollTop + sc.clientHeight / 2
    let found = 0
    ;(Array.from(sc.children) as HTMLElement[]).forEach((el, i) => {
      if (el.offsetTop <= mid) found = i
    })
    return found
  }, [])

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    // Wait for every image to have its real height (they are already cached from the gallery),
    // then put the clicked spot at the middle of the screen before showing anything.
    const sc = scrollerRef.current
    const imgs = sc ? (Array.from(sc.querySelectorAll('img')) as HTMLImageElement[]) : []
    let cancelled = false
    Promise.all(imgs.map(i => i.decode().catch(() => {}))).then(() => {
      if (cancelled || !sc) return
      const target = sc.children[start.index] as HTMLElement | undefined
      if (target) {
        const y = target.offsetTop + start.fy * target.offsetHeight - sc.clientHeight / 2
        sc.scrollTop = Math.max(0, y)
      }
      setReady(true)
    })

    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => {
      cancelled = true
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus?.()
    }
  }, [start, close])

  const onScroll = () => {
    const i = indexInView()
    currentRef.current = i
    setCurrent(i)
  }

  const goTo = (i: number) => {
    const sc = scrollerRef.current
    const target = sc?.children[i] as HTMLElement | undefined
    if (!sc || !target) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    sc.scrollTo({ top: target.offsetTop, behavior: reduce ? 'auto' : 'smooth' })
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${productName} – Bildzoom`}
      className="fixed inset-0 z-[9000] bg-white ease-out-expo"
      style={{ opacity: ready ? 1 : 0, transition: 'opacity 300ms' }}
    >
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="h-full w-full overflow-y-auto"
        style={{ touchAction: 'pan-x pan-y pinch-zoom', scrollbarWidth: 'none' }}
      >
        {images.map((image, index) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={index}
            src={image}
            alt={`${productName} - Ansicht ${index + 1}`}
            onClick={close}
            className="block w-full h-auto cursor-zoom-out"
          />
        ))}
      </div>

      {images.length > 1 && (
        <div className="fixed left-4 top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-2 md:flex">
          {images.map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Zu Bild ${index + 1}`}
              aria-current={current === index}
              className={`h-[60px] w-[44px] overflow-hidden border transition-opacity duration-300 ease-out-expo ${
                current === index ? 'border-enunas-black opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <GlassCursor targetRef={scrollerRef} mode="minus" />
      <button
        ref={closeRef}
        type="button"
        onClick={close}
        aria-label="Zoom schließen"
        className="fixed bottom-4 left-4 z-10 p-2 text-white mix-blend-difference focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
      >
        <ZoomIcon minus />
      </button>
    </div>,
    document.body,
  )
}

function ImageGallery({ images, productName, saved, onToggleSaved, justSaved, onShare, shareCopied }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [zoomStart, setZoomStart] = useState<ZoomStart | null>(null)
  const closeZoom = useCallback((lastIndex: number) => {
    setZoomStart(null)
    // Put the gallery back on the image the viewer ended on.
    imageRefs.current[lastIndex]?.scrollIntoView({ behavior: 'auto', block: 'center' })
  }, [])
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRefs = useRef<(HTMLDivElement | null)[]>([])

  // Ref callback that properly assigns without returning void
  const setImageRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    imageRefs.current[index] = el
  }, [])

  // Verfolge welches Bild gerade im Viewport ist
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = imageRefs.current.indexOf(entry.target as HTMLDivElement)
            if (index !== -1) {
              setActiveIndex(index)
            }
          }
        })
      },
      {
        root: container,
        threshold: 0.5,
        rootMargin: '0px'
      }
    )

    imageRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  // Scroll zu bestimmtem Bild - responsive für horizontal (mobile) und vertical (desktop)
  const scrollToImage = (index: number) => {
    const isMobile = window.innerWidth < 768
    imageRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      block: isMobile ? 'nearest' : 'center',
      inline: isMobile ? 'center' : 'nearest'
    })
  }

  if (images.length === 0) {
    return (
      <div
        className="relative w-full h-[60vh] md:h-[100vh] flex flex-col items-center justify-center"
        style={{ background: '#F5F5F0' }}
      >
        <GalleryActions saved={saved} onToggleSaved={onToggleSaved} justSaved={justSaved} onShare={onShare} shareCopied={shareCopied} />
        <svg
          width="48" height="48" viewBox="0 0 48 48" fill="none"
          style={{ opacity: 0.18, marginBottom: '16px' }}
        >
          <rect x="4" y="8" width="40" height="32" rx="2" stroke="#370E4D" strokeWidth="1.5" />
          <circle cx="17" cy="20" r="4" stroke="#370E4D" strokeWidth="1.5" />
          <path d="M4 36l10-10 8 8 6-6 16 12" stroke="#370E4D" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
        <span
          style={{
            fontFamily: 'var(--font-league-spartan)',
            fontSize: '11px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#6B6B6B',
            opacity: 0.7,
          }}
        >
          {productName}
        </span>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[60vh] md:h-[100vh]">
      <GalleryActions saved={saved} onToggleSaved={onToggleSaved} justSaved={justSaved} onShare={onShare} shareCopied={shareCopied} />

      {/* Quadrat-Indikator - Unten auf Mobile, Links auf Desktop */}
      <div className="absolute z-20 bottom-4 left-1/2 -translate-x-1/2 flex flex-row gap-3 md:bottom-auto md:left-4 md:top-1/2 md:-translate-y-1/2 md:translate-x-0 md:flex-col">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToImage(index)}
            className={`
              transition-all duration-300
              ${activeIndex === index
                ? 'w-2.5 h-2.5 opacity-100 bg-[#370E4D]'
                : 'w-1.5 h-1.5 opacity-40 hover:opacity-70 bg-black'
              }
            `}
            aria-label={`Zu Bild ${index + 1} scrollen`}
          />
        ))}
      </div>

      {/* Scrollbarer Container - Horizontal auf Mobile, Vertical auf Desktop */}
      <div
        ref={containerRef}
        className="w-full h-full scrollbar-hide flex flex-row overflow-x-scroll snap-x snap-mandatory md:flex-col md:overflow-x-hidden md:overflow-y-scroll md:snap-y"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {/* Bilder - Horizontal scrollbar auf Mobile, Vertical auf Desktop */}
        {images.map((image, index) => (
          <div
            key={index}
            ref={setImageRef(index)}
            className="w-full h-full snap-center snap-always flex-shrink-0 bg-gray-50"
          >
            <img
              src={image}
              alt={`${productName} - Ansicht ${index + 1}`}
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect()
                setZoomStart({
                  index,
                  fx: (e.clientX - r.left) / r.width,
                  fy: (e.clientY - r.top) / r.height,
                })
              }}
              className="w-full h-full object-cover cursor-zoom-in"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setZoomStart({ index: activeIndex, fx: 0.5, fy: 0.5 })}
        aria-label="Bild vergrößern"
        className="absolute top-3 left-3 z-20 p-2 text-white mix-blend-difference focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
      >
        <ZoomIcon />
      </button>

      <GlassCursor targetRef={containerRef} mode="plus" />

      {zoomStart !== null && (
        <ZoomViewer images={images} productName={productName} start={zoomStart} onClose={closeZoom} />
      )}

      {/* CSS zum Verstecken der Scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

export default ImageGallery
