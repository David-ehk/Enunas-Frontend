import { Hero, SuperQuality , Subscribe, PopularProduct } from "../components"
import Geschlecht from "../components/Geschlecht"
import BannerBild from "../components/BannerBild"

export default function Home() {
  return (

   <main>
      <section >
        <Hero />
      </section>
      <section >
        <SuperQuality  />
      </section>
      <section >
        <Geschlecht/>
      </section>
      <section className="sm:px-3 px-8 sm:py-24 py-12">
        <PopularProduct />
      </section>
      <section >
        <BannerBild />
      </section>
      <section className="sm:px-16 px-8 sm:py-32 py-16 w-full">
        <Subscribe />
      </section>
    </main>


  )
}