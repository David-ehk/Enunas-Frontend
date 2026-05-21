'use client'

import { BarChart2, Users, TrendingUp, ShoppingBag, Tag } from 'lucide-react'

function SectionLabel({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-3.5 h-3.5 text-[#9B9B9B]" />
      <p
        className="text-[10px] uppercase tracking-[0.15em] text-[#9B9B9B] font-medium"
        style={{ fontFamily: 'var(--font-league-spartan)' }}
      >
        {label}
      </p>
    </div>
  )
}

function PlaceholderKPI({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="bg-white border border-[#E8E8E8] rounded-xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-shadow duration-200">
      <p
        className="text-[10px] uppercase tracking-[0.12em] text-[#9B9B9B] font-medium mb-1.5"
        style={{ fontFamily: 'var(--font-league-spartan)' }}
      >
        {label}
      </p>
      <p className="text-[22px] font-semibold text-[#D8D8D4] leading-none">—</p>
      <p className="text-[11px] text-[#9B9B9B] mt-2">{desc}</p>
    </div>
  )
}

import React from 'react'

export default function Analytics() {
  return (
    <div className="space-y-8">
      {/* Phase 2 notice */}
      <div className="bg-white border border-[#E8E8E8] rounded-xl px-6 py-5 flex items-start gap-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(55,14,77,0.08)' }}>
          <BarChart2 className="w-4 h-4 text-[#370E4D]" />
        </div>
        <div>
          <p
            className="font-semibold text-[13px] text-[#0A0A0A]"
            style={{ fontFamily: 'var(--font-league-spartan)' }}
          >
            Analytics Dashboard — Phase 2
          </p>
          <p className="text-[12px] text-[#6B6B6B] mt-1 max-w-xl leading-relaxed">
            Dieses Modul wird in Phase 2 aktiviert. Die KPIs werden aus Echtzeit-Daten berechnet
            und erfordern ein dediziertes Analytics-Backend (z.B. PostHog, Mixpanel oder custom).
          </p>
        </div>
      </div>

      {/* Business KPIs */}
      <div>
        <SectionLabel icon={TrendingUp} label="Business" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <PlaceholderKPI label="GMV (Gross Merchandise Value)" desc="Gesamtwert aller Transaktionen" />
          <PlaceholderKPI label="Net Revenue"     desc="Nach Plattformgebühren" />
          <PlaceholderKPI label="AOV"             desc="Durchschnittlicher Warenkorbwert" />
          <PlaceholderKPI label="Conversion Rate" desc="Besucher → Kauf" />
        </div>
      </div>

      {/* Marketplace KPIs */}
      <div>
        <SectionLabel icon={ShoppingBag} label="Marketplace" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <PlaceholderKPI label="Active Brands"     desc="Marken mit ≥1 Bestellung" />
          <PlaceholderKPI label="Active Listings"   desc="Sichtbare Produkte" />
          <PlaceholderKPI label="Sell Through Rate" desc="Verkaufte vs. Listung" />
        </div>
      </div>

      {/* Growth KPIs */}
      <div>
        <SectionLabel icon={Users} label="Growth" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <PlaceholderKPI label="CAC"             desc="Customer Acquisition Cost" />
          <PlaceholderKPI label="Returning Users" desc="Wiederkehrende Käufer" />
          <PlaceholderKPI label="Retention (30d)" desc="Kunden aktiv nach 30 Tagen" />
          <PlaceholderKPI label="Neue User / Tag" desc="Registrierungen" />
        </div>
      </div>

      {/* Fashion KPIs */}
      <div>
        <SectionLabel icon={Tag} label="Fashion" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <PlaceholderKPI label="Top Größen"      desc="Meistgekaufte Größen" />
          <PlaceholderKPI label="Top Kategorien"  desc="Umsatz nach Kategorie" />
          <PlaceholderKPI label="Return Rate"     desc="Rückgaben / Bestellungen" />
          <PlaceholderKPI label="Repeat Purchase" desc="Ø Bestellungen / Kunde" />
        </div>
      </div>
    </div>
  )
}
