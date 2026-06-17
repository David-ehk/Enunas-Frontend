import { Suspense } from 'react'
import { productApi, apiProductToCardShape } from '@/lib/api'
import type { ApiProduct } from '@/types/api'
import CatalogueContent from './CatalogueContent'
import type { CatalogueConfig } from './CatalogueContent'

export type { CatalogueConfig }

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
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#fff' }} />}>
      <CatalogueContent initialProducts={products} config={config} />
    </Suspense>
  )
}
