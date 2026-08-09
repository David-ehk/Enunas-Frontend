// Interim, localStorage-only persistence for the admin's 3 manually-picked "Top Designer"
// brands — mirrors the exact same pattern (and the exact same limitation) as
// lib/curation.ts's Schaufenster tool: this lives only in the admin's own browser, so a real
// visitor on a different device never sees it. Kept in its own module so swapping this for a
// real backend field later (see conversation notes) only touches this one file plus the two
// call sites (admin picker, /marken page) that import it.
const STORAGE_KEY = 'enunas_top_designers_v1'
const MAX = 3

export function getTopDesigners(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string').slice(0, MAX) : []
  } catch {
    return []
  }
}

export function saveTopDesigners(brandNames: string[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(brandNames.slice(0, MAX)))
}

export const MAX_TOP_DESIGNERS = MAX
