export interface TransitionClick {
  href: string
  currentUrl: string
  target: string | null
  download: boolean
  button: number
  metaKey: boolean
  ctrlKey: boolean
  shiftKey: boolean
  altKey: boolean
}

/**
 * Decides whether a link click should play the page-transition curtain. Returns the
 * path + search + hash to navigate to, or null when the browser should handle the click itself
 * (external/non-http links, new tabs, downloads, modified clicks, same-page query/hash changes).
 */
export function resolveTransitionTarget(click: TransitionClick): string | null {
  if (click.button !== 0 || click.metaKey || click.ctrlKey || click.shiftKey || click.altKey) return null
  if (click.download || (click.target && click.target !== '_self')) return null

  let to: URL
  let from: URL
  try {
    from = new URL(click.currentUrl)
    to = new URL(click.href, from)
  } catch {
    return null
  }

  if (to.origin !== from.origin) return null
  if (to.pathname === from.pathname) return null
  // Product pages (/bekleidung/[brand]/[slug]) open without the curtain.
  if (/^\/bekleidung\/[^/]+\/[^/]+\/?$/.test(to.pathname)) return null

  return `${to.pathname}${to.search}${to.hash}`
}
