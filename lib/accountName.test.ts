import { describe, it, expect } from 'vitest'
import { resolveAccountName } from './accountName'

describe('resolveAccountName', () => {
  it('uses the profile name when the account has one', () => {
    expect(
      resolveAccountName(
        { firstName: 'Mo', lastName: 'Konan' },
        { firstName: 'Anna', lastName: 'Schmidt' },
      ),
    ).toEqual({ firstName: 'Mo', lastName: 'Konan', source: 'profile' })
  })

  it('falls back to the order name when the profile first name is missing', () => {
    expect(
      resolveAccountName({ firstName: null, lastName: null }, { firstName: 'Anna', lastName: 'Schmidt' }),
    ).toEqual({ firstName: 'Anna', lastName: 'Schmidt', source: 'order' })
  })

  it('treats a blank or whitespace-only profile first name as missing', () => {
    expect(
      resolveAccountName({ firstName: '   ', lastName: '' }, { firstName: 'Anna', lastName: 'Schmidt' }),
    ).toEqual({ firstName: 'Anna', lastName: 'Schmidt', source: 'order' })
  })

  it('splits an order that only carries a full name at the last space', () => {
    expect(
      resolveAccountName({ firstName: null, lastName: null }, { fullName: 'Anna Maria Schmidt' }),
    ).toEqual({ firstName: 'Anna Maria', lastName: 'Schmidt', source: 'order' })
  })

  it('keeps a single-word full name as the first name', () => {
    expect(resolveAccountName({ firstName: null, lastName: null }, { fullName: 'Cher' })).toEqual({
      firstName: 'Cher',
      lastName: '',
      source: 'order',
    })
  })

  it('returns an empty name when neither the profile nor an order has one', () => {
    expect(resolveAccountName({ firstName: null, lastName: null }, undefined)).toEqual({
      firstName: '',
      lastName: '',
      source: 'none',
    })
    expect(resolveAccountName(null, { firstName: ' ', lastName: ' ' })).toEqual({
      firstName: '',
      lastName: '',
      source: 'none',
    })
  })

  it('does not mix a profile first name with an order last name', () => {
    expect(
      resolveAccountName({ firstName: 'Mo', lastName: null }, { firstName: 'Anna', lastName: 'Schmidt' }),
    ).toEqual({ firstName: 'Mo', lastName: '', source: 'profile' })
  })
})
