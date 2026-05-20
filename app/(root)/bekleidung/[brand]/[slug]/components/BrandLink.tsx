import Link from 'next/link';
import { slugify } from '@/lib/utils';

interface BrandLinkProps {
  brand: string;
}

export default function BrandLink({ brand }: BrandLinkProps) {
  return (
    <Link
      href={`/marken/${slugify(brand)}`}
      className="
        inline-flex items-center gap-2.5
        font-league-spartan text-[12px] tracking-[0.3em] uppercase font-medium
        text-enunas-purple
        border-b border-enunas-purple
        py-2 pb-2.5
        transition-colors duration-200 ease-out-expo
        hover:text-enunas-purple-light hover:border-enunas-purple-light
        focus:outline-none focus-visible:text-enunas-purple-light
      "
    >
      {brand}
    </Link>
  );
}
