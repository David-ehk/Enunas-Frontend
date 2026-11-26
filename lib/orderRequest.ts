import type { CreateOrderDto } from '@/lib/api/modules/orderApi'
import { toShippingAddressDto, type AddressSelection } from './address'

/**
 * The body for both POST /orders/preview and POST /orders. One builder, so what is previewed is
 * what gets ordered. Every item must have a listing id. An offer and a discount code are mutually
 * exclusive; the offer wins.
 */
export function buildOrderRequest(
  items: { defaultListingId?: string; quantity: number }[],
  address: AddressSelection,
  discountCode: string,
  upsellOfferId: number | null,
): CreateOrderDto {
  const code = discountCode.trim()
  return {
    items: items.map((item) => ({ listingId: Number(item.defaultListingId!), quantity: item.quantity })),
    ...(address.mode === 'saved'
      ? { savedAddressId: address.id }
      : { shippingAddress: toShippingAddressDto(address.address) }),
    ...(upsellOfferId != null ? { upsellOfferId } : code ? { discountCode: code } : {}),
  }
}
