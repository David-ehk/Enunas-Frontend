// The product page on phones has two resting places: the full photo (0) and `lock`, where the
// breadcrumb has just gone behind the navbar. A swipe never comes to rest between them, and one coming from above stops at
// `lock` however hard it was; from there downwards scrolling is free.

/** Below this the finger barely moved, so it is not read as a direction. */
const NUDGE_PX = 8

/** Where to glide after a swipe that went from `from` to `to`, or null to leave the page alone. */
export function snapTarget({ from, to, lock }: { from: number; to: number; lock: number }): number | null {
  // The 1px slack absorbs zoom rounding at both ends.
  if (to <= 1) return null
  if (from < lock - 1 && to > lock + 1) return lock
  if (to >= lock - 1) return null
  if (Math.abs(to - from) < NUDGE_PX) return to > lock / 2 ? lock : 0
  return to > from ? lock : 0
}
