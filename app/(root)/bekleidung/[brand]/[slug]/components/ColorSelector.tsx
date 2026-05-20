'use client';

import React, { useState } from 'react';
import { Color } from '@/lib/color';

interface ColorSelectorProps {
  colors: Color[];
  selectedColor?: Color | null;
  maxVisible?: number;
  onColorSelect?: (color: Color) => void;
  sku?: string;
}

const ColorSelector: React.FC<ColorSelectorProps> = ({
  colors,
  selectedColor = null,
  maxVisible = 3,
  onColorSelect,
  sku,
}) => {
  const [hoveredColor, setHoveredColor] = useState<Color | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!colors || colors.length === 0) return null;

  const visibleColors = showAll ? colors : colors.slice(0, maxVisible);
  const remainingCount = colors.length - maxVisible;
  const displayName = hoveredColor?.name || selectedColor?.name || '';

  const handleCopySku = async () => {
    if (!sku) return;
    try {
      await navigator.clipboard.writeText(sku);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = sku;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch {}
      document.body.removeChild(ta);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-2.5">
        <span className="font-league-spartan text-[11px] tracking-[0.25em] uppercase text-enunas-black">
          {displayName}
        </span>

        {sku && (
          <>
            <span aria-hidden="true" className="inline-block h-3 w-px bg-enunas-black/25" />
            <button
              type="button"
              onClick={handleCopySku}
              title={copied ? 'Kopiert' : 'Produktnummer kopieren'}
              aria-label={`Produktnummer ${sku} kopieren`}
              className="group inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.08em] text-enunas-gray-medium hover:text-enunas-black transition-colors duration-200 ease-out-expo focus:outline-none focus-visible:text-enunas-black"
            >
              <span className="select-all">{sku}</span>
              {copied ? (
                <CheckIcon className="h-3 w-3 text-enunas-purple" />
              ) : (
                <CopyIcon className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
              )}
              <span className="sr-only">
                {copied ? 'Produktnummer kopiert' : 'Produktnummer kopieren'}
              </span>
            </button>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        {visibleColors.map((color) => (
          <button
            key={color.id}
            onClick={() => onColorSelect?.(color)}
            onMouseEnter={() => setHoveredColor(color)}
            onMouseLeave={() => setHoveredColor(null)}
            className={`
              relative w-5 h-5 border transition-all
              ${selectedColor?.id === color.id
                ? 'border-black ring-1 ring-black ring-offset-1'
                : 'border-gray-200 hover:border-gray-400'
              }
            `}
            aria-label={`Farbe ${color.name} auswählen`}
          >
            <div className="w-full h-full" style={{ backgroundColor: color.hex }} />
            {selectedColor?.id === color.id && (
              <span className="absolute left-0 right-0 bg-enunas-black" style={{ bottom: '-7px', height: '1px' }} />
            )}
          </button>
        ))}

        {!showAll && remainingCount > 0 && (
          <button
            onClick={() => setShowAll(true)}
            className="font-cormorant text-[18px] text-enunas-black underline underline-offset-[4px] hover:text-enunas-purple transition-colors duration-200"
          >
            +{remainingCount}
          </button>
        )}
      </div>

      {showAll && (
        <div className="mt-4 grid grid-cols-4 gap-5">
          {colors.map((color) => (
            <button
              key={color.id}
              onClick={() => onColorSelect?.(color)}
              onMouseEnter={() => setHoveredColor(color)}
              onMouseLeave={() => setHoveredColor(null)}
              className={`
                aspect-square border-2 transition-all
                ${selectedColor?.id === color.id
                  ? 'border-black ring-2 ring-black ring-offset-2'
                  : 'border-gray-200 hover:border-gray-400'
                }
              `}
              aria-label={`Farbe ${color.name} auswählen`}
            >
              <div className="w-full h-full" style={{ backgroundColor: color.hex }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="5" y="5" width="8.5" height="8.5" rx="1" />
    <path d="M11 5V3.5A1 1 0 0 0 10 2.5H3.5A1 1 0 0 0 2.5 3.5V10A1 1 0 0 0 3.5 11H5" />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 8.5 6.5 12 13 4.5" />
  </svg>
);

export default ColorSelector;
