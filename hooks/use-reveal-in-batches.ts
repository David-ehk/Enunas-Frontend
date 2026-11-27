'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * Shows a long list a batch at a time: attach `sentinelRef` after the last item, and the next
 * batch appears as that element nears the screen. A new `items` array starts over, so pass a
 * memoised one. Put `startRef` on the element where the list begins.
 */
export function useRevealInBatches<T>(items: T[], batchSize: number) {
  const [revealed, setRevealed] = useState({ items, count: batchSize })
  const count = revealed.items === items ? revealed.count : batchSize
  const hasMore = count < items.length
  const showMore = () => setRevealed({ items, count: count + batchSize })

  // Starting over makes the page much shorter. Left deep down, the browser would keep the end of
  // the list on screen and load batch after batch, so go back to where the new results begin.
  // Not on first arrival: that would undo the position restored by the Back button.
  const startRef = useRef<HTMLElement>(null)
  const previous = useRef(items)
  useLayoutEffect(() => {
    const before = previous.current
    previous.current = items
    const start = startRef.current
    if (before === items || before.length === 0 || !start) return
    if (start.getBoundingClientRect().top < 0) start.scrollIntoView({ block: 'start', behavior: 'instant' })
  }, [items])

  // State, not a ref object: the observer has to attach whenever the element appears.
  const [sentinel, sentinelRef] = useState<Element | null>(null)
  useEffect(() => {
    if (!sentinel || !hasMore) return
    // Re-created after every batch, so a sentinel that is still in view fires again.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        setRevealed({ items, count: count + batchSize })
      },
      { rootMargin: '600px 0px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [sentinel, hasMore, items, count, batchSize])

  return { shown: items.slice(0, count), hasMore, showMore, sentinelRef, startRef }
}
