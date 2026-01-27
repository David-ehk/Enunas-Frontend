'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

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

  const isActive = (href: string) => {
    if (href === '/bekleidung') return pathname === '/bekleidung'
    return pathname.startsWith(href)
  }

  return (
    <nav className="w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm fixed top-[52px] left-0 right-0 z-40">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-6 lg:gap-8 px-6 lg:px-12 py-4 min-w-max">

          {/* Main Category Label with Divider */}
          <div className="flex items-center gap-5 lg:gap-6">
            <span
              className="text-[11px] uppercase tracking-[0.15em] whitespace-nowrap text-gray-400"
              style={{ fontFamily: 'var(--font-league-spartan)' }}
            >
              Bekleidung
            </span>
            <div className="h-4 w-px bg-gray-300" aria-hidden="true" />
          </div>

          {/* Scrollable Category Links */}
          <div className="flex items-center gap-6 lg:gap-8">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={cat.href}
                className={`
                  relative text-[11px] whitespace-nowrap tracking-[0.05em]
                  transition-colors duration-200
                  ${isActive(cat.href)
                    ? 'text-gray-900'
                    : 'text-gray-500 hover:text-gray-900'
                  }
                `}
                style={{ fontFamily: 'var(--font-league-spartan)' }}
              >
                {cat.name}
                {/* Active indicator underline */}
                {isActive(cat.href) && (
                  <span
                    className="absolute -bottom-[1px] left-0 w-full h-px bg-gray-900"
                    aria-hidden="true"
                  />
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
