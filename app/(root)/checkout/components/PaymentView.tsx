'use client'

type PaymentMethod = 'paypal' | 'stripe' | 'applepay'

interface PaymentOption {
  id: PaymentMethod
  label: string
  sublabel: string
  accent: string
  badge: string
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'paypal',
    label: 'PayPal',
    sublabel: 'Bezahle sicher mit deinem PayPal-Konto',
    accent: '#0070BA',
    badge: 'PP',
  },
  {
    id: 'stripe',
    label: 'Kreditkarte',
    sublabel: 'Visa · Mastercard · American Express',
    accent: '#370E4D',
    badge: '▪▪',
  },
  {
    id: 'applepay',
    label: 'Apple Pay',
    sublabel: 'Schnell und sicher mit Touch ID oder Face ID',
    accent: '#000000',
    badge: '',
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
                {/* Logo placeholder */}
                <div
                  className="w-12 h-8 flex items-center justify-center rounded text-white text-xs font-bold font-league-spartan flex-shrink-0"
                  style={{ backgroundColor: option.accent }}
                >
                  {option.id === 'applepay' ? (
                    <span className="text-white text-sm">✦</span>
                  ) : (
                    option.badge
                  )}
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
