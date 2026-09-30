interface StockVariant {
  id: string
  stockQuantity?: number
}

/** A product is sold out when it has variants and every one of them is at zero stock. */
export function isSoldOut(variants: StockVariant[]): boolean {
  return variants.length > 0 && variants.every(v => (v.stockQuantity ?? 0) === 0)
}

/** The variants that still need setting to zero — already-empty ones are left alone. */
export function variantsToSellOut<T extends StockVariant>(variants: T[]): T[] {
  return variants.filter(v => (v.stockQuantity ?? 0) > 0)
}

/** Stock to put back when a sold-out variant is made available again: what it had before, else 1. */
export function restockQuantity(previousStock: number | undefined): number {
  return previousStock && previousStock > 0 ? previousStock : 1
}
