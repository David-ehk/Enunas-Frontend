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

/**
 * The gallery for one colourway: its own images plus the shared (untagged) ones, primary first.
 * The full list when that leaves nothing, or when there is no per-image colour metadata.
 */
export function colourwayGallery(
  images: ApiProductImageObject[] | undefined,
  colorId: number | null,
  allImages: string[],
): string[] {
  const matches = (images ?? []).filter(i => i.productColorId == null || i.productColorId === colorId)
  if (matches.length === 0) return allImages
  return matches.sort((a, b) => Number(b.primary) - Number(a.primary)).map(i => i.url)
}
