'use client'

import { useEffect, useState } from 'react'
import { msLeft } from '@/lib/upsellOffer'

/**
 * Milliseconds left until a deadline from offerDeadline(), i.e. on the monotonic clock.
 * Null until the first tick for that deadline.
 */
export function useOfferCountdown(deadline: number | null): number | null {
  const [tick, setTick] = useState<{ deadline: number; ms: number } | null>(null)

  useEffect(() => {
    if (deadline === null) return
    const update = () => setTick({ deadline, ms: msLeft(deadline) })
    // The first value must not wait for the interval.
    const first = setTimeout(update, 0)
    const id = setInterval(update, 500)
    return () => {
      clearTimeout(first)
      clearInterval(id)
    }
  }, [deadline])

  return tick && tick.deadline === deadline ? tick.ms : null
}
