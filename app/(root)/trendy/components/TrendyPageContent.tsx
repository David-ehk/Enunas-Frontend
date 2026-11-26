'use client'

import { useEffect, useState } from 'react'
import FeedPageContent from '../../bekleidung/components/FeedPageContent'
import HeroTrendy from './HeroTrendy'
import { storefrontApi } from '@/lib/api'
import { STANDARD_SORTS, trendingSort, type ProductSort } from '@/lib/productSorts'

export default function TrendyPageContent() {
  // The backend's trending list (the admin's Schaufenster picks) goes on top, the rest newest
  // first. If it fails to load, the page still renders newest first.
  const [sorts, setSorts] = useState<ProductSort[] | null>(null)

  useEffect(() => {
    let cancelled = false
    storefrontApi.getCuration()
      .then(c => c.trendy)
      .catch(() => [] as string[])
      .then(ids => {
        if (!cancelled) setSorts([trendingSort(ids), ...STANDARD_SORTS])
      })
    return () => { cancelled = true }
  }, [])

  return (
    <FeedPageContent
      basePath="/trendy"
      HeroComponent={HeroTrendy}
      previewMode="hide"
      sorts={sorts}
    />
  )
}
