import { Hero, KategorieAuswahl , Subscribe, PopularProduct } from "../components"
import Geschlecht from "../components/Geschlecht"
import BannerBild from "../components/BannerBild"
import NewProducts from "../components/NewProducts"
import LogoSlider from "../components/LogoSlider"
import CategorySection from "../components/CategorySection"

export default function Home() {
  return (

   <main>
      <section >
        <Hero />
      </section>
      <section >
        <KategorieAuswahl  />
      </section>
      <section >
        <Geschlecht/>
      </section>
      <section className="sm:px-3 px-5 sm:py-24 py-6">
        <PopularProduct />
      </section>
      <section >
        <BannerBild />
      </section>
      <section className="sm:px-3 px-8 sm:py-24 py-6" >
        <NewProducts />
      </section>
       <section >
        <CategorySection />
      </section>
      <section >
        <LogoSlider />
      </section>
      <section className="sm:px-16 px-8 sm:py-32 py-16 w-full">
        <Subscribe />
      </section>
    </main>


  )
}