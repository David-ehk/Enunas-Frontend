// Build-time feature switches.
//
// These are read through `process.env.NEXT_PUBLIC_*`, which Next inlines at build time, so a flag
// is decided when the bundle is built — not per request. Flipping one needs a rebuild/redeploy.

/**
 * The post-purchase upsell: the "exklusives Angebot" screen on the order confirmation, the
 * `/angebot/[brand]/[slug]` promo page, and the UPSELL10 code those two hand to the checkout.
 *
 * OFF unless NEXT_PUBLIC_ENABLE_UPSELL is exactly "true", so production stays clean by default
 * and no one can reach the flow by guessing `?upsell=true`. Set it in .env.local to work on the
 * feature; delete it (or set anything else) to switch the whole flow off again.
 */
export const UPSELL_ENABLED = process.env.NEXT_PUBLIC_ENABLE_UPSELL === 'true'

/** localStorage key the promo page uses to hand UPSELL10 to the checkout. */
export const UPSELL_CODE_STORAGE_KEY = 'enunas_upsell_code'
