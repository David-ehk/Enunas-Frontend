import DataTable from '../components/DataTable'
import { adminBrands } from '../lib/mockData'

const STATUS: Record<string, string> = {
  Active:    'bg-green-50 text-green-700',
  Suspended: 'bg-orange-50 text-orange-700',
  Inactive:  'bg-gray-100 text-gray-500',
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

export default function AdminBrandPartnersPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.15em] mb-0.5" style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B' }}>
          Enunas Admin
        </p>
        <h2 className="text-xl" style={{ fontFamily: 'var(--font-Cormorant-Garamond)', fontWeight: 500, color: '#0A0A0A' }}>
          Brand Partners
        </h2>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Brands', value: adminBrands.length },
          { label: 'Active', value: adminBrands.filter(b => b.status === 'Active').length },
          { label: 'Suspended', value: adminBrands.filter(b => b.status === 'Suspended').length },
          { label: 'Total Listings', value: adminBrands.reduce((s, b) => s + b.listings, 0) },
        ].map(s => (
          <div key={s.label} className="bg-white p-4">
            <p className="text-[10px] uppercase tracking-[0.12em] mb-1" style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B' }}>{s.label}</p>
            <p className="text-2xl font-bold" style={{ fontFamily: 'var(--font-league-spartan)', color: '#370E4D' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Brands table */}
      <div className="bg-white overflow-hidden">
        <DataTable
          headers={['Brand', 'Category', 'Listings', 'GMV', 'Commission', 'Joined', 'Status']}
          rows={adminBrands.map(b => [
            <span key="name" className="font-medium" style={{ fontFamily: 'var(--font-league-spartan)', color: '#0A0A0A' }}>{b.name}</span>,
            b.category,
            b.listings,
            <span key="gmv" className="font-semibold" style={{ fontFamily: 'var(--font-league-spartan)', color: '#370E4D' }}>{b.gmv}</span>,
            <span key="comm" style={{ color: '#1A5A3C' }}>{b.commission}</span>,
            b.joined,
            <Badge key="badge" status={b.status} />,
          ])}
        />
      </div>
    </div>
  )
}
