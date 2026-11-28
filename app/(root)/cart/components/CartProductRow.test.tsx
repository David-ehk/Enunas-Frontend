import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CartProductRow from './CartProductRow'
import type { ApiProduct } from '@/types/api'

const addToCart = vi.fn()
vi.mock('@/app/context/CartContext', () => ({ useCart: () => ({ cartItems: [], addToCart }) }))
vi.mock('@/lib/api', () => ({
  productApi: { getListings: async () => [{ id: 31, variantColor: 'White', variantSize: 'M' }] },
}))

// Black is listed first, but the photo shows White.
const product = {
  id: '7', name: 'Terra Tee', brandName: 'Acme', slug: 'terra-tee', price: 44, available: true,
  preview: false, images: ['/white.jpg', '/black.jpg'], colours: [],
  imageObjects: [
    { url: '/white.jpg', productColorId: 52, primary: true },
    { url: '/black.jpg', productColorId: 51, primary: true },
  ],
  variants: [
    { color: 'Black', colorId: 51, size: 'M', stockQuantity: 3 },
    { color: 'White', colorId: 52, size: 'M', stockQuantity: 3 },
    { color: 'White', colorId: 52, size: 'L', stockQuantity: 0 },
  ],
} as unknown as ApiProduct

const row = () => render(
  <CartProductRow image="/white.jpg" brand="Acme" name="Terra Tee" price="44,00 €"
    href="/bekleidung/acme/terra-tee" product={product} onNavigate={() => {}} upsell />,
)

beforeEach(() => addToCart.mockClear())

describe('upsell row', () => {
  it('offers only sizes, straight away', () => {
    row()
    expect(screen.getAllByRole('button').map(b => b.textContent)).toEqual(['M', 'L'])
  })

  it('adds the tapped size in the colour of the photo', async () => {
    row()
    fireEvent.click(screen.getByRole('button', { name: 'M' }))

    await waitFor(() => expect(addToCart).toHaveBeenCalledTimes(1))
    expect(addToCart).toHaveBeenCalledWith(expect.objectContaining({
      size: 'M', color: expect.objectContaining({ name: 'White' }), defaultListingId: '31',
    }))
  })

  it('lists the sizes smallest first, whatever order the backend sends', () => {
    const mixed = {
      ...product,
      variants: ['L', 'M', 'S'].map(size => ({ color: 'White', colorId: 52, size, stockQuantity: 3 })),
    } as unknown as ApiProduct
    render(
      <CartProductRow image="/white.jpg" brand="Acme" name="Terra Tee" price="44,00 €"
        href="/bekleidung/acme/terra-tee" product={mixed} onNavigate={() => {}} upsell />,
    )
    expect(screen.getAllByRole('button').map(b => b.textContent)).toEqual(['S', 'M', 'L'])
  })

  it('names the colour of the photo as already picked, without offering a choice', () => {
    row()
    expect(screen.getByLabelText('Ausgewählte Farbe: White')).toHaveTextContent('White')
    expect(screen.queryByRole('button', { name: /white|black/i })).not.toBeInTheDocument()
  })

  it('does not let a sold-out size be tapped', () => {
    row()
    expect(screen.getByRole('button', { name: 'L' })).toBeDisabled()
  })

  it('links to the product page in that colour, where it can be changed', () => {
    row()
    expect(screen.getByRole('link', { name: 'Terra Tee' }))
      .toHaveAttribute('href', '/bekleidung/acme/terra-tee?color=White')
  })
})
