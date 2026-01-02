import React, { useState } from 'react';
import { Color } from '@/lib/color';

interface ColorSelectorProps {
  colors: Color[];
  selectedColor?: Color | null;
  maxVisible?: number;
  onColorSelect?: (color: Color) => void;
}

const ColorSelector: React.FC<ColorSelectorProps> = ({ 
  colors, 
  selectedColor = null,
  maxVisible = 3,
  onColorSelect 
}) => {
  const [hoveredColor, setHoveredColor] = useState<Color | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Early return if no colors
  if (!colors || colors.length === 0) {
    return null;
  }

  // Colors to display based on showAll state
  const visibleColors = showAll ? colors : colors.slice(0, maxVisible);
  const remainingCount = colors.length - maxVisible;

  // Function to handle color selection
  const handleColorSelect = (color: Color) => {
    onColorSelect?.(color);
  };

  // Display name: hoveredColor > selectedColor > default
  const displayName = hoveredColor?.name || selectedColor?.name || 'Purple';

  // Sku display

  return (
    <div>
      <div className="mb-4">
        <span className="text-sm tracking-wider uppercase">
          {displayName}  
        </span>
      </div>

      <div className="flex items-center gap-4">
        {visibleColors.map((color) => (
          <button
            key={color.id}
            onClick={() => handleColorSelect(color)}
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
            <div 
              className="w-full h-full"
              style={{ backgroundColor: color.hex }}
            />
          </button>
        ))}

        {!showAll && remainingCount > 0 && (
          <button
            onClick={() => setShowAll(true)}
            className="text-sm text-gray-600 hover:text-black"
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
              onClick={() => handleColorSelect(color)}
              onMouseEnter={() => setHoveredColor(color)}
              onMouseLeave={() => setHoveredColor(null)}
              className={`
                aspect-square rounded-sm border-2 transition-all
                ${selectedColor?.id === color.id 
                  ? 'border-black ring-2 ring-black ring-offset-2' 
                  : 'border-gray-200 hover:border-gray-400'
                }
              `}
              aria-label={`Farbe ${color.name} auswählen`}
            >
              <div 
                className="w-full h-full rounded-sm"
                style={{ backgroundColor: color.hex }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ColorSelector;