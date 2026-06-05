'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { FetchError } from '@/lib/api'
import type {
  DiscountResponse,
  CreateDiscountRequest,
  UpdateDiscountRequest,
} from '@/types/api'

type Props = {
  open: boolean
  onClose: () => void
  initial?: DiscountResponse | null
  maxPercent: number
  isAdmin: boolean
  canEditAllFields?: boolean
  onCreate?: (dto: CreateDiscountRequest) => Promise<DiscountResponse>
  onUpdate?: (id: number, dto: UpdateDiscountRequest) => Promise<DiscountResponse>
  onSaved: () => void
}

function toInputDateTime(iso: string | null | undefined): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  } catch {
    return ''
  }
}

function fromInputDateTime(v: string): string | null {
  if (!v) return null
  const d = new Date(v)
  if (isNaN(d.getTime())) return null
  return d.toISOString()
}

const CODE_PATTERN = /^[A-Z0-9]{1,20}$/

function FLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <p
      className="text-[10px] uppercase tracking-[0.12em] text-[#9B9B9B] font-medium mb-1.5"
      style={{ fontFamily: 'var(--font-league-spartan)' }}
    >
      {children}
      {required && <span className="text-[#8B1E3F] ml-1">*</span>}
    </p>
  )
}

function FInput({
  value, onChange, type = 'text', placeholder, disabled, min, max, step, maxLength,
}: {
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  disabled?: boolean
  min?: number
  max?: number
  step?: string
  maxLength?: number
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      maxLength={maxLength}
      className="w-full text-[13px] border border-[#E8E8E8] bg-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#370E4D]/40 focus:ring-2 focus:ring-[#370E4D]/8 transition-all duration-200 placeholder:text-[#C0C0BC] disabled:bg-[#FAFAF8] disabled:text-[#9B9B9B] disabled:cursor-not-allowed"
      style={{ fontFamily: 'var(--font-league-spartan)' }}
    />
  )
}

export default function DiscountForm({
  open, onClose, initial, maxPercent, isAdmin, canEditAllFields = true,
  onCreate, onUpdate, onSaved,
}: Props) {
  const isEdit = !!initial
  const editableFieldsLocked = isEdit && !canEditAllFields

  const [code, setCode] = useState('')
  const [percent, setPercent] = useState('')
  const [validFrom, setValidFrom] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [active, setActive] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) return
    setError(null)
    setFieldErrors({})
    if (initial) {
      setCode(initial.code)
      setPercent(String(initial.percent))
      setValidFrom(toInputDateTime(initial.validFrom))
      setValidUntil(toInputDateTime(initial.validUntil))
      setMaxUses(initial.maxUses != null ? String(initial.maxUses) : '')
      setActive(initial.active)
    } else {
      setCode('')
      setPercent('')
      setValidFrom('')
      setValidUntil('')
      setMaxUses('')
      setActive(true)
    }
  }, [open, initial])

  function validate(): boolean {
    const errs: Record<string, string> = {}

    if (!isEdit) {
      if (!code.trim()) errs.code = 'Code ist erforderlich.'
      else if (!CODE_PATTERN.test(code.trim().toUpperCase())) errs.code = 'Nur Buchstaben/Zahlen, max. 20 Zeichen.'
    }

    const pct = parseFloat(percent)
    if (isNaN(pct)) errs.percent = 'Prozentsatz erforderlich.'
    else if (pct <= 0) errs.percent = 'Muss größer als 0 sein.'
    else if (pct > maxPercent / 100) errs.percent = `Maximal ${maxPercent}% erlaubt.`

    if (validFrom && validUntil) {
      const f = new Date(validFrom).getTime()
      const u = new Date(validUntil).getTime()
      if (!isNaN(f) && !isNaN(u) && u <= f) {
        errs.validUntil = '„Gültig bis" muss nach „Gültig ab" liegen.'
      }
    }

    if (maxUses) {
      const m = parseInt(maxUses, 10)
      if (isNaN(m) || m < 1) errs.maxUses = 'Mindestens 1 oder leer lassen.'
    }

    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent | React.MouseEvent) {
    e.preventDefault()
    if (submitting) return
    setError(null)
    if (!validate()) return

    setSubmitting(true)
    try {
      const pct = parseFloat(percent)
      const m = maxUses ? parseInt(maxUses, 10) : null

      if (isEdit && initial && onUpdate) {
        const dto: UpdateDiscountRequest = editableFieldsLocked
          ? { active }
          : {
              percent: pct,
              validFrom: fromInputDateTime(validFrom),
              validUntil: fromInputDateTime(validUntil),
              maxUses: m,
              active,
            }
        await onUpdate(initial.id, dto)
      } else if (onCreate) {
        const dto: CreateDiscountRequest = {
          code: code.trim().toUpperCase(),
          percent: pct,
          validFrom: fromInputDateTime(validFrom),
          validUntil: fromInputDateTime(validUntil),
          maxUses: m,
          active,
        }
        await onCreate(dto)
      }

      onSaved()
      onClose()
    } catch (err) {
      if (err instanceof FetchError) {
        if (err.status === 409) setError('Dieser Code existiert bereits.')
        else setError(err.message || 'Speichern fehlgeschlagen.')
      } else {
        setError('Unerwarteter Fehler.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  const title = isEdit
    ? 'Rabatt bearbeiten'
    : isAdmin
      ? 'Admin-Code erstellen'
      : 'Neuen Rabatt erstellen'
  const subtitle = isAdmin
    ? `Plattformweiter Code · Typ ADMIN (max. ${maxPercent}%)`
    : `Eigener Marken-Rabatt (max. ${maxPercent}%)`

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-[520px] bg-[#F8F8F5] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.25)] max-h-[calc(100vh-4rem)] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-start justify-between px-7 pt-6 pb-5 bg-white border-b border-[#EBEBEB]">
            <div>
              <p
                className="text-[10px] uppercase tracking-[0.22em] font-medium text-[#9B9B9B] mb-1.5"
                style={{ fontFamily: 'var(--font-league-spartan)' }}
              >
                Rabattcode
              </p>
              <h2
                className="text-[#0A0A0A] leading-none"
                style={{ fontFamily: 'var(--font-cormorant)', fontSize: 24, fontWeight: 300 }}
              >
                {title}
              </h2>
              <p
                className="mt-1.5 text-[11px] text-[#6B6B6B]"
                style={{ fontFamily: 'var(--font-league-spartan)' }}
              >
                {subtitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#9B9B9B] hover:text-[#0A0A0A] hover:bg-[#F0F0EB] transition-all duration-200"
              aria-label="Schließen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-7 py-6 space-y-5">
            {editableFieldsLocked && (
              <div
                className="text-[11px] px-3.5 py-2.5 rounded-lg border bg-amber-50 border-amber-200 text-amber-800"
                style={{ fontFamily: 'var(--font-league-spartan)' }}
              >
                Marken-Codes: Nur Aktivierung / Deaktivierung möglich.
              </div>
            )}

            {error && (
              <div
                className="text-[12px] px-3.5 py-2.5 rounded-lg border bg-rose-50 border-rose-200 text-rose-700"
                style={{ fontFamily: 'var(--font-league-spartan)' }}
              >
                {error}
              </div>
            )}

            <div>
              <FLabel required={!isEdit}>Code</FLabel>
              <FInput
                value={code}
                onChange={v => setCode(v.toUpperCase())}
                placeholder="WELCOME10"
                disabled={isEdit}
                maxLength={20}
              />
              {fieldErrors.code && (
                <p className="text-[11px] text-[#8B1E3F] mt-1.5" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                  {fieldErrors.code}
                </p>
              )}
              {isEdit && (
                <p className="text-[10px] text-[#9B9B9B] mt-1.5" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                  Code kann nach der Erstellung nicht geändert werden.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FLabel required>Prozent</FLabel>
                <FInput
                  type="number"
                  value={percent}
                  onChange={setPercent}
                  placeholder="0.1"
                  step="0.01"
                  min={0}
                  max={maxPercent / 100}
                  disabled={editableFieldsLocked}
                />
                {fieldErrors.percent ? (
                  <p className="text-[11px] text-[#8B1E3F] mt-1.5" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                    {fieldErrors.percent}
                  </p>
                ) : (
                  <p className="text-[10px] text-[#9B9B9B] mt-1.5 leading-snug" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                    Kommazahl eingeben — z.&nbsp;B. <strong>0.1</strong> für 10&nbsp;% Rabatt (max.&nbsp;{maxPercent}&nbsp;%).
                  </p>
                )}
              </div>

              <div>
                <FLabel>Max. Nutzungen</FLabel>
                <FInput
                  type="number"
                  value={maxUses}
                  onChange={setMaxUses}
                  placeholder="∞ unbegrenzt"
                  min={1}
                  disabled={editableFieldsLocked}
                />
                {fieldErrors.maxUses ? (
                  <p className="text-[11px] text-[#8B1E3F] mt-1.5" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                    {fieldErrors.maxUses}
                  </p>
                ) : !maxUses && (
                  <p className="text-[10px] text-[#7A5C1E] mt-1.5 leading-snug" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                    ⚠ Ohne Limit kann der Code unbegrenzt oft eingelöst werden.
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FLabel>Gültig ab</FLabel>
                <FInput
                  type="datetime-local"
                  value={validFrom}
                  onChange={setValidFrom}
                  disabled={editableFieldsLocked}
                />
              </div>
              <div>
                <FLabel>Gültig bis</FLabel>
                <FInput
                  type="datetime-local"
                  value={validUntil}
                  onChange={setValidUntil}
                  disabled={editableFieldsLocked}
                />
                {fieldErrors.validUntil && (
                  <p className="text-[11px] text-[#8B1E3F] mt-1.5" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                    {fieldErrors.validUntil}
                  </p>
                )}
              </div>
            </div>

            {isEdit && initial && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <FLabel>Verwendet</FLabel>
                  <p
                    className="text-[13px] text-[#0A0A0A] tabular-nums"
                    style={{ fontFamily: 'var(--font-league-spartan)' }}
                  >
                    {initial.usedCount} {initial.maxUses != null ? `/ ${initial.maxUses}` : '/ ∞'}
                  </p>
                </div>
                <div>
                  <FLabel>Typ</FLabel>
                  <p
                    className="text-[13px] text-[#0A0A0A]"
                    style={{ fontFamily: 'var(--font-league-spartan)' }}
                  >
                    {initial.type}
                    {initial.brandName ? ` · ${initial.brandName}` : ''}
                  </p>
                </div>
              </div>
            )}

            <label className="flex items-center gap-3 cursor-pointer select-none pt-2">
              <span
                className={`relative inline-flex h-5 w-9 rounded-full transition-colors duration-200 ${
                  active ? 'bg-[#370E4D]' : 'bg-[#D6D6D2]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={e => setActive(e.target.checked)}
                  className="sr-only"
                />
                <span
                  className={`absolute top-0.5 h-4 w-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                    active ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </span>
              <span
                className="text-[12px] text-[#2D2D2D]"
                style={{ fontFamily: 'var(--font-league-spartan)' }}
              >
                Aktiv
              </span>
            </label>
          </form>

          <div className="flex items-center justify-end gap-2 px-7 py-4 bg-white border-t border-[#EBEBEB]">
            <button
              onClick={onClose}
              type="button"
              className="h-9 px-4 rounded-lg text-[11px] font-medium text-[#6B6B6B] border border-[#E8E8E8] hover:bg-[#F5F5F0] transition-all duration-200"
              style={{ fontFamily: 'var(--font-league-spartan)', letterSpacing: '0.06em', textTransform: 'uppercase' }}
            >
              Abbrechen
            </button>
            <button
              onClick={handleSubmit}
              type="button"
              disabled={submitting}
              className="h-9 px-5 rounded-lg text-[11px] font-medium text-white transition-all duration-200 disabled:opacity-40 hover:bg-[#4A1566]"
              style={{ fontFamily: 'var(--font-league-spartan)', background: '#370E4D', letterSpacing: '0.06em', textTransform: 'uppercase' }}
            >
              {submitting ? 'Speichert…' : isEdit ? 'Speichern' : 'Erstellen'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
