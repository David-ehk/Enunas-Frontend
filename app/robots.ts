import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://enunas.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Keep transactional, personal, and dashboard areas out of the index.
      disallow: ['/checkout', '/cart', '/account', '/dashboard', '/api'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
