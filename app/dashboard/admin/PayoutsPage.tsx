'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { adminPayouts } from '../lib/mockData'

type PayoutStatus = 'Pending' | 'Paid'

interface Payout {
  id: string
  brand: string
  period: string
  gross: string
  commission: string
  net: string
  status: string
}

const STATUS: Record<string, string> = {
  Pending: 'bg-amber-50 text-amber-700',
  Paid:    'bg-blue-50 text-blue-700',
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

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>(adminPayouts)

  const releaseAll = () => {
    setPayouts(prev => prev.map(p => p.status === 'Pending' ? { ...p, status: 'Paid' } : p))
  }

  const pendingCount = payouts.filter(p => p.status === 'Pending').length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] mb-0.5" style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B' }}>
            Enunas Admin
          </p>
          <h2 className="text-xl" style={{ fontFamily: 'var(--font-Cormorant-Garamond)', fontWeight: 500, color: '#0A0A0A' }}>
            Payouts
          </h2>
        </div>
        {pendingCount > 0 && (
          <button
            onClick={releaseAll}
            className="flex items-center gap-2 px-4 py-2 text-white text-[11px] uppercase tracking-[0.1em] transition-opacity duration-200 hover:opacity-90"
            style={{ background: '#1A5A3C', borderRadius: '4px', fontFamily: 'var(--font-league-spartan)' }}
          >
            <Send size={12} />
            Release {pendingCount} Pending
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pending Payouts', value: pendingCount },
          { label: 'Paid This Cycle', value: payouts.filter(p => p.status === 'Paid').length },
          {
            label: 'Total Pending Net',
            value: payouts.filter(p => p.status === 'Pending').reduce((_, p) => p.net, '—'),
          },
          { label: 'Total Brands', value: new Set(payouts.map(p => p.brand)).size },
        ].map(s => (
          <div key={s.label} className="bg-white p-4">
            <p className="text-[10px] uppercase tracking-[0.12em] mb-1" style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B' }}>{s.label}</p>
            <p className="text-2xl font-bold" style={{ fontFamily: 'var(--font-league-spartan)', color: '#370E4D' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Payouts table */}
      <div className="bg-white overflow-hidden">
        <div className="px-5 py-3.5 border-b" style={{ borderColor: '#E8E8E8' }}>
          <p className="text-[10px] uppercase tracking-[0.15em]" style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B' }}>
            All Payouts
          </p>
        </div>
        <table className="w-full min-w-full border-collapse">
          <thead>
            <tr style={{ background: '#F5F5F0', borderBottom: '1px solid #E8E8E8' }}>
              {['Payout ID', 'Brand', 'Period', 'Gross', 'Commission', 'Net', 'Status'].map(h => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.12em] whitespace-nowrap"
                  style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B', fontWeight: 600 }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payouts.map(p => (
              <tr key={p.id} className="transition-colors duration-150 hover:bg-[#F5F5F0]/50" style={{ borderBottom: '1px solid #E8E8E8' }}>
                <td className="px-4 py-3.5 text-sm align-middle">
                  <span className="font-mono text-[11px]" style={{ color: '#6B6B6B' }}>{p.id}</span>
                </td>
                <td className="px-4 py-3.5 text-sm align-middle" style={{ fontFamily: 'var(--font-league-spartan)', color: '#0A0A0A' }}>
                  {p.brand}
                </td>
                <td className="px-4 py-3.5 text-sm align-middle" style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B' }}>
                  {p.period}
                </td>
                <td className="px-4 py-3.5 text-sm align-middle" style={{ fontFamily: 'var(--font-league-spartan)', color: '#0A0A0A' }}>
                  {p.gross}
                </td>
                <td className="px-4 py-3.5 text-sm align-middle" style={{ fontFamily: 'var(--font-league-spartan)', color: '#8B1E3F' }}>
                  {p.commission}
                </td>
                <td className="px-4 py-3.5 text-sm align-middle font-semibold" style={{ fontFamily: 'var(--font-league-spartan)', color: '#1A5A3C' }}>
                  {p.net}
                </td>
                <td className="px-4 py-3.5 text-sm align-middle">
                  <Badge status={p.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
