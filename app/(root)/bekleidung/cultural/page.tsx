import CatalogueLandingPage from '../components/CatalogueLandingPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cultural — Enunas',
  description: 'Mode als Sprache der Kulturen. Inspiriert von der Welt.',
}

export default function CulturalPage() {
  return (
    <CatalogueLandingPage
      config={{
        name: 'Cultural',
        slug: 'cultural',
        tagline: 'Mode als Sprache der Kulturen.',
        color: '#EA9575',
      }}
    />
  )
}
