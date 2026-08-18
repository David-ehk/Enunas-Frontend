import type { Metadata } from 'next'
import ComingSoonNewsletter from './components/ComingSoonNewsletter'

export const metadata: Metadata = {
  title: 'Drops — Coming Soon — Enunas',
  description: 'Limited-edition collaborative releases are coming soon. Sign up to be notified when the first drop goes live.',
}

export default function page() {
  return <ComingSoonNewsletter />
}
