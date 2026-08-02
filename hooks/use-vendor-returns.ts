'use client'

import { useState, useEffect, useCallback } from 'react'
import { returnsApi } from '@/lib/api/modules/returnsApi'
import type { ReturnWithOrder } from '@/types/api'

/**
 * Every return addressed to the signed-in brand.
 *
 * The UI binds to this hook, not to orders. When the backend gains a dedicated
 * returns endpoint only returnsApi changes — this signature and the components
 * using it stay as they are.
 */
export function useVendorReturns() {
  const [returns, setReturns] = useState<ReturnWithOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    returnsApi
      .listForBrand()
      .then(rs => {
        setReturns(rs)
        setError(null)
      })
      .catch(e => {
        setReturns([])
        setError(e instanceof Error ? e.message : 'Retouren konnten nicht geladen werden.')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  return { returns, loading, error, reload: load }
}
