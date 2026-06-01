// ============================================================
// ENUNAS — Last order summary card
// Drop into: enunas/app/(root)/account/components/RecentOrder.tsx
// ============================================================

import Image from 'next/image'
import Link from 'next/link'
import {
  formatDateLong,
  formatEuro,
  getStatusCopy,
  type AccountOrder,
} from '@/lib/account'
import { cn } from '@/lib/utils'
import AccountButton from './AccountButton'

interface RecentOrderProps {
  order: AccountOrder | null;
}

interface MetaCellProps {
  label: string;
  children: React.ReactNode;
  toneClass?: string;
}

function MetaCell({ label, children, toneClass }: MetaCellProps) {
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

function EmptyState() {
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

export default function RecentOrder({ order }: RecentOrderProps) {
  return (
    <section className="mb-14">
      <div className="flex justify-between items-baseline mb-6">
        <h2 className="font-cormorant text-2xl md:text-[28px] font-normal text-enunas-black">
          Letzte Bestellung
        </h2>
        <Link
          href="/account/bestellungen"
          className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-black underline underline-offset-4 hover:text-enunas-purple transition-colors duration-300"
        >
          Alle ansehen
        </Link>
      </div>

      {!order ? (
        <EmptyState />
      ) : (
        <article className="border border-enunas-gray-light p-6 md:p-7">
          {/* Meta row */}
          <div className="flex flex-wrap gap-y-4 gap-x-8 md:justify-between md:flex-nowrap pb-5 mb-5 border-b border-enunas-off-white">
            <MetaCell label="Bestellung Nr.">
              <span className="font-medium">{order.number}</span>
            </MetaCell>
            <MetaCell label="Datum">
              {formatDateLong(order.placedAt)}
            </MetaCell>
            <MetaCell label="Status">
              <span
                className={cn(
                  'font-league-spartan text-xs tracking-[0.1em] uppercase font-semibold inline-flex items-center gap-1.5',
                  getStatusCopy(order.status).toneClass
                )}
              >
                <span aria-hidden>●</span>
                {getStatusCopy(order.status).label}
              </span>
            </MetaCell>
            <MetaCell label="Gesamt">
              <span className="font-medium">{formatEuro(order.totalCents)}</span>
            </MetaCell>
          </div>

          {/* Items strip + tracking link */}
          <div className="flex items-end gap-3 flex-wrap">
            <div className="flex gap-3">
              {order.itemsPreview.map((item) => (
                <div
                  key={item.productId}
                  className="relative w-16 h-[84px] bg-enunas-off-white overflow-hidden"
                >
                  <Image
                    src={item.imgURL}
                    alt={item.productName}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="flex-1" />
            {order.trackingUrl && (
              <Link
                href={order.trackingUrl}
                className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-black underline underline-offset-4 hover:text-enunas-purple transition-colors duration-300"
              >
                Sendung verfolgen →
              </Link>
            )}
          </div>
        </article>
      )}
    </section>
  )
}
