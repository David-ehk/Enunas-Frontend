'use client';

import { useRef, type ReactNode } from 'react';

/** Horizontal, snap-scrolling strip: drag/swipe/trackpad natively, arrow buttons on hover devices. */
export default function Rail({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);

  function slide(dir: 1 | -1) {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: reduce ? 'auto' : 'smooth' });
  }

  const btn =
    'hidden md:flex absolute top-[38%] z-10 h-10 w-10 items-center justify-center bg-white/90 text-enunas-black border border-enunas-gray-light transition-colors duration-300 ease-out-expo hover:bg-enunas-purple hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-enunas-purple';

  return (
    <div className="relative" role="region" aria-label={label}>
      <button type="button" aria-label="Zurück" onClick={() => slide(-1)} className={`${btn} left-0`}>←</button>
      <div
        ref={ref}
        className="flex gap-2 sm:gap-4 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      <button type="button" aria-label="Weiter" onClick={() => slide(1)} className={`${btn} right-0`}>→</button>
    </div>
  );
}
