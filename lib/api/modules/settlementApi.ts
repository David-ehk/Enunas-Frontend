import { fetcher } from '../fetcher'

export interface SettlementRow {
  id?: string
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
  period?: string
  status?: string
  settled?: boolean
  settledAt?: string | null
  invoiceReference?: string | null
}

export interface SettlementDashboard {
  totalPaid: number
  totalPending: number
  totalCancelled: number
}

// Backend PayoutResponseDto — may include richer settlement fields beyond basic AdminPayout
interface PayoutDto {
  id: string | number
  brandId?: string | number
  brandName?: string
  period?: string
  commissionNet?: number
  commissionVat?: number
  commissionGross?: number
  amount?: number
  payoutAmount?: number
  orderCount?: number
  refundCount?: number
  isCreditNote?: boolean
  isDomestic?: boolean
  domestic?: boolean
  vatId?: string | null
  taxNumber?: string | null
  status?: string
  paidAt?: string | null
  settledAt?: string | null
  invoiceReference?: string | null
  paymentReference?: string | null
}

interface Page<T> { content?: T[] }

function unpage<T>(res: Page<T> | T[]): T[] {
  return Array.isArray(res) ? res : (res.content ?? [])
}

function toRow(p: PayoutDto): SettlementRow {
  return {
    id: String(p.id),
    brandId: Number(p.brandId ?? 0),
    brandName: p.brandName ?? `Brand #${p.brandId}`,
    domestic: p.isDomestic ?? p.domestic ?? true,
    vatId: p.vatId ?? null,
    taxNumber: p.taxNumber ?? null,
    commissionNet: p.commissionNet ?? 0,
    commissionVat: p.commissionVat ?? 0,
    commissionGross: p.commissionGross ?? (p.commissionNet ?? 0) + (p.commissionVat ?? 0),
    payoutAmount: p.payoutAmount ?? p.amount ?? 0,
    orderCount: p.orderCount ?? 0,
    refundCount: p.refundCount ?? 0,
    isCreditNote: p.isCreditNote ?? false,
    period: p.period,
    status: p.status,
    settled: p.status === 'PAID',
    settledAt: p.paidAt ?? p.settledAt ?? null,
    invoiceReference: p.invoiceReference ?? p.paymentReference ?? null,
  }
}

async function fetchByStatus(status: string): Promise<PayoutDto[]> {
  return unpage(
    await fetcher<Page<PayoutDto> | PayoutDto[]>(
      `/admin/payouts?page=0&size=200&status=${status}`
    )
  )
}

export const settlementApi = {
  async getSettlements(period: string, includeSettled = false): Promise<SettlementRow[]> {
    // Open view: PENDING + APPROVED (backend workflow is PENDING → APPROVED → PAID)
    // Settled view: PAID only
    const raw = includeSettled
      ? await fetchByStatus('PAID')
      : await Promise.all([fetchByStatus('PENDING'), fetchByStatus('APPROVED')]).then(([a, b]) => [...a, ...b])

    const rows = raw.map(toRow)
    // Filter client-side by period when the backend returns a period field on each row
    const hasPeriodField = rows.some(r => r.period)
    return hasPeriodField ? rows.filter(r => r.period === period) : rows
  },

  async getDashboard(): Promise<SettlementDashboard> {
    const raw = await fetcher<{ totalPaid?: number; totalPending?: number; totalCancelled?: number }>(
      '/admin/payouts/dashboard'
    )
    return {
      totalPaid:      raw.totalPaid      ?? 0,
      totalPending:   raw.totalPending   ?? 0,
      totalCancelled: raw.totalCancelled ?? 0,
    }
  },

  async generateSettlements(period: string): Promise<SettlementRow[]> {
    const raw = await fetcher<PayoutDto[]>('/admin/payouts/generate', {
      method: 'POST',
      body: JSON.stringify({ period }),
    })
    return Array.isArray(raw) ? raw.map(toRow) : []
  },

  async markSettled(
    brandId: number,
    period: string,
    invoiceReference?: string,
    payoutId?: string,
  ): Promise<void> {
    if (payoutId) {
      // Backend workflow: PENDING → APPROVED → PAID
      // Approve silently first (no-op if already approved)
      try {
        await fetcher<void>(`/admin/payouts/${payoutId}/approve`, { method: 'POST' })
      } catch { /* already APPROVED or not required — continue to paid */ }

      return fetcher<void>(`/admin/payouts/${payoutId}/paid`, {
        method: 'POST',
        body: JSON.stringify({ paymentReference: invoiceReference ?? '' }),
      })
    }
    // Fallback for mock/offline rows that have no backend ID
    return fetcher<void>(`/admin/settlements/${brandId}/${period}`, {
      method: 'POST',
      body: invoiceReference ? JSON.stringify({ invoiceReference }) : undefined,
    })
  },
}
