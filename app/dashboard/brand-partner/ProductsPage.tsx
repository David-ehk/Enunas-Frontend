import { Plus } from 'lucide-react'
import DataTable from '../components/DataTable'
import { brandProducts } from '../lib/mockData'

const STATUS: Record<string, string> = {
  Active:   'bg-green-50 text-green-700',
  Inactive: 'bg-gray-100 text-gray-500',
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

export default function BrandProductsPage() {
  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] mb-0.5" style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B' }}>
            Krauss Studio
          </p>
          <h2 className="text-xl" style={{ fontFamily: 'var(--font-Cormorant-Garamond)', fontWeight: 500, color: '#0A0A0A' }}>
            My Products
          </h2>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 text-white text-[11px] uppercase tracking-[0.1em] transition-colors duration-200 hover:opacity-90"
          style={{ background: '#370E4D', borderRadius: '4px', fontFamily: 'var(--font-league-spartan)' }}
        >
          <Plus size={13} />
          Add Product
        </button>
      </div>

      {/* Products table */}
      <div className="bg-white overflow-hidden">
        <DataTable
          headers={['SKU', 'Product Name', 'Price', 'Sizes', 'Sold', 'Status']}
          rows={brandProducts.map(p => [
            <span key="sku" className="font-mono text-[11px]" style={{ color: '#6B6B6B' }}>{p.sku}</span>,
            <span key="name" className="font-medium" style={{ fontFamily: 'var(--font-league-spartan)', color: '#0A0A0A' }}>{p.name}</span>,
            p.price,
            <span key="sizes" className="text-[11px]" style={{ color: '#6B6B6B' }}>{p.sizes}</span>,
            <span key="sold" className="font-semibold" style={{ fontFamily: 'var(--font-league-spartan)', color: '#370E4D' }}>{p.sold}</span>,
            <Badge key="badge" status={p.status} />,
          ])}
        />
      </div>

      {/* Summary footer */}
      <div className="flex gap-6 text-[11px]" style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B' }}>
        <span>{brandProducts.length} total listings</span>
        <span>{brandProducts.filter(p => p.status === 'Active').length} active</span>
        <span>{brandProducts.filter(p => p.status === 'Inactive').length} inactive</span>
      </div>
    </div>
  )
}
