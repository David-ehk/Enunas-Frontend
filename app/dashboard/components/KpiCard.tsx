import { TrendingUp, TrendingDown } from 'lucide-react'

interface KpiCardProps {
  label: string
  value: string
  icon: React.ReactNode
  trend?: string
  trendUp?: boolean
  accent?: string
}

export default function KpiCard({ label, value, icon, trend, trendUp, accent = '#370E4D' }: KpiCardProps) {
  return (
    <div
      className="bg-white p-5 flex flex-col gap-4 relative overflow-hidden"
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      {/* Icon top-right */}
      <div className="flex items-start justify-between">
        <p
          className="text-[10px] uppercase tracking-[0.15em]"
          style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B' }}
        >
          {label}
        </p>
        <div
          className="w-8 h-8 flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(55,14,77,0.06)', borderRadius: '4px', color: accent }}
        >
          {icon}
        </div>
      </div>

      {/* Value */}
      <div className="flex items-end gap-3">
        <p
          className="text-3xl text-[#0A0A0A] leading-none"
          style={{ fontFamily: 'var(--font-league-spartan)', fontWeight: 700 }}
        >
          {value}
        </p>
        {trend && (
          <span
            className="flex items-center gap-1 text-[10px] uppercase tracking-[0.05em] mb-0.5"
            style={{
              fontFamily: 'var(--font-league-spartan)',
              color: trendUp ? '#1A5A3C' : '#8B1E3F',
            }}
          >
            {trendUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {trend}
          </span>
        )}
      </div>
    </div>
  )
}
