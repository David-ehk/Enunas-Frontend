// ============================================================
// ENUNAS — Account Module Types & Mock Data
// Drop into: enunas/lib/account.ts
// ============================================================

import type { MockProduct } from '@/lib/api/mockProducts';
import { getAllProducts, buildProductHref } from '@/lib/api/mockProducts';

export type ProductColour = MockProduct['colours'][number];

/** Order status pulled from backend; mapped to UI tone in OrderStatusBadge */
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'returned' | 'cancelled';

export interface OrderItemPreview {
  productId: string;
  imgURL: string;
  productName: string;
}

export interface AccountOrder {
  id: string;
  number: string;          // e.g. "ENU-2026-04812"
  placedAt: string;        // ISO date
  status: OrderStatus;
  totalCents: number;      // store cents; format at render time
  itemsPreview: OrderItemPreview[]; // first 3 for thumbnail strip
  trackingUrl?: string;
}

export interface AccountStats {
  ordersCount: number;
  wishlistCount: number;
  bonusCents: number;
}

export interface AccountSummary {
  firstName: string;
  stats: AccountStats;
  lastOrder: AccountOrder | null;
}

// ----- mock generators (replace with real API calls) -----

const sampleProducts = getAllProducts().slice(0, 3);

export function getMockAccountSummary(): AccountSummary {
  return {
    firstName: 'Alex',
    stats: {
      ordersCount: 12,
      wishlistCount: 4,
      bonusCents: 32000,
    },
    lastOrder: {
      id: 'order-1',
      number: 'ENU-2026-04812',
      placedAt: '2026-05-09',
      status: 'shipped',
      totalCents: 357000,
      trackingUrl: '/sendungsverfolgung?o=ENU-2026-04812',
      itemsPreview: sampleProducts.map((p) => ({
        productId: p.id,
        imgURL: p.imgURL,
        productName: p.productName,
      })),
    },
  };
}

export interface WishlistEntry {
  id: string;
  imgURL: string;
  brandName: string;
  productName: string;
  price: string;
  href: string;
  colours: ProductColour[];
  createdAt: Date | string;
  sizes?: string[];
  catalogue?: string[];
}

export function getMockWishlist(): WishlistEntry[] {
  return getAllProducts().slice(0, 4).map((p) => ({
    id: p.id,
    imgURL: p.imgURL,
    brandName: p.brandName,
    productName: p.productName,
    price: p.price,
    href: buildProductHref(p),
    colours: p.colours,
    createdAt: p.createdAt,
    sizes: p.sizes,
    catalogue: p.catalogue,
  }));
}

// ----- helpers -----

const STATUS_COPY: Record<OrderStatus, { label: string; toneClass: string }> = {
  pending:   { label: 'Ausstehend',   toneClass: 'text-enunas-warning' },
  paid:      { label: 'Bezahlt',      toneClass: 'text-enunas-success' },
  shipped:   { label: 'Versandt',     toneClass: 'text-enunas-success' },
  delivered: { label: 'Zugestellt',   toneClass: 'text-enunas-success' },
  returned:  { label: 'Retour',       toneClass: 'text-enunas-gray-medium' },
  cancelled: { label: 'Storniert',    toneClass: 'text-enunas-error' },
};

export function getStatusCopy(status: OrderStatus) {
  return STATUS_COPY[status];
}

/** Format cents as German EUR string, e.g. "€ 3.570,00" */
export function formatEuro(cents: number): string {
  const euros = cents / 100;
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    currencyDisplay: 'symbol',
  }).format(euros).replace(' ', ' ');
}

/** Format ISO date as "09. Mai 2026" */
export function formatDateLong(iso: string): string {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit', month: 'long', year: 'numeric',
  }).format(new Date(iso));
}
