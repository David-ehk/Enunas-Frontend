export { fetcher, setOnUnauthorized, FetchError } from './fetcher';
export type { FetchOptions } from './fetcher';
export { getToken, setToken, clearToken, hasToken } from './auth';
export { authApi } from './modules/authApi';
export { customerApi } from './modules/customerApi';
export { addressApi } from './modules/addressApi';
export type { UserAddressDto } from './modules/addressApi';
export { productApi } from './modules/productApi';
export type { ProductSearchParams } from './modules/productApi';
export { listingApi } from './modules/listingApi';
export type { ListingSearchParams } from './modules/listingApi';
export { orderApi } from './modules/orderApi';
export type {
  CreateOrderDto, ShippingAddressDto, OrderPreviewResponseDto, OrderPreviewItem,
  ShippingBreakdownLine, ShippingSnapshot, ShippingCalculationMethod,
} from './modules/orderApi';
export { wardrobeApi } from './modules/wardrobeApi';
export { brandApi } from './modules/brandApi';
export { publicBrandApi } from './modules/publicBrandApi';
export type { PublicBrand } from './modules/publicBrandApi';
export { adminApi } from './modules/adminApi';
export { discountsApi } from './modules/discountsApi';
export { storefrontApi } from './modules/storefrontApi';
export type { StorefrontRecommendations } from './modules/storefrontApi';
export { settlementApi } from './modules/settlementApi';
export type { SettlementRow, SettlementDashboard } from './modules/settlementApi';
export { apiProductToProduct, apiProductToCardShape, apiProductToColourwayCards, apiProductToCoverCard } from './productAdapter';
export type { ProductCardShape } from './productAdapter';
export { resolveProductBySlug, resolveProductWithMeta } from './productResolver';
