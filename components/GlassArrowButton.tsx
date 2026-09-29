'use client';

interface GlassArrowButtonProps {
  direction: 'prev' | 'next';
  onClick: () => void;
  /** Screen-reader label; defaults to Zurück / Weiter. */
  label?: string;
  /** Positioning (and visibility breakpoint) is up to the row that hosts the button. */
  className?: string;
}

/** Round "liquid glass" arrow: blurred, translucent, with a bright rim and inner highlight. */
export default function GlassArrowButton({ direction, onClick, label, className = '' }: GlassArrowButtonProps) {
  return (
    <button
      type="button"
      aria-label={label ?? (direction === 'prev' ? 'Zurück' : 'Weiter')}
      onClick={onClick}
      className={`
        flex h-11 w-11 items-center justify-center rounded-full text-enunas-black
        transition-transform duration-300 ease-out-expo hover:scale-105 active:scale-95
        motion-reduce:transition-none
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-enunas-purple
        ${className}
      `}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.62) 0%, rgba(255,255,255,0.22) 100%)',
        backdropFilter: 'blur(14px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(14px) saturate(1.6)',
        border: '1px solid rgba(255,255,255,0.65)',
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(255,255,255,0.25), 0 6px 20px rgba(10,10,10,0.14)',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d={direction === 'prev' ? 'm14.5 6-6 6 6 6' : 'm9.5 6 6 6-6 6'} />
      </svg>
    </button>
  );
}
