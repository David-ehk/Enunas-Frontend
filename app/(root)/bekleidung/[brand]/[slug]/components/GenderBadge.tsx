import { Gender } from '../types/product';

interface GenderBadgeProps {
  gender: Gender;
}

// The backend stores the enum in English; the storefront is German. Rendering the raw value
// printed "UNISEX"/"MEN"/"WOMEN" at the customer.
export const GENDER_LABELS: Record<NonNullable<Gender>, string> = {
  UNISEX: 'Unisex',
  MEN: 'Herren',
  WOMEN: 'Damen',
};

export default function GenderBadge({ gender }: GenderBadgeProps) {
  if (!gender) return null;

  const label = GENDER_LABELS[gender];
  if (!label) return null;

  return (
    <span
      className="
        text-[10px] tracking-[0.2em] uppercase
        text-enunas-purple
        border border-enunas-purple
        px-3 py-1.5 leading-none
      "
      style={{ fontFamily: 'var(--font-league-spartan)' }}
    >
      {label}
    </span>
  );
}
