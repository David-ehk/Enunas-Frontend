import { describe, it, expect } from 'vitest'
import { shouldRevealInitial } from './initialReveal'

const limits = { minMs: 700, maxMs: 4000 }

describe('shouldRevealInitial', () => {
  it('keeps the curtain closed until the minimum time has passed, even if videos are ready', () => {
    expect(shouldRevealInitial({ elapsedMs: 300, videosReady: true, ...limits })).toBe(false)
  })

  it('keeps the curtain closed after the minimum time while videos are still loading', () => {
    expect(shouldRevealInitial({ elapsedMs: 1500, videosReady: false, ...limits })).toBe(false)
  })

  it('lifts once the minimum time has passed and the videos are ready', () => {
    expect(shouldRevealInitial({ elapsedMs: 700, videosReady: true, ...limits })).toBe(true)
  })

  it('lifts at the maximum time even if a video never becomes ready', () => {
    expect(shouldRevealInitial({ elapsedMs: 4000, videosReady: false, ...limits })).toBe(true)
  })
})
