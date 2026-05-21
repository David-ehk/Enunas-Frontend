import CatalogueLandingPage from '../components/CatalogueLandingPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Athleisure — Enunas',
  description: 'Bewegung trifft Ästhetik. Performance ohne Kompromisse.',
}

export default function AthleisurePage() {
  return (
    <CatalogueLandingPage
      config={{
        name: 'Athleisure',
        slug: 'athleisure',
        tagline: 'Bewegung trifft Ästhetik.',
        color: '#C01B1B',
      }}
    />
  )
}
