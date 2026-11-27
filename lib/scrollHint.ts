/** Whether a scroll box still has content below the fold. The 1px slack absorbs zoom rounding. */
export function hasMoreBelow(box: { scrollTop: number; clientHeight: number; scrollHeight: number }): boolean {
  return box.scrollHeight - box.clientHeight - box.scrollTop > 1
}
