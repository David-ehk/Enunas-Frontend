'use client'

import { useState, useEffect } from 'react'
import { brandApi } from '@/lib/api/modules/brandApi'
import { FetchError } from '@/lib/api'
import type { ApiBrandPartner } from '@/types/api'
import { StatusBadge, SectionCard, fmt } from '../../admin/_components/shared'
import { VPageHeader } from './vshared'
import { Check, Info } from 'lucide-react'

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

export default function SettingsTab({
  brand,
  onUpdate,
}: {
  brand: ApiBrandPartner | null
  onUpdate: (b: ApiBrandPartner) => void
}) {
  const [description, setDescription]       = useState(brand?.description ?? '')
  const [logoUrl, setLogoUrl]               = useState(brand?.logoUrl ?? '')
  const [websiteUrl, setWebsiteUrl]         = useState(brand?.websiteUrl ?? '')
  const [instagramHandle, setInstagramHandle] = useState(brand?.instagramHandle ?? '')
  const [tiktokHandle, setTiktokHandle]     = useState(brand?.tiktokHandle ?? '')
  const [contactEmail, setContactEmail]     = useState(brand?.contactEmail ?? '')
  const [profileSaving, setProfileSaving]   = useState(false)
  const [profileSaved, setProfileSaved]     = useState(false)
  const [profileError, setProfileError]     = useState<string | null>(null)

  const [legalName, setLegalName]           = useState(brand?.legalName ?? '')
  const [street, setStreet]                 = useState(brand?.addressStreet ?? '')
  const [postalCode, setPostalCode]         = useState(brand?.addressPostalCode ?? '')
  const [city, setCity]                     = useState(brand?.addressCity ?? '')
  const [country, setCountry]               = useState(brand?.addressCountry ?? 'DE')
  const [vatId, setVatId]                   = useState(brand?.vatId ?? '')
  const [taxNumber, setTaxNumber]           = useState(brand?.taxNumber ?? '')
  const [addrSaving, setAddrSaving]         = useState(false)
  const [addrSaved, setAddrSaved]           = useState(false)
  const [addrError, setAddrError]           = useState<string | null>(null)

  // Return (warehouse) address — kept separate from the legal address above.
  const [retRecipient, setRetRecipient]     = useState(brand?.returnRecipient ?? '')
  const [retStreet, setRetStreet]           = useState(brand?.returnAddressStreet ?? '')
  const [retPostalCode, setRetPostalCode]   = useState(brand?.returnAddressPostalCode ?? '')
  const [retCity, setRetCity]               = useState(brand?.returnAddressCity ?? '')
  const [retCountry, setRetCountry]         = useState(brand?.returnAddressCountry ?? 'DE')
  const [retInstructions, setRetInstructions] = useState(brand?.returnInstructions ?? '')
  const [retSaving, setRetSaving]           = useState(false)
  const [retSaved, setRetSaved]             = useState(false)
  const [retError, setRetError]             = useState<string | null>(null)

  useEffect(() => {
    if (brand) {
      setDescription(brand.description ?? '')
      setLogoUrl(brand.logoUrl ?? '')
      setWebsiteUrl(brand.websiteUrl ?? '')
      setInstagramHandle(brand.instagramHandle ?? '')
      setTiktokHandle(brand.tiktokHandle ?? '')
      setContactEmail(brand.contactEmail ?? '')
      setLegalName(brand.legalName ?? '')
      setStreet(brand.addressStreet ?? '')
      setPostalCode(brand.addressPostalCode ?? '')
      setCity(brand.addressCity ?? '')
      setCountry(brand.addressCountry ?? 'DE')
      setVatId(brand.vatId ?? '')
      setTaxNumber(brand.taxNumber ?? '')
      setRetRecipient(brand.returnRecipient ?? '')
      setRetStreet(brand.returnAddressStreet ?? '')
      setRetPostalCode(brand.returnAddressPostalCode ?? '')
      setRetCity(brand.returnAddressCity ?? '')
      setRetCountry(brand.returnAddressCountry ?? 'DE')
      setRetInstructions(brand.returnInstructions ?? '')
    }
  }, [brand])

  async function saveProfile() {
    setProfileSaving(true)
    setProfileError(null)
    try {
      const updated = await brandApi.updateMe({
        description: description.trim(),
        logoUrl: logoUrl.trim(),
        websiteUrl: websiteUrl.trim(),
        instagramHandle: instagramHandle.trim(),
        tiktokHandle: tiktokHandle.trim(),
        contactEmail: contactEmail.trim(),
      })
      onUpdate(updated)
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2500)
    } catch (err) {
      setProfileError(
        err instanceof FetchError
          ? `Speichern fehlgeschlagen: ${err.message} (${err.status})`
          : 'Speichern fehlgeschlagen. Bitte erneut versuchen.',
      )
    } finally {
      setProfileSaving(false)
    }
  }

  async function saveAddress() {
    if (!legalName.trim() || !street.trim() || !postalCode.trim() || !city.trim()) return
    setAddrSaving(true)
    setAddrError(null)
    try {
      const updated = await brandApi.updateMe({
        legalName: legalName.trim(),
        addressStreet: street.trim(),
        addressPostalCode: postalCode.trim(),
        addressCity: city.trim(),
        addressCountry: country,
        ...(vatId.trim() ? { vatId: vatId.trim() } : { vatId: undefined }),
        ...(taxNumber.trim() ? { taxNumber: taxNumber.trim() } : { taxNumber: undefined }),
      })
      onUpdate(updated)
      setAddrSaved(true)
      setTimeout(() => setAddrSaved(false), 2500)
    } catch (err) {
      setAddrError(
        err instanceof FetchError
          ? `Speichern fehlgeschlagen: ${err.message} (${err.status})`
          : 'Speichern fehlgeschlagen. Bitte erneut versuchen.',
      )
    } finally {
      setAddrSaving(false)
    }
  }

  async function saveReturnAddress() {
    setRetSaving(true)
    setRetError(null)
    try {
      const updated = await brandApi.updateMe({
        returnRecipient: retRecipient.trim(),
        returnAddressStreet: retStreet.trim(),
        returnAddressPostalCode: retPostalCode.trim(),
        returnAddressCity: retCity.trim(),
        returnAddressCountry: retCountry,
        returnInstructions: retInstructions.trim(),
      })
      onUpdate(updated)
      setRetSaved(true)
      setTimeout(() => setRetSaved(false), 2500)
    } catch (err) {
      setRetError(
        err instanceof FetchError
          ? `Speichern fehlgeschlagen: ${err.message} (${err.status})`
          : 'Speichern fehlgeschlagen. Bitte erneut versuchen.',
      )
    } finally {
      setRetSaving(false)
    }
  }

  const labelCls = 'text-[10px] uppercase tracking-[0.12em] text-[#6B6B6B] font-medium mb-1.5'
  const inputCls = 'w-full text-[13px] border border-[#E8E8E8] bg-white rounded-none px-3.5 py-2.5 focus:outline-none focus:border-[#370E4D]/50 focus:ring-2 focus:ring-[#370E4D]/8 transition-all duration-200'

  const profileDirty =
    description !== (brand?.description ?? '') ||
    logoUrl !== (brand?.logoUrl ?? '') ||
    websiteUrl !== (brand?.websiteUrl ?? '') ||
    instagramHandle !== (brand?.instagramHandle ?? '') ||
    tiktokHandle !== (brand?.tiktokHandle ?? '') ||
    contactEmail !== (brand?.contactEmail ?? '')

  const addrDirty =
    legalName !== (brand?.legalName ?? '') ||
    street !== (brand?.addressStreet ?? '') ||
    postalCode !== (brand?.addressPostalCode ?? '') ||
    city !== (brand?.addressCity ?? '') ||
    country !== (brand?.addressCountry ?? 'DE') ||
    vatId !== (brand?.vatId ?? '') ||
    taxNumber !== (brand?.taxNumber ?? '')

  const retDirty =
    retRecipient !== (brand?.returnRecipient ?? '') ||
    retStreet !== (brand?.returnAddressStreet ?? '') ||
    retPostalCode !== (brand?.returnAddressPostalCode ?? '') ||
    retCity !== (brand?.returnAddressCity ?? '') ||
    retCountry !== (brand?.returnAddressCountry ?? 'DE') ||
    retInstructions !== (brand?.returnInstructions ?? '')

  // Blank return address ⇒ the platform falls back to the registered business address.
  const hasReturnAddress = Boolean(
    (brand?.returnAddressStreet ?? '').trim() && (brand?.returnAddressCity ?? '').trim(),
  )

  return (
    <div className="max-w-xl space-y-5">
      <VPageHeader
        eyebrow="Brand Portal"
        title="Einstellungen"
        sub="Markenname und Kontoinformationen verwalten."
      />

      {/* Brand Profile */}
      <SectionCard title="Markenprofil">
        <div className="p-6 space-y-5">
          <div>
            {/* Backend UpdateBrandPartnerDto hat kein brandName-Feld — Name ist nach
                der Registrierung fix und nur über den Support/Admin änderbar. */}
            <p className={labelCls} style={{ fontFamily: 'var(--font-league-spartan)' }}>Markenname (nicht änderbar)</p>
            <p className="text-[13px] text-[#2D2D2D]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
              {brand?.brandName ?? '—'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={labelCls} style={{ fontFamily: 'var(--font-league-spartan)' }}>Status</p>
              <div className="py-1">
                {brand ? <StatusBadge status={brand.status} /> : <span className="text-[#9B9B9B] text-[12px]">—</span>}
              </div>
            </div>
            <div>
              <p className={labelCls} style={{ fontFamily: 'var(--font-league-spartan)' }}>Mitglied seit</p>
              <p className="text-[13px] text-[#2D2D2D]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                {brand?.createdAt ? fmt(brand.createdAt) : '—'}
              </p>
            </div>
          </div>

          <div>
            <p className={labelCls} style={{ fontFamily: 'var(--font-league-spartan)' }}>E-Mail (nicht änderbar)</p>
            <p className="text-[13px] text-[#6B6B6B]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
              {brand?.email ?? '—'}
            </p>
          </div>

        </div>
      </SectionCard>

      {/* Öffentliches Profil — wird auf marken/[brand] und überall sonst gezeigt,
          wo der Shop diese Marke im Storefront darstellt. */}
      <SectionCard title="Öffentliches Profil">
        <div className="p-6 space-y-5">
          <div>
            <p className={labelCls} style={{ fontFamily: 'var(--font-league-spartan)' }}>Beschreibung</p>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              placeholder="Kurzer Text über deine Marke — erscheint auf deiner öffentlichen Markenseite."
              className={inputCls}
              style={{ fontFamily: 'var(--font-league-spartan)', resize: 'vertical' }}
            />
          </div>

          <div>
            <p className={labelCls} style={{ fontFamily: 'var(--font-league-spartan)' }}>Logo-URL</p>
            <input
              type="text"
              value={logoUrl}
              onChange={e => setLogoUrl(e.target.value)}
              placeholder="https://…"
              className={inputCls}
              style={{ fontFamily: 'var(--font-league-spartan)' }}
            />
          </div>

          <div>
            <p className={labelCls} style={{ fontFamily: 'var(--font-league-spartan)' }}>Website</p>
            <input
              type="text"
              value={websiteUrl}
              onChange={e => setWebsiteUrl(e.target.value)}
              placeholder="https://…"
              className={inputCls}
              style={{ fontFamily: 'var(--font-league-spartan)' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={labelCls} style={{ fontFamily: 'var(--font-league-spartan)' }}>Instagram</p>
              <input
                type="text"
                value={instagramHandle}
                onChange={e => setInstagramHandle(e.target.value)}
                placeholder="@marke"
                className={inputCls}
                style={{ fontFamily: 'var(--font-league-spartan)' }}
              />
            </div>
            <div>
              <p className={labelCls} style={{ fontFamily: 'var(--font-league-spartan)' }}>TikTok</p>
              <input
                type="text"
                value={tiktokHandle}
                onChange={e => setTiktokHandle(e.target.value)}
                placeholder="@marke"
                className={inputCls}
                style={{ fontFamily: 'var(--font-league-spartan)' }}
              />
            </div>
          </div>

          <div>
            <p className={labelCls} style={{ fontFamily: 'var(--font-league-spartan)' }}>Kontakt-E-Mail <span className="normal-case text-[10px] tracking-[0.04em] text-[#9B9B9B]">(optional, abweichend vom Login)</span></p>
            <input
              type="email"
              value={contactEmail}
              onChange={e => setContactEmail(e.target.value)}
              placeholder={brand?.email ?? ''}
              className={inputCls}
              style={{ fontFamily: 'var(--font-league-spartan)' }}
            />
          </div>

          {profileError && (
            <p className="text-[11px] text-[#8B1E3F]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
              {profileError}
            </p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={saveProfile}
              disabled={profileSaving || !profileDirty}
              className="flex items-center gap-2 h-9 px-5 rounded-none text-[12px] font-medium text-white transition-all duration-200 disabled:opacity-40"
              style={{ fontFamily: 'var(--font-league-spartan)', background: '#370E4D' }}
            >
              {profileSaving ? 'Speichert…' : profileSaved ? <><Check className="w-3.5 h-3.5" /> Gespeichert</> : 'Speichern'}
            </button>
            {profileDirty && !profileSaving && (
              <button
                onClick={() => {
                  setDescription(brand?.description ?? '')
                  setLogoUrl(brand?.logoUrl ?? '')
                  setWebsiteUrl(brand?.websiteUrl ?? '')
                  setInstagramHandle(brand?.instagramHandle ?? '')
                  setTiktokHandle(brand?.tiktokHandle ?? '')
                  setContactEmail(brand?.contactEmail ?? '')
                }}
                className="h-9 px-4 rounded-none text-[12px] text-[#6B6B6B] border border-[#E8E8E8] hover:bg-[#F5F5F0] transition-all duration-200"
                style={{ fontFamily: 'var(--font-league-spartan)' }}
              >
                Abbrechen
              </button>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Unternehmens- & Steuerdaten */}
      <SectionCard title="Unternehmens- & Steuerdaten">
        <div className="p-6 space-y-5">
          <div>
            <p className={labelCls} style={{ fontFamily: 'var(--font-league-spartan)' }}>Firmenbezeichnung (Rechtsform)</p>
            <input
              type="text"
              value={legalName}
              onChange={e => setLegalName(e.target.value)}
              className={inputCls}
              style={{ fontFamily: 'var(--font-league-spartan)' }}
              placeholder="z. B. Muster GmbH"
            />
          </div>

          <div>
            <p className={labelCls} style={{ fontFamily: 'var(--font-league-spartan)' }}>Straße und Hausnummer</p>
            <input
              type="text"
              value={street}
              onChange={e => setStreet(e.target.value)}
              className={inputCls}
              style={{ fontFamily: 'var(--font-league-spartan)' }}
            />
          </div>

          <div className="grid grid-cols-[120px_1fr] gap-3">
            <div>
              <p className={labelCls} style={{ fontFamily: 'var(--font-league-spartan)' }}>PLZ</p>
              <input
                type="text"
                value={postalCode}
                onChange={e => setPostalCode(e.target.value)}
                className={inputCls}
                style={{ fontFamily: 'var(--font-league-spartan)' }}
              />
            </div>
            <div>
              <p className={labelCls} style={{ fontFamily: 'var(--font-league-spartan)' }}>Ort</p>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                className={inputCls}
                style={{ fontFamily: 'var(--font-league-spartan)' }}
              />
            </div>
          </div>

          <div>
            <p className={labelCls} style={{ fontFamily: 'var(--font-league-spartan)' }}>Land</p>
            <select
              value={country}
              onChange={e => setCountry(e.target.value)}
              className={inputCls}
              style={{ fontFamily: 'var(--font-league-spartan)', cursor: 'pointer' }}
            >
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Steuertyp — read-only, server-seitig aus dem Land abgeleitet (DE ⇒ Inland 19 % USt, sonst Reverse Charge) */}
          <div>
            <p className={labelCls} style={{ fontFamily: 'var(--font-league-spartan)' }}>Steuertyp (abgeleitet aus Land)</p>
            <span
              className="inline-block px-2.5 py-1 text-[11px] font-semibold"
              style={{
                fontFamily: 'var(--font-league-spartan)',
                letterSpacing: '0.04em',
                background: country === 'DE' ? 'rgba(26,90,60,0.08)' : 'rgba(55,14,77,0.08)',
                color: country === 'DE' ? '#1A5A3C' : '#370E4D',
              }}
            >
              {country === 'DE' ? 'Inland · 19 % USt' : 'Ausland · Reverse Charge (§ 3a Abs. 2 UStG)'}
            </span>
            <p className="mt-1 text-[10px] text-[#9B9B9B]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
              Wird automatisch aus dem Land bestimmt und steuert die Provisionsabrechnung (USt vs. Reverse Charge).
            </p>
          </div>

          <div>
            <p className={labelCls} style={{ fontFamily: 'var(--font-league-spartan)' }}>
              USt-IdNr.{' '}
              <span className="normal-case text-[10px] tracking-[0.04em] text-[#6B6B6B]">
                — für Provisionsabrechnung &amp; Compliance erforderlich
              </span>
            </p>
            <input
              type="text"
              value={vatId}
              onChange={e => setVatId(e.target.value)}
              className={inputCls}
              style={{ fontFamily: 'var(--font-league-spartan)' }}
              placeholder="DE123456789"
            />
          </div>

          <div>
            <p className={labelCls} style={{ fontFamily: 'var(--font-league-spartan)' }}>Steuernummer <span className="normal-case text-[10px] tracking-[0.04em] text-[#9B9B9B]">(optional)</span></p>
            <input
              type="text"
              value={taxNumber}
              onChange={e => setTaxNumber(e.target.value)}
              className={inputCls}
              style={{ fontFamily: 'var(--font-league-spartan)' }}
            />
          </div>

          {addrError && (
            <p className="text-[11px] text-[#8B1E3F]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
              {addrError}
            </p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={saveAddress}
              disabled={addrSaving || !addrDirty || !legalName.trim() || !street.trim() || !postalCode.trim() || !city.trim()}
              className="flex items-center gap-2 h-9 px-5 rounded-none text-[12px] font-medium text-white transition-all duration-200 disabled:opacity-40"
              style={{ fontFamily: 'var(--font-league-spartan)', background: '#370E4D' }}
            >
              {addrSaving ? 'Speichert…' : addrSaved ? <><Check className="w-3.5 h-3.5" /> Gespeichert</> : 'Speichern'}
            </button>
            {addrDirty && !addrSaving && (
              <button
                onClick={() => {
                  setLegalName(brand?.legalName ?? '')
                  setStreet(brand?.addressStreet ?? '')
                  setPostalCode(brand?.addressPostalCode ?? '')
                  setCity(brand?.addressCity ?? '')
                  setCountry(brand?.addressCountry ?? 'DE')
                  setVatId(brand?.vatId ?? '')
                  setTaxNumber(brand?.taxNumber ?? '')
                }}
                className="h-9 px-4 rounded-none text-[12px] text-[#6B6B6B] border border-[#E8E8E8] hover:bg-[#F5F5F0] transition-all duration-200"
                style={{ fontFamily: 'var(--font-league-spartan)' }}
              >
                Abbrechen
              </button>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Return address — deliberately its own section, not part of the legal
          company data above: this is a logistics address, not an identity one. */}
      <SectionCard title="Retouren">
        <div className="p-6 space-y-4">
          <div
            className="flex gap-2.5 p-3 border"
            style={{ borderColor: hasReturnAddress ? '#E8E8E8' : '#FDBA74', background: hasReturnAddress ? '#FAFAF8' : '#FFF7ED' }}
          >
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: hasReturnAddress ? '#6B6B6B' : '#9A3412' }} />
            <p className="text-[11px] leading-[1.6]" style={{ fontFamily: 'var(--font-league-spartan)', color: hasReturnAddress ? '#6B6B6B' : '#9A3412' }}>
              {hasReturnAddress
                ? 'Diese Adresse wird Kundinnen und Kunden bei einer Retoure angezeigt. Bereits erstellte Retouren behalten die damals gültige Adresse.'
                : 'Keine Retourenadresse hinterlegt — Enunas verwendet deine registrierte Geschäftsadresse.'}
            </p>
          </div>

          <div>
            <p className={labelCls}>Retouren-Empfänger</p>
            <input
              type="text"
              value={retRecipient}
              onChange={e => setRetRecipient(e.target.value)}
              placeholder={brand?.legalName ?? ''}
              className={inputCls}
              style={{ fontFamily: 'var(--font-league-spartan)' }}
            />
          </div>

          <div>
            <p className={labelCls}>Straße &amp; Hausnummer</p>
            <input
              type="text"
              value={retStreet}
              onChange={e => setRetStreet(e.target.value)}
              placeholder={brand?.addressStreet ?? ''}
              className={inputCls}
              style={{ fontFamily: 'var(--font-league-spartan)' }}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className={labelCls}>PLZ</p>
              <input
                type="text"
                value={retPostalCode}
                onChange={e => setRetPostalCode(e.target.value)}
                placeholder={brand?.addressPostalCode ?? ''}
                className={inputCls}
                style={{ fontFamily: 'var(--font-league-spartan)' }}
              />
            </div>
            <div className="col-span-2">
              <p className={labelCls}>Stadt</p>
              <input
                type="text"
                value={retCity}
                onChange={e => setRetCity(e.target.value)}
                placeholder={brand?.addressCity ?? ''}
                className={inputCls}
                style={{ fontFamily: 'var(--font-league-spartan)' }}
              />
            </div>
          </div>

          <div>
            <p className={labelCls}>Land</p>
            <select
              value={retCountry}
              onChange={e => setRetCountry(e.target.value)}
              className={inputCls}
              style={{ fontFamily: 'var(--font-league-spartan)' }}
            >
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <p className={labelCls}>Hinweise zur Retoure</p>
            <textarea
              value={retInstructions}
              onChange={e => setRetInstructions(e.target.value)}
              rows={3}
              placeholder="z. B. Rücksendung bitte mit Originalverpackung, Tor 3, Mo–Fr 8–16 Uhr"
              className={inputCls}
              style={{ fontFamily: 'var(--font-league-spartan)', resize: 'vertical' }}
            />
          </div>

          {retError && (
            <p className="text-[11px] text-[#8B1E3F]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
              {retError}
            </p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={saveReturnAddress}
              disabled={retSaving || !retDirty}
              className="flex items-center gap-2 h-9 px-5 rounded-none text-[12px] font-medium text-white transition-all duration-200 disabled:opacity-40"
              style={{ fontFamily: 'var(--font-league-spartan)', background: '#370E4D' }}
            >
              {retSaving ? 'Speichert…' : retSaved ? <><Check className="w-3.5 h-3.5" /> Gespeichert</> : 'Speichern'}
            </button>
            {retDirty && !retSaving && (
              <button
                onClick={() => {
                  setRetRecipient(brand?.returnRecipient ?? '')
                  setRetStreet(brand?.returnAddressStreet ?? '')
                  setRetPostalCode(brand?.returnAddressPostalCode ?? '')
                  setRetCity(brand?.returnAddressCity ?? '')
                  setRetCountry(brand?.returnAddressCountry ?? 'DE')
                  setRetInstructions(brand?.returnInstructions ?? '')
                }}
                className="h-9 px-4 rounded-none text-[12px] text-[#6B6B6B] border border-[#E8E8E8] hover:bg-[#F5F5F0] transition-all duration-200"
                style={{ fontFamily: 'var(--font-league-spartan)' }}
              >
                Abbrechen
              </button>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Account info */}
      <SectionCard title="Konto-Informationen">
        <div className="p-6 space-y-3">
          {[
            {
              title: 'Retourenadresse',
              text:  'Genehmigte Retouren gehen an die Adresse im Abschnitt „Retouren“ — ist dort nichts hinterlegt, an deine Geschäftsadresse. Jede Retoure speichert die zum Zeitpunkt der Anfrage gültige Adresse; spätere Änderungen gelten nur für neue Retouren.',
            },
            {
              title: 'Produkt-Genehmigungen',
              text:  'Neue Produkte müssen vom Enunas-Team genehmigt werden, bevor sie im Shop erscheinen.',
            },
            {
              title: 'Versandverantwortung',
              text:  'Du bist als Brand Partner für den Versand deiner Bestellungen verantwortlich. Halte Tracking-Informationen stets aktuell.',
            },
          ].map(({ title, text }) => (
            <div key={title} className="flex items-start gap-3 px-4 py-3.5 border border-[#E8E8E8] bg-white rounded-none">
              <Info className="w-3.5 h-3.5 text-[#C0C0BC] shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] font-semibold text-[#2D2D2D]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                  {title}
                </p>
                <p className="text-[11px] text-[#6B6B6B] mt-0.5 leading-snug" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                  {text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
