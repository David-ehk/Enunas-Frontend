import { fetcher } from '../fetcher'
import type { ApiBrandPartner, AdminApiProduct, AdminApiVariant, ApiOrder, ApiListing, ApiProductImage, AdminPayout } from '@/types/api'

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

export type UpdateProductDto = Partial<
  Omit<CreateProductDto, 'variants' | 'gender' | 'productType' | 'category'>
>
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
export type UpdateBrandPartnerDto = {
  description?: string
  logoUrl?: string
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

export const brandApi = {
  async apply(dto: RegisterBrandPartnerDto): Promise<ApiBrandPartner> {
    return fetcher<ApiBrandPartner>('/brandpartner/apply', {
      method: 'POST',
      body: JSON.stringify(dto),
      auth: false,
    })
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
    // Backend ProductImageDto: das Feld heißt `imageUrl` (@NotBlank), nicht `url`
    async add(productId: string, url: string): Promise<ApiProductImage> {
      return fetcher<ApiProductImage>(`/products/${productId}/media/images`, {
        method: 'POST',
        body: JSON.stringify({ imageUrl: url }),
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
