'use client'

import { useState } from 'react'
import Link from 'next/link'
import { brandApi } from '@/lib/api/modules/brandApi'
import { FetchError } from '@/lib/api'

const COUNTRIES = [
  { code: 'DE', name: 'Deutschland' },
  { code: 'AT', name: 'Österreich' },
  { code: 'CH', name: 'Schweiz' },
  { code: 'FR', name: 'Frankreich' },
  { code: 'IT', name: 'Italien' },
  { code: 'ES', name: 'Spanien' },
  { code: 'NL', name: 'Niederlande' },
  { code: 'BE', name: 'Belgien' },
  { code: 'LU', name: 'Luxemburg' },
  { code: 'PL', name: 'Polen' },
  { code: 'CZ', name: 'Tschechien' },
  { code: 'HU', name: 'Ungarn' },
  { code: 'RO', name: 'Rumänien' },
  { code: 'SE', name: 'Schweden' },
  { code: 'DK', name: 'Dänemark' },
  { code: 'FI', name: 'Finnland' },
  { code: 'NO', name: 'Norwegen' },
  { code: 'PT', name: 'Portugal' },
  { code: 'GR', name: 'Griechenland' },
  { code: 'GB', name: 'Vereinigtes Königreich' },
  { code: 'US', name: 'Vereinigte Staaten' },
  { code: 'CA', name: 'Kanada' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
  { code: 'AU', name: 'Australien' },
]

interface FormState {
  email: string
  password: string
  firstName: string
  lastName: string
  brandName: string
  legalName: string
  addressStreet: string
  addressPostalCode: string
  addressCity: string
  addressCountry: string
  vatId: string
  taxNumber: string
}

export default function RegisterPage() {
  const [phase, setPhase] = useState<'form' | 'success'>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<FormState>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    brandName: '',
    legalName: '',
    addressStreet: '',
    addressPostalCode: '',
    addressCity: '',
    addressCountry: 'DE',
    vatId: '',
    taxNumber: '',
  })

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await brandApi.apply({
        email: form.email.trim(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        brandName: form.brandName.trim(),
        legalName: form.legalName.trim(),
        addressStreet: form.addressStreet.trim(),
        addressPostalCode: form.addressPostalCode.trim(),
        addressCity: form.addressCity.trim(),
        addressCountry: form.addressCountry,
        ...(form.vatId.trim() ? { vatId: form.vatId.trim() } : {}),
        ...(form.taxNumber.trim() ? { taxNumber: form.taxNumber.trim() } : {}),
      })
      setPhase('success')
    } catch (err: unknown) {
      if (err instanceof FetchError) {
        setError(err.message || 'Bewerbung fehlgeschlagen. Bitte prüfen Sie Ihre Angaben.')
      } else {
        setError('Unbekannter Fehler. Bitte erneut versuchen.')
      }
    } finally {
      setLoading(false)
    }
  }

  const sectionLabel: React.CSSProperties = {
    fontFamily: 'var(--font-league-spartan)',
    fontSize: 9,
    letterSpacing: '0.26em',
    textTransform: 'uppercase',
    color: '#9B9B9B',
    marginBottom: 12,
  }
  const fieldLabel: React.CSSProperties = {
    fontFamily: 'var(--font-league-spartan)',
    fontSize: 9,
    letterSpacing: '0.3em',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: 6,
    color: '#2D2D2D',
  }
  const inputBase = 'w-full border border-[#E8E8E8] bg-white text-[#0A0A0A] focus:outline-none focus:border-[#370E4D] transition-colors duration-200'
  const inputStyle: React.CSSProperties = {
    fontFamily: 'var(--font-league-spartan)',
    fontSize: 13,
    padding: '10px 12px',
  }

  if (phase === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#F5F5F0' }}>
        <div className="w-full max-w-[440px] bg-white px-10 py-12 text-center" style={{ boxShadow: '0 2px 24px rgba(0,0,0,0.06)' }}>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 36, fontWeight: 300, letterSpacing: '0.05em', color: '#0A0A0A', lineHeight: 1 }}>
            Enunas
          </h1>
          <p style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 9, letterSpacing: '0.4em', textTransform: 'uppercase', color: '#6B6B6B', marginTop: 6 }}>
            Brand Portal
          </p>
          <div className="h-px bg-[#E8E8E8] my-8" />
          <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(55,14,77,0.08)' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#370E4D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="3,9 7,13 15,5" />
            </svg>
          </div>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 26, fontWeight: 300, color: '#0A0A0A', marginBottom: 10 }}>
            Bewerbung eingegangen
          </h2>
          <p style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 12, color: '#6B6B6B', lineHeight: 1.65, marginBottom: 24 }}>
            Bitte prüfen Sie Ihr E-Mail-Postfach und bestätigen Sie Ihre Adresse. Nach der Prüfung durch unser Team erhalten Sie Zugang zum Brand Portal.
          </p>
          <Link
            href="/dashboard/login"
            style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 11, letterSpacing: '0.08em', color: '#370E4D', textDecoration: 'underline' }}
          >
            Zum Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12" style={{ background: '#F5F5F0' }}>
      <div className="w-full max-w-[520px] bg-white px-10 py-10" style={{ boxShadow: '0 2px 24px rgba(0,0,0,0.06)' }}>
        <div className="text-center mb-8">
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 36, fontWeight: 300, letterSpacing: '0.05em', color: '#0A0A0A', lineHeight: 1 }}>
            Enunas
          </h1>
          <p style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 9, letterSpacing: '0.4em', textTransform: 'uppercase', color: '#6B6B6B', marginTop: 6 }}>
            Als Brand Partner bewerben
          </p>
        </div>
        <div className="h-px bg-[#E8E8E8] mb-8" />

        <form onSubmit={handleSubmit} noValidate className="space-y-7">

          {/* Zugangsdaten */}
          <div>
            <p style={sectionLabel}>Zugangsdaten</p>
            <div className="space-y-3">
              <div>
                <label style={fieldLabel}>E-Mail</label>
                <input type="email" required autoComplete="email" value={form.email} onChange={set('email')} className={inputBase} style={inputStyle} />
              </div>
              <div>
                <label style={fieldLabel}>Passwort</label>
                <input type="password" required autoComplete="new-password" minLength={8} value={form.password} onChange={set('password')} className={inputBase} style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Kontaktperson */}
          <div>
            <p style={sectionLabel}>Kontaktperson</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={fieldLabel}>Vorname</label>
                <input type="text" required autoComplete="given-name" value={form.firstName} onChange={set('firstName')} className={inputBase} style={inputStyle} />
              </div>
              <div>
                <label style={fieldLabel}>Nachname</label>
                <input type="text" required autoComplete="family-name" value={form.lastName} onChange={set('lastName')} className={inputBase} style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Marke */}
          <div>
            <p style={sectionLabel}>Marke</p>
            <div className="space-y-3">
              <div>
                <label style={fieldLabel}>Markenname</label>
                <input type="text" required value={form.brandName} onChange={set('brandName')} className={inputBase} style={inputStyle} />
              </div>
              <div>
                <label style={fieldLabel}>Firmenbezeichnung (Rechtsform)</label>
                <input
                  type="text"
                  required
                  value={form.legalName}
                  onChange={set('legalName')}
                  className={inputBase}
                  style={inputStyle}
                  placeholder="z. B. Muster GmbH"
                />
              </div>
            </div>
          </div>

          {/* Anschrift */}
          <div>
            <p style={sectionLabel}>Anschrift</p>
            <div className="space-y-3">
              <div>
                <label style={fieldLabel}>Straße und Hausnummer</label>
                <input type="text" required autoComplete="street-address" value={form.addressStreet} onChange={set('addressStreet')} className={inputBase} style={inputStyle} />
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-3">
                <div>
                  <label style={fieldLabel}>PLZ</label>
                  <input type="text" required autoComplete="postal-code" value={form.addressPostalCode} onChange={set('addressPostalCode')} className={inputBase} style={inputStyle} />
                </div>
                <div>
                  <label style={fieldLabel}>Ort</label>
                  <input type="text" required autoComplete="address-level2" value={form.addressCity} onChange={set('addressCity')} className={inputBase} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={fieldLabel}>Land</label>
                <select required value={form.addressCountry} onChange={set('addressCountry')} className={inputBase} style={{ ...inputStyle, cursor: 'pointer' }}>
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Steuer (optional) */}
          <div>
            <p style={sectionLabel}>Steuer <span style={{ textTransform: 'none', fontSize: 10, letterSpacing: '0.04em', color: '#C0C0BC' }}>(optional)</span></p>
            <div className="space-y-3">
              <div>
                <label style={fieldLabel}>
                  USt-IdNr.{' '}
                  <span style={{ textTransform: 'none', fontSize: 10, letterSpacing: '0.04em', color: '#6B6B6B' }}>
                    — für Provisionsabrechnung &amp; Compliance erforderlich
                  </span>
                </label>
                <input type="text" value={form.vatId} onChange={set('vatId')} className={inputBase} style={inputStyle} placeholder="DE123456789" />
              </div>
              <div>
                <label style={fieldLabel}>Steuernummer</label>
                <input type="text" value={form.taxNumber} onChange={set('taxNumber')} className={inputBase} style={inputStyle} />
              </div>
            </div>
          </div>

          {error && (
            <p style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 11, color: '#8B1E3F', letterSpacing: '0.04em' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              padding: '15px 32px',
              background: '#370E4D',
              fontFamily: 'var(--font-cormorant)',
              fontSize: 18,
              fontWeight: 400,
              letterSpacing: '0.06em',
              color: 'white',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 300ms',
            }}
            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#250838' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#370E4D' }}
          >
            {loading ? 'Wird gesendet…' : 'Bewerbung einreichen'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/dashboard/login"
            style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 11, color: '#9B9B9B', letterSpacing: '0.06em' }}
          >
            Bereits registriert?{' '}
            <span style={{ color: '#370E4D', textDecoration: 'underline' }}>Hier einloggen</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
