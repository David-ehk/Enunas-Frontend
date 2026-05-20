interface CatalogueTagsProps {
  categories: string[] | null;
}

const TAG_COLORS: Record<string, string> = {
  experimental: 'bg-[#6C169C]',
  culture:      'bg-[#EA9575]',
  streetwear:   'bg-[#0011A5]',
  athleisure:   'bg-[#C01B1B]',
  star:         'bg-enunas-black',
};

const FALLBACK = ['Streetwear', 'Culture', 'Star'];

export default function CatalogueTags({ categories }: CatalogueTagsProps) {
  const list = (categories && categories.length) ? categories : FALLBACK;

  return (
    <div className="flex gap-3.5 justify-center my-6 min-h-[28px]">
      {list.map((t) => {
        const key = t.toLowerCase();
        const bg = TAG_COLORS[key] ?? 'bg-enunas-black';
        return (
          <span
            key={t}
            className={`
              ${bg}
              w-[150px] px-4 py-2.5
              font-cormorant text-lg font-normal
              text-center text-white
              border border-enunas-black
              leading-tight tracking-[0.02em]
              box-border
            `}
          >
            {t}
          </span>
        );
      })}
    </div>
  );
}
