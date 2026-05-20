import { Gender } from '../types/product';

interface GenderBadgeProps {
  gender: Gender;
}

/**
 * Small monospace purple-outlined badge next to the brand link.
 * Renders nothing when gender is null.
 */
export default function GenderBadge({ gender }: GenderBadgeProps) {
  if (!gender) return null;
  return (
    <span
      className="
        font-mono text-[10px] tracking-[0.2em] uppercase
        text-enunas-purple
        border border-enunas-purple
        px-3 py-1.5 leading-none
      "
    >
      {gender}
    </span>
  );
}
