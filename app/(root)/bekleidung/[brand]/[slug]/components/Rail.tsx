'use client';

import { useRef, type ReactNode } from 'react';
import GlassArrowButton from './GlassArrowButton';

/** Horizontal, snap-scrolling strip: drag/swipe/trackpad natively, arrow buttons on hover devices. */
export default function Rail({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);

  function slide(dir: 1 | -1) {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: reduce ? 'auto' : 'smooth' });
  }

  const pos = 'hidden md:flex lg:hidden absolute top-[38%] z-10';

  return (
    <div className="relative" role="region" aria-label={label}>
      <GlassArrowButton direction="prev" onClick={() => slide(-1)} className={`${pos} left-2`} />
      <div
        ref={ref}
        className="flex gap-2 sm:gap-4 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      <GlassArrowButton direction="next" onClick={() => slide(1)} className={`${pos} right-2`} />
    </div>
  );
}
