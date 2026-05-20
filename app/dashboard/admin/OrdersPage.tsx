import DataTable from '../components/DataTable'
import { adminAllOrders } from '../lib/mockData'

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

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.15em] mb-0.5" style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B' }}>
          Enunas Admin
        </p>
        <h2 className="text-xl" style={{ fontFamily: 'var(--font-Cormorant-Garamond)', fontWeight: 500, color: '#0A0A0A' }}>
          All Orders
        </h2>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Orders', value: adminAllOrders.length },
          { label: 'Shipped', value: adminAllOrders.filter(o => o.status === 'Shipped').length },
          { label: 'Processing', value: adminAllOrders.filter(o => o.status === 'Processing').length },
        ].map(s => (
          <div key={s.label} className="bg-white p-4">
            <p className="text-[10px] uppercase tracking-[0.12em] mb-1" style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B' }}>{s.label}</p>
            <p className="text-2xl font-bold" style={{ fontFamily: 'var(--font-league-spartan)', color: '#370E4D' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Orders table */}
      <div className="bg-white overflow-hidden">
        <DataTable
          headers={['Order ID', 'Brand', 'Product', 'City', 'Total', 'Status', 'Date']}
          rows={adminAllOrders.map(o => [
            <span key="id" className="font-medium text-[12px]" style={{ fontFamily: 'var(--font-league-spartan)', color: '#370E4D' }}>{o.id}</span>,
            <span key="brand" className="text-[12px]" style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B' }}>{o.brand}</span>,
            o.product,
            o.city,
            <span key="total" className="font-semibold" style={{ fontFamily: 'var(--font-league-spartan)', color: '#0A0A0A' }}>{o.total}</span>,
            <Badge key="badge" status={o.status} />,
            o.date,
          ])}
        />
      </div>
    </div>
  )
}
