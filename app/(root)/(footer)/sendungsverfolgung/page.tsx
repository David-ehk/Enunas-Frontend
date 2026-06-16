'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'

function TrackingContent() {
  const searchParams = useSearchParams()
  const initialNumber = searchParams.get('tracking') ?? ''
  const [trackingNumber, setTrackingNumber] = useState(initialNumber)
  const [copied, setCopied] = useState(false)

  const carriers = [
    {
      name: 'DHL',
      url: `https://www.dhl.de/de/privatkunden/pakete-empfangen/verfolgen.html?idc=${encodeURIComponent(trackingNumber)}`,
    },
    {
      name: 'UPS',
      url: `https://www.ups.com/track?tracknum=${encodeURIComponent(trackingNumber)}`,
    },
    {
      name: 'DPD',
      url: `https://www.dpd.com/de/de/empfangen/wo-ist-mein-paket/?parcelNumber=${encodeURIComponent(trackingNumber)}`,
    },
    {
      name: 'FedEx',
      url: `https://www.fedex.com/fedextrack/?tracknumbers=${encodeURIComponent(trackingNumber)}`,
    },
  ]

  const handleCopy = () => {
    if (!trackingNumber) return
    navigator.clipboard.writeText(trackingNumber).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 lg:py-24">
      <p
        className="text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] mb-4"
        style={{ fontFamily: 'var(--font-league-spartan)' }}
      >
        Service
      </p>
      <h1
        className="text-3xl lg:text-4xl font-light text-[#0A0A0A] mb-12"
        style={{ fontFamily: 'var(--font-cormorant)' }}
      >
        Sendungsverfolgung
      </h1>

      <div style={{ fontFamily: 'var(--font-league-spartan)' }}>
        <label className="block text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-3">
          Tracking-Nummer
        </label>
        <div className="flex gap-3 mb-8">
          <input
            type="text"
            value={trackingNumber}
            onChange={e => setTrackingNumber(e.target.value)}
            placeholder="z.B. 1234567890"
            className="flex-1 border border-[#E8E8E8] px-4 py-3 text-[14px] text-[#0A0A0A] placeholder-[#6B6B6B]
                       focus:outline-none focus:border-[#370E4D] transition-colors duration-200"
          />
          <button
            onClick={handleCopy}
            disabled={!trackingNumber}
            className="px-5 py-3 border border-[#E8E8E8] text-[11px] uppercase tracking-[0.1em] text-[#6B6B6B]
                       hover:border-[#370E4D] hover:text-[#370E4D] transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {copied ? 'Kopiert' : 'Kopieren'}
          </button>
        </div>

        {trackingNumber.trim() && (
          <>
            <p className="text-[12px] text-[#6B6B6B] mb-5 uppercase tracking-[0.1em]">
              Paketdienstleister auswählen
            </p>
            <div className="grid grid-cols-2 gap-3">
              {carriers.map(carrier => (
                <a
                  key={carrier.name}
                  href={carrier.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center py-4 border border-[#E8E8E8] text-[12px] uppercase
                             tracking-[0.1em] text-[#0A0A0A] hover:border-[#370E4D] hover:text-[#370E4D]
                             transition-colors duration-200"
                >
                  {carrier.name}
                </a>
              ))}
            </div>
          </>
        )}

        {!trackingNumber.trim() && (
          <p className="text-[13px] text-[#6B6B6B] leading-relaxed">
            Gib deine Tracking-Nummer ein, um dein Paket direkt beim Versanddienstleister zu verfolgen.
            Du findest die Nummer in deiner Versandbestätigung oder in deinen{' '}
            <a href="/account" className="underline hover:text-[#370E4D]">Bestelldetails</a>.
          </p>
        )}
      </div>
    </div>
  )
}

export default function SendungsverfolgungPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <TrackingContent />
    </Suspense>
  )
}
