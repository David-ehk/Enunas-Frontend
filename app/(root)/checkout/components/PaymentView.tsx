'use client'

import React from 'react'

type PaymentMethod = 'paypal' | 'stripe' | 'applepay'

// ── Logo components ───────────────────────────────────────────────────────────

const PayPalLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 124 33"
    width="80"
    height="21"
    role="img"
    aria-label="PayPal"
  >
    {/* "Pay" — dark blue */}
    <path fill="#003087" d="M46.2 5.2h-7.8c-.5 0-1 .4-1.1.9L34 26.7c-.1.4.2.7.6.7h3.7c.5 0 1-.4 1.1-.9l.9-5.7c.1-.5.5-.9 1.1-.9h2.5c5.1 0 8.1-2.5 8.8-7.4.3-2.1 0-3.8-1-5-1.1-1.2-3-1.8-5.5-1.8zm.9 7.3c-.4 2.7-2.5 2.7-4.4 2.7h-1.1l.8-5.1c0-.3.3-.5.6-.5h.5c1.3 0 2.6 0 3.3.8.4.4.5 1.1.3 2.1z"/>
    <path fill="#003087" d="M76.7 12.4h-3.8c-.3 0-.6.2-.6.5l-.1.9-.2-.3c-.8-1.1-2.4-1.5-4.1-1.5-3.8 0-7 2.9-7.7 6.9-.3 2 .1 3.9 1.2 5.2 1 1.2 2.5 1.7 4.3 1.7 3 0 4.7-2 4.7-2l-.1.9c-.1.4.2.7.6.7h3.4c.5 0 1-.4 1.1-.9l2-12.4c.1-.4-.2-.7-.7-.7zm-5.9 6.7c-.3 2-1.9 3.3-3.9 3.3-1 0-1.8-.3-2.3-.9s-.7-1.4-.5-2.4c.3-2 1.9-3.3 3.9-3.3 1 0 1.8.3 2.3.9.5.7.7 1.5.5 2.4z"/>
    {/* "Pal" — light blue */}
    <path fill="#009cde" d="M87.1 5.2h-7.8c-.5 0-1 .4-1.1.9L74.9 26.7c-.1.4.2.7.6.7h4c.3 0 .7-.3.7-.6l.9-6c.1-.5.5-.9 1.1-.9h2.5c5.1 0 8.1-2.5 8.8-7.4.3-2.1 0-3.8-1-5-1.1-1.2-3-1.8-5.4-1.8zm.9 7.3c-.4 2.7-2.5 2.7-4.4 2.7h-1.1l.8-5.1c0-.3.3-.5.6-.5h.5c1.3 0 2.6 0 3.3.8.4.4.6 1.1.3 2.1z"/>
    <path fill="#009cde" d="M117.6 12.4h-3.8c-.3 0-.6.2-.6.5l-.1.9-.2-.3c-.8-1.1-2.4-1.5-4.1-1.5-3.8 0-7 2.9-7.7 6.9-.3 2 .1 3.9 1.2 5.2 1 1.2 2.5 1.7 4.3 1.7 3 0 4.7-2 4.7-2l-.1.9c-.1.4.2.7.6.7h3.4c.5 0 1-.4 1.1-.9l2-12.4c.1-.4-.2-.7-.6-.7zm-5.9 6.7c-.3 2-1.9 3.3-3.9 3.3-1 0-1.8-.3-2.3-.9s-.7-1.4-.5-2.4c.3-2 1.9-3.3 3.9-3.3 1 0 1.8.3 2.3.9.6.7.7 1.5.5 2.4z"/>
    <path fill="#009cde" d="M122.6 5.9l-3.4 21.4c-.1.4.2.7.6.7h3.3c.5 0 1-.4 1.1-.9l3.3-21.1c.1-.4-.2-.7-.6-.7h-3.7c-.3.1-.5.3-.6.6z"/>
  </svg>
)

const CreditCardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 44 28"
    width="44"
    height="28"
    role="img"
    aria-label="Kreditkarte"
  >
    {/* Card body */}
    <rect x="0.5" y="0.5" width="43" height="27" rx="3.5" fill="#F6F6F6" stroke="#D8D8D8"/>
    {/* Magnetic stripe */}
    <rect y="5" width="44" height="6" fill="#D0D0D0"/>
    {/* EMV chip */}
    <rect x="3.5" y="15" width="9" height="7" rx="1.5" fill="#E8C84A" stroke="#C4A030" strokeWidth="0.5"/>
    <line x1="3.5" y1="18.5" x2="12.5" y2="18.5" stroke="#C4A030" strokeWidth="0.5"/>
    <rect x="5.5" y="15" width="2.5" height="7" fill="#C4A030" opacity="0.45"/>
    {/* Card number placeholder dots */}
    <circle cx="18" cy="19" r="1.1" fill="#B8B8B8"/>
    <circle cx="21.5" cy="19" r="1.1" fill="#B8B8B8"/>
    <circle cx="25" cy="19" r="1.1" fill="#B8B8B8"/>
    <circle cx="28.5" cy="19" r="1.1" fill="#B8B8B8"/>
    <circle cx="32" cy="19" r="1.1" fill="#B8B8B8"/>
    <circle cx="35.5" cy="19" r="1.1" fill="#B8B8B8"/>
  </svg>
)

const MastercardMark = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 38 24"
    width="38"
    height="24"
    role="img"
    aria-label="Mastercard"
  >
    <defs>
      <clipPath id="mc-left-clip">
        <circle cx="13" cy="12" r="11"/>
      </clipPath>
    </defs>
    <circle cx="13" cy="12" r="11" fill="#EB001B"/>
    <circle cx="25" cy="12" r="11" fill="#F79E1B"/>
    {/* Orange overlap */}
    <circle cx="25" cy="12" r="11" fill="#FF5F00" clipPath="url(#mc-left-clip)"/>
  </svg>
)

const ApplePayLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 76 28"
    width="76"
    height="28"
    role="img"
    aria-label="Apple Pay"
  >
    <rect width="76" height="28" rx="5" fill="#000"/>
    {/* Apple logo path — simplified but recognisable */}
    <path
      d="M17.4 9.2c.7-.9 1.2-2.1 1.1-3.3-1.1.1-2.3.7-3 1.6-.7.8-1.2 2-.1 3.2 1 .1 2-.6 3-1.5z"
      fill="#fff"
    />
    <path
      d="M18.5 10.8c-1.7-.1-3.1 1-3.9 1s-2-.9-3.4-.9c-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.3 1.9 2.7 3.3 2.6 1.3 0 1.8-.8 3.3-.8 1.5 0 2 .8 3.3.8 1.4 0 2.3-1.3 3.2-2.6.6-.9 1-1.8 1.3-2.7-3.3-1.3-3.2-6.3.1-7.5-.7-1.2-2-2-3.3-1.7z"
      fill="#fff"
    />
    {/* "Pay" text */}
    <text
      x="28"
      y="19"
      fontFamily="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"
      fontSize="12"
      fontWeight="500"
      fill="#fff"
      letterSpacing="0.02em"
    >
      Pay
    </text>
  </svg>
)

// ─────────────────────────────────────────────────────────────────────────────

interface PaymentOption {
  id: PaymentMethod
  label: string
  sublabel: string
  Logo: React.FC
  SecondaryLogo?: React.FC
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'paypal',
    label: 'PayPal',
    sublabel: 'Bezahle sicher mit deinem PayPal-Konto',
    Logo: PayPalLogo,
  },
  {
    id: 'stripe',
    label: 'Kreditkarte',
    sublabel: 'Visa · Mastercard · American Express',
    Logo: CreditCardIcon,
    SecondaryLogo: MastercardMark,
  },
  {
    id: 'applepay',
    label: 'Apple Pay',
    sublabel: 'Schnell und sicher mit Touch ID oder Face ID',
    Logo: ApplePayLogo,
  },
]

interface PaymentViewProps {
  selected: PaymentMethod | null
  onSelect: (method: PaymentMethod) => void
  onNext: () => void
  onBack: () => void
}

export default function PaymentView({ selected, onSelect, onNext, onBack }: PaymentViewProps) {
  return (
    <div className="animate-fade-in-up">
      <h2 className="font-cormorant text-2xl text-enunas-black mb-8">Zahlungsmethode</h2>

      <div className="space-y-4 mb-10">
        {PAYMENT_OPTIONS.map((option) => {
          const isSelected = selected === option.id
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={`
                w-full text-left p-5 border transition-all duration-200 ease-out-expo relative
                ${isSelected
                  ? 'border-enunas-purple shadow-sm'
                  : 'border-enunas-gray-light hover:-translate-y-0.5 hover:shadow-sm'
                }
              `}
            >
              {/* Checkmark when selected */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-enunas-purple flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">✓</span>
                </div>
              )}

              <div className="flex items-center gap-4">
                {/* Logo area */}
                <div className="flex items-center gap-2 flex-shrink-0 min-w-[56px]">
                  <option.Logo />
                  {option.SecondaryLogo && <option.SecondaryLogo />}
                </div>

                <div>
                  <p className="font-league-spartan text-sm font-semibold text-enunas-black tracking-wide">
                    {option.label}
                  </p>
                  <p className="font-league-spartan text-xs text-enunas-gray-medium mt-0.5">
                    {option.sublabel}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onBack}
          className="sm:w-auto px-8 py-4 font-league-spartan text-sm tracking-[0.15em] uppercase text-enunas-purple border border-enunas-purple hover:bg-enunas-purple hover:text-white transition-colors duration-200 ease-out-expo"
        >
          ← Zurück
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!selected}
          className={`
            flex-1 py-4 font-league-spartan text-sm tracking-[0.15em] uppercase transition-colors duration-200 ease-out-expo
            ${selected
              ? 'bg-enunas-purple text-white hover:bg-enunas-purple-light'
              : 'bg-enunas-gray-light text-enunas-gray-medium cursor-not-allowed'
            }
          `}
        >
          Weiter zur Überprüfung →
        </button>
      </div>
    </div>
  )
}
