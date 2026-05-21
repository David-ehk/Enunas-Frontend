import CatalogueLandingPage from '../components/CatalogueLandingPage'
import type { Metadata } from 'next'

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
        tagline: 'Grenzen werden neu gedacht.',
        color: '#6C169C',
      }}
    />
  )
}
