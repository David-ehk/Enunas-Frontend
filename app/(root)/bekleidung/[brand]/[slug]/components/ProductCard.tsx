import Image from 'next/image';
import Link from 'next/link';

export interface RecItem {
  brand: string;
  name: string;
  /** Pre-formatted price, e.g. "€ 1.120" */
  price: string;
  /** Hex values for the small swatch dots below the name */
  colors: string[];
  /** Optional image src; if omitted, a tinted SVG placeholder renders */
  image?: string;
  /** Tone used for the placeholder silhouette when no image */
  tone?: string;
  /** Silhouette kind for placeholder: top | bottom | shoe | accessory | jacket | bag */
  kind?: 'top' | 'bottom' | 'shoe' | 'accessory' | 'jacket' | 'bag';
  href: string;
}

interface ProductCardProps {
  item: RecItem;
  aspect?: '3/4' | '1/1' | '4/3';
  compact?: boolean;
}

export default function ProductCard({ item, aspect = '3/4', compact = false }: ProductCardProps) {
  const aspectClass =
    aspect === '1/1' ? 'aspect-square' :
    aspect === '4/3' ? 'aspect-[4/3]' :
    'aspect-[3/4]';

  return (
    <Link href={item.href} className="group block cursor-pointer">
      <div className={`
        relative ${aspectClass} bg-enunas-off-white overflow-hidden
        ${compact ? 'mb-2.5' : 'mb-3.5'}
        flex items-center justify-center
        transition-opacity duration-200 group-hover:opacity-85
      `}>
        {item.image ? (
          <Image src={item.image} alt={item.name} fill className="object-cover" />
        ) : (
          <CategorySilhouette kind={item.kind ?? 'top'} tone={item.tone ?? '#9b8e7a'} />
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

      <p className={`
        font-league-spartan ${compact ? 'text-xs' : 'text-[13px]'}
        font-light text-enunas-black
      `}>
        {item.price}
      </p>
    </Link>
  );
}

function CategorySilhouette({ kind, tone }: { kind: string; tone: string }) {
  const svg = SILHOUETTES[kind] ?? SILHOUETTES.top;
  return (
    <div
      className="w-3/5 h-[60%] flex items-center justify-center"
      style={{ color: tone }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

const SILHOUETTES: Record<string, string> = {
  top: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
    <path d="M22 30 L34 18 L42 20 L46 26 L54 26 L58 20 L66 18 L78 30 L74 40 L74 82 L26 82 L26 40 Z" fill="currentColor"/>
    <path d="M46 20 L50 32 L54 20 L52 18 L50 20 L48 18 Z" fill="rgba(255,255,255,0.25)"/>
  </svg>`,
  bottom: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
    <path d="M28 14 L72 14 L74 30 L72 84 L58 84 L52 50 L48 50 L42 84 L28 84 L26 30 Z" fill="currentColor"/>
    <line x1="50" y1="14" x2="50" y2="50" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>
  </svg>`,
  shoe: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
    <path d="M30 28 L52 26 L54 58 L74 62 L80 68 L80 76 L74 80 L24 80 L18 75 L20 64 L30 60 Z" fill="currentColor"/>
  </svg>`,
  accessory: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
    <rect x="12" y="46" width="76" height="8" fill="currentColor"/>
    <rect x="44" y="42" width="12" height="16" fill="none" stroke="currentColor" stroke-width="2.5"/>
    <rect x="48" y="46" width="4" height="8" fill="currentColor"/>
  </svg>`,
  jacket: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
    <path d="M20 28 L34 18 L46 22 L50 20 L54 22 L66 18 L80 28 L76 38 L76 86 L24 86 L24 38 Z" fill="currentColor"/>
    <line x1="50" y1="20" x2="50" y2="86" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>
  </svg>`,
  bag: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
    <path d="M36 38 Q36 24 50 24 Q64 24 64 38" stroke="currentColor" stroke-width="2.5" fill="none"/>
    <rect x="22" y="38" width="56" height="44" fill="currentColor"/>
  </svg>`,
};
