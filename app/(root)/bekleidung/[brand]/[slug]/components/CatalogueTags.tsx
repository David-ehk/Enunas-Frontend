import Link from 'next/link'
import { SEGMENT_LABELS } from '@/lib/product'
import { sortSegments } from '@/lib/segmentOrder'

interface CatalogueTagsProps {
  categories: string[] | null;
}

const TAG_COLORS: Record<string, string> = {
  Experimental: 'bg-[#6C169C]',
  Culture:      'bg-[#EA9575]',
  Cultural:     'bg-[#EA9575]',
  Streetwear:   'bg-[#0011A5]',
  Athleisure:   'bg-[#C01B1B]',
  Star:         'bg-enunas-black',
};

// Looked up by t.toLowerCase() below, so the map above (kept capitalized for readability) needs
// a lowercase-keyed mirror — without this, capitalized keys never match and every tag silently
// falls back to bg-enunas-black.
const TAG_COLORS_LOOKUP: Record<string, string> = Object.fromEntries(
  Object.entries(TAG_COLORS).map(([k, v]) => [k.toLowerCase(), v])
);

const TAG_SLUGS: Record<string, string> = {
  culture: 'Cultural',
};

function getSlug(tag: string): string {
  const key = tag.toLowerCase();
  return TAG_SLUGS[key] ?? key;
}

const FALLBACK = ['Streetwear', 'Culture', 'Star'];

export default function CatalogueTags({ categories }: CatalogueTagsProps) {
  // Streetwear-first, then the rest in the fixed segment order — never the backend's own order.
  const list = sortSegments((categories && categories.length) ? categories : FALLBACK);
  // Three fixed 150px chips are wider than a phone, so with 3+ they share the row and shrink there.
  const crowded = list.length > 2;

  return (
    <div className={`flex justify-center my-6 min-h-[28px] ${crowded ? 'w-full gap-1.5 sm:gap-3.5' : 'gap-3.5'}`}>
      {list.map((t) => {
        const key = t.toLowerCase();
        const bg = TAG_COLORS_LOOKUP[key] ?? 'bg-enunas-black';
        // Same shared display-case map as the product cards (PopularProductCard.tsx) and
        // segmentBreakdown() on /saved-lists — t itself stays lowercase for getSlug()/routing.
        const label = SEGMENT_LABELS[key] ?? (key.charAt(0).toUpperCase() + key.slice(1));
        return (
          <Link
            key={t}
            href={`/bekleidung/${getSlug(t)}`}
            className={`
              ${bg}
              ${crowded
                ? 'flex-1 min-w-0 max-w-[150px] sm:flex-none sm:w-[150px] px-1 sm:px-4 text-[15px] sm:text-lg'
                : 'w-[150px] px-4 text-lg'}
              py-1
              font-cormorant font-normal
              text-center text-white
              border border-enunas-black
              leading-tight tracking-[0.02em]
              box-border
              transition-opacity duration-200 hover:opacity-80
            `}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
