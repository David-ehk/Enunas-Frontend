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
  createdAt: string;
}

export interface BrandOrder {
  id: string;
  createdAt: string;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | string;
}

export interface AdminBrand {
  id: string;
  brandName: string;
  email: string;
  status: BrandStatus;
  productsCount?: number;
  revenue?: number;
  createdAt?: string;
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

export interface AdminPayout {
  id: string;
  brandId?: string;
  brandName?: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED' | string;
  createdAt: string;
  paidAt?: string;
}

export interface PayoutDashboard {
  totalPaid?: number;
  totalPending?: number;
  totalCancelled?: number;
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
