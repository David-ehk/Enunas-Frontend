'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { ApiUserAddress } from '@/types/api'

interface AddressCardProps {
  address: ApiUserAddress
  selected: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
  onSetDefault: () => void
  busy?: boolean
}

export default function AddressCard({
  address, selected, onSelect, onEdit, onDelete, onSetDefault, busy,
}: AddressCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect() } }}
      className={cn(
        'relative border p-5 cursor-pointer transition-colors duration-200 ease-out-expo',
        selected ? 'border-enunas-purple bg-enunas-purple-muted' : 'border-enunas-gray-light hover:border-enunas-gray-medium'
      )}
    >
      {address.isDefault && (
        <span className="absolute top-4 right-4 font-league-spartan text-[10px] tracking-[0.15em] uppercase text-enunas-purple border border-enunas-purple px-2 py-0.5">
          Standard
        </span>
      )}

      <span
        aria-hidden
        className={cn(
          'inline-block w-4 h-4 rounded-full border mb-3 relative transition-colors duration-200',
          selected ? 'border-enunas-purple' : 'border-enunas-gray-medium'
        )}
      >
        {selected && (
          <span className="absolute inset-[3px] rounded-full bg-enunas-purple" />
        )}
      </span>

      <p className="font-league-spartan text-sm text-enunas-black leading-relaxed pr-16">
        {address.firstName} {address.lastName}<br />
        {address.street} {address.houseNumber}<br />
        {address.addressLine2 && <>{address.addressLine2}<br /></>}
        {address.postalCode} {address.city}<br />
        Deutschland
      </p>

      <div className="flex gap-5 mt-4">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onEdit() }}
          disabled={busy}
          className="font-league-spartan text-[11px] tracking-[0.15em] uppercase text-enunas-gray-medium hover:text-enunas-purple transition-colors duration-200 disabled:opacity-50"
        >
          Bearbeiten
        </button>
        {!address.isDefault && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onSetDefault() }}
            disabled={busy}
            className="font-league-spartan text-[11px] tracking-[0.15em] uppercase text-enunas-gray-medium hover:text-enunas-purple transition-colors duration-200 disabled:opacity-50"
          >
            Als Standard
          </button>
        )}
        {confirmingDelete ? (
          <span className="flex items-center gap-3">
            <span className="font-league-spartan text-[11px] text-enunas-gray-medium">Wirklich löschen?</span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete() }}
              disabled={busy}
              className="font-league-spartan text-[11px] tracking-[0.15em] uppercase text-enunas-error hover:opacity-70 transition-opacity duration-200 disabled:opacity-50"
            >
              Ja, löschen
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setConfirmingDelete(false) }}
              className="font-league-spartan text-[11px] tracking-[0.15em] uppercase text-enunas-gray-medium hover:text-enunas-black transition-colors duration-200"
            >
              Abbrechen
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setConfirmingDelete(true) }}
            disabled={busy}
            className="font-league-spartan text-[11px] tracking-[0.15em] uppercase text-enunas-error hover:opacity-70 transition-opacity duration-200 disabled:opacity-50"
          >
            Löschen
          </button>
        )}
      </div>
    </div>
  )
}
