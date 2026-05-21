import { fetcher } from '../fetcher';
import { setToken } from '../auth';
import type { ApiUser } from '@/types/api';

interface LoginRequest { email: string; password: string }
interface LoginResponse { token: string; refreshToken?: string; user: ApiUser }
interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'CUSTOMER' | 'BRAND_PARTNER';
}

export const authApi = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const res = await fetcher<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
      auth: false,
    });
    setToken(res.token);
    return res;
  },

  async signup(data: SignupRequest): Promise<LoginResponse> {
    const res = await fetcher<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
      auth: false,
    });
    setToken(res.token);
    return res;
  },

  async logout(): Promise<void> {
    return fetcher<void>('/auth/logout', { method: 'POST' });
  },

  async getMe(): Promise<ApiUser> {
    return fetcher<ApiUser>('/users/me');
  },

  async updateProfile(data: { firstName?: string; lastName?: string }): Promise<ApiUser> {
    return fetcher<ApiUser>('/auth/profile', { method: 'PATCH', body: JSON.stringify(data) });
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    return fetcher<void>('/auth/password', { method: 'POST', body: JSON.stringify(data) });
  },

  async requestPasswordReset(email: string): Promise<void> {
    return fetcher<void>('/auth/password-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
      auth: false,
    });
  },
};
