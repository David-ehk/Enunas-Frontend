'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { brandApi } from '@/lib/api/modules/brandApi'
import { FetchError } from '@/lib/api'

const CODE_LENGTH = 6

const fieldLabel: React.CSSProperties = {
  fontFamily: 'var(--font-league-spartan)',
  fontSize: 9,
  letterSpacing: '0.3em',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: 6,
  color: '#2D2D2D',
}
const inputBase =
  'w-full border border-[#E8E8E8] bg-white text-[#0A0A0A] focus:outline-none focus:border-[#370E4D] transition-colors duration-200'
const inputStyle: React.CSSProperties = {
  fontFamily: 'var(--font-league-spartan)',
  fontSize: 13,
  padding: '10px 12px',
}

function Shell({ children, maxWidth = 440 }: { children: React.ReactNode; maxWidth?: number }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12" style={{ background: '#F5F5F0' }}>
      <div
        className="w-full bg-white px-10 py-12"
        style={{ maxWidth, boxShadow: '0 2px 24px rgba(0,0,0,0.06)' }}
      >
        <div className="text-center">
          <h1
            style={{
              fontFamily: 'var(--font-Cormorant-Garamond)',
              fontSize: 36,
              fontWeight: 300,
              letterSpacing: '0.05em',
              color: '#0A0A0A',
              lineHeight: 1,
            }}
          >
            Enunas
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-league-spartan)',
              fontSize: 9,
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              color: '#6B6B6B',
              marginTop: 6,
            }}
          >
            E-Mail bestätigen
          </p>
        </div>
        <div className="h-px bg-[#E8E8E8] my-8" />
        {children}
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<Shell><div style={{ height: 260 }} /></Shell>}>
      <VerifyForm />
    </Suspense>
  )
}

function VerifyForm() {
  const searchParams = useSearchParams()

  const [email, setEmail] = useState(() => searchParams.get('email') ?? '')
  const [code, setCode] = useState('')
  const [phase, setPhase] = useState<'form' | 'success'>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [resending, setResending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setNotice(null)
    setLoading(true)
    try {
      await brandApi.verify({ email: email.trim(), verificationCode: code.trim() })
      setPhase('success')
    } catch (err: unknown) {
      if (err instanceof FetchError) {
        setError(err.message || 'Bestätigung fehlgeschlagen. Bitte prüfen Sie den Code.')
      } else {
        setError('Unbekannter Fehler. Bitte erneut versuchen.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setError(null)
    setNotice(null)
    if (!email.trim()) {
      setError('Bitte geben Sie zuerst Ihre E-Mail-Adresse ein.')
      return
    }
    setResending(true)
    try {
      await brandApi.resendVerification(email.trim())
      setNotice('Ein neuer Code wurde an Ihre E-Mail-Adresse gesendet.')
    } catch (err: unknown) {
      if (err instanceof FetchError) {
        setError(err.message || 'Code konnte nicht erneut gesendet werden.')
      } else {
        setError('Unbekannter Fehler. Bitte erneut versuchen.')
      }
    } finally {
      setResending(false)
    }
  }

  if (phase === 'success') {
    return (
      <Shell>
        <div className="text-center">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(55,14,77,0.08)' }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke="#370E4D"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <polyline points="3,9 7,13 15,5" />
            </svg>
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-Cormorant-Garamond)',
              fontSize: 26,
              fontWeight: 300,
              color: '#0A0A0A',
              marginBottom: 10,
            }}
          >
            E-Mail bestätigt
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-league-spartan)',
              fontSize: 12,
              color: '#6B6B6B',
              lineHeight: 1.65,
              marginBottom: 24,
            }}
          >
            Ihre Bewerbung wird nun von unserem Team geprüft. Sobald sie freigegeben ist, erhalten Sie
            eine E-Mail und können sich im Brand Portal anmelden.
          </p>
          <Link
            href="/dashboard/login"
            style={{
              fontFamily: 'var(--font-league-spartan)',
              fontSize: 11,
              letterSpacing: '0.08em',
              color: '#370E4D',
              textDecoration: 'underline',
            }}
          >
            Zum Login
          </Link>
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <p
        style={{
          fontFamily: 'var(--font-league-spartan)',
          fontSize: 12,
          color: '#6B6B6B',
          lineHeight: 1.65,
          marginBottom: 24,
        }}
      >
        Wir haben Ihnen einen {CODE_LENGTH}-stelligen Bestätigungscode per E-Mail geschickt. Bitte geben
        Sie ihn hier ein, um Ihre Adresse zu bestätigen.
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="verify-email" style={fieldLabel}>
            E-Mail
          </label>
          <input
            id="verify-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={inputBase}
            style={inputStyle}
          />
        </div>

        <div>
          <label htmlFor="verify-code" style={fieldLabel}>
            Bestätigungscode
          </label>
          <input
            id="verify-code"
            type="text"
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={CODE_LENGTH}
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
            className={inputBase}
            style={{
              ...inputStyle,
              fontSize: 20,
              letterSpacing: '0.5em',
              textAlign: 'center',
              padding: '14px 12px',
            }}
            placeholder="000000"
          />
        </div>

        {error && (
          <p
            style={{
              fontFamily: 'var(--font-league-spartan)',
              fontSize: 11,
              color: '#8B1E3F',
              letterSpacing: '0.04em',
            }}
          >
            {error}
          </p>
        )}

        {notice && (
          <p
            style={{
              fontFamily: 'var(--font-league-spartan)',
              fontSize: 11,
              color: '#1A5A3C',
              letterSpacing: '0.04em',
            }}
          >
            {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || code.length < CODE_LENGTH}
          className="w-full disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            padding: '15px 32px',
            background: '#370E4D',
            fontFamily: 'var(--font-Cormorant-Garamond)',
            fontSize: 18,
            fontWeight: 400,
            letterSpacing: '0.06em',
            color: 'white',
            border: 'none',
            cursor: loading || code.length < CODE_LENGTH ? 'not-allowed' : 'pointer',
            transition: 'background-color 300ms',
          }}
          onMouseEnter={e => {
            if (!loading && code.length === CODE_LENGTH) {
              ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#250838'
            }
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#370E4D'
          }}
        >
          {loading ? 'Wird geprüft…' : 'Bestätigen'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            fontFamily: 'var(--font-league-spartan)',
            fontSize: 11,
            letterSpacing: '0.06em',
            color: '#370E4D',
            textDecoration: 'underline',
            background: 'none',
            border: 'none',
            cursor: resending ? 'not-allowed' : 'pointer',
          }}
        >
          {resending ? 'Wird gesendet…' : 'Code erneut senden'}
        </button>
      </div>

      <div className="mt-4 text-center">
        <Link
          href="/dashboard/login"
          style={{
            fontFamily: 'var(--font-league-spartan)',
            fontSize: 11,
            color: '#9B9B9B',
            letterSpacing: '0.06em',
          }}
        >
          Bereits bestätigt?{' '}
          <span style={{ color: '#370E4D', textDecoration: 'underline' }}>Hier einloggen</span>
        </Link>
      </div>
    </Shell>
  )
}
