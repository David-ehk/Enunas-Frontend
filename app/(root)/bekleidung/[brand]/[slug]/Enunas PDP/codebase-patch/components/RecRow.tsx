import Link from 'next/link';
import ProductCard, { RecItem } from './ProductCard';

interface RecRowProps {
  title: string;
  /** Optional italic Cormorant sub-fragment in the title, e.g. brand name */
  titleAccent?: string;
  items: RecItem[];
  allHref?: string;
}

/**
 * Generic 4-column recommendation row. Used by:
 *   - <MoreFromBrand>      (titleAccent = brand name)
 *   - <SimilarProducts>    (no accent)
 */
export default function RecRow({ title, titleAccent, items, allHref = '#' }: RecRowProps) {
  return (
    <section className="px-16 py-6 max-w-[1800px] mx-auto">
      <div className="flex justify-between items-baseline mb-[18px] pb-3 border-b border-enunas-gray-light">
        <h2 className="font-cormorant text-[32px] font-light text-enunas-black">
          {title}
          {titleAccent && <> <em className="italic text-enunas-gray-medium">{titleAccent}</em></>}
        </h2>
        <Link href={allHref} className="
          font-league-spartan text-[11px] tracking-[0.22em] uppercase
          text-enunas-black border-b border-enunas-black pb-0.5
          hover:text-enunas-purple hover:border-enunas-purple transition-colors
        ">
          Alle ansehen →
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {items.slice(0, 4).map((item) => (
          <ProductCard key={item.name} item={item} aspect="3/4" />
        ))}
      </div>
    </section>
  );
}
