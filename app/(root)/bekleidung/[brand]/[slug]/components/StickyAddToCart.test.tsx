import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import StickyAddToCart from './StickyAddToCart'

describe('StickyAddToCart inline', () => {
  it('can be used straight away, before any scrolling', () => {
    const onCta = vi.fn()
    render(
      <StickyAddToCart
        inline
        productName="Cargo Pant"
        formattedPrice="99,95 €"
        selectedSize={null}
        ctaLabel="Größe wählen"
        isOutOfStock={false}
        onCta={onCta}
        watchRef={{ current: null }}
      />,
    )

    // getByRole leaves out hidden elements, which the scroll-triggered bar is at this point.
    fireEvent.click(screen.getByRole('button', { name: 'Größe wählen' }))

    expect(onCta).toHaveBeenCalledTimes(1)
  })

  it('is gone once dismissed, so only one buy button is left', () => {
    render(
      <StickyAddToCart
        inline
        dismissed
        productName="Cargo Pant"
        formattedPrice="99,95 €"
        selectedSize={null}
        ctaLabel="Größe wählen"
        isOutOfStock={false}
        onCta={() => {}}
        watchRef={{ current: null }}
      />,
    )

    expect(screen.queryByRole('button', { name: 'Größe wählen' })).not.toBeInTheDocument()
  })
})
