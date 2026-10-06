import CatalogueLandingPage from '../components/CatalogueLandingPage'
import type { Metadata } from 'next'

// Products come from a server fetch; without this the page is prerendered once at build time
// and brand products created after a deploy never appear.
export const revalidate = 60

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
