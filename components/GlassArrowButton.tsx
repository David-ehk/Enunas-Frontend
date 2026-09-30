'use client';

interface GlassArrowButtonProps {
  direction: 'prev' | 'next';
  onClick: () => void;
  /** Screen-reader label; defaults to Zurück / Weiter. */
  label?: string;
  /** Positioning (and visibility breakpoint) is up to the row that hosts the button. */
  className?: string;
}

/** Round "liquid glass" arrow: clear, blurred and colour-boosted, with a bright rim and inner highlight. */
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
        // Mostly clear glass: only a hint of white, with the backdrop blurred and pushed in
        // saturation, so the disc picks up the colour of whatever image sits behind it.
        background: 'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.04) 100%)',
        backdropFilter: 'blur(10px) saturate(2.2) brightness(1.04)',
        WebkitBackdropFilter: 'blur(10px) saturate(2.2) brightness(1.04)',
        border: '1px solid rgba(255,255,255,0.55)',
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.75), inset 0 -1px 0 rgba(255,255,255,0.18), 0 4px 16px rgba(10,10,10,0.1)',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.9))' }}>
        <path d={direction === 'prev' ? 'm14.5 6-6 6 6 6' : 'm9.5 6 6 6-6 6'} />
      </svg>
    </button>
  );
}
