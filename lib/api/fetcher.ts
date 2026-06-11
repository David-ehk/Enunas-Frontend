// Single source of truth for the API base — keep in sync with .env.local (NEXT_PUBLIC_API_URL).
// The Spring backend serves at the root context (no /api prefix).
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export interface FetchOptions extends RequestInit {
  auth?: boolean;
}

export class FetchError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'FetchError';
  }
}

let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(cb: () => void): void {
  onUnauthorized = cb;
}

export async function fetcher<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { auth = true, headers: extraHeaders, ...rest } = options;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (extraHeaders) {
    Object.assign(headers, extraHeaders);
  }

  if (auth && typeof window !== 'undefined') {
    const token = localStorage.getItem('enunas_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...rest, headers });

  if (res.status === 401) {
    onUnauthorized?.();
    throw new FetchError(401, 'Nicht autorisiert');
  }

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    let message = text || res.statusText;
    try {
      const json = JSON.parse(text);
      if (json.message) message = json.message;
    } catch { /* not JSON */ }
    throw new FetchError(res.status, message);
  }

  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as unknown as T;
  }
  return res.json() as Promise<T>;
}
