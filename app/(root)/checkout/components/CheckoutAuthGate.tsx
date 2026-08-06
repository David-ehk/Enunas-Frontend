'use client'

import { useState } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import { authApi, FetchError } from '@/lib/api'
import GoogleLoginButton from '@/components/auth/GoogleLoginButton'

// Mirrors the inline login/register pattern already established on the account page
// (app/(root)/account/page.tsx's AuthGate) — not extracted into a shared component since that
// one isn't exported, and duplicating a ~130-line form is preferable to an unsolicited edit of
// an unrelated page. No dedicated /login route exists anywhere in this app; this is how the app
// gates a page behind auth everywhere else.
interface CheckoutAuthGateProps {
  // Fires once refreshUser() resolves after a successful login/register — lets a wrapper (the
  // checkout auth modal) close itself the moment the visitor is actually signed in.
  onSuccess?: () => void
}

export default function CheckoutAuthGate({ onSuccess }: CheckoutAuthGateProps = {}) {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { refreshUser } = useAuth()

  const set = (field: 'email' | 'password') => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await authApi.login({ email: form.email, password: form.password })
      await refreshUser()
      onSuccess?.()
    } catch (err) {
      setError(err instanceof FetchError ? err.message : 'E-Mail oder Passwort falsch.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      // Signup returns UserResponseDto (no token) — log in separately to get one.
      await authApi.signup({ email: form.email, password: form.password })
      await authApi.login({ email: form.email, password: form.password })
      await refreshUser()
      onSuccess?.()
    } catch (err) {
      setError(err instanceof FetchError ? err.message : 'Registrierung fehlgeschlagen. Bitte versuche es erneut.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full border border-enunas-gray-light px-4 py-3 font-league-spartan text-sm text-enunas-black bg-white focus:outline-none focus:border-enunas-purple transition-colors duration-200'

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="text-center mb-8">
        <p className="font-league-spartan text-[11px] tracking-[0.35em] uppercase text-enunas-gray-medium mb-3">
          Anmeldung erforderlich
        </p>
        <h1 className="font-cormorant text-3xl text-enunas-black font-light">
          Melde dich an, um fortzufahren.
        </h1>
        <p className="font-league-spartan text-xs text-enunas-gray-medium mt-2">
          Dein Warenkorb bleibt erhalten.
        </p>
      </div>

      <div className="flex border-b border-enunas-gray-light mb-6">
        {(['login', 'register'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTab(t); setError(null) }}
            className={`flex-1 py-3 font-league-spartan text-[11px] uppercase tracking-[0.15em] transition-colors duration-200 ${
              tab === t
                ? 'border-b-2 border-enunas-purple text-enunas-purple'
                : 'text-enunas-gray-medium hover:text-enunas-purple'
            }`}
          >
            {t === 'login' ? 'Anmelden' : 'Registrieren'}
          </button>
        ))}
      </div>

      {tab === 'login' ? (
        <>
        <GoogleLoginButton context="login" onError={setError} />
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" name="email" placeholder="E-Mail" value={form.email} onChange={set('email')} required autoComplete="email" className={inputClass} />
          <input type="password" name="password" placeholder="Passwort" value={form.password} onChange={set('password')} required autoComplete="current-password" className={inputClass} />
          {error && <p className="font-league-spartan text-xs text-enunas-error">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="group relative w-full overflow-hidden bg-enunas-purple text-white py-4 hover:bg-enunas-purple-dark transition-colors duration-300 ease-out-expo disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="absolute left-1/2 -translate-x-1/2 top-[14%] w-full h-[1px] bg-white/60 transition-all duration-500 ease-out group-hover:w-[70%]" />
            <span className="relative z-10 font-cormorant text-[18px] tracking-[0.06em]">{submitting ? 'Bitte warten…' : 'Anmelden'}</span>
            <span className="absolute left-1/2 -translate-x-1/2 bottom-[14%] w-full h-[1px] bg-white/60 transition-all duration-500 ease-out group-hover:w-[70%]" />
          </button>
        </form>
        </>
      ) : (
        <>
        <GoogleLoginButton context="register" onError={setError} />
        <form onSubmit={handleRegister} className="space-y-4">
          <input type="email" name="email" placeholder="E-Mail" value={form.email} onChange={set('email')} required autoComplete="email" className={inputClass} />
          <input type="password" name="password" placeholder="Passwort (mind. 8 Zeichen)" value={form.password} onChange={set('password')} required minLength={8} autoComplete="new-password" className={inputClass} />
          <p className="font-league-spartan text-xs text-enunas-gray-medium">
            Du kannst deinen Namen nach der Anmeldung unter Einstellungen ergänzen.
          </p>
          {error && <p className="font-league-spartan text-xs text-enunas-error">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="group relative w-full overflow-hidden bg-enunas-purple text-white py-4 hover:bg-enunas-purple-dark transition-colors duration-300 ease-out-expo disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="absolute left-1/2 -translate-x-1/2 top-[14%] w-full h-[1px] bg-white/60 transition-all duration-500 ease-out group-hover:w-[70%]" />
            <span className="relative z-10 font-cormorant text-[18px] tracking-[0.06em]">{submitting ? 'Bitte warten…' : 'Konto erstellen'}</span>
            <span className="absolute left-1/2 -translate-x-1/2 bottom-[14%] w-full h-[1px] bg-white/60 transition-all duration-500 ease-out group-hover:w-[70%]" />
          </button>
        </form>
        </>
      )}
    </div>
  )
}
