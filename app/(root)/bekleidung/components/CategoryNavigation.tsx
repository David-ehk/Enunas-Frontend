'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const CATEGORIES = [
  { name: 'Alle ansehen', slug: 'alle', href: '/bekleidung', category: '', type: '' },
  { name: 'Oberteile', slug: 'oberteile', href: '/bekleidung?category=oberteile', category: 'oberteile', type: '' },
  { name: 'Hoodies & Sweatshirts', slug: 'hoodies', href: '/bekleidung?category=oberteile&type=hoodie', category: 'oberteile', type: 'hoodie' },
  { name: 'Jacken', slug: 'jacken', href: '/bekleidung?category=jacken', category: 'jacken', type: '' },
  { name: 'T-Shirts', slug: 't-shirts', href: '/bekleidung?category=oberteile&type=tshirts', category: 'oberteile', type: 'tshirts' },
  { name: 'Pullover & Strickwaren', slug: 'pullover', href: '/bekleidung?category=oberteile&type=sweater', category: 'oberteile', type: 'sweater' },
  { name: 'Hemden', slug: 'hemden', href: '/bekleidung?category=oberteile&type=hemden', category: 'oberteile', type: 'hemden' },
  { name: 'Hosen', slug: 'hosen', href: '/bekleidung?category=hosen', category: 'hosen', type: '' },
  { name: 'Jeans', slug: 'jeans', href: '/bekleidung?category=hosen&type=jeans', category: 'hosen', type: 'jeans' },
  { name: 'Jogger', slug: 'jogger', href: '/bekleidung?category=hosen&type=jogging', category: 'hosen', type: 'jogging' },
  { name: 'Shorts', slug: 'shorts', href: '/bekleidung?category=hosen&type=shorts', category: 'hosen', type: 'shorts' },
  { name: 'Accessoires', slug: 'accessoires', href: '/bekleidung?category=accessoires', category: 'accessoires', type: '' },
]

export default function CategoryNavigation() {
  const searchParams = useSearchParams()

  const activeCategory = searchParams.get('category') || ''
  const activeType = searchParams.get('type') || ''

  const isActive = (cat: typeof CATEGORIES[number]) => {
    return cat.category === activeCategory && cat.type === activeType
  }

  return (
    <nav className="w-full bg-[#F5F5F0] border-b border-gray-200">
      <div
        className="flex items-center gap-6 lg:gap-8 px-6 lg:px-12 py-3 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={cat.href}
            className="group relative flex-shrink-0"
          >
            <span
              className={`
                text-xs font-medium uppercase tracking-[0.05em] whitespace-nowrap
                transition-opacity duration-300
                ${isActive(cat)
                  ? 'text-enunas-black'
                  : 'text-enunas-gray-medium hover:opacity-60'
                }
              `}
              style={{ fontFamily: 'var(--font-league-spartan)' }}
            >
              {cat.name}
            </span>
            {isActive(cat) && (
              <span
                className="absolute -bottom-1 left-0 w-full h-px bg-enunas-black"
                aria-hidden="true"
              />
            )}
          </Link>
        ))}
      </div>
    </nav>
  )
}
