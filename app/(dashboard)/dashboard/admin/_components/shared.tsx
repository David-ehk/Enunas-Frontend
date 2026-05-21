'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useState, useEffect, type ReactNode } from 'react'

export const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  APPROVED:          { label: 'Genehmigt',        cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  VERIFIED:          { label: 'Verifiziert',       cls: 'bg-sky-50 text-sky-700 border-sky-200' },
  ACTIVE:            { label: 'Aktiv',             cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  PENDING:           { label: 'Ausstehend',        cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  PENDING_REVIEW:    { label: 'In Prüfung',        cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  REJECTED:          { label: 'Abgelehnt',         cls: 'bg-rose-50 text-rose-700 border-rose-200' },
  SUSPENDED:         { label: 'Gesperrt',          cls: 'bg-rose-50 text-rose-600 border-rose-200' },
  DEACTIVATED:       { label: 'Deaktiviert',       cls: 'bg-gray-100 text-gray-500 border-gray-200' },
  HIDDEN:            { label: 'Versteckt',         cls: 'bg-gray-100 text-gray-500 border-gray-200' },
  FLAGGED:           { label: 'Markiert',          cls: 'bg-orange-50 text-orange-700 border-orange-200' },
  PAID:              { label: 'Bezahlt',           cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  PROCESSING:        { label: 'In Bearbeitung',    cls: 'bg-sky-50 text-sky-700 border-sky-200' },
  SHIPPED:           { label: 'Versandt',          cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  DELIVERED:         { label: 'Geliefert',         cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CANCELLED:         { label: 'Storniert',         cls: 'bg-rose-50 text-rose-700 border-rose-200' },
  REFUNDED:          { label: 'Erstattet',         cls: 'bg-gray-100 text-gray-500 border-gray-200' },
  RETURN_REQUESTED:  { label: 'Rückgabe bean.',    cls: 'bg-orange-50 text-orange-700 border-orange-200' },
  RETURN_APPROVED:   { label: 'Rückgabe gen.',     cls: 'bg-sky-50 text-sky-700 border-sky-200' },
  FAILED:            { label: 'Fehlgeschlagen',    cls: 'bg-rose-50 text-rose-700 border-rose-200' },
  LOW:               { label: 'Niedrig',           cls: 'bg-orange-50 text-orange-700 border-orange-200' },
  MEDIUM:            { label: 'Mittel',            cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  HIGH:              { label: 'Hoch',              cls: 'bg-rose-50 text-rose-700 border-rose-200' },
}

export function StatusBadge({ status }: { status: string }) {
  const { label, cls } = STATUS_MAP[status] ?? { label: status, cls: 'bg-gray-100 text-gray-500 border-gray-200' }
  return (
    <Badge
      variant="outline"
      className={cn(
        'text-[10px] uppercase tracking-[0.06em] font-medium whitespace-nowrap rounded-full px-2.5 py-0.5 border transition-all duration-200',
        cls
      )}
    >
      {label}
    </Badge>
  )
}

export function StatCard({
  label, value, sub, icon, accent,
}: {
  label: string
  value: string | number
  sub?: string
  icon?: ReactNode
  accent?: boolean
}) {
  return (
    <Card
      className={cn(
        'border transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] group',
        accent
          ? 'border-[#370E4D]/30 shadow-[0_2px_12px_rgba(55,14,77,0.18)]'
          : 'border-[#E8E8E8] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)]'
      )}
      style={accent ? { background: 'linear-gradient(135deg, #3D1055 0%, #370E4D 55%, #2E0A42 100%)' } : undefined}
    >
      <CardHeader className="pb-1 pt-5 px-5">
        <CardTitle
          className={cn(
            'text-[10px] uppercase tracking-[0.14em] flex items-center gap-2',
            accent ? 'text-white/55' : 'text-[#6B6B6B]'
          )}
          style={{ fontFamily: 'var(--font-league-spartan)', fontWeight: 400 }}
        >
          {icon && (
            <span className={cn(
              'inline-flex items-center justify-center w-5 h-5 rounded-md',
              accent ? 'bg-white/10' : 'bg-[#F5F5F0]'
            )}>
              {icon}
            </span>
          )}
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <p className={cn(
          'text-[22px] font-semibold tracking-tight leading-none mt-1',
          accent ? 'text-white' : 'text-[#0A0A0A]'
        )}>
          {value}
        </p>
        {sub && (
          <p className={cn(
            'text-[11px] mt-2',
            accent ? 'text-white/45' : 'text-[#6B6B6B]'
          )}>
            {sub}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function SectionCard({
  title, count, children, action,
}: {
  title: string
  count?: number
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <Card className="border-[#E8E8E8] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] rounded-xl overflow-hidden">
      <CardHeader className="border-b border-[#F0F0EB] pb-3.5 px-6 pt-5 flex flex-row items-center justify-between space-y-0 bg-[#FAFAF8]">
        <CardTitle
          className="text-[13px] font-semibold text-[#0A0A0A] flex items-center gap-2"
          style={{ fontFamily: 'var(--font-league-spartan)', letterSpacing: '0.02em' }}
        >
          {title}
          {count !== undefined && (
            <span className="text-[11px] font-normal text-[#6B6B6B] bg-[#F0F0EB] px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </CardTitle>
        {action}
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  )
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-20 text-center flex flex-col items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-[#F5F5F0] flex items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[#C0C0BC]">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M6 8h4M8 6v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-[12px] text-[#6B6B6B]">{message}</p>
    </div>
  )
}

export function Loader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="relative w-7 h-7">
        <div className="absolute inset-0 rounded-full border-2 border-[#E8E8E8]" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#370E4D] animate-spin" />
      </div>
    </div>
  )
}

export function TH({ children, right }: { children?: ReactNode; right?: boolean }) {
  return (
    <th
      className={cn(
        'text-[10px] uppercase tracking-[0.12em] text-[#9B9B9B] font-medium py-3 px-5 bg-[#FAFAF8]',
        right ? 'text-right' : 'text-left'
      )}
    >
      {children}
    </th>
  )
}

export function TD({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <td className={cn('py-3.5 px-5 text-[13px]', className)}>
      {children}
    </td>
  )
}

export function TableRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <tr className={cn(
      'border-b border-[#F5F5F0] transition-colors duration-150 hover:bg-[#FAFAF8]',
      className
    )}>
      {children}
    </tr>
  )
}

/* ── Platform Health / Skill Visualization ───────────────────── */

export function HealthBar({
  label, value, sub, color = '#370E4D',
}: {
  label: string
  value: number
  sub?: string
  color?: string
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t) }, [])

  const pct = Math.min(100, Math.max(0, value))

  return (
    <div className="group/bar">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[12px] font-medium text-[#2D2D2D]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
          {label}
        </p>
        <span
          className="text-[12px] font-semibold tabular-nums transition-all duration-300"
          style={{ color }}
        >
          {pct}%
        </span>
      </div>
      <div className="h-[5px] bg-[#F0F0EB] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: mounted ? `${pct}%` : '0%',
            backgroundColor: color,
          }}
        />
      </div>
      {sub && (
        <p className="text-[10px] text-[#9B9B9B] mt-1.5">{sub}</p>
      )}
    </div>
  )
}

export function MetricBadge({
  label, value, variant = 'default',
}: {
  label: string
  value: string | number
  variant?: 'default' | 'purple' | 'success' | 'warning' | 'danger'
}) {
  const styles = {
    default: 'bg-[#F5F5F0] text-[#2D2D2D] border-[#E8E8E8]',
    purple:  'bg-[#370E4D]/8 text-[#370E4D] border-[#370E4D]/15',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    danger:  'bg-rose-50 text-rose-700 border-rose-100',
  }

  return (
    <div className={cn(
      'inline-flex flex-col items-center px-4 py-3 rounded-xl border transition-all duration-200 hover:shadow-sm cursor-default',
      styles[variant]
    )}>
      <span className="text-[18px] font-semibold tabular-nums leading-none">{value}</span>
      <span className="text-[9px] uppercase tracking-[0.1em] mt-1.5 opacity-70"
        style={{ fontFamily: 'var(--font-league-spartan)' }}>
        {label}
      </span>
    </div>
  )
}

export function FilterBar({
  options, value, onChange,
}: {
  options: { id: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-0.5 bg-[#F5F5F0] border border-[#E8E8E8] rounded-xl p-1">
      {options.map(opt => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={cn(
            'px-3.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200',
            value === opt.id
              ? 'bg-white text-[#370E4D] shadow-[0_1px_4px_rgba(0,0,0,0.08)] border border-[#E8E8E8]'
              : 'text-[#6B6B6B] hover:text-[#2D2D2D]'
          )}
          style={{ fontFamily: 'var(--font-league-spartan)', letterSpacing: '0.03em' }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function SearchInput({
  value, onChange, placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="relative">
      <svg
        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9B9B9B]"
        fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5"
      >
        <circle cx="6.5" cy="6.5" r="4.5" />
        <path d="M10 10l3 3" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full pl-9 pr-4 py-2 text-[12px] border border-[#E8E8E8] bg-white rounded-xl focus:outline-none focus:border-[#370E4D]/40 focus:ring-2 focus:ring-[#370E4D]/8 transition-all duration-200 placeholder:text-[#C0C0BC]"
        style={{ fontFamily: 'var(--font-league-spartan)' }}
      />
    </div>
  )
}

export function InlineInput({
  value, onChange, onKeyDown, placeholder, autoFocus,
}: {
  value: string
  onChange: (v: string) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  placeholder?: string
  autoFocus?: boolean
}) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      autoFocus={autoFocus}
      className="flex-1 text-[12px] border border-[#E8E8E8] bg-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#370E4D]/40 focus:ring-2 focus:ring-[#370E4D]/8 transition-all duration-200"
      style={{ fontFamily: 'var(--font-league-spartan)' }}
    />
  )
}

export function fmt(date: string) {
  try { return new Date(date).toLocaleDateString('de-DE') } catch { return '—' }
}

export function fmtEur(n: number | undefined | null) {
  const num = Number(n ?? 0)
  return `€ ${num.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
