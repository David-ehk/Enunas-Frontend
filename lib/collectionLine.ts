/**
 * The collection shown above the price on the product page. An inspiration story takes that spot;
 * the collection is then listed only under Produktdetails (where it always appears).
 */
export function collectionAbovePrice(
  collectionName: string | null | undefined,
  inspirationStory: string | null | undefined,
): string | null {
  if (inspirationStory?.trim()) return null
  return collectionName || null
}
