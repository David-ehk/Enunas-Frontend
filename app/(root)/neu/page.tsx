import { Suspense } from 'react'
import { Metadata } from 'next'
import NeuPageContent from './components/NeuPageContent'

export const metadata: Metadata = {
  title: "Enunas - Premium Fashion & Streetwear",
  description: "Hier findest du die neusten Top-Marken. Luxury, Streetwear und Designer-Streetwear für 18-30 jährige Ideal",
}

export default function page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <NeuPageContent />
    </Suspense>
  )
}

