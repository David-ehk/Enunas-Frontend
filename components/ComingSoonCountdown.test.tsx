import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import ComingSoonCountdown from './ComingSoonCountdown'

describe('ComingSoonCountdown', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('renders the static release date before the ticking display mounts', () => {
    vi.setSystemTime(new Date('2026-09-08T12:00:00Z'))
    // SSR / pre-mount pass: no effects run, so the `now == null` branch renders.
    const markup = renderToStaticMarkup(
      <ComingSoonCountdown releaseDate="2026-10-01" variant="pdp" />,
    )
    expect(markup).toMatch(/Kommt am 1\. Oktober 2026/)
  })

  it('fires onElapsed once after the target passes', () => {
    vi.setSystemTime(new Date('2026-09-30T23:59:58Z'))
    const onElapsed = vi.fn()
    render(<ComingSoonCountdown releaseDate="2026-10-01" variant="card" onElapsed={onElapsed} />)
    act(() => { vi.advanceTimersByTime(5000) })
    expect(onElapsed).toHaveBeenCalledTimes(1)
  })
})
