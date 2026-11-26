// The admin editor renders only live products, but a saved list can also hold hidden ones.
// These helpers edit by product id so hidden ids keep their place and are never dropped.

export function removeCuratedId(ids: string[], id: string): string[] {
  return ids.filter(x => x !== id)
}

/** Moves `id` so it sits directly before `beforeId`. */
export function moveCuratedId(ids: string[], id: string, beforeId: string): string[] {
  if (id === beforeId || !ids.includes(id)) return ids
  const rest = ids.filter(x => x !== id)
  const at = rest.indexOf(beforeId)
  if (at === -1) return ids
  return [...rest.slice(0, at), id, ...rest.slice(at)]
}

/** Inserts a new `id` before `beforeId`, or appends it. No-op when `id` is already listed. */
export function insertCuratedId(ids: string[], id: string, beforeId?: string): string[] {
  if (ids.includes(id)) return ids
  const at = beforeId === undefined ? -1 : ids.indexOf(beforeId)
  if (at === -1) return [...ids, id]
  return [...ids.slice(0, at), id, ...ids.slice(at)]
}
