'use client';

import { useState, useMemo } from 'react';
import { Product, Variant, uniqueColors, findVariant, sortedSizes } from '../types/product';

import BrandLink from './BrandLink';
import GenderBadge from './GenderBadge';
import InspirationStory from './InspirationStory';
import ColorSelector from './ColorSelector';
import SizeSelector from './SizeSelector';
import CatalogueTags from './CatalogueTags';
import SizeGuideRow from './SizeGuideRow';
import StockIndicator from './StockIndicator';
import PflegeAccordionContent from './PflegeAccordionContent';

import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from '@/components/ui/accordion';

interface ProductDetailsProps {
  product: Product;
}

/**
 * Annotated PDP wrapper showing the new order of elements.
 * Use this as a recipe — keep your existing AddToCart, Accordion ui
 * primitives, breadcrumbs/gallery wrapping, etc.
 */
export default function ProductDetails({ product }: ProductDetailsProps) {
  const colorList = useMemo(() => uniqueColors(product.variants), [product.variants]);
  const [selectedColor, setSelectedColor] = useState<string | null>(colorList[0] ?? null);

  // Default to first available size for the selected color
  const sizesForColor = useMemo(
    () => product.variants.filter(v => v.color === selectedColor).map(v => v.size),
    [product.variants, selectedColor]
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(sizesForColor[0] ?? null);

  const selectedVariant = findVariant(product.variants, selectedColor, selectedSize);
  const formattedPrice = '€ ' + ((product as any).price ?? 0).toLocaleString('de-DE');

  // colorsForSelector should be your existing shape — sample inline:
  const colorsForSelector = colorList.map((name, i) => ({
    id: i, name, hex: hexFor(name),
  }));

  return (
    <div className="flex flex-col items-center text-center py-14 px-16">
      {/* 1. Brand link + gender badge */}
      <div className="flex items-center gap-3.5 mb-3.5">
        <BrandLink brand={product.brandName} />
        <GenderBadge gender={product.gender} />
      </div>

      {/* 2. Product name */}
      <h1 className="font-cormorant text-[38px] font-light leading-tight mb-1.5">
        {product.name}
      </h1>

      {/* 3. Collection (no release date) */}
      {product.collectionName && (
        <p className="font-cormorant italic text-[15px] text-enunas-gray-medium mb-5.5">
          {product.collectionName}
        </p>
      )}

      {/* 4. Inspiration story (auto-hides on null) */}
      <InspirationStory text={product.inspirationStory} />

      {/* 5. Price */}
      <div className="flex items-baseline gap-3 mb-8">
        <span className="text-[22px] font-light">{formattedPrice}</span>
        <span className="text-xs text-enunas-gray-medium tracking-[0.02em]">
          inkl. MwSt. zzgl. Versand
        </span>
      </div>

      {/* 6. Colour + SKU + Swatches */}
      <div className="flex justify-center mb-3">
        <ColorSelector
          colors={colorsForSelector}
          selectedColor={colorsForSelector.find(c => c.name === selectedColor) ?? null}
          onColorSelect={(c) => { setSelectedColor(c.name); }}
          sku={selectedVariant?.sku}
        />
      </div>

      {/* 7. Sizes (auto-disables 0-stock & missing combos) */}
      <SizeSelector
        variants={product.variants}
        selectedColor={selectedColor}
        selectedSize={selectedSize}
        onSizeSelect={setSelectedSize}
      />

      {/* 8. Catalogue tags (fallback shown when null) */}
      <CatalogueTags categories={product.catalogueCategory} />

      {/* 9. Size guide + fit advisor row */}
      <SizeGuideRow />

      {/* 10. CTA — your existing <AddToCart>; disable when no variant or stock = 0 */}
      {/* <AddToCart product={product} variant={selectedVariant} disabled={!selectedVariant || selectedVariant.stockQuantity === 0} /> */}

      {/* 11. Stock indicator under the CTA */}
      <StockIndicator stockQuantity={selectedVariant?.stockQuantity} />

      {/* 12. Accordions */}
      <Accordion type="single" collapsible defaultValue="details" className="w-full max-w-[480px] text-left">
        <AccordionItem value="details">
          <AccordionTrigger>Produktdetails</AccordionTrigger>
          <AccordionContent>
            <p>{product.description}</p>
            <MetaList>
              <Meta k="Produktnummer (Variante)" v={selectedVariant?.sku} highlight />
              <Meta k="Farbe"      v={selectedColor} />
              <Meta k="Gewicht"    v={selectedVariant ? selectedVariant.weightGrams + ' g' : null} />
              <Meta k="Material"   v={product.material} />
              <Meta k="Geschlecht" v={product.gender} />
              <Meta k="Kollektion" v={product.collectionName} />
            </MetaList>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="shipping">
          <AccordionTrigger>Versand & Rückgabe</AccordionTrigger>
          <AccordionContent>
            Versand aus {product.originCountry}. {product.returnPeriodDays} Tage Rückgaberecht ab Erhalt
            der Ware. Versandkostenfrei innerhalb Deutschlands.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="pflege">
          <AccordionTrigger>Pflegehinweise</AccordionTrigger>
          <AccordionContent>
            <PflegeAccordionContent careInstructions={product.careInstructions} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

/* ---- helpers — keep these in a util module if you prefer ---- */

function hexFor(name: string): string {
  const map: Record<string, string> = {
    Black: '#0A0A0A', Purple: '#370E4D', Cream: '#E8E5DC',
    White: '#F5F5F0', Navy: '#1F2845', Olive: '#5A5B36',
  };
  return map[name] ?? '#999999';
}

function MetaList({ children }: { children: React.ReactNode }) {
  return <div className="mt-1">{children}</div>;
}

function Meta({ k, v, highlight }: { k: string; v: any; highlight?: boolean }) {
  const isNull = v === null || v === undefined || v === '';
  return (
    <div className={`flex gap-4 py-1.5 font-mono text-[11px] tracking-[0.04em] border-b border-dashed border-enunas-gray-light last:border-b-0`}>
      <span className="text-enunas-gray-medium min-w-[140px]">{k}</span>
      <span className={`
        ${isNull ? 'text-enunas-gray-medium italic' : 'text-enunas-black'}
        ${highlight && !isNull ? 'bg-enunas-purple/10 px-1.5 rounded-sm' : ''}
      `}>
        {isNull ? 'null' : v}
      </span>
    </div>
  );
}
