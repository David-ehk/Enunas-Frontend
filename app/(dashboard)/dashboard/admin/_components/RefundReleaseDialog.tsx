'use client'

import { useEffect, useState } from 'react'
import { adminReturnsApi, releaseRefundErrorMessage } from '@/lib/api/modules/adminReturnsApi'
import { FetchError } from '@/lib/api'
import type { ApiOrder, RefundPreview } from '@/types/api'
import { ActionDialog, fmtEur } from './shared'

const LABEL = 'text-[9.5px] uppercase tracking-[0.18em] font-medium'
const FONT = { fontFamily: 'var(--font-league-spartan)' }

/** Items, shipping and total of one brand return, exactly as the backend will (or did) refund them. */
export function RefundPreviewBreakdown({ preview }: { preview: RefundPreview }) {
  return (
    <div className="space-y-2 text-[12px]" style={{ ...FONT, color: '#2D2D2D' }}>
      <ul className="space-y-1.5">
        {preview.lines.map(l => (
          <li key={l.orderItemId} className="flex items-baseline justify-between gap-4">
            <span>
              {l.unitsReturned} von {l.unitsOrdered} · {l.productName}
              {(l.color || l.size) && <span style={{ color: '#9B9B9B' }}>{` — ${[l.color, l.size].filter(Boolean).join(' / ')}`}</span>}
            </span>
            <span className="tabular-nums shrink-0">{fmtEur(l.amount)}</span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between pt-2 border-t border-[#F0F0EB]" style={{ color: '#6B6B6B' }}>
        <span>Versand {preview.shippingAmount > 0 ? '(letzte Einheit dieser Marke)' : ''}</span>
        <span className="tabular-nums">{fmtEur(preview.shippingAmount)}</span>
      </div>
      <div className="flex justify-between font-medium" style={{ color: '#0A0A0A' }}>
        <span>{preview.stored ? 'Erstattet / freigegeben' : 'Wird erstattet'}</span>
        <span className="tabular-nums">{fmtEur(preview.total)}</span>
      </div>
    </div>
  )
}

/**
 * Confirmation for "Erstattung freigeben" (RECEIVED), "Erneut senden" (FAILED) and the override
 * release of an APPROVED return whose goods are not confirmed yet (reason required). The amount
 * is never entered here — the dialog shows the backend preview, which is exactly what is sent.
 */
export default function RefundReleaseDialog({
  returnNumber, mode, onClose, onDone,
}: {
  returnNumber: string
  mode: 'release' | 'resend' | 'override'
  onClose: () => void
  onDone: (updated: ApiOrder) => void
}) {
  const [preview, setPreview] = useState<RefundPreview | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    adminReturnsApi.getRefundPreview(returnNumber)
      .then(p => { if (!cancelled) setPreview(p) })
      .catch(err => {
        if (cancelled) return
        setLoadError(err instanceof FetchError && err.status === 409
          ? 'Manuelle Erstattung nötig — diese ältere Bestellung hat keine Einzelpreise pro Artikel.'
          : 'Vorschau konnte nicht geladen werden.')
      })
    return () => { cancelled = true }
  }, [returnNumber])

  async function submit() {
    if (!preview) return
    if (mode === 'override' && !reason.trim()) { setError('Bitte einen Grund für die Freigabe ohne Wareneingang angeben.'); return }
    setSubmitting(true)
    setError(null)
    try {
      onDone(await adminReturnsApi.releaseRefund(returnNumber, mode === 'override' ? reason : undefined))
    } catch (err) {
      setError(err instanceof FetchError ? releaseRefundErrorMessage(err.status, err.message) : 'Erstattung fehlgeschlagen.')
      setSubmitting(false)
    }
  }

  return (
    <ActionDialog
      eyebrow={mode === 'resend' ? 'Erstattung erneut senden' : 'Erstattung freigeben'}
      orderLabel={returnNumber}
      warning={mode === 'override'
        ? 'Der Wareneingang ist noch nicht bestätigt. Der Lagerbestand wird nicht zurückgebucht — Marke oder Admin können „Ware erhalten" später nachholen.'
        : undefined}
      error={error ?? loadError}
      submitLabel={preview ? `${fmtEur(preview.total)} erstatten` : 'Erstatten'}
      busyLabel="Wird an Mollie gesendet…"
      submitting={submitting || !preview}
      submitColor="#370E4D"
      onSubmit={submit}
      onClose={submitting ? () => {} : onClose}
    >
      {preview ? <RefundPreviewBreakdown preview={preview} /> : !loadError && (
        <p className="text-[12px]" style={{ ...FONT, color: '#9B9B9B' }}>Vorschau wird geladen…</p>
      )}
      {mode === 'override' && preview && (
        <div>
          <p className={`${LABEL} mb-1`} style={{ ...FONT, color: '#9B9B9B' }}>Grund *</p>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            maxLength={500}
            rows={2}
            placeholder="z. B. Kunde hat Einlieferungsbeleg"
            className="w-full text-[12px] border border-[#E8E8E8] px-2.5 py-2 focus:outline-none focus:border-[#370E4D]/50 resize-none"
            style={FONT}
          />
        </div>
      )}
    </ActionDialog>
  )
}
