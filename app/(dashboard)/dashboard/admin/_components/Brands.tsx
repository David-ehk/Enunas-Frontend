'use client'

import React, { useState, useEffect } from 'react'
import { adminApi } from '@/lib/api'
import type { AdminBrand, AdminApiProduct, ApiOrder, AdminPayout } from '@/types/api'
import { SectionCard, StatusBadge, EmptyState, Loader, FilterBar, SearchInput, TH, TD, TableRow, fmt, fmtEur } from './shared'
import { ChevronDown, ChevronUp, X, TrendingUp, ShoppingBag, Package, Banknote } from 'lucide-react'

type Filter = 'all' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'

interface PayoutDraft {
  iban: string
  accountHolder: string
  bankName: string
  bic: string
}

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

  const brandPayouts = payouts.filter(p =>
    p.brandId === brand.id || p.brandName === brand.brandName
  )
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
              {brand.email}
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
              {(brand.iban || brand.accountHolder) && (
                <div className="bg-white rounded-xl border border-[#E8E8E8] px-6 py-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                  <h3 className="text-[12px] font-semibold text-[#0A0A0A] mb-4"
                    style={{ fontFamily: 'var(--font-league-spartan)', letterSpacing: '0.03em' }}>
                    Bankverbindung
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'IBAN',         value: brand.iban },
                      { label: 'BIC',          value: brand.bic },
                      { label: 'Kontoinhaber', value: brand.accountHolder },
                      { label: 'Bank',         value: brand.bankName },
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
  const [payoutDraft, setPayoutDraft] = useState<PayoutDraft>({ iban: '', accountHolder: '', bankName: '', bic: '' })
  const [savingPayout, setSavingPayout] = useState(false)

  // Financial panel
  const [selectedBrand, setSelectedBrand] = useState<AdminBrand | null>(null)
  const [ordersCache, setOrdersCache]     = useState<ApiOrder[] | null>(null)
  const [payoutsCache, setPayoutsCache]   = useState<AdminPayout[] | null>(null)
  const [panelLoading, setPanelLoading]   = useState(false)

  useEffect(() => {
    Promise.all([
      adminApi.brands.getAll().catch(() => []),
      adminApi.products.getAll().catch(() => []),
    ]).then(([b, p]) => { setBrands(b); setProducts(p) }).finally(() => setLoading(false))
  }, [])

  const productsByBrand = (brandName: string) => products.filter(p => p.brandName === brandName)

  const isApproved = (status: string) => status === 'APPROVED' || status === 'ACTIVE'

  const visible = brands.filter(b => {
    const q = search.toLowerCase()
    const matchSearch = !q || b.brandName.toLowerCase().includes(q) || b.email.toLowerCase().includes(q)
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
    setSavingPayout(true)
    try {
      await adminApi.brands.setPayoutProfile(brandId, payoutDraft)
      setEditingPayout(null)
    } catch { /* silent */ } finally { setSavingPayout(false) }
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
                      <TD className="text-[#6B6B6B]">{brand.email}</TD>
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

                          {/* Auszahlungsprofil */}
                          <div className="pt-4 mt-4 border-t border-[#EBEBEB]">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-[10px] uppercase tracking-[0.12em] text-[#9B9B9B] font-medium">Auszahlungsprofil</p>
                              {editingPayout !== brand.id && (
                                <button
                                  onClick={() => {
                                    setEditingPayout(brand.id)
                                    setPayoutDraft({
                                      iban: brand.iban ?? '',
                                      accountHolder: brand.accountHolder ?? '',
                                      bankName: brand.bankName ?? '',
                                      bic: brand.bic ?? '',
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
                                    <FLabel>BIC</FLabel>
                                    <FInput
                                      value={payoutDraft.bic}
                                      onChange={v => setPayoutDraft(d => ({ ...d, bic: v }))}
                                      placeholder="DEUTDEDB"
                                    />
                                  </div>
                                  <div>
                                    <FLabel>Kontoinhaber</FLabel>
                                    <FInput
                                      value={payoutDraft.accountHolder}
                                      onChange={v => setPayoutDraft(d => ({ ...d, accountHolder: v }))}
                                    />
                                  </div>
                                  <div>
                                    <FLabel>Bank</FLabel>
                                    <FInput
                                      value={payoutDraft.bankName}
                                      onChange={v => setPayoutDraft(d => ({ ...d, bankName: v }))}
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => setEditingPayout(null)}
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
                                    style={{ fontFamily: 'var(--font-league-spartan)' }}>BIC</p>
                                  <p className="font-mono text-[12px] text-[#0A0A0A]">{brand.bic || '—'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase tracking-[0.10em] text-[#9B9B9B] font-medium mb-1"
                                    style={{ fontFamily: 'var(--font-league-spartan)' }}>Kontoinhaber</p>
                                  <p className="text-[12px] text-[#0A0A0A]">{brand.accountHolder || '—'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase tracking-[0.10em] text-[#9B9B9B] font-medium mb-1"
                                    style={{ fontFamily: 'var(--font-league-spartan)' }}>Bank</p>
                                  <p className="text-[12px] text-[#0A0A0A]">{brand.bankName || '—'}</p>
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
