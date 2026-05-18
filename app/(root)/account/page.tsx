'use client'

import React, { useState } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import { authApi, orderApi, customerApi, FetchError } from '@/lib/api'
import type { ApiOrder, ApiCustomer } from '@/types/api'
import { useEffect } from 'react'

// ── Spinner ───────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-enunas-gray-light border-t-enunas-purple rounded-full animate-spin" />
    </div>
  )
}

// ── Auth Forms ────────────────────────────────────────────────────────────────

function AuthView() {
  const { refreshUser } = useAuth()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register fields
  const [regFirstName, setRegFirstName] = useState('')
  const [regLastName, setRegLastName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regRole, setRegRole] = useState<'CUSTOMER' | 'BRAND_PARTNER'>('CUSTOMER')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await authApi.login({ email: loginEmail, password: loginPassword })
      await refreshUser()
    } catch (err) {
      setError(err instanceof FetchError ? err.message : 'Anmeldung fehlgeschlagen.')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await authApi.signup({
        email: regEmail,
        password: regPassword,
        firstName: regFirstName,
        lastName: regLastName,
        role: regRole,
      })
      await refreshUser()
    } catch (err) {
      setError(err instanceof FetchError ? err.message : 'Registrierung fehlgeschlagen.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full border border-enunas-gray-light px-4 py-3 font-league-spartan text-sm text-enunas-black bg-white focus:outline-none focus:border-enunas-purple transition-colors duration-200'

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1
          className="text-3xl text-center text-enunas-black mb-2"
          style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
        >
          Mein Konto
        </h1>
        <p className="text-center font-league-spartan text-xs text-enunas-gray-medium tracking-[0.1em] uppercase mb-8">
          {tab === 'login' ? 'Willkommen zurück' : 'Neues Konto erstellen'}
        </p>

        {/* Tab switcher */}
        <div className="flex border-b border-enunas-gray-light mb-8">
          {(['login', 'register'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(null) }}
              className={`flex-1 pb-3 font-league-spartan text-xs uppercase tracking-[0.1em] transition-colors duration-200 ${
                tab === t
                  ? 'border-b-2 border-enunas-purple text-enunas-purple'
                  : 'text-enunas-gray-medium'
              }`}
            >
              {t === 'login' ? 'Anmelden' : 'Registrieren'}
            </button>
          ))}
        </div>

        {error && (
          <p className="font-league-spartan text-xs text-enunas-error mb-4 text-center">
            {error}
          </p>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="E-Mail-Adresse"
              value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)}
              required
              className={inputClass}
            />
            <input
              type="password"
              placeholder="Passwort"
              value={loginPassword}
              onChange={e => setLoginPassword(e.target.value)}
              required
              className={inputClass}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-enunas-purple text-white font-league-spartan text-sm tracking-[0.15em] uppercase hover:bg-enunas-purple-light transition-colors duration-200 disabled:opacity-60"
            >
              {loading ? 'Bitte warten...' : 'Anmelden'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Vorname"
                value={regFirstName}
                onChange={e => setRegFirstName(e.target.value)}
                required
                className={inputClass}
              />
              <input
                type="text"
                placeholder="Nachname"
                value={regLastName}
                onChange={e => setRegLastName(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <input
              type="email"
              placeholder="E-Mail-Adresse"
              value={regEmail}
              onChange={e => setRegEmail(e.target.value)}
              required
              className={inputClass}
            />
            <input
              type="password"
              placeholder="Passwort"
              value={regPassword}
              onChange={e => setRegPassword(e.target.value)}
              required
              className={inputClass}
            />
            <div>
              <p className="font-league-spartan text-[10px] uppercase tracking-[0.1em] text-enunas-gray-medium mb-2">
                Kontotyp
              </p>
              <div className="flex gap-4">
                {(['CUSTOMER', 'BRAND_PARTNER'] as const).map(r => (
                  <label
                    key={r}
                    className="flex items-center gap-2 cursor-pointer font-league-spartan text-xs text-enunas-black"
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r}
                      checked={regRole === r}
                      onChange={() => setRegRole(r)}
                      className="accent-enunas-purple"
                    />
                    {r === 'CUSTOMER' ? 'Kunde' : 'Markenpartner'}
                  </label>
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-enunas-purple text-white font-league-spartan text-sm tracking-[0.15em] uppercase hover:bg-enunas-purple-light transition-colors duration-200 disabled:opacity-60"
            >
              {loading ? 'Bitte warten...' : 'Registrieren'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// ── Profile View ──────────────────────────────────────────────────────────────

function ProfileView() {
  const { user, customer, logout } = useAuth()
  const [orders, setOrders] = useState<ApiOrder[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [profile, setProfile] = useState<ApiCustomer | null>(customer)
  const [editMode, setEditMode] = useState(false)
  const [firstName, setFirstName] = useState(customer?.firstName ?? '')
  const [lastName, setLastName] = useState(customer?.lastName ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user?.role === 'CUSTOMER') {
      orderApi.getMy()
        .then(setOrders)
        .catch(() => setOrders([]))
        .finally(() => setOrdersLoading(false))
    } else {
      setOrdersLoading(false)
    }
  }, [user])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await customerApi.updateCustomerProfile({ firstName, lastName })
      setProfile(updated)
      setEditMode(false)
    } catch {
      // silently fail — user can retry
    } finally {
      setSaving(false)
    }
  }

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : user?.email ?? ''

  return (
    <div className="min-h-[70vh] max-w-2xl mx-auto px-4 py-16">
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1
            className="text-3xl text-enunas-black mb-1"
            style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
          >
            {displayName}
          </h1>
          <p className="font-league-spartan text-xs text-enunas-gray-medium tracking-[0.1em] uppercase">
            {user?.email}
          </p>
        </div>
        <button
          onClick={logout}
          className="font-league-spartan text-xs uppercase tracking-[0.1em] text-enunas-gray-medium hover:text-enunas-error transition-colors duration-200"
        >
          Abmelden
        </button>
      </div>

      {/* Profile edit */}
      {user?.role === 'CUSTOMER' && (
        <section className="mb-10 border border-enunas-gray-light p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-league-spartan text-xs uppercase tracking-[0.15em] text-enunas-gray-medium">
              Profil
            </h2>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="font-league-spartan text-xs uppercase tracking-[0.1em] text-enunas-purple hover:underline"
              >
                Bearbeiten
              </button>
            )}
          </div>
          {editMode ? (
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Vorname"
                  className="border border-enunas-gray-light px-3 py-2 font-league-spartan text-sm text-enunas-black focus:outline-none focus:border-enunas-purple"
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Nachname"
                  className="border border-enunas-gray-light px-3 py-2 font-league-spartan text-sm text-enunas-black focus:outline-none focus:border-enunas-purple"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-enunas-purple text-white font-league-spartan text-xs tracking-[0.1em] uppercase hover:bg-enunas-purple-light transition-colors duration-200 disabled:opacity-60"
                >
                  {saving ? '...' : 'Speichern'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="px-6 py-2 border border-enunas-gray-light font-league-spartan text-xs tracking-[0.1em] uppercase text-enunas-gray-medium hover:border-enunas-black transition-colors duration-200"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          ) : (
            <div className="font-league-spartan text-sm text-enunas-black space-y-1">
              <p>{profile?.firstName || '—'} {profile?.lastName || ''}</p>
            </div>
          )}
        </section>
      )}

      {/* Orders */}
      {user?.role === 'CUSTOMER' && (
        <section className="border border-enunas-gray-light p-6">
          <h2 className="font-league-spartan text-xs uppercase tracking-[0.15em] text-enunas-gray-medium mb-4">
            Bestellungen
          </h2>
          {ordersLoading ? (
            <div className="w-6 h-6 border-2 border-enunas-gray-light border-t-enunas-purple rounded-full animate-spin" />
          ) : orders.length === 0 ? (
            <p className="font-league-spartan text-sm text-enunas-gray-medium">
              Keine Bestellungen vorhanden.
            </p>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <div key={order.id} className="flex items-center justify-between border-b border-enunas-gray-light pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-league-spartan text-xs text-enunas-black uppercase tracking-[0.05em]">
                      #{order.id.slice(0, 8)}
                    </p>
                    <p className="font-league-spartan text-[10px] text-enunas-gray-medium mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-league-spartan text-xs text-enunas-black">
                      €{order.totalAmount.toFixed(2)}
                    </p>
                    <p className="font-league-spartan text-[10px] text-enunas-gray-medium uppercase tracking-[0.05em] mt-0.5">
                      {order.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AccountPage() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <Spinner />
  if (!isAuthenticated) return <AuthView />
  return <ProfileView />
}
