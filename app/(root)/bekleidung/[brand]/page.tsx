'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

// Brand pages now live under /marken/[brand] — this route only exists to
// forward old /bekleidung/[brand] links (breadcrumbs, bookmarks) there.
export default function BrandRedirect() {
  const params = useParams<{ brand: string }>()
  const router = useRouter()

  useEffect(() => {
    if (params.brand) router.replace(`/marken/${params.brand}`)
  }, [params.brand, router])

  return <div className="min-h-screen bg-white" />
}
