import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { PostHogProvider } from "./providers";

const LeagueSpartan = localFont({
  src: [
    {
      path: './fonts/LeagueSpartan-Thin.woff2',
      weight: '100',
      style: 'normal'
    },
    {
      path: './fonts/LeagueSpartan-ExtraLight.woff2',
      weight: '200',
      style: 'normal'
    },
    {
      path: './fonts/LeagueSpartan-Light.woff2',
      weight: '300',
      style: 'normal'
    },
    {
      path: './fonts/LeagueSpartan-Regular.woff2',
      weight: '400',
      style: 'normal'
    },
    {
      path: './fonts/LeagueSpartan-Medium.woff2',
      weight: '500',
      style: 'normal'
    },
    {
      path: './fonts/LeagueSpartan-SemiBold.woff2',
      weight: '600',
      style: 'normal'
    },
    {
      path: './fonts/LeagueSpartan-Bold.woff2',
      weight: '700',
      style: 'normal'
    },
    {
      path: './fonts/LeagueSpartan-ExtraBold.woff2',
      weight: '800',
      style: 'normal'
    },
    {
      path: './fonts/LeagueSpartan-Black.woff2',
      weight: '900',
      style: 'normal'
    }
  ],
  variable: "--font-league-spartan",
  preload: false
})

const CormorantGaramond = localFont({
  src: [
    {
      path: './fonts/CormorantGaramond-Light.woff2',
      weight: '300',
      style: 'normal'
    },
    {
      path: './fonts/CormorantGaramond-LightItalic.woff2',
      weight: '300',
      style: 'italic'
    },
    {
      path: './fonts/CormorantGaramond-Regular.woff2',
      weight: '400',
      style: 'normal'
    },
    {
      path: './fonts/CormorantGaramond-SemiBold.woff2',
      weight: '600',
      style: 'normal'
    },
    {
      path: './fonts/CormorantGaramond-SemiBoldItalic.woff2',
      weight: '600',
      style: 'italic'
    },
    {
      path: './fonts/CormorantGaramond-Medium.woff2',
      weight: '500',
      style: 'normal'
    },
    {
      path: './fonts/CormorantGaramond-MediumItalic.woff2',
      weight: '500',
      style: 'italic'
    },
    {
      path: './fonts/CormorantGaramond-Bold.woff2',
      weight: '700',
      style: 'normal'
    },
    {
      path: './fonts/CormorantGaramond-BoldItalic.woff2',
      weight: '700',
      style: 'italic'
    },
    {
      path: './fonts/CormorantGaramond-Italic.woff2',
      weight: '400',
      style: 'italic'
    }
  ],
  variable: "--font-Cormorant-Garamond",
  // Both families: preloading all 19 files held back the homepage hero video (see layout.test.ts).
  preload: false
})



const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://enunas.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Enunas — Premium Fashion & Streetwear',
    template: '%s · Enunas',
  },
  description: 'Der kuratierte Marktplatz für Designer- und Streetwear. Entdecke exklusive Mode von aufstrebenden Marken.',
  applicationName: 'Enunas',
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    siteName: 'Enunas',
    url: siteUrl,
    title: 'Enunas — Premium Fashion & Streetwear',
    description: 'Der kuratierte Marktplatz für Designer- und Streetwear.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Enunas' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Enunas — Premium Fashion & Streetwear',
    description: 'Der kuratierte Marktplatz für Designer- und Streetwear.',
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="overflow-x-clip">
      <body className={`${LeagueSpartan.variable} ${CormorantGaramond.variable} w-full`}>
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
