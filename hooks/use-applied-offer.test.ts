import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAppliedOffer } from './use-applied-offer'
import { rememberAppliedOffer, readAppliedOffer } from '@/lib/upsellOffer'

const setup = () => {
  rememberAppliedOffer(123)
  return renderHook(() => useAppliedOffer()).result
}

describe('useAppliedOffer', () => {
  beforeEach(() => sessionStorage.clear())

  it('picks up the offer accepted on /angebot', () => {
    const result = setup()
    expect(result.current.offerId).toBe(123)
    expect(result.current.error).toBeNull()
  })

  it('drops a rejected offer for good and keeps the reason', () => {
    const result = setup()
    act(() => result.current.reject('Dieses Angebot ist abgelaufen.'))
    expect(result.current.offerId).toBeNull()
    expect(readAppliedOffer()).toBeNull()
    expect(result.current.error).toBe('Dieses Angebot ist abgelaufen.')
  })

  it('clears the reason once the customer moves on', () => {
    const result = setup()
    act(() => result.current.reject('Dieses Angebot ist abgelaufen.'))
    act(() => result.current.dismissError())
    expect(result.current.error).toBeNull()
  })

  it('removes the offer without an error', () => {
    const result = setup()
    act(() => result.current.remove())
    expect(result.current.offerId).toBeNull()
    expect(readAppliedOffer()).toBeNull()
    expect(result.current.error).toBeNull()
  })
})
