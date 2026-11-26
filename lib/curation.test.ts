import { describe, it, expect } from 'vitest'
import { removeCuratedId, moveCuratedId, insertCuratedId } from './curation'

// The admin editor only renders live products, but the saved list (admin GET) also carries
// hidden ones. Edits must target product ids, never the position in the rendered list, so the
// hidden ids keep their place and are never removed by accident. 'h' is a hidden id below.

describe('removeCuratedId', () => {
  it('removes only the given id and keeps hidden ids', () => {
    expect(removeCuratedId(['h', '1', '2'], '1')).toEqual(['h', '2'])
  })
})

describe('moveCuratedId', () => {
  it('moves an item down so it lands before the drop target', () => {
    expect(moveCuratedId(['1', 'h', '2', '3'], '1', '3')).toEqual(['h', '2', '1', '3'])
  })

  it('moves an item up so it lands before the drop target', () => {
    expect(moveCuratedId(['1', 'h', '2', '3'], '3', '2')).toEqual(['1', 'h', '3', '2'])
  })

  it('leaves the list unchanged when dropped on itself', () => {
    expect(moveCuratedId(['1', 'h', '2'], '2', '2')).toEqual(['1', 'h', '2'])
  })
})

describe('insertCuratedId', () => {
  it('inserts a new id before the drop target', () => {
    expect(insertCuratedId(['1', 'h', '2'], '9', '2')).toEqual(['1', 'h', '9', '2'])
  })

  it('appends when there is no drop target', () => {
    expect(insertCuratedId(['1', 'h'], '9')).toEqual(['1', 'h', '9'])
  })

  it('ignores an id that is already in the list', () => {
    expect(insertCuratedId(['1', 'h', '2'], '2', '1')).toEqual(['1', 'h', '2'])
  })
})
