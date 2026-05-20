import { Euro, Wallet, Package, ShoppingBag, CalendarDays } from 'lucide-react'
import KpiCard from '../components/KpiCard'
import DataTable from '../components/DataTable'
import {
  brandKpis,
  brandRecentOrders,
  brandTopProducts,
  brandNextPayout,
} from '../lib/mockData'

const ICONS: Record<string, React.ReactNode> = {
  euro:    <Euro size={16} />,
  wallet:  <Wallet size={16} />,
  package: <Package size={16} />,
  bag:     <ShoppingBag size={16} />,
}

const ACCENT: Record<number, string> = {
  0: '#370E4D',
  1: '#9B7FB5',
  2: '#370E4D',
  3: '#1A5A3C',
}

const STATUS: Record<string, string> = {
  Shipped:    'bg-blue-50 text-blue-700',
  Processing: 'bg-amber-50 text-amber-700',
  Delivered:  'bg-green-50 text-green-700',
}

function Badge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] font-medium ${STATUS[status] ?? 'bg-gray-100 text-gray-500'}`}
      style={{ borderRadius: '3px', fontFamily: 'var(--font-league-spartan)' }}
    >
      {status}
    </span>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white overflow-hidden">
      <div className="px-5 py-3.5 border-b" style={{ borderColor: '#E8E8E8' }}>
        <p className="text-[10px] uppercase tracking-[0.15em]" style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B' }}>
          {title}
        </p>
      </div>
      {children}
    </div>
  )
}

export default function BrandOverviewPage() {
  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {brandKpis.map((kpi, i) => (
          <KpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            icon={ICONS[kpi.icon]}
            accent={ACCENT[i]}
          />
        ))}
      </div>

      {/* Main content row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="xl:col-span-2">
          <SectionCard title="Recent Orders">
            <DataTable
              headers={['Order ID', 'Product', 'Size', 'City', 'Status', 'Date']}
              rows={brandRecentOrders.map(o => [
                <span key="id" className="font-medium" style={{ fontFamily: 'var(--font-league-spartan)', color: '#370E4D', fontSize: '12px' }}>{o.id}</span>,
                o.product,
                o.size,
                o.city,
                <Badge key="badge" status={o.status} />,
                o.date,
              ])}
            />
          </SectionCard>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Top products */}
          <SectionCard title="Top Products">
            <div className="divide-y" style={{ borderColor: '#E8E8E8' }}>
              {brandTopProducts.map((p, i) => (
                <div key={p.sku} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-6 h-6 flex items-center justify-center flex-shrink-0 text-[10px] font-semibold text-white"
                      style={{ background: '#370E4D', borderRadius: '3px', fontFamily: 'var(--font-league-spartan)' }}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm truncate" style={{ fontFamily: 'var(--font-league-spartan)', color: '#0A0A0A' }}>{p.name}</p>
                      <p className="text-[10px]" style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B' }}>{p.sold} sold</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold flex-shrink-0 ml-3" style={{ fontFamily: 'var(--font-league-spartan)', color: '#370E4D' }}>{p.revenue}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Next payout */}
          <div className="bg-white p-5" style={{ borderLeft: '3px solid #1A5A3C' }}>
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays size={14} color="#1A5A3C" />
              <p className="text-[10px] uppercase tracking-[0.15em]" style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B' }}>Next Payout</p>
            </div>
            <p className="text-2xl font-bold leading-none mb-2" style={{ fontFamily: 'var(--font-league-spartan)', color: '#0A0A0A' }}>
              {brandNextPayout.amount}
            </p>
            <p className="text-[11px]" style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B' }}>
              {brandNextPayout.date} · via {brandNextPayout.method}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
