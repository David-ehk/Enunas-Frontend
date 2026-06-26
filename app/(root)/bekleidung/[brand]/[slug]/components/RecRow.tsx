import Link from 'next/link';
import PopularProductCard from '@/app/Homepage/components/PopularProductCard';
import { RecItem } from './ProductCard';

interface RecRowProps {
  title: string;
  titleAccent?: string;
  items: RecItem[];
  allHref?: string;
}

export default function RecRow({ title, titleAccent, items, allHref = '#' }: RecRowProps) {
  return (
    <section className="px-4 sm:px-8 lg:px-16 py-6 max-w-[1800px] mx-auto">
      <div className="flex justify-between items-baseline mb-[18px] pb-3 border-b border-enunas-gray-light">
        <h2 className="font-cormorant text-[32px] font-light text-enunas-black">
          {title}
          {titleAccent && <> <em className="italic text-enunas-gray-medium">{titleAccent}</em></>}
        </h2>
        <Link
          href={allHref}
          className="font-league-spartan text-[11px] tracking-[0.22em] uppercase text-enunas-black border-b border-enunas-black pb-0.5 hover:text-enunas-purple hover:border-enunas-purple transition-colors"
        >
          Alle ansehen →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-1 sm:gap-2">
        {items.slice(0, 4).map((item) => (
          <PopularProductCard
            key={item.name}
            imgURL={item.image ?? ''}
            brandName={item.brand}
            productName={item.name}
            price={item.price}
            href={item.href}
            colours={item.colors.map(hex => ({ hex, name: '' }))}
            createdAt={new Date(0)}
          />
        ))}
      </div>
    </section>
  );
}
