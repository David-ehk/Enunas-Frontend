// ============================================================
// ENUNAS — Account Module Types & Mock Data
// ============================================================

import type { MockProduct } from '@/lib/api/mockProducts';
import { getAllProducts, buildProductHref } from '@/lib/api/mockProducts';

export type ProductColour = MockProduct['colours'][number];

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'returned' | 'cancelled';

export interface OrderItemPreview {
  productId: string;
  imgURL: string;
  productName: string;
}

export interface AccountOrder {
  id: string;
  number: string;
  placedAt: string;
  status: OrderStatus;
  totalCents: number;
  itemsPreview: OrderItemPreview[];
  trackingUrl?: string;
  // Populated when a return exists — sourced from OrderResponseDto.returnShipToAddress / returnNumber
  returnShipToAddress?: string;
  returnNumber?: string;
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

export interface Address {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  street: string;
  houseNumber: string;
  zip: string;
  city: string;
  country: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'visa' | 'mastercard' | 'paypal' | 'klarna' | 'applepay';
  label: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  email?: string;
  isDefault: boolean;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
}

export interface NewsletterCategory {
  id: string;
  label: string;
  description: string;
  active: boolean;
}

export interface NewsletterPrefs {
  subscribed: boolean;
  categories: NewsletterCategory[];
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

// ── Mock generators (replace with real API calls) ─────────────

const sampleProducts = getAllProducts().slice(0, 3);

export function getMockAccountSummary(): AccountSummary {
  return {
    firstName: 'Alex',
    stats: { ordersCount: 12, wishlistCount: 4, bonusCents: 32000 },
    lastOrder: getMockOrders()[0],
  };
}

export function getMockOrders(): AccountOrder[] {
  const products = getAllProducts();
  return [
    {
      id: 'order-1',
      number: 'ENU-2026-04812',
      placedAt: '2026-05-09',
      status: 'shipped',
      totalCents: 357000,
      trackingUrl: '/sendungsverfolgung?o=ENU-2026-04812',
      itemsPreview: products.slice(0, 3).map((p) => ({ productId: p.id, imgURL: p.imgURL, productName: p.productName })),
    },
    {
      id: 'order-2',
      number: 'ENU-2026-03991',
      placedAt: '2026-04-22',
      status: 'delivered',
      totalCents: 189000,
      itemsPreview: products.slice(1, 3).map((p) => ({ productId: p.id, imgURL: p.imgURL, productName: p.productName })),
    },
    {
      id: 'order-3',
      number: 'ENU-2026-03240',
      placedAt: '2026-03-15',
      status: 'delivered',
      totalCents: 520000,
      itemsPreview: products.slice(0, 2).map((p) => ({ productId: p.id, imgURL: p.imgURL, productName: p.productName })),
    },
    {
      id: 'order-4',
      number: 'ENU-2026-02887',
      placedAt: '2026-02-28',
      status: 'returned',
      totalCents: 145000,
      itemsPreview: products.slice(2, 4).map((p) => ({ productId: p.id, imgURL: p.imgURL, productName: p.productName })),
    },
    {
      id: 'order-5',
      number: 'ENU-2025-09120',
      placedAt: '2025-12-03',
      status: 'delivered',
      totalCents: 98000,
      itemsPreview: sampleProducts.slice(0, 2).map((p) => ({ productId: p.id, imgURL: p.imgURL, productName: p.productName })),
    },
  ];
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

export function getMockAddresses(): Address[] {
  return [
    {
      id: 'addr-1',
      label: 'Zuhause',
      firstName: 'Alex',
      lastName: 'Müller',
      street: 'Kastanienallee',
      houseNumber: '42',
      zip: '10435',
      city: 'Berlin',
      country: 'Deutschland',
      isDefault: true,
    },
    {
      id: 'addr-2',
      label: 'Büro',
      firstName: 'Alex',
      lastName: 'Müller',
      street: 'Friedrichstraße',
      houseNumber: '100',
      zip: '10117',
      city: 'Berlin',
      country: 'Deutschland',
      isDefault: false,
    },
  ];
}

export function getMockPaymentMethods(): PaymentMethod[] {
  return [
    { id: 'pay-1', type: 'visa', label: 'Visa', last4: '4242', expiryMonth: 9, expiryYear: 2027, isDefault: true },
    { id: 'pay-2', type: 'paypal', label: 'PayPal', email: 'alex@example.com', isDefault: false },
  ];
}

export function getMockProfile(): UserProfile {
  return {
    firstName: 'Alex',
    lastName: 'Müller',
    email: 'alex@example.com',
    phone: '+49 170 1234567',
    dateOfBirth: '1992-08-14',
  };
}

export function getMockNewsletterPrefs(): NewsletterPrefs {
  return {
    subscribed: true,
    categories: [
      { id: 'new', label: 'Neuankömmlinge', description: 'Neue Kollektionen und frische Drops zuerst', active: true },
      { id: 'sale', label: 'Sale & Angebote', description: 'Exklusive Rabatte und Flash-Sales', active: false },
      { id: 'drops', label: 'Limitierte Drops', description: 'Exklusive Releases und Kooperationen', active: true },
      { id: 'editorial', label: 'Editorial', description: 'Stories, Lookbooks und Inspirationen', active: true },
    ],
  };
}

// ── Helpers ───────────────────────────────────────────────────

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

export function formatEuro(cents: number): string {
  const euros = cents / 100;
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    currencyDisplay: 'symbol',
  }).format(euros).replace(' ', ' ');
}

export function formatDateLong(iso: string): string {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit', month: 'long', year: 'numeric',
  }).format(new Date(iso));
}
