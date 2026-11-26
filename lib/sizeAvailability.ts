/**
 * Whether a size is crossed out on the product page. Nothing of a coming-soon product can be
 * bought yet, whatever stock the brand has already entered.
 */
export function isSizeUnavailable(
  variant: { stockQuantity: number } | undefined,
  comingSoon: boolean,
): boolean {
  return comingSoon || !variant || variant.stockQuantity === 0
}
