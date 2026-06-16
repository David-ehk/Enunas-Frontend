'use client'

import { useState } from 'react'

export default function CookieEinstellungenPage() {
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 lg:py-24">
      <p
        className="text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] mb-4"
        style={{ fontFamily: 'var(--font-league-spartan)' }}
      >
        Datenschutz
      </p>
      <h1
        className="text-3xl lg:text-4xl font-light text-[#0A0A0A] mb-12"
        style={{ fontFamily: 'var(--font-cormorant)' }}
      >
        Cookie-Einstellungen
      </h1>

      <div
        className="space-y-6 text-[14px] text-[#2D2D2D]"
        style={{ fontFamily: 'var(--font-league-spartan)' }}
      >
        <div className="border border-[#E8E8E8] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.1em] text-[#0A0A0A] font-medium mb-1">Notwendige Cookies</p>
              <p className="text-[13px] text-[#6B6B6B] leading-relaxed">
                Erforderlich für den Betrieb der Website. Können nicht deaktiviert werden.
              </p>
            </div>
            <div className="w-10 h-6 bg-[#370E4D] rounded-full flex-shrink-0 ml-6 opacity-50 cursor-not-allowed" />
          </div>
        </div>

        <div className="border border-[#E8E8E8] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.1em] text-[#0A0A0A] font-medium mb-1">Analyse-Cookies</p>
              <p className="text-[13px] text-[#6B6B6B] leading-relaxed">
                Helfen uns zu verstehen, wie Besucher die Website nutzen.
              </p>
            </div>
            <button
              role="switch"
              aria-checked={analytics}
              onClick={() => setAnalytics(v => !v)}
              className={`w-10 h-6 rounded-full flex-shrink-0 ml-6 transition-colors duration-200 relative ${
                analytics ? 'bg-[#370E4D]' : 'bg-[#E8E8E8]'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                analytics ? 'translate-x-5' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        <div className="border border-[#E8E8E8] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.1em] text-[#0A0A0A] font-medium mb-1">Marketing-Cookies</p>
              <p className="text-[13px] text-[#6B6B6B] leading-relaxed">
                Ermöglichen personalisierte Werbung auf anderen Plattformen.
              </p>
            </div>
            <button
              role="switch"
              aria-checked={marketing}
              onClick={() => setMarketing(v => !v)}
              className={`w-10 h-6 rounded-full flex-shrink-0 ml-6 transition-colors duration-200 relative ${
                marketing ? 'bg-[#370E4D]' : 'bg-[#E8E8E8]'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                marketing ? 'translate-x-5' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="mt-4 px-8 py-3 bg-[#370E4D] text-white text-[11px] uppercase tracking-[0.15em] hover:bg-[#4A1566] transition-colors duration-200"
          style={{ fontFamily: 'var(--font-league-spartan)' }}
        >
          {saved ? 'Gespeichert' : 'Einstellungen speichern'}
        </button>
      </div>
    </div>
  )
}
