import type { MetadataRoute } from 'next'
import { productApi } from '@/lib/api'
import { generateSlug } from '@/lib/product'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://enunas.com'

const routes = [
  '',
  '/bekleidung',
  '/bekleidung/streetwear',
  '/bekleidung/experimental',
  '/bekleidung/athleisure',
  '/bekleidung/cultural',
  '/bekleidung/star',
  '/neu',
  '/trendy',
  '/catalogue',
  '/drop',
  '/marken',
]

// Pull every product page in (paginated) so the sitemap reflects the real catalog. Guarded:
// a backend outage degrades to the static routes rather than failing the build.
async function productEntries(now: Date): Promise<MetadataRoute.Sitemap> {
  try {
    const entries: MetadataRoute.Sitemap = []
    const size = 200
    let page = 0
    let totalPages = 1
    do {
      const res = await productApi.list({ size, page })
      for (const p of res.content) {
        if (!p.slug) continue
        entries.push({
          url: `${siteUrl}/bekleidung/${generateSlug(p.brandName)}/${p.slug}`,
          lastModified: p.createdAt ? new Date(p.createdAt) : now,
          changeFrequency: 'weekly',
          priority: 0.6,
        })
      }
      totalPages = res.totalPages ?? 1
      page += 1
    } while (page < totalPages)
    return entries
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const staticRoutes: MetadataRoute.Sitemap = routes.map(path => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.7,
  }))
  return [...staticRoutes, ...await productEntries(now)]
}
