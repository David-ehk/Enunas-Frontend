import { fetcher } from '../fetcher';
import type { AdminPayout, PayoutDashboard } from '../../types/api';

export const payoutApi = {
  async generate(): Promise<void> {
    return fetcher<void>('/admin/payouts/generate', { method: 'POST' });
  },

  async getDashboard(): Promise<PayoutDashboard> {
    return fetcher<PayoutDashboard>('/admin/payouts/dashboard');
  },

  async getAll(): Promise<AdminPayout[]> {
    return fetcher<AdminPayout[]>('/admin/payouts');
  },

  async getById(payoutId: string): Promise<AdminPayout> {
    return fetcher<AdminPayout>(`/admin/payouts/${payoutId}`);
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
