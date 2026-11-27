// The size wheel: whichever row is in the middle is the picked size.

/** The row the wheel opens on: the buyable size nearest the middle of the list. */
export function startIndex(sizes: { unavailable: boolean }[]): number {
  const middle = Math.floor((sizes.length - 1) / 2)
  for (let d = 0; d < sizes.length; d++) {
    for (const i of [middle - d, middle + d]) {
      if (sizes[i] && !sizes[i].unavailable) return i
    }
  }
  return middle
}

/** The row in the middle at this scroll position; bouncing past an end keeps the end row. */
export function centredIndex(scrollTop: number, rowHeight: number, count: number): number {
  return Math.min(count - 1, Math.max(0, Math.round(scrollTop / rowHeight)))
}
