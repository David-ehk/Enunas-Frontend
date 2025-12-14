import React, { useState } from 'react';
import { Color } from '@/lib/color'; // Import nur vom Type

interface ColorSelectorProps {
  colors: Color[];
  maxVisible?: number;
  onColorSelect?: (color: Color) => void;
}

const ColorSelector: React.FC<ColorSelectorProps> = ({ 
  colors, 
  maxVisible = 3,
  onColorSelect 
}) => {
  // State of the color
  const [selectedColor] = useState<Color | null>(colors[0] || null);

  const [hoveredColor, setHoveredColor] = useState<Color | null>(null)
  // State for showing all colors
  const [showAll, setShowAll] = useState(false);

  // Early return if no colors
  if (!colors || colors.length === 0) {
    return null;
  }

  // Colors to display based on showAll state
  const visibleColors = showAll ? colors : colors.slice(0, maxVisible);
  // Remaining count of colors to show
  const remainingCount = colors.length - maxVisible;

  // Function to handle color hover
  const handleColorHover = (color: Color) => {
    setHoveredColor(color);
    onColorSelect?.(color);
  };

  return (
    <div >
      <div className="mb-4">
        <span className="text-sm tracking-wider uppercase">
           {hoveredColor? hoveredColor.name: selectedColor ? selectedColor.name: 'Farbe wählen'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {visibleColors.map((color) => (
          <button
            key={color.id}
            onMouseEnter={() => handleColorHover(color)}
            className={`
              relative w-5 h-5 border transition-all
              ${selectedColor?.id === color.id 
                ? 'border-black ' 
                : 'border-gray-200 hover:border-gray-400'
              }
            `}
          >
            <div 
              className="w-full h-full "
              style={{ backgroundColor: color.hex }}
            />
          </button>
        ))}

        {!showAll && remainingCount > 0 && (
          <button
            onClick={() => setShowAll(true)}
            className="text-sm hover:underline"
          >
            + {remainingCount}
          </button>
        )}
      </div>

      {showAll && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {colors.map((color) => (
            <button
              key={color.id}
              onClick={() => handleColorHover(color)}
              className={`
                aspect-square rounded-sm border-2
                ${selectedColor?.id === color.id 
                  ? 'border-black' 
                  : 'border-gray-200'
                }
              `}
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