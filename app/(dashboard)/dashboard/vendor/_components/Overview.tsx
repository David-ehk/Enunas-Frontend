'use client'

import { useState, useEffect } from 'react'
import { brandApi } from '@/lib/api/modules/brandApi'
import type { AdminApiProduct, ApiOrder } from '@/types/api'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Package, ShoppingBag, TrendingUp, AlertCircle, ChevronRight, Truck } from 'lucide-react'
import {
  StatCard, SectionCard, StatusBadge, EmptyState, Loader,
  TH, TD, TableRow, fmt, fmtEur,
} from '../../admin/_components/shared'

const PIE_COLORS: Record<string, string> = {
  APPROVED:  '#1A5A3C',
  PENDING:   '#7A5C1E',
  REJECTED:  '#8B1E3F',
  HIDDEN:    '#6B6B6B',
  DEACTIVATED: '#9B9B9B',
}

export default function Overview({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [products, setProducts] = useState<AdminApiProduct[]>([])
  const [orders, setOrders]     = useState<ApiOrder[]>([])
  const [loading, setLoading]   = useState(true)
  const [mounted, setMounted]   = useState(false)

  useEffect(() => {
    setMounted(true)
    Promise.all([
      brandApi.products.getMy().catch(() => [] as AdminApiProduct[]),
      brandApi.orders.getAll().catch(() => [] as ApiOrder[]),
    ]).then(([p, o]) => { setProducts(p); setOrders(o) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  const approved     = products.filter(p => p.status === 'APPROVED').length
  const pending      = products.filter(p => p.status === 'PENDING').length
  const rejected     = products.filter(p => p.status === 'REJECTED').length
  const revenue      = orders.reduce((s, o) => s + (o.totalAmount ?? 0), 0)
  const readyToShip  = orders.filter(o => o.status === 'PAID')
  const recentProds  = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const pieData = [
    { name: 'Genehmigt',  value: approved, color: PIE_COLORS.APPROVED },
    { name: 'Ausstehend', value: pending,  color: PIE_COLORS.PENDING },
    { name: 'Abgelehnt',  value: rejected, color: PIE_COLORS.REJECTED },
  ].filter(d => d.value > 0)

  return (
    <div className="space-y-6">
      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Produkte gesamt"
          value={products.length}
          sub={`${approved} aktiv`}
          icon={<Package className="w-3 h-3 text-[#370E4D]" />}
        />
        <StatCard
          label="Genehmigt"
          value={approved}
          sub="Im Shop sichtbar"
          icon={<TrendingUp className="w-3 h-3 text-[#1A5A3C]" />}
        />
        <StatCard
          label="In Prüfung"
          value={pending}
          sub={pending > 0 ? 'Warten auf Freigabe' : 'Keine offenen'}
          icon={<AlertCircle className="w-3 h-3 text-[#7A5C1E]" />}
        />
        <StatCard
          label="Umsatz"
          value={fmtEur(revenue)}
          sub={`${orders.length} Bestellung${orders.length !== 1 ? 'en' : ''}`}
          icon={<ShoppingBag className="w-3 h-3 text-white/60" />}
          accent
        />
      </div>

      {/* ── Ready-to-ship alert ── */}
      {readyToShip.length > 0 && (
        <div
          className="flex items-center justify-between px-5 py-4 rounded-xl border"
          style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Truck className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-amber-800" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                {readyToShip.length} Bestellung{readyToShip.length > 1 ? 'en' : ''} versandbereit
              </p>
              <p className="text-[11px] text-amber-700/70 mt-0.5">Bezahlt — warten auf Versand</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('fulfillment')}
            className="flex items-center gap-1 text-[11px] font-medium text-amber-800 hover:text-amber-900 transition-colors"
            style={{ fontFamily: 'var(--font-league-spartan)' }}
          >
            Zum Fulfillment <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* ── Recent products ── */}
        <div className="col-span-2">
          <SectionCard
            title="Letzte Produkte"
            count={recentProds.length}
            action={
              <button
                onClick={() => onNavigate('products')}
                className="flex items-center gap-0.5 text-[11px] text-[#370E4D] hover:underline"
                style={{ fontFamily: 'var(--font-league-spartan)' }}
              >
                Alle <ChevronRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            {recentProds.length === 0 ? <EmptyState message="Noch keine Produkte erstellt." /> : (
              <table className="w-full">
                <thead>
                  <tr><TH>Produkt</TH><TH>Kategorie</TH><TH>Preis</TH><TH>Status</TH></tr>
                </thead>
                <tbody>
                  {recentProds.map(p => (
                    <TableRow key={p.id}>
                      <TD>
                        <div className="flex items-center gap-2.5">
                          {p.images?.[0] && (
                            <img src={p.images[0]} alt="" className="w-7 h-9 object-cover rounded bg-[#F5F5F0] shrink-0" />
                          )}
                          <span className="font-medium text-[#0A0A0A] truncate max-w-[140px]">{p.name}</span>
                        </div>
                      </TD>
                      <TD className="text-[#6B6B6B] capitalize">{p.category?.toLowerCase()}</TD>
                      <TD className="font-medium">{fmtEur(p.price)}</TD>
                      <TD><StatusBadge status={p.status} /></TD>
                    </TableRow>
                  ))}
                </tbody>
              </table>
            )}
          </SectionCard>
        </div>

        {/* ── Status chart ── */}
        <div>
          <SectionCard title="Produktstatus">
            {products.length === 0 ? <EmptyState message="Keine Daten." /> : (
              <div className="p-5">
                {mounted && pieData.length > 0 && (
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%" cy="50%"
                        innerRadius={42} outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          fontFamily: 'var(--font-league-spartan)',
                          fontSize: 11,
                          border: '1px solid #E8E8E8',
                          borderRadius: 8,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        }}
                        formatter={(val, name) => [Number(val), String(name)]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                <div className="space-y-2.5 mt-2">
                  {[
                    { label: 'Genehmigt',  count: approved, color: PIE_COLORS.APPROVED },
                    { label: 'Ausstehend', count: pending,  color: PIE_COLORS.PENDING },
                    { label: 'Abgelehnt',  count: rejected, color: PIE_COLORS.REJECTED },
                  ].map(({ label, count, color }) => (
                    <div key={label} className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                        <span className="text-[#6B6B6B]" style={{ fontFamily: 'var(--font-league-spartan)' }}>{label}</span>
                      </div>
                      <span className="font-medium text-[#2D2D2D] tabular-nums">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      {/* ── Recent orders ── */}
      {recentOrders.length > 0 && (
        <SectionCard
          title="Letzte Bestellungen"
          count={recentOrders.length}
          action={
            <button
              onClick={() => onNavigate('fulfillment')}
              className="flex items-center gap-0.5 text-[11px] text-[#370E4D] hover:underline"
              style={{ fontFamily: 'var(--font-league-spartan)' }}
            >
              Alle <ChevronRight className="w-3.5 h-3.5" />
            </button>
          }
        >
          <table className="w-full">
            <thead>
              <tr><TH>Bestellung</TH><TH>Produkte</TH><TH>Betrag</TH><TH>Datum</TH><TH>Status</TH></tr>
            </thead>
            <tbody>
              {recentOrders.map(o => (
                <TableRow key={o.id}>
                  <TD className="font-mono text-[11px] font-medium text-[#0A0A0A]">#{o.id.slice(0, 8).toUpperCase()}</TD>
                  <TD className="text-[#6B6B6B] text-[12px]">
                    {(o.items ?? []).slice(0, 2).map(i => i.name).join(', ') || '—'}
                    {(o.items ?? []).length > 2 && ` +${o.items.length - 2}`}
                  </TD>
                  <TD className="font-medium">{fmtEur(o.totalAmount)}</TD>
                  <TD className="text-[#6B6B6B]">{fmt(o.createdAt)}</TD>
                  <TD><StatusBadge status={o.status} /></TD>
                </TableRow>
              ))}
            </tbody>
          </table>
        </SectionCard>
      )}
    </div>
  )
}
