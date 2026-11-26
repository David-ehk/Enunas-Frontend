import Image from 'next/image';
import Link from 'next/link';

// Source and licence: public/assets/icons/payment/ATTRIBUTION.txt
const PAYMENT_METHODS = [
  { file: 'visa', label: 'Visa' },
  { file: 'mastercard', label: 'Mastercard' },
  { file: 'american-express', label: 'American Express' },
  { file: 'paypal', label: 'PayPal' },
  { file: 'apple-pay', label: 'Apple Pay' },
  { file: 'klarna', label: 'Klarna' },
];

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
              Unser Kundenservice ist Montag bis Samstag von 10:00 – 18:00 Uhr für dich da.
            </p>
            <Link
              href="mailto:info@enunas.com"
              className="inline-block mt-3 sm:mt-[18px] font-cormorant italic text-[16px] sm:text-[20px] text-white pb-0.5 border-b border-white/40 hover:border-white transition-colors duration-200 no-underline"
            >
              info@enunas.com
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
              {PAYMENT_METHODS.map(({ file, label }) => (
                <Image
                  key={file}
                  src={`/assets/icons/payment/${file}.svg`}
                  alt={label}
                  width={60}
                  height={40}
                  className="w-[46px] h-auto sm:w-[60px]"
                />
              ))}
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
