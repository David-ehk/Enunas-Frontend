/**
 * A product leads with a collection OR an inspiration story, never both: together they crowd
 * the product page. Shared by the brand dashboard forms and the product page.
 */
export type ProductHighlight = 'none' | 'collection' | 'inspiration'

/** Which text a product leads with. The story wins for products saved with both. */
export function highlightOf(collectionName?: string | null, inspirationStory?: string | null): ProductHighlight {
  if (inspirationStory?.trim()) return 'inspiration'
  if (collectionName?.trim()) return 'collection'
  return 'none'
}

/** Both fields as they should be saved or shown: only the chosen one keeps its text. */
export function highlightFields(highlight: ProductHighlight, collectionName: string, inspirationStory: string) {
  return {
    collectionName: highlight === 'collection' ? collectionName : '',
    inspirationStory: highlight === 'inspiration' ? inspirationStory : '',
  }
}
