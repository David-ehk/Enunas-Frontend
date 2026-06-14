interface StatCardsProps {
  ordersCount: number;
  wishlistCount: number;
  totalSpent?: number;
}

function fmtEuro(amount: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount)
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-enunas-off-white p-7 transition-transform duration-300 ease-out-expo hover:-translate-y-1">
      <p className="font-cormorant text-4xl font-light text-enunas-black leading-none mb-2">
        {value}
      </p>
      <p className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-gray-medium">
        {label}
      </p>
    </div>
  )
}

export default function StatCards({ ordersCount, wishlistCount, totalSpent }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
      <StatCard value={String(ordersCount)}                              label="Bestellungen" />
      <StatCard value={String(wishlistCount)}                            label="In der Wunschliste" />
      <StatCard value={totalSpent != null ? fmtEuro(totalSpent) : '—'}  label="Ausgegeben" />
    </div>
  )
}
