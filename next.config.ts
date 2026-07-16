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

      // ── Demo/mock-data only (designer CDNs). Remove once mock data is gone. ──
      { protocol: "https", hostname: "amq-mcq.dam.kering.com" },
      { protocol: "https", hostname: "diorama.dam-broadcast.com" },
    ],
  },
};

export default nextConfig;
