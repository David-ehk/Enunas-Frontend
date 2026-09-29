interface InitialRevealState {
  elapsedMs: number
  videosReady: boolean
  minMs: number
  maxMs: number
}

/**
 * The first-load curtain lifts once it has been up for `minMs` and the videos in the first
 * viewport can play, or at `maxMs` regardless, so a stalled video never traps the page.
 */
export function shouldRevealInitial({ elapsedMs, videosReady, minMs, maxMs }: InitialRevealState): boolean {
  if (elapsedMs >= maxMs) return true
  return elapsedMs >= minMs && videosReady
}
