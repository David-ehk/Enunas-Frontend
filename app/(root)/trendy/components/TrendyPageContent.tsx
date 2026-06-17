'use client'

import FeedPageContent from '../../bekleidung/components/FeedPageContent'
import HeroTrendy from './HeroTrendy'

export default function TrendyPageContent() {
  return <FeedPageContent basePath="/trendy" HeroComponent={HeroTrendy} />
}
