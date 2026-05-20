interface StockIndicatorProps {
  stockQuantity: number | undefined;
}

/**
 * Stock indicator placed UNDER the "Zum Warenkorb hinzufügen" CTA.
 * - undefined / no variant: renders nothing
 * - 0:        red dot, "Ausverkauft"
 * - 1-5:      red dot, "Nur noch X verfügbar"
 * - > 5:      green dot, "Auf Lager"
 */
export default function StockIndicator({ stockQuantity }: StockIndicatorProps) {
  if (stockQuantity === undefined || stockQuantity === null) return null;

  const isLow = stockQuantity <= 5;
  const label =
    stockQuantity === 0 ? 'Ausverkauft' :
    isLow ? `Nur noch ${stockQuantity} verfügbar` :
    'Auf Lager';

  return (
    <p
      className={`
        font-league-spartan text-[11px] tracking-[0.18em] uppercase
        inline-flex items-center justify-center gap-2
        w-full max-w-[460px] mx-auto
        -mt-4 mb-7
        ${isLow ? 'text-[#B33A1A]' : 'text-enunas-gray-medium'}
      `}
    >
      <span
        className={`block w-1.5 h-1.5 rounded-full ${isLow ? 'bg-[#B33A1A]' : 'bg-[#1F8A5B]'}`}
        aria-hidden
      />
      {label}
    </p>
  );
}
