import { TrendingUp, Euro, Building2, FileText, ShoppingBag } from 'lucide-react'
import KpiCard from '../components/KpiCard'
import RevenueChart from '../components/RevenueChart'
import DataTable from '../components/DataTable'
import {
  adminKpis,
  revenueChartData,
  adminApplications,
  adminTopBrands,
} from '../lib/mockData'

const ICONS: Record<string, React.ReactNode> = {
  trending: <TrendingUp size={16} />,
  euro:     <Euro size={16} />,
  building: <Building2 size={16} />,
  file:     <FileText size={16} />,
  bag:      <ShoppingBag size={16} />,
}

const ACCENT: Record<number, string> = {
  0: '#370E4D',
  1: '#9B7FB5',
  2: '#1A5A3C',
  3: '#7A5C1E',
  4: '#370E4D',
}

const APP_STATUS: Record<string, string> = {
  Pending:  'bg-amber-50 text-amber-700',
  Approved: 'bg-green-50 text-green-700',
  Rejected: 'bg-red-50 text-red-700',
}

function Badge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] font-medium ${APP_STATUS[status] ?? 'bg-gray-100 text-gray-500'}`}
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

export default function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {adminKpis.map((kpi, i) => (
          <KpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            icon={ICONS[kpi.icon]}
            accent={ACCENT[i]}
          />
        ))}
      </div>

      {/* Chart + top brands */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <SectionCard title="GMV & Platform Revenue — Last 6 Months">
            <div className="px-5 pt-4 pb-2">
              <RevenueChart data={revenueChartData} />
            </div>
          </SectionCard>
        </div>

        <div>
          <SectionCard title="Top Brand Partners">
            <div className="divide-y" style={{ borderColor: '#E8E8E8' }}>
              {adminTopBrands.map((b, i) => (
                <div key={b.name} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-6 h-6 flex items-center justify-center flex-shrink-0 text-[10px] font-semibold text-white"
                      style={{ background: '#370E4D', borderRadius: '3px', fontFamily: 'var(--font-league-spartan)' }}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ fontFamily: 'var(--font-league-spartan)', color: '#0A0A0A' }}>{b.name}</p>
                      <p className="text-[10px]" style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B' }}>{b.orders} orders</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-league-spartan)', color: '#370E4D' }}>{b.revenue}</p>
                    <p className="text-[10px]" style={{ fontFamily: 'var(--font-league-spartan)', color: '#1A5A3C' }}>{b.commission}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Recent applications */}
      <SectionCard title="Recent Applications">
        <DataTable
          headers={['Brand', 'Category', 'Followers', 'Submitted', 'Status']}
          rows={adminApplications.map(a => [
            <span key="name" className="font-medium" style={{ fontFamily: 'var(--font-league-spartan)', color: '#0A0A0A' }}>{a.name}</span>,
            a.category,
            a.followers,
            a.submitted,
            <Badge key="badge" status={a.status} />,
          ])}
        />
      </SectionCard>
    </div>
  )
}
