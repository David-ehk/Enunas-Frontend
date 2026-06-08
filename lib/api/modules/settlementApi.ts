import { fetcher } from '../fetcher'

export interface SettlementRow {
  brandId: number
  brandName: string
  domestic: boolean
  vatId: string | null
  taxNumber: string | null
  commissionNet: number
  commissionVat: number
  commissionGross: number
  payoutAmount: number
  orderCount: number
  refundCount: number
  isCreditNote: boolean
  // Present only for settled rows (includeSettled=true)
  settled?: boolean
  settledAt?: string | null
  invoiceReference?: string | null
}

export const settlementApi = {
  async getSettlements(period: string, includeSettled = false): Promise<SettlementRow[]> {
    const params = includeSettled
      ? `period=${period}&includeSettled=true`
      : `period=${period}`
    return fetcher<SettlementRow[]>(`/admin/settlements?${params}`)
  },
  async markSettled(brandId: number, period: string, invoiceReference?: string): Promise<void> {
    return fetcher<void>(`/admin/settlements/${brandId}/${period}`, {
      method: 'POST',
      body: invoiceReference ? JSON.stringify({ invoiceReference }) : undefined,
    })
  },
}
