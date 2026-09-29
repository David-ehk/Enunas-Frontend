// Owns the productName/variantSize/variantColor-over-legacy-name/size/color fallback for an
// order item, so every consumer (admin order detail, vendor packing views, customer order
// history, returns cards) resolves it identically instead of each re-deriving it — and
// sometimes forgetting a piece, as Fulfillment.tsx's ShipModal previously did.
import type { ApiOrderItem } from '@/types/api';

export interface OrderItemDisplay {
  label: string;
  size?: string;
  color?: string;
  /** size and color joined with " · ", or undefined when the item has neither. */
  variant?: string;
  unitPrice?: number;
  lineTotal?: number;
}

export function describeOrderItem(item: ApiOrderItem): OrderItemDisplay {
  const label = item.productName ?? item.name ?? '—';
  const size = item.variantSize ?? item.size;
  const color = item.variantColor ?? item.color;
  const variant = [size, color].filter(Boolean).join(' · ') || undefined;
  const unitPrice = item.discountPriceAtPurchase ?? item.priceAtPurchase ?? item.price;
  const lineTotal = item.lineTotal ?? (unitPrice != null ? unitPrice * item.quantity : undefined);
  return { label, size, color, variant, unitPrice, lineTotal };
}
