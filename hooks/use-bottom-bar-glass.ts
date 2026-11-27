'use client'

import { useSyncExternalStore } from 'react'
import { isAppleSafari } from '@/lib/isAppleSafari'

const subscribe = () => () => {}

/** The glass strip under a bottom bar (globals.css), for every browser except Safari. */
export function useBottomBarGlass(): string {
  return useSyncExternalStore(
    subscribe,
    () => (isAppleSafari(navigator.userAgent) ? '' : 'bottom-bar-glass'),
    () => '',
  )
}
