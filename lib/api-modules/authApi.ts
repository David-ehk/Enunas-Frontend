import { fetcher } from '../fetcher';
import { setToken } from '../auth';
import type { AuthResponse, LoginRequest, SignupRequest } from '../../types/api';

export const authApi = {
  async signup(data: SignupRequest): Promise<AuthResponse> {
    const res = await fetcher<AuthResponse>('/auth/signup', {
      method: 'POST',
      auth: false,
      body: JSON.stringify(data),
    });
    setToken(res.token);
    return res;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await fetcher<AuthResponse>('/auth/login', {
      method: 'POST',
      auth: false,
      body: JSON.stringify(data),
    });
    setToken(res.token);
    return res;
  },
};
