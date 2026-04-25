import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "eu.manieredevoir.com",
      },
      {
        protocol: "https",
        hostname: "www.manieredevoir.com",
      },
      {
        protocol: "https",
        hostname: "www.viviennewestwood.com",
      },
    ],
  },
};

export default nextConfig;
