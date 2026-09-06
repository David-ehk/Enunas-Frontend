"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'

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
          className="w-10 h-10 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors duration-200"
        >
          <svg
            className={`w-5 h-5 transition-colors ${saved ? 'text-enunas-purple' : 'text-enunas-black'} ${justSaved ? 'animate-heart-pop' : ''}`}
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
            className="w-10 h-10 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors duration-200"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-enunas-black">
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

function ImageGallery({ images, productName, saved, onToggleSaved, justSaved, onShare, shareCopied }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
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
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

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
