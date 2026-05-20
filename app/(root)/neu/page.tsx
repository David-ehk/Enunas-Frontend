import { Metadata } from 'next'
import HeroNew from './components/HeroNew'

export const metadata: Metadata = {
  title: "Enunas - Premium Fashion & Streetwear",
  description: "Hier findest du die neusten Top-Marken. Luxury, Streetwear und Designer-Streetwear für 18-30 jährige Ideal",
}

export default function page() {
  return (
    <div>
        <section>
          <HeroNew/>
        </section>

        <section>
        </section>

    </div>
  )
}

