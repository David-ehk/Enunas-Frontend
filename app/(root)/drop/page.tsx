import type { Metadata } from 'next'
import DropsPageContent from './components/DropsPageContent'

export const metadata: Metadata = {
  title: 'Drops — Enunas',
  description: 'Limited-edition collaborative releases. Dark theme. Season 01.',
}

export default function page() {
  return <DropsPageContent />
}
