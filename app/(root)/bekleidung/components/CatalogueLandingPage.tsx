import { productApi, apiProductToCardShape } from '@/lib/api'
import PopularProductCard from '@/app/Homepage/components/PopularProductCard'
import Link from 'next/link'
import type { ApiProduct } from '@/types/api'

export interface CatalogueConfig {
  name: string
  slug: string
  tagline: string
  color: string
}

function matchesCatalogue(p: ApiProduct, slug: string): boolean {
  return (p.catalogue ?? []).some(t => {
    const lower = t.toLowerCase()
    if (slug === 'cultural') return lower === 'cultural' || lower === 'culture'
    return lower === slug
  })
}

export default async function CatalogueLandingPage({ config }: { config: CatalogueConfig }) {
  const res = await productApi.list({ size: 100 }).catch(() => ({ content: [] as ApiProduct[] }))
  const products = res.content
    .filter(p => matchesCatalogue(p, config.slug))
    .map(apiProductToCardShape)

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section
        className="relative w-full flex flex-col items-center justify-center text-center"
        style={{
          backgroundColor: config.color,
          minHeight: '520px',
          padding: '120px 24px 100px',
        }}
      >
        {/* Back breadcrumb */}
        <Link
          href="/bekleidung"
          className="absolute top-8 left-8 flex items-center gap-2 transition-opacity duration-200 hover:opacity-70"
          style={{
            color: 'rgba(255,255,255,0.55)',
            fontFamily: 'var(--font-league-spartan)',
            fontSize: '10px',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M8 2L4 6l4 4" />
          </svg>
          Bekleidung
        </Link>

        {/* Eyebrow */}
        <span
          className="mb-7"
          style={{
            color: 'rgba(255,255,255,0.5)',
            fontFamily: 'var(--font-league-spartan)',
            fontSize: '10px',
            letterSpacing: '0.45em',
            textTransform: 'uppercase',
          }}
        >
          Enunas Catalogue
        </span>

        {/* Title */}
        <h1
          className="text-white mb-6"
          style={{
            fontFamily: 'var(--font-Cormorant-Garamond)',
            fontSize: 'clamp(68px, 10vw, 116px)',
            fontWeight: 300,
            lineHeight: 1,
            letterSpacing: '-0.01em',
          }}
        >
          {config.name}
        </h1>

        {/* Tagline */}
        <p
          style={{
            color: 'rgba(255,255,255,0.78)',
            fontFamily: 'var(--font-Cormorant-Garamond)',
            fontSize: '19px',
            fontStyle: 'italic',
            lineHeight: 1.55,
            maxWidth: '380px',
          }}
        >
          {config.tagline}
        </p>

        {/* Article count */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
          <span className="h-px w-10" style={{ background: 'rgba(255,255,255,0.22)' }} />
          <span
            style={{
              color: 'rgba(255,255,255,0.45)',
              fontFamily: 'var(--font-league-spartan)',
              fontSize: '10px',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
            }}
          >
            {products.length} {products.length === 1 ? 'Artikel' : 'Artikel'}
          </span>
          <span className="h-px w-10" style={{ background: 'rgba(255,255,255,0.22)' }} />
        </div>
      </section>

      {/* ── Product grid ─────────────────────────────────── */}
      <section className="px-4 lg:px-8 xl:px-12 py-16 lg:py-20">
        {products.length === 0 ? (
          <p
            className="text-center text-enunas-gray-medium"
            style={{
              fontFamily: 'var(--font-Cormorant-Garamond)',
              fontSize: '22px',
              fontStyle: 'italic',
              padding: '80px 0',
            }}
          >
            Keine Artikel verfügbar.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 max-w-[1800px] mx-auto">
            {products.map(p => (
              <PopularProductCard key={p.id} {...p} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
