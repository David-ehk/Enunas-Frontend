import { fetcher } from '../fetcher';
import type { AdminPayout, PayoutDashboard } from '../../../types/api';

export const payoutApi = {
  async generate(): Promise<void> {
    return fetcher<void>('/admin/payouts/generate', { method: 'POST' });
  },

  async getDashboard(signal?: AbortSignal): Promise<PayoutDashboard> {
    return fetcher<PayoutDashboard>('/admin/payouts/dashboard', { signal });
  },

  async getAll(signal?: AbortSignal): Promise<AdminPayout[]> {
    return fetcher<AdminPayout[]>('/admin/payouts', { signal });
  },

  async getById(payoutId: string, signal?: AbortSignal): Promise<AdminPayout> {
    return fetcher<AdminPayout>(`/admin/payouts/${payoutId}`, { signal });
  },

  async approve(payoutId: string): Promise<void> {
    return fetcher<void>(`/admin/payouts/${payoutId}/approve`, { method: 'POST' });
  },

  async markPaid(payoutId: string): Promise<void> {
    return fetcher<void>(`/admin/payouts/${payoutId}/paid`, { method: 'POST' });
  },

  async cancel(payoutId: string): Promise<void> {
    return fetcher<void>(`/admin/payouts/${payoutId}/cancel`, { method: 'POST' });
  },
};
