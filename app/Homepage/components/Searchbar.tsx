'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useId,
  KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SearchResultType = 'product' | 'brand' | 'category' | 'editorial';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  meta?: string;
  imageUrl?: string;
  href?: string;
}

export interface SearchHighlight {
  label: string;
  href?: string;
}

export interface SearchbarProps {
  onQueryChange?: (query: string) => void;
  onSearch?: (query: string) => void;
  onResultSelect?: (result: SearchResult) => void;
  results?: SearchResult[] | null;
  loading?: boolean;
  recentSearches?: string[];
  variant?: 'bar' | 'overlay' | 'sidebar';
  highlights?: SearchHighlight[];
  isOpen?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  onClose?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

// ─── Icons ───────────────────────────────────────────────────────────────────

const SearchIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true" {...p}>
    <circle cx="10.5" cy="10.5" r="7" />
    <path d="m21 21-4.5-4.5" />
  </svg>
);

const ClearIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
    aria-hidden="true" {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

const CloseIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
    aria-hidden="true" {...p}>
    <path d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ArrowRightIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true" {...p}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
);

const ClockIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true" {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);

// ─── Sidebar skeleton ─────────────────────────────────────────────────────────

function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-5 animate-pulse py-2">
      {([0, 1, 2, 3] as const).map((i) => (
        <div key={i} className="flex items-center gap-4" style={{ animationDelay: `${i * 80}ms` }}>
          <div className="flex-none w-14 h-[72px] bg-enunas-gray-light" />
          <div className="flex-1 flex flex-col gap-2.5">
            <div className="h-[11px] bg-enunas-gray-light w-3/4" />
            <div className="h-[11px] bg-[#EFEFEF] w-[55%]" />
          </div>
          <div className="flex-none w-11 h-[11px] bg-[#EFEFEF]" />
        </div>
      ))}
    </div>
  );
}

// ─── Product row (results view) ───────────────────────────────────────────────

function SidebarProductRow({ result, onSelect }: { result: SearchResult; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full flex items-center gap-4 py-4 border-b border-enunas-gray-light last:border-b-0 group text-left focus:outline-none"
    >
      <div className="flex-none w-14 h-[72px] bg-enunas-gray-light overflow-hidden shrink-0">
        {result.imageUrl && (
          <img
            src={result.imageUrl}
            alt={result.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <span className="font-league-spartan text-[13px] text-enunas-black block truncate leading-snug">
          {result.title}
        </span>
        {result.subtitle && (
          <span className="font-league-spartan text-[11px] text-enunas-gray-medium mt-1 block truncate">
            {result.subtitle}
          </span>
        )}
      </div>
      {result.meta && (
        <span className="flex-none font-league-spartan text-[13px] text-enunas-black shrink-0 ml-2">
          {result.meta}
        </span>
      )}
    </button>
  );
}

// ─── Highlights list (shared by highlights + empty views) ────────────────────

function HighlightsList({ highlights, onClose }: { highlights: SearchHighlight[]; onClose?: () => void }) {
  return (
    <div className="flex flex-col">
      {highlights.map((h, i) => (
        <a
          key={i}
          href={h.href ?? '#'}
          onClick={onClose}
          className="font-league-spartan text-[13px] uppercase tracking-[0.14em] text-enunas-black
                     py-[14px] border-b border-enunas-gray-light last:border-b-0
                     flex items-center justify-between group
                     hover:text-enunas-purple transition-colors duration-150 ease-out-quart
                     focus:outline-none"
        >
          {h.label}
          <ArrowRightIcon
            className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0
                       text-enunas-purple transition-all duration-200 ease-out-expo"
          />
        </a>
      ))}
    </div>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-league-spartan text-[9.5px] uppercase tracking-[0.28em] text-enunas-gray-medium mb-5">
      {children}
    </p>
  );
}

// ─── SearchSidebar (sidebar variant) ─────────────────────────────────────────

type SidebarView = 'highlights' | 'recents' | 'loading' | 'results' | 'empty';

function SearchSidebar({
  isOpen = false,
  highlights = [],
  recentSearches = [],
  results,
  loading = false,
  onQueryChange,
  onSearch,
  onResultSelect,
  onClose,
  placeholder = 'Suchen',
}: Omit<SearchbarProps, 'variant'>) {
  const [query, setQuery]       = useState('');
  const [focused, setFocused]   = useState(false);
  const [mounted, setMounted]   = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Derive current view
  const view: SidebarView = (() => {
    if (!focused && query.length === 0) return 'highlights';
    if (query.length === 0)            return recentSearches.length > 0 ? 'recents' : 'highlights';
    if (loading)                       return 'loading';
    const r = results ?? [];
    return r.length > 0 ? 'results' : 'empty';
  })();

  // Split results by type
  const allResults = results ?? [];
  const products   = allResults.filter((r) => r.type === 'product');
  const brands     = allResults.filter((r) => r.type === 'brand');
  const categories = allResults.filter((r) => r.type === 'category');
  const editorials = allResults.filter((r) => r.type === 'editorial');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    onQueryChange?.(v);
  };

  const handleClear = () => {
    setQuery('');
    onQueryChange?.('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') { onClose?.(); }
    if (e.key === 'Enter' && query.trim()) { onSearch?.(query.trim()); }
  };

  // Auto-focus + reset on open/close
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(t);
    } else {
      setQuery('');
      setFocused(false);
      onQueryChange?.('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  // Global Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Scrim — blurs and dims the storefront behind the panel */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{ backdropFilter: 'blur(4px) brightness(0.88)' }}
        className={[
          'fixed inset-0 z-[9998] bg-[rgba(10,8,14,0.35)]',
          'transition-opacity duration-500 ease-out-expo',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Suche"
        className={[
          'fixed inset-y-0 right-0 z-[9999]',
          'w-full max-w-[480px] bg-enunas-off-white',
          'flex flex-col',
          'transition-transform duration-[760ms] ease-out-expo',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        {/* Close button */}
        <div className="flex justify-end pt-7 pr-7 pb-0 flex-none">
          <button
            type="button"
            onClick={onClose}
            aria-label="Suche schließen"
            className="p-1 text-enunas-black hover:text-enunas-purple transition-colors duration-150 ease-out-expo focus:outline-none"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Input — underline style */}
        <div className="px-8 pt-8 pb-0 flex-none">
          <div className="flex items-center gap-3 border-b border-enunas-black pb-3">
            <input
              ref={inputRef}
              type="search"
              enterKeyHint="search"
              value={query}
              onChange={handleChange}
              onFocus={() => setFocused(true)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              aria-label={placeholder}
              className={[
                'flex-1 min-w-0 bg-transparent border-0 outline-none',
                'font-league-spartan text-[11px] uppercase tracking-[0.26em]',
                'text-enunas-black placeholder:text-enunas-gray-medium',
                '[appearance:textfield] [&::-webkit-search-cancel-button]:hidden',
              ].join(' ')}
            />
            {query.length > 0 ? (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Suche löschen"
                className="flex-none text-enunas-gray-medium hover:text-enunas-black transition-colors duration-150 focus:outline-none"
              >
                <ClearIcon />
              </button>
            ) : (
              <SearchIcon className="flex-none text-enunas-gray-medium" />
            )}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto px-8 pt-9 pb-12">

          {/* View: Highlights */}
          {view === 'highlights' && (
            <div>
              <SectionLabel>Highlights</SectionLabel>
              <HighlightsList highlights={highlights} onClose={onClose} />
            </div>
          )}

          {/* View: Recents */}
          {view === 'recents' && (
            <div>
              <SectionLabel>Zuletzt gesucht</SectionLabel>
              <div className="flex flex-col">
                {recentSearches.slice(0, 6).map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { setQuery(s); onQueryChange?.(s); }}
                    className="flex items-center gap-3 py-[14px] border-b border-enunas-gray-light last:border-b-0
                               text-left group hover:text-enunas-purple transition-colors duration-150 focus:outline-none w-full"
                  >
                    <ClockIcon className="flex-none text-enunas-gray-medium shrink-0" />
                    <span className="font-league-spartan text-[13px] text-enunas-black group-hover:text-enunas-purple transition-colors duration-150 flex-1">
                      {s}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* View: Loading skeleton */}
          {view === 'loading' && <SidebarSkeleton />}

          {/* View: Results */}
          {view === 'results' && (
            <div className="flex flex-col gap-9">

              {products.length > 0 && (
                <div>
                  <SectionLabel>Produkte · {products.length}</SectionLabel>
                  <div>
                    {products.map((r) => (
                      <SidebarProductRow key={r.id} result={r} onSelect={() => onResultSelect?.(r)} />
                    ))}
                  </div>
                </div>
              )}

              {brands.length > 0 && (
                <div>
                  <SectionLabel>Marken</SectionLabel>
                  <div className="flex flex-col">
                    {brands.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => onResultSelect?.(r)}
                        className="flex items-center justify-between py-[13px] border-b border-enunas-gray-light last:border-b-0 group focus:outline-none"
                      >
                        <span className="font-league-spartan text-[13px] text-enunas-black group-hover:text-enunas-purple transition-colors duration-150">
                          {r.title}
                        </span>
                        <div className="flex items-center gap-2.5">
                          {r.meta && (
                            <span className="font-league-spartan text-[11px] text-enunas-gray-medium">{r.meta}</span>
                          )}
                          <ArrowRightIcon className="text-enunas-gray-medium group-hover:text-enunas-purple group-hover:translate-x-0.5 transition-all duration-200 ease-out-expo" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {categories.length > 0 && (
                <div>
                  <SectionLabel>Kategorien</SectionLabel>
                  <div className="flex flex-col">
                    {categories.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => onResultSelect?.(r)}
                        className="flex items-center justify-between py-[13px] border-b border-enunas-gray-light last:border-b-0 group focus:outline-none"
                      >
                        <span className="font-league-spartan text-[13px] text-enunas-black group-hover:text-enunas-purple transition-colors duration-150">
                          {r.title}
                        </span>
                        <ArrowRightIcon className="text-enunas-gray-medium group-hover:text-enunas-purple group-hover:translate-x-0.5 transition-all duration-200 ease-out-expo" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {editorials.length > 0 && (
                <div>
                  <SectionLabel>Editorial</SectionLabel>
                  <div className="flex flex-col">
                    {editorials.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => onResultSelect?.(r)}
                        className="flex items-center justify-between py-[13px] border-b border-enunas-gray-light last:border-b-0 group focus:outline-none w-full text-left"
                      >
                        <span className="font-cormorant font-light italic text-[20px] text-enunas-black group-hover:text-enunas-purple transition-colors duration-150">
                          {r.title}
                        </span>
                        <ArrowRightIcon className="flex-none text-enunas-gray-medium group-hover:text-enunas-purple group-hover:translate-x-0.5 transition-all duration-200 ease-out-expo" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* All results CTA */}
              <button
                type="button"
                onClick={() => onSearch?.(query.trim())}
                className="flex items-center justify-between w-full group focus:outline-none pt-1"
              >
                <span className="font-league-spartan text-[10px] uppercase tracking-[0.22em] text-enunas-purple group-hover:text-enunas-purple-light transition-colors duration-150">
                  Alle Ergebnisse für „{query}"
                </span>
                <ArrowRightIcon className="text-enunas-purple group-hover:translate-x-1 transition-transform duration-200 ease-out-expo" />
              </button>
            </div>
          )}

          {/* View: Empty */}
          {view === 'empty' && (
            <div>
              <p className="font-cormorant font-light italic text-[32px] text-enunas-black leading-tight mb-2.5">
                Keine Ergebnisse.
              </p>
              <p className="font-league-spartan text-[11px] text-enunas-gray-medium tracking-[0.1em] mb-9">
                Für „{query}" wurden keine Artikel gefunden.
              </p>
              {highlights.length > 0 && (
                <div>
                  <SectionLabel>Highlights</SectionLabel>
                  <HighlightsList highlights={highlights} onClose={onClose} />
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>,
    document.body
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

const Searchbar: React.FC<SearchbarProps> = ({ variant = 'bar', ...props }) => {
  if (variant === 'sidebar') return <SearchSidebar {...props} />;
  return null;
};

export default Searchbar;
