// ============================================================
// Minimal ambient types for Google Identity Services (GIS) — just the surface
// lib/googleIdentity.ts and GoogleLoginButton.tsx actually use. No @types/google.accounts
// package exists for this; hand-typing the small subset used avoids pulling in unrelated surface
// area. Not a module (no import/export) so this merges into the global `google` namespace,
// alongside the `google.maps` namespace declared in google-maps.d.ts.
// ============================================================

declare namespace google.accounts.id {
  interface CredentialResponse {
    credential: string;
    select_by?: string;
  }

  interface IdConfiguration {
    client_id: string;
    callback: (response: CredentialResponse) => void;
    context?: 'signin' | 'signup' | 'use';
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    itp_support?: boolean;
  }

  interface GsiButtonConfiguration {
    type?: 'standard' | 'icon';
    theme?: 'outline' | 'filled_blue' | 'filled_black';
    size?: 'large' | 'medium' | 'small';
    text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
    shape?: 'rectangular' | 'pill' | 'circle' | 'square';
    logo_alignment?: 'left' | 'center';
    width?: string | number;
    locale?: string;
  }

  function initialize(config: IdConfiguration): void;
  function renderButton(parent: HTMLElement, options: GsiButtonConfiguration): void;
}
