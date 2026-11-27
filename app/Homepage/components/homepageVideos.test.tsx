// The rules that keep the homepage videos playing while the page loads. If one of these
// fails, fix the code, not the test:
//  1. the hero is in the server HTML with everything the browser needs to autoplay without JS;
//  2. no other video downloads anything until it gets close to the screen;
//  3. every homepage video goes through BackgroundVideo, and only the hero has priority.
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, cleanup, render } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import Hero from './Hero'
import FounderQuote from './FounderQuote'
import Subscribe from './Subscribe'

function serverVideo(element: React.ReactElement): HTMLVideoElement {
  const host = document.createElement('div')
  host.innerHTML = renderToStaticMarkup(element)
  return host.querySelector('video')!
}

const BELOW_THE_FOLD = [
  ['FounderQuote', FounderQuote],
  ['Subscribe', Subscribe],
] as const

describe('hero video', () => {
  it('can autoplay from the server HTML, before any JavaScript runs', () => {
    const video = serverVideo(<Hero />)
    expect(video.getAttribute('src')).toMatch(/^https:\/\//)
    expect(video.getAttribute('preload')).toBe('auto')
    for (const attribute of ['autoplay', 'muted', 'loop', 'playsinline']) {
      expect(video.hasAttribute(attribute), attribute).toBe(true)
    }
  })
})

describe.each(BELOW_THE_FOLD)('%s video', (_name, Component) => {
  let observers: { callback: IntersectionObserverCallback; targets: Element[] }[]
  let play: ReturnType<typeof vi.fn>

  beforeEach(() => {
    observers = []
    vi.stubGlobal('IntersectionObserver', class {
      entry: (typeof observers)[number]
      constructor(callback: IntersectionObserverCallback) {
        this.entry = { callback, targets: [] }
        observers.push(this.entry)
      }
      observe(target: Element) { this.entry.targets.push(target) }
      disconnect() { this.entry.targets = [] }
    })
    vi.stubGlobal('matchMedia', () => ({
      matches: false, addEventListener: () => {}, removeEventListener: () => {},
    }))
    play = vi.fn(() => Promise.resolve())
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(play as () => Promise<void>)
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('downloads nothing from the server HTML', () => {
    const video = serverVideo(<Component />)
    expect(video.hasAttribute('src')).toBe(false)
    expect(video.getAttribute('preload')).toBe('none')
  })

  /** Delivers one batch of visibility updates to whoever is watching the video. */
  function report(video: Element, ...visible: boolean[]) {
    const entries = visible.map(isIntersecting => ({ isIntersecting, target: video }) as unknown as IntersectionObserverEntry)
    act(() => {
      for (const { callback, targets } of [...observers]) {
        if (targets.includes(video)) callback(entries, {} as IntersectionObserver)
      }
    })
  }

  it('loads and plays once it gets close to the screen', () => {
    const video = render(<Component />).container.querySelector('video')!
    expect(video.hasAttribute('src')).toBe(false)
    expect(play).not.toHaveBeenCalled()

    report(video, true)

    expect(video.getAttribute('src')).toMatch(/^https:\/\//)
    expect(video.getAttribute('preload')).toBe('auto')
    expect(play).toHaveBeenCalled()
    expect(video.muted).toBe(true)
  })

  it('still loads when a fast scroll delivers "far" and "close" in one batch', () => {
    const video = render(<Component />).container.querySelector('video')!

    report(video, false, true)

    expect(video.getAttribute('src')).toMatch(/^https:\/\//)
  })
})

describe('homepage video ownership', () => {
  const dir = join(process.cwd(), 'app/Homepage/components')
  const sources = readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter(file => file.endsWith('.tsx') && !file.endsWith('.test.tsx'))
    .map(file => ({ file, code: readFileSync(join(dir, file), 'utf8') }))

  it('has no <video> outside BackgroundVideo', () => {
    const files = sources.filter(s => /<video[\s/>]/.test(s.code)).map(s => s.file)
    expect(files).toEqual(['BackgroundVideo.tsx'])
  })

  it('gives priority to the hero only', () => {
    const files = sources.filter(s => /<BackgroundVideo\b[^>]*\spriority\b/.test(s.code)).map(s => s.file)
    expect(files).toEqual(['Hero.tsx'])
  })
})
