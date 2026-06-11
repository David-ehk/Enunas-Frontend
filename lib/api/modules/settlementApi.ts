import { fetcher } from '../fetcher'

// Mirrors backend SettlementRowDto (GET /admin/settlements) 1:1.
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
  settled?: boolean
  settledAt?: string | null
  invoiceReference?: string | null
}

export interface SettlementDashboard {
  totalPaid: number
  totalPending: number
}

export const settlementApi = {
  /** Unsettled brands with activity for a period — live ledger aggregates, no generation step. */
  async getSettlements(period: string): Promise<SettlementRow[]> {
    return fetcher<SettlementRow[]>(`/admin/settlements?period=${period}`)
  },

  /** Maps backend PayoutDashboardDto (pendingTotal/paidTotal) to the screen's totals. */
  async getDashboard(): Promise<SettlementDashboard> {
    const raw = await fetcher<{ paidTotal?: number; pendingTotal?: number }>('/admin/payouts/dashboard')
    return {
      totalPaid:    raw.paidTotal    ?? 0,
      totalPending: raw.pendingTotal ?? 0,
    }
  },

  /** Freeze + mark a closed period as settled (POST /admin/settlements/{brandId}/{period}). */
  async markSettled(brandId: number, period: string, invoiceReference?: string): Promise<SettlementRow> {
    return fetcher<SettlementRow>(`/admin/settlements/${brandId}/${period}`, {
      method: 'POST',
      body: invoiceReference ? JSON.stringify({ invoiceReference }) : undefined,
    })
  },
}
