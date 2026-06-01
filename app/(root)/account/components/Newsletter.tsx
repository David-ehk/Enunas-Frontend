'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { getMockNewsletterPrefs, type NewsletterCategory } from '@/lib/account'
import AccountButton from './AccountButton'

export default function Newsletter() {
  const initial = getMockNewsletterPrefs()
  const [subscribed, setSubscribed] = useState(initial.subscribed)
  const [categories, setCategories] = useState<NewsletterCategory[]>(initial.categories)
  const [saved, setSaved] = useState(false)

  function toggleCategory(id: string) {
    setCategories((prev) => prev.map((c) => c.id === id ? { ...c, active: !c.active } : c))
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <section>
      <div className="flex items-baseline justify-between mb-8">
        <h2 className="font-cormorant text-2xl md:text-[28px] font-normal text-enunas-black">
          Newsletter
        </h2>
        {saved && (
          <span className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-success">
            Gespeichert ✓
          </span>
        )}
      </div>

      {/* Master toggle */}
      <div className="flex items-center justify-between border border-enunas-gray-light p-6 mb-6">
        <div>
          <p className="font-league-spartan text-sm font-medium text-enunas-black mb-1">E-Mail Newsletter</p>
          <p className="font-league-spartan text-xs text-enunas-gray-medium leading-relaxed">
            Erhalte kuratierte Auswahlen, exklusive Angebote und Neuigkeiten aus der Enunas-Welt.
          </p>
        </div>
        <button
          onClick={() => setSubscribed((v) => !v)}
          aria-pressed={subscribed}
          className={cn(
            'relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-300 ease-out-expo focus:outline-none focus-visible:ring-2 focus-visible:ring-enunas-purple',
            subscribed ? 'bg-enunas-purple' : 'bg-enunas-gray-light'
          )}
        >
          <span
            className={cn(
              'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ease-out-expo',
              subscribed ? 'translate-x-7' : 'translate-x-1'
            )}
          />
          <span className="sr-only">{subscribed ? 'Abonniert' : 'Nicht abonniert'}</span>
        </button>
      </div>

      {/* Category preferences */}
      <div className={cn('transition-opacity duration-300', !subscribed && 'opacity-40 pointer-events-none')}>
        <p className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-gray-medium mb-4">
          Benachrichtigungen
        </p>
        <div className="flex flex-col gap-3 mb-8">
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-start gap-4 border border-enunas-gray-light p-5 cursor-pointer hover:border-enunas-purple transition-colors duration-200 group"
            >
              <div
                onClick={() => toggleCategory(cat.id)}
                className={cn(
                  'flex-shrink-0 mt-0.5 w-5 h-5 border flex items-center justify-center transition-colors duration-200 cursor-pointer',
                  cat.active ? 'bg-enunas-purple border-enunas-purple' : 'bg-white border-enunas-gray-light group-hover:border-enunas-purple'
                )}
              >
                {cat.active && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div>
                <p className="font-league-spartan text-sm font-medium text-enunas-black">{cat.label}</p>
                <p className="font-league-spartan text-xs text-enunas-gray-medium mt-0.5 leading-relaxed">{cat.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <AccountButton onClick={handleSave}>Einstellungen speichern</AccountButton>
    </section>
  )
}
