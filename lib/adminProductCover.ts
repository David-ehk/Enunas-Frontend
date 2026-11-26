type AdminImage = string | { imageUrl: string; displayOrder?: number; primary?: boolean }

/**
 * Thumbnail URL for a product from GET /admin/products, which sends image objects even though
 * AdminApiProduct types them as strings.
 */
export function adminProductCover(images: AdminImage[] | undefined): string | undefined {
  const [cover] = (images ?? [])
    .map((image, index) => typeof image === 'string'
      ? { imageUrl: image, displayOrder: index, primary: false }
      : image)
    .sort((a, b) => Number(!!b.primary) - Number(!!a.primary) || (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
  return cover?.imageUrl
}
