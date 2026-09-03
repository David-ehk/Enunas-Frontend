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
  /**
   * How to read a successful body. Defaults to 'json'. A handful of backend routes are declared
   * as `String` in Spring and answer with bare text/plain ("Email verified. Awaiting admin
   * approval.") — res.json() throws on those, so they opt into 'text'.
   */
  parse?: 'json' | 'text';
}

export class FetchError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    /** The untranslated backend string. English — for logs and debugging, never for the UI. */
    public readonly serverMessage?: string,
    /**
     * Stable machine-readable failure identifier. Branch on THIS, never on `serverMessage` —
     * that string is human copy and gets reworded. Undefined when the backend error carries no
     * code (the field is absent, not null), in which case `serverMessage` is the fallback.
     * An unrecognised code is a generic failure: the set grows over time.
     */
    public readonly code?: string,
    /** Request path the backend echoed back, for logs. */
    public readonly path?: string,
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
  const { auth = true, parse = 'json', headers: extraHeaders, ...rest } = options;
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
    // Every backend error path returns {timestamp, status, error, message, path}, plus a `code`
    // on the failures that have one. A non-JSON body means something upstream of the app
    // answered (proxy, gateway) — keep the raw text as the log string only.
    let serverMessage: string | undefined;
    let code: string | undefined;
    let path: string | undefined;
    try {
      const json = JSON.parse(text);
      serverMessage = json.message || json.error || undefined;
      // Absent, not null, on errors without one — so only a real non-empty string counts.
      code = typeof json.code === 'string' && json.code ? json.code : undefined;
      path = typeof json.path === 'string' ? json.path : undefined;
    } catch { serverMessage = text || undefined; }
    throw new FetchError(
      res.status,
      germanErrorMessage(res.status, serverMessage, code),
      serverMessage,
      code,
      path,
    );
  }

  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as unknown as T;
  }
  if (parse === 'text') {
    return (await res.text()) as unknown as T;
  }
  return res.json() as Promise<T>;
}
