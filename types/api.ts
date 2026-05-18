// ── Auth ──────────────────────────────────────────────────────────────────────

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'CUSTOMER' | 'BRAND_PARTNER';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

// ── User / Customer ───────────────────────────────────────────────────────────

export interface ApiUser {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'BRAND_PARTNER' | 'ADMIN';
  createdAt: string;
}

export interface ApiCustomer {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: ApiAddress;
  createdAt: string;
}

export interface ApiAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

// ── Brand Partner ─────────────────────────────────────────────────────────────

export interface ApiBrandPartner {
  id: string;
  userId: string;
  brandName: string;
  status: 'PENDING' | 'VERIFIED' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  email: string;
  description?: string;
  logoUrl?: string;
  createdAt: string;
}

export interface BrandPartnerApplyRequest {
  brandName: string;
  email: string;
  description?: string;
}

// ── Products ──────────────────────────────────────────────────────────────────

export interface ApiColor {
  id: string;
  name: string;
  hex: string;
}

export interface ApiProduct {
  id: string;
  name: string;
  description: string;
  sku: string;
  category: string;
  subcategory?: string;
  catalogue?: string[];
  brandId: string;
  brandName: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN';
  createdAt: string;
  updatedAt: string;
  // Denormalized fields — populated by backend for list/detail endpoints
  defaultListingId?: string;
  price?: number;
  currency?: string;
  stock?: number;
  imageUrl?: string;
  sizes?: string[];
  colors?: ApiColor[];
}

export interface ApiProductsResponse {
  content: ApiProduct[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ── Listings ──────────────────────────────────────────────────────────────────

export interface ApiListing {
  id: string;
  productId: string;
  price: number;
  currency: string;
  stock: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateListingRequest {
  price: number;
  currency: string;
  stock: number;
}

// ── Variants ──────────────────────────────────────────────────────────────────

export interface ApiVariant {
  id: string;
  productId: string;
  size: string;
  color?: string;
  stock: number;
  sku: string;
}

export interface CreateVariantRequest {
  size: string;
  color?: string;
  stock: number;
  sku: string;
}

// ── Media ─────────────────────────────────────────────────────────────────────

export interface ApiImage {
  id: string;
  productId: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

// ── Wardrobe ──────────────────────────────────────────────────────────────────

export interface ApiWardrobeItem {
  id: string;
  productId: string;
  product: ApiProduct;
  addedAt: string;
}

// ── Orders ────────────────────────────────────────────────────────────────────

export type ApiOrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURN_APPROVED'
  | 'RETURN_RECEIVED'
  | 'REFUNDED';

export interface ApiOrderItem {
  id: string;
  productId: string;
  productName: string;
  brandName: string;
  imageUrl: string;
  size: string;
  color?: ApiColor;
  quantity: number;
  unitPrice: number;
  currency: string;
}

export interface ApiOrderAddress {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface ApiOrder {
  id: string;
  customerId: string;
  status: ApiOrderStatus;
  items: ApiOrderItem[];
  shippingAddress: ApiOrderAddress;
  totalAmount: number;
  currency: string;
  trackingNumber?: string;
  returnReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderItemRequest {
  productId: string;
  listingId: string;
  variantId?: string;
  quantity: number;
  size: string;
  color?: { id: string; name: string; hex: string };
}

export interface CreateOrderRequest {
  items: CreateOrderItemRequest[];
  shippingAddress: ApiOrderAddress;
}

// ── Brand Orders ──────────────────────────────────────────────────────────────

export interface BrandOrder extends ApiOrder {
  brandId: string;
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export interface AdminBrand extends ApiBrandPartner {
  productCount: number;
  orderCount: number;
}

export interface AdminCustomer extends ApiCustomer {
  user: ApiUser;
  orderCount: number;
}

export interface AdminPayout {
  id: string;
  brandId: string;
  brandName: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED';
  createdAt: string;
}

export interface PayoutDashboard {
  totalPending: number;
  totalApproved: number;
  totalPaid: number;
  currency: string;
}

// ── Create/Update Product ─────────────────────────────────────────────────────

export interface CreateProductRequest {
  name: string;
  description: string;
  sku: string;
  category: string;
  subcategory?: string;
  catalogue?: string[];
}
