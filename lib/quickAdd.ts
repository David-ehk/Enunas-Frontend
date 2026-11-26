// Adding a piece straight from a cart drawer row. The cart line must match what the product page
// builds, otherwise the same piece ends up on two lines.
import { colourwayCoverImage } from './colourwayImage'
import { isSizeUnavailable } from './sizeAvailability'
import { generateSlug } from './product'
import { FetchError } from './api/fetcher'
import type { ApiProduct, ApiListing } from '@/types/api'
import type { CartItem } from '@/app/context/CartContext'

type NewLine = Omit<CartItem, 'id' | 'quantity'>

export type QuickAddResult = { status: 'added' | 'login' | 'atLimit' | 'failed' }

const unique = (values: string[]) => [...new Set(values)]

export function variantColours(p: ApiProduct): string[] {
  return unique((p.variants ?? []).map(v => v.color))
}

export function sizeChoices(p: ApiProduct, colour: string): { size: string; unavailable: boolean }[] {
  const variants = p.variants ?? []
  return unique(variants.map(v => v.size)).map(size => ({
    size,
    unavailable: isSizeUnavailable(variants.find(v => v.color === colour && v.size === size), !!p.preview),
  }))
}

export function buildCartLine(
  p: ApiProduct,
  colour: string,
  size: string,
  listings: ApiListing[],
): NewLine | null {
  const listing = listings.find(l => l.variantColor === colour && l.variantSize === size)
  const variant = p.variants?.find(v => v.color === colour && v.size === size)
  if (!listing || !variant) return null

  return {
    productId: String(p.id),
    name: p.name,
    brand: p.brandName,
    price: p.price,
    currency: p.currency ?? 'EUR',
    size,
    color: {
      // The product page identifies a colour by its position, and the cart dedupes on that id.
      id: String(variantColours(p).indexOf(colour)),
      name: colour,
      hex: p.colours.find(c => c.name === colour)?.hex ?? '#999999',
    },
    image: colourwayCoverImage(p.imageObjects, variant.colorId ?? null, p.images[0] ?? ''),
    defaultListingId: String(listing.id),
    stockQuantity: variant.stockQuantity,
    productPath: `/bekleidung/${generateSlug(p.brandName)}/${p.slug}`,
  }
}

export async function quickAdd({
  product,
  colour,
  size,
  cartItems,
  getListings,
  addToCart,
}: {
  product: ApiProduct
  colour: string
  size: string
  cartItems: CartItem[]
  getListings: (productId: string) => Promise<ApiListing[]>
  addToCart: (line: NewLine) => void
}): Promise<QuickAddResult> {
  let listings: ApiListing[]
  try {
    listings = await getListings(String(product.id))
  } catch (err) {
    return { status: err instanceof FetchError && err.status === 401 ? 'login' : 'failed' }
  }

  const line = buildCartLine(product, colour, size, listings)
  if (!line) return { status: 'failed' }

  const held = cartItems.find(
    i => i.productId === line.productId && i.size === size && i.color?.id === line.color?.id,
  )
  if (held && line.stockQuantity !== undefined && held.quantity >= line.stockQuantity) {
    return { status: 'atLimit' }
  }

  addToCart(line)
  return { status: 'added' }
}
