import { fetcher } from '../fetcher'
import type { ApiBrandPartner, AdminApiProduct, AdminApiVariant, ApiOrder, ApiListing, ApiProductImage } from '@/types/api'

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

export type UpdateBrandPartnerDto = {
  brandName?: string
  legalName?: string
  addressStreet?: string
  addressPostalCode?: string
  addressCity?: string
  addressCountry?: string
  vatId?: string
  taxNumber?: string
}

export interface CreateListingDto {
  price: number
  discountPrice?: number
  priceInputMode: 'GROSS' | 'NET'
  currency?: string
  region?: string
}
export type UpdateListingDto = Partial<CreateListingDto>

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

  orders: {
    async getAll(): Promise<ApiOrder[]> {
      return unpage(await fetcher<Page<ApiOrder> | ApiOrder[]>('/brand/orders?page=0&size=100'))
    },
    async ship(
      orderId: string,
      dto: { trackingNumber: string; carrier: string; estimatedDelivery?: string },
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
    async add(productId: string, url: string): Promise<ApiProductImage> {
      return fetcher<ApiProductImage>(`/products/${productId}/media/images`, {
        method: 'POST',
        body: JSON.stringify({ url }),
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
