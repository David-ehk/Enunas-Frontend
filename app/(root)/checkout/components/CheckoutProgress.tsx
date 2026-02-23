'use client'

interface CheckoutProgressProps {
  currentStep: 1 | 2 | 3
}

const steps = [
  { number: 1, label: 'Versand' },
  { number: 2, label: 'Zahlung' },
  { number: 3, label: 'Überprüfen' },
]

export default function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
  return (
    <div className="flex items-center justify-center mb-12">
      {steps.map((step, index) => {
        const isCompleted = step.number < currentStep
        const isActive = step.number === currentStep

        return (
          <div key={step.number} className="flex items-center">
            {/* Step circle + label */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center text-sm font-league-spartan font-semibold transition-colors duration-300
                  ${isCompleted ? 'bg-enunas-purple text-white' : ''}
                  ${isActive ? 'bg-enunas-purple text-white' : ''}
                  ${!isCompleted && !isActive ? 'border-2 border-enunas-gray-light text-enunas-gray-medium' : ''}
                `}
              >
                {isCompleted ? '✓' : step.number}
              </div>
              <span
                className={`
                  font-league-spartan text-[10px] tracking-[0.2em] uppercase
                  ${isActive ? 'text-enunas-black' : 'text-enunas-gray-medium'}
                `}
              >
                {step.label}
              </span>
            </div>

            {/* Connecting line (not after last step) */}
            {index < steps.length - 1 && (
              <div className="w-16 sm:w-24 h-px mx-3 mb-5 relative">
                <div className="absolute inset-0 bg-enunas-gray-light" />
                <div
                  className="absolute inset-y-0 left-0 bg-enunas-purple transition-all duration-500 ease-out-expo"
                  style={{ width: currentStep > step.number ? '100%' : '0%' }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
