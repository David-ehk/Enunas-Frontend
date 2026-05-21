import Link from 'next/link';
import ProductCard, { RecItem } from './ProductCard';

interface CompleteTheLookProps {
  items: RecItem[];
  heroImage?: string;
  allHref?: string;
}

export default function CompleteTheLook({ items, heroImage, allHref = '#' }: CompleteTheLookProps) {
  if (!items || items.length === 0) return null

  const count = Math.min(items.length, 4) as 1 | 2 | 3 | 4;
  const visible = items.slice(0, count);

  const gridCols =
    count === 1 ? 'grid-cols-1' :
    count === 2 ? 'grid-cols-1' :
    'grid-cols-2';

  const cardAspect = count === 1 ? '3/4' : count === 2 ? '4/3' : '1/1';

  return (
    <section className="px-16 py-6 max-w-[1800px] mx-auto">
      <div className="flex justify-between items-baseline mb-[18px] pb-3 border-b border-enunas-gray-light">
        <h2 className="font-cormorant text-[32px] font-light text-enunas-black">
          Vervollständige den Look
        </h2>
        <Link href={allHref} className="
          font-league-spartan text-[11px] tracking-[0.22em] uppercase
          text-enunas-black border-b border-enunas-black pb-0.5
          hover:text-enunas-purple hover:border-enunas-purple transition-colors
        ">
          Alle ansehen →
        </Link>
      </div>

      <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-4">
        <div className="relative aspect-[3/4] bg-enunas-off-white overflow-hidden flex items-end justify-center">
          <span className="absolute top-4 left-4 font-mono text-[10px] tracking-[0.15em] uppercase text-enunas-gray-medium bg-white/85 px-2.5 py-1">
            Outfit · {count} Stücke
          </span>
          {heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroImage} alt="Outfit" className="w-full h-full object-cover" />
          ) : (
            <FigureSilhouette />
          )}
        </div>

        <div className={`grid ${gridCols} gap-3`}>
          {visible.map((item) => (
            <ProductCard key={item.name} item={item} aspect={cardAspect} compact />
          ))}
        </div>
      </div>
    </section>
  );
}

function FigureSilhouette() {
  return (
    <div
      className="w-[72%] h-[96%] flex items-end justify-center"
      dangerouslySetInnerHTML={{ __html: `
        <svg viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet" style="width:100%;height:100%">
          <path d="M48 4 Q60 0 72 4 Q80 8 80 18 Q80 28 76 32 L72 34 L48 34 L44 32 Q40 28 40 18 Q40 8 48 4 Z" fill="#2D2316"/>
          <ellipse cx="60" cy="22" rx="11" ry="13" fill="#D4BBA1"/>
          <path d="M50 14 Q60 6 70 14 Q72 18 72 22 L66 24 L66 18 L54 18 L54 24 L48 22 Q48 18 50 14 Z" fill="#2D2316"/>
          <rect x="55" y="33" width="10" height="7" fill="#C4A88A"/>
          <path d="M28 46 Q40 38 50 38 L52 40 L56 42 Q60 44 64 42 L68 40 L70 38 Q80 38 92 46 L88 56 L88 102 L32 102 L32 56 Z" fill="#EDE9DD"/>
          <path d="M50 38 L60 50 L70 38 L66 36 L60 38 L54 36 Z" fill="#A3BCD8"/>
          <path d="M28 46 L18 78 L26 84 L34 56 Z" fill="#EDE9DD"/>
          <path d="M92 46 L102 78 L94 84 L86 56 Z" fill="#EDE9DD"/>
          <path d="M32 102 L88 102 L86 168 L66 168 L62 124 L58 124 L54 168 L34 168 Z" fill="#9B7B58"/>
          <rect x="32" y="100" width="56" height="4" fill="#3D3024" opacity="0.5"/>
          <ellipse cx="42" cy="170" rx="14" ry="5" fill="#3D2418"/>
          <ellipse cx="78" cy="170" rx="14" ry="5" fill="#3D2418"/>
        </svg>
      ` }}
    />
  );
}
