'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { getMockOrders, formatEuro, formatDateLong, getStatusCopy, type AccountOrder } from '@/lib/account'
import AccountButton from './AccountButton'

function OrderRow({ order }: { order: AccountOrder }) {
  const [open, setOpen] = useState(false)
  const status = getStatusCopy(order.status)

  return (
    <article className="border border-enunas-gray-light">
      {/* Header row */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex flex-wrap gap-y-3 gap-x-6 md:grid md:grid-cols-[1fr_140px_120px_100px_40px] items-center p-5 md:p-6 text-left hover:bg-enunas-off-white transition-colors duration-200"
      >
        <div>
          <p className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-gray-medium mb-1">Bestellung</p>
          <p className="font-league-spartan text-sm font-medium text-enunas-black">{order.number}</p>
        </div>
        <div>
          <p className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-gray-medium mb-1">Datum</p>
          <p className="font-league-spartan text-sm text-enunas-black">{formatDateLong(order.placedAt)}</p>
        </div>
        <div>
          <p className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-gray-medium mb-1">Status</p>
          <span className={cn('font-league-spartan text-xs tracking-[0.1em] uppercase font-semibold inline-flex items-center gap-1.5', status.toneClass)}>
            <span aria-hidden>●</span>{status.label}
          </span>
        </div>
        <div>
          <p className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-gray-medium mb-1">Gesamt</p>
          <p className="font-league-spartan text-sm font-medium text-enunas-black">{formatEuro(order.totalCents)}</p>
        </div>
        <span className={cn('hidden md:block text-enunas-gray-medium transition-transform duration-300', open && 'rotate-90')} aria-hidden>
          →
        </span>
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="border-t border-enunas-off-white px-5 md:px-6 py-5 bg-[#FAFAF8]">
          <div className="flex gap-3 flex-wrap mb-4">
            {order.itemsPreview.map((item) => (
              <div key={item.productId} className="relative w-16 h-[84px] bg-enunas-off-white overflow-hidden">
                <Image src={item.imgURL} alt={item.productName} fill sizes="64px" className="object-cover" />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-6 flex-wrap">
            {order.trackingUrl && (
              <Link
                href={order.trackingUrl}
                className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-black underline underline-offset-4 hover:text-enunas-purple transition-colors duration-300"
              >
                Sendung verfolgen →
              </Link>
            )}
            {(order.status === 'delivered' || order.status === 'shipped') && (
              <button className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-gray-medium hover:text-enunas-black transition-colors duration-300">
                Retoure einleiten
              </button>
            )}
          </div>

          {/* Return address — shown when backend marks return as approved/in-progress */}
          {order.returnShipToAddress && (
            <div className="mt-4 border-t border-enunas-gray-light pt-4">
              <p className="font-league-spartan text-[10px] tracking-[0.2em] uppercase text-enunas-gray-medium mb-2">
                Retourenadresse
              </p>
              <pre className="font-league-spartan text-sm text-enunas-black whitespace-pre-line leading-relaxed">
                {order.returnShipToAddress}
              </pre>
              {order.returnNumber && (
                <p className="font-league-spartan text-[11px] text-enunas-gray-medium mt-2">
                  Retourennummer: <span className="font-medium text-enunas-black font-mono">{order.returnNumber}</span>
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  )
}

export default function Bestellungen() {
  const orders = getMockOrders()

  return (
    <section>
      <h2 className="font-cormorant text-2xl md:text-[28px] font-normal text-enunas-black mb-8">
        Meine Bestellungen
      </h2>

      {orders.length === 0 ? (
        <div className="border border-enunas-gray-light p-12 text-center">
          <h3 className="font-cormorant text-2xl text-enunas-black mb-3">Noch keine Bestellungen</h3>
          <p className="font-league-spartan text-sm text-enunas-gray-medium mb-6">Sobald du eine Bestellung aufgegeben hast, findest du sie hier.</p>
          <AccountButton onClick={() => { window.location.href = '/bekleidung' }}>
            Kollektion entdecken
          </AccountButton>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => <OrderRow key={order.id} order={order} />)}
        </div>
      )}
    </section>
  )
}
