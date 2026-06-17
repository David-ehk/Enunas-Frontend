'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const CATEGORIES = [
  { name: 'Alle ansehen',           slug: 'alle',        cat: '' },
  { name: 'Oberteile',              slug: 'oberteile',   cat: 'oberteile' },
  { name: 'Hoodies & Sweatshirts',  slug: 'hoodies',     cat: 'hoodies' },
  { name: 'Jacken',                 slug: 'jacken',      cat: 'jacken' },
  { name: 'T-Shirts',               slug: 't-shirts',    cat: 'tshirts' },
  { name: 'Pullover & Strickwaren', slug: 'pullover',    cat: 'strick' },
  { name: 'Unterteile',             slug: 'unterteile',  cat: 'hosen' },
  { name: 'Jeans',                  slug: 'jeans',       cat: 'jeans' },
  { name: 'Jogger',                 slug: 'jogger',      cat: 'jogger' },
  { name: 'Shorts',                 slug: 'shorts',      cat: 'shorts' },
  { name: 'Schuhe',                 slug: 'schuhe',      cat: 'schuhe' },
  { name: 'Accessoires',            slug: 'accessoires', cat: 'accessoires' },
]

export default function CategoryNavigation({ basePath = '/bekleidung' }: { basePath?: string }) {
  const searchParams = useSearchParams()
  const activeCat   = searchParams.get('cat') || ''
  const gender      = searchParams.get('gender') || ''

  function buildHref(cat: string) {
    const p = new URLSearchParams()
    if (cat)    p.set('cat',    cat)
    if (gender) p.set('gender', gender)
    const q = p.toString()
    return q ? `${basePath}?${q}` : basePath
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      maxWidth: 1800,
      margin: '0 auto',
      padding: '0 48px',
      overflowX: 'auto',
      scrollbarWidth: 'none',
    }}>
      {CATEGORIES.map((cat) => {
        const isActive = cat.cat === activeCat
        return (
          <Link
            key={cat.slug}
            href={buildHref(cat.cat)}
            style={{
              position: 'relative',
              flexShrink: 0,
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: isActive ? '#0A0A0A' : '#9B9B9B',
              textDecoration: 'none',
              padding: '18px 20px',
              whiteSpace: 'nowrap',
              fontWeight: isActive ? 500 : 400,
              fontFamily: "'League Spartan', sans-serif",
              display: 'inline-flex',
              alignItems: 'center',
              transition: 'color 300ms cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            {cat.name}
            <span style={{
              position: 'absolute',
              left: 20,
              right: 20,
              bottom: 0,
              height: 1,
              background: '#0A0A0A',
              transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
              transformOrigin: isActive ? 'left' : 'right',
              transition: 'transform 400ms cubic-bezier(0.16,1,0.3,1)',
            }} />
          </Link>
        )
      })}
    </div>
  )
}
