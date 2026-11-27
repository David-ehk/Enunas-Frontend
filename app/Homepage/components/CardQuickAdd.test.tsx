import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CardQuickAdd from './CardQuickAdd'
import type { ApiProduct } from '@/types/api'

const addToCart = vi.fn()
vi.mock('@/app/context/CartContext', () => ({ useCart: () => ({ cartItems: [], addToCart }) }))
vi.mock('@/lib/api', () => ({
  productApi: {
    getListings: async () => [
      { id: 11, variantColor: 'Black', variantSize: 'M' },
      { id: 12, variantColor: 'Black', variantSize: 'L' },
    ],
  },
}))

const product = {
  id: '7', name: 'Track Jacket', brandName: 'Acme', slug: 'track-jacket', price: 89, available: true,
  preview: false, images: [], colours: [], catalogue: [], sizes: [],
  variants: [
    { color: 'Black', size: 'M', stockQuantity: 2 },
    { color: 'Black', size: 'L', stockQuantity: 1 },
    { color: 'Black', size: 'XL', stockQuantity: 0 },
  ],
} as unknown as ApiProduct

function openSheet() {
  render(<CardQuickAdd product={product} href="/bekleidung/acme/track-jacket" />)
  fireEvent.click(screen.getByRole('button', { name: 'Track Jacket schnell hinzufügen' }))
}

beforeEach(() => addToCart.mockClear())

describe('CardQuickAdd sheet', () => {
  // M, L, XL (sold out): the wheel opens on the middle one.
  it('opens with the middle size picked and the add button ready, adding nothing yet', async () => {
    openSheet()

    expect(screen.getByRole('button', { name: 'L' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'In den Warenkorb' })).toBeEnabled()
    await new Promise(r => setTimeout(r, 0))
    expect(addToCart).not.toHaveBeenCalled()
  })

  it('adds the size rolled to the middle, and closes', async () => {
    openSheet()
    fireEvent.click(screen.getByRole('button', { name: 'M' }))
    fireEvent.click(screen.getByRole('button', { name: 'In den Warenkorb' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(addToCart).toHaveBeenCalledTimes(1)
    expect(addToCart).toHaveBeenCalledWith(expect.objectContaining({ size: 'M', defaultListingId: '11' }))
  })

  it('does not let a sold-out size be bought when the wheel rolls onto it', () => {
    openSheet()
    expect(screen.getByRole('button', { name: 'XL, ausverkauft' })).toBeDisabled()

    const wheel = screen.getByRole('group', { name: 'Größe für Track Jacket' })
    // The first touch takes over from the opening roll; XL is the third row of 48px.
    fireEvent.pointerDown(wheel)
    Object.defineProperty(wheel, 'scrollTop', { configurable: true, value: 2 * 48 })
    fireEvent.scroll(wheel)

    expect(screen.getByRole('button', { name: 'Ausverkauft' })).toBeDisabled()
  })
})
