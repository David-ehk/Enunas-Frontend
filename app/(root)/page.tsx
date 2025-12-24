import { Hero,  Subscribe, PopularProduct } from "../Homepage/components";
import Geschlecht from "../Homepage/components/Geschlecht";
import BannerBild from "../Homepage/components/BannerBild";
import NewProducts from "../Homepage/components/NewProducts";
import LogoSlider from "../Homepage/components/LogoSlider";
import CategorySection from "../Homepage/components/CategorySection";
import { Metadata } from "next";
import CatalogueAuswahl from "../Homepage/components/CatalogueAuswahl";
import Footer from "../Homepage/components/footer";
import Navbar from "../Homepage/components/navbar";


export const metadata: Metadata = {
  title: "Enunas - Premium Fashion & Streetwear Online kaufen",
  description: "Entdecke exklusive Mode von Top-Marken. Sneaker, Streetwear und Designer-Pieces für deinen individuellen Style.",
  // Keywords (weniger wichtig für SEO, aber kann helfen)
  keywords: ['fashion', 'streetwear', 'sneaker', 'designer mode', 'online shop'],
  
  // Open Graph (für Social Media Shares)
  openGraph: {
    title: "Enunas - Premium Fashion & Streetwear",
    description: "Entdecke exklusive Mode von Top-Marken",
    url: 'https://enunas.com',
    siteName: 'Enunas',
    images: [
      {
        url: 'https://enunas.com/og-image.jpg',  // Dein Vorschaubild
        width: 1200,
        height: 630,
      }
    ],
    locale: 'de_DE',
    type: 'website',
  },
  
  // Weitere wichtige Meta-Tags
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

}

export default function Home() {
  return (
    <main>
      <section>
        <Navbar/>
      </section>
      <section>
        <Hero />
      </section>
      <section className="py-5">
        <CatalogueAuswahl />
      </section>
      <section>
        <Geschlecht />
      </section>
      <section className="sm:px-3 px-5 sm:py-6 py-3">
        <PopularProduct />
      </section>
      <section>
        <BannerBild />
      </section>
      <section className="sm:px-3 px-8 sm:py-6 py-3">
        <NewProducts />
      </section>
      <section>
        <CategorySection />
      </section>
      <section>
        <LogoSlider />
      </section>
      <section className="sm:px-16 px-8 sm:py-6 py-3 w-full">
        <Subscribe />
      </section>
       <section className="bg-[#370E4D] w-full sm:px-16 px-8 sm:pt-24 pt-12 pb-8">
                <Footer />
              </section>
    </main>
  );
}



