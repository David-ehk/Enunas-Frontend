'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { PaymentMethod } from '@/lib/account'

function CardIcon({ type }: { type: PaymentMethod['type'] }) {
  if (type === 'visa') {
    return (
      <svg width="38" height="24" viewBox="0 0 48 32" className="flex-shrink-0">
        <text x="24" y="22" textAnchor="middle" fontFamily="'League Spartan',sans-serif"
          fontSize="14" fontWeight="800" fontStyle="italic" letterSpacing="1" fill="#1A1F71">VISA</text>
      </svg>
    )
  }
  if (type === 'mastercard') {
    return (
      <svg width="38" height="24" viewBox="0 0 48 32" className="flex-shrink-0">
        <circle cx="20" cy="16" r="8.5" fill="#EB001B" />
        <circle cx="28" cy="16" r="8.5" fill="#F79E1B" />
        <path d="M24 9.3a8.5 8.5 0 0 1 0 13.4 8.5 8.5 0 0 1 0-13.4Z" fill="#FF5F00" />
      </svg>
    )
  }
  if (type === 'paypal') {
    return (
      <svg width="38" height="24" viewBox="0 0 48 32" className="flex-shrink-0">
        <text x="24" y="21" textAnchor="middle" fontFamily="'League Spartan',sans-serif" fontSize="11" fontWeight="800" fontStyle="italic">
          <tspan fill="#003087">Pay</tspan><tspan fill="#0070BA">Pal</tspan>
        </text>
      </svg>
    )
  }
  if (type === 'klarna') {
    return (
      <svg width="38" height="24" viewBox="0 0 48 32" className="flex-shrink-0">
        <rect x="6" y="9" width="36" height="14" rx="3" fill="#FFB3C7" />
        <text x="24" y="20" textAnchor="middle" fontFamily="'League Spartan',sans-serif" fontSize="9.5" fontWeight="800" fill="#0A0A0A">Klarna.</text>
      </svg>
    )
  }
  return null
}

function PaymentCard({ method, onDelete, onSetDefault }: {
  method: PaymentMethod;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}) {
  return (
    <div className={cn('border p-6 relative', method.isDefault ? 'border-enunas-purple' : 'border-enunas-gray-light')}>
      {method.isDefault && (
        <span className="absolute top-4 right-4 font-league-spartan text-[10px] tracking-[0.2em] uppercase text-enunas-purple border border-enunas-purple px-2 py-1">
          Standard
        </span>
      )}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-9 bg-enunas-off-white flex items-center justify-center">
          <CardIcon type={method.type} />
        </div>
        <div>
          <p className="font-league-spartan text-sm font-medium text-enunas-black">
            {method.label}
            {method.last4 && ` •••• ${method.last4}`}
          </p>
          {method.expiryMonth && method.expiryYear && (
            <p className="font-league-spartan text-[11px] text-enunas-gray-medium mt-0.5">
              Gültig bis {String(method.expiryMonth).padStart(2, '0')}/{method.expiryYear}
            </p>
          )}
          {method.email && (
            <p className="font-league-spartan text-[11px] text-enunas-gray-medium mt-0.5">{method.email}</p>
          )}
        </div>
      </div>
      <div className="flex gap-5">
        {!method.isDefault && (
          <button
            onClick={() => onSetDefault(method.id)}
            className="font-league-spartan text-[11px] tracking-[0.18em] uppercase text-enunas-gray-medium hover:text-enunas-purple transition-colors duration-200"
          >
            Als Standard
          </button>
        )}
        <button
          onClick={() => onDelete(method.id)}
          className="font-league-spartan text-[11px] tracking-[0.18em] uppercase text-enunas-error hover:opacity-70 transition-opacity duration-200"
        >
          Entfernen
        </button>
      </div>
    </div>
  )
}

export default function Zahlungen() {
  const [methods, setMethods] = useState<PaymentMethod[]>([])

  function handleDelete(id: string) {
    setMethods((prev) => prev.filter((m) => m.id !== id))
  }

  function handleSetDefault(id: string) {
    setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })))
  }

  return (
    <section>
      <h2 className="font-cormorant text-2xl md:text-[28px] font-normal text-enunas-black mb-8">
        Zahlungsmethoden
      </h2>

      {methods.length === 0 ? (
        <div className="border border-enunas-gray-light p-12 text-center mb-8">
          <p className="font-league-spartan text-sm text-enunas-gray-medium">Keine gespeicherten Zahlungsmethoden.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {methods.map((m) => (
            <PaymentCard key={m.id} method={m} onDelete={handleDelete} onSetDefault={handleSetDefault} />
          ))}
        </div>
      )}

      <div className="border border-enunas-gray-light p-6 bg-enunas-off-white/40">
        <p className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-gray-medium mb-2">Hinweis</p>
        <p className="font-league-spartan text-sm text-enunas-gray-dark leading-relaxed">
          Zahlungsmethoden werden sicher über Mollie gespeichert. Du kannst beim Checkout weitere Methoden hinzufügen.
        </p>
      </div>
    </section>
  )
}
