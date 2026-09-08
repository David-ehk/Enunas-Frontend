'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authApi, customerApi, FetchError } from '@/lib/api'
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

// Typed-confirmation phrase for the irreversible DSGVO erasure below.
const DELETE_PHRASE = 'LÖSCHEN'

export default function Einstellungen() {
  const { user, customer: authCustomer, refreshUser, logout, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Populate form once auth context has the customer data
  useEffect(() => {
    if (authCustomer) {
      // Syncs the customer record from auth context into the editable fields.
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  // Backend endpoint (POST /auth/password via authApi.changePassword) already existed and
  // worked — only the UI was missing; this replaces the old "coming soon" placeholder.
  async function handleChangePassword() {
    setPasswordError(null)
    if (newPassword.length < 8) {
      setPasswordError('Das neue Passwort muss mindestens 8 Zeichen lang sein.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Die Passwörter stimmen nicht überein.')
      return
    }
    setPasswordSaving(true)
    try {
      await authApi.changePassword({ currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordSaved(true)
      setTimeout(() => setPasswordSaved(false), 3000)
    } catch (err) {
      setPasswordError(
        err instanceof FetchError ? err.message : 'Passwort konnte nicht geändert werden. Bitte versuche es erneut.'
      )
    } finally {
      setPasswordSaving(false)
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm.trim().toUpperCase() !== DELETE_PHRASE) return
    setDeleteError(null)
    setDeleting(true)
    try {
      await customerApi.deleteMe()
      // 204: the token is dead server-side from this moment. Clear the local session before
      // anything else can fire an authenticated request against a tombstoned identity.
      logout()
      router.push('/')
    } catch (err) {
      // A 409 message is customer-facing German from the backend — show it as-is.
      setDeleteError(
        err instanceof FetchError ? err.message : 'Konto konnte nicht gelöscht werden. Bitte versuche es erneut.'
      )
      setDeleting(false)
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

      {/* Password */}
      <div className="mb-14">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-cormorant text-2xl font-normal text-enunas-black">Passwort ändern</h2>
          {passwordSaved && (
            <span className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-success">
              Gespeichert ✓
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="sm:col-span-2">
            <Field
              label="Aktuelles Passwort"
              value={currentPassword}
              onChange={setCurrentPassword}
              type="password"
            />
          </div>
          <Field
            label="Neues Passwort"
            value={newPassword}
            onChange={setNewPassword}
            type="password"
            placeholder="Mind. 8 Zeichen"
          />
          <Field
            label="Neues Passwort bestätigen"
            value={confirmPassword}
            onChange={setConfirmPassword}
            type="password"
          />
        </div>

        {passwordError && (
          <p className="font-league-spartan text-xs text-enunas-error mb-4">{passwordError}</p>
        )}

        <AccountButton
          onClick={handleChangePassword}
          disabled={passwordSaving || !currentPassword || !newPassword || !confirmPassword}
        >
          {passwordSaving ? 'Wird geändert …' : 'Passwort ändern'}
        </AccountButton>
      </div>

      {/* Divider */}
      <div className="border-t border-enunas-gray-light mb-14" />

      {/* Danger zone — DSGVO Art. 17 erasure. Two steps and a typed phrase: a single click is
          not an adequate gate for an irreversible action. */}
      <div>
        <h2 className="font-cormorant text-2xl font-normal text-enunas-black mb-2">Konto löschen</h2>
        <p className="font-league-spartan text-sm text-enunas-gray-medium leading-relaxed mb-2">
          Das Löschen deines Kontos ist endgültig. Dein Profil, deine gespeicherten Adressen und
          verknüpfte Anmeldedienste werden unwiderruflich gelöscht.
        </p>
        <p className="font-league-spartan text-sm text-enunas-gray-medium leading-relaxed mb-6">
          Deine Bestellhistorie bewahren wir aufgrund der gesetzlichen Aufbewahrungspflicht
          (§ 257 HGB) zehn Jahre auf. Solange noch Bestellungen offen sind, ist die Löschung
          nicht möglich.
        </p>

        {!deleteOpen ? (
          <AccountButton variant="danger" onClick={() => setDeleteOpen(true)}>
            Konto löschen
          </AccountButton>
        ) : (
          <div className="border border-enunas-error/40 p-6 max-w-md">
            <p className="font-league-spartan text-sm text-enunas-black leading-relaxed mb-4">
              Gib <span className="font-semibold tracking-[0.1em]">{DELETE_PHRASE}</span> ein, um
              die endgültige Löschung zu bestätigen.
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={DELETE_PHRASE}
              aria-label={`Zum Bestätigen ${DELETE_PHRASE} eingeben`}
              className="w-full border border-enunas-gray-light px-4 py-3 mb-4 font-league-spartan text-sm text-enunas-black bg-white focus:outline-none focus:border-enunas-error transition-colors duration-200 placeholder:text-enunas-gray-medium/50"
            />
            {deleteError && (
              <p className="font-league-spartan text-sm text-enunas-error leading-relaxed mb-4">
                {deleteError}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4">
              <AccountButton
                variant="danger"
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirm.trim().toUpperCase() !== DELETE_PHRASE}
                className="disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleting ? 'Wird gelöscht …' : 'Endgültig löschen'}
              </AccountButton>
              <button
                onClick={() => { setDeleteOpen(false); setDeleteConfirm(''); setDeleteError(null) }}
                className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-gray-medium hover:text-enunas-black transition-colors duration-300"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
