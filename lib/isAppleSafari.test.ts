import { describe, it, expect } from 'vitest'
import { isAppleSafari } from './isAppleSafari'

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko)'

describe('isAppleSafari', () => {
  it('recognises Safari on iPhone and Mac', () => {
    expect(isAppleSafari(`${IPHONE} Version/18.5 Mobile/15E148 Safari/604.1`)).toBe(true)
    expect(isAppleSafari('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15')).toBe(true)
  })

  it.each([
    ['Chrome on iPhone', `${IPHONE} CriOS/140.0.7339.101 Mobile/15E148 Safari/604.1`],
    ['the Google app on iPhone', `${IPHONE} GSA/380.0.788317806 Mobile/15E148 Safari/604.1`],
    ['Firefox on iPhone', `${IPHONE} FxiOS/142.0 Mobile/15E148 Safari/605.1.15`],
    ['Edge on iPhone', `${IPHONE} Version/18.0 EdgiOS/140.0 Mobile/15E148 Safari/604.1`],
    ['an in-app browser on iPhone', `${IPHONE} Mobile/15E148 Instagram 390.0`],
    ['Chrome on Android', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36'],
    ['Samsung Internet', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/28.0 Chrome/130.0.0.0 Mobile Safari/537.36'],
    ['Chrome on desktop', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'],
  ])('does not count %s', (_name, userAgent) => {
    expect(isAppleSafari(userAgent)).toBe(false)
  })
})
