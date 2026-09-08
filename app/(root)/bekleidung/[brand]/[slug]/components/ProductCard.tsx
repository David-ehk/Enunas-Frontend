import Image from 'next/image';
import Link from 'next/link';
import { formatReleaseDateShort } from '@/lib/preview';

export interface RecItem {
  brand: string;
  name: string;
  /** Pre-formatted price, e.g. "€ 1.120". null when the item has no active listing — the card
   *  then renders without a price line. */
  price: string | null;
  /** Pre-formatted pre-discount price. Non-null is itself the "on sale" signal — the card
   *  strikes it through next to `price`. Null when the item is not reduced. */
  originalPrice?: string | null;
  /** Hex values for the small swatch dots below the name */
  colors: string[];
  /** Optional image src; if omitted, the card shows the plain tinted panel */
  image?: string;
  href: string;
  /** True when this recommendation is a not-yet-released product. */
  preview?: boolean;
  /** ISO "YYYY-MM-DD" release date; shown instead of a price when `preview`. */
  releaseDate?: string | null;
}

interface ProductCardProps {
  item: RecItem;
  aspect?: '3/4' | '1/1' | '4/3';
  compact?: boolean;
}

export default function ProductCard({ item, aspect = '3/4', compact = false }: ProductCardProps) {
  // Below md the cards sit in the same 2-up grid as every other recommendation
  // row, so they keep the shared 3/4 portrait there and only take the requested
  // aspect once the desktop split layout kicks in.
  const aspectClass =
    aspect === '1/1' ? 'aspect-[3/4] md:aspect-square' :
    aspect === '4/3' ? 'aspect-[3/4] md:aspect-[4/3]' :
    'aspect-[3/4]';

  return (
    <Link href={item.href} className="group block cursor-pointer">
      <div className={`
        relative ${aspectClass} bg-enunas-off-white overflow-hidden
        ${compact ? 'mb-2.5' : 'mb-3.5'}
        flex items-center justify-center
        transition-opacity duration-200 group-hover:opacity-85
      `}>
        {item.image && (
          <Image src={item.image} alt={item.name} fill className="object-cover" />
        )}
      </div>

      <p className={`
        font-league-spartan ${compact ? 'text-[9px]' : 'text-[10px]'}
        tracking-[0.22em] uppercase font-medium
        text-enunas-gray-medium mb-1.5
      `}>
        {item.brand.toUpperCase()}
      </p>
      <h3 className={`
        font-cormorant ${compact ? 'text-sm' : 'text-[17px]'}
        font-light leading-[1.25] text-enunas-black
        mb-2
      `}>
        {item.name}
      </h3>

      {item.colors.length > 0 && (
        <div className="flex gap-1.5 mb-2.5">
          {item.colors.slice(0, 4).map((c, i) => (
            <span
              key={i}
              className="w-3 h-3 border border-enunas-gray-light block"
              style={{ background: c }}
              aria-hidden
            />
          ))}
        </div>
      )}

      {item.preview ? (
        item.releaseDate && (
          <p
            className={`font-league-spartan ${compact ? 'text-xs' : 'text-[13px]'} font-light text-enunas-purple`}
          >
            Kommt am {formatReleaseDateShort(item.releaseDate)}
          </p>
        )
      ) : (
        item.price !== null && (
          <p className={`
            font-league-spartan ${compact ? 'text-xs' : 'text-[13px]'}
            font-light flex items-baseline gap-2
            ${item.originalPrice ? 'text-enunas-error' : 'text-enunas-black'}
          `}>
            {item.price}
            {item.originalPrice && (
              <span
                className="text-enunas-gray-dark"
                style={{
                  textDecorationLine: 'line-through',
                  textDecorationColor: '#8B1E3F',
                  textDecorationThickness: '1.5px',
                }}
              >
                {item.originalPrice}
              </span>
            )}
          </p>
        )
      )}
    </Link>
  );
}
