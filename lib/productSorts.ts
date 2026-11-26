import { byNewest } from '@/lib/newestProducts'
import { rankByPriority } from '@/lib/trending'

/** The card fields the sorts read. */
export interface SortableCard {
  id: string
  productId: string
  productName: string
  price: string
  createdAt?: Date | string | null
}

/** One entry in a product grid's sort menu. A page's first entry is its default. */
export interface ProductSort {
  id: string
  label: string
  /** Returns a sorted copy; never mutates the input. */
  apply<T extends SortableCard>(cards: T[]): T[]
}

/** Card prices are pre-formatted German strings, e.g. "1.299,00€". */
export function parsePriceNum(price: string): number {
  return parseFloat(price.replace(/[^\d,]/g, '').replace(',', '.')) || 0
}

export const STANDARD_SORTS: ProductSort[] = [
  { id: 'neu',       label: 'Neuheiten',         apply: cards => [...cards].sort(byNewest) },
  { id: 'preis-auf', label: 'Preis aufsteigend', apply: cards => [...cards].sort((a, b) => parsePriceNum(a.price) - parsePriceNum(b.price)) },
  { id: 'preis-ab',  label: 'Preis absteigend',  apply: cards => [...cards].sort((a, b) => parsePriceNum(b.price) - parsePriceNum(a.price)) },
  { id: 'name',      label: 'Name A–Z',          apply: cards => [...cards].sort((a, b) => a.productName.localeCompare(b.productName)) },
]

/** /bekleidung: no "Neuheiten" (new arrivals live on /neu). The default keeps the incoming
 *  order, which for a search is the result order. */
export const BROWSE_SORTS: ProductSort[] = [
  { id: 'empfohlen', label: 'Empfohlen', apply: cards => cards },
  ...STANDARD_SORTS.filter(s => s.id !== 'neu'),
]

/** These product ids first, in this order; everything else newest first. */
export function trendingSort(priorityIds: string[]): ProductSort {
  return { id: 'trendy', label: 'Trending', apply: cards => rankByPriority(cards, priorityIds) }
}

/** The selected sort, or the list's default when `id` isn't in it. */
export function resolveSort(sorts: ProductSort[], id: string): ProductSort {
  return sorts.find(s => s.id === id) ?? sorts[0]
}
