// Preisstruktur
export function formatPrice(price: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currency
  }).format(price)
}

// Nutzung:
formatPrice(179.99)  // "179,99 €"