import Link from 'next/link'

interface CatalogueTagsProps {
  categories: string[] | null;
}

const TAG_COLORS: Record<string, string> = {
  experimental: 'bg-[#6C169C]',
  culture:      'bg-[#EA9575]',
  cultural:     'bg-[#EA9575]',
  streetwear:   'bg-[#0011A5]',
  athleisure:   'bg-[#C01B1B]',
  star:         'bg-enunas-black',
};

const TAG_SLUGS: Record<string, string> = {
  culture: 'cultural',
};

function getSlug(tag: string): string {
  const key = tag.toLowerCase();
  return TAG_SLUGS[key] ?? key;
}

const FALLBACK = ['Streetwear', 'Culture', 'Star'];

export default function CatalogueTags({ categories }: CatalogueTagsProps) {
  const list = (categories && categories.length) ? categories : FALLBACK;

  return (
    <div className="flex gap-3.5 justify-center my-6 min-h-[28px]">
      {list.map((t) => {
        const key = t.toLowerCase();
        const bg = TAG_COLORS[key] ?? 'bg-enunas-black';
        return (
          <Link
            key={t}
            href={`/bekleidung/${getSlug(t)}`}
            className={`
              ${bg}
              w-[150px] px-4 py-1
              font-cormorant text-lg font-normal
              text-center text-white
              border border-enunas-black
              leading-tight tracking-[0.02em]
              box-border
              transition-opacity duration-200 hover:opacity-80
            `}
          >
            {t}
          </Link>
        );
      })}
    </div>
  );
}
