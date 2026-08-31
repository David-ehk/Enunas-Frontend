import { germanErrorMessage } from './errorCopy';

// Single source of truth for the API base — keep in sync with .env.local (NEXT_PUBLIC_API_URL).
// The Spring backend serves at the root context (no /api prefix).
//
// In production, NEXT_PUBLIC_API_URL MUST be set. Falling back to localhost in a prod build
// silently makes every request fail against a host that isn't there — and it's invisible
// locally because localhost works on the dev machine. So we throw loudly instead of
// defaulting. The localhost default is kept only for local development.
export function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (url) return url;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'NEXT_PUBLIC_API_URL is not set. Refusing to fall back to localhost in production — ' +
      'configure the API base URL in the deployment environment.'
    );
  }
  return 'http://localhost:8080';
}

export interface FetchOptions extends RequestInit {
  auth?: boolean;
}

export class FetchError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    /** The untranslated backend string. English — for logs and debugging, never for the UI. */
    public readonly serverMessage?: string,
  ) {
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

  // Whether this request actually carried a token. The backend now answers an unauthenticated
  // request with 401 (it used to be 403), so a token-less call — anything fired before
  // AuthContext has read localStorage, or by a component that was never logged in — would
  // otherwise trip the session-expired path and clear auth state for no reason.
  let sentToken = false;
  if (auth && typeof window !== 'undefined') {
    const token = localStorage.getItem('enunas_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      sentToken = true;
    }
  }

  const res = await fetch(`${getBaseUrl()}${path}`, { ...rest, headers });

  if (res.status === 401) {
    // 401 = "who are you", 403 = "you may not". Only a rejected token means the session died.
    if (sentToken) onUnauthorized?.();
    throw new FetchError(401, germanErrorMessage(401), 'Unauthorized');
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    // Every backend error path now returns {timestamp, status, error, message, path} with a
    // guaranteed message. A non-JSON body means something upstream of the app answered
    // (proxy, gateway) — keep the raw text as the log string only.
    let serverMessage: string | undefined;
    try {
      const json = JSON.parse(text);
      serverMessage = json.message || json.error || undefined;
    } catch { serverMessage = text || undefined; }
    throw new FetchError(res.status, germanErrorMessage(res.status, serverMessage), serverMessage);
  }

  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as unknown as T;
  }
  return res.json() as Promise<T>;
}
