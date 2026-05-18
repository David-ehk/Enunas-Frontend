'use client';
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { getToken, clearToken, setOnUnauthorized, customerApi, brandApi } from '@/lib/api';
import type { ApiUser, ApiCustomer, ApiBrandPartner } from '@/types/api';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: ApiUser | null;
  customer: ApiCustomer | null;
  brandPartner: ApiBrandPartner | null;
  token: string | null;
}

interface AuthContextType extends AuthState {
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const EMPTY_STATE: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  customer: null,
  brandPartner: null,
  token: null,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({ ...EMPTY_STATE, isLoading: true });

  const logout = useCallback(() => {
    clearToken();
    setState(EMPTY_STATE);
    router.push('/account');
  }, [router]);

  useEffect(() => {
    setOnUnauthorized(logout);
  }, [logout]);

  const refreshUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setState(EMPTY_STATE);
      return;
    }
    try {
      const user = await customerApi.getMe();
      let customer: ApiCustomer | null = null;
      let brandPartner: ApiBrandPartner | null = null;

      if (user.role === 'CUSTOMER') {
        customer = await customerApi.getCustomerProfile().catch(() => null);
      } else if (user.role === 'BRAND_PARTNER') {
        brandPartner = await brandApi.getMe().catch(() => null);
      }

      setState({ isAuthenticated: true, isLoading: false, user, customer, brandPartner, token });
    } catch {
      clearToken();
      setState(EMPTY_STATE);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ ...state, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
