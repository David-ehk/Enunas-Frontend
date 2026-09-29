import Link from 'next/link';
import PopularProductCard from '@/app/Homepage/components/PopularProductCard';
import { RecItem } from './ProductCard';
import Rail from './Rail';

interface RecRowProps {
  title: string;
  titleAccent?: string;
  items: RecItem[];
  allHref?: string;
  allLabel?: string;
}

export default function RecRow({ title, titleAccent, items, allHref = '#', allLabel = 'Alle ansehen →' }: RecRowProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="px-4 sm:px-8 lg:px-16 py-6 max-w-[1800px] mx-auto">
      <div className="flex justify-between items-baseline gap-4 mb-[18px] pb-3 border-b border-enunas-gray-light">
        <h2 className="font-cormorant text-[22px] sm:text-[32px] leading-tight font-light text-enunas-black">
          {title}
          {titleAccent && <> <em className="italic text-enunas-gray-medium">{titleAccent}</em></>}
        </h2>
        <Link
          href={allHref}
          className="shrink-0 font-league-spartan text-[10px] sm:text-[11px] tracking-[0.18em] sm:tracking-[0.22em] uppercase whitespace-nowrap text-enunas-black border-b border-enunas-black pb-0.5 hover:text-enunas-purple hover:border-enunas-purple transition-colors"
        >
          {allLabel}
        </Link>
      </div>

      <Rail label={title}>
        {items.map((item) => (
          <div key={item.href + item.name} className="snap-start shrink-0 basis-[58%] sm:basis-[34%] lg:basis-[23.5%]">
            <PopularProductCard
              imgURL={item.image ?? ''}
              brandName={item.brand}
              productName={item.name}
              price={item.price}
              originalPrice={item.originalPrice}
              href={item.href}
              colours={item.colors.map(hex => ({ hex, name: '' }))}
              createdAt={new Date(0)}
              preview={item.preview}
              releaseDate={item.releaseDate}
            />
          </div>
        ))}
      </Rail>
    </section>
  );
}
