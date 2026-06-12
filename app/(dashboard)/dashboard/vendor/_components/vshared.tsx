'use client'

import React from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, Bar, Line, PieChart, Pie, Cell, BarChart,
} from 'recharts'

// ─── Formatters ───────────────────────────────────────────────────────────────
export function fmtEur(v: number) {
  return `€ ${Math.round(v).toLocaleString('de-DE')}`
}
export function fmtK(v: number) {
  return v >= 1000 ? `€${(v / 1000).toFixed(0)}K` : fmtEur(v)
}
export function fmt(s?: string | null) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })
}
export function fmtPct(v: number) { return `${v.toFixed(1)}%` }

// ─── Phase 2 / Vorschaudaten ──────────────────────────────────────────────────
// Demodaten nur außerhalb von Produktion — in Prod zeigen Screens ohne
// Backend-Quelle einen ehrlichen „Phase 2"-Vorschauzustand (Metrik-Namen,
// keine erfundenen Werte).
export const SHOW_PREVIEW_DATA = process.env.NODE_ENV !== 'production'

export function Phase2Tile({ label }: { label: string }) {
  return (
    <div className="bg-white border border-[#E8E8E8] px-5 py-4">
      <p className="text-[10px] uppercase tracking-[0.12em] font-medium mb-1.5"
        style={{ fontFamily: 'var(--font-league-spartan)', color: '#9B9B9B' }}>
        {label}
      </p>
      <p className="text-[20px] font-semibold leading-none" style={{ fontFamily: 'var(--font-league-spartan)', color: '#D8D8D4' }}>—</p>
      <span className="inline-block mt-2.5 px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] font-medium"
        style={{ fontFamily: 'var(--font-league-spartan)', background: 'rgba(55,14,77,0.06)', color: '#370E4D' }}>
        Bald verfügbar
      </span>
    </div>
  )
}

export function Phase2Panel({ title, sub, metrics }: { title: string; sub?: string; metrics: string[] }) {
  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#E8E8E8] px-6 py-5">
        <p className="text-[13px] font-semibold" style={{ fontFamily: 'var(--font-league-spartan)', color: '#0A0A0A' }}>
          {title} — Phase 2
        </p>
        <p className="text-[12px] mt-1 leading-relaxed max-w-xl" style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B' }}>
          {sub ?? 'Dieses Modul wird in Phase 2 mit echten Daten aktiviert. Diese Metriken sind geplant:'}
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map(m => <Phase2Tile key={m} label={m} />)}
      </div>
    </div>
  )
}

// ─── Loader / EmptyState ──────────────────────────────────────────────────────
export function Loader() {
  return (
    <div className="flex justify-center py-12">
      <div className="w-6 h-6 rounded-full border-2 border-[#E8E8E8] border-t-[#370E4D] animate-spin" />
    </div>
  )
}
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-10 text-center text-[12px] text-[#9B9B9B]"
      style={{ fontFamily: 'var(--font-league-spartan)', letterSpacing: '0.08em' }}>
      {message}
    </div>
  )
}

// ─── VPageHeader ──────────────────────────────────────────────────────────────
export function VPageHeader({ eyebrow, title, italicTitle, sub, actions }: {
  eyebrow: string; title: string; italicTitle?: string; sub?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-start gap-4">
        <div>
          <p style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 9.5, letterSpacing: '0.26em', textTransform: 'uppercase', color: '#6B6B6B', marginBottom: 8 }}>
            {eyebrow}
          </p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 36, lineHeight: 1.05, color: '#0A0A0A', margin: 0 }}>
            {title}{italicTitle && <> <em style={{ fontStyle: 'italic' }}>{italicTitle}</em></>}
          </h1>
          {sub && (
            <p style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 12, color: '#6B6B6B', marginTop: 8, lineHeight: 1.6, maxWidth: 620 }}>
              {sub}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0 mt-1">{actions}</div>}
      </div>
    </div>
  )
}

// ─── VKPIGrid / VKPI / VSparkline ─────────────────────────────────────────────
function VSparkline({ data, tone }: { data?: number[]; tone?: string }) {
  if (!data || data.length < 2) return null
  const w = 56, h = 26
  const min = Math.min(...data), max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - 2 - ((v - min) / range) * (h - 4)}`).join(' ')
  const color = tone === 'up' ? '#1A5A3C' : tone === 'down' ? '#8B1E3F' : '#9B9B9B'
  return (
    <svg width={w} height={h}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

export function VKPI({ label, value, delta, deltaTone = 'muted', spark }: {
  label: string; value: string | number; delta?: string
  deltaTone?: 'up' | 'down' | 'muted'; spark?: number[]
}) {
  const deltaColor = deltaTone === 'up' ? '#1A5A3C' : deltaTone === 'down' ? '#8B1E3F' : '#9B9B9B'
  return (
    <div style={{ padding: '18px 20px' }}>
      <p style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 9.5, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#6B6B6B', marginBottom: 10 }}>
        {label}
      </p>
      <div className="flex items-end justify-between gap-2">
        <div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 34, lineHeight: 1, color: '#0A0A0A' }}>
            {value}
          </div>
          {delta && (
            <p style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 10.5, color: deltaColor, marginTop: 5 }}>
              {delta}
            </p>
          )}
        </div>
        <VSparkline data={spark} tone={deltaTone} />
      </div>
    </div>
  )
}

export function VKPIGrid({ children, cols = 4 }: { children: React.ReactNode; cols?: number }) {
  return (
    <div
      className="bg-white border border-[#E8E8E8] divide-x divide-[#E8E8E8] mb-6"
      style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {children}
    </div>
  )
}

// ─── VCard ───────────────────────────────────────────────────────────────────
export function VCard({ eyebrow, title, action, foot, flush, children, style, className }: {
  eyebrow?: string; title: string; action?: React.ReactNode; foot?: React.ReactNode
  flush?: boolean; children: React.ReactNode; style?: React.CSSProperties; className?: string
}) {
  return (
    <div className={`bg-white border border-[#E8E8E8] ${className ?? ''}`} style={style}>
      <div className="flex items-start justify-between border-b border-[#E8E8E8]" style={{ padding: '14px 20px' }}>
        <div>
          {eyebrow && (
            <p style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#9B9B9B', marginBottom: 4 }}>
              {eyebrow}
            </p>
          )}
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 19, color: '#0A0A0A', margin: 0 }}>
            {title}
          </h3>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div style={flush ? undefined : { padding: 20 }}>{children}</div>
      {foot && <div className="border-t border-[#E8E8E8]" style={{ padding: '12px 20px' }}>{foot}</div>}
    </div>
  )
}

// ─── VStatus ─────────────────────────────────────────────────────────────────
const STATUS_TONE: Record<string, { dot: string; text: string }> = {
  success: { dot: '#1A5A3C', text: '#1A5A3C' },
  warn:    { dot: '#7A5C1E', text: '#7A5C1E' },
  error:   { dot: '#8B1E3F', text: '#8B1E3F' },
  muted:   { dot: '#9B9B9B', text: '#6B6B6B' },
  purple:  { dot: '#370E4D', text: '#370E4D' },
}
export function VStatus({ tone = 'muted', children }: { tone?: string; children: React.ReactNode }) {
  const c = STATUS_TONE[tone] ?? STATUS_TONE.muted
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-league-spartan)', fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: c.text }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {children}
    </span>
  )
}

// ─── VChip ───────────────────────────────────────────────────────────────────
export function VChip({ tone = 'ghost', children }: { tone?: 'ghost' | 'purple' | 'dark' | 'default'; children: React.ReactNode }) {
  const s: Record<string, React.CSSProperties> = {
    ghost:   { background: 'transparent', color: '#6B6B6B', border: '1px solid #E8E8E8' },
    purple:  { background: 'rgba(55,14,77,0.08)', color: '#370E4D', border: '1px solid rgba(55,14,77,0.2)' },
    dark:    { background: '#0A0A0A', color: '#fff', border: '1px solid #0A0A0A' },
    default: { background: '#F5F5F0', color: '#2D2D2D', border: '1px solid #E8E8E8' },
  }
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', fontFamily: 'var(--font-league-spartan)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 0, ...s[tone] }}>
      {children}
    </span>
  )
}

// ─── VBtn ─────────────────────────────────────────────────────────────────────
export function VBtn({ variant = 'ghost', sm, onClick, disabled, children }: {
  variant?: 'primary' | 'ghost' | 'danger'; sm?: boolean
  onClick?: () => void; disabled?: boolean; children: React.ReactNode
}) {
  const h = sm ? 26 : 30
  const px = sm ? 10 : 14
  const fs = sm ? 10 : 10.5
  const base: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 5, height: h, padding: `0 ${px}px`, fontFamily: 'var(--font-league-spartan)', fontSize: fs, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 150ms', opacity: disabled ? 0.4 : 1, border: '1px solid transparent' }
  const vs = {
    primary: { ...base, background: '#370E4D', color: '#fff', borderColor: '#370E4D' },
    ghost:   { ...base, background: 'transparent', color: '#6B6B6B', borderColor: '#E8E8E8' },
    danger:  { ...base, background: 'transparent', color: '#8B1E3F', borderColor: '#FECDD3' },
  }
  return <button onClick={onClick} disabled={disabled} style={vs[variant]}>{children}</button>
}

// ─── Table primitives ─────────────────────────────────────────────────────────
export function VTH({ children, right }: { children?: React.ReactNode; right?: boolean }) {
  return (
    <th style={{ padding: '10px 16px', textAlign: right ? 'right' : 'left', fontFamily: 'var(--font-league-spartan)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9B9B9B', fontWeight: 500, borderBottom: '1px solid #E8E8E8', background: '#FAFAF8' }}>
      {children}
    </th>
  )
}
export function VTD({ children, mono, right, muted, className }: {
  children?: React.ReactNode; mono?: boolean; right?: boolean; muted?: boolean; className?: string
}) {
  return (
    <td style={{ padding: '10px 16px', textAlign: right ? 'right' : 'left', fontFamily: mono ? 'monospace' : 'var(--font-league-spartan)', fontSize: mono ? 11 : 12, color: muted ? '#9B9B9B' : '#2D2D2D', borderBottom: '1px solid #F5F5F0' }} className={className}>
      {children}
    </td>
  )
}
export function VTR({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <tr onClick={onClick} style={{ transition: 'background 160ms', cursor: onClick ? 'pointer' : 'default' }}
      onMouseEnter={e => { if (onClick || true) (e.currentTarget as HTMLElement).style.background = '#FAFAF8' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '' }}>
      {children}
    </tr>
  )
}

// ─── GaugeArc ────────────────────────────────────────────────────────────────
export function GaugeArc({ pct, label, sub, size = 210 }: { pct: number; label: string; sub?: string; size?: number }) {
  const sw = 11
  const r = (size - sw * 2) / 2 - 6
  const cx = size / 2
  const cy = size / 2
  const C = 2 * Math.PI * r
  const half = Math.PI * r
  const filled = Math.min(1, Math.max(0, pct / 100)) * half
  const halfH = size / 2 + 16

  return (
    <div className="flex flex-col items-center gap-3">
      <div style={{ position: 'relative', width: size, height: halfH, overflow: 'hidden' }}>
        <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
          <circle cx={cx} cy={cx} r={r} fill="none" stroke="#E8E8E8" strokeWidth={sw}
            strokeDasharray={`${half} ${C}`} strokeLinecap="round"
            transform={`rotate(-180 ${cx} ${cx})`} />
          {filled > 2 && (
            <circle cx={cx} cy={cx} r={r} fill="none" stroke="#370E4D" strokeWidth={sw}
              strokeDasharray={`${filled} ${C}`} strokeLinecap="round"
              transform={`rotate(-180 ${cx} ${cx})`} />
          )}
        </svg>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: Math.round(size * 0.19), color: '#0A0A0A', lineHeight: 1 }}>
            {pct}%
          </span>
          <span style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 9, letterSpacing: '0.22em', color: '#6B6B6B', textTransform: 'uppercase' }}>
            {label}
          </span>
        </div>
      </div>
      {sub && (
        <p style={{ fontSize: 11.5, color: '#6B6B6B', textAlign: 'center', maxWidth: size - 24, fontFamily: 'var(--font-league-spartan)', lineHeight: 1.55, margin: 0 }}>
          {sub}
        </p>
      )}
    </div>
  )
}

// ─── WaterfallChart ───────────────────────────────────────────────────────────
export function WaterfallChart({ steps, fmt: fmtFn, height = 240 }: {
  steps: { label: string; value: number; type: 'base' | 'sub' | 'total' }[]
  fmt?: (v: number) => string; height?: number
}) {
  const gross = steps.find(s => s.type === 'base')?.value ?? 1
  const innerH = height - 52
  let cursor = gross

  const bars = steps.map(step => {
    const color = step.type === 'base' ? '#0A0A0A' : step.type === 'total' ? '#370E4D' : '#8B1E3F'
    let barH: number, bottomOffset: number
    if (step.type === 'base') {
      barH = (step.value / gross) * innerH; bottomOffset = 0
    } else if (step.type === 'total') {
      barH = (step.value / gross) * innerH; bottomOffset = 0
    } else {
      const from = cursor / gross; const to = (cursor - step.value) / gross
      bottomOffset = to * innerH; barH = (from - to) * innerH; cursor -= step.value
    }
    return { ...step, barH: Math.max(barH, 3), bottomOffset, color }
  })

  return (
    <div style={{ display: 'flex', gap: 10, height, position: 'relative' }}>
      {bars.map(bar => (
        <div key={bar.label} style={{ flex: 1, position: 'relative', height: innerH, marginTop: 16 }}>
          <div style={{ position: 'absolute', bottom: bar.bottomOffset + bar.barH + 5, left: 0, right: 0, textAlign: 'center', fontFamily: 'monospace', fontSize: 9.5, color: bar.color, whiteSpace: 'nowrap' }}>
            {bar.type === 'sub' ? `−${fmtFn ? fmtFn(bar.value) : bar.value}` : fmtFn ? fmtFn(bar.value) : bar.value}
          </div>
          <div style={{ position: 'absolute', bottom: bar.bottomOffset, left: 0, right: 0, height: bar.barH, background: bar.color }} />
          <div style={{ position: 'absolute', bottom: -22, left: 0, right: 0, textAlign: 'center', fontFamily: 'var(--font-league-spartan)', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9B9B9B', lineHeight: 1.3 }}>
            {bar.label}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Funnel ───────────────────────────────────────────────────────────────────
export function Funnel({ stages, fmt: fmtFn }: {
  stages: { label: string; value: number }[]
  fmt?: (v: number) => string
}) {
  const max = stages[0]?.value ?? 1
  return (
    <div className="space-y-3">
      {stages.map((stage, i) => {
        const pct = (stage.value / max) * 100
        const dropPct = i > 0 ? Math.round((1 - stage.value / (stages[i - 1]?.value ?? stage.value)) * 100) : 0
        return (
          <div key={stage.label}>
            <div className="flex justify-between mb-1.5" style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 11.5 }}>
              <span style={{ color: '#2D2D2D' }}>{stage.label}</span>
              <span style={{ display: 'flex', gap: 10 }}>
                {i > 0 && <span style={{ color: '#9B9B9B' }}>−{dropPct}%</span>}
                <span style={{ color: '#0A0A0A', fontWeight: 600 }}>{fmtFn ? fmtFn(stage.value) : stage.value.toLocaleString('de-DE')}</span>
              </span>
            </div>
            <div style={{ height: 6, background: '#E8E8E8' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: '#370E4D', transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)' }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── HBar ─────────────────────────────────────────────────────────────────────
export function HBar({ items, fmt: fmtFn }: {
  items: { label: string; value: number; sub?: string }[]
  fmt?: (v: number) => string
}) {
  const max = Math.max(...items.map(i => i.value), 1)
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={item.label}>
          <div className="flex justify-between mb-1.5" style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 12 }}>
            <span style={{ color: '#2D2D2D' }}>{item.label}</span>
            <span className="flex items-center gap-2">
              {item.sub && <span style={{ fontSize: 10, color: '#9B9B9B' }}>{item.sub}</span>}
              <span style={{ fontWeight: 600, color: '#0A0A0A' }}>{fmtFn ? fmtFn(item.value) : item.value.toLocaleString('de-DE')}</span>
            </span>
          </div>
          <div style={{ height: 4, background: '#E8E8E8' }}>
            <div style={{ height: '100%', width: `${(item.value / max) * 100}%`, background: i === 0 ? '#370E4D' : '#C9B8D6', transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── InventoryBar ─────────────────────────────────────────────────────────────
export function InventoryBar({ label, sku, stock, threshold, max }: {
  label: string; sku: string; stock: number; threshold: number; max: number
}) {
  const stockPct = (Math.min(stock, max) / max) * 100
  const threshPct = (threshold / max) * 100
  const isOut = stock === 0; const isLow = stock > 0 && stock <= threshold
  const color = isOut ? '#8B1E3F' : isLow ? '#7A5C1E' : '#1A5A3C'
  return (
    <div style={{ marginBottom: 16 }}>
      <div className="flex justify-between mb-1.5" style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 12 }}>
        <span>
          <span style={{ fontWeight: 500, color: '#0A0A0A' }}>{label}</span>
          <span style={{ fontSize: 10, color: '#9B9B9B', marginLeft: 6, fontFamily: 'monospace' }}>{sku}</span>
        </span>
        <span style={{ color, fontWeight: 600 }}>
          {isOut ? 'Ausverkauft' : isLow ? `${stock} — Nachbestellen` : `${stock} Einh.`}
        </span>
      </div>
      <div style={{ height: 6, background: '#E8E8E8', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${stockPct}%`, background: color, transition: 'width 0.4s' }} />
        <div style={{ position: 'absolute', left: `${threshPct}%`, top: -2, bottom: -2, width: 2, background: '#0A0A0A' }} title={`Bestellgrenze: ${threshold}`} />
      </div>
    </div>
  )
}

// ─── ReasonRow ────────────────────────────────────────────────────────────────
export function ReasonRow({ label, count, total, meta }: { label: string; count: number; total: number; meta?: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div style={{ padding: '11px 0', borderBottom: '1px solid #F5F5F0' }}>
      <div className="flex justify-between mb-1.5" style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 12 }}>
        <span style={{ color: '#2D2D2D' }}>{label}</span>
        <span className="flex items-center gap-3">
          {meta && <span style={{ fontSize: 10, color: '#9B9B9B' }}>{meta}</span>}
          <span style={{ fontWeight: 600, color: '#0A0A0A' }}>{count} <span style={{ fontWeight: 400, color: '#9B9B9B' }}>({pct}%)</span></span>
        </span>
      </div>
      <div style={{ height: 4, background: '#E8E8E8' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: '#370E4D', transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)' }} />
      </div>
    </div>
  )
}

// ─── Heatmap ─────────────────────────────────────────────────────────────────
export function Heatmap({ rows, cols, data, fmt: fmtFn }: {
  rows: string[]; cols: string[]
  data: number[][]
  fmt?: (v: number) => string
}) {
  const max = Math.max(...data.flat(), 1)
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 2 }}>
        <thead>
          <tr>
            <th style={{ width: 38 }} />
            {cols.map(c => (
              <th key={c} style={{ padding: '2px 4px', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9B9B9B', fontFamily: 'var(--font-league-spartan)', fontWeight: 400, textAlign: 'center' }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={row}>
              <td style={{ fontSize: 10, color: '#6B6B6B', fontFamily: 'var(--font-league-spartan)', paddingRight: 6, whiteSpace: 'nowrap' }}>{row}</td>
              {cols.map((col, ci) => {
                const v = data[ri]?.[ci] ?? 0
                const alpha = Math.min(0.85, (v / max) * 0.85)
                return (
                  <td key={col} title={fmtFn ? fmtFn(v) : String(v)} style={{ padding: '5px 4px', background: `rgba(55,14,77,${alpha})`, borderRadius: 0, textAlign: 'center', fontSize: 9.5, color: alpha > 0.4 ? '#fff' : '#6B6B6B', fontFamily: 'monospace', minWidth: 34, cursor: 'default' }}>
                    {v || ''}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── VAreaChart (Recharts) ────────────────────────────────────────────────────
export function VAreaChart({ data, compare, labels, fmt: fmtFn, height = 230 }: {
  data: number[]; compare?: number[]; labels: string[]
  fmt?: (v: number) => string; height?: number
}) {
  const chartData = labels.map((label, i) => ({
    label, value: data[i] ?? 0, ...(compare ? { compare: compare[i] ?? 0 } : {}),
  }))
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="vAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#370E4D" stopOpacity={0.1} />
            <stop offset="100%" stopColor="#370E4D" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 0" stroke="#F0F0EB" vertical={false} />
        <XAxis dataKey="label" tick={{ fontFamily: 'var(--font-league-spartan)', fontSize: 9.5, fill: '#9B9B9B' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontFamily: 'monospace', fontSize: 9.5, fill: '#9B9B9B' }} tickLine={false} axisLine={false} tickFormatter={fmtFn} width={48} />
        <Tooltip contentStyle={{ fontFamily: 'var(--font-league-spartan)', fontSize: 11, border: '1px solid #E8E8E8', borderRadius: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', background: '#fff' }}
          formatter={(v: unknown, name: unknown) => [fmtFn ? fmtFn(Number(v)) : String(v), name === 'value' ? 'Aktuell' : 'Vorperiode']}
          labelStyle={{ color: '#6B6B6B', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase' }} />
        {compare && <Area type="monotone" dataKey="compare" stroke="#C9C9C9" strokeDasharray="4 3" strokeWidth={1.5} fill="none" dot={false} />}
        <Area type="monotone" dataKey="value" stroke="#370E4D" strokeWidth={2} fill="url(#vAreaGrad)" dot={false} activeDot={{ r: 4, fill: '#370E4D', stroke: '#fff', strokeWidth: 2 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ─── VComboChart (Recharts) ───────────────────────────────────────────────────
export function VComboChart({ bars, line, labels, barFmt, lineFmt, height = 230 }: {
  bars: number[]; line: number[]; labels: string[]
  barFmt?: (v: number) => string; lineFmt?: (v: number) => string; height?: number
}) {
  const chartData = labels.map((label, i) => ({ label, bar: bars[i] ?? 0, line: line[i] ?? 0 }))
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={chartData} margin={{ top: 8, right: 40, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 0" stroke="#F0F0EB" vertical={false} />
        <XAxis dataKey="label" tick={{ fontFamily: 'var(--font-league-spartan)', fontSize: 9.5, fill: '#9B9B9B' }} tickLine={false} axisLine={false} />
        <YAxis yAxisId="l" tick={{ fontFamily: 'monospace', fontSize: 9.5, fill: '#9B9B9B' }} tickLine={false} axisLine={false} tickFormatter={barFmt} width={48} />
        <YAxis yAxisId="r" orientation="right" tick={{ fontFamily: 'monospace', fontSize: 9.5, fill: '#370E4D' }} tickLine={false} axisLine={false} tickFormatter={lineFmt} width={44} />
        <Tooltip contentStyle={{ fontFamily: 'var(--font-league-spartan)', fontSize: 11, border: '1px solid #E8E8E8', borderRadius: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', background: '#fff' }}
          formatter={(v: unknown, name: unknown) => [
            name === 'bar' ? (barFmt ? barFmt(Number(v)) : String(v)) : (lineFmt ? lineFmt(Number(v)) : String(v)),
            name === 'bar' ? 'Volumen' : 'Linie',
          ]} />
        <Bar yAxisId="l" dataKey="bar" fill="#E8E8E8" radius={[0, 0, 0, 0]} />
        <Line yAxisId="r" type="monotone" dataKey="line" stroke="#370E4D" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#370E4D', stroke: '#fff', strokeWidth: 2 }} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

// ─── DonutMulti (Recharts) ────────────────────────────────────────────────────
export function DonutMulti({ segments, centerValue, centerLabel }: {
  segments: { label: string; value: number; color: string }[]
  centerValue?: string; centerLabel?: string
}) {
  return (
    <div>
      <div style={{ position: 'relative' }}>
        <ResponsiveContainer width="100%" height={185}>
          <PieChart>
            <Pie data={segments} cx="50%" cy="50%" innerRadius={56} outerRadius={82} paddingAngle={2} dataKey="value">
              {segments.map((s, i) => <Cell key={i} fill={s.color} />)}
            </Pie>
            <Tooltip contentStyle={{ fontFamily: 'var(--font-league-spartan)', fontSize: 11, border: '1px solid #E8E8E8', borderRadius: 0 }}
              formatter={(v: unknown, name: unknown) => [`€ ${Number(v).toLocaleString('de-DE')}`, String(name)]} />
          </PieChart>
        </ResponsiveContainer>
        {(centerValue || centerLabel) && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            {centerValue && <span style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 22, color: '#0A0A0A', lineHeight: 1 }}>{centerValue}</span>}
            {centerLabel && <span style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 8.5, letterSpacing: '0.2em', color: '#6B6B6B', textTransform: 'uppercase', marginTop: 4 }}>{centerLabel}</span>}
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 justify-center">
        {segments.map(s => (
          <div key={s.label} className="flex items-center gap-1.5" style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 11, color: '#6B6B6B' }}>
            <span style={{ width: 9, height: 9, background: s.color, display: 'block', borderRadius: 0 }} />
            {s.label}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── VStackedBar (Recharts) ───────────────────────────────────────────────────
export function VStackedBar({ data, labels, keys, fmt: fmtFn, height = 220 }: {
  data: Record<string, number>[]; labels: string[]
  keys: { key: string; label: string; color: string }[]
  fmt?: (v: number) => string; height?: number
}) {
  const chartData = labels.map((label, i) => ({ label, ...data[i] }))
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 0" stroke="#F0F0EB" vertical={false} />
        <XAxis dataKey="label" tick={{ fontFamily: 'var(--font-league-spartan)', fontSize: 9.5, fill: '#9B9B9B' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontFamily: 'monospace', fontSize: 9.5, fill: '#9B9B9B' }} tickLine={false} axisLine={false} tickFormatter={fmtFn} width={48} />
        <Tooltip contentStyle={{ fontFamily: 'var(--font-league-spartan)', fontSize: 11, border: '1px solid #E8E8E8', borderRadius: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
          formatter={(v: unknown, name: unknown) => [fmtFn ? fmtFn(Number(v)) : String(v), keys.find(k => k.key === String(name))?.label ?? String(name)]} />
        {keys.map((k, i) => (
          <Bar key={k.key} dataKey={k.key} stackId="s" fill={k.color} radius={undefined} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

export function StackLegend({ keys }: { keys: { key: string; label: string; color: string }[] }) {
  return (
    <div className="flex gap-4 flex-wrap">
      {keys.map(k => (
        <div key={k.key} className="flex items-center gap-1.5" style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 10.5, color: '#6B6B6B', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          <span style={{ width: 10, height: 10, background: k.color, display: 'block' }} />
          {k.label}
        </div>
      ))}
    </div>
  )
}

// ─── 2-col / 2-1 / 3-col grid helpers ─────────────────────────────────────────
export function Grid2({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, ...style }}>{children}</div>
}
export function Grid21({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, ...style }}>{children}</div>
}
export function Grid3({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, ...style }}>{children}</div>
}
