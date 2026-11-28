// Adding from a suggestion puts a new line above the suggestions. Chrome holds the view still by
// itself; Safari does not, so the page would jump.

/** Remembers where `el` is on screen; the returned function scrolls it back there. */
export function keepInPlace(el: Element): () => void {
  const before = el.getBoundingClientRect().top
  let list = el.parentElement
  while (list && !/auto|scroll/.test(getComputedStyle(list).overflowY)) list = list.parentElement

  return () => {
    if (!el.isConnected) return
    const moved = el.getBoundingClientRect().top - before
    if (Math.abs(moved) < 1) return
    if (list && list !== document.body && list !== document.documentElement) list.scrollTop += moved
    else window.scrollBy(0, moved)
  }
}
