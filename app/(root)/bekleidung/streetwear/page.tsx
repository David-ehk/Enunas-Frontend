import CatalogueLandingPage from '../components/CatalogueLandingPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Streetwear — Enunas',
  description: 'Ikonische Architektur. Mutige Schnitte. Kuratierte Streetwear von den besten Brands.',
}

export default function StreetwarePage() {
  return (
    <CatalogueLandingPage
      config={{
        name: 'Streetwear',
        slug: 'streetwear',
        tagline: 'Immer du selbst. Immer im Stil.',
        color: '#0011A5',
      }}
    />
  )
}
