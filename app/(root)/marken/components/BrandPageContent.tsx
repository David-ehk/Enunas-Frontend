'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react'
import FeedPageContent from '../../bekleidung/components/FeedPageContent'
import HeroBrand from './HeroBrand'
import { productApi } from '@/lib/api'
import { generateSlug } from '@/lib/product'

export default function BrandPageContent() {
  const params = useParams<{ brand: string }>()
  const brandSlug = params.brand

  const [brandName, setBrandName] = useState('')

  useEffect(() => {
    if (!brandSlug) return
    productApi.list({ size: 200 })
      .then(res => {
        const match = res.content.find(p => generateSlug(p.brandName) === brandSlug)
        if (match) setBrandName(match.brandName)
      })
      .catch(() => {})
  }, [brandSlug])

  const displayName = brandName || brandSlug

  const Hero = useMemo(() => {
    return function HeroForBrand({ count, loading }: { count: number; loading: boolean }) {
      return <HeroBrand brandName={displayName} count={count} loading={loading} />
    }
  }, [displayName])

  return (
    <FeedPageContent
      basePath={`/marken/${brandSlug}`}
      HeroComponent={Hero}
      brandFilter={brandSlug}
      emptyStateMessage={`Keine Artikel von ${displayName} — warte auf den nächsten Drop.`}
    />
  )
}
