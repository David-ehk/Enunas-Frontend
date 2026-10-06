import { describe, it, expect } from 'vitest'
import { GENDERS } from './constants'

// Backend Gender enum is UNISEX | MEN | WOMEN (same as the PDP's `Gender` type). The wizard sent
// MALE/FEMALE, so choosing "Herren" or "Damen" made POST /products/create return 400 — found in
// the 30 Sep 2026 production E2E run.
describe('GENDERS', () => {
  it('only submits values the backend Gender enum accepts', () => {
    expect(GENDERS.map(g => g.id).sort()).toEqual(['MEN', 'UNISEX', 'WOMEN'])
  })

  it('maps Herren to MEN and Damen to WOMEN', () => {
    expect(GENDERS.find(g => g.label === 'Herren')?.id).toBe('MEN')
    expect(GENDERS.find(g => g.label === 'Damen')?.id).toBe('WOMEN')
  })
})
