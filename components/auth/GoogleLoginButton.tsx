'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import { authApi } from '@/lib/api'
import { mapGoogleAuthError } from '@/lib/googleAuthErrors'
import {
  ensureGoogleIdentityReady,
  getGoogleClientId,
  renderGoogleButton,
  setGoogleCredentialHandler,
} from '@/lib/googleIdentity'

// Provider-agnostic in shape: [provider] button -> provider ID token -> POST /auth/[provider] ->
// Enunas JWT -> existing AuthContext. If another provider (Apple, etc.) is ever added later,
// it's another similarly-shaped button + endpoint — not a restructuring of AuthContext. No
// abstraction is introduced now (YAGNI); this is only a note against baking in Google-only
// assumptions where avoiding them costs nothing.

interface GoogleLoginButtonProps {
  /** Maps to Google's button text ("Sign in with Google" vs "Sign up with Google") only —
   *  the backend call and resulting auth state are identical either way. */
  context: 'login' | 'register'
  /** Rendered by the parent in its own existing error slot — kept visually consistent with the
   *  email/password form's error display rather than introducing a second error UI. */
  onError: (message: string) => void
  onSuccess?: () => void
}

type LoadState = 'loading' | 'ready' | 'unavailable'

// Module-level, not component state: without this, every remount (StrictMode's double-invoke,
// Fast Refresh, switching the login/register tab) would re-log the same warning.
let warnedMissingClientId = false

export default function GoogleLoginButton({ context, onError, onSuccess }: GoogleLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [submitting, setSubmitting] = useState(false)
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const { refreshUser } = useAuth()

  const clientId = getGoogleClientId()

  // Side effect (logging + mutating module state) must run in an effect, never during render —
  // this was previously done inline in the render branch below, which is a real React purity
  // violation (caught by the react-hooks/globals lint rule), not just a style nit.
  useEffect(() => {
    if (clientId || process.env.NODE_ENV !== 'development' || warnedMissingClientId) return
    warnedMissingClientId = true
    console.error(
      '[GoogleLoginButton] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set — the Google sign-in button will not render. Set it in .env.local.'
    )
  }, [clientId])

  useEffect(() => {
    if (!clientId) return

    let cancelled = false

    async function handleCredential(credential: string) {
      setSubmitting(true)
      try {
        // Order matters: store the JWT before syncing AuthContext — never the reverse.
        await authApi.loginWithGoogle({ idToken: credential })
        await refreshUser()
        onSuccess?.()
      } catch (err) {
        onError(mapGoogleAuthError(err))
      } finally {
        setSubmitting(false)
      }
    }

    ensureGoogleIdentityReady(clientId).then((success) => {
      if (cancelled) return
      if (!success || !containerRef.current) {
        setLoadState('unavailable')
        return
      }
      setGoogleCredentialHandler(handleCredential)
      const rendered = renderGoogleButton(containerRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text: context === 'register' ? 'signup_with' : 'signin_with',
        width: 360,
      })
      setLoadState(rendered ? 'ready' : 'unavailable')
    })

    return () => {
      cancelled = true
      setGoogleCredentialHandler(null)
    }
    // context intentionally excluded — switching login/register tabs remounts this component
    // fresh each time (see CheckoutAuthGate/account AuthGate), so it always picks up the current
    // value on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId])

  // No client ID configured: loud in development (a missing env var must be obvious), silent in
  // production (falling back to email/password is acceptable UX; a visibly broken button is not).
  if (!clientId) {
    if (process.env.NODE_ENV !== 'development') return null
    return (
      <div className="mb-6">
        <div className="w-full border border-dashed border-enunas-gray-light px-4 py-3 text-center mb-4">
          <p className="font-league-spartan text-[11px] text-enunas-gray-medium">
            Google Sign-In nicht konfiguriert — NEXT_PUBLIC_GOOGLE_CLIENT_ID fehlt
          </p>
        </div>
        <Divider />
      </div>
    )
  }

  // Script/init failed at runtime (blocked, network issue, etc.) — not a config mistake, so this
  // degrades silently and lets the email/password form carry on uninterrupted.
  if (loadState === 'unavailable') return null

  return (
    <div className="mb-6">
      {/* containerRef's children are written directly by Google's renderButton (outside React's
          control) — the loading spinner below is a positioned sibling, never a child of this
          div, so React's own reconciliation never has to touch DOM nodes Google injected. */}
      <div className="relative min-h-11 flex justify-center">
        <div
          ref={containerRef}
          className="flex justify-center"
          style={{
            opacity: submitting ? 0.6 : 1,
            pointerEvents: submitting ? 'none' : 'auto',
            transition: 'opacity 200ms',
          }}
          aria-busy={submitting}
        />
        {loadState === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-enunas-gray-light border-t-enunas-purple rounded-full animate-spin" />
          </div>
        )}
      </div>
      <div className="mt-4">
        <Divider />
      </div>
    </div>
  )
}

function Divider() {
  return (
    <div className="flex items-center gap-4">
      <span className="flex-1 h-px bg-enunas-gray-light" />
      <span className="font-league-spartan text-[10px] uppercase tracking-[0.15em] text-enunas-gray-medium">
        oder
      </span>
      <span className="flex-1 h-px bg-enunas-gray-light" />
    </div>
  )
}
