// Slug Generator

// create Slug() - Text-> slug Andere Utilities

/**
 * Wandelt Text in einen URL-freundlichen Slug um
 * @param text - Der Text der umgewandelt werden soll
 * @returns URL-freundlicher Slug
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()                    // 1. Alles klein
    .trim()                           // 2. Leerzeichen an Anfang/Ende weg
    .replace(/ä/g, 'ae')              // 3. Umlaute ersetzen
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9\s-]/g, '')     // 4. Nur Buchstaben, Zahlen, Leerzeichen, Bindestriche
    .replace(/\s+/g, '-')             // 5. Leerzeichen → Bindestrich
    .replace(/-+/g, '-')              // 6. Mehrere Bindestriche → einer
    .replace(/^-+|-+$/g, '')          // 7. Bindestriche am Anfang/Ende weg
}

/**
 * Überprüft ob ein Slug valide ist
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
}

/**
 * Erstellt einen einzigartigen Slug (falls schon vorhanden)
 */
export function createUniqueSlug(text: string, existingSlugs: string[]): string {
  let slug = createSlug(text)
  let counter = 1
  
  // Wenn Slug schon existiert, füge Nummer hinzu
  while (existingSlugs.includes(slug)) {
    slug = `${createSlug(text)}-${counter}`
    counter++
  }
  
  return slug
}