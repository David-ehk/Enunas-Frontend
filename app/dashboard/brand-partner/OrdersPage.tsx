'use client'

import { useState } from 'react'
import DataTable from '../components/DataTable'
import { brandAllOrders } from '../lib/mockData'

const ALL_STATUSES = ['All', 'Shipped', 'Processing', 'Delivered']

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

export default function BrandOrdersPage() {
  const [filter, setFilter] = useState('All')
  const orders = filter === 'All' ? brandAllOrders : brandAllOrders.filter(o => o.status === filter)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.15em] mb-0.5" style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B' }}>
          Krauss Studio
        </p>
        <h2 className="text-xl" style={{ fontFamily: 'var(--font-Cormorant-Garamond)', fontWeight: 500, color: '#0A0A0A' }}>
          Orders
        </h2>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 bg-white border" style={{ borderColor: '#E8E8E8', borderRadius: '4px', display: 'inline-flex' }}>
        {ALL_STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition-all duration-200"
            style={{
              fontFamily: 'var(--font-league-spartan)',
              borderRadius: '3px',
              background: filter === s ? '#370E4D' : 'transparent',
              color: filter === s ? '#FFFFFF' : '#6B6B6B',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Orders table */}
      <div className="bg-white overflow-hidden">
        <DataTable
          headers={['Order ID', 'Product', 'Size', 'City', 'Total', 'Status', 'Date']}
          emptyMessage="No orders match this filter"
          rows={orders.map(o => [
            <span key="id" className="font-medium text-[12px]" style={{ fontFamily: 'var(--font-league-spartan)', color: '#370E4D' }}>{o.id}</span>,
            o.product,
            o.size,
            o.city,
            <span key="total" className="font-semibold" style={{ fontFamily: 'var(--font-league-spartan)', color: '#0A0A0A' }}>{o.total}</span>,
            <Badge key="badge" status={o.status} />,
            o.date,
          ])}
        />
      </div>

      <p className="text-[11px]" style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B' }}>
        Showing {orders.length} of {brandAllOrders.length} orders
      </p>
    </div>
  )
}
