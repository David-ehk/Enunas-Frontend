import type { ReactNode } from 'react';

/** Horizontal, snap-scrolling strip: drag, swipe or trackpad. */
export default function Rail({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="relative" role="region" aria-label={label}>
      <div className="flex gap-2 sm:gap-4 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </div>
  );
}
