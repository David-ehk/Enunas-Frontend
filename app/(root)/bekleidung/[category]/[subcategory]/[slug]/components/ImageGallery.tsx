"use client"

import React, { useState, useEffect, useRef } from 'react'

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRefs = useRef<(HTMLDivElement | null)[]>([])

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

  // Scroll zu bestimmtem Bild
  const scrollToImage = (index: number) => {
    imageRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    })
  }

  return (
    <div className="relative w-full h-[100vh]">
      {/* Quadrat-Indikator - Links */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToImage(index)}
            className={`
              transition-all duration-300 bg-[#370E4D]
              ${activeIndex === index 
                ? 'w-2.5 h-2.5 opacity-100 bg-[#370E4D]' 
                : 'w-1.5 h-1.5 opacity-40 hover:opacity-70 bg-black'
              }
            `}
            aria-label={`Zu Bild ${index + 1} scrollen`}
          />
        ))}
      </div>

      {/* Scrollbarer Container - bleibt an Ort und Stelle */}
      <div 
        ref={containerRef}
        className="w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ 
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {/* Bilder untereinander - Smooth Scroll */}
        {images.map((image, index) => (
          <div
            key={index}
            ref={(el) => (imageRefs.current[index] = el)}
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