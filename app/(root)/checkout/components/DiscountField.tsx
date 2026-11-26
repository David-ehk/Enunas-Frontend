import type { FormEvent, RefObject } from 'react'

export interface CouponMessage {
  type: 'success' | 'info'
  text: string
}

interface Props {
  /** While true the code field gives way to the offer: the two can never be sent together. */
  offerApplied: boolean
  /** The latest preview already includes the offer discount. */
  offerDiscounted: boolean
  offerError: string | null
  onRemoveOffer: () => void
  inputRef: RefObject<HTMLInputElement | null>
  value: string
  onChange: (value: string) => void
  onApply: (e: FormEvent) => void
  message: CouponMessage | null
}

export default function DiscountField({
  offerApplied, offerDiscounted, offerError, onRemoveOffer,
  inputRef, value, onChange, onApply, message,
}: Props) {
  return (
    <>
      {offerError && (
        <p role="alert" className="font-league-spartan text-[11px] text-enunas-error mt-3">
          {offerError}
        </p>
      )}

      {offerApplied ? (
        <div className="pt-4 mt-4 border-t border-enunas-gray-light space-y-2">
          <p className="font-league-spartan text-[11px] text-enunas-black leading-relaxed">
            Exklusiv-Angebot aktiv — nicht mit einem Rabattcode kombinierbar.
            {offerDiscounted ? '' : ' Der Rabatt wird berechnet, sobald eine Lieferadresse ausgewählt ist.'}
          </p>
          <button
            type="button"
            onClick={onRemoveOffer}
            className="font-league-spartan text-[11px] uppercase tracking-[0.15em] text-enunas-purple underline hover:no-underline transition-colors duration-200"
          >
            Angebot entfernen, um einen Code einzugeben
          </button>
        </div>
      ) : (
        <>
          {/* Coupon code — applying it re-runs the checkout preview, which is what actually
              confirms or rejects the code against the backend. */}
          <form onSubmit={onApply} className="flex gap-2 pt-4 mt-4 border-t border-enunas-gray-light">
            <input
              ref={inputRef}
              type="text"
              name="coupon"
              placeholder="Gutscheincode"
              value={value}
              onChange={e => onChange(e.target.value)}
              className="flex-1 min-w-0 border border-enunas-gray-light px-3 py-2.5 font-league-spartan text-xs text-enunas-black bg-white focus:outline-none focus:border-enunas-purple transition-colors duration-200"
            />
            <button
              type="submit"
              className="flex-shrink-0 font-league-spartan text-[11px] uppercase tracking-[0.15em] text-enunas-purple border border-enunas-purple px-4 hover:bg-enunas-purple hover:text-white transition-colors duration-200"
            >
              Anwenden
            </button>
          </form>
          {message && (
            <p
              className={`font-league-spartan text-[11px] mt-2 ${
                message.type === 'success' ? 'text-enunas-success' : 'text-enunas-gray-medium'
              }`}
            >
              {message.text}
            </p>
          )}
        </>
      )}
    </>
  )
}
