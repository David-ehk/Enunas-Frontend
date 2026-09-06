import { fetcher } from '../fetcher';
import { setToken } from '../auth';
import type { ApiUser } from '@/types/api';

interface LoginRequest { email: string; password: string }
// Backend LoginResponseDto: { token: String, expiresIn: long } — no user field.
interface LoginResponse { token: string; expiresIn: number }
// Backend RegisterUserDto: { email, password } only — no firstName/lastName/role.
interface SignupRequest { email: string; password: string }
// Backend GoogleAuthDto: { idToken } only — the frontend never sends user info manually, the
// backend derives everything from the verified Google token itself.
interface GoogleAuthRequest { idToken: string }

export const authApi = {
  async login(data: LoginRequest): Promise<void> {
    const res = await fetcher<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
      auth: false,
    });
    setToken(res.token);
  },

  // Mirrors login() exactly — same response shape (LoginResponseDto), same token storage. The
  // rest of the app (AuthContext, protected routes, logout) never needs to know which method
  // produced the token.
  async loginWithGoogle(data: GoogleAuthRequest): Promise<void> {
    const res = await fetcher<LoginResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(data),
      auth: false,
    });
    setToken(res.token);
  },

  async signup(data: SignupRequest): Promise<ApiUser> {
    return fetcher<ApiUser>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
      auth: false,
    });
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

  // Verified live against the backend 2026-09-06: '/auth/password' 404s ("No endpoint POST
  // auth/password") — the real route is '/auth/change-password', confirmed by getting a genuine
  // "Current password is incorrect" business-logic error back instead of a route-not-found one.
  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    return fetcher<void>('/auth/change-password', { method: 'POST', body: JSON.stringify(data) });
  },

  // Two-step reset: forgot-password emails a code, reset-password consumes it. Both are
  // permitAll on the backend (no token). Endpoint paths verified against SecurityConfiguration —
  // the older single '/auth/password-reset' path 404s.
  async requestPasswordReset(email: string): Promise<void> {
    return fetcher<void>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
      auth: false,
    });
  },

  async resetPassword(data: { token: string; newPassword: string }): Promise<void> {
    return fetcher<void>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
      auth: false,
    });
  },
};
