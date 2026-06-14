export type UserRole = 'CUSTOMER' | 'BRAND_PARTNER' | 'ADMIN';
export type BrandStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'VERIFIED' | 'SUSPENDED';
export type ProductStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

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

export interface ApiProduct {
  id: string;
  name: string;
  brandName: string;
  sku: string;
  slug: string;
  description?: string;
  price: number;
  currency?: string;
  category: string;
  subcategory?: string;
  images: string[];
  colours: { id?: string; hex: string; name: string }[];
  sizes: string[];
  catalogue?: string[];
  status: ProductStatus;
  createdAt: string;
  details?: { material?: string; care?: string; origin?: string };
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
  discountCode?: string;
  discountAmount?: number;
  discountPercent?: number;
  notes?: string;
  checkoutUrl?: string;
  // Return fields — present only when a return exists for this order.
  returnNumber?: string;
  returnReason?: string;
  returnDescription?: string;
  returnRequestedAt?: string;
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

export interface AdminApiProduct extends Omit<ApiProduct, 'status'> {
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
