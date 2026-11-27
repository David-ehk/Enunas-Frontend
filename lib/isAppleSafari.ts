/**
 * Apple's own Safari, as opposed to Chrome, the Google app, Firefox, Edge or an in-app browser
 * (which on iPhone run on the same engine, so CSS feature queries cannot tell them apart).
 */
export function isAppleSafari(userAgent: string): boolean {
  // Real Safari reports "Version/x … Safari"; the others add their own token or drop one of these.
  return /Version\/[\d.]+.*Safari\//.test(userAgent)
    && !/CriOS|FxiOS|EdgiOS|GSA\/|OPiOS|Chrome|Chromium|Android/.test(userAgent)
}
