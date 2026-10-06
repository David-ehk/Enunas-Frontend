import CatalogueLandingPage from '../components/CatalogueLandingPage'
import type { Metadata } from 'next'

// Products come from a server fetch; without this the page is prerendered once at build time
// and brand products created after a deploy never appear.
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Experimental — Enunas',
  description: 'Grenzen werden neu gedacht. Mode ohne Kompromisse.',
}

export default function ExperimentalPage() {
  return (
    <CatalogueLandingPage
      config={{
        name: 'Experimental',
        slug: 'experimental',
        tagline: 'Nicht für alle. Für dich.',
        color: '#6C169C',
      }}
    />
  )
}
