"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

function ImageGallery({ images, productName }: ImageGalleryProps) {
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

  return (
    <div className="relative w-full h-[60vh] md:h-[100vh]">
      {/* Quadrat-Indikator - Unten auf Mobile, Links auf Desktop */}
      <div className="absolute z-20 bottom-4 left-1/2 -translate-x-1/2 flex flex-row gap-3 md:bottom-auto md:left-4 md:top-1/2 md:-translate-y-1/2 md:translate-x-0 md:flex-col">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToImage(index)}
            className={`
              transition-all duration-300 rounded-full
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