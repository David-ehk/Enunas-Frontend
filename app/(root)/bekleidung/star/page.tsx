import CatalogueLandingPage from '../components/CatalogueLandingPage'
import type { Metadata } from 'next'

// Products come from a server fetch; without this the page is prerendered once at build time
// and brand products created after a deploy never appear.
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Star — Enunas',
  description: 'Für die, die im Mittelpunkt stehen. Eleganz, die spricht.',
}

export default function StarPage() {
  return (
    <CatalogueLandingPage
      config={{
        name: 'Star',
        slug: 'star',
        tagline: 'Oben ankommen. Auf deine Art.',
        color: '#0A0A0A',
      }}
    />
  )
}
