import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePdpSnap } from './use-pdp-snap'

// On a phone the page rests where the breadcrumb has just gone behind the navbar.
const NAVBAR_BOTTOM = 55
const BREADCRUMB_BOTTOM_ON_PAGE = 844

function element(tag: string, bottomOnPage: () => number) {
  const el = document.createElement(tag)
  el.getBoundingClientRect = () => ({ bottom: bottomOnPage() }) as DOMRect
  document.body.appendChild(el)
  return el
}

let scrollY = 0
const scrollTo = vi.fn()

beforeEach(() => {
  scrollY = 0
  scrollTo.mockClear()
  vi.stubGlobal('scrollTo', scrollTo)
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('max-width') }))
  Object.defineProperty(window, 'scrollY', { configurable: true, get: () => scrollY })
  element('header', () => NAVBAR_BOTTOM)
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

function setup(screenHeight: number) {
  vi.stubGlobal('innerHeight', screenHeight)
  const breadcrumb = element('nav', () => BREADCRUMB_BOTTOM_ON_PAGE - scrollY)
  return renderHook(() => usePdpSnap({ current: breadcrumb }))
}

describe('usePdpSnap stop', () => {
  it.each([664, 844, 932])('stops with the breadcrumb behind the navbar on a %ipx screen', height => {
    const { result } = setup(height)
    act(() => result.current.scrollToStop())

    expect(scrollTo).toHaveBeenCalledWith({ top: 844 - 55, behavior: 'smooth' })
  })

  it('carries a slow, short swipe on to the same stop', () => {
    vi.useFakeTimers()
    setup(664)
    window.dispatchEvent(new Event('touchstart'))
    scrollY = 120
    window.dispatchEvent(Object.assign(new Event('touchend'), { touches: [] }))
    vi.advanceTimersByTime(200)

    expect(scrollTo).toHaveBeenCalledWith({ top: 789, behavior: 'smooth' })
  })
})
