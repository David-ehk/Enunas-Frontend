import { fetcher } from '../fetcher'
import type {
  DiscountResponse,
  CreateDiscountRequest,
  UpdateDiscountRequest,
} from '@/types/api'

export const discountsApi = {
  admin: {
    async list(): Promise<DiscountResponse[]> {
      return fetcher<DiscountResponse[]>('/admin/discounts')
    },
    async create(dto: CreateDiscountRequest): Promise<DiscountResponse> {
      return fetcher<DiscountResponse>('/admin/discounts', {
        method: 'POST',
        body: JSON.stringify(dto),
      })
    },
    async update(id: number, dto: UpdateDiscountRequest): Promise<DiscountResponse> {
      return fetcher<DiscountResponse>(`/admin/discounts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dto),
      })
    },
    async deactivate(id: number): Promise<DiscountResponse> {
      return fetcher<DiscountResponse>(`/admin/discounts/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ active: false }),
      })
    },
  },

  brand: {
    async list(): Promise<DiscountResponse[]> {
      return fetcher<DiscountResponse[]>('/brand/discounts')
    },
    async create(dto: CreateDiscountRequest): Promise<DiscountResponse> {
      return fetcher<DiscountResponse>('/brand/discounts', {
        method: 'POST',
        body: JSON.stringify(dto),
      })
    },
    async update(id: number, dto: UpdateDiscountRequest): Promise<DiscountResponse> {
      return fetcher<DiscountResponse>(`/brand/discounts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dto),
      })
    },
  },
}
