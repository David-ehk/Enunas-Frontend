'use client'

import FeedPageContent from '../../bekleidung/components/FeedPageContent'
import HeroNew from './HeroNew'

export default function NeuPageContent() {
  return <FeedPageContent basePath="/neu" HeroComponent={HeroNew} />
}
