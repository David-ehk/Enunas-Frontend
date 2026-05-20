// ============================================================
// ENUNAS — Account stat cards (Bestellungen / Wunschliste / Bonus)
// Drop into: enunas/app/(root)/account/components/StatCards.tsx
// ============================================================

import { formatEuro, type AccountStats } from '@/lib/account'

interface StatCardsProps {
  stats: AccountStats;
}

interface StatCardProps {
  value: string;
  label: string;
}

function StatCard({ value, label }: StatCardProps) {
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

export default function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
      <StatCard value={String(stats.ordersCount)}     label="Bestellungen" />
      <StatCard value={String(stats.wishlistCount)}   label="In der Wunschliste" />
      <StatCard value={formatEuro(stats.bonusCents)}  label="Bonus-Guthaben" />
    </div>
  )
}
