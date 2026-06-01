'use client'

import { useState } from 'react'
import { getMockProfile, type UserProfile } from '@/lib/account'
import AccountButton from './AccountButton'

function Field({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-gray-medium">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border border-enunas-gray-light px-4 py-3 font-league-spartan text-sm text-enunas-black bg-white focus:outline-none focus:border-enunas-purple transition-colors duration-200 placeholder:text-enunas-gray-medium/50"
      />
    </div>
  )
}

export default function Einstellungen() {
  const [profile, setProfile] = useState<UserProfile>(getMockProfile)
  const [profileSaved, setProfileSaved] = useState(false)

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwSaved, setPwSaved] = useState(false)
  const [pwError, setPwError] = useState('')

  const set = (key: keyof UserProfile) => (val: string) =>
    setProfile((p) => ({ ...p, [key]: val }))

  function handleSaveProfile() {
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 3000)
  }

  function handleChangePassword() {
    setPwError('')
    if (!currentPw || !newPw || !confirmPw) { setPwError('Bitte alle Felder ausfüllen.'); return }
    if (newPw.length < 8) { setPwError('Passwort muss mindestens 8 Zeichen haben.'); return }
    if (newPw !== confirmPw) { setPwError('Passwörter stimmen nicht überein.'); return }
    setCurrentPw(''); setNewPw(''); setConfirmPw('')
    setPwSaved(true)
    setTimeout(() => setPwSaved(false), 3000)
  }

  return (
    <section className="max-w-2xl">
      {/* Profile */}
      <div className="mb-14">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-cormorant text-2xl md:text-[28px] font-normal text-enunas-black">Profil</h2>
          {profileSaved && (
            <span className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-success">Gespeichert ✓</span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Field label="Vorname" value={profile.firstName} onChange={set('firstName')} />
          <Field label="Nachname" value={profile.lastName} onChange={set('lastName')} />
          <Field label="E-Mail" value={profile.email} onChange={set('email')} type="email" />
          <Field label="Telefon" value={profile.phone} onChange={set('phone')} type="tel" placeholder="+49 …" />
          <Field label="Geburtsdatum" value={profile.dateOfBirth} onChange={set('dateOfBirth')} type="date" />
        </div>
        <AccountButton onClick={handleSaveProfile}>Profil speichern</AccountButton>
      </div>

      {/* Divider */}
      <div className="border-t border-enunas-gray-light mb-14" />

      {/* Password */}
      <div className="mb-14">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-cormorant text-2xl font-normal text-enunas-black">Passwort ändern</h2>
          {pwSaved && (
            <span className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-success">Gespeichert ✓</span>
          )}
        </div>
        <div className="flex flex-col gap-4 mb-4">
          <Field label="Aktuelles Passwort" value={currentPw} onChange={setCurrentPw} type="password" />
          <Field label="Neues Passwort" value={newPw} onChange={setNewPw} type="password" placeholder="Mindestens 8 Zeichen" />
          <Field label="Passwort bestätigen" value={confirmPw} onChange={setConfirmPw} type="password" />
        </div>
        {pwError && (
          <p className="font-league-spartan text-xs text-enunas-error mb-4">{pwError}</p>
        )}
        <AccountButton onClick={handleChangePassword}>Passwort ändern</AccountButton>
      </div>

      {/* Divider */}
      <div className="border-t border-enunas-gray-light mb-14" />

      {/* Danger zone */}
      <div>
        <h2 className="font-cormorant text-2xl font-normal text-enunas-black mb-2">Konto löschen</h2>
        <p className="font-league-spartan text-sm text-enunas-gray-medium leading-relaxed mb-6">
          Das Löschen deines Kontos ist endgültig. Alle deine Daten, Bestellhistorie und gespeicherten Artikel werden unwiderruflich gelöscht.
        </p>
        <AccountButton variant="danger">Konto löschen</AccountButton>
      </div>
    </section>
  )
}
