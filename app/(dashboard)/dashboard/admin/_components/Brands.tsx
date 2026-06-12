'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { adminApi } from '@/lib/api'
import type { AdminBrand, AdminApiProduct, ApiOrder, AdminPayout } from '@/types/api'
import { PageHeader, KPIGrid, KPICell, SectionCard, StatusBadge, EmptyState, Loader, FilterBar, SearchInput, TH, TD, TableRow, fmt, fmtEur, dailyCounts, dailySumByKey, weekDeltaStr } from './shared'
import { ChevronDown, ChevronUp, X, TrendingUp, ShoppingBag, Package, Banknote } from 'lucide-react'

type Filter = 'all' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'

// Mirrors backend SetPayoutProfileDto exactly — { iban, bankAccountHolder }
interface PayoutDraft {
  iban: string
  bankAccountHolder: string
}

// Address fields are @NotBlank in the backend; `domestic` is derived server-side
// from addressCountry === 'DE' and cannot be set independently.
interface StammDraft {
  legalName: string
  addressStreet: string
  addressPostalCode: string
  addressCity: string
  addressCountry: string
  vatId: string
  taxNumber: string
}

function isDomesticDerived(brand: { domestic?: boolean; isDomestic?: boolean; addressCountry?: string }): boolean {
  return brand.domestic ?? brand.isDomestic ?? brand.addressCountry === 'DE'
}

const COUNTRIES = [
  { code: 'DE', name: 'Deutschland' },
  { code: 'AT', name: 'Österreich' },
  { code: 'CH', name: 'Schweiz' },
  { code: 'FR', name: 'Frankreich' },
  { code: 'IT', name: 'Italien' },
  { code: 'ES', name: 'Spanien' },
  { code: 'NL', name: 'Niederlande' },
  { code: 'BE', name: 'Belgien' },
  { code: 'LU', name: 'Luxemburg' },
  { code: 'PL', name: 'Polen' },
  { code: 'CZ', name: 'Tschechien' },
  { code: 'HU', name: 'Ungarn' },
  { code: 'RO', name: 'Rumänien' },
  { code: 'SE', name: 'Schweden' },
  { code: 'DK', name: 'Dänemark' },
  { code: 'FI', name: 'Finnland' },
  { code: 'NO', name: 'Norwegen' },
  { code: 'PT', name: 'Portugal' },
  { code: 'GR', name: 'Griechenland' },
  { code: 'GB', name: 'Vereinigtes Königreich' },
  { code: 'US', name: 'Vereinigte Staaten' },
  { code: 'CA', name: 'Kanada' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
  { code: 'AU', name: 'Australien' },
]

function ActionBtn({
  onClick, disabled, variant, children,
}: {
  onClick: () => void
  disabled?: boolean
  variant: 'danger' | 'success' | 'warning' | 'ghost' | 'purple'
  children: React.ReactNode
}) {
  const styles = {
    danger:  'border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600',
    success: 'border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600',
    warning: 'border-amber-200 text-amber-700 hover:bg-amber-500 hover:text-white hover:border-amber-500',
    ghost:   'border-[#E8E8E8] text-[#6B6B6B] hover:bg-[#F5F5F0] hover:text-[#2D2D2D]',
    purple:  'border-[#370E4D]/20 text-[#370E4D] hover:bg-[#370E4D] hover:text-white hover:border-[#370E4D]',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1 h-7 px-2.5 rounded-lg text-[11px] font-medium border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${styles[variant]}`}
      style={{ fontFamily: 'var(--font-league-spartan)' }}
    >
      {children}
    </button>
  )
}

function FLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-[0.10em] text-[#9B9B9B] font-medium mb-1.5"
      style={{ fontFamily: 'var(--font-league-spartan)' }}>
      {children}
    </p>
  )
}
function FInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full text-[12px] border border-[#E8E8E8] bg-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#370E4D]/40 focus:ring-2 focus:ring-[#370E4D]/8 transition-all duration-200 placeholder:text-[#C0C0BC]"
      style={{ fontFamily: 'var(--font-league-spartan)' }} />
  )
}

/* ── Financial stat card (used inside the slide-over panel) ── */
function FinStat({
  icon, label, value, sub, accent,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
  accent?: boolean
}) {
  return (
    <div
      className={`rounded-xl border px-5 py-4 flex flex-col gap-1 transition-all duration-200 ${
        accent
          ? 'border-[#370E4D]/25 shadow-[0_2px_12px_rgba(55,14,77,0.14)]'
          : 'border-[#E8E8E8] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)]'
      }`}
      style={accent ? { background: 'linear-gradient(135deg, #3D1055 0%, #370E4D 60%, #2E0A42 100%)' } : undefined}
    >
      <div className={`flex items-center gap-2 ${accent ? 'text-white/50' : 'text-[#9B9B9B]'}`}>
        <span className={`w-5 h-5 rounded-md inline-flex items-center justify-center ${accent ? 'bg-white/10' : 'bg-[#F5F5F0]'}`}>
          {icon}
        </span>
        <span className="text-[10px] uppercase tracking-[0.12em] font-medium" style={{ fontFamily: 'var(--font-league-spartan)' }}>
          {label}
        </span>
      </div>
      <p className={`text-[22px] font-semibold tracking-tight leading-none mt-1 ${accent ? 'text-white' : 'text-[#0A0A0A]'}`}>
        {value}
      </p>
      {sub && (
        <p className={`text-[11px] mt-0.5 ${accent ? 'text-white/45' : 'text-[#9B9B9B]'}`}>{sub}</p>
      )}
    </div>
  )
}

/* ── Brand Financial Slide-Over Panel ── */
function BrandFinancialPanel({
  brand,
  products,
  orders,
  payouts,
  loading,
  onClose,
}: {
  brand: AdminBrand
  products: AdminApiProduct[]
  orders: ApiOrder[]
  payouts: AdminPayout[]
  loading: boolean
  onClose: () => void
}) {
  const brandProductIds = new Set(products.map(p => p.id))

  const brandOrders = orders.filter(order =>
    order.items.some(item => brandProductIds.has(item.productId))
  )

  const allBrandItems = brandOrders.flatMap(order =>
    order.items.filter(item => brandProductIds.has(item.productId))
  )

  const totalRevenue = allBrandItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const totalItemsSold = allBrandItems.reduce((sum, i) => sum + i.quantity, 0)

  const productStats = products.map(p => {
    const items = allBrandItems.filter(i => i.productId === p.id)
    const sold = items.reduce((sum, i) => sum + i.quantity, 0)
    const revenue = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    return { ...p, sold, revenue }
  }).sort((a, b) => b.revenue - a.revenue)

  const brandPayouts = payouts.filter(p => String(p.brandPartnerId) === String(brand.id))
  const pendingPayoutTotal = brandPayouts
    .filter(p => p.status === 'PENDING' || p.status === 'APPROVED')
    .reduce((sum, p) => sum + p.amount, 0)

  const isApproved = (s: string) => s === 'APPROVED' || s === 'ACTIVE'

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[760px] flex flex-col bg-[#F8F8F5] shadow-[−8px_0_40px_rgba(0,0,0,0.12)] overflow-hidden">

        {/* ── Panel Header ── */}
        <div className="flex items-start justify-between px-8 pt-7 pb-6 bg-white border-b border-[#EBEBEB]">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <h2 className="text-[20px] font-semibold text-[#0A0A0A] tracking-tight"
                style={{ fontFamily: 'var(--font-league-spartan)' }}>
                {brand.brandName}
              </h2>
              <StatusBadge status={isApproved(brand.status) ? 'APPROVED' : brand.status} />
            </div>
            <p className="text-[12px] text-[#9B9B9B]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
              {brand.email ?? brand.userEmail ?? brand.contactEmail ?? '—'}
            </p>
            <p className="text-[10px] uppercase tracking-[0.1em] text-[#C0C0BC] font-mono">
              ID: {brand.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#9B9B9B] hover:text-[#0A0A0A] hover:bg-[#F0F0EB] transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-8 py-7 space-y-8">

          {loading ? (
            <Loader />
          ) : (
            <>
              {/* ── KPI Cards ── */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <FinStat
                  icon={<TrendingUp className="w-3 h-3" />}
                  label="Gesamtumsatz"
                  value={fmtEur(totalRevenue)}
                  sub={`${brandOrders.length} Bestellung${brandOrders.length !== 1 ? 'en' : ''}`}
                  accent
                />
                <FinStat
                  icon={<ShoppingBag className="w-3 h-3" />}
                  label="Verkaufte Artikel"
                  value={String(totalItemsSold)}
                  sub={`${products.length} Produkt${products.length !== 1 ? 'e' : ''} im Katalog`}
                />
                <FinStat
                  icon={<Package className="w-3 h-3" />}
                  label="Bestellungen"
                  value={String(brandOrders.length)}
                  sub={`Ø ${brandOrders.length > 0 ? fmtEur(totalRevenue / brandOrders.length) : '€ 0'} / Bestellung`}
                />
                <FinStat
                  icon={<Banknote className="w-3 h-3" />}
                  label="Ausstehend"
                  value={fmtEur(pendingPayoutTotal)}
                  sub={`${brandPayouts.length} Auszahlung${brandPayouts.length !== 1 ? 'en' : ''} gesamt`}
                />
              </div>

              {/* ── Produktperformance ── */}
              <div className="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                <div className="px-6 py-4 border-b border-[#F0F0EB] bg-[#FAFAF8]">
                  <h3 className="text-[12px] font-semibold text-[#0A0A0A]"
                    style={{ fontFamily: 'var(--font-league-spartan)', letterSpacing: '0.03em' }}>
                    Produktperformance
                    <span className="ml-2 text-[11px] font-normal text-[#9B9B9B] bg-[#F0F0EB] px-2 py-0.5 rounded-full">
                      {products.length}
                    </span>
                  </h3>
                </div>
                {products.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-[12px] text-[#9B9B9B]">Keine Produkte vorhanden.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <TH>Produkt</TH>
                          <TH>Status</TH>
                          <TH>Preis</TH>
                          <TH>Verkauft</TH>
                          <TH>Umsatz</TH>
                          <TH>Anteil</TH>
                        </tr>
                      </thead>
                      <tbody>
                        {productStats.map(p => (
                          <TableRow key={p.id}>
                            <TD>
                              <div className="flex flex-col gap-0.5">
                                <span className="font-medium text-[#0A0A0A] text-[12px]">{p.name}</span>
                                <span className="text-[10px] text-[#C0C0BC] font-mono">{p.sku}</span>
                              </div>
                            </TD>
                            <TD><StatusBadge status={p.status} /></TD>
                            <TD className="text-[#6B6B6B]">{fmtEur(p.price)}</TD>
                            <TD>
                              <span className={`font-semibold text-[13px] ${p.sold > 0 ? 'text-[#0A0A0A]' : 'text-[#C0C0BC]'}`}>
                                {p.sold}
                              </span>
                            </TD>
                            <TD className="font-medium text-[#0A0A0A]">{fmtEur(p.revenue)}</TD>
                            <TD>
                              {totalRevenue > 0 ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-1.5 bg-[#F0F0EB] rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-[#370E4D] transition-all duration-500"
                                      style={{ width: `${Math.round((p.revenue / totalRevenue) * 100)}%` }}
                                    />
                                  </div>
                                  <span className="text-[11px] text-[#9B9B9B] tabular-nums">
                                    {Math.round((p.revenue / totalRevenue) * 100)}%
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[11px] text-[#C0C0BC]">—</span>
                              )}
                            </TD>
                          </TableRow>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ── Bestellverlauf ── */}
              <div className="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                <div className="px-6 py-4 border-b border-[#F0F0EB] bg-[#FAFAF8]">
                  <h3 className="text-[12px] font-semibold text-[#0A0A0A]"
                    style={{ fontFamily: 'var(--font-league-spartan)', letterSpacing: '0.03em' }}>
                    Bestellverlauf
                    <span className="ml-2 text-[11px] font-normal text-[#9B9B9B] bg-[#F0F0EB] px-2 py-0.5 rounded-full">
                      {brandOrders.length}
                    </span>
                  </h3>
                </div>
                {brandOrders.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-[12px] text-[#9B9B9B]">Noch keine Bestellungen.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <TH>Bestell-ID</TH>
                          <TH>Datum</TH>
                          <TH>Status</TH>
                          <TH>Artikel dieser Marke</TH>
                          <TH>Betrag (Marke)</TH>
                        </tr>
                      </thead>
                      <tbody>
                        {brandOrders.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(order => {
                          const relevantItems = order.items.filter(i => brandProductIds.has(i.productId))
                          const brandAmount = relevantItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
                          const itemCount = relevantItems.reduce((sum, i) => sum + i.quantity, 0)
                          return (
                            <TableRow key={order.id}>
                              <TD>
                                <span className="font-mono text-[11px] text-[#6B6B6B]">
                                  #{order.id.slice(-8).toUpperCase()}
                                </span>
                              </TD>
                              <TD className="text-[#6B6B6B]">{fmt(order.createdAt)}</TD>
                              <TD><StatusBadge status={order.status} /></TD>
                              <TD>
                                <div className="flex flex-col gap-0.5">
                                  {relevantItems.map((item, idx) => (
                                    <span key={idx} className="text-[11px] text-[#2D2D2D]">
                                      {item.name} ×{item.quantity}
                                      {item.size && <span className="text-[#9B9B9B]"> · {item.size}</span>}
                                    </span>
                                  ))}
                                  <span className="text-[10px] text-[#C0C0BC]">{itemCount} Artikel</span>
                                </div>
                              </TD>
                              <TD className="font-medium text-[#0A0A0A]">{fmtEur(brandAmount)}</TD>
                            </TableRow>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ── Auszahlungen ── */}
              <div className="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                <div className="px-6 py-4 border-b border-[#F0F0EB] bg-[#FAFAF8]">
                  <h3 className="text-[12px] font-semibold text-[#0A0A0A]"
                    style={{ fontFamily: 'var(--font-league-spartan)', letterSpacing: '0.03em' }}>
                    Auszahlungen
                    <span className="ml-2 text-[11px] font-normal text-[#9B9B9B] bg-[#F0F0EB] px-2 py-0.5 rounded-full">
                      {brandPayouts.length}
                    </span>
                  </h3>
                </div>
                {brandPayouts.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-[12px] text-[#9B9B9B]">Keine Auszahlungen vorhanden.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <TH>ID</TH>
                          <TH>Datum</TH>
                          <TH>Status</TH>
                          <TH>Betrag</TH>
                          <TH>Bezahlt am</TH>
                        </tr>
                      </thead>
                      <tbody>
                        {brandPayouts.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(payout => (
                          <TableRow key={payout.id}>
                            <TD>
                              <span className="font-mono text-[11px] text-[#6B6B6B]">
                                #{payout.id.slice(-8).toUpperCase()}
                              </span>
                            </TD>
                            <TD className="text-[#6B6B6B]">{fmt(payout.createdAt)}</TD>
                            <TD><StatusBadge status={payout.status} /></TD>
                            <TD className="font-semibold text-[#0A0A0A]">{fmtEur(payout.amount)}</TD>
                            <TD className="text-[#6B6B6B]">{payout.paidAt ? fmt(payout.paidAt) : '—'}</TD>
                          </TableRow>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ── Bankverbindung ── */}
              {(brand.iban || brand.bankAccountHolder) && (
                <div className="bg-white rounded-xl border border-[#E8E8E8] px-6 py-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                  <h3 className="text-[12px] font-semibold text-[#0A0A0A] mb-4"
                    style={{ fontFamily: 'var(--font-league-spartan)', letterSpacing: '0.03em' }}>
                    Bankverbindung
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'IBAN',         value: brand.iban },
                      { label: 'Kontoinhaber', value: brand.bankAccountHolder },
                    ].map(({ label, value }) => value ? (
                      <div key={label}>
                        <p className="text-[10px] uppercase tracking-[0.10em] text-[#9B9B9B] font-medium mb-1"
                          style={{ fontFamily: 'var(--font-league-spartan)' }}>
                          {label}
                        </p>
                        <p className="font-mono text-[12px] text-[#0A0A0A]">{value}</p>
                      </div>
                    ) : null)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Main Brands component
═══════════════════════════════════════════════════════════════ */
export default function Brands() {
  const [brands, setBrands]     = useState<AdminBrand[]>([])
  const [products, setProducts] = useState<AdminApiProduct[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState<Filter>('all')
  const [search, setSearch]     = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [acting, setActing]     = useState<string | null>(null)
  const [editingPayout, setEditingPayout] = useState<string | null>(null)
  const [payoutDraft, setPayoutDraft] = useState<PayoutDraft>({ iban: '', bankAccountHolder: '' })
  const [savingPayout, setSavingPayout] = useState(false)
  const [payoutError, setPayoutError]   = useState<string | null>(null)
  const [payouts, setPayouts]           = useState<AdminPayout[]>([])

  // Stammdaten editing
  const [editingStamm, setEditingStamm] = useState<string | null>(null)
  const [stammDraft, setStammDraft]     = useState<StammDraft>({ legalName: '', addressStreet: '', addressPostalCode: '', addressCity: '', addressCountry: 'DE', vatId: '', taxNumber: '' })
  const [savingStamm, setSavingStamm]   = useState(false)
  const [stammError, setStammError]     = useState<string | null>(null)
  const [confirmStamm, setConfirmStamm] = useState<string | null>(null)

  // §22f export
  const [export22fId, setExport22fId]     = useState<string | null>(null)
  const [exportPeriod, setExportPeriod]   = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const [exportFormat, setExportFormat]   = useState<'csv' | 'json'>('csv')
  const [exporting, setExporting]         = useState(false)

  // Financial panel
  const [selectedBrand, setSelectedBrand] = useState<AdminBrand | null>(null)
  const [ordersCache, setOrdersCache]     = useState<ApiOrder[] | null>(null)
  const [payoutsCache, setPayoutsCache]   = useState<AdminPayout[] | null>(null)
  const [panelLoading, setPanelLoading]   = useState(false)

  useEffect(() => {
    Promise.all([
      adminApi.brands.getAll().catch(() => []),
      adminApi.products.getAll().catch(() => []),
      adminApi.payouts.getAll().catch(() => [] as AdminPayout[]),
    ]).then(([b, p, py]) => { setBrands(b); setProducts(p); setPayouts(py) }).finally(() => setLoading(false))
  }, [])

  const productsByBrand = (brandName: string) => products.filter(p => p.brandName === brandName)

  const isApproved = (status: string) => status === 'APPROVED' || status === 'ACTIVE'

  const kpiData = useMemo(() => {
    const now = new Date()
    const y = now.getFullYear(), m = now.getMonth()
    const prevY = m === 0 ? y - 1 : y
    const prevM = m === 0 ? 11 : m - 1
    const inMonth = (s?: string, ty = y, tm = m) => {
      if (!s) return false
      const d = new Date(s); return d.getFullYear() === ty && d.getMonth() === tm
    }

    const active    = brands.filter(b => isApproved(b.status))
    const activeCount = active.length
    const avgProducts = activeCount > 0 ? (products.length / activeCount).toFixed(1) : '0'

    const mtdPayouts  = payouts.filter(p => inMonth(p.createdAt) && (p.status === 'PAID' || p.status === 'APPROVED'))
    const prevPayouts = payouts.filter(p => inMonth(p.createdAt, prevY, prevM) && (p.status === 'PAID' || p.status === 'APPROVED'))
    const payoutsMTD  = mtdPayouts.reduce((s, p) => s + p.amount, 0)
    const payoutsPrev = prevPayouts.reduce((s, p) => s + p.amount, 0)

    const newMTD  = brands.filter(b => inMonth(b.createdAt)).length
    const newPrev = brands.filter(b => inMonth(b.createdAt, prevY, prevM)).length

    return {
      activeCount,
      avgProducts,
      payoutsMTD,
      payoutsDelta:   weekDeltaStr(payoutsMTD, payoutsPrev),
      payoutSpark:    dailySumByKey(payouts.filter(p => p.status === 'PAID' || p.status === 'APPROVED'), 'amount'),
      pending:        brands.filter(b => b.status === 'PENDING').length,
      newMTD,
      newBrandsDelta: weekDeltaStr(newMTD, newPrev),
      brandSpark:     dailyCounts(brands.filter(b => !!b.createdAt) as { createdAt: string }[]),
    }
  }, [brands, products, payouts])

  const visible = brands.filter(b => {
    const q = search.toLowerCase()
    const matchSearch = !q || b.brandName.toLowerCase().includes(q) || (b.email ?? b.userEmail ?? b.contactEmail ?? '').toLowerCase().includes(q)
    if (!matchSearch) return false
    if (filter === 'APPROVED') return isApproved(b.status)
    if (filter !== 'all') return b.status === filter
    return true
  })

  async function act(id: string, action: 'approve' | 'reject' | 'suspend') {
    setActing(id)
    try {
      await adminApi.brands[action](id)
      const nextStatus = action === 'approve' ? 'APPROVED' : action === 'reject' ? 'REJECTED' : 'SUSPENDED'
      setBrands(prev => prev.map(b => b.id === id ? { ...b, status: nextStatus as AdminBrand['status'] } : b))
    } catch { /* silent */ } finally { setActing(null) }
  }

  async function savePayoutProfile(brandId: string) {
    const iban = payoutDraft.iban.replace(/\s+/g, '').toUpperCase()
    if (!iban || !payoutDraft.bankAccountHolder.trim()) {
      setPayoutError('IBAN und Kontoinhaber sind Pflichtfelder.')
      return
    }
    setSavingPayout(true)
    setPayoutError(null)
    try {
      await adminApi.brands.setPayoutProfile(brandId, {
        iban,
        bankAccountHolder: payoutDraft.bankAccountHolder.trim(),
      })
      // BrandPartnerResponseDto doesn't echo bank data — keep it locally for display
      setBrands(prev => prev.map(b => b.id === brandId
        ? { ...b, iban, bankAccountHolder: payoutDraft.bankAccountHolder.trim() }
        : b))
      setEditingPayout(null)
    } catch {
      setPayoutError('Speichern fehlgeschlagen — bitte IBAN-Format prüfen und erneut versuchen.')
    } finally { setSavingPayout(false) }
  }

  async function saveStammdaten(brandId: string) {
    // Backend AdminBrandMasterDataDto: legalName + full address are @NotBlank
    const missing = [
      !stammDraft.legalName.trim() && 'Firmenbezeichnung',
      !stammDraft.addressStreet.trim() && 'Straße',
      !stammDraft.addressPostalCode.trim() && 'PLZ',
      !stammDraft.addressCity.trim() && 'Ort',
      !stammDraft.addressCountry.trim() && 'Land',
    ].filter(Boolean)
    if (missing.length > 0) {
      setStammError(`Pflichtfelder fehlen: ${missing.join(', ')}.`)
      setConfirmStamm(null)
      return
    }
    setSavingStamm(true)
    setStammError(null)
    try {
      const updated = await adminApi.brands.updateStammdaten(brandId, {
        legalName: stammDraft.legalName.trim(),
        addressStreet: stammDraft.addressStreet.trim(),
        addressPostalCode: stammDraft.addressPostalCode.trim(),
        addressCity: stammDraft.addressCity.trim(),
        addressCountry: stammDraft.addressCountry.trim(),
        vatId: stammDraft.vatId.trim() || undefined,
        taxNumber: stammDraft.taxNumber.trim() || undefined,
      })
      setBrands(prev => prev.map(b => b.id === brandId ? { ...b, ...updated } : b))
      setEditingStamm(null)
      setConfirmStamm(null)
    } catch {
      setStammError('Speichern fehlgeschlagen — Änderungen wurden nicht übernommen.')
      setConfirmStamm(null)
    } finally { setSavingStamm(false) }
  }

  async function download22f(brandId: string) {
    setExporting(true)
    try {
      const blob = await adminApi.brands.export22f(brandId, exportPeriod, exportFormat)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `22f-export_${brandId}_${exportPeriod}.${exportFormat}`
      a.click()
      URL.revokeObjectURL(url)
    } catch { /* silent */ } finally { setExporting(false) }
  }

  async function openFinancialPanel(brand: AdminBrand) {
    setSelectedBrand(brand)
    if (ordersCache === null || payoutsCache === null) {
      setPanelLoading(true)
      try {
        const [o, p] = await Promise.all([
          adminApi.orders.getAll().catch(() => [] as ApiOrder[]),
          adminApi.payouts.getAll().catch(() => [] as AdminPayout[]),
        ])
        setOrdersCache(o)
        setPayoutsCache(p)
      } finally {
        setPanelLoading(false)
      }
    }
  }

  const FILTERS: { id: Filter; label: string }[] = [
    { id: 'all',       label: 'Alle' },
    { id: 'PENDING',   label: `Ausstehend (${brands.filter(b => b.status === 'PENDING').length})` },
    { id: 'APPROVED',  label: `Genehmigt (${brands.filter(b => isApproved(b.status)).length})` },
    { id: 'REJECTED',  label: `Abgelehnt (${brands.filter(b => b.status === 'REJECTED').length})` },
    { id: 'SUSPENDED', label: `Gesperrt (${brands.filter(b => b.status === 'SUSPENDED').length})` },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Verwaltung"
        title="Marken"
        italicTitle="verwaltung."
      />

      <KPIGrid>
        <KPICell accent
          label="Ausstehend"
          value={kpiData.pending}
          sub="Benötigen Genehmigung"
        />
        <KPICell
          label="Aktive Marken"
          value={kpiData.activeCount}
          sub="Genehmigt"
          delta={kpiData.newBrandsDelta}
          period="MTD"
          spark={kpiData.brandSpark}
        />
        <KPICell
          label="Ø Produkte / Marke"
          value={kpiData.avgProducts}
          sub={`${products.length} Produkte gesamt`}
        />
        <KPICell
          label="Payouts MTD"
          value={fmtEur(kpiData.payoutsMTD)}
          sub="Genehmigt + bezahlt"
          delta={kpiData.payoutsDelta}
          period="vs. Vormonat"
          spark={kpiData.payoutSpark}
        />
      </KPIGrid>

      <div className="flex items-center gap-3 flex-wrap">
        <FilterBar options={FILTERS} value={filter} onChange={v => setFilter(v as Filter)} />
        <div className="flex-1 min-w-[200px] max-w-xs">
          <SearchInput value={search} onChange={setSearch} placeholder="Marke oder E-Mail suchen…" />
        </div>
      </div>

      <SectionCard title="Marken" count={visible.length}>
        {loading ? <Loader /> : visible.length === 0 ? <EmptyState message="Keine Marken gefunden." /> : (
          <table className="w-full">
            <thead>
              <tr>
                <TH>Marke</TH>
                <TH>E-Mail</TH>
                <TH>Status</TH>
                <TH>Produkte</TH>
                <TH>Umsatz</TH>
                <TH>Registriert</TH>
                <TH>Aktionen</TH>
              </tr>
            </thead>
            <tbody>
              {visible.map(brand => {
                const brandProducts = productsByBrand(brand.brandName)
                return (
                  <React.Fragment key={brand.id}>
                    <TableRow>
                      <TD>
                        <button
                          onClick={() => openFinancialPanel(brand)}
                          className="font-medium text-[#0A0A0A] hover:text-[#370E4D] hover:underline underline-offset-2 transition-colors duration-150 text-left"
                          style={{ fontFamily: 'var(--font-league-spartan)' }}
                        >
                          {brand.brandName}
                        </button>
                      </TD>
                      <TD className="text-[#6B6B6B]">{brand.email ?? brand.userEmail ?? brand.contactEmail ?? '—'}</TD>
                      <TD><StatusBadge status={isApproved(brand.status) ? 'APPROVED' : brand.status} /></TD>
                      <TD className="text-[#6B6B6B]">{brandProducts.length}</TD>
                      <TD className="font-medium text-[#0A0A0A]">{brand.revenue != null ? fmtEur(brand.revenue) : '—'}</TD>
                      <TD className="text-[#6B6B6B]">{brand.createdAt ? fmt(brand.createdAt) : '—'}</TD>
                      <TD>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Finanzen button */}
                          <ActionBtn variant="purple" onClick={() => openFinancialPanel(brand)}>
                            Finanzen
                          </ActionBtn>
                          <ActionBtn variant="ghost" onClick={() => {
                            setExpanded(brand.id)
                            setExport22fId(export22fId === brand.id ? null : brand.id)
                          }}>
                            §22f-Export
                          </ActionBtn>

                          <button
                            onClick={() => setExpanded(expanded === brand.id ? null : brand.id)}
                            className="p-1.5 rounded-lg hover:bg-[#F5F5F0] text-[#9B9B9B] hover:text-[#6B6B6B] transition-all duration-200"
                          >
                            {expanded === brand.id
                              ? <ChevronUp className="w-3.5 h-3.5" />
                              : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                          {brand.status === 'PENDING' && (
                            <>
                              <ActionBtn variant="success" disabled={acting === brand.id} onClick={() => act(brand.id, 'approve')}>
                                Genehmigen
                              </ActionBtn>
                              <ActionBtn variant="danger" disabled={acting === brand.id} onClick={() => act(brand.id, 'reject')}>
                                Ablehnen
                              </ActionBtn>
                            </>
                          )}
                          {(isApproved(brand.status) || brand.status === 'VERIFIED') && (
                            <ActionBtn variant="warning" disabled={acting === brand.id} onClick={() => act(brand.id, 'suspend')}>
                              Sperren
                            </ActionBtn>
                          )}
                          {brand.status === 'SUSPENDED' && (
                            <ActionBtn variant="success" disabled={acting === brand.id} onClick={() => act(brand.id, 'approve')}>
                              Entsperren
                            </ActionBtn>
                          )}
                        </div>
                      </TD>
                    </TableRow>

                    {expanded === brand.id && (
                      <tr className="border-b border-[#F0F0EB]" style={{ background: '#F8F8F5' }}>
                        <td colSpan={7} className="px-6 py-5">
                          <div className="grid grid-cols-3 gap-6 mb-4">
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.12em] text-[#9B9B9B] font-medium mb-1.5">Brand-ID</p>
                              <p className="font-mono text-[11px] text-[#2D2D2D]">{brand.id}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.12em] text-[#9B9B9B] font-medium mb-1.5">Status</p>
                              <StatusBadge status={isApproved(brand.status) ? 'APPROVED' : brand.status} />
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.12em] text-[#9B9B9B] font-medium mb-1.5">Produkte</p>
                              <p className="text-[12px] text-[#0A0A0A]">{brandProducts.length} Produkte</p>
                            </div>
                          </div>

                          {/* Produktliste */}
                          <div className="pt-3 border-t border-[#EBEBEB]">
                            <p className="text-[10px] uppercase tracking-[0.12em] text-[#9B9B9B] font-medium mb-2">Produktliste</p>
                            {brandProducts.length === 0 ? (
                              <p className="text-[11px] text-[#9B9B9B]">Keine Produkte</p>
                            ) : (
                              <div className="flex flex-wrap gap-1.5">
                                {brandProducts.slice(0, 10).map(p => (
                                  <span key={p.id} className="inline-flex items-center gap-1.5 text-[11px] bg-white border border-[#E8E8E8] px-2.5 py-1 rounded-lg">
                                    {p.name} <StatusBadge status={p.status} />
                                  </span>
                                ))}
                                {brandProducts.length > 10 && (
                                  <span className="text-[11px] text-[#9B9B9B] px-2 py-1">+{brandProducts.length - 10} mehr</span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Stammdaten (§22f) */}
                          <div className="pt-4 mt-4 border-t border-[#EBEBEB]">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-[10px] uppercase tracking-[0.12em] text-[#9B9B9B] font-medium"
                                style={{ fontFamily: 'var(--font-league-spartan)' }}>
                                Stammdaten (§22f)
                              </p>
                              {editingStamm !== brand.id && (
                                <button
                                  onClick={() => {
                                    setEditingStamm(brand.id)
                                    setConfirmStamm(null)
                                    setStammError(null)
                                    setStammDraft({
                                      legalName: brand.legalName ?? '',
                                      addressStreet: brand.addressStreet ?? '',
                                      addressPostalCode: brand.addressPostalCode ?? '',
                                      addressCity: brand.addressCity ?? '',
                                      addressCountry: brand.addressCountry ?? 'DE',
                                      vatId: brand.vatId ?? '',
                                      taxNumber: brand.taxNumber ?? '',
                                    })
                                  }}
                                  className="text-[11px] font-medium hover:underline transition-all duration-200"
                                  style={{ color: '#370E4D', fontFamily: 'var(--font-league-spartan)' }}
                                >
                                  Bearbeiten
                                </button>
                              )}
                            </div>

                            {editingStamm === brand.id ? (
                              <div className="space-y-3">
                                <div>
                                  <FLabel>Firmenbezeichnung</FLabel>
                                  <FInput value={stammDraft.legalName} onChange={v => setStammDraft(d => ({ ...d, legalName: v }))} placeholder="z. B. Muster GmbH" />
                                </div>
                                <div>
                                  <FLabel>Straße und Hausnummer</FLabel>
                                  <FInput value={stammDraft.addressStreet} onChange={v => setStammDraft(d => ({ ...d, addressStreet: v }))} />
                                </div>
                                <div className="grid grid-cols-[100px_1fr] gap-2">
                                  <div>
                                    <FLabel>PLZ</FLabel>
                                    <FInput value={stammDraft.addressPostalCode} onChange={v => setStammDraft(d => ({ ...d, addressPostalCode: v }))} />
                                  </div>
                                  <div>
                                    <FLabel>Ort</FLabel>
                                    <FInput value={stammDraft.addressCity} onChange={v => setStammDraft(d => ({ ...d, addressCity: v }))} />
                                  </div>
                                </div>
                                <div>
                                  <FLabel>Land</FLabel>
                                  <select
                                    value={stammDraft.addressCountry}
                                    onChange={e => setStammDraft(d => ({ ...d, addressCountry: e.target.value }))}
                                    className="w-full text-[12px] border border-[#E8E8E8] bg-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#370E4D]/40 focus:ring-2 focus:ring-[#370E4D]/8 transition-all duration-200"
                                    style={{ fontFamily: 'var(--font-league-spartan)' }}
                                  >
                                    {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                                  </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <FLabel>USt-IdNr.</FLabel>
                                    <FInput value={stammDraft.vatId} onChange={v => setStammDraft(d => ({ ...d, vatId: v }))} placeholder="DE123456789" />
                                  </div>
                                  <div>
                                    <FLabel>Steuernummer</FLabel>
                                    <FInput value={stammDraft.taxNumber} onChange={v => setStammDraft(d => ({ ...d, taxNumber: v }))} />
                                  </div>
                                </div>

                                {/* Steuertyp — read-only, server-seitig aus dem Land abgeleitet (DE ⇒ Inland) */}
                                <div>
                                  <FLabel>Steuertyp (abgeleitet aus Land)</FLabel>
                                  <span
                                    className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold"
                                    style={{
                                      fontFamily: 'var(--font-league-spartan)',
                                      letterSpacing: '0.04em',
                                      background: stammDraft.addressCountry === 'DE' ? 'rgba(26,90,60,0.08)' : 'rgba(55,14,77,0.08)',
                                      color: stammDraft.addressCountry === 'DE' ? '#1A5A3C' : '#370E4D',
                                    }}
                                  >
                                    {stammDraft.addressCountry === 'DE' ? 'Inland · 19 % USt' : 'Ausland · Reverse Charge (§ 3a Abs. 2 UStG)'}
                                  </span>
                                  <p className="mt-1 text-[10px] text-[#9B9B9B]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                                    Wird automatisch aus dem Land bestimmt — zum Ändern das Land anpassen.
                                  </p>
                                </div>

                                {stammError && (
                                  <p className="text-[11px] font-medium" style={{ fontFamily: 'var(--font-league-spartan)', color: '#8B1E3F' }}>
                                    {stammError}
                                  </p>
                                )}

                                {confirmStamm === brand.id ? (
                                  <div className="p-3 border border-[#E8C870]/60 rounded-lg" style={{ background: '#FFFBF0' }}>
                                    <p className="text-[11px] text-[#7A5C1E] mb-2" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                                      Sie ändern Stammdaten einer anderen Partei. Bitte bestätigen Sie diese Aktion.
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => setConfirmStamm(null)}
                                        className="h-7 px-3 rounded-lg text-[11px] font-medium text-[#6B6B6B] border border-[#E8E8E8] hover:bg-[#F5F5F0] transition-all duration-200"
                                        style={{ fontFamily: 'var(--font-league-spartan)' }}
                                      >
                                        Abbrechen
                                      </button>
                                      <button
                                        onClick={() => saveStammdaten(brand.id)}
                                        disabled={savingStamm}
                                        className="h-7 px-3 rounded-lg text-[11px] font-medium text-white transition-all duration-200 disabled:opacity-40"
                                        style={{ fontFamily: 'var(--font-league-spartan)', background: '#370E4D' }}
                                      >
                                        {savingStamm ? 'Speichert…' : 'Bestätigen & Speichern'}
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => setEditingStamm(null)}
                                      className="h-7 px-3.5 rounded-lg text-[11px] font-medium text-[#6B6B6B] border border-[#E8E8E8] hover:bg-[#F5F5F0] transition-all duration-200"
                                      style={{ fontFamily: 'var(--font-league-spartan)' }}
                                    >
                                      Abbrechen
                                    </button>
                                    <button
                                      onClick={() => setConfirmStamm(brand.id)}
                                      className="h-7 px-3.5 rounded-lg text-[11px] font-medium text-white transition-all duration-200"
                                      style={{ fontFamily: 'var(--font-league-spartan)', background: '#370E4D' }}
                                    >
                                      Speichern
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : brand.legalName ? (
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <p className="text-[10px] uppercase tracking-[0.10em] text-[#9B9B9B] font-medium mb-1"
                                    style={{ fontFamily: 'var(--font-league-spartan)' }}>Firmenbezeichnung</p>
                                  <p className="text-[12px] text-[#0A0A0A]">{brand.legalName}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase tracking-[0.10em] text-[#9B9B9B] font-medium mb-1"
                                    style={{ fontFamily: 'var(--font-league-spartan)' }}>Typ</p>
                                  <span
                                    className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] font-medium ${isDomesticDerived(brand) ? 'text-[#1A5A3C]' : 'text-[#370E4D]'}`}
                                    style={{ fontFamily: 'var(--font-league-spartan)', background: isDomesticDerived(brand) ? 'rgba(26,90,60,0.08)' : 'rgba(55,14,77,0.08)' }}
                                  >
                                    {isDomesticDerived(brand) ? 'Inland · 19 % USt' : 'Ausland · Reverse Charge'}
                                  </span>
                                </div>
                                {(brand.addressStreet || brand.addressCity) && (
                                  <div className="col-span-2">
                                    <p className="text-[10px] uppercase tracking-[0.10em] text-[#9B9B9B] font-medium mb-1"
                                      style={{ fontFamily: 'var(--font-league-spartan)' }}>Anschrift</p>
                                    <p className="text-[12px] text-[#0A0A0A]">
                                      {[brand.addressStreet, `${brand.addressPostalCode ?? ''} ${brand.addressCity ?? ''}`.trim(), brand.addressCountry].filter(Boolean).join(', ')}
                                    </p>
                                  </div>
                                )}
                                {brand.vatId && (
                                  <div>
                                    <p className="text-[10px] uppercase tracking-[0.10em] text-[#9B9B9B] font-medium mb-1"
                                      style={{ fontFamily: 'var(--font-league-spartan)' }}>USt-IdNr.</p>
                                    <p className="font-mono text-[12px] text-[#0A0A0A]">{brand.vatId}</p>
                                  </div>
                                )}
                                {brand.taxNumber && (
                                  <div>
                                    <p className="text-[10px] uppercase tracking-[0.10em] text-[#9B9B9B] font-medium mb-1"
                                      style={{ fontFamily: 'var(--font-league-spartan)' }}>Steuernummer</p>
                                    <p className="font-mono text-[12px] text-[#0A0A0A]">{brand.taxNumber}</p>
                                  </div>
                                )}
                                {brand.updatedAt && (
                                  <div className="col-span-2">
                                    <p className="text-[10px] text-[#C0C0BC]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                                      Zuletzt geändert: {fmt(brand.updatedAt)}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-[11px] text-[#9B9B9B] italic">Keine Stammdaten hinterlegt — klicken Sie auf Bearbeiten, um sie einzutragen.</p>
                            )}
                          </div>

                          {/* §22f-Export */}
                          {export22fId === brand.id && (
                            <div className="pt-4 mt-4 border-t border-[#EBEBEB]">
                              <p className="text-[10px] uppercase tracking-[0.12em] text-[#9B9B9B] font-medium mb-3"
                                style={{ fontFamily: 'var(--font-league-spartan)' }}>
                                §22f-Datenexport
                              </p>
                              <div className="flex items-end gap-3 flex-wrap">
                                <div>
                                  <FLabel>Abrechnungsmonat</FLabel>
                                  <input
                                    type="month"
                                    value={exportPeriod}
                                    onChange={e => setExportPeriod(e.target.value)}
                                    className="text-[12px] border border-[#E8E8E8] bg-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#370E4D]/40 focus:ring-2 focus:ring-[#370E4D]/8 transition-all duration-200"
                                    style={{ fontFamily: 'var(--font-league-spartan)' }}
                                  />
                                </div>
                                <div>
                                  <FLabel>Format</FLabel>
                                  <select
                                    value={exportFormat}
                                    onChange={e => setExportFormat(e.target.value as 'csv' | 'json')}
                                    className="text-[12px] border border-[#E8E8E8] bg-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#370E4D]/40 focus:ring-2 focus:ring-[#370E4D]/8 transition-all duration-200"
                                    style={{ fontFamily: 'var(--font-league-spartan)' }}
                                  >
                                    <option value="csv">CSV</option>
                                    <option value="json">JSON</option>
                                  </select>
                                </div>
                                <button
                                  onClick={() => download22f(brand.id)}
                                  disabled={exporting || !exportPeriod}
                                  className="h-8 px-4 rounded-lg text-[11px] font-medium text-white transition-all duration-200 disabled:opacity-40"
                                  style={{ fontFamily: 'var(--font-league-spartan)', background: '#370E4D' }}
                                >
                                  {exporting ? 'Lädt…' : 'Herunterladen'}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Auszahlungsprofil */}
                          <div className="pt-4 mt-4 border-t border-[#EBEBEB]">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-[10px] uppercase tracking-[0.12em] text-[#9B9B9B] font-medium">Auszahlungsprofil</p>
                              {editingPayout !== brand.id && (
                                <button
                                  onClick={() => {
                                    setEditingPayout(brand.id)
                                    setPayoutError(null)
                                    setPayoutDraft({
                                      iban: brand.iban ?? '',
                                      bankAccountHolder: brand.bankAccountHolder ?? '',
                                    })
                                  }}
                                  className="text-[11px] font-medium hover:underline transition-all duration-200"
                                  style={{ color: '#370E4D', fontFamily: 'var(--font-league-spartan)' }}
                                >
                                  Bearbeiten
                                </button>
                              )}
                            </div>

                            {editingPayout === brand.id ? (
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <FLabel>IBAN</FLabel>
                                    <FInput
                                      value={payoutDraft.iban}
                                      onChange={v => setPayoutDraft(d => ({ ...d, iban: v }))}
                                      placeholder="DE00 0000 0000 0000 0000 00"
                                    />
                                  </div>
                                  <div>
                                    <FLabel>Kontoinhaber</FLabel>
                                    <FInput
                                      value={payoutDraft.bankAccountHolder}
                                      onChange={v => setPayoutDraft(d => ({ ...d, bankAccountHolder: v }))}
                                    />
                                  </div>
                                </div>
                                {payoutError && (
                                  <p className="text-[11px] font-medium" style={{ fontFamily: 'var(--font-league-spartan)', color: '#8B1E3F' }}>
                                    {payoutError}
                                  </p>
                                )}
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => { setEditingPayout(null); setPayoutError(null) }}
                                    className="h-7 px-3.5 rounded-lg text-[11px] font-medium text-[#6B6B6B] border border-[#E8E8E8] hover:bg-[#F5F5F0] transition-all duration-200"
                                    style={{ fontFamily: 'var(--font-league-spartan)' }}
                                  >
                                    Abbrechen
                                  </button>
                                  <button
                                    onClick={() => savePayoutProfile(brand.id)}
                                    disabled={savingPayout}
                                    className="h-7 px-3.5 rounded-lg text-[11px] font-medium text-white transition-all duration-200 disabled:opacity-40"
                                    style={{ fontFamily: 'var(--font-league-spartan)', background: '#370E4D' }}
                                  >
                                    {savingPayout ? 'Speichert…' : 'Speichern'}
                                  </button>
                                </div>
                              </div>
                            ) : brand.iban ? (
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <p className="text-[10px] uppercase tracking-[0.10em] text-[#9B9B9B] font-medium mb-1"
                                    style={{ fontFamily: 'var(--font-league-spartan)' }}>IBAN</p>
                                  <p className="font-mono text-[12px] text-[#0A0A0A]">{brand.iban}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase tracking-[0.10em] text-[#9B9B9B] font-medium mb-1"
                                    style={{ fontFamily: 'var(--font-league-spartan)' }}>Kontoinhaber</p>
                                  <p className="text-[12px] text-[#0A0A0A]">{brand.bankAccountHolder || '—'}</p>
                                </div>
                              </div>
                            ) : (
                              <p className="text-[11px] text-[#9B9B9B] italic">Kein Auszahlungsprofil hinterlegt — klicken Sie auf Bearbeiten, um eines einzurichten.</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        )}
      </SectionCard>

      {/* Financial slide-over panel */}
      {selectedBrand && (
        <BrandFinancialPanel
          brand={selectedBrand}
          products={productsByBrand(selectedBrand.brandName)}
          orders={ordersCache ?? []}
          payouts={payoutsCache ?? []}
          loading={panelLoading}
          onClose={() => setSelectedBrand(null)}
        />
      )}
    </div>
  )
}
