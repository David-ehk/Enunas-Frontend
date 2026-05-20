import { BrandListingsSection } from "./components/BrandListingsSection";
import { TopDesignerSection } from "./components/TopDesignerSection";


export default function MarkenPage() {
  const topDesigners = [
    { id: 1, name: 'Alexander McQueen', image: '...' },
    { id: 2, name: 'Balenciaga', image: '...' },
    { id: 3, name: 'Burberry', image: '...' },
  ];

  const allBrands = [
    { id: 1, name: 'Alexander McQueen', letter: 'A' },
    { id: 2, name: 'Armani', letter: 'A' },
    { id: 3, name: 'Balenciaga', letter: 'B' },
    // ... mehr Marken
  ];

  return (
    <div className="min-h-screen bg-white" style={{ paddingTop: '96px' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl tracking-wide mb-2">
            Marken von A - Z
          </h2>
        </div>

        <TopDesignerSection brands={topDesigners} />
        <BrandListingsSection brands={allBrands} />
      </div>
    </div>
  );
}
