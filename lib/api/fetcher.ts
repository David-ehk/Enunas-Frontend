import { getToken, clearToken } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export class FetchError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'FetchError';
  }
}

export interface FetchOptions extends RequestInit {
  auth?: boolean;
  skipContentType?: boolean;
  // signal is inherited from RequestInit — pass an AbortController signal to cancel requests
}

let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(cb: () => void): void {
  onUnauthorized = cb;
}

export async function fetcher<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { auth = true, skipContentType = false, headers: extraHeaders, ...rest } = options;

  const headers: Record<string, string> = {};

  if (!skipContentType) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  if (extraHeaders) {
    Object.assign(headers, extraHeaders);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...rest,
    headers,
  });

  if (res.status === 401) {
    clearToken();
    if (onUnauthorized) onUnauthorized();
    throw new FetchError(401, 'Unauthorized');
  }

  if (!res.ok) {
    const body = await res.text().catch(() => 'Unknown error');
    throw new FetchError(res.status, body);
  }

  if (res.status === 204) return undefined as T;

  return res.json();
}
