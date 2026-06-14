'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { ApiUser, ApiCustomer } from '@/types/api'
import { getToken, clearToken } from '@/lib/api/auth'
import { fetcher, setOnUnauthorized } from '@/lib/api/fetcher'

interface AuthContextType {
  user: ApiUser | null;
  customer: ApiCustomer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  customer: null,
  isAuthenticated: false,
  isLoading: true,
  refreshUser: async () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [customer, setCustomer] = useState<ApiCustomer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refreshUser() {
    if (!getToken()) {
      setUser(null);
      setCustomer(null);
      return;
    }
    try {
      const me = await fetcher<ApiUser>('/users/me');
      setUser(me);
      if (me.role === 'CUSTOMER') {
        const cust = await fetcher<ApiCustomer>('/customer/me').catch(() => null);
        setCustomer(cust);
      }
    } catch {
      // Dev-only: use mock user from localStorage when backend is unreachable
      if (process.env.NODE_ENV === 'development') {
        try {
          const mock = localStorage.getItem('enunas_mock_user')
          if (mock) { setUser(JSON.parse(mock)); return }
        } catch { /* ignore */ }
      }
      setUser(null);
      setCustomer(null);
    }
  }

  useEffect(() => {
    setOnUnauthorized(() => {
      clearToken();
      setUser(null);
      setCustomer(null);
    });
    refreshUser().finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function logout() {
    clearToken();
    setUser(null);
    setCustomer(null);
  }

  return (
    <AuthContext.Provider value={{
      user,
      customer,
      isAuthenticated: user !== null,
      isLoading,
      refreshUser,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
