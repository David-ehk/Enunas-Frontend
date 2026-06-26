import Link from 'next/link';

/**
 * Enunas — Cart / Checkout footer strip.
 * Variant C · Hairline Divider · Full-width
 *
 * Black background, 3-section editorial layout:
 *   ┌─────────────────────────┬─────────────────────────┐
 *   │ Lieferung & Rückgabe    │ Können wir dir helfen?  │
 *   └─────────────────────────┴─────────────────────────┘
 *   ──────── hairline divider ────────────────────────────
 *   Zahlungsarten · ◾◾◾◾◾◾                SSL · Käuferschutz
 *
 * Drop-in replacement for app/(root)/cart/components/CartFooter.tsx
 * Also use on checkout. Pure server component — no client JS needed.
 */
export default function CartFooter() {
  return (
    <div className="bg-black text-white font-league-spartan px-4 pt-10 pb-8 sm:px-10 sm:pt-14 lg:px-20 lg:pt-16 lg:pb-10 w-full box-border">
      <div className="max-w-[1280px] mx-auto">
        {/* ─── Two-column body ─── */}
        <div className="grid grid-cols-1 gap-6 pb-8 sm:grid-cols-2 sm:gap-16 sm:pb-11 lg:gap-24 lg:pb-11">
          <div>
            <p className="font-league-spartan text-[11px] tracking-[0.28em] uppercase text-white/55 mb-3 sm:mb-[18px]">
              Lieferung &amp; Rückgabe
            </p>
            <p className="font-cormorant text-[17px] sm:text-[22px] font-light leading-[1.45] text-white/95">
              Keine Zollgebühren bei deiner Bestellung. 14 Tage Rückgaberecht — kostenfrei und unkompliziert.
            </p>
          </div>

          <div>
            <p className="font-league-spartan text-[11px] tracking-[0.28em] uppercase text-white/55 mb-3 sm:mb-[18px]">
              Können wir dir behilflich sein?
            </p>
            <p className="font-cormorant text-[17px] sm:text-[22px] font-light leading-[1.45] text-white/95">
              Unser Kundenservice ist Montag bis Samstag von 9:30 – 19:00 Uhr für dich da.
            </p>
            <Link
              href="mailto:contact@enunas.com"
              className="inline-block mt-3 sm:mt-[18px] font-cormorant italic text-[16px] sm:text-[20px] text-white pb-0.5 border-b border-white/40 hover:border-white transition-colors duration-200 no-underline"
            >
              contact@enunas.com
            </Link>
          </div>
        </div>

        {/* ─── Hairline divider ─── */}
        <div className="h-px bg-white/[0.18] mb-6 sm:mb-9" />

        {/* ─── Payment row · marks left, security right ─── */}
        <div className="flex flex-col gap-5 sm:flex-row sm:justify-between sm:items-center sm:gap-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <p className="font-league-spartan text-[11px] tracking-[0.28em] uppercase text-white/55">
              Zahlungsarten
            </p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <PayTile><MarkVisa /></PayTile>
              <PayTile><MarkMastercard /></PayTile>
              <PayTile><MarkAmex /></PayTile>
              <PayTile><MarkPaypal /></PayTile>
              <PayTile><MarkApplePay /></PayTile>
              <PayTile><MarkKlarna /></PayTile>
            </div>
          </div>

          <div className="flex items-center gap-2 text-white/60">
            <LockIcon />
            <p className="font-league-spartan text-[11px] tracking-[0.15em] uppercase">
              SSL-verschlüsselt · Käuferschutz
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Payment tile wrapper · uniform 60×40 white pill
─────────────────────────────────────────────────────────── */
function PayTile({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center justify-center w-[46px] h-8 sm:w-[60px] sm:h-10 bg-white rounded-[4px]">
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────
   Brand-accurate payment marks
   All marks render inside a 48×32 viewBox so they sit
   evenly inside the 60×40 PayTile.
─────────────────────────────────────────────────────────── */

function MarkVisa() {
  return (
    <svg width="48" height="32" viewBox="0 0 48 32" aria-label="Visa">
      <text
        x="24" y="22" textAnchor="middle"
        fontFamily="'League Spartan', sans-serif"
        fontSize="13" fontWeight="800" letterSpacing="1.2"
        fontStyle="italic" fill="#1A1F71"
      >VISA</text>
    </svg>
  );
}

function MarkMastercard() {
  return (
    <svg width="48" height="32" viewBox="0 0 48 32" aria-label="Mastercard">
      <circle cx="20" cy="16" r="8" fill="#EB001B" />
      <circle cx="28" cy="16" r="8" fill="#F79E1B" />
      <path d="M24 9.6 A8 8 0 0 1 24 22.4 A8 8 0 0 1 24 9.6 Z" fill="#FF5F00" />
    </svg>
  );
}

function MarkAmex() {
  return (
    <svg width="48" height="32" viewBox="0 0 48 32" aria-label="American Express">
      <rect width="48" height="32" fill="#006FCF" />
      <text x="24" y="14" textAnchor="middle"
        fontFamily="'League Spartan', sans-serif"
        fontSize="6" fontWeight="800" letterSpacing="0.4" fill="#fff"
      >AMERICAN</text>
      <text x="24" y="22" textAnchor="middle"
        fontFamily="'League Spartan', sans-serif"
        fontSize="6" fontWeight="800" letterSpacing="0.4" fill="#fff"
      >EXPRESS</text>
    </svg>
  );
}

function MarkPaypal() {
  return (
    <svg width="48" height="32" viewBox="0 0 48 32" aria-label="PayPal">
      <text x="24" y="21" textAnchor="middle"
        fontFamily="'League Spartan', sans-serif"
        fontSize="10" fontWeight="700" letterSpacing="0.1"
        fontStyle="italic"
      >
        <tspan fill="#003087">Pay</tspan>
        <tspan fill="#0070BA">Pal</tspan>
      </text>
    </svg>
  );
}

function MarkApplePay() {
  return (
    <svg width="48" height="32" viewBox="0 0 48 32" aria-label="Apple Pay">
      <path
        d="M14.5 13.2c-.55 0-1.2.34-1.6.78-.37.4-.7 1.05-.62 1.66.6.05 1.22-.32 1.6-.76.38-.43.66-1.05.62-1.68zm.6 1.78c-.88-.05-1.62.5-2.04.5-.42 0-1.06-.48-1.74-.46-.9.01-1.72.52-2.18 1.32-.93 1.62-.24 4.02.67 5.34.45.65.98 1.37 1.68 1.34.67-.03.93-.43 1.74-.43.81 0 1.04.43 1.74.42.72-.01 1.17-.66 1.61-1.31a5.78 5.78 0 0 0 .73-1.5c-1.18-.45-1.4-2.13-.24-2.77-.36-.45-.92-.86-1.97-.95z"
        fill="#0A0A0A"
      />
      <text x="20" y="21"
        fontFamily="'League Spartan', sans-serif"
        fontSize="11" fontWeight="600" fill="#0A0A0A" letterSpacing="0.2"
      >Pay</text>
    </svg>
  );
}

function MarkKlarna() {
  return (
    <svg width="48" height="32" viewBox="0 0 48 32" aria-label="Klarna">
      <text x="24" y="21" textAnchor="middle"
        fontFamily="'League Spartan', sans-serif"
        fontSize="11" fontWeight="700" letterSpacing="-0.3" fill="#0A0A0A"
      >Klarna.</text>
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="14" height="16" viewBox="0 0 14 16"
      fill="none" stroke="currentColor" strokeWidth="1.2"
      aria-hidden="true"
    >
      <rect x="2" y="7" width="10" height="7" rx="1" />
      <path d="M4 7V4.5a3 3 0 0 1 6 0V7" />
    </svg>
  );
}
