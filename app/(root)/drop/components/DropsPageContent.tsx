'use client'

import React, { useState, useEffect, useMemo } from 'react'

type DropStatus = 'live' | 'soon' | 'closed'

interface DropItem {
  name: string
  price: string
  img: string
}

interface Drop {
  id: string
  num: string
  title: string
  titleFlat: string
  subtitle: string
  status: DropStatus
  endsAt?: number
  dropsAt?: number
  pieces: number
  remaining?: number
  img: string
  imgDetail: string
  cat: string
  desc: string
  items: DropItem[]
}

function getCountdown(targetMs: number) {
  const diff = Math.max(0, targetMs - Date.now())
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
    diff,
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

const IMGS = {
  heroDark:     'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1600&auto=format&fit=crop&q=80',
  experimental: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=900&auto=format&fit=crop&q=80',
  streetwear:   'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=900&auto=format&fit=crop&q=80',
  culture:      'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=900&auto=format&fit=crop&q=80',
  pdp1: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1200&auto=format&fit=crop&q=80',
  pdp2: 'https://images.unsplash.com/photo-1591047139756-eef8d2d9e0cb?w=1200&auto=format&fit=crop&q=80',
  pdp3: 'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=1200&auto=format&fit=crop&q=80',
  pdp4: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1200&auto=format&fit=crop&q=80',
  p1:  'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&auto=format&fit=crop&q=80',
  p2:  'https://images.unsplash.com/photo-1542838686-37da4a9fd1b3?w=800&auto=format&fit=crop&q=80',
  p3:  'https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?w=800&auto=format&fit=crop&q=80',
  p4:  'https://images.unsplash.com/photo-1551803091-e20673f15770?w=800&auto=format&fit=crop&q=80',
  p5:  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80',
  p6:  'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80',
  p7:  'https://images.unsplash.com/photo-1542060748-10c28b62716f?w=800&auto=format&fit=crop&q=80',
  p8:  'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80',
  p9:  'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80',
  p10: 'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=800&auto=format&fit=crop&q=80',
}

// ── DropCard ─────────────────────────────────────────────────────────────────
function DropCard({ drop, tick, onClick }: { drop: Drop; tick: number; onClick: () => void }) {
  const [hov, setHov] = useState(false)
  void tick // prop exists only to drive 1-second re-renders for the countdown

  const STATUS_STYLES: Record<DropStatus, { label: string; color: string; bg: string; border: string }> = {
    live:   { label: '● Live Now',    color: '#F5F5F0',                bg: 'rgba(255,255,255,0.07)', border: 'rgba(255,255,255,0.14)' },
    soon:   { label: 'Dropping Soon', color: 'rgba(245,245,240,0.45)', bg: 'transparent',            border: 'rgba(255,255,255,0.1)' },
    closed: { label: 'Sold Out',      color: 'rgba(245,245,240,0.18)', bg: 'transparent',            border: 'rgba(255,255,255,0.06)' },
  }
  const ss = STATUS_STYLES[drop.status]
  const cd = drop.dropsAt ? getCountdown(drop.dropsAt) : null

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ cursor: drop.status !== 'closed' ? 'pointer' : 'default' }}
    >
      <div style={{ aspectRatio: '3/4', overflow: 'hidden' }}>
        <img
          src={drop.img}
          alt={drop.titleFlat}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            filter: drop.status === 'closed'
              ? 'brightness(0.25) grayscale(0.5)'
              : hov ? 'brightness(0.65)' : 'brightness(0.45)',
            transform: hov && drop.status !== 'closed' ? 'scale(1.04)' : 'scale(1)',
            transition: 'filter 500ms ease, transform 700ms cubic-bezier(0.16,1,0.3,1)',
          }}
        />
      </div>

      <div style={{ background: '#0E0E0E', padding: '18px 18px 22px', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <span style={{
          display: 'inline-block', marginBottom: 14,
          fontSize: 8, letterSpacing: '0.24em', textTransform: 'uppercase',
          color: ss.color, background: ss.bg, border: `1px solid ${ss.border}`, padding: '4px 9px',
        }}>{ss.label}</span>

        <p style={{ fontSize: 8, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.25)', margin: '0 0 5px' }}>
          Drop {drop.num}
        </p>

        <h3 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 28, fontWeight: 300, fontStyle: 'italic',
          color: drop.status === 'closed' ? 'rgba(245,245,240,0.2)' : '#F5F5F0',
          margin: '0 0 5px', lineHeight: 1.05, whiteSpace: 'pre-line',
        }}>{drop.title}</h3>

        <p style={{ fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.35)', margin: '0 0 16px' }}>
          {drop.subtitle}
        </p>

        {cd && drop.status === 'soon' && (
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, fontWeight: 300, color: 'rgba(245,245,240,0.5)', margin: 0, letterSpacing: '0.02em' }}>
            In {pad(cd.d)}d {pad(cd.h)}h {pad(cd.m)}m
          </p>
        )}
        {drop.status === 'live' && (
          <p style={{ fontSize: 10, color: 'rgba(245,245,240,0.35)', letterSpacing: '0.05em', margin: 0 }}>
            {drop.remaining} / {drop.pieces} pieces
          </p>
        )}
        {drop.status === 'closed' && (
          <p style={{ fontSize: 10, color: 'rgba(245,245,240,0.15)', letterSpacing: '0.05em', margin: 0 }}>
            {drop.pieces} pieces — Archive
          </p>
        )}
      </div>
    </div>
  )
}

// ── DropPanel ─────────────────────────────────────────────────────────────────
function DropPanel({ open, drop, onClose }: { open: boolean; drop: Drop | null; onClose: () => void }) {
  const [openSec, setOpenSec] = useState<string[]>(['items'])

  const toggleSec = (id: string) =>
    setOpenSec(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  function Acc({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
    const isOpen = openSec.includes(id)
    return (
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => toggleSec(id)}
          style={{
            width: '100%', background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 0', fontFamily: 'inherit',
          }}
        >
          <span style={{ fontSize: 9, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.38)' }}>
            {label}
          </span>
          <svg
            width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="rgba(245,245,240,0.3)" strokeWidth="1.4" strokeLinecap="round"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 360ms cubic-bezier(0.16,1,0.3,1)', flexShrink: 0,
            }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        <div style={{
          overflow: 'hidden',
          maxHeight: isOpen ? 700 : 0,
          opacity: isOpen ? 1 : 0,
          transition: 'max-height 420ms cubic-bezier(0.16,1,0.3,1), opacity 280ms ease',
        }}>
          <div style={{ paddingBottom: 20 }}>{children}</div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Scrim */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 998,
          background: 'rgba(4,4,4,0.78)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 420ms cubic-bezier(0.16,1,0.3,1)',
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 999,
        width: 480, background: '#0C0C0C',
        display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 620ms cubic-bezier(0.16,1,0.3,1)',
        boxShadow: '-28px 0 80px rgba(0,0,0,0.7)',
        borderLeft: '1px solid rgba(255,255,255,0.05)',
      }}>
        {drop && (
          <>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0,
            }}>
              <div>
                <p style={{ fontSize: 8, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.3)', margin: '0 0 5px' }}>
                  Drop {drop.num}
                </p>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 300, fontStyle: 'italic', color: '#F5F5F0' }}>
                  {drop.titleFlat}
                </span>
              </div>
              <button
                onClick={onClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: 'rgba(245,245,240,0.4)', flexShrink: 0, transition: 'color 150ms' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 32px' }}>

              {/* Hero image */}
              <div style={{ margin: '24px -32px 0', aspectRatio: '16/9', overflow: 'hidden' }}>
                <img src={drop.imgDetail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.65)' }} />
              </div>

              {/* Meta row */}
              <div style={{
                display: 'flex', margin: '20px 0',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}>
                {[
                  { l: 'Brand',    v: drop.subtitle },
                  { l: 'Category', v: drop.cat },
                  { l: 'Edition',  v: `${drop.pieces} pieces` },
                ].map((m, i) => (
                  <div key={m.l} style={{
                    flex: 1, padding: '14px 0',
                    borderRight: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                    paddingRight: i < 2 ? 14 : 0,
                    paddingLeft: i > 0 ? 14 : 0,
                  }}>
                    <p style={{ fontSize: 7, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.25)', margin: '0 0 5px' }}>{m.l}</p>
                    <p style={{ fontSize: 11, color: '#F5F5F0', margin: 0, lineHeight: 1.35, letterSpacing: '0.02em' }}>{m.v}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              <p style={{ fontSize: 13, lineHeight: 1.75, fontWeight: 300, color: 'rgba(245,245,240,0.5)', letterSpacing: '0.02em', margin: '0 0 6px' }}>
                {drop.desc}
              </p>

              {/* Items accordion */}
              <Acc id="items" label="Items in this drop">
                {drop.items.map(item => (
                  <div key={item.name} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <div style={{ width: 50, height: 66, flexShrink: 0, overflow: 'hidden', background: '#1a1a1a' }}>
                      <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.7)' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 400, color: '#F5F5F0', margin: '0 0 3px', letterSpacing: '0.01em' }}>
                        {item.name}
                      </p>
                      <p style={{ fontSize: 11, color: 'rgba(245,245,240,0.38)', margin: 0, letterSpacing: '0.04em' }}>{item.price}</p>
                    </div>
                  </div>
                ))}
              </Acc>

              {/* Details accordion */}
              <Acc id="details" label="Drop Details">
                {[
                  { l: 'Release format', v: 'First-come, first-served' },
                  { l: 'Authentication', v: 'Each piece individually numbered' },
                  { l: 'Shipping',       v: 'Express worldwide, 2–3 business days' },
                  { l: 'Returns',        v: 'Final sale — no returns on drops' },
                ].map(d => (
                  <div key={d.l} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', gap: 16,
                  }}>
                    <span style={{ fontSize: 10, color: 'rgba(245,245,240,0.28)', letterSpacing: '0.06em', flexShrink: 0 }}>{d.l}</span>
                    <span style={{ fontSize: 11, color: 'rgba(245,245,240,0.55)', textAlign: 'right', lineHeight: 1.5 }}>{d.v}</span>
                  </div>
                ))}
              </Acc>
            </div>

            {/* Footer CTA */}
            <div style={{ padding: '20px 32px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
              {drop.status === 'live' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span style={{ fontSize: 9, color: 'rgba(245,245,240,0.28)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Available now</span>
                    <span style={{ fontSize: 12, color: 'rgba(245,245,240,0.65)' }}>{drop.remaining} of {drop.pieces} pieces</span>
                  </div>
                  <button style={{
                    width: '100%', background: '#F5F5F0', color: '#080808', border: 'none', cursor: 'pointer',
                    fontFamily: "'League Spartan', sans-serif",
                    fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', padding: '18px 0',
                  }}>Access Drop</button>
                </>
              )}
              {drop.status === 'soon' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span style={{ fontSize: 9, color: 'rgba(245,245,240,0.28)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Dropping soon</span>
                    <span style={{ fontSize: 12, color: 'rgba(245,245,240,0.65)' }}>{drop.pieces} pieces</span>
                  </div>
                  <button style={{
                    width: '100%', background: 'transparent', color: 'rgba(245,245,240,0.55)',
                    border: '1px solid rgba(255,255,255,0.14)', cursor: 'pointer',
                    fontFamily: "'League Spartan', sans-serif",
                    fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', padding: '18px 0',
                    transition: 'border-color 200ms, color 200ms',
                  }}>Notify Me</button>
                </>
              )}
              {drop.status === 'closed' && (
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <span style={{ fontSize: 9, color: 'rgba(245,245,240,0.18)', letterSpacing: '0.24em', textTransform: 'uppercase' }}>This drop is closed</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}

// ── DropsPageContent ──────────────────────────────────────────────────────────
export default function DropsPageContent() {
  const [panelOpen,  setPanelOpen]  = useState(false)
  const [activeDrop, setActiveDrop] = useState<Drop | null>(null)
  const [tick,       setTick]       = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    document.body.style.overflow = panelOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [panelOpen])

  // Timestamps initialised once at mount so countdowns are stable across re-renders
  const DROPS = useMemo<Drop[]>(() => {
    const now = Date.now()
    return [
      {
        id: 'nocturne', num: '001',
        title: 'Nocturne\nNo. 01', titleFlat: 'Nocturne No. 01',
        subtitle: 'Maison Vela × Atelier Noir', status: 'live',
        endsAt: now + 46 * 3600000 + 22 * 60000 + 14000,
        pieces: 120, remaining: 47,
        img: IMGS.heroDark, imgDetail: IMGS.pdp1,
        cat: 'Noir Collection',
        desc: 'A collaboration between Maison Vela and Atelier Noir exploring obsidian tones and architectural silhouettes. Each piece is handfinished in Paris and individually numbered.',
        items: [
          { name: 'Obsidian Trench', price: '€ 2.890', img: IMGS.p1 },
          { name: 'Void Blazer',     price: '€ 1.640', img: IMGS.p2 },
          { name: 'Smoke Trouser',   price: '€ 780',   img: IMGS.p6 },
        ],
      },
      {
        id: 'void', num: '002',
        title: 'Void\nSeries', titleFlat: 'Void Series',
        subtitle: 'Khōri', status: 'soon',
        dropsAt: now + 3 * 86400000 + 14 * 3600000 + 22 * 60000,
        pieces: 30,
        img: IMGS.experimental, imgDetail: IMGS.pdp2,
        cat: 'Experimental',
        desc: "Khōri's most deconstructed collection yet. Lacquered shells, impossible knits and coatings that shift between matte and mirror.",
        items: [
          { name: 'Lacquer Jacket', price: '€ 3.200', img: IMGS.p7 },
          { name: 'Distorted Knit', price: '€ 940',   img: IMGS.p3 },
        ],
      },
      {
        id: 'chrome', num: '003',
        title: 'Chrome\nArchive', titleFlat: 'Chrome Archive',
        subtitle: 'Studio Rück', status: 'soon',
        dropsAt: now + 8 * 86400000 + 6 * 3600000,
        pieces: 25,
        img: IMGS.streetwear, imgDetail: IMGS.pdp3,
        cat: 'Streetwear',
        desc: 'Studio Rück revisits their archive with chrome-treated fabrications and structural overcoats. An excavation of urban anonymity.',
        items: [
          { name: 'Archive Parka',  price: '€ 2.100', img: IMGS.p5 },
          { name: 'Mesh Layer Tee', price: '€ 490',   img: IMGS.p4 },
          { name: 'Coated Denim',   price: '€ 580',   img: IMGS.p10 },
        ],
      },
      {
        id: 'brutalux', num: '004',
        title: 'Brutalux\n002', titleFlat: 'Brutalux 002',
        subtitle: 'Côte Sauvage × Halden', status: 'closed',
        pieces: 60, remaining: 0,
        img: IMGS.culture, imgDetail: IMGS.pdp4,
        cat: 'Cultural',
        desc: 'The second chapter of the Brutalux collaboration. Sold out in 4 minutes. Archived.',
        items: [
          { name: 'Brutalist Shell Coat', price: '€ 2.450', img: IMGS.p8 },
          { name: 'Textured Knit',        price: '€ 690',   img: IMGS.p9 },
        ],
      },
    ]
  }, [])

  const heroCD = DROPS[0].endsAt ? getCountdown(DROPS[0].endsAt) : null
  void tick // drives countdown re-renders

  const lbl = (opacity = 0.35) => ({
    fontSize: 9 as const, letterSpacing: '0.28em',
    textTransform: 'uppercase' as const,
    color: `rgba(245,245,240,${opacity})`, margin: 0,
  })

  return (
    <div style={{ background: '#080808', color: '#F5F5F0', fontFamily: "'League Spartan', sans-serif", minHeight: '100vh' }}>

      {/* ══════════════════════ HERO ══════════════════════ */}
      <section style={{ position: 'relative', height: 640, overflow: 'hidden' }}>
        <video
          src="/assets/Videos/Inspiration.mp4"
          autoPlay loop muted playsInline
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center 30%',
            filter: 'brightness(0.38)',
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(105deg, rgba(8,8,8,0.92) 0%, rgba(8,8,8,0.45) 55%, rgba(8,8,8,0.15) 100%)',
        }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.06)' }} />

        <div style={{
          position: 'relative', height: '100%', maxWidth: 1440,
          margin: '0 auto', padding: '0 72px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          paddingTop: 72,
        }}>
          <p style={{ ...lbl(0.4), marginBottom: 22, letterSpacing: '0.36em' }}>Drop {DROPS[0].num}</p>

          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 96, fontWeight: 300, fontStyle: 'italic',
            lineHeight: 0.92, letterSpacing: '-0.01em',
            color: '#F5F5F0', margin: '0 0 22px', whiteSpace: 'pre-line',
          }}>{DROPS[0].title}</h1>

          <p style={{
            fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'rgba(245,245,240,0.5)', margin: '0 0 44px',
          }}>{DROPS[0].subtitle}</p>

          {/* Status + countdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 40 }}>
            <span style={{
              fontSize: 8, letterSpacing: '0.28em', textTransform: 'uppercase',
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)',
              padding: '7px 14px', color: '#F5F5F0',
            }}>● Live Now</span>

            <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)' }} />

            {heroCD && (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ ...lbl(0.35), marginRight: 8 }}>Ends in</span>
                {([
                  { val: heroCD.d, u: 'd' },
                  { val: heroCD.h, u: 'h' },
                  { val: heroCD.m, u: 'm' },
                  { val: heroCD.s, u: 's' },
                ] as const).map(({ val, u }, i) => (
                  <React.Fragment key={u}>
                    {i > 0 && <span style={{ color: 'rgba(245,245,240,0.18)', fontSize: 22, fontWeight: 100 }}>:</span>}
                    <span style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 300, color: '#F5F5F0', lineHeight: 1 }}>
                        {pad(val)}
                      </span>
                      <span style={{ ...lbl(0.3), fontSize: 8 }}>{u}</span>
                    </span>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          {/* CTA row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <button
              onClick={() => { setActiveDrop(DROPS[0]); setPanelOpen(true) }}
              style={{
                background: '#F5F5F0', color: '#080808', border: 'none', cursor: 'pointer',
                fontFamily: "'League Spartan', sans-serif",
                fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase',
                padding: '17px 40px', transition: 'opacity 200ms',
              }}
            >Access Drop</button>
            <span style={{ fontSize: 12, color: 'rgba(245,245,240,0.35)', letterSpacing: '0.04em' }}>
              {DROPS[0].remaining} of {DROPS[0].pieces} pieces remaining
            </span>
          </div>
        </div>

        {/* Bottom fade into page bg */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
          background: 'linear-gradient(to bottom, transparent, #080808)',
        }} />
      </section>

      {/* ══════════════════════ GRID ══════════════════════ */}
      <section style={{ padding: '72px 48px 112px', maxWidth: 1440, margin: '0 auto' }}>

        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          paddingBottom: 22, marginBottom: 44,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <span style={{ ...lbl(0.38), fontSize: 10 }}>All Drops</span>
          <span style={{ ...lbl(0.2), fontSize: 10 }}>Season 01 — 2026</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
          {DROPS.map(drop => (
            <DropCard
              key={drop.id}
              drop={drop}
              tick={tick}
              onClick={() => {
                if (drop.status !== 'closed') {
                  setActiveDrop(drop)
                  setPanelOpen(true)
                }
              }}
            />
          ))}
        </div>
      </section>

      {/* ══════════════════════ PANEL ══════════════════════ */}
      <DropPanel open={panelOpen} drop={activeDrop} onClose={() => setPanelOpen(false)} />
    </div>
  )
}
