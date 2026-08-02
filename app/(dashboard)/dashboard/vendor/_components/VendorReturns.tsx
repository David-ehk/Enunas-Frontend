'use client'

import { useVendorReturns } from '@/hooks/use-vendor-returns'
import { RETURN_LIFECYCLE, returnStageIndex } from '@/lib/api/modules/returnsApi'
import type { ReturnWithOrder, ReturnStatus } from '@/types/api'
import {
  VPageHeader, VKPIGrid, VKPI, VCard,
  VStatus, fmtEur, fmt, Loader, EmptyState, Phase2Tile,
} from './vshared'

const REASON_LABELS: Record<string, string> = {
  WRONG_SIZE:        'Falsche Größe',
  WRONG_COLOR:       'Falsche Farbe',
  DAMAGED:           'Beschädigt',
  DEFECTIVE:         'Defekt',
  NOT_AS_DESCRIBED:  'Nicht wie beschrieben',
  NO_LONGER_WANTED:  'Nicht mehr gewünscht',
  OTHER:             'Sonstiges',
}

const STATUS_META: Record<ReturnStatus, { label: string; tone: 'warn' | 'purple' | 'muted' }> = {
  REQUESTED: { label: 'Beantragt',   tone: 'warn'   },
  APPROVED:  { label: 'Genehmigt',   tone: 'purple' },
  RECEIVED:  { label: 'Eingegangen', tone: 'purple' },
  REFUNDED:  { label: 'Erstattet',   tone: 'muted'  },
}

const LIFECYCLE_LABELS: Record<string, string> = {
  REQUESTED: 'Beantragt', APPROVED: 'Genehmigt', RECEIVED: 'Eingegangen', REFUNDED: 'Erstattet',
}

// A status alone does not tell a brand what to do. Approval and refund sit with
// Enunas, so most states are genuinely "wait" — saying so explicitly is what
// stops the page reading as a to-do list the brand is failing to action.
const NEXT_STEP: Record<ReturnStatus, string | null> = {
  REQUESTED: 'Enunas prüft die Anfrage — für dich ist aktuell nichts zu tun.',
  APPROVED:  'Die Rücksendung geht an die gespeicherte Lieferadresse. Paket entgegennehmen und Zustand prüfen.',
  RECEIVED:  'Wareneingang erfasst — Enunas veranlasst die Rückerstattung.',
  REFUNDED:  null,
}

function statusMeta(s: ReturnStatus) {
  return STATUS_META[s] ?? { label: String(s), tone: 'muted' as const }
}

function itemLabel(it: ReturnWithOrder['items'][number]): string {
  const name = it.productName ?? it.name ?? 'Artikel'
  const variant = [it.variantSize ?? it.size, it.variantColor ?? it.color].filter(Boolean).join(' · ')
  return variant ? `${name} — ${variant}` : name
}

/** Per-return lifecycle. Each return advances independently of every other one. */
function Timeline({ status }: { status: ReturnStatus }) {
  const current = returnStageIndex(status)
  return (
    <div className="flex items-center gap-1.5">
      {RETURN_LIFECYCLE.map((stage, i) => {
        const done = current >= i
        return (
          <div key={stage} className="flex items-center gap-1.5">
            <span
              className="text-[9.5px] uppercase tracking-[0.14em]"
              style={{
                fontFamily: 'var(--font-league-spartan)',
                color: done ? '#370E4D' : '#C9C9C9',
                fontWeight: current === i ? 600 : 400,
              }}
            >
              {LIFECYCLE_LABELS[stage]}
            </span>
            {i < RETURN_LIFECYCLE.length - 1 && (
              <span className="w-4 h-[1px]" style={{ background: current > i ? '#370E4D' : '#E8E8E8' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function ReturnCard({ r }: { r: ReturnWithOrder }) {
  const { label, tone } = statusMeta(r.status)
  const hasLabel = Boolean(r.labelUrl || r.labelCarrier || r.labelTrackingNumber)
  const nextStep = NEXT_STEP[r.status] ?? null

  return (
    <div className="bg-white border border-[#E8E8E8]">
      <div className="px-6 pt-4 pb-3 border-b border-[#E8E8E8]">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[13px] font-medium" style={{ fontFamily: 'var(--font-league-spartan)', color: '#0A0A0A' }}>
              {r.returnNumber}
            </p>
            <p className="text-[11px] mt-0.5" style={{ fontFamily: 'var(--font-league-spartan)', color: '#9B9B9B' }}>
              {r.orderNumber ? `Bestellung ${r.orderNumber}` : r.orderId ? `Bestellung #${String(r.orderId).slice(0, 8).toUpperCase()}` : '—'}
              {r.requestedAt ? ` · ${fmt(r.requestedAt)}` : ''}
            </p>
          </div>
          <VStatus tone={tone}>{label}</VStatus>
        </div>
        <div className="mt-3">
          <Timeline status={r.status} />
        </div>
      </div>

      {nextStep && (
        <div className="px-6 py-3 border-b border-[#E8E8E8]" style={{ background: '#FAFAF8' }}>
          <p className="text-[9.5px] uppercase tracking-[0.18em] font-medium mb-1"
            style={{ fontFamily: 'var(--font-league-spartan)', color: '#9B9B9B' }}>
            Nächster Schritt
          </p>
          <p className="text-[12px] leading-[1.6]" style={{ fontFamily: 'var(--font-league-spartan)', color: '#2D2D2D' }}>
            {nextStep}
          </p>
        </div>
      )}

      <div className="px-6 py-4 grid md:grid-cols-2 gap-6">
        <div>
          <p className="text-[9.5px] uppercase tracking-[0.18em] font-medium mb-2"
            style={{ fontFamily: 'var(--font-league-spartan)', color: '#9B9B9B' }}>
            Artikel
          </p>
          {r.items.length === 0 ? (
            <p className="text-[12px]" style={{ fontFamily: 'var(--font-league-spartan)', color: '#C9C9C9' }}>—</p>
          ) : (
            <ul className="space-y-1">
              {r.items.map((it) => (
                <li key={it.id} className="text-[12px]" style={{ fontFamily: 'var(--font-league-spartan)', color: '#2D2D2D' }}>
                  {it.quantity ? `${it.quantity}× ` : ''}{itemLabel(it)}
                </li>
              ))}
            </ul>
          )}
          {r.reason && (
            <div className="mt-3">
              <p className="text-[9.5px] uppercase tracking-[0.18em] font-medium mb-1"
                style={{ fontFamily: 'var(--font-league-spartan)', color: '#9B9B9B' }}>
                Grund
              </p>
              <p className="text-[12px]" style={{ fontFamily: 'var(--font-league-spartan)', color: '#2D2D2D' }}>
                {REASON_LABELS[String(r.reason)] ?? r.reason}
              </p>
              {r.description && (
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontWeight: 300, fontSize: 12, color: '#9B9B9B', marginTop: 2 }}>
                  {r.description}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Frozen snapshot. Deliberately NOT the brand's live return address —
            this must keep showing what was current when the return was created. */}
        <div>
          <div className="flex items-baseline gap-2 mb-2">
            <p className="text-[9.5px] uppercase tracking-[0.18em] font-medium"
              style={{ fontFamily: 'var(--font-league-spartan)', color: '#9B9B9B' }}>
              Lieferadresse
            </p>
            <span className="text-[9px] uppercase tracking-[0.12em] px-1.5 py-0.5 border"
              style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B', borderColor: '#E8E8E8', background: '#FAFAF8' }}>
              Snapshot · schreibgeschützt
            </span>
          </div>
          {r.shipToAddress ? (
            <p className="text-[12px] whitespace-pre-line leading-[1.6]"
              style={{ fontFamily: 'var(--font-league-spartan)', color: '#2D2D2D' }}>
              {r.shipToAddress}
            </p>
          ) : (
            <p className="text-[12px]" style={{ fontFamily: 'var(--font-league-spartan)', color: '#C9C9C9' }}>
              Keine Adresse übermittelt.
            </p>
          )}
          <p className="text-[10.5px] mt-2 leading-[1.6]" style={{ fontFamily: 'var(--font-league-spartan)', color: '#9B9B9B' }}>
            Eingefroren bei Erstellung der Retoure. Änderungen an deiner Retourenadresse
            wirken sich nur auf neue Retouren aus.
          </p>

          <div className="mt-4 pt-4 border-t border-[#E8E8E8]">
            <p className="text-[9.5px] uppercase tracking-[0.18em] font-medium mb-2"
              style={{ fontFamily: 'var(--font-league-spartan)', color: '#9B9B9B' }}>
              Retourenlabel
            </p>
            {hasLabel ? (
              <div className="space-y-0.5 text-[12px]" style={{ fontFamily: 'var(--font-league-spartan)', color: '#2D2D2D' }}>
                <p style={{ color: '#1A5A3C' }}>Label hochgeladen</p>
                {r.labelCarrier && <p>Versanddienst: {r.labelCarrier}</p>}
                {r.labelTrackingNumber && <p>Sendungsnummer: {r.labelTrackingNumber}</p>}
              </div>
            ) : (
              <Phase2Tile label="Label-Upload" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VendorReturns() {
  const { returns, loading, error } = useVendorReturns()

  if (loading) return <Loader />

  const open     = returns.filter(r => r.status === 'REQUESTED' || r.status === 'APPROVED')
  const refunded = returns.filter(r => r.status === 'REFUNDED')
  const refundedValue = refunded.reduce((s, r) => s + (r.refundAmount ?? 0), 0)

  return (
    <div className="space-y-4">
      <VPageHeader
        eyebrow="Brand Portal"
        title="Retouren"
        sub="Jede Retoure gehört zu deiner Marke und hat ihren eigenen Ablauf."
      />

      <VKPIGrid cols={4}>
        <VKPI label="Retouren"         value={returns.length}       delta="gesamt"        deltaTone="muted" />
        <VKPI label="Offen"            value={open.length}          delta="in Bearbeitung" deltaTone="muted" />
        <VKPI label="Rückerstattungen" value={fmtEur(refundedValue)} delta="abgeschlossen" deltaTone="muted" />
        <Phase2Tile label="Retourenquote" />
      </VKPIGrid>

      {error && (
        <div className="bg-white border px-6 py-4" style={{ borderColor: '#FDBA74', background: '#FFF7ED' }}>
          <p className="text-[12px]" style={{ fontFamily: 'var(--font-league-spartan)', color: '#9A3412' }}>{error}</p>
        </div>
      )}


      {returns.length === 0 ? (
        <VCard eyebrow="Retouren-Auflistung" title="Rückgaben" flush>
          <EmptyState message="Keine Retouren vorhanden." />
        </VCard>
      ) : (
        <div className="space-y-3">
          {returns.map(r => <ReturnCard key={r.returnNumber} r={r} />)}
        </div>
      )}
    </div>
  )
}

/* ─── Phase-2/3-Referenz: ursprüngliche Implementierung ──────────────────────
   Retourenquote und Wieder-eingelagert-Rate brauchen eine dedizierte Returns-
   Quelle (Zeitreihendaten) — z. B. /brand/returns Endpunkt.

const MOCK_RETURN_MONTHS = ["Dez", "Jan", "Feb", "Mär", "Apr", "Mai"]
const MOCK_RETURN_TREND  = [9.1, 8.6, 8.2, 7.7, 7.2, 6.8]
const MOCK_REASONS = [
  { label: 'Größe passt nicht',     count: 34, meta: 'Häufigster Grund' },
  { label: 'Nicht wie beschrieben', count: 18, meta: ''                 },
  { label: 'Qualitätsproblem',      count: 12, meta: ''                 },
  { label: 'Falsch bestellt',       count: 8,  meta: ''                 },
  { label: 'Artikel beschädigt',    count: 6,  meta: ''                 },
]

// Trend + Gründe (Grid2):
// import { VAreaChart, ReasonRow, Grid2 } from './vshared'
// <Grid2>
//   <VCard eyebrow="Quoten-Trend" title="Retourenquote — 6 Monate">
//     <VAreaChart data={MOCK_RETURN_TREND} labels={MOCK_RETURN_MONTHS} fmt={v => `${v}%`} height={200} />
//   </VCard>
//   <VCard eyebrow="Rückgabegründe" title="Analyse">
//     {MOCK_REASONS.map(r => {
//       const totalReasons = MOCK_REASONS.reduce((s, r) => s + r.count, 0)
//       return <ReasonRow key={r.label} label={r.label} count={r.count} total={totalReasons} meta={r.meta} />
//     })}
//   </VCard>
// </Grid2>
*/
