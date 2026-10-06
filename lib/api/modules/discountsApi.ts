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
    // No DELETE endpoint in the backend (only POST/GET/PUT) — codes are deactivated, not deleted.
  },

  brand: {
    async list(): Promise<DiscountResponse[]> {
      return fetcher<DiscountResponse[]>('/brand/discounts')
    },
    // The brand create DTO has no `active` field and rejects the request if it is sent
    // (400 "Unknown field: active"); codes start active, so an inactive one is switched off
    // right after creation through the update endpoint, which does accept it.
    async create(dto: CreateDiscountRequest): Promise<DiscountResponse> {
      const { active, ...body } = dto
      const created = await fetcher<DiscountResponse>('/brand/discounts', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      return active === false ? discountsApi.brand.update(created.id, { active: false }) : created
    },
    async update(id: number, dto: UpdateDiscountRequest): Promise<DiscountResponse> {
      return fetcher<DiscountResponse>(`/brand/discounts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dto),
      })
    },
  },
}
