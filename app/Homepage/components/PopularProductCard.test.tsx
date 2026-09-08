import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WishlistProvider } from '@/app/context/WishlistContext'
import PopularProductCard from './PopularProductCard'

// next/navigation's useRouter has no App Router context under jsdom — stub it.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}))

// The countdown owns its own timer behaviour (covered by ComingSoonCountdown.test.tsx).
// Here we only care that the card mounts it for preview products.
vi.mock('@/components/ComingSoonCountdown', () => ({
  default: ({ releaseDate, variant }: { releaseDate: string; variant: string }) => (
    <div data-testid="countdown" data-variant={variant}>
      countdown:{releaseDate}
    </div>
  ),
}))

const baseProps = {
  id: 'p1',
  imgURL: '/img.jpg',
  brandName: 'Acme',
  productName: 'The Jacket',
  href: '/bekleidung/jacken/the-jacket',
  colours: [{ hex: '#000000', name: 'Schwarz' }],
  createdAt: new Date(), // recent → a non-preview card would show "new in"
}

const renderCard = (props: Partial<React.ComponentProps<typeof PopularProductCard>>) =>
  render(
    <WishlistProvider>
      <PopularProductCard {...baseProps} {...(props as React.ComponentProps<typeof PopularProductCard>)} />
    </WishlistProvider>,
  )

beforeEach(() => {
  localStorage.clear()
  // jsdom has no matchMedia; the card probes it for hover capability on mount.
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
})

describe('PopularProductCard — Coming Soon preview state', () => {
  it('renders the chip and release date, and suppresses price / "new in" for a preview product', () => {
    renderCard({ preview: true, releaseDate: '2026-10-01', price: '€ 99,00' })

    expect(screen.getByText('Coming Soon')).toBeInTheDocument()
    expect(screen.getByText('Kommt am 1. Oktober')).toBeInTheDocument()
    expect(screen.getByTestId('countdown')).toHaveAttribute('data-variant', 'card')

    // No price and no "new in" label on a preview card.
    expect(screen.queryByText(/€/)).not.toBeInTheDocument()
    expect(screen.queryByText('new in')).not.toBeInTheDocument()
    expect(screen.queryByText('€ 99,00')).not.toBeInTheDocument()
  })

  it('renders the price and no chip for a normal (non-preview) product', () => {
    renderCard({ price: '€ 49,90' })

    expect(screen.getByText('€ 49,90')).toBeInTheDocument()
    expect(screen.queryByText('Coming Soon')).not.toBeInTheDocument()
    expect(screen.queryByTestId('countdown')).not.toBeInTheDocument()
  })
})
