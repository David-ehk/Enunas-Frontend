// ============================================================
// Google Identity Services (GIS) loader — load script once, initialize once
// ============================================================
//
// google.accounts.id.initialize() is meant to be called exactly once per page lifetime. Calling
// it repeatedly (e.g. once per GoogleLoginButton mount, which happens every time a user switches
// between the login/register tabs) is the "odd behavior" risk with GIS — so this module owns
// that lifecycle globally instead of leaving each component to manage it independently.
//
// Sequence every caller gets: load script (cached) -> initialize once (cached) -> renderButton
// per-mount (cheap, safe to repeat into a fresh container each time).
//
// CSP note: this script loads resources from accounts.google.com and related Google origins. A
// future strict Content-Security-Policy needs script-src/frame-src/connect-src entries for those
// origins, or the Google popup silently stops working.

const SCRIPT_ID = 'enunas-google-identity-script';
const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

let scriptLoadPromise: Promise<boolean> | null = null;
let initialized = false;

// Only one GoogleLoginButton is ever visible at a time in current usage (the login/register tabs
// on both surfaces are mutually exclusive), so "last mounted wins, cleared on unmount" is
// sufficient — not a hidden multi-instance bug, just the actual usage shape today.
let activeHandler: ((credential: string) => void) | null = null;

export function getGoogleClientId(): string | null {
  return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || null;
}

export function setGoogleCredentialHandler(handler: ((credential: string) => void) | null): void {
  activeHandler = handler;
}

function loadScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (typeof google !== 'undefined' && typeof google.accounts?.id?.initialize === 'function') {
    return Promise.resolve(true);
  }
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise<boolean>((resolve) => {
    try {
      const existing = document.getElementById(SCRIPT_ID);
      if (existing) {
        existing.addEventListener('load', () => resolve(true));
        existing.addEventListener('error', () => resolve(false));
        return;
      }
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    } catch {
      resolve(false);
    }
  });

  return scriptLoadPromise;
}

/**
 * Loads the GIS script and initializes it exactly once. Safe to call from every mounted
 * GoogleLoginButton — subsequent calls are no-ops beyond the initial one. Resolves `false` on
 * any failure (no client ID, script blocked, etc.) so callers can fall back gracefully.
 */
export async function ensureGoogleIdentityReady(clientId: string): Promise<boolean> {
  const loaded = await loadScript();
  if (!loaded) return false;

  if (!initialized) {
    try {
      google.accounts.id.initialize({
        client_id: clientId,
        // Single stable dispatcher — forwards to whichever GoogleLoginButton is currently
        // registered, rather than re-calling initialize() per mount.
        callback: (response) => activeHandler?.(response.credential),
        cancel_on_tap_outside: true,
      });
      initialized = true;
    } catch {
      return false;
    }
  }

  return true;
}

export function renderGoogleButton(
  container: HTMLElement,
  options: google.accounts.id.GsiButtonConfiguration
): boolean {
  if (typeof google === 'undefined' || typeof google.accounts?.id?.renderButton !== 'function') {
    return false;
  }
  try {
    google.accounts.id.renderButton(container, options);
    return true;
  } catch {
    return false;
  }
}
