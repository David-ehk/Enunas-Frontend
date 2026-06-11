export type UserRole = 'CUSTOMER' | 'BRAND_PARTNER' | 'ADMIN';
export type BrandStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'VERIFIED' | 'SUSPENDED';
export type ProductStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type OrderStatus =
  | 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

export interface ApiUser {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface ApiCustomer {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
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

export interface ApiOrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface ApiOrder {
  id: string;
  userId: string;
  status: OrderStatus | string;
  totalAmount: number;
  currency: string;
  items: ApiOrderItem[];
  shippingAddress?: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
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

export interface ApiListing {
  id: string;
  productId?: string;
  price: number;
  discountPrice?: number;
  priceInputMode?: PriceInputMode;
  currency?: string;
  region?: string;
  createdAt: string;
}

export interface ApiProductImage {
  id: string;
  productId?: string;
  url: string;
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
