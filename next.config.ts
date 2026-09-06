import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/datenschutzerkl%C3%A4rung',
        destination: '/datenschutzerklaerung',
        permanent: true,
      },
      {
        source: '/datenschutzerklärung',
        destination: '/datenschutzerklaerung',
        permanent: true,
      },
      {
        source: '/about%20us',
        destination: '/ueber-uns',
        permanent: true,
      },

      // ── Legacy WordPress / WooCommerce URLs still in Google's index ──
      // The site moved off WordPress; these paths no longer exist and were 404ing.
      // 308-redirect them to the nearest live equivalent so ranking + backlinks carry over.
      // Note: /cart, /checkout and /account already exist as real routes on the new site
      // and are intentionally NOT redirected here.
      { source: '/home', destination: '/', permanent: true },
      { source: '/blog', destination: '/', permanent: true },
      { source: '/blog/:path*', destination: '/', permanent: true },
      { source: '/sample-page', destination: '/', permanent: true },

      // WordPress feeds
      { source: '/feed', destination: '/', permanent: true },
      { source: '/feed/:path*', destination: '/', permanent: true },
      { source: '/comments/feed', destination: '/', permanent: true },

      // WordPress taxonomy / author archives
      { source: '/category/:slug*', destination: '/bekleidung', permanent: true },
      { source: '/tag/:slug*', destination: '/', permanent: true },
      { source: '/author/:slug*', destination: '/', permanent: true },

      // WooCommerce shop, products and account
      { source: '/shop', destination: '/bekleidung', permanent: true },
      { source: '/shop/:path*', destination: '/bekleidung', permanent: true },
      { source: '/product/:slug*', destination: '/bekleidung', permanent: true },
      { source: '/product-category/:slug*', destination: '/bekleidung', permanent: true },
      { source: '/product-tag/:slug*', destination: '/bekleidung', permanent: true },
      { source: '/my-account', destination: '/account', permanent: true },
      { source: '/my-account/:path*', destination: '/account', permanent: true },

      // Old WordPress core sitemap → the Next.js one
      { source: '/wp-sitemap.xml', destination: '/sitemap.xml', permanent: true },
      { source: '/sitemap_index.xml', destination: '/sitemap.xml', permanent: true },
    ]
  },
  images: {
    remotePatterns: [
      // ── Production product images (AWS S3 / CloudFront) — the host that actually
      //    matters; this is where real listing images live per CLAUDE.md. ──
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "**.cloudfront.net" },

      // ── Hosts used in real catalogue/marketing copy ──
      { protocol: "https", hostname: "i.imgur.com" },
      { protocol: "https", hostname: "cdn.rickowens.eu" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "eu.manieredevoir.com" },
      { protocol: "https", hostname: "www.manieredevoir.com" },
      { protocol: "https", hostname: "www.viviennewestwood.com" },
      { protocol: "https", hostname: "**.ufs.sh" },

      // ── Demo/mock-data only (designer CDNs). Remove once mock data is gone. ──
      { protocol: "https", hostname: "amq-mcq.dam.kering.com" },
      { protocol: "https", hostname: "diorama.dam-broadcast.com" },
    ],
  },
};

export default nextConfig;
