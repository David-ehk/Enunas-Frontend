import { productApi } from './modules/productApi';
import { apiProductToProduct } from './productAdapter';
import { generateSlug } from '../product';
import type { Product } from '../product';

export async function resolveProductBySlug(
  brandSlug: string,
  productSlug: string
): Promise<Product | null> {
  const results = await productApi.search(productSlug, { size: 20 });
  const match = results.content.find(
    (p) => generateSlug(p.name) === productSlug && generateSlug(p.brandName) === brandSlug
  );
  if (!match) return null;

  const [images, variants] = await Promise.all([
    productApi.getImages(match.id).catch(() => []),
    productApi.getVariants(match.id).catch(() => []),
  ]);

  return apiProductToProduct(match, images, variants);
}

export async function resolveProductWithMeta(
  brandSlug: string,
  productSlug: string
): Promise<{ product: Product; defaultListingId?: string } | null> {
  const results = await productApi.search(productSlug, { size: 20 });
  const match = results.content.find(
    (p) => generateSlug(p.name) === productSlug && generateSlug(p.brandName) === brandSlug
  );
  if (!match) return null;

  const [images, variants] = await Promise.all([
    productApi.getImages(match.id).catch(() => []),
    productApi.getVariants(match.id).catch(() => []),
  ]);

  return {
    product: apiProductToProduct(match, images, variants),
    defaultListingId: match.defaultListingId,
  };
}
