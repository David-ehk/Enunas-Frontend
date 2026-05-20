import RecRow from './RecRow';
import { RecItem } from './ProductCard';

interface SimilarProductsProps {
  items: RecItem[];
  allHref?: string;
}

export default function SimilarProducts({ items, allHref }: SimilarProductsProps) {
  return <RecRow title="Ähnliche Produkte" items={items} allHref={allHref} />;
}
