'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const CATEGORIES = [
  { name: 'Alle ansehen', slug: 'alle', href: '/bekleidung' },
  { name: 'Oberteile', slug: 'oberteile', href: '/bekleidung/oberteile' },
  { name: 'Hoodies & Sweatshirts', slug: 'hoodies', href: '/bekleidung/oberteile/hoodies' },
  { name: 'Jacken', slug: 'jacken', href: '/bekleidung/oberteile/jacken' },
  { name: 'T-Shirts', slug: 't-shirts', href: '/bekleidung/oberteile/t-shirts' },
  { name: 'Pullover & Strickwaren', slug: 'pullover', href: '/bekleidung/oberteile/pullover' },
  { name: 'Hemden', slug: 'hemden', href: '/bekleidung/oberteile/hemden' },
  { name: 'Hosen', slug: 'hosen', href: '/bekleidung/hosen' },
  { name: 'Jeans', slug: 'jeans', href: '/bekleidung/hosen/jeans' },
  { name: 'Jogger', slug: 'jogger', href: '/bekleidung/hosen/jogger' },
  { name: 'Shorts', slug: 'shorts', href: '/bekleidung/hosen/shorts' },
  { name: 'Accessoires', slug: 'accessoires', href: '/bekleidung/accessoires' },
]

export default function CategoryNavigation() {
  const pathname = usePathname()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)

  const isActive = (href: string) => {
    if (href === '/bekleidung') return pathname === '/bekleidung'
    return pathname.startsWith(href)
  }

  // Check scroll position for arrow visibility
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <nav className="w-full bg-[#F5F5F0] relative">
      {/* Left scroll indicator */}
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-white via-white to-transparent flex items-center justify-start pl-2 lg:hidden"
          aria-label="Nach links scrollen"
        >
          <ChevronLeft className="w-4 h-4 text-enunas-gray-medium" />
        </button>
      )}

      {/* Right scroll indicator */}
      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-white via-white to-transparent flex items-center justify-end pr-2 lg:hidden"
          aria-label="Nach rechts scrollen"
        >
          <ChevronRight className="w-4 h-4 text-enunas-gray-medium" />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="overflow-x-auto scrollbar-hide"
      >
        <div className="flex items-center gap-8 lg:gap-10 px-6 lg:px-12 py-4 min-w-max">

          {/* Main Category Label with Divider */}
          <div className="flex items-center gap-5">
            <span
              className="text-[10px] font-medium text-enunas-gray-medium uppercase tracking-[0.2em] whitespace-nowrap"
              style={{ fontFamily: 'var(--font-league-spartan)' }}
            >
              Bekleidung
            </span>
            <div className="h-4 w-px bg-gray-200" aria-hidden="true" />
          </div>

          {/* Scrollable Category Links - McQueen elegant style */}
          <div className="flex items-center gap-8 lg:gap-10">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={cat.href}
                className="group relative"
              >
                <span
                  className={`
                    text-[11px] whitespace-nowrap tracking-[0.03em]
                    transition-colors duration-300
                    ${isActive(cat.href)
                      ? 'text-enunas-black'
                      : 'text-enunas-gray-medium hover:text-enunas-black'
                    }
                  `}
                  style={{ fontFamily: 'var(--font-league-spartan)' }}
                >
                  {cat.name}
                </span>
                {/* Animated underline */}
                <span
                  className={`
                    absolute -bottom-1 left-0 h-px bg-enunas-black
                    transition-all duration-300 ease-out
                    ${isActive(cat.href)
                      ? 'w-full'
                      : 'w-0 group-hover:w-full'
                    }
                  `}
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
