'use client'

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

const STATUS_DOT: Record<string, { color: string; label: string }> = {
  APPROVED:          { color: '#1A5A3C', label: 'Genehmigt' },
  VERIFIED:          { color: '#0284C7', label: 'Verifiziert' },
  ACTIVE:            { color: '#1A5A3C', label: 'Aktiv' },
  PENDING:           { color: '#7A5C1E', label: 'Ausstehend' },
  PENDING_REVIEW:    { color: '#7A5C1E', label: 'In Prüfung' },
  REJECTED:          { color: '#8B1E3F', label: 'Abgelehnt' },
  SUSPENDED:         { color: '#8B1E3F', label: 'Gesperrt' },
  DEACTIVATED:       { color: '#9B9B9B', label: 'Deaktiviert' },
  HIDDEN:            { color: '#9B9B9B', label: 'Versteckt' },
  FLAGGED:           { color: '#C05C1E', label: 'Markiert' },
  PAID:              { color: '#1A5A3C', label: 'Bezahlt' },
  PROCESSING:        { color: '#7A5C1E', label: 'In Bearbeitung' },
  SHIPPED:           { color: '#370E4D', label: 'Versandt' },
  DELIVERED:         { color: '#1A5A3C', label: 'Geliefert' },
  CANCELLED:         { color: '#8B1E3F', label: 'Storniert' },
  REFUNDED:          { color: '#9B9B9B', label: 'Erstattet' },
  RETURN_REQUESTED:  { color: '#C05C1E', label: 'Rückgabe bean.' },
  RETURN_APPROVED:   { color: '#0284C7', label: 'Rückgabe gen.' },
  FAILED:            { color: '#8B1E3F', label: 'Fehlgeschlagen' },
  LOW:               { color: '#C05C1E', label: 'Niedrig' },
  MEDIUM:            { color: '#7A5C1E', label: 'Mittel' },
  HIGH:              { color: '#8B1E3F', label: 'Hoch' },
}

export function StatusBadge({ status }: { status: string }) {
  const entry = STATUS_DOT[status] ?? { color: '#9B9B9B', label: status }
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span className="inline-block w-1.5 h-1.5 rounded-full shrink-0" style={{ background: entry.color }} />
      <span
        className="text-[10px] uppercase tracking-[0.1em] font-medium text-[#2D2D2D]"
        style={{ fontFamily: 'var(--font-league-spartan)' }}
      >
        {entry.label}
      </span>
    </span>
  )
}

export function PageHeader({
  eyebrow, title, italicTitle, sub, actions, noBorder,
}: {
  eyebrow?: string
  title: string
  italicTitle?: string
  sub?: string
  actions?: ReactNode
  noBorder?: boolean
}) {
  return (
    <header className="flex items-start justify-between mb-5 pb-5" style={{ borderBottom: noBorder ? 'none' : '1px solid #F0F0EB' }}>
      <div>
        {eyebrow && (
          <p
            className="text-[10px] uppercase tracking-[0.22em] font-medium mb-2.5"
            style={{ fontFamily: 'var(--font-league-spartan)', color: '#9B9B9B' }}
          >
            {eyebrow}
          </p>
        )}
        <h1
          className="text-[#0A0A0A] leading-none"
          style={{ fontFamily: 'var(--font-cormorant)', fontSize: 30, fontWeight: 300 }}
        >
          {title}
          {italicTitle && <> <em className="italic">{italicTitle}</em></>}
        </h1>
        {sub && (
          <p
            className="mt-2"
            style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 12, color: '#6B6B6B' }}
          >
            {sub}
          </p>
        )}
      </div>
      {actions && <div className="shrink-0 mt-0.5 flex items-center gap-2">{actions}</div>}
    </header>
  )
}

export function KPIGrid({ children }: { children: ReactNode }) {
  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-4 bg-white rounded-xl overflow-hidden"
      style={{ border: '1px solid #E8E8E8', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
    >
      {children}
    </div>
  )
}

export function Sparkline({
  data, tone = 'neutral', onDark = false, height = 24,
}: {
  data: number[]
  tone?: 'up' | 'down' | 'neutral'
  onDark?: boolean
  height?: number
}) {
  if (!data || data.length < 2) return null
  const W = 100
  const H = height
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const step = W / (data.length - 1)
  const pts = data
    .map((v, i) => `${(i * step).toFixed(1)},${(H - 2 - ((v - min) / range) * (H - 4)).toFixed(1)}`)
    .join(' ')
  const stroke = onDark
    ? 'rgba(255,255,255,0.5)'
    : tone === 'up' ? '#166534' : tone === 'down' ? '#9B1239' : '#9B9B9B'
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={height}
      preserveAspectRatio="none" style={{ display: 'block', overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke={stroke}
        strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function TrendIndicator({
  delta, period, inverse = false, onDark = false,
}: {
  delta: string
  period?: string
  inverse?: boolean
  onDark?: boolean
}) {
  const raw: 'up' | 'down' | 'neutral' =
    delta.startsWith('+') ? 'up' : delta.startsWith('-') ? 'down' : 'neutral'
  const eff = inverse
    ? (raw === 'up' ? 'down' : raw === 'down' ? 'up' : 'neutral')
    : raw
  const arrow = raw === 'up' ? '▲' : raw === 'down' ? '▼' : '—'
  const color = onDark
    ? (eff === 'up' ? 'rgba(134,239,172,0.9)' : eff === 'down' ? 'rgba(252,165,165,0.85)' : 'rgba(255,255,255,0.4)')
    : (eff === 'up' ? '#166534' : eff === 'down' ? '#9B1239' : '#6B6B6B')
  const bg = onDark
    ? 'rgba(255,255,255,0.09)'
    : eff === 'up' ? 'rgba(22,101,52,0.07)' : eff === 'down' ? 'rgba(155,18,57,0.07)' : 'rgba(107,107,107,0.06)'
  return (
    <span className="inline-flex items-center gap-1.5" style={{ fontFamily: 'var(--font-league-spartan)' }}>
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md" style={{ background: bg }}>
        <span style={{ fontSize: 7, color, lineHeight: 1 }}>{arrow}</span>
        <span className="font-semibold tabular-nums" style={{ fontSize: 10, color, letterSpacing: '0.01em' }}>
          {delta}
        </span>
      </span>
      {period && (
        <span style={{ fontSize: 10, color: onDark ? 'rgba(255,255,255,0.35)' : '#9B9B9B' }}>
          {period}
        </span>
      )}
    </span>
  )
}

export function KPICell({
  label, value, unit, sub, accent,
  delta, period, spark, inverseTrend,
}: {
  label: string
  value: string | number
  unit?: string
  sub?: string
  accent?: boolean
  delta?: string
  period?: string
  spark?: number[]
  inverseTrend?: boolean
}) {
  const rawTone: 'up' | 'down' | 'neutral' = delta
    ? (delta.startsWith('+') ? 'up' : delta.startsWith('-') ? 'down' : 'neutral')
    : 'neutral'
  const sparkTone = inverseTrend
    ? (rawTone === 'up' ? 'down' : rawTone === 'down' ? 'up' : 'neutral')
    : rawTone
  const showDelta = !!delta && delta !== '—'

  return (
    <div
      className={cn(
        'group/kpi relative px-6 py-5 cursor-default select-none transition-colors duration-150',
        !accent && 'bg-white hover:bg-[#FAFAF8]',
      )}
      style={{
        background: accent ? '#370E4D' : undefined,
        borderRight: '1px solid #F0F0EB',
        borderBottom: '1px solid #F0F0EB',
      }}
    >
      <p
        className="text-[10px] uppercase tracking-[0.18em] font-medium mb-2.5"
        style={{ fontFamily: 'var(--font-league-spartan)', color: accent ? 'rgba(255,255,255,0.45)' : '#9B9B9B' }}
      >
        {label}
      </p>

      <p
        className="leading-none"
        style={{ fontFamily: 'var(--font-cormorant)', fontSize: 28, fontWeight: 300, color: accent ? '#fff' : '#0A0A0A', letterSpacing: '-0.01em' }}
      >
        {value}
        {unit && (
          <span style={{ fontSize: 13, marginLeft: 3, fontFamily: 'var(--font-league-spartan)', color: accent ? 'rgba(255,255,255,0.45)' : '#9B9B9B' }}>
            {unit}
          </span>
        )}
      </p>

      {showDelta && (
        <div className="mt-2">
          <TrendIndicator delta={delta!} period={period} inverse={inverseTrend} onDark={accent} />
        </div>
      )}

      {sub && !showDelta && (
        <p className="mt-1.5 leading-snug"
          style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 11, color: accent ? 'rgba(255,255,255,0.4)' : '#9B9B9B' }}>
          {sub}
        </p>
      )}

      {sub && showDelta && (
        <p className="mt-1 leading-snug"
          style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 10, color: accent ? 'rgba(255,255,255,0.3)' : '#ADADAD' }}>
          {sub}
        </p>
      )}

      {spark && spark.length >= 2 && (
        <div className="mt-3.5 opacity-50 group-hover/kpi:opacity-80 transition-opacity duration-300">
          <Sparkline data={spark} tone={accent ? 'neutral' : sparkTone} onDark={accent} />
        </div>
      )}
    </div>
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
      <div
        className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center"
        style={{
          background: 'repeating-linear-gradient(45deg, #F5F5F0, #F5F5F0 4px, #EBEBEA 4px, #EBEBEA 8px)',
        }}
      >
        <span
          className="font-mono relative z-10"
          style={{ fontSize: 9, color: '#C0C0BC', textTransform: 'uppercase', letterSpacing: '0.08em' }}
        >
          leer
        </span>
      </div>
      <p
        className="text-[11px] uppercase tracking-[0.1em]"
        style={{ fontFamily: 'var(--font-league-spartan)', color: '#9B9B9B' }}
      >
        {message}
      </p>
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

export function SelectFilter({
  value, onChange, options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="relative flex-shrink-0">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="h-8 pl-3 pr-7 text-[11px] border border-[#E8E8E8] bg-white rounded-xl focus:outline-none focus:border-[#370E4D]/40 transition-all duration-200 appearance-none cursor-pointer"
        style={{
          fontFamily: 'var(--font-league-spartan)',
          letterSpacing: '0.03em',
          color: value === 'all' ? '#9B9B9B' : '#0A0A0A',
        }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 pointer-events-none text-[#9B9B9B]"
        viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 3.5l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
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

export function dailyCounts(items: { createdAt: string }[], days = 7): number[] {
  const now = Date.now()
  const buckets = Array<number>(days).fill(0)
  items.forEach(item => {
    const d = Math.floor((now - new Date(item.createdAt).getTime()) / 86400000)
    if (d >= 0 && d < days) buckets[days - 1 - d]++
  })
  return buckets
}

export function dailySumByKey<T extends { createdAt: string }>(
  items: T[], key: keyof T, days = 7,
): number[] {
  const now = Date.now()
  const buckets = Array<number>(days).fill(0)
  items.forEach(item => {
    const d = Math.floor((now - new Date(item.createdAt).getTime()) / 86400000)
    if (d >= 0 && d < days) {
      const raw = item[key]
      buckets[days - 1 - d] += typeof raw === 'number' ? raw : 0
    }
  })
  return buckets
}

export function weekDeltaStr(cur: number, prev: number): string {
  if (cur === 0 && prev === 0) return '—'
  if (prev === 0) return cur > 0 ? `+${cur}` : '—'
  const pct = Math.round(((cur - prev) / prev) * 100)
  return pct >= 0 ? `+${pct}%` : `${pct}%`
}
