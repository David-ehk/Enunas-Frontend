'use client'

import React, { useState, useEffect } from 'react'
import { adminApi } from '@/lib/api'
import type { AdminBrand, AdminApiProduct } from '@/types/api'
import { SectionCard, StatusBadge, EmptyState, Loader, FilterBar, SearchInput, TH, TD, TableRow, fmt } from './shared'
import { ChevronDown, ChevronUp } from 'lucide-react'

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
  variant: 'danger' | 'success' | 'warning' | 'ghost'
  children: React.ReactNode
}) {
  const styles = {
    danger:  'border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600',
    success: 'border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600',
    warning: 'border-amber-200 text-amber-700 hover:bg-amber-500 hover:text-white hover:border-amber-500',
    ghost:   'border-[#E8E8E8] text-[#6B6B6B] hover:bg-[#F5F5F0] hover:text-[#2D2D2D]',
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
                      <TD className="font-medium text-[#0A0A0A]">{brand.brandName}</TD>
                      <TD className="text-[#6B6B6B]">{brand.email}</TD>
                      <TD><StatusBadge status={isApproved(brand.status) ? 'APPROVED' : brand.status} /></TD>
                      <TD className="text-[#6B6B6B]">{brandProducts.length}</TD>
                      <TD className="text-[#6B6B6B]">{brand.createdAt ? fmt(brand.createdAt) : '—'}</TD>
                      <TD>
                        <div className="flex items-center gap-1.5 flex-wrap">
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
                        <td colSpan={6} className="px-6 py-5">
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
                                    setPayoutDraft({ iban: '', accountHolder: '', bankName: '', bic: '' })
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
    </div>
  )
}
