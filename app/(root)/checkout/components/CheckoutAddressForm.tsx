'use client'

import { useState } from 'react'
import AddressAutocomplete from './AddressAutocomplete'
import {
  AddressFormValues,
  EMPTY_ADDRESS_FORM,
  validateAddressForm,
  type AddressFormErrors,
} from '@/lib/address'

interface CheckoutAddressFormProps {
  mode: 'new' | 'edit'
  initialValues?: Partial<AddressFormValues>
  submitLabel: string
  onSubmit: (values: AddressFormValues, saveToBook: boolean) => void | Promise<void>
  onCancel?: () => void
  submitting?: boolean
  serverError?: string | null
}

const inputClass =
  'w-full border border-enunas-gray-light px-4 py-3 font-league-spartan text-sm text-enunas-black bg-white focus:outline-none focus:border-enunas-purple transition-colors duration-200 disabled:bg-enunas-off-white disabled:text-enunas-gray-medium'
const errorClass = 'border-enunas-error'
const labelClass = 'font-league-spartan text-[11px] tracking-[0.15em] uppercase text-enunas-gray-medium mb-1.5 block'
const fieldErrorClass = 'font-league-spartan text-[11px] text-enunas-error mt-1'

export default function CheckoutAddressForm({
  mode,
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
  submitting = false,
  serverError,
}: CheckoutAddressFormProps) {
  const [values, setValues] = useState<AddressFormValues>({ ...EMPTY_ADDRESS_FORM, ...initialValues })
  const [touched, setTouched] = useState<Partial<Record<keyof AddressFormValues, boolean>>>({})
  const [saveToBook, setSaveToBook] = useState(true)

  const errors: AddressFormErrors = validateAddressForm(values)

  function set<K extends keyof AddressFormValues>(field: K) {
    return (value: AddressFormValues[K]) => setValues((prev) => ({ ...prev, [field]: value }))
  }

  function markTouched(field: keyof AddressFormValues) {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  function fieldError(field: keyof AddressFormValues): string | undefined {
    return touched[field] ? errors[field] : undefined
  }

  async function submit() {
    setTouched({
      firstName: true, lastName: true, street: true, houseNumber: true,
      addressLine2: true, postalCode: true, city: true, country: true, phone: true,
    })
    if (Object.keys(errors).length > 0) return
    await onSubmit(values, mode === 'new' ? saveToBook : true)
  }

  // Deliberately not a <form>: every usage (new address, editing a saved one) renders inline
  // inside the outer checkout <form> (SavedAddressSelector), so a nested <form> here would be
  // invalid HTML. Enter-to-submit is preserved manually below instead.
  function handleContainerKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    // AddressAutocomplete calls preventDefault() itself when Enter selects a suggestion —
    // e.defaultPrevented lets that case fall through without also submitting the form.
    if (e.key !== 'Enter' || e.defaultPrevented) return
    e.preventDefault()
    void submit()
  }

  return (
    <div onKeyDown={handleContainerKeyDown} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="af-firstName">Vorname</label>
          <input
            id="af-firstName"
            type="text"
            name="firstName"
            autoComplete="given-name"
            value={values.firstName}
            onChange={(e) => set('firstName')(e.target.value)}
            onBlur={() => markTouched('firstName')}
            required
            maxLength={100}
            aria-invalid={!!fieldError('firstName')}
            className={`${inputClass} ${fieldError('firstName') ? errorClass : ''}`}
          />
          {fieldError('firstName') && <p className={fieldErrorClass}>{fieldError('firstName')}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="af-lastName">Nachname</label>
          <input
            id="af-lastName"
            type="text"
            name="lastName"
            autoComplete="family-name"
            value={values.lastName}
            onChange={(e) => set('lastName')(e.target.value)}
            onBlur={() => markTouched('lastName')}
            required
            maxLength={100}
            aria-invalid={!!fieldError('lastName')}
            className={`${inputClass} ${fieldError('lastName') ? errorClass : ''}`}
          />
          {fieldError('lastName') && <p className={fieldErrorClass}>{fieldError('lastName')}</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className={labelClass} htmlFor="af-street">Straße</label>
          <AddressAutocomplete
            id="af-street"
            name="street"
            autoComplete="address-line1"
            value={values.street}
            onChange={set('street')}
            onSelect={(sel) => {
              setValues((prev) => ({
                ...prev,
                street: sel.street ?? prev.street,
                houseNumber: sel.houseNumber ?? prev.houseNumber,
                postalCode: sel.postalCode ?? prev.postalCode,
                city: sel.city ?? prev.city,
              }))
            }}
            required
            aria-invalid={!!fieldError('street')}
            className={`${inputClass} ${fieldError('street') ? errorClass : ''}`}
          />
          {fieldError('street') && <p className={fieldErrorClass}>{fieldError('street')}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="af-houseNumber">Hausnummer</label>
          <input
            id="af-houseNumber"
            name="houseNumber"
            type="text"
            value={values.houseNumber}
            onChange={(e) => set('houseNumber')(e.target.value)}
            onBlur={() => markTouched('houseNumber')}
            required
            maxLength={16}
            aria-invalid={!!fieldError('houseNumber')}
            className={`${inputClass} ${fieldError('houseNumber') ? errorClass : ''}`}
          />
          {fieldError('houseNumber') && <p className={fieldErrorClass}>{fieldError('houseNumber')}</p>}
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="af-line2">Adresszusatz (optional)</label>
        <input
          id="af-line2"
          name="addressLine2"
          type="text"
          autoComplete="address-line2"
          value={values.addressLine2}
          onChange={(e) => set('addressLine2')(e.target.value)}
          onBlur={() => markTouched('addressLine2')}
          maxLength={255}
          placeholder="Etage, Wohnung, etc."
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-5 gap-3">
        <div className="col-span-2">
          <label className={labelClass} htmlFor="af-postalCode">PLZ</label>
          <input
            id="af-postalCode"
            name="postalCode"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            value={values.postalCode}
            onChange={(e) => set('postalCode')(e.target.value)}
            onBlur={() => markTouched('postalCode')}
            required
            maxLength={16}
            aria-invalid={!!fieldError('postalCode')}
            className={`${inputClass} ${fieldError('postalCode') ? errorClass : ''}`}
          />
          {fieldError('postalCode') && <p className={fieldErrorClass}>{fieldError('postalCode')}</p>}
        </div>
        <div className="col-span-3">
          <label className={labelClass} htmlFor="af-city">Stadt</label>
          <input
            id="af-city"
            name="city"
            type="text"
            autoComplete="address-level2"
            value={values.city}
            onChange={(e) => set('city')(e.target.value)}
            onBlur={() => markTouched('city')}
            required
            maxLength={128}
            aria-invalid={!!fieldError('city')}
            className={`${inputClass} ${fieldError('city') ? errorClass : ''}`}
          />
          {fieldError('city') && <p className={fieldErrorClass}>{fieldError('city')}</p>}
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="af-country">Land</label>
        <select
          id="af-country"
          name="country"
          autoComplete="country"
          value="DE"
          disabled
          className={inputClass}
        >
          <option value="DE">Deutschland</option>
        </select>
        <p className="font-league-spartan text-[11px] text-enunas-gray-medium mt-1">
          Aktuell liefern wir ausschließlich innerhalb Deutschlands.
          <br />
          Orders are currently only possible within Germany.
        </p>
      </div>

      {mode === 'new' && (
        <div>
          <label className={labelClass} htmlFor="af-phone">Telefonnummer (optional)</label>
          <input
            id="af-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(e) => set('phone')(e.target.value)}
            onBlur={() => markTouched('phone')}
            maxLength={30}
            placeholder="Für Rückfragen der Zustellung"
            aria-invalid={!!fieldError('phone')}
            className={`${inputClass} ${fieldError('phone') ? errorClass : ''}`}
          />
          {fieldError('phone') && <p className={fieldErrorClass}>{fieldError('phone')}</p>}
        </div>
      )}

      {mode === 'new' && (
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            name="saveToBook"
            checked={saveToBook}
            onChange={(e) => setSaveToBook(e.target.checked)}
            className="w-4 h-4 accent-enunas-purple"
          />
          <span className="font-league-spartan text-xs text-enunas-gray-dark">
            Diese Adresse für zukünftige Bestellungen speichern
          </span>
        </label>
      )}

      {serverError && (
        <p className="font-league-spartan text-xs text-enunas-error">{serverError}</p>
      )}

      <div className="flex items-center gap-6 pt-2">
        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="group relative overflow-hidden bg-enunas-purple text-white px-8 py-3 hover:bg-enunas-purple-dark transition-colors duration-300 ease-out-expo disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span className="absolute left-1/2 -translate-x-1/2 top-[14%] w-full h-[1px] bg-white/60 transition-all duration-500 ease-out group-hover:w-[70%]" />
          <span className="relative z-10 font-cormorant text-[16px] tracking-[0.06em]">
            {submitting ? 'Bitte warten…' : submitLabel}
          </span>
          <span className="absolute left-1/2 -translate-x-1/2 bottom-[14%] w-full h-[1px] bg-white/60 transition-all duration-500 ease-out group-hover:w-[70%]" />
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="font-league-spartan text-xs tracking-[0.15em] uppercase text-enunas-gray-medium hover:text-enunas-black transition-colors duration-200"
          >
            Abbrechen
          </button>
        )}
      </div>
    </div>
  )
}
