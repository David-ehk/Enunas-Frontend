import { describe, it, expect, afterEach, vi } from 'vitest'
import { keepInPlace } from './keepInPlace'

// A section inside a scrolling list; `top` is where it sits on screen.
function scene() {
  const list = document.createElement('div')
  list.style.overflowY = 'auto'
  const section = document.createElement('section')
  list.appendChild(section)
  document.body.appendChild(list)
  const state = { top: 105 }
  section.getBoundingClientRect = () => ({ top: state.top }) as DOMRect
  list.scrollTop = 325
  return { list, section, state }
}

afterEach(() => { document.body.innerHTML = ''; vi.unstubAllGlobals() })

describe('keepInPlace', () => {
  it('scrolls the list so a section pushed down stays where it was', () => {
    const { list, section, state } = scene()
    const restore = keepInPlace(section)
    state.top = 266
    restore()
    expect(list.scrollTop).toBe(486)
  })

  it('does nothing when the browser already held it in place', () => {
    const { list, section } = scene()
    keepInPlace(section)()
    expect(list.scrollTop).toBe(325)
  })

  it('scrolls the page when the section is not inside a scrolling list', () => {
    const scrollBy = vi.fn()
    vi.stubGlobal('scrollBy', scrollBy)
    const { list, section, state } = scene()
    list.style.overflowY = 'visible'
    const restore = keepInPlace(section)
    state.top = 205
    restore()
    expect(scrollBy).toHaveBeenCalledWith(0, 100)
  })

  it('leaves everything alone once the section is gone', () => {
    const { list, section, state } = scene()
    const restore = keepInPlace(section)
    state.top = 0
    section.remove()
    restore()
    expect(list.scrollTop).toBe(325)
  })
})
