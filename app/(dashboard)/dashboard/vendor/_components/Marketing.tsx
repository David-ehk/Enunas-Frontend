'use client'

import { VPageHeader, Phase2Panel } from './vshared'

// Phase 2 — Kampagnen-/Promo-Tracking hat noch keine Backend-Quelle.
// Dieser Screen wird in der nächsten Phase mit echten Daten ausgebaut.
export default function Marketing() {
  return (
    <div className="space-y-4">
      <VPageHeader
        eyebrow="Brand Portal · Phase 2"
        title="Marketing"
        sub="Kampagnen, Aktionscodes und Performance — wird in der nächsten Phase freigeschaltet."
      />
      <Phase2Panel
        title="Marketing"
        sub="Kampagnen-Tracking und Promo-Auswertung folgen in der nächsten Phase. Geplante Metriken:"
        metrics={['Kampagnen-Umsatz', 'Werbeausgaben', 'ROAS', 'Promo-Anteil', 'Kampagnen-Performance', 'Hero-Slot-Impressionen', 'Klickrate (CTR)', 'Rabattcode-Umsatz']}
      />
    </div>
  )
}

/* ─── Phase-2-Referenz: ursprüngliche Implementierung ─────────────────────────
   Vorlage für den Ausbau mit echten Daten. CAMPAIGNS/PROMOS/HERO_METRICS müssen
   durch echte Kampagnen-/Promo-Quellen ersetzt werden; Rabattcode-Umsätze können
   aus /brand/discounts + Order-Daten kommen.

import {
  VPageHeader, VKPIGrid, VKPI, VCard, VComboChart,
  Grid21, VStatus, VTH, VTD, VTR, fmtEur, Loader,
} from './vshared'

const MOCK_WEEKS   = ["W18","W19","W20","W21","W22","W23"]
const MOCK_SPEND   = [180, 240, 320, 280, 410, 380]
const MOCK_REVENUE = [1240, 1820, 2680, 2410, 3640, 3980]

const CAMPAIGNS = [
  { id: 'CMP-014', name: 'Spring Drop — Vol.1',   channel: 'Instagram + Newsletter', status: 'active', spend: 1200, revenue: 8420, roas: 7.0,  ctr: 3.2, start: '12. Mai' },
  { id: 'CMP-013', name: 'Hero-Slot — Denim',      channel: 'Storefront Hero',        status: 'active', spend: 0,    revenue: 6846, roas: null,  ctr: 5.8, start: '20. Mai' },
  { id: 'CMP-012', name: 'Stammkunden −15%',       channel: 'E-Mail',                 status: 'active', spend: 0,    revenue: 3140, roas: null,  ctr: 4.1, start: '1. Mai'  },
  { id: 'CMP-011', name: 'Oster-Kapsel',           channel: 'Instagram',              status: 'ended',  spend: 800,  revenue: 4210, roas: 5.3,  ctr: 2.7, start: '2. Apr'  },
  { id: 'CMP-010', name: 'Newsletter — April Edit',channel: 'E-Mail',                 status: 'ended',  spend: 0,    revenue: 2980, roas: null,  ctr: 3.9, start: '8. Apr'  },
]
const PROMOS = [
  { code: 'SPRING24',  type: '15% Rabatt',        used: 142, cap: 300,  revenue: 6820, status: 'active', expires: '15. Jun'   },
  { code: 'WELCOME10', type: '10% Erstbestellung', used: 88,  cap: null, revenue: 3940, status: 'active', expires: 'Dauerhaft' },
  { code: 'RETURN15',  type: '15% Win-Back',       used: 41,  cap: 200,  revenue: 3140, status: 'active', expires: '1. Jun'    },
  { code: 'EASTER20',  type: '20% Kapsel',         used: 96,  cap: 100,  revenue: 4210, status: 'ended',  expires: '21. Apr'   },
]
const HERO_METRICS = [
  { label: 'Impressionen',          value: '118.400' },
  { label: 'Klickrate (CTR)',        value: '5.8%'    },
  { label: 'Umsatz zugerechnet',     value: fmtEur(6846) },
]

export default function Marketing() {
  const totalSpend   = MOCK_SPEND.reduce((s, v) => s + v, 0)
  const campaignRev  = MOCK_REVENUE.reduce((s, v) => s + v, 0)
  const roas         = totalSpend > 0 ? (campaignRev / totalSpend) : 0
  const promoDriven  = Math.round((PROMOS.reduce((s, p) => s + p.revenue, 0) / 21820) * 100)

  return (
    <div className="space-y-4">
      <VPageHeader
        eyebrow="Brand Portal"
        title="Marketing"
        sub="Kampagnen, Aktionscodes und Performance."
      />

      <VKPIGrid cols={4}>
        <VKPI label="Kampagnen-Umsatz" value={fmtEur(campaignRev)} delta="+24% vs. Vormonat"  deltaTone="up"   />
        <VKPI label="Werbeausgaben"    value={fmtEur(totalSpend)}  delta="lfd. Periode"         deltaTone="muted"/>
        <VKPI label="ROAS"             value={`${roas.toFixed(1)}×`} delta="Return on Ad Spend" deltaTone="up"   />
        <VKPI label="Promo-Anteil"     value={`${promoDriven}%`}   delta="aller Bestellungen"   deltaTone="muted"/>
      </VKPIGrid>

      <Grid21>
        <VCard eyebrow="Ausgaben & Umsatz" title="Kampagnen-Performance">
          <VComboChart
            bars={MOCK_SPEND}
            line={MOCK_REVENUE}
            labels={MOCK_WEEKS}
            barFmt={fmtEur}
            lineFmt={fmtEur}
            height={220}
          />
        </VCard>

        <VCard eyebrow="Enunas Storefront" title="Hero-Slot" action={<VStatus tone="success">Aktiv</VStatus>}>
          <div style={{ padding: '4px 0' }}>
            <div style={{ background: '#F5F5F0', padding: '14px 16px', marginBottom: 16, borderLeft: '3px solid #370E4D' }}>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 16, color: '#0A0A0A', margin: 0 }}>
                Worlds End Denim Boxer Jacket
              </p>
              <p style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 9.5, color: '#6B6B6B', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 6 }}>
                Hero-Platzierung · Startseite
              </p>
            </div>
            {HERO_METRICS.map(m => (
              <div key={m.label} className="flex justify-between py-2.5 border-b border-[#F5F5F0]"
                style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 12 }}>
                <span style={{ color: '#6B6B6B' }}>{m.label}</span>
                <span style={{ color: '#0A0A0A', fontWeight: 600 }}>{m.value}</span>
              </div>
            ))}
          </div>
        </VCard>
      </Grid21>

      <VCard eyebrow="Aktive & beendete" title="Kampagnen" flush>
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <VTH>Kampagne</VTH>
              <VTH>Kanal</VTH>
              <VTH>Start</VTH>
              <VTH right>Ausgaben</VTH>
              <VTH right>Umsatz</VTH>
              <VTH right>ROAS</VTH>
              <VTH right>CTR</VTH>
              <VTH>Status</VTH>
            </tr>
          </thead>
          <tbody>
            {CAMPAIGNS.map(c => (
              <VTR key={c.id}>
                <VTD><span style={{ fontWeight: 500, color: '#0A0A0A' }}>{c.name}</span></VTD>
                <VTD muted>{c.channel}</VTD>
                <VTD muted>{c.start}</VTD>
                <VTD right>{c.spend > 0 ? fmtEur(c.spend) : <span style={{ color: '#C9C9C9' }}>—</span>}</VTD>
                <VTD right>{fmtEur(c.revenue)}</VTD>
                <VTD right>{c.roas != null ? `${c.roas}×` : <span style={{ color: '#C9C9C9' }}>—</span>}</VTD>
                <VTD right>{c.ctr}%</VTD>
                <VTD>
                  <VStatus tone={c.status === 'active' ? 'success' : 'muted'}>
                    {c.status === 'active' ? 'Aktiv' : 'Beendet'}
                  </VStatus>
                </VTD>
              </VTR>
            ))}
          </tbody>
        </table>
      </VCard>

      <VCard eyebrow="Aktionscodes" title="Rabattcodes" flush>
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <VTH>Code</VTH>
              <VTH>Typ</VTH>
              <VTH>Genutzt</VTH>
              <VTH right>Umsatz</VTH>
              <VTH>Läuft ab</VTH>
              <VTH>Status</VTH>
            </tr>
          </thead>
          <tbody>
            {PROMOS.map(p => (
              <VTR key={p.code}>
                <VTD mono>{p.code}</VTD>
                <VTD muted>{p.type}</VTD>
                <VTD>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 12, color: '#2D2D2D' }}>{p.used}</span>
                    {p.cap != null && (
                      <>
                        <div style={{ width: 48, height: 3, background: '#E8E8E8' }}>
                          <div style={{ height: '100%', width: `${Math.min(100, (p.used / p.cap) * 100)}%`, background: '#370E4D' }} />
                        </div>
                        <span style={{ fontFamily: 'var(--font-league-spartan)', fontSize: 10, color: '#9B9B9B' }}>/ {p.cap}</span>
                      </>
                    )}
                  </div>
                </VTD>
                <VTD right>{fmtEur(p.revenue)}</VTD>
                <VTD muted>{p.expires}</VTD>
                <VTD>
                  <VStatus tone={p.status === 'active' ? 'success' : 'muted'}>
                    {p.status === 'active' ? 'Aktiv' : 'Beendet'}
                  </VStatus>
                </VTD>
              </VTR>
            ))}
          </tbody>
        </table>
      </VCard>
    </div>
  )
}
*/
