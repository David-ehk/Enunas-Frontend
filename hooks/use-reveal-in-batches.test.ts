import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRevealInBatches } from './use-reveal-in-batches'

const list = (n: number) => Array.from({ length: n }, (_, i) => i)

// Observers that are still connected; scrollToEnd() reports their target as in view.
let observers: { callback: IntersectionObserverCallback; connected: boolean }[] = []

beforeEach(() => {
  observers = []
  vi.stubGlobal('IntersectionObserver', class {
    entry: (typeof observers)[number]
    constructor(callback: IntersectionObserverCallback) {
      this.entry = { callback, connected: false }
      observers.push(this.entry)
    }
    observe() { this.entry.connected = true }
    disconnect() { this.entry.connected = false }
  })
})
afterEach(() => vi.unstubAllGlobals())

const scrollToEnd = () => act(() => {
  for (const o of observers.filter(o => o.connected)) {
    o.callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
  }
})

const setup = (items: number[]) => {
  const hook = renderHook(({ items }) => useRevealInBatches(items, 24), { initialProps: { items } })
  act(() => hook.result.current.sentinelRef(document.createElement('div')))
  return hook
}

describe('useRevealInBatches', () => {
  it('shows one batch, then one more each time the end is reached', () => {
    const { result } = setup(list(60))
    expect(result.current.shown).toEqual(list(24))
    expect(result.current.hasMore).toBe(true)

    scrollToEnd()
    expect(result.current.shown).toEqual(list(48))

    scrollToEnd()
    expect(result.current.shown).toEqual(list(60))
    expect(result.current.hasMore).toBe(false)
  })

  it('can also be advanced by hand', () => {
    const { result } = setup(list(30))

    act(() => result.current.showMore())

    expect(result.current.shown).toEqual(list(30))
  })

  it('starts again from the first batch when the list changes (new filter or sort)', () => {
    const { result, rerender } = setup(list(60))
    scrollToEnd()

    const filtered = list(50)
    rerender({ items: filtered })

    expect(result.current.shown).toEqual(list(24))
  })

  it('has nothing more to load for a short list', () => {
    const { result } = setup(list(10))

    expect(result.current.shown).toEqual(list(10))
    expect(result.current.hasMore).toBe(false)
  })
})

describe('useRevealInBatches after the list changes', () => {
  // `top` is where the list starts relative to the screen; negative means scrolled past it.
  const changeList = (from: number[], top: number) => {
    const start = document.createElement('div')
    start.getBoundingClientRect = () => ({ top }) as DOMRect
    start.scrollIntoView = vi.fn()
    const hook = renderHook(({ items }) => useRevealInBatches(items, 24), { initialProps: { items: from } })
    hook.result.current.startRef.current = start
    hook.rerender({ items: list(50) })
    return start.scrollIntoView
  }

  it('goes back to the start of the new results when it was scrolled past', () => {
    expect(changeList(list(60), -3000)).toHaveBeenCalledTimes(1)
  })

  it('does not move the page while the start is still in view', () => {
    expect(changeList(list(60), 300)).not.toHaveBeenCalled()
  })

  it('does not move the page when the list first arrives (so Back can restore the position)', () => {
    expect(changeList([], -300)).not.toHaveBeenCalled()
  })
})
