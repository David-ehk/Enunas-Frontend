import CatalogueLandingPage from '../components/CatalogueLandingPage'
import type { Metadata } from 'next'

// Products come from a server fetch; without this the page is prerendered once at build time
// and brand products created after a deploy never appear.
export const revalidate = 60

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
