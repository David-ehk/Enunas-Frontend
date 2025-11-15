import { Hero, KategorieAuswahl , Subscribe, PopularProduct } from "../Homepage/components"
import Geschlecht from "../Homepage/components/Geschlecht"
import BannerBild from "../Homepage/components/BannerBild"
import NewProducts from "../Homepage/components/NewProducts"
import LogoSlider from "../Homepage/components/LogoSlider"
import CategorySection from "../Homepage/components/CategorySection"

export default function Home() {
  return (

   <main>
      <section >
        <Hero />
      </section>
      <section className="py-5">
        <KategorieAuswahl  />
      </section>
      <section >
        <Geschlecht/>
      </section>
      <section className="sm:px-3 px-5 sm:py-6 py-3">
        <PopularProduct />
      </section>
      <section >
        <BannerBild />
      </section>
      <section className="sm:px-3 px-8 sm:py-6 py-3" >
        <NewProducts />
      </section>
       <section >
        <CategorySection />
      </section>
      <section >
        <LogoSlider />
      </section>
      <section className="sm:px-16 px-8 sm:py-6 py-3 w-full">
        <Subscribe />
      </section>
    </main>


  )
}