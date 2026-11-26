'use client'

import { useCallback, useEffect, useState } from 'react'
import { readAppliedOffer, forgetAppliedOffer } from '@/lib/upsellOffer'

/** The checkout's side of the offer accepted on /angebot. The backend validates it on every preview. */
export function useAppliedOffer() {
  const [offerId, setOfferId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Hydrate from sessionStorage after mount (external state -> React).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOfferId(readAppliedOffer())
  }, [])

  const remove = useCallback(() => {
    const stored = readAppliedOffer()
    if (stored != null) forgetAppliedOffer(stored)
    setOfferId(null)
    setError(null)
  }, [])

  /** The backend refused the offer: stop sending it and say why. */
  const reject = useCallback((message: string) => {
    remove()
    setError(message)
  }, [remove])

  const dismissError = useCallback(() => setError(null), [])

  return { offerId, error, remove, reject, dismissError }
}
