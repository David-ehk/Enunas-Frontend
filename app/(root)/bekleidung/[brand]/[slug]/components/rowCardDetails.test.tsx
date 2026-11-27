import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WishlistProvider } from '@/app/context/WishlistContext'
import RecRow from './RecRow'
import CompleteTheLook from './CompleteTheLook'
import type { RecItem } from './ProductCard'
import type { ApiProduct } from '@/types/api'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}))
vi.mock('@/app/context/AuthContext', () => ({ useAuth: () => ({ isAuthenticated: false }) }))
vi.mock('@/app/context/CartContext', () => ({ useCart: () => ({ cartItems: [], addToCart: vi.fn() }) }))

const product = (variants: { color: string; size: string; stockQuantity: number }[]) => ({
  id: '7', name: 'Track Jacket', brandName: 'Acme', slug: 'track-jacket', price: 89, available: true,
  preview: false, images: [], colours: [], catalogue: ['streetwear', 'star'], sizes: [], variants,
  createdAt: '2020-01-01',
}) as unknown as ApiProduct

const item = (p: ApiProduct): RecItem => ({
  brand: p.brandName, name: p.name, price: '89,00 €', colors: [], href: '/bekleidung/acme/track-jacket', product: p,
})

const inStock = product([
  { color: 'Black', size: 'M', stockQuantity: 2 },
  { color: 'Black', size: 'L', stockQuantity: 1 },
  { color: 'Black', size: 'XL', stockQuantity: 0 },
])

beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} })
})

// Hovering a card swaps name and price for the sizes in stock and the catalogue tags, so every
// product row has to hand its cards those details.
describe.each([
  ['RecRow', (items: RecItem[]) => <RecRow title="Mehr von" items={items} />],
  ['CompleteTheLook', (items: RecItem[]) => <CompleteTheLook items={items} />],
])('%s cards', (_name, row) => {
  it('have the catalogue tags and in-stock sizes for the hover state', () => {
    render(<WishlistProvider>{row([item(inStock)])}</WishlistProvider>)
    expect(screen.getByText('Streetwear')).toBeInTheDocument()
    expect(screen.getByText('Star')).toBeInTheDocument()
    expect(screen.getByText('M, L')).toBeInTheDocument()
  })

  it('are tagged "Ausverkauft" when no size is left', () => {
    render(<WishlistProvider>{row([item(product([{ color: 'Black', size: 'M', stockQuantity: 0 }]))])}</WishlistProvider>)
    expect(screen.getByText('Ausverkauft')).toBeInTheDocument()
  })
})
