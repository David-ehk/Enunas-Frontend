import type { ApiProductImageObject } from '@/types/api'

/**
 * The picture that represents one colourway outside the PDP gallery (cart line, checkout summary):
 * that colourway's own primary image, else its first own image, else `fallback`. Shared images are
 * deliberately skipped — they come first in the gallery but show no particular colour.
 */
export function colourwayCoverImage(
  images: ApiProductImageObject[] | undefined,
  colorId: number | null,
  fallback: string,
): string {
  if (!images || colorId == null) return fallback
  const own = images.filter(i => i.productColorId === colorId)
  return (own.find(i => i.primary) ?? own[0])?.url ?? fallback
}
