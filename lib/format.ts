export function formatEuro(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    currencyDisplay: 'symbol',
  }).format(amount).replace(' ', ' ');
}

export function formatEuroFromCents(cents: number): string {
  return formatEuro(cents / 100);
}

export function formatDateLong(iso: string): string {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit', month: 'long', year: 'numeric',
  }).format(new Date(iso));
}
