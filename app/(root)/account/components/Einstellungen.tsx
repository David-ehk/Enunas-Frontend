'use client'

import { useState, useEffect } from 'react'
import { customerApi, FetchError } from '@/lib/api'
import { useAuth } from '@/app/context/AuthContext'
import AccountButton from './AccountButton'

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  readOnly = false,
}: {
  label: string
  value: string
  onChange?: (v: string) => void
  type?: string
  placeholder?: string
  readOnly?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-gray-medium">
        {label}
      </label>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        className={[
          'border border-enunas-gray-light px-4 py-3 font-league-spartan text-sm text-enunas-black bg-white',
          'focus:outline-none focus:border-enunas-purple transition-colors duration-200 placeholder:text-enunas-gray-medium/50',
          readOnly ? 'cursor-default bg-enunas-off-white text-enunas-gray-medium' : '',
        ].join(' ')}
      />
    </div>
  )
}

export default function Einstellungen() {
  const { user, customer: authCustomer, refreshUser, isLoading: authLoading } = useAuth()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  // Populate form once auth context has the customer data
  useEffect(() => {
    if (authCustomer) {
      setFirstName(authCustomer.firstName ?? '')
      setLastName(authCustomer.lastName ?? '')
    }
  }, [authCustomer])

  async function handleSaveProfile() {
    setSaveError(null)
    setSaving(true)
    try {
      await customerApi.updateProfile({ firstName, lastName })
      await refreshUser()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setSaveError(
        err instanceof FetchError ? err.message : 'Speichern fehlgeschlagen. Bitte versuche es erneut.'
      )
    } finally {
      setSaving(false)
    }
  }

  // Non-customer role guard (BRAND_PARTNER / ADMIN also log in but can't access /customer/me)
  if (!authLoading && user && user.role !== 'CUSTOMER') {
    return (
      <section className="max-w-2xl">
        <h2 className="font-cormorant text-2xl md:text-[28px] font-normal text-enunas-black mb-4">Einstellungen</h2>
        <p className="font-league-spartan text-sm text-enunas-gray-medium">
          Dieses Dashboard ist nur für Kunden zugänglich.
        </p>
      </section>
    )
  }

  return (
    <section className="max-w-2xl">

      {/* Profile */}
      <div className="mb-14">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-cormorant text-2xl md:text-[28px] font-normal text-enunas-black">Profil</h2>
          {saved && (
            <span className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-success">
              Gespeichert ✓
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Field
            label="Vorname"
            value={firstName}
            onChange={setFirstName}
          />
          <Field
            label="Nachname"
            value={lastName}
            onChange={setLastName}
          />
          <Field
            label="E-Mail"
            value={authCustomer?.email ?? user?.email ?? ''}
            type="email"
            readOnly
          />
        </div>

        {saveError && (
          <p className="font-league-spartan text-xs text-enunas-error mb-4">{saveError}</p>
        )}

        <AccountButton onClick={handleSaveProfile} disabled={saving || !authCustomer}>
          {saving ? 'Wird gespeichert …' : 'Profil speichern'}
        </AccountButton>
      </div>

      {/* Divider */}
      <div className="border-t border-enunas-gray-light mb-14" />

      {/* Password — no backend endpoint yet */}
      <div className="mb-14">
        <h2 className="font-cormorant text-2xl font-normal text-enunas-black mb-2">Passwort ändern</h2>
        <p className="font-league-spartan text-sm text-enunas-gray-medium leading-relaxed">
          Diese Funktion steht in Kürze zur Verfügung.
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-enunas-gray-light mb-14" />

      {/* Danger zone */}
      <div>
        <h2 className="font-cormorant text-2xl font-normal text-enunas-black mb-2">Konto löschen</h2>
        <p className="font-league-spartan text-sm text-enunas-gray-medium leading-relaxed mb-6">
          Das Löschen deines Kontos ist endgültig. Alle deine Daten, Bestellhistorie und
          gespeicherten Artikel werden unwiderruflich gelöscht.
        </p>
        <AccountButton variant="danger">Konto löschen</AccountButton>
      </div>
    </section>
  )
}
