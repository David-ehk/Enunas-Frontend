import { Suspense } from 'react'
import BrandPageContent from '../components/BrandPageContent'

export default function BrandPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <BrandPageContent />
    </Suspense>
  )
}
