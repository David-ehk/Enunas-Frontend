import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/app/Homepage/components/navbar'
import CartFooter from '@/app/(root)/cart/components/CartFooter'
import { generateSlug } from '@/lib/product'
import { formatCountdown } from '@/lib/upsellOffer'
import { formatEuro } from '@/lib/format'
import type { LiveOffer } from '@/types/api'
import PrimaryLink from './PrimaryLink'

function SmallCheckmark() {
  return (
    <div className="w-6 h-6 rounded-full border border-enunas-purple flex items-center justify-center flex-shrink-0">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 6L5 9L10 3" stroke="#370E4D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

// ── Offer countdown ────────────────────────────────────────────────────────────

function CountdownBanner({ display, expired, discountPct }: { display: string; expired: boolean; discountPct: number }) {
  return (
    <div className="text-center mb-14">
      <p className="font-league-spartan text-[10px] tracking-[0.32em] uppercase text-enunas-gray-medium mb-4">
        Exklusiv für dich
      </p>
      {expired ? (
        <h2
          className="font-cormorant text-2xl sm:text-4xl lg:text-5xl font-light text-enunas-gray-medium mb-4"
          style={{ letterSpacing: '0.02em', lineHeight: 1.1 }}
        >
          Angebot abgelaufen.
        </h2>
      ) : (
        <>
          <h2
            className="font-cormorant font-light text-enunas-black mb-3"
            style={{ fontSize: 'clamp(22px, 6vw, 52px)', letterSpacing: '0.02em', lineHeight: 1.1 }}
          >
            Nur noch{' '}
            <span
              className="font-cormorant tabular-nums"
              style={{ color: '#8B1E3F', fontVariantNumeric: 'tabular-nums' }}
            >
              {display}
            </span>
            {' '}— {discountPct}% Rabatt
          </h2>
          <p className="font-league-spartan text-xs sm:text-sm text-enunas-gray-medium max-w-xs sm:max-w-sm mx-auto leading-relaxed px-4 sm:px-0">
            Diese Auswahl wird nicht jedem gemacht — sei schnell, das Angebot läuft ab.
          </p>
        </>
      )}
    </div>
  )
}

// ── View ───────────────────────────────────────────────────────────────────────

/** The confirmation of a paid order that came with an offer. */
export default function OfferConfirmation({
  offer,
  remaining,
  orderNumber,
}: {
  offer: LiveOffer
  remaining: number
  orderNumber: string
}) {
  const { product } = offer
  const expired = remaining === 0
  const offerHref = `/angebot/${generateSlug(product.brandName)}/${product.slug}?order=${encodeURIComponent(orderNumber)}`

  const card = (
    <>
      <div className="relative aspect-[3/4] overflow-hidden bg-enunas-off-white mb-3">
        {product.images[0] && (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className={expired
              ? 'object-cover opacity-50'
              : 'object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105 motion-reduce:transform-none'}
            sizes="320px"
          />
        )}
        {!expired && (
          <div
            className="absolute top-3 left-3 bg-enunas-purple text-white font-league-spartan px-2 py-1"
            style={{ fontSize: '10px', letterSpacing: '0.08em' }}
          >
            −{offer.percent}%
          </div>
        )}
      </div>
      <p className="font-league-spartan text-[10px] text-enunas-gray-medium uppercase tracking-[0.1em] mb-1">
        {product.brandName}
      </p>
      <p className="font-cormorant text-base text-enunas-black leading-snug mb-2 group-hover:text-enunas-purple transition-colors duration-200">
        {product.name}
      </p>
      {!expired && (
        <div className="flex items-baseline gap-2">
          <span className="font-league-spartan text-sm text-enunas-purple font-medium">
            {formatEuro(offer.offerPrice)}
          </span>
          <span className="font-league-spartan text-xs text-enunas-gray-medium line-through">
            {formatEuro(offer.listPrice)}
          </span>
        </div>
      )}
    </>
  )

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white pb-24 px-4 sm:px-8 lg:px-16" style={{ paddingTop: '60px' }}>
        <div className="max-w-[1440px] mx-auto">

          {/* Compact confirmation header */}
          <div className="text-center pt-10 pb-10 border-b border-enunas-gray-light mb-10">
            <div className="flex items-center justify-center gap-3 mb-5">
              <SmallCheckmark />
              <p className="font-league-spartan text-[11px] tracking-[0.28em] uppercase text-enunas-gray-medium">
                Bestellung bestätigt
              </p>
            </div>
            <h1
              className="font-cormorant text-2xl sm:text-3xl lg:text-4xl font-light text-enunas-black"
              style={{ letterSpacing: '0.02em' }}
            >
              Vielen Dank für deine Bestellung.
            </h1>
            {orderNumber && (
              <p className="font-league-spartan text-xs text-enunas-gray-medium mt-3 tracking-[0.12em]">
                Bestellnummer:{' '}
                <span className="text-enunas-black font-medium">{orderNumber}</span>
              </p>
            )}
            <p className="font-league-spartan text-xs text-enunas-gray-medium mt-2">
              Du erhältst in Kürze eine Bestätigung per E-Mail.
            </p>
            <p className="font-cormorant italic text-base text-enunas-gray-medium mt-5 max-w-md mx-auto leading-relaxed">
              Als besonderen Dank für deine Bestellung haben wir dich für ein exklusives Angebot
              ausgewählt — eine Gelegenheit, die nicht jeder erhält.
            </p>
          </div>

          {/* Countdown and offered product */}
          <div className="py-8 lg:py-12">
            <CountdownBanner
              display={formatCountdown(remaining)}
              expired={expired}
              discountPct={offer.percent}
            />

            {/* Product card — click to see full offer */}
            <div className="flex justify-center mb-16">
              {expired ? (
                <div className="max-w-xs w-full" aria-disabled="true">{card}</div>
              ) : (
                <Link href={offerHref} className="group block max-w-xs w-full">{card}</Link>
              )}
            </div>

            {/* CTAs */}
            <div className="h-px bg-enunas-gray-light mb-12 max-w-[1280px] mx-auto" />
            <div className="flex flex-col items-center gap-5">
              <PrimaryLink href="/bekleidung">Weiter einkaufen</PrimaryLink>
              <Link
                href="/account"
                className="font-league-spartan text-xs text-enunas-gray-medium tracking-[0.12em] uppercase hover:text-enunas-black transition-colors duration-200"
              >
                Meine Bestellungen ansehen
              </Link>
            </div>
          </div>
        </div>
      </div>
      <CartFooter />
    </>
  )
}
