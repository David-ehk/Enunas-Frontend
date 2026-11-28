import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ImageGallery from './ImageGallery'

beforeAll(() => {
  vi.stubGlobal('IntersectionObserver', class { observe() {} disconnect() {} })
  // Missing in jsdom; the gallery's desktop cursor asks it.
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }))
})

const close = () => screen.queryByRole('button', { name: 'Zurück zu den Produktfotos' })

describe('ImageGallery back-to-photos button', () => {
  it('is not there while the page rests on the photos', () => {
    render(<ImageGallery images={['/a.jpg']} productName="Jacke" />)
    expect(close()).toBeNull()
  })

  it('is offered on a product without photos too', () => {
    const onBackToPhotos = vi.fn()
    render(<ImageGallery images={[]} productName="Jacke" onBackToPhotos={onBackToPhotos} />)

    fireEvent.click(close()!)
    expect(onBackToPhotos).toHaveBeenCalledTimes(1)
  })

  it('is offered once the page has swiped up, and asks to go back', () => {
    const onBackToPhotos = vi.fn()
    render(<ImageGallery images={['/a.jpg']} productName="Jacke" onBackToPhotos={onBackToPhotos} />)

    fireEvent.click(close()!)
    expect(onBackToPhotos).toHaveBeenCalledTimes(1)
  })
})
