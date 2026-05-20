import { Info } from 'lucide-react'
import DataTable from '../components/DataTable'
import { brandPayouts } from '../lib/mockData'

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

export default function BrandPayoutsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.15em] mb-0.5" style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B' }}>
          Krauss Studio
        </p>
        <h2 className="text-xl" style={{ fontFamily: 'var(--font-Cormorant-Garamond)', fontWeight: 500, color: '#0A0A0A' }}>
          Payouts
        </h2>
      </div>

      {/* Commission info */}
      <div className="flex items-start gap-3 p-4 bg-white" style={{ borderLeft: '3px solid #370E4D' }}>
        <Info size={14} color="#370E4D" className="mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] mb-1" style={{ fontFamily: 'var(--font-league-spartan)', color: '#370E4D' }}>
            Commission Structure
          </p>
          <p className="text-[12px] leading-relaxed" style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B' }}>
            Enunas retains a 20% platform commission on all sales. Net payouts are transferred on the 2nd of each month via bank transfer. Payouts for the current month are settled after the 1st.
          </p>
        </div>
      </div>

      {/* Payouts table */}
      <div className="bg-white overflow-hidden">
        <div className="px-5 py-3.5 border-b" style={{ borderColor: '#E8E8E8' }}>
          <p className="text-[10px] uppercase tracking-[0.15em]" style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B' }}>
            Payout History
          </p>
        </div>
        <DataTable
          headers={['Payout ID', 'Period', 'Orders', 'Gross Sales', 'Commission (20%)', 'Net Payout', 'Status', 'Date']}
          rows={brandPayouts.map(p => [
            <span key="id" className="font-mono text-[11px]" style={{ color: '#6B6B6B' }}>{p.id}</span>,
            p.period,
            p.orders,
            p.gross,
            <span key="comm" style={{ color: '#8B1E3F' }}>{p.commission}</span>,
            <span key="net" className="font-semibold" style={{ fontFamily: 'var(--font-league-spartan)', color: '#1A5A3C' }}>{p.net}</span>,
            <Badge key="badge" status={p.status} />,
            p.date,
          ])}
        />
      </div>
    </div>
  )
}
