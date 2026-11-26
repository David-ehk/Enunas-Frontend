import { byNewest } from '@/lib/newestProducts'

/**
 * Prioritised products first, in priority order; everything else newest first. Cards of the
 * same product keep their original relative order (Array.prototype.sort is stable).
 */
export function rankByPriority<T extends { productId: string; createdAt?: Date | string | null }>(
  cards: T[],
  priorityIds: string[],
): T[] {
  const rank = new Map(priorityIds.map((id, i) => [id, i]))
  return [...cards].sort((a, b) => {
    const ra = rank.get(a.productId)
    const rb = rank.get(b.productId)
    if (ra !== undefined && rb !== undefined) return ra - rb
    if (ra !== undefined) return -1
    if (rb !== undefined) return 1
    return byNewest(a, b)
  })
}
