'use client'

import { useCallback, useEffect, useState } from 'react'
import { adminReturnsApi } from '@/lib/api/modules/adminReturnsApi'
import { FetchError } from '@/lib/api'
import type { ApiOrder, OrderRefundPreview as OrderRefundPreviewDto, RefundPreview } from '@/types/api'
import { fmtEur } from './shared'
import RefundReleaseDialog, { RefundPreviewBreakdown } from './RefundReleaseDialog'

const FONT = { fontFamily: 'var(--font-league-spartan)' }

function releaseModeFor(p: RefundPreview): 'release' | 'resend' | 'override' | null {
  if (p.refundState === 'FAILED') return 'resend'
  if (p.stored) return null
  if (p.returnStatus === 'RECEIVED') return 'release'
  if (p.returnStatus === 'APPROVED') return 'override'
  return null
}

const MODE_LABEL = { release: 'Erstattung freigeben', resend: 'Erneut senden', override: 'Ohne Wareneingang erstatten…' }

/**
 * "Erstattungsvorschau" for one order: every brand return not yet REFUNDED, with its own items
 * and shipping, exactly as release will send them. Released-but-unconfirmed entries are marked
 * "wird erstattet"; "noch zu erstatten" sums only the entries not released yet.
 */
export default function OrderRefundPreview({ orderId, onOrderUpdated }: {
  orderId: string
  onOrderUpdated: (updated: ApiOrder) => void
}) {
  const [preview, setPreview] = useState<OrderRefundPreviewDto | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dialog, setDialog] = useState<{ returnNumber: string; mode: 'release' | 'resend' | 'override' } | null>(null)

  const load = useCallback(() => {
    setError(null)
    adminReturnsApi.getOrderRefundPreview(orderId)
      .then(setPreview)
      .catch(err => setError(err instanceof FetchError && err.status === 409
        ? 'Manuelle Erstattung nötig — diese ältere Bestellung hat keine Einzelpreise pro Artikel.'
        : 'Erstattungsvorschau konnte nicht geladen werden.'))
  }, [orderId])

  // Loads on mount and after every release from this panel.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  if (error) return <p className="text-[11px]" style={{ ...FONT, color: '#7A5C1E' }}>{error}</p>
  if (!preview || preview.returns.length === 0) return null

  const stillToRefund = preview.returns.filter(r => !r.stored).reduce((s, r) => s + r.total, 0)

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.12em] text-[#9B9B9B] font-medium mb-2">Erstattungsvorschau</p>
      <div className="space-y-4">
        {preview.returns.map(r => {
          const mode = releaseModeFor(r)
          return (
            <div key={r.returnNumber} className="border border-[#E8E8E8] p-3">
              <div className="flex items-baseline justify-between gap-3 mb-2">
                <p className="text-[12px] font-medium" style={{ ...FONT, color: '#0A0A0A' }}>
                  {r.brandName} <span style={{ color: '#9B9B9B', fontWeight: 400 }}>· {r.returnNumber}</span>
                </p>
                {r.stored && r.refundState === 'PENDING' && (
                  <span className="text-[10px] uppercase tracking-[0.12em]" style={{ ...FONT, color: '#7A5C1E' }}>wird erstattet</span>
                )}
              </div>
              <RefundPreviewBreakdown preview={r} />
              {mode && (
                <button
                  onClick={() => setDialog({ returnNumber: r.returnNumber, mode })}
                  className="mt-3 h-8 px-3 text-[11px] font-medium border transition-colors duration-200"
                  style={{ ...FONT, borderColor: '#370E4D', color: '#370E4D' }}
                >
                  {MODE_LABEL[mode]}
                </button>
              )}
            </div>
          )
        })}
      </div>
      <div className="flex justify-between mt-3 text-[12px] font-medium" style={{ ...FONT, color: '#0A0A0A' }}>
        <span>Noch zu erstatten</span>
        <span className="tabular-nums">{fmtEur(stillToRefund)}</span>
      </div>

      {dialog && (
        <RefundReleaseDialog
          returnNumber={dialog.returnNumber}
          mode={dialog.mode}
          onClose={() => setDialog(null)}
          onDone={updated => { setDialog(null); onOrderUpdated(updated); load() }}
        />
      )}
    </div>
  )
}
