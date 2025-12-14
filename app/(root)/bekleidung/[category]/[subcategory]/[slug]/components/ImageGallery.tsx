import React, { useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, ZoomIn } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  productName?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ 
  images, 
  productName = "Produkt" 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  const scrollThumbnails = (direction: 'up' | 'down') => {
    if (thumbnailsRef.current) {
      const scrollAmount = 120; // Höhe eines Thumbnails + Gap
      const newScroll = direction === 'up' 
        ? thumbnailsRef.current.scrollTop - scrollAmount
        : thumbnailsRef.current.scrollTop + scrollAmount;
      
      thumbnailsRef.current.scrollTo({
        top: newScroll,
        behavior: 'smooth'
      });
    }
  };

  // Auto-scroll zu aktivem Thumbnail
  useEffect(() => {
    if (thumbnailsRef.current) {
      const thumbnail = thumbnailsRef.current.children[currentIndex] as HTMLElement;
      if (thumbnail) {
        thumbnail.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest' 
        });
      }
    }
  }, [currentIndex]);

  return (
    <div className="flex gap-4 w-full max-w-4xl">
      {/* Thumbnail Navigation - Links */}
      <div className="flex flex-col items-center gap-2">
        {/* Scroll Up Button */}
       

        {/* Thumbnail Container */}
        <div 
          ref={thumbnailsRef}
          className="flex flex-col gap-2 overflow-y-auto h-[600px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pr-2"
        >
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={`
                relative w-20 h-28 flex-shrink-0  overflow-hidden
                border-2 transition-all
                ${currentIndex === index 
                  ? 'border-black' 
                  : 'border-gray-200 hover:border-gray-400'
                }
              `}
            >
              <img
                src={image}
                alt={`${productName} Ansicht ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {currentIndex === index && (
                <div className="absolute inset-0 border-2 border-black pointer-events-none" />
              )}
            </button>
          ))}
        </div>

      </div>

      {/* Hauptbild - Rechts */}
      <div className="flex-1 relative">
        <div 
          className={`
            relative bg-gray-50  overflow-hidden
            ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}
          `}
          onClick={() => setIsZoomed(!isZoomed)}
        >
          <img
            src={images[currentIndex]}
            alt={`${productName} - Bild ${currentIndex + 1}`}
            className={`
              w-full h-auto transition-transform duration-300
              ${isZoomed ? 'scale-150' : 'scale-100'}
            `}
          />
          
          {/* Zoom Icon */}
          {!isZoomed && (
            <div className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-md">
              <ZoomIn className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Bildnummer Indikator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Navigation Pfeile (optional) */}
        <div className="absolute top-1/2 left-4 right-4 flex justify-between items-center pointer-events-none">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
            }}
            disabled={currentIndex === 0}
            className={`
              pointer-events-auto p-2 bg-white/80 rounded-full shadow-md
              transition-opacity
              ${currentIndex === 0 ? 'opacity-0' : 'opacity-100 hover:bg-white'}
            `}
          >
            <ChevronUp className="w-6 h-6 rotate-[-90deg]" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
            }}
            disabled={currentIndex === images.length - 1}
            className={`
              pointer-events-auto p-2 bg-white/80 rounded-full shadow-md
              transition-opacity
              ${currentIndex === images.length - 1 ? 'opacity-0' : 'opacity-100 hover:bg-white'}
            `}
          >
            <ChevronDown className="w-6 h-6 rotate-90" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Demo Component
const Demo = () => {
  // Demo Bilder (Platzhalter)
  const demoImages = [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=1000&fit=crop',
  ];

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-light mb-2">T-Shirt Premium</h1>
          <p className="text-gray-600">Produkt Beschreibung</p>
        </div>

        <ImageGallery 
          images={demoImages}
          productName="T-Shirt Premium"
        />

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Features:</h3>
          <ul className="text-sm space-y-1 text-gray-700">
            <li>✓ 7 Produktbilder</li>
            <li>✓ Vertikale Thumbnail-Navigation mit Scroll</li>
            <li>✓ Click-to-Zoom Funktion</li>
            <li>✓ Scroll-Buttons (hoch/runter)</li>
            <li>✓ Auto-scroll zu aktivem Thumbnail</li>
            <li>✓ Navigationspfeile im Hauptbild</li>
            <li>✓ Bildnummer-Indikator</li>
            <li>✓ Responsive Design</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;