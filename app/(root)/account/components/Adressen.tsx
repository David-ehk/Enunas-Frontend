'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Address } from '@/lib/account'
import AccountButton from './AccountButton'

interface AddressFormState {
  label: string
  firstName: string
  lastName: string
  street: string
  houseNumber: string
  zip: string
  city: string
  country: string
}

const EMPTY_FORM: AddressFormState = {
  label: '', firstName: '', lastName: '',
  street: '', houseNumber: '', zip: '', city: '', country: 'Deutschland',
}

function Field({ label, value, onChange, placeholder, className }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-gray-medium">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border border-enunas-gray-light px-4 py-3 font-league-spartan text-sm text-enunas-black bg-white focus:outline-none focus:border-enunas-purple transition-colors duration-200 placeholder:text-enunas-gray-medium/50"
      />
    </div>
  )
}

function AddressCard({ address, onDelete, onSetDefault }: {
  address: Address;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}) {
  return (
    <div className={cn('border p-6 relative', address.isDefault ? 'border-enunas-purple' : 'border-enunas-gray-light')}>
      {address.isDefault && (
        <span className="absolute top-4 right-4 font-league-spartan text-[10px] tracking-[0.2em] uppercase text-enunas-purple border border-enunas-purple px-2 py-1">
          Standard
        </span>
      )}
      <p className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-gray-medium mb-3">{address.label}</p>
      <p className="font-league-spartan text-sm text-enunas-black leading-relaxed">
        {address.firstName} {address.lastName}<br />
        {address.street} {address.houseNumber}<br />
        {address.zip} {address.city}<br />
        {address.country}
      </p>
      <div className="flex gap-5 mt-5">
        {!address.isDefault && (
          <button
            onClick={() => onSetDefault(address.id)}
            className="font-league-spartan text-[11px] tracking-[0.18em] uppercase text-enunas-gray-medium hover:text-enunas-purple transition-colors duration-200"
          >
            Als Standard
          </button>
        )}
        <button
          onClick={() => onDelete(address.id)}
          className="font-league-spartan text-[11px] tracking-[0.18em] uppercase text-enunas-error hover:opacity-70 transition-opacity duration-200"
        >
          Löschen
        </button>
      </div>
    </div>
  )
}

export default function Adressen() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<AddressFormState>(EMPTY_FORM)

  function handleDelete(id: string) {
    setAddresses((prev) => prev.filter((a) => a.id !== id))
  }

  function handleSetDefault(id: string) {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })))
  }

  function handleSave() {
    if (!form.firstName || !form.street || !form.zip || !form.city) return
    const newAddr: Address = {
      id: `addr-${Date.now()}`,
      ...form,
      isDefault: addresses.length === 0,
    }
    setAddresses((prev) => [...prev, newAddr])
    setForm(EMPTY_FORM)
    setShowForm(false)
  }

  const set = (key: keyof AddressFormState) => (val: string) => setForm((f) => ({ ...f, [key]: val }))

  return (
    <section>
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-cormorant text-2xl md:text-[28px] font-normal text-enunas-black">
          Meine Adressen
        </h2>
      </div>
      <p className="font-league-spartan text-xs text-enunas-gray-medium mb-8 leading-relaxed">
        Adressen werden derzeit nicht serverseitig gespeichert. Diese Funktion steht in Kürze zur Verfügung.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {addresses.map((addr) => (
          <AddressCard key={addr.id} address={addr} onDelete={handleDelete} onSetDefault={handleSetDefault} />
        ))}
      </div>

      {!showForm ? (
        <AccountButton onClick={() => setShowForm(true)}>
          + Neue Adresse hinzufügen
        </AccountButton>
      ) : (
        <div className="border border-enunas-gray-light p-6">
          <h3 className="font-cormorant text-xl text-enunas-black mb-6">Neue Adresse</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Field label="Bezeichnung (z.B. Zuhause)" value={form.label} onChange={set('label')} placeholder="Zuhause" />
            <div /> {/* spacer */}
            <Field label="Vorname" value={form.firstName} onChange={set('firstName')} />
            <Field label="Nachname" value={form.lastName} onChange={set('lastName')} />
            <Field label="Straße" value={form.street} onChange={set('street')} className="sm:col-span-1" />
            <Field label="Hausnummer" value={form.houseNumber} onChange={set('houseNumber')} />
            <Field label="Postleitzahl" value={form.zip} onChange={set('zip')} />
            <Field label="Stadt" value={form.city} onChange={set('city')} />
            <Field label="Land" value={form.country} onChange={set('country')} className="sm:col-span-2" />
          </div>
          <div className="flex items-center gap-6">
            <AccountButton onClick={handleSave}>Speichern</AccountButton>
            <button
              onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }}
              className="font-league-spartan text-xs tracking-[0.2em] uppercase text-enunas-gray-medium hover:text-enunas-black transition-colors duration-300"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
