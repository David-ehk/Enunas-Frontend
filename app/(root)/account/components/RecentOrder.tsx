'use client'

import type { ApiOrder } from '@/types/api'
import { formatDateLong } from '@/lib/account'
import { cn } from '@/lib/utils'
import AccountButton from './AccountButton'

const STATUS_META: Record<string, { label: string; toneClass: string }> = {
  PENDING:          { label: 'Ausstehend',         toneClass: 'text-enunas-warning' },
  PAID:             { label: 'Bezahlt',             toneClass: 'text-enunas-success' },
  SHIPPED:          { label: 'Versandt',            toneClass: 'text-enunas-success' },
  DELIVERED:        { label: 'Zugestellt',          toneClass: 'text-enunas-success' },
  SHIPPING_PROBLEM: { label: 'Versandproblem',      toneClass: 'text-enunas-warning' },
  AWAITING_ADMIN:   { label: 'In Prüfung',          toneClass: 'text-enunas-warning' },
  MANUAL_REVIEW:    { label: 'Manuelle Prüfung',    toneClass: 'text-enunas-warning' },
  RETURN_REQUESTED: { label: 'Retoure beantragt',   toneClass: 'text-enunas-gray-medium' },
  RETURN_APPROVED:  { label: 'Retoure genehmigt',   toneClass: 'text-enunas-gray-medium' },
  RETURN_RECEIVED:  { label: 'Retoure eingegangen', toneClass: 'text-enunas-gray-medium' },
  REFUNDED:         { label: 'Erstattet',           toneClass: 'text-enunas-success' },
  CANCELLED:        { label: 'Storniert',           toneClass: 'text-enunas-error' },
}

function fmtEuro(amount: number | undefined): string {
  if (amount == null) return '—'
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount)
}

function MetaCell({ label, children, toneClass }: {
  label: string;
  children: React.ReactNode;
  toneClass?: string;
}) {
  return (
    <div>
      <p className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-gray-medium mb-1">
        {label}
      </p>
      <p className={cn('font-league-spartan text-sm text-enunas-black', toneClass)}>
        {children}
      </p>
    </div>
  )
}

function EmptyState({ onSeeAll }: { onSeeAll: () => void }) {
  return (
    <div className="border border-enunas-gray-light p-12 text-center">
      <h3 className="font-cormorant text-2xl text-enunas-black mb-3">
        Noch keine Bestellungen
      </h3>
      <p className="font-league-spartan text-sm text-enunas-gray-medium mb-6">
        Sobald du eine Bestellung aufgegeben hast, findest du sie hier.
      </p>
      <AccountButton onClick={() => { window.location.href = '/bekleidung' }}>
        Kollektion entdecken
      </AccountButton>
    </div>
  )
}

interface RecentOrderProps {
  order: ApiOrder | null;
  onSeeAll: () => void;
}

export default function RecentOrder({ order, onSeeAll }: RecentOrderProps) {
  const statusMeta = order ? (STATUS_META[order.status] ?? { label: order.status, toneClass: 'text-enunas-gray-medium' }) : null
  const orderNumber = order ? (order.orderNumber ?? 'ENU-' + String(order.id).slice(-6).toUpperCase()) : null
  const total = order ? (order.total ?? order.totalAmount) : null

  return (
    <section className="mb-14">
      <div className="flex justify-between items-baseline mb-6">
        <h2 className="font-cormorant text-2xl md:text-[28px] font-normal text-enunas-black">
          Letzte Bestellung
        </h2>
        <button
          onClick={onSeeAll}
          className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-black underline underline-offset-4 hover:text-enunas-purple transition-colors duration-300"
        >
          Alle ansehen
        </button>
      </div>

      {!order ? (
        <EmptyState onSeeAll={onSeeAll} />
      ) : (
        <article className="border border-enunas-gray-light p-6 md:p-7">
          {/* Meta row */}
          <div className="flex flex-wrap gap-y-4 gap-x-8 md:justify-between md:flex-nowrap pb-5 mb-5 border-b border-enunas-off-white">
            <MetaCell label="Bestellung Nr.">
              <span className="font-medium">{orderNumber}</span>
            </MetaCell>
            <MetaCell label="Datum">
              {formatDateLong(order.createdAt)}
            </MetaCell>
            <MetaCell label="Status">
              <span
                className={cn(
                  'font-league-spartan text-xs tracking-[0.1em] uppercase font-semibold inline-flex items-center gap-1.5',
                  statusMeta?.toneClass
                )}
              >
                <span aria-hidden>●</span>
                {statusMeta?.label}
              </span>
            </MetaCell>
            <MetaCell label="Gesamt">
              <span className="font-medium">{fmtEuro(total ?? undefined)}</span>
            </MetaCell>
          </div>

          {/* Item name pills */}
          <div className="flex items-end gap-3 flex-wrap">
            <div className="flex flex-wrap gap-2">
              {order.items.slice(0, 3).map((item, i) => (
                <span
                  key={item.id ?? i}
                  className="font-league-spartan text-xs text-enunas-gray-dark bg-enunas-off-white px-3 py-2"
                >
                  {item.productName ?? 'Artikel'}
                  {(item.quantity ?? 1) > 1 && ` ×${item.quantity}`}
                </span>
              ))}
              {order.items.length > 3 && (
                <span className="font-league-spartan text-xs text-enunas-gray-medium self-center">
                  +{order.items.length - 3} weitere
                </span>
              )}
            </div>
            <div className="flex-1" />
            {order.trackingNumber && (
              <a
                href={`/sendungsverfolgung?tracking=${order.trackingNumber}`}
                className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-black underline underline-offset-4 hover:text-enunas-purple transition-colors duration-300"
              >
                Sendung verfolgen →
              </a>
            )}
          </div>
        </article>
      )}
    </section>
  )
}
