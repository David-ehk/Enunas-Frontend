export type UserRole = 'CUSTOMER' | 'BRAND_PARTNER' | 'ADMIN';
export type BrandStatus = 'PENDING' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'VERIFIED' | 'SUSPENDED';
// The backend returns ACTIVE for a live product — APPROVED is a lifecycle event
// (POST /admin/products/{id}/approve), not a resting state. Both are accepted
// here; use isProductLive() rather than comparing to a single literal.
export type ProductStatus = 'PENDING' | 'ACTIVE' | 'APPROVED' | 'REJECTED' | 'HIDDEN';

// Exact backend OrderStatus enum values — PROCESSING does not exist in the backend.
export type OrderStatus =
  | 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED'
  | 'SHIPPING_PROBLEM' | 'AWAITING_ADMIN' | 'MANUAL_REVIEW'
  | 'RETURN_REQUESTED' | 'RETURN_APPROVED' | 'RETURN_RECEIVED'
  | 'REFUNDED' | 'CANCELLED';

// Exact backend ReturnReason enum values.
export type ReturnReason =
  | 'WRONG_SIZE' | 'WRONG_COLOR' | 'DAMAGED' | 'DEFECTIVE'
  | 'NOT_AS_DESCRIBED' | 'NO_LONGER_WANTED' | 'OTHER';

// ── Returns ──────────────────────────────────────────────────────────────────
// A return belongs to a BRAND, not to an order. One order can carry several
// returns — one per brand whose items are going back — each with its own
// lifecycle, ship-to snapshot, approval and refund. There is no such thing as
// "the order's return".
//
// Verified against backend source (controllers, DTOs, enums, migration V17).
export type ReturnStatus = 'REQUESTED' | 'APPROVED' | 'RECEIVED' | 'REFUNDED';

// Only PENDING and UPLOADED_BY_BRAND are currently reachable.
export type ReturnLabelStatus = 'PENDING' | 'UPLOADED_BY_BRAND' | 'GENERATED' | 'FAILED';

// Mirrors backend ReturnSummaryDto exactly.
export interface ReturnSummary {
  id: string;
  returnNumber: string;
  status: ReturnStatus;
  brandId: string;
  brandName: string;
  reason?: ReturnReason | string;
  description?: string;
  // Frozen at request time. Read-only forever — it must keep showing the address
  // that was current then, even after the brand edits its warehouse.
  shipToAddress: string;
  // Item IDs referencing OrderResponseDto.items — NOT embedded line items.
  // Resolve against the parent order; see resolveReturnItems().
  orderItemIds: string[];
  refundAmount?: number;
  requestedAt?: string;
  approvedAt?: string;
  receivedAt?: string;
  refundedAt?: string;
  labelStatus?: ReturnLabelStatus;
  labelCarrier?: string;
  labelTrackingNumber?: string;
  labelUrl?: string;
}

// A ReturnSummary joined to its parent order's context. Components consume this
// so they never reach back into the order to work out what a return contains.
export interface ReturnWithOrder extends ReturnSummary {
  orderId: string;
  orderNumber?: string;
  buyerEmail?: string;
  currency: string;
  // Resolved from orderItemIds against the parent order's items.
  items: ApiOrderItem[];
}

// Spring Page<T> wrapper shape.
export interface ApiPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ApiUser {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

// Mirrors backend CustomerResponseDto.
export interface ApiCustomer {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
  profileImageUrl?: string;
  country?: string;
  city?: string;
  preferredSizeTop?: string;
  preferredSizeBottom?: string;
  preferredSizeShoes?: string;
  heightCm?: number;
  weightKg?: number;
  preferredStyles?: string[];
  favoriteBrands?: string[];
  favoriteCategories?: string[];
  totalOrders?: number;
  totalSpent?: number;
  createdAt?: string;
}

// Mirrors backend UserAddressResponseDto. No `phone` — the address book does not carry one;
// only the ad-hoc ShippingAddressDto embedded in an order does. See lib/api/modules/orderApi.ts.
export interface ApiUserAddress {
  id: number;
  firstName: string;
  lastName: string;
  street: string;
  houseNumber: string;
  addressLine2?: string;
  postalCode: string;
  city: string;
  country: string;
  // Wire key is literally "isDefault" — backend pins this via an explicit @JsonProperty
  // to avoid Jackson double-serializing a boolean field named "isDefault"/"defaultAddress".
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// One real backend ProductVariantResponseDto row. `colours`/`sizes` on ApiProduct are flattened
// views for filters and swatches; this keeps the per-variant facts those views drop — above all
// stockQuantity, without which the storefront cannot tell a sold-out size from an available one.
export interface ApiProductVariant {
  id: number;
  sku: string;
  color: string;
  colorFamily?: string;
  size: string;
  stockQuantity: number;
  weightGrams?: number;
}

// One "Vervollständige den Look" reference. The backend used to 500 when a referenced product
// had no sellable listing; it now returns the card with `price: null`. Null means "not currently
// buyable" — render the card without a price and without any add-to-cart affordance, never as
// €0 or €null.
export interface ApiCompleteTheLookItem {
  id: string;
  name: string;
  brandName?: string;
  slug?: string;
  price: number | null;
  images: string[];
}

export interface ApiProduct {
  id: string;
  name: string;
  brandName: string;
  sku: string;
  slug: string;
  description?: string;
  price: number;
  // The backend sets ProductResponseDto.price to null when the product has no active listing,
  // so this is the storefront's "can it be sold" signal — and unlike /products/{id}/listings it
  // needs no auth token, so it works for anonymous visitors too. When false, `price` is a
  // meaningless 0 placeholder and must never be rendered.
  available: boolean;
  currency?: string;
  category: string;
  subcategory?: string;
  gender?: string;
  images: string[];
  colours: { id?: string; hex: string; name: string; colorFamily?: string }[];
  sizes: string[];
  /** Real backend variants, carrying per-variant stock. Absent only for mock/pre-connect data. */
  variants?: ApiProductVariant[];
  /** Brand-configured return window in days. Backend default is 14 — never assume 30. */
  returnPeriodDays?: number;
  catalogue?: string[];
  status: ProductStatus;
  createdAt: string;
  details?: { material?: string; care?: string; origin?: string };
  /** Absent when the brand has not curated a look for this product. */
  completeTheLookProducts?: ApiCompleteTheLookItem[];
}

// Mirrors backend OrderItemResponseDto.
// All fields are optional — the backend returns priceAtPurchase/productName/listingId, not
// price/name/productId. Legacy admin views that read price/name will see undefined at runtime.
export interface ApiOrderItem {
  id: string;
  quantity: number;
  // Backend fields from OrderItemResponseDto
  listingId?: number;
  productName?: string;
  variantSku?: string;
  variantColor?: string;
  variantSize?: string;
  priceAtPurchase?: number;
  discountPriceAtPurchase?: number;
  lineTotal?: number;
  // Legacy fields — not returned by the backend; present only in pre-connect mock data.
  productId?: string;
  name?: string;
  price?: number;
  size?: string;
  color?: string;
}

// Why a shipping line has the amount it has: the brand has no config and the platform fallback
// applied (GLOBAL_DEFAULT), the brand's own positive flat rate applied (BRAND_FLAT_RATE), or the
// brand explicitly configured €0.00 (BRAND_FREE_SHIPPING).
export type ShippingCalculationMethod = 'GLOBAL_DEFAULT' | 'BRAND_FLAT_RATE' | 'BRAND_FREE_SHIPPING';

// One brand's shipping line — a cart/order spanning multiple brands gets one of these per
// brand, charged independently; never merged into a single flat fee. On an order this is
// frozen at checkout: even if the brand's rate changes later, the order keeps showing what
// was actually charged.
export interface ShippingSnapshot {
  brandId: number | string;
  brandName: string;
  amount: number;
  currency: string;
  calculationMethod: ShippingCalculationMethod;
}

// One brand's fulfilment state on an order. A multi-brand order gets one row per brand, each
// shipping independently.
export type OrderShipmentStatus = 'AWAITING_SHIPMENT' | 'SHIPPED' | 'PROBLEM';

// carrier/trackingNumber are null when an admin marked the whole order shipped rather than the
// brand confirming its own dispatch. shippedAt is guaranteed non-null whenever status is
// SHIPPED — a database constraint (migration V29) enforces it, so never guard that pairing.
export interface ApiOrderShipment {
  brandId: number | string;
  brandName: string;
  status: OrderShipmentStatus | string;
  shippedAt?: string;
  carrier?: string | null;
  trackingNumber?: string | null;
}

// Mirrors backend OrderResponseDto.
// `total` is the canonical backend field. `totalAmount` is not returned by the backend;
// treat it as always undefined when reading real API responses.
export interface ApiOrder {
  id: string;
  userId?: string;
  status: OrderStatus | string;
  currency: string;
  items: ApiOrderItem[];
  shippingAddress?: {
    fullName?: string;
    firstName?: string;
    lastName?: string;
    street?: string;
    street2?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    state?: string;
    phone?: string;
  };
  trackingNumber?: string;
  createdAt: string;
  updatedAt?: string;
  // Backend canonical fields
  orderNumber?: string;
  buyerId?: string;
  buyerEmail?: string;
  total?: number;
  subtotal?: number;
  shippingTotal?: number;
  // Frozen at checkout, one entry per brand in the order. Empty/undefined means "no data" —
  // orders placed before the shipping feature shipped (no backfill) — never treat that as
  // "free shipping".
  shippingSnapshots?: ShippingSnapshot[];
  // One row per brand on the order. Absent on orders that predate per-brand fulfilment.
  shipments?: ApiOrderShipment[];
  discountCode?: string;
  discountAmount?: number;
  discountPercent?: number;
  notes?: string;
  checkoutUrl?: string;
  // Canonical returns model: one entry per brand returning items on this order.
  // Source of truth for ALL return UI.
  returns?: ReturnSummary[];
  /** @deprecated Backwards-compatibility scalars, populated by the backend only
   *  when returns.length === 1. Never read these — use `returns[]`. */
  returnNumber?: string;
  /** @deprecated use `returns[].reason` */
  returnReason?: string;
  /** @deprecated use `returns[].description` */
  returnDescription?: string;
  /** @deprecated use `returns[].requestedAt` */
  returnRequestedAt?: string;
  /** @deprecated use `returns[].shipToAddress` — the frozen per-brand snapshot */
  returnShipToAddress?: string;
  // Legacy field — not returned by backend. Admin/vendor views using this see undefined.
  totalAmount?: number;
}

export interface ApiWardrobeItem {
  id: string;
  userId: string;
  product: ApiProduct;
  addedAt: string;
}

export interface ApiBrandPartner {
  id: string;
  userId: string;
  brandName: string;
  email: string;
  status: BrandStatus;
  isDomestic: boolean;
  createdAt: string;
  legalName?: string;
  addressStreet?: string;
  addressPostalCode?: string;
  addressCity?: string;
  addressCountry?: string;
  vatId?: string;
  taxNumber?: string;
  updatedAt?: string;
  // Public-facing brand profile — shown wherever the storefront surfaces the
  // brand (marken pages, brand hero). Editable via PATCH /brandpartner/me.
  description?: string;
  logoUrl?: string;
  heroImageUrl?: string;
  websiteUrl?: string;
  instagramHandle?: string;
  tiktokHandle?: string;
  contactEmail?: string;
  // Return (warehouse) address — deliberately separate from the legal/company
  // address above. When these are blank the platform falls back to the
  // registered business address. UNVERIFIED field names.
  returnRecipient?: string;
  returnAddressStreet?: string;
  returnAddressPostalCode?: string;
  returnAddressCity?: string;
  returnAddressCountry?: string;
  returnInstructions?: string;
}

export interface BrandOrder {
  id: string;
  createdAt: string;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | string;
}

// Mirrors backend BrandPartnerResponseDto (email comes as userEmail/contactEmail).
// iban/bankAccountHolder are NOT echoed by the backend — kept optional for local display
// after the admin saves a payout profile.
export interface AdminBrand {
  id: string;
  brandName: string;
  email?: string;
  userEmail?: string;
  contactEmail?: string;
  status: BrandStatus;
  productsCount?: number;
  revenue?: number;
  createdAt?: string;
  iban?: string;
  bankAccountHolder?: string;
  legalName?: string;
  addressStreet?: string;
  addressPostalCode?: string;
  addressCity?: string;
  addressCountry?: string;
  vatId?: string;
  taxNumber?: string;
  domestic?: boolean;
  updatedAt?: string;
  // Shipping profile (PATCH /admin/brands/{id}/shipping-profile). Not returned by GET
  // /admin/brands today (BrandPartnerResponseDto doesn't carry these fields) — these are
  // populated client-side only, right after a successful save. null shippingCost means
  // "not configured" (falls back to the platform default); 0 means explicit free shipping;
  // a positive number is the brand's flat rate. Three distinct states — never collapse them.
  shippingCost?: number | null;
  originCountry?: string;
  avgShippingDays?: number;
}

export interface AdminCustomer {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  country?: string;
  createdAt?: string;
  status?: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED' | string;
}

// Mirrors backend PayoutResponseDto.
export interface AdminPayout {
  id: string;
  brandPartnerId?: number;
  // Which ledger stream this transfer covers — REVENUE (product/commission-side net) or
  // SHIPPING (shipping money collected on the brand's behalf). Every payout-generation cycle
  // can produce up to one of each per brand, as two separate bank transfers.
  type: 'REVENUE' | 'SHIPPING' | string;
  amount: number;
  debtAbsorbed?: number;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED' | string;
  iban?: string;
  bankAccountHolder?: string;
  currency: string;
  createdAt: string;
  approvedAt?: string;
  paidAt?: string;
  externalReference?: string;
}

// Mirrors backend PayoutDashboardDto.
export interface PayoutDashboard {
  pendingCount?: number;
  pendingTotal?: number;
  approvedCount?: number;
  approvedTotal?: number;
  paidCount?: number;
  paidTotal?: number;
  negativeBrands?: { brandPartnerId: number; outstandingDebt: number; payoutBalance: number }[];
}

export interface AdminApiVariant {
  id: string;
  color?: string;
  size?: string;
  sku?: string;
  stockQuantity?: number;
  weightGrams?: number;
}

// `variants` is omitted from the base and redeclared below: the admin/vendor views use the
// looser AdminApiVariant shape (string ids, all fields optional), which is not assignable to the
// storefront's stricter ApiProductVariant.
export interface AdminApiProduct extends Omit<ApiProduct, 'status' | 'variants'> {
  status: string;
  brandId?: string;
  gender?: string;
  material?: string;
  careInstructions?: string;
  collectionName?: string;
  originCountry?: string;
  inspirationStory?: string;
  catalogueCategory?: string | string[];
  creatorEmail?: string;
  creatorId?: string;
  releaseDate?: string;
  returnPeriodDays?: number;
  updatedAt?: string;
  variants?: AdminApiVariant[];
}

export type PriceInputMode = 'GROSS' | 'NET';

// Mirrors backend ListingResponseDto — Listings sind pro Variante;
// price/discountPrice sind die BRUTTO-Werte, *Net/*Vat liefern die Aufschlüsselung.
export interface ApiListing {
  id: string;
  productId?: string;
  productName?: string;
  variantId?: number;
  variantSku?: string;
  variantColor?: string;
  variantColorFamily?: string;
  variantSize?: string;
  variantStockQuantity?: number;
  price: number;
  discountPrice?: number;
  priceInputMode?: PriceInputMode;
  priceNet?: number;
  priceGross?: number;
  priceVat?: number;
  discountPriceNet?: number;
  discountPriceGross?: number;
  discountPriceVat?: number;
  currency?: string;
  active?: boolean;
  region?: string;
  createdAt: string;
}

// Mirrors backend ProductImageResponseDto — das URL-Feld heißt `imageUrl`.
export interface ApiProductImage {
  id: string;
  imageUrl: string;
  altText?: string;
  primary?: boolean;
  displayOrder?: number;
  createdAt?: string;
}

export type DiscountType = 'ADMIN' | 'BRAND';

export interface DiscountResponse {
  id: number;
  code: string;
  type: DiscountType;
  percent: number;
  brandId: number | null;
  brandName?: string;
  validFrom: string | null;
  validUntil: string | null;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  createdByUserId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDiscountRequest {
  code: string;
  percent: number;
  validFrom?: string | null;
  validUntil?: string | null;
  maxUses?: number | null;
  active: boolean;
}

export interface UpdateDiscountRequest {
  percent?: number;
  validFrom?: string | null;
  validUntil?: string | null;
  maxUses?: number | null;
  active?: boolean;
}
