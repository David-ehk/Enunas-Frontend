import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const LeagueSpartan = localFont({
  src: [
    {
      path: './fonts/LeagueSpartan-Thin.ttf',
      weight: '100',
      style: 'normal'
    },
    {
      path: './fonts/LeagueSpartan-ExtraLight.ttf',
      weight: '200',
      style: 'normal'
    },
    {
      path: './fonts/LeagueSpartan-Light.ttf',
      weight: '300',
      style: 'normal'
    },
    {
      path: './fonts/LeagueSpartan-Regular.ttf',
      weight: '400',
      style: 'normal'
    },
    {
      path: './fonts/LeagueSpartan-Medium.ttf',
      weight: '500',
      style: 'normal'
    },
    {
      path: './fonts/LeagueSpartan-SemiBold.ttf',
      weight: '600',
      style: 'normal'
    },
    {
      path: './fonts/LeagueSpartan-Bold.ttf',
      weight: '700',
      style: 'normal'
    },
    {
      path: './fonts/LeagueSpartan-ExtraBold.ttf',
      weight: '800',
      style: 'normal'
    },
    {
      path: './fonts/LeagueSpartan-Black.ttf',
      weight: '900',
      style: 'normal'
    }
  ],
  variable: "--font-league-spartan"
})

const CormorantGaramond = localFont({
  src: [
    {
      path: './fonts/CormorantGaramond-Light.ttf',
      weight: '300',
      style: 'normal'
    },
    {
      path: './fonts/CormorantGaramond-LightItalic.ttf',
      weight: '300',
      style: 'italic'
    },
    {
      path: './fonts/CormorantGaramond-Regular.ttf',
      weight: '400',
      style: 'normal'
    },
    {
      path: './fonts/CormorantGaramond-SemiBold.ttf',
      weight: '600',
      style: 'normal'
    },
    {
      path: './fonts/CormorantGaramond-SemiBoldItalic.ttf',
      weight: '600',
      style: 'italic'
    },
    {
      path: './fonts/CormorantGaramond-Medium.ttf',
      weight: '500',
      style: 'normal'
    },
    {
      path: './fonts/CormorantGaramond-MediumItalic.ttf',
      weight: '500',
      style: 'italic'
    },
    {
      path: './fonts/CormorantGaramond-Bold.ttf',
      weight: '700',
      style: 'normal'
    },
    {
      path: './fonts/CormorantGaramond-BoldItalic.ttf',
      weight: '700',
      style: 'italic'
    },
    {
      path: './fonts/CormorantGaramond-Italic.ttf',
      weight: '400',
      style: 'italic'
    }
  ],
  variable: "--font-Cormorant-Garamond"
})



export const metadata: Metadata = {
  title: "Enunas",
  description: "Dein einzig artiger Martplatz",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${LeagueSpartan.variable} ${CormorantGaramond.variable} overflow-x-hidden w-full`}>
        <div  className="w-full max-w-full overflow-hidden">
        {children}
        </div>
      </body>
    </html>
  );
}
