'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="flex-shrink-0">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
)

export interface ShippingData {
  email: string
  fullName: string
  address: string
  plz: string
  city: string
  country: string
}

interface ShippingFormProps {
  initialData: ShippingData
  onNext: (data: ShippingData) => void
}

export default function ShippingForm({ initialData, onNext }: ShippingFormProps) {
  const [form, setForm] = useState<ShippingData>(initialData)
  const [errors, setErrors] = useState<Partial<ShippingData>>({})
  const [showLogin, setShowLogin] = useState(false)

  const validate = () => {
    const newErrors: Partial<ShippingData> = {}
    if (!form.email.trim()) newErrors.email = 'Pflichtfeld'
    if (!form.fullName.trim()) newErrors.fullName = 'Pflichtfeld'
    if (!form.address.trim()) newErrors.address = 'Pflichtfeld'
    if (!form.plz.trim()) newErrors.plz = 'Pflichtfeld'
    if (!form.city.trim()) newErrors.city = 'Pflichtfeld'
    if (!form.country.trim()) newErrors.country = 'Pflichtfeld'
    return newErrors
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    onNext(form)
  }

  const handleChange = (field: keyof ShippingData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in-up">
      <h2 className="font-cormorant text-2xl text-enunas-black mb-8">Kontakt & Lieferadresse</h2>

      {/* Kontakt section */}
      <p className="font-league-spartan text-xs uppercase tracking-[0.15em] text-enunas-gray-medium mb-4">
        Kontakt
      </p>
      <div className="space-y-4">
        {/* Google OAuth */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 py-3.5 border border-enunas-gray-light bg-white hover:bg-enunas-off-white transition-colors duration-200 ease-out-expo"
        >
          <GoogleLogo />
          <span className="font-league-spartan text-sm tracking-[0.1em] text-enunas-black">
            Mit Google fortfahren
          </span>
        </button>

        {/* oder divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-enunas-gray-light" />
          <span className="font-league-spartan text-[10px] uppercase tracking-[0.2em] text-enunas-gray-medium">oder</span>
          <div className="flex-1 h-px bg-enunas-gray-light" />
        </div>

        {/* Email */}
        <div>
          <Input
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            placeholder="E-Mail-Adresse"
            className={`
              h-12 rounded-none border-enunas-gray-light font-league-spartan text-sm
              focus-visible:ring-0 focus-visible:border-enunas-purple
              ${errors.email ? 'border-enunas-error' : ''}
            `}
          />
          {errors.email && (
            <p className="font-league-spartan text-[11px] text-enunas-error mt-1">{errors.email}</p>
          )}
        </div>

        {/* "Bereits Konto?" toggle */}
        <button
          type="button"
          onClick={() => setShowLogin(prev => !prev)}
          className="font-league-spartan text-xs text-enunas-gray-medium hover:text-enunas-black transition-colors duration-200 underline underline-offset-4"
        >
          Bereits Konto? Anmelden →
        </button>

        {showLogin && (
          <Input
            type="password"
            placeholder="Passwort"
            className="h-12 rounded-none border-enunas-gray-light font-league-spartan text-sm focus-visible:ring-0 focus-visible:border-enunas-purple"
          />
        )}
      </div>

      <Separator className="bg-enunas-gray-light my-8" />

      {/* Address fields */}
      <div className="space-y-5">
        {/* Full Name */}
        <div>
          <label className="block font-league-spartan text-xs uppercase tracking-[0.15em] text-enunas-gray-medium mb-2">
            Vollständiger Name
          </label>
          <Input
            value={form.fullName}
            onChange={handleChange('fullName')}
            placeholder="Max Mustermann"
            className={`
              h-12 rounded-none border-enunas-gray-light font-league-spartan text-sm
              focus-visible:ring-0 focus-visible:border-enunas-purple
              ${errors.fullName ? 'border-enunas-error' : ''}
            `}
          />
          {errors.fullName && (
            <p className="font-league-spartan text-[11px] text-enunas-error mt-1">{errors.fullName}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block font-league-spartan text-xs uppercase tracking-[0.15em] text-enunas-gray-medium mb-2">
            Adresse
          </label>
          <Input
            value={form.address}
            onChange={handleChange('address')}
            placeholder="Musterstraße 42"
            className={`
              h-12 rounded-none border-enunas-gray-light font-league-spartan text-sm
              focus-visible:ring-0 focus-visible:border-enunas-purple
              ${errors.address ? 'border-enunas-error' : ''}
            `}
          />
          {errors.address && (
            <p className="font-league-spartan text-[11px] text-enunas-error mt-1">{errors.address}</p>
          )}
        </div>

        {/* PLZ + City in a row */}
        <div className="grid grid-cols-[120px_1fr] gap-4">
          <div>
            <label className="block font-league-spartan text-xs uppercase tracking-[0.15em] text-enunas-gray-medium mb-2">
              PLZ
            </label>
            <Input
              value={form.plz}
              onChange={handleChange('plz')}
              placeholder="12345"
              className={`
                h-12 rounded-none border-enunas-gray-light font-league-spartan text-sm
                focus-visible:ring-0 focus-visible:border-enunas-purple
                ${errors.plz ? 'border-enunas-error' : ''}
              `}
            />
            {errors.plz && (
              <p className="font-league-spartan text-[11px] text-enunas-error mt-1">{errors.plz}</p>
            )}
          </div>
          <div>
            <label className="block font-league-spartan text-xs uppercase tracking-[0.15em] text-enunas-gray-medium mb-2">
              Stadt
            </label>
            <Input
              value={form.city}
              onChange={handleChange('city')}
              placeholder="Berlin"
              className={`
                h-12 rounded-none border-enunas-gray-light font-league-spartan text-sm
                focus-visible:ring-0 focus-visible:border-enunas-purple
                ${errors.city ? 'border-enunas-error' : ''}
              `}
            />
            {errors.city && (
              <p className="font-league-spartan text-[11px] text-enunas-error mt-1">{errors.city}</p>
            )}
          </div>
        </div>

        {/* Country */}
        <div>
          <label className="block font-league-spartan text-xs uppercase tracking-[0.15em] text-enunas-gray-medium mb-2">
            Land
          </label>
          <Input
            value={form.country}
            onChange={handleChange('country')}
            placeholder="Deutschland"
            className={`
              h-12 rounded-none border-enunas-gray-light font-league-spartan text-sm
              focus-visible:ring-0 focus-visible:border-enunas-purple
              ${errors.country ? 'border-enunas-error' : ''}
            `}
          />
          {errors.country && (
            <p className="font-league-spartan text-[11px] text-enunas-error mt-1">{errors.country}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="mt-10 w-full py-4 bg-enunas-purple text-white font-league-spartan text-sm tracking-[0.15em] uppercase hover:bg-enunas-purple-light transition-colors duration-200 ease-out-expo"
      >
        Weiter zur Zahlung →
      </button>
    </form>
  )
}
