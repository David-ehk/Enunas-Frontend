'use client'

interface FilterBarProps {
  articleCount: number;
  onGenderChange: (gender: string) => void;
  onCategoryReset: () => void;
}

export default function FilterBar({ articleCount, onCategoryReset }: FilterBarProps) {
  return (
    <div className="flex items-center justify-between px-4 lg:px-8 xl:px-12 py-3 border-b border-enunas-gray-light">
      <p className="font-league-spartan text-xs text-enunas-gray-medium uppercase tracking-[0.1em]">
        {articleCount} {articleCount === 1 ? 'Artikel' : 'Artikel'}
      </p>

      <button
        onClick={onCategoryReset}
        className="font-league-spartan text-xs uppercase tracking-[0.1em] text-enunas-gray-medium hover:text-enunas-black transition-colors duration-200"
      >
        Filter zurücksetzen
      </button>
    </div>
  )
}
