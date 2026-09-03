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

  // The hero panel only exists when there is a real product photo for it. Without one the
  // section degrades to a plain product row rather than standing in a drawn placeholder.
  const showHero = Boolean(heroImage);

  // Stacked under the hero below md, so the cards always sit 2-up like every other
  // recommendation row; the count-driven column split only applies to the desktop
  // side-by-side layout.
  const gridCols = showHero
    ? (count <= 2 ? 'grid-cols-2 md:grid-cols-1' : 'grid-cols-2')
    : 'grid-cols-2 md:grid-cols-4';

  const cardAspect = !showHero ? '3/4' : count === 1 ? '3/4' : count === 2 ? '4/3' : '1/1';

  return (
    <section className="px-4 sm:px-8 lg:px-16 py-6 max-w-[1800px] mx-auto">
      <div className="flex justify-between items-baseline gap-4 mb-[18px] pb-3 border-b border-enunas-gray-light">
        <h2 className="font-cormorant text-[22px] sm:text-[32px] leading-tight font-light text-enunas-black">
          Vervollständige den Look
        </h2>
        <Link href={allHref} className="
          shrink-0 whitespace-nowrap
          font-league-spartan text-[10px] sm:text-[11px] tracking-[0.18em] sm:tracking-[0.22em] uppercase
          text-enunas-black border-b border-enunas-black pb-0.5
          hover:text-enunas-purple hover:border-enunas-purple transition-colors
        ">
          Alle ansehen →
        </Link>
      </div>

      <div className={`grid gap-2 sm:gap-4 ${showHero ? 'grid-cols-1 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]' : 'grid-cols-1'}`}>
        {showHero && (
          <div className="relative aspect-[3/4] bg-enunas-off-white overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroImage} alt="Outfit" className="absolute inset-0 w-full h-full object-cover" />
            <span className="absolute top-4 left-4 z-10 whitespace-nowrap font-mono text-[10px] tracking-[0.15em] uppercase text-enunas-gray-medium bg-white/85 px-2.5 py-1">
              Outfit · {count} {count === 1 ? 'Stück' : 'Stücke'}
            </span>
          </div>
        )}

        <div className={`grid ${gridCols} gap-1 sm:gap-2 ${showHero ? 'md:gap-3' : ''}`}>
          {visible.map((item) => (
            <ProductCard key={item.name} item={item} aspect={cardAspect} compact />
          ))}
        </div>
      </div>
    </section>
  );
}
