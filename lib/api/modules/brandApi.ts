import { fetcher } from '../fetcher'
import type { ProductStatus, ApiBrandPartner, AdminApiProduct, AdminApiVariant, ApiOrder, ApiListing, ApiProductImage, AdminPayout } from '@/types/api'

export interface CreateProductVariantDto {
  color: string
  colorFamily: string
  size: string
  stockQuantity: number
  weightGrams: number
}

export interface CreateProductDto {
  name: string
  description: string
  inspirationStory?: string
  category: string
  gender: string
  productType: string
  material: string
  originCountry: string
  careInstructions: string
  collectionName?: string
  releaseDate?: string
  returnPeriodDays?: number
  catalogueCategory: string[]
  completeTheLookEnabled: boolean
  completeTheLookProductIds: string[]
  variants: CreateProductVariantDto[]
}

// `status` is not part of CreateProductDto, but PUT /products/update/{id} accepts it — the
// backend's own 409 on delete tells the brand to "set its status to ARCHIVED instead".
export type UpdateProductDto = Partial<
  Omit<CreateProductDto, 'variants' | 'gender' | 'productType' | 'category'>
> & { status?: ProductStatus }
export interface RegisterBrandPartnerDto {
  email: string
  password: string
  brandName: string
  firstName: string
  lastName: string
  legalName: string
  addressStreet: string
  addressPostalCode: string
  addressCity: string
  addressCountry: string
  vatId?: string
  taxNumber?: string
}

// Mirrors backend UpdateBrandPartnerDto — brandName ist NICHT änderbar (kein Feld im Backend).
// Logo/Hero werden NICHT über logoUrl/heroImageUrl gesetzt (Jackson verwirft unbekannte Felder
// still, PATCH gibt 200 ohne Persistierung) — sondern über die storageKey aus dem Presign-Flow
// (POST /brandpartner/media/upload-url). Live gegen Produktion verifiziert.
export type UpdateBrandPartnerDto = {
  description?: string
  logoStorageKey?: string
  heroStorageKey?: string
  websiteUrl?: string
  instagramHandle?: string
  tiktokHandle?: string
  contactEmail?: string
  legalName?: string
  addressStreet?: string
  addressPostalCode?: string
  addressCity?: string
  addressCountry?: string
  vatId?: string
  taxNumber?: string
  // Return (warehouse) address — separate from the legal address above. Blank
  // values mean "fall back to the registered business address".
  // UNVERIFIED field names; see lib/api/modules/returnsApi.ts.
  returnRecipient?: string
  returnAddressStreet?: string
  returnAddressPostalCode?: string
  returnAddressCity?: string
  returnAddressCountry?: string
  returnInstructions?: string
}

// Mirrors backend CreateListingDto — Listings sind PRO VARIANTE (variantId @NotNull).
export interface CreateListingDto {
  variantId: number
  price: number
  discountPrice?: number
  priceInputMode: 'GROSS' | 'NET'
  currency?: string
  region?: string
}
// Backend UpdateListingDto: kein variantId/currency — Preis, Modus, discountPrice, active, region.
export interface UpdateListingDto {
  price?: number
  discountPrice?: number
  priceInputMode?: 'GROSS' | 'NET'
  active?: boolean
  region?: string
}

interface Page<T> { content: T[] }
function unpage<T>(res: Page<T> | T[]): T[] {
  return Array.isArray(res) ? res : (res.content ?? [])
}

// Presigned-upload contract (S3 direct upload) — verified live against production:
// 1. POST this to get a presigned PUT URL + the exact headers S3 requires.
// 2. PUT the file bytes straight to `uploadUrl`, with `requiredHeaders` MINUS `host` and
//    `content-length` — both are forbidden headers browsers refuse to set manually; the
//    browser sets them itself from the URL/body and the signature still matches.
// 3. Hand the returned `key` to whichever "register this upload" endpoint applies
//    (POST /products/{id}/media/images with storageKey, or PATCH /brandpartner/me with
//    logoStorageKey/heroStorageKey) — the raw bucket URL is not meant to be built client-side.
export interface MediaUploadUrlResponse {
  key: string
  uploadUrl: string
  expiresAt: string
  requiredHeaders: Record<string, string>
}

export const brandApi = {
  async apply(dto: RegisterBrandPartnerDto): Promise<ApiBrandPartner> {
    return fetcher<ApiBrandPartner>('/brandpartner/apply', {
      method: 'POST',
      body: JSON.stringify(dto),
      auth: false,
    })
  },

  media: {
    // purpose: 'BRAND_LOGO' | 'BRAND_HERO' — image/jpeg, image/png, image/webp only.
    async getUploadUrl(purpose: 'BRAND_LOGO' | 'BRAND_HERO', contentType: string, contentLength: number): Promise<MediaUploadUrlResponse> {
      return fetcher<MediaUploadUrlResponse>('/brandpartner/media/upload-url', {
        method: 'POST',
        body: JSON.stringify({ purpose, contentType, contentLength }),
      })
    },
  },

  async getMe(): Promise<ApiBrandPartner> {
    return fetcher<ApiBrandPartner>('/brandpartner/me')
  },

  async updateMe(dto: UpdateBrandPartnerDto): Promise<ApiBrandPartner> {
    return fetcher<ApiBrandPartner>('/brandpartner/me', {
      method: 'PATCH',
      body: JSON.stringify(dto),
    })
  },

  payouts: {
    // GET /brand/payouts — eigene Auszahlungen (read-only; Lifecycle steuert der Admin)
    async getMine(): Promise<AdminPayout[]> {
      return fetcher<AdminPayout[]>('/brand/payouts')
    },
  },

  orders: {
    async getAll(): Promise<ApiOrder[]> {
      return unpage(await fetcher<Page<ApiOrder> | ApiOrder[]>('/brand/orders?page=0&size=100'))
    },
    // Mirrors backend ShipmentConfirmationDto: { carrier, trackingNumber, note? }
    async ship(
      orderId: string,
      dto: { trackingNumber: string; carrier: string; note?: string },
    ): Promise<ApiOrder> {
      return fetcher<ApiOrder>(`/brand/orders/${orderId}/ship`, {
        method: 'POST',
        body: JSON.stringify(dto),
      })
    },
    async problem(orderId: string, description: string): Promise<ApiOrder> {
      return fetcher<ApiOrder>(`/brand/orders/${orderId}/problem`, {
        method: 'POST',
        body: JSON.stringify({ description }),
      })
    },
  },

  products: {
    // Backend liefert hier eine List<ProductResponseDto>, KEINE Page — unpage toleriert beides
    async getMy(): Promise<AdminApiProduct[]> {
      return unpage(await fetcher<Page<AdminApiProduct> | AdminApiProduct[]>('/products/my'))
    },
    async create(dto: CreateProductDto): Promise<AdminApiProduct> {
      return fetcher<AdminApiProduct>('/products/create', {
        method: 'POST',
        body: JSON.stringify(dto),
      })
    },
    async update(id: string, dto: UpdateProductDto): Promise<AdminApiProduct> {
      return fetcher<AdminApiProduct>(`/products/update/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dto),
      })
    },
    async delete(id: string): Promise<void> {
      return fetcher<void>(`/products/delete/${id}`, { method: 'DELETE' })
    },
  },

  listings: {
    async list(productId: string): Promise<ApiListing[]> {
      return fetcher<ApiListing[]>(`/products/${productId}/listings`)
    },
    async create(productId: string, dto: CreateListingDto): Promise<ApiListing> {
      return fetcher<ApiListing>(`/products/${productId}/listings`, {
        method: 'POST',
        body: JSON.stringify(dto),
      })
    },
    async update(productId: string, listingId: string, dto: UpdateListingDto): Promise<ApiListing> {
      return fetcher<ApiListing>(`/products/${productId}/listings/${listingId}`, {
        method: 'PUT',
        body: JSON.stringify(dto),
      })
    },
    async delete(productId: string, listingId: string): Promise<void> {
      return fetcher<void>(`/products/${productId}/listings/${listingId}`, { method: 'DELETE' })
    },
  },

  images: {
    async list(productId: string): Promise<ApiProductImage[]> {
      return fetcher<ApiProductImage[]>(`/products/${productId}/media/images`)
    },
    // purpose is always PRODUCT_IMAGE — image/jpeg, image/png, image/webp only.
    async getUploadUrl(productId: string, contentType: string, contentLength: number): Promise<MediaUploadUrlResponse> {
      return fetcher<MediaUploadUrlResponse>(`/products/${productId}/media/upload-url`, {
        method: 'POST',
        body: JSON.stringify({ purpose: 'PRODUCT_IMAGE', contentType, contentLength }),
      })
    },
    // Backend ProductImageDto expects `storageKey` (the S3 object key from getUploadUrl),
    // NOT a URL — the backend constructs and returns the public imageUrl itself. Live-verified;
    // an older version of this method sent `imageUrl` and always failed with a 400.
    async add(productId: string, storageKey: string): Promise<ApiProductImage> {
      return fetcher<ApiProductImage>(`/products/${productId}/media/images`, {
        method: 'POST',
        body: JSON.stringify({ storageKey }),
      })
    },
    async delete(productId: string, imageId: string): Promise<void> {
      return fetcher<void>(`/products/${productId}/media/images/${imageId}`, { method: 'DELETE' })
    },
  },

  variants: {
    async list(productId: string): Promise<AdminApiVariant[]> {
      return fetcher<AdminApiVariant[]>(`/products/${productId}/variants`)
    },
    async create(productId: string, dto: CreateProductVariantDto): Promise<AdminApiVariant> {
      return fetcher<AdminApiVariant>(`/products/${productId}/variants`, {
        method: 'POST',
        body: JSON.stringify(dto),
      })
    },
    async update(
      productId: string,
      variantId: string,
      dto: { stockQuantity?: number; weightGrams?: number },
    ): Promise<AdminApiVariant> {
      return fetcher<AdminApiVariant>(`/products/${productId}/variants/${variantId}`, {
        method: 'PUT',
        body: JSON.stringify(dto),
      })
    },
    async delete(productId: string, variantId: string): Promise<void> {
      return fetcher<void>(`/products/${productId}/variants/${variantId}`, { method: 'DELETE' })
    },
  },
}
