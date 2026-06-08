'use client'

import { useState, useEffect } from 'react'
import { brandApi } from '@/lib/api/modules/brandApi'
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
  const [brandName, setBrandName] = useState(brand?.brandName ?? '')
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [error, setError]         = useState<string | null>(null)

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

  useEffect(() => {
    if (brand) {
      setBrandName(brand.brandName)
      setLegalName(brand.legalName ?? '')
      setStreet(brand.addressStreet ?? '')
      setPostalCode(brand.addressPostalCode ?? '')
      setCity(brand.addressCity ?? '')
      setCountry(brand.addressCountry ?? 'DE')
      setVatId(brand.vatId ?? '')
      setTaxNumber(brand.taxNumber ?? '')
    }
  }, [brand])

  async function saveBrandName() {
    if (!brandName.trim()) return
    setSaving(true)
    setError(null)
    try {
      const updated = await brandApi.updateMe({ brandName: brandName.trim() })
      onUpdate(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setError('Speichern fehlgeschlagen. Bitte erneut versuchen.')
    } finally {
      setSaving(false)
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
    } catch {
      setAddrError('Speichern fehlgeschlagen. Bitte erneut versuchen.')
    } finally {
      setAddrSaving(false)
    }
  }

  const labelCls = 'text-[10px] uppercase tracking-[0.12em] text-[#6B6B6B] font-medium mb-1.5'
  const inputCls = 'w-full text-[13px] border border-[#E8E8E8] bg-white rounded-none px-3.5 py-2.5 focus:outline-none focus:border-[#370E4D]/50 focus:ring-2 focus:ring-[#370E4D]/8 transition-all duration-200'

  const addrDirty =
    legalName !== (brand?.legalName ?? '') ||
    street !== (brand?.addressStreet ?? '') ||
    postalCode !== (brand?.addressPostalCode ?? '') ||
    city !== (brand?.addressCity ?? '') ||
    country !== (brand?.addressCountry ?? 'DE') ||
    vatId !== (brand?.vatId ?? '') ||
    taxNumber !== (brand?.taxNumber ?? '')

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
            <p className={labelCls} style={{ fontFamily: 'var(--font-league-spartan)' }}>Markenname</p>
            <input
              type="text"
              value={brandName}
              onChange={e => setBrandName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveBrandName()}
              className={inputCls}
              style={{ fontFamily: 'var(--font-league-spartan)' }}
            />
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

          {error && (
            <p className="text-[11px] text-[#8B1E3F]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={saveBrandName}
              disabled={saving || !brandName.trim() || brandName === brand?.brandName}
              className="flex items-center gap-2 h-9 px-5 rounded-none text-[12px] font-medium text-white transition-all duration-200 disabled:opacity-40"
              style={{ fontFamily: 'var(--font-league-spartan)', background: '#370E4D' }}
            >
              {saving ? 'Speichert…' : saved ? <><Check className="w-3.5 h-3.5" /> Gespeichert</> : 'Speichern'}
            </button>
            {brandName !== brand?.brandName && !saving && (
              <button
                onClick={() => setBrandName(brand?.brandName ?? '')}
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

      {/* Account info */}
      <SectionCard title="Konto-Informationen">
        <div className="p-6 space-y-3">
          {[
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
