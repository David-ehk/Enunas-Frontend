import RecRow from './RecRow';
import { RecItem } from './ProductCard';

interface MoreFromBrandProps {
  brand: string;
  items: RecItem[];
  allHref?: string;
}

export default function MoreFromBrand({ brand, items, allHref }: MoreFromBrandProps) {
  return (
    <RecRow
      title="Mehr von"
      titleAccent={brand}
      items={items}
      allHref={allHref ?? `/marken/${brand.toLowerCase().replace(/\s+/g, '-')}`}
    />
  );
}
