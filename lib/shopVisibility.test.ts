import { describe, it, expect } from 'vitest'
import { shopState, listingsToSwitch, restockUpdates } from './shopVisibility'

describe('shopState', () => {
  it('is active while at least one listing is active', () => {
    expect(shopState([{ active: false }, { active: true }])).toBe('active')
  })

  it('is inactive when every listing is switched off', () => {
    expect(shopState([{ active: false }, { active: false }])).toBe('inactive')
  })

  it('treats a listing without the flag as active', () => {
    expect(shopState([{}])).toBe('active')
  })

  it('has nothing to switch without listings', () => {
    expect(shopState([])).toBe('no-listing')
  })
})

describe('listingsToSwitch', () => {
  const listings = [{ id: '1', active: true }, { id: '2', active: false }, { id: '3' }]

  it('picks only the listings that are not yet in the wanted state', () => {
    expect(listingsToSwitch(listings, false).map(l => l.id)).toEqual(['1', '3'])
    expect(listingsToSwitch(listings, true).map(l => l.id)).toEqual(['2'])
  })
})

describe('restockUpdates', () => {
  it('turns the filled-in quantities into one update per variant', () => {
    expect(restockUpdates({ a: '5', b: ' 12 ' })).toEqual([
      { id: 'a', stockQuantity: 5 },
      { id: 'b', stockQuantity: 12 },
    ])
  })

  it('skips empty, zero, negative, fractional and non-numeric input', () => {
    expect(restockUpdates({ a: '', b: '0', c: '-3', d: '2.5', e: 'x' })).toEqual([])
  })
})
