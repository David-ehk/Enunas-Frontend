import { fetcher } from '../fetcher';

export interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

export const payoutApi = {
  async getAll(): Promise<Payout[]> {
    return fetcher<Payout[]>('/payouts');
  },

  async getById(id: string): Promise<Payout> {
    return fetcher<Payout>(`/payouts/${id}`);
  },
};
