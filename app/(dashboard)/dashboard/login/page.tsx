'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authApi, FetchError } from '@/lib/api'
import { useAuth } from '@/app/context/AuthContext'
import type { UserRole } from '@/types/api'

export default function DashboardLoginPage() {
  const router = useRouter()
  const { refreshUser } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setNeedsVerification(false)
    setLoading(true)
    try {
      // 1. POST /auth/login — stores JWT in localStorage via setToken()
      await authApi.login({ email, password })
      // 2. GET /auth/me — read role from token (login response has no user object)
      const me = await authApi.getMe()
      // 3. Sync auth context for rest of the app
      await refreshUser()
      const role: UserRole = me.role
      if (role === 'ADMIN') router.replace('/dashboard/admin')
      else if (role === 'BRAND_PARTNER') router.replace('/dashboard/vendor')
      else router.replace('/account')
    } catch (err: unknown) {
      // The backend answers a *correct* password with 409 when the account is not yet usable —
      // either the email is unverified or an admin has not approved the brand yet. Both used to
      // surface as "wrong password", which sends the brand partner looking in the wrong place.
      if (err instanceof FetchError && err.status === 409) {
        const serverMessage = err.serverMessage ?? ''
        if (/verify/i.test(serverMessage)) {
          setNeedsVerification(true)
          setError('Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse.')
        } else if (/approval|approve/i.test(serverMessage)) {
          setError('Ihr Konto wartet noch auf die Freigabe durch unser Team. Sie erhalten eine E-Mail, sobald es soweit ist.')
        } else {
          setError(err.message)
        }
      } else {
        setError('E-Mail oder Passwort ist falsch.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: '#F5F5F0' }}
    >
      {/* Card */}
      <div className="w-full max-w-[420px] bg-white px-10 py-12" style={{ boxShadow: '0 2px 24px rgba(0,0,0,0.06)' }}>

        {/* Wordmark */}
        <div className="text-center mb-10">
          <h1
            className="text-enunas-black"
            style={{
              fontFamily: 'var(--font-Cormorant-Garamond)',
              fontSize: '36px',
              fontWeight: 300,
              letterSpacing: '0.05em',
              lineHeight: 1,
            }}
          >
            Enunas
          </h1>
          <p
            className="mt-2 text-enunas-gray-medium"
            style={{
              fontFamily: 'var(--font-league-spartan)',
              fontSize: '9px',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
            }}
          >
            Portal
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-enunas-gray-light mb-8" />

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block mb-1.5 text-enunas-black"
              style={{
                fontFamily: 'var(--font-league-spartan)',
                fontSize: '9px',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
              }}
            >
              E-Mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-enunas-gray-light bg-white text-enunas-black focus:outline-none focus:border-enunas-purple transition-colors duration-200"
              style={{
                fontFamily: 'var(--font-league-spartan)',
                fontSize: '13px',
                padding: '12px 14px',
              }}
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block mb-1.5 text-enunas-black"
              style={{
                fontFamily: 'var(--font-league-spartan)',
                fontSize: '9px',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
              }}
            >
              Passwort
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-enunas-gray-light bg-white text-enunas-black focus:outline-none focus:border-enunas-purple transition-colors duration-200 pr-10"
                style={{
                  fontFamily: 'var(--font-league-spartan)',
                  fontSize: '13px',
                  padding: '12px 14px',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-enunas-gray-medium hover:text-enunas-black transition-colors duration-150"
                aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p
              className="text-enunas-error"
              style={{
                fontFamily: 'var(--font-league-spartan)',
                fontSize: '11px',
                letterSpacing: '0.05em',
              }}
            >
              {error}
            </p>
          )}

          {needsVerification && (
            <Link
              href={`/dashboard/verify?email=${encodeURIComponent(email.trim())}`}
              style={{
                fontFamily: 'var(--font-league-spartan)',
                fontSize: '11px',
                letterSpacing: '0.06em',
                color: '#370E4D',
                textDecoration: 'underline',
              }}
            >
              Jetzt Code eingeben
            </Link>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full overflow-hidden mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              padding: '16px 32px',
              background: '#370E4D',
              fontFamily: 'var(--font-Cormorant-Garamond)',
              fontSize: '18px',
              fontWeight: 400,
              letterSpacing: '0.06em',
              color: 'white',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 300ms',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = '#250838' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#370E4D' }}
          >
            <span className="absolute left-1/2 -translate-x-1/2 top-[14%] w-full h-[1px] bg-white/60 transition-all duration-500 ease-out group-hover:w-[70%]" />
            <span className="relative z-10">
              {loading ? 'Wird geladen…' : 'Einloggen'}
            </span>
            <span className="absolute left-1/2 -translate-x-1/2 bottom-[14%] w-full h-[1px] bg-white/60 transition-all duration-500 ease-out group-hover:w-[70%]" />
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link
            href="/dashboard/register"
            style={{
              fontFamily: 'var(--font-league-spartan)',
              fontSize: '11px',
              color: '#9B9B9B',
              letterSpacing: '0.06em',
            }}
          >
            Noch kein Konto?{' '}
            <span style={{ color: '#370E4D', textDecoration: 'underline' }}>Als Brand Partner bewerben</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 2l12 12M6.5 6.6A2 2 0 0 0 9.4 9.5M5.2 4.3C3.5 5.2 2 7 2 7s2 4 6 4c1.2 0 2.3-.4 3.2-.9M10.8 9.8C12.4 8.8 14 7 14 7s-2-4-6-4c-.4 0-.8 0-1.2.1" />
    </svg>
  )
}
