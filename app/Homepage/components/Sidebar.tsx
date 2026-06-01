'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

/* ─── Types ─────────────────────────────────────────────────── */
interface TileData  { video?: boolean; kicker: string; name: string; img: string }
interface SubLink   { label: string; href?: string; deep?: boolean }
interface Highlight { label: string }
interface Category  {
  key: string; label: string; title: string; kicker: string; tone?: 'sale'
  route: string; sub: SubLink[]; highlights: Highlight[]; tiles: TileData[]
}

/* ─── Image paths (served from /public) ─────────────────────── */
const IMG = {
  trendy: '/assets/images/nav/TRENDY.jpg',
  newin:  '/assets/images/nav/NEWIN.jpg',
  t1:     '/assets/images/nav/Test1.jpg',
  t3:     '/assets/images/nav/Test3.jpg',
  t4:     '/assets/images/nav/Test4.jpg',
}

/* ─── Nav data ───────────────────────────────────────────────── */
const CATEGORIES: Category[] = [
  {
    key: 'neu', label: 'Neu', title: 'Neu', kicker: 'Diese Woche · 48 Stücke', route: '/neu',
    sub: [
      { label: 'Alle Neuheiten', href: '/neu' },
      { label: 'Damen',         href: '/neu', deep: true },
      { label: 'Herren',        href: '/neu', deep: true },
      { label: 'Schuhe',        href: '/neu' },
      { label: 'Taschen',       href: '/neu' },
      { label: 'Accessoires',   href: '/neu' },
    ],
    highlights: [{ label: 'Herbstkollektion 2026' }, { label: 'Die Drop-Liste' }, { label: 'Wieder verfügbar' }],
    tiles: [
      { video: true, kicker: 'Kampagne',   name: 'Herbst 2026',       img: IMG.trendy },
      { kicker: 'Streetwear', name: 'Worlds End Denim',  img: IMG.newin  },
      { kicker: 'Neu',        name: 'Drop Hoodie Vol.1', img: IMG.t1     },
      { kicker: 'Schuhe',     name: 'Neue Sneaker',      img: IMG.t3     },
    ],
  },
  {
    key: 'trendy', label: 'Trendy', title: 'Trendy', kicker: 'Was gerade läuft', route: '/trendy',
    sub: [
      { label: 'Bestseller',        href: '/trendy' },
      { label: 'Meistgesehen',      href: '/trendy' },
      { label: "Editor's Picks",    href: '/trendy' },
      { label: 'Im Trend: Schuhe',  href: '/trendy', deep: true },
      { label: 'Im Trend: Taschen', href: '/trendy', deep: true },
    ],
    highlights: [{ label: 'Das Berlin-Set' }, { label: 'Quiet Luxury' }, { label: 'Statement-Taschen' }],
    tiles: [
      { video: true, kicker: 'Im Trend',     name: 'Die Berlin-Uniform', img: IMG.newin },
      { kicker: 'Bestseller',   name: 'Volume Tee',          img: IMG.t1    },
      { kicker: "Editor's Pick",name: 'Atelier Overcoat',    img: IMG.t4    },
      { kicker: 'Meistgesehen', name: 'Cashmere Crew',       img: IMG.t3    },
    ],
  },
  {
    key: 'catalogue', label: 'Catalogue', title: 'Katalog', kicker: '248 Stücke · 42 Marken', route: '/catalogue',
    sub: [
      { label: 'Alle Kategorien', href: '/catalogue' },
      { label: 'Streetwear',      href: '/catalogue', deep: true },
      { label: 'Experimental',    href: '/catalogue', deep: true },
      { label: 'Athleisure',      href: '/catalogue', deep: true },
      { label: 'Culture',         href: '/catalogue', deep: true },
    ],
    highlights: [{ label: 'Nach Marke' }, { label: 'Nach Farbe' }, { label: 'Nach Preis' }],
    tiles: [
      { video: true, kicker: 'Der Katalog', name: 'Kuratiert für dich',    img: IMG.t4    },
      { kicker: 'Streetwear', name: 'Drop Hoodie Vol.1',   img: IMG.t1    },
      { kicker: 'Culture',    name: 'Cashmere Crew',        img: IMG.trendy},
      { kicker: 'Athleisure', name: 'Featherweight Puffer', img: IMG.newin },
    ],
  },
  {
    key: 'bekleidung', label: 'Bekleidung', title: 'Bekleidung', kicker: 'Vom Shirt bis zum Mantel', route: '/bekleidung',
    sub: [
      { label: 'Alle Bekleidung', href: '/bekleidung' },
      { label: 'Tops',            href: '/bekleidung', deep: true },
      { label: 'Bottoms',         href: '/bekleidung', deep: true },
      { label: 'Kleider',         href: '/bekleidung' },
      { label: 'Outerwear',       href: '/bekleidung', deep: true },
      { label: 'Strick',          href: '/bekleidung' },
      { label: 'Denim',           href: '/bekleidung' },
    ],
    highlights: [{ label: 'Die Hosen-Edit' }, { label: 'Leichte Jacken' }, { label: 'Basics neu gedacht' }],
    tiles: [
      { video: true, kicker: 'Lookbook',   name: 'Schichten für den Herbst', img: IMG.t3    },
      { kicker: 'Denim',     name: 'Worlds End Denim',          img: IMG.newin },
      { kicker: 'Tops',      name: 'Volume Tee, Charcoal',      img: IMG.t1    },
      { kicker: 'Outerwear', name: 'Atelier Overcoat',          img: IMG.t4    },
    ],
  },
  {
    key: 'women', label: 'Women', title: 'Damen', kicker: 'Damenmode entdecken', route: '/bekleidung',
    sub: [
      { label: 'Damenmode entdecken', href: '/bekleidung' },
      { label: 'Prêt-à-porter',       href: '/bekleidung', deep: true },
      { label: 'Taschen',             href: '/bekleidung', deep: true },
      { label: 'Kleinlederwaren',     href: '/bekleidung', deep: true },
      { label: 'Accessoires',         href: '/bekleidung', deep: true },
      { label: 'Schmuck',             href: '/bekleidung', deep: true },
      { label: 'Schuhe',              href: '/bekleidung', deep: true },
    ],
    highlights: [{ label: 'Herbstkollektion 2026' }, { label: 'Die Book Cover Kollektion' }, { label: 'Hochzeitsoutfits' }],
    tiles: [
      { video: true, kicker: 'Damen · Kampagne', name: 'Herbst 2026',          img: IMG.trendy },
      { kicker: 'Prêt-à-porter', name: 'Cashmere Crew, Crema', img: IMG.t1     },
      { kicker: 'Schuhe',        name: 'Die Sneaker-Galerie',   img: IMG.newin  },
      { kicker: 'Accessoires',   name: 'Statement-Taschen',     img: IMG.t3     },
    ],
  },
  {
    key: 'men', label: 'Men', title: 'Herren', kicker: 'Herrenmode entdecken', route: '/bekleidung',
    sub: [
      { label: 'Herrenmode entdecken', href: '/bekleidung' },
      { label: 'Prêt-à-porter',        href: '/bekleidung', deep: true },
      { label: 'Taschen',              href: '/bekleidung', deep: true },
      { label: 'Schuhe',               href: '/bekleidung', deep: true },
      { label: 'Accessoires',          href: '/bekleidung', deep: true },
      { label: 'Grooming',             href: '/bekleidung' },
    ],
    highlights: [{ label: 'Tailoring' }, { label: 'Die Sneaker-Galerie' }, { label: 'Workwear' }],
    tiles: [
      { video: true, kicker: 'Herren · Kampagne', name: 'Nach Sonnenuntergang', img: IMG.newin },
      { kicker: 'Tailoring',     name: 'Atelier Overcoat',  img: IMG.t4    },
      { kicker: 'Prêt-à-porter', name: 'Drop Hoodie Vol.1', img: IMG.t1    },
      { kicker: 'Schuhe',        name: 'Neue Sneaker',       img: IMG.t3    },
    ],
  },
  {
    key: 'marken', label: 'Marken', title: 'Marken', kicker: '42 Ateliers · kuratiert', route: '/marken',
    sub: [
      { label: 'Alle Marken',    href: '/marken' },
      { label: "World's End",    href: '/marken', deep: true },
      { label: 'Volt Atelier',   href: '/marken', deep: true },
      { label: 'Marin Studio',   href: '/marken', deep: true },
      { label: 'Kashmir & Co.',  href: '/marken', deep: true },
      { label: 'Hexen Berlin',   href: '/marken', deep: true },
      { label: 'Frantz',         href: '/marken', deep: true },
    ],
    highlights: [{ label: 'Neu auf Enunas' }, { label: 'Nur bei uns' }, { label: 'Atelier-Geschichten' }],
    tiles: [
      { video: true, kicker: 'Atelier',     name: "World's End, Kreuzberg", img: IMG.t4     },
      { kicker: 'Neu',         name: 'Volt Atelier',           img: IMG.newin  },
      { kicker: 'Nur bei uns', name: 'Marin Studio',           img: IMG.trendy },
      { kicker: 'Kollektion',  name: 'Kashmir & Co.',          img: IMG.t1     },
    ],
  },
  {
    key: 'drops', label: 'Drops', title: 'Drops', kicker: 'Limitiert · auf die Sekunde', route: '/drop',
    sub: [
      { label: 'Live jetzt',            href: '/drop' },
      { label: 'Kommende Drops',        href: '/drop' },
      { label: 'Vergangene Drops',      href: '/drop' },
      { label: 'Erinnerung aktivieren', href: '/drop' },
    ],
    highlights: [{ label: 'Drop Vol.1' }, { label: 'Worlds End × Enunas' }, { label: 'Der Countdown' }],
    tiles: [
      { video: true, kicker: 'Live · endet in 02:14:08', name: 'Drop Vol.1',            img: IMG.t1    },
      { kicker: 'Kommend',   name: 'Worlds End × Enunas', img: IMG.newin },
      { kicker: 'Vergangen', name: 'Easter Capsule',       img: IMG.t3    },
      { kicker: 'Bald',      name: 'Winter-Drop',          img: IMG.t4    },
    ],
  },
  {
    key: 'sale', label: 'Sale', title: 'Sale', kicker: 'Bis −50% · nur kurze Zeit', route: '/bekleidung',
    tone: 'sale',
    sub: [
      { label: 'Alle Reduzierungen', href: '/bekleidung' },
      { label: 'Damen Sale',         href: '/bekleidung', deep: true },
      { label: 'Herren Sale',        href: '/bekleidung', deep: true },
      { label: 'Schuhe Sale',        href: '/bekleidung' },
      { label: 'Letzte Chance',      href: '/bekleidung' },
    ],
    highlights: [{ label: 'Bis −50%' }, { label: 'Nur kurze Zeit' }, { label: 'Letzte Größen' }],
    tiles: [
      { video: true, kicker: 'Sale',          name: 'Bis zu 50% reduziert', img: IMG.t3    },
      { kicker: 'Damen',         name: 'Cashmere Crew',         img: IMG.t1    },
      { kicker: 'Letzte Chance', name: 'Featherweight Puffer',  img: IMG.newin },
      { kicker: 'Herren',        name: 'Walker Trouser',        img: IMG.t4    },
    ],
  },
]

/* ─── Icons ──────────────────────────────────────────────────── */
function IClose() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18" /></svg>
}
function IChevR() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6" /></svg>
}
function IChevL() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6" /></svg>
}
function IArrow() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h15M13 6l6 6-6 6" /></svg>
}
function IPause() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></svg>
}
function IPlay() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5l12 7-12 7V5Z" /></svg>
}

/* ─── Tile components ────────────────────────────────────────── */
function VideoTile({ tile }: { tile: TileData }) {
  const [paused, setPaused] = useState(false)
  return (
    <div className="mn-tile mn-is-video" data-paused={paused ? 'true' : 'false'}>
      <div className="mn-tile-media mn-kb">
        <img src={tile.img} alt={tile.name} />
      </div>
      <div className="mn-video-tag">
        <span className="mn-rec" />{paused ? 'Pausiert' : 'Video'}
      </div>
      <button
        className="mn-video-ctl"
        onClick={(e) => { e.stopPropagation(); setPaused(p => !p) }}
        aria-label={paused ? 'Abspielen' : 'Pausieren'}
      >
        {paused ? <IPlay /> : <IPause />}
      </button>
      <div className="mn-tile-cap">
        <div className="mn-kicker">{tile.kicker}</div>
        <span className="mn-name">{tile.name}</span>
      </div>
    </div>
  )
}

function Tile({ tile }: { tile: TileData }) {
  if (tile.video) return <VideoTile tile={tile} />
  return (
    <div className="mn-tile">
      <div className="mn-tile-media"><img src={tile.img} alt={tile.name} /></div>
      <div className="mn-tile-cap">
        <div className="mn-kicker">{tile.kicker}</div>
        <span className="mn-name">{tile.name}</span>
      </div>
    </div>
  )
}

/* ─── CSS ────────────────────────────────────────────────────── */
const MEGA_CSS = `
/* ── Variables (scoped to panel) ── */
.mn-mega {
  --mn-ease:    cubic-bezier(0.16, 1, 0.3, 1);
  --mn-ease-q:  cubic-bezier(0.25, 1, 0.5, 1);
  --mn-serif:   'Cormorant Garamond', Garamond, Georgia, serif;
  --mn-sans:    'League Spartan', system-ui, sans-serif;
  --mn-rail-bg:     #0A0A0A;
  --mn-rail-fg:     #EFEDE7;
  --mn-rail-muted:  rgba(255,255,255,0.42);
  --mn-rail-hair:   rgba(255,255,255,0.12);
  --mn-rail-accent: color-mix(in oklab, #370E4D 52%, #ffffff);
  --mn-pane-bg:     #F5F5F0;
  --mn-pane-fg:     #0A0A0A;
  --mn-pane-muted:  #6B6B6B;
  --mn-pane-hair:   #E2E2DC;
  --mn-pane-accent: #370E4D;
  --mn-tile-fallback: #DBD9D2;
}

/* ── Scrim ── */
.mn-scrim {
  position: fixed; inset: 0; z-index: 9998;
  background: rgba(10,8,14,0.34);
  opacity: 0; pointer-events: none;
  transition: opacity 600ms cubic-bezier(0.16,1,0.3,1);
}
.mn-scrim.mn-open { opacity: 1; pointer-events: auto; }

/* ── Panel shell ── */
.mn-mega {
  position: fixed; top: 0; left: 0; z-index: 9999;
  height: 100vh; height: 100dvh;
  width: min(1320px, 94vw);
  display: grid; grid-template-columns: 312px 360px 1fr;
  transform: translateX(-101%);
  transition: transform 760ms cubic-bezier(0.16,1,0.3,1);
  box-shadow: 0 0 90px rgba(0,0,0,0.22);
  background: #F5F5F0;
  font-family: var(--mn-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow: hidden;
}
.mn-mega[data-open="true"] { transform: translateX(0); }

/* ── Column 1 · ink rail ── */
.mn-rail {
  display: flex; flex-direction: column;
  background: var(--mn-rail-bg); color: var(--mn-rail-fg);
  min-width: 0;
}
.mn-rail-head {
  display: flex; align-items: center; justify-content: space-between;
  height: 72px; padding: 0 28px; flex-shrink: 0;
  border-bottom: 1px solid var(--mn-rail-hair);
}
.mn-mark {
  font-family: var(--mn-serif); font-size: 26px;
  letter-spacing: 0.03em; line-height: 1;
}
.mn-rail-close {
  background: none; border: 0; padding: 8px; margin: -8px; cursor: pointer;
  display: flex; align-items: center; gap: 8px;
  font-size: 10px; letter-spacing: 0.24em; text-transform: uppercase;
  color: var(--mn-rail-muted); font-family: var(--mn-sans);
  transition: color 240ms cubic-bezier(0.25,1,0.5,1);
}
.mn-rail-close:hover { color: var(--mn-rail-fg); }

.mn-rail-nav {
  display: flex; flex-direction: column;
  padding: 10px 0; flex: 1; overflow-y: auto;
}
.mn-rail-link {
  position: relative; background: none; border: 0; text-align: left;
  padding: 0 28px; height: 48px; cursor: pointer;
  display: grid; grid-template-columns: 30px 1fr 14px;
  align-items: center; gap: 4px;
  color: var(--mn-rail-fg); font-family: var(--mn-sans);
  transition: color 280ms cubic-bezier(0.25,1,0.5,1);
}
.mn-idx {
  font-size: 10px; letter-spacing: 0.1em; font-variant-numeric: tabular-nums;
  color: var(--mn-rail-muted); font-weight: 400;
  transition: color 280ms cubic-bezier(0.25,1,0.5,1);
}
.mn-rl-label {
  font-size: 13px; letter-spacing: 0.24em; text-transform: uppercase; font-weight: 400;
  transition: transform 420ms cubic-bezier(0.16,1,0.3,1),
              letter-spacing 420ms cubic-bezier(0.16,1,0.3,1);
}
.mn-chev-r {
  opacity: 0; transform: translateX(-6px); display: flex;
  color: var(--mn-rail-accent);
  transition: opacity 300ms cubic-bezier(0.16,1,0.3,1),
              transform 300ms cubic-bezier(0.16,1,0.3,1);
}
.mn-rail-link::before {
  content: ''; position: absolute; left: 0; top: 50%;
  transform: translateY(-50%) scaleY(0);
  width: 3px; height: 24px; background: var(--mn-rail-accent);
  transition: transform 360ms cubic-bezier(0.16,1,0.3,1);
}
.mn-rail-link::after {
  content: ''; position: absolute; left: 28px; right: 28px; bottom: 8px; height: 1px;
  background: var(--mn-rail-accent); transform: scaleX(0); transform-origin: left; opacity: 0;
  transition: transform 460ms cubic-bezier(0.16,1,0.3,1),
              opacity 280ms cubic-bezier(0.25,1,0.5,1);
}
.mn-rail-link:hover .mn-rl-label    { letter-spacing: 0.3em; transform: translateX(2px); }
.mn-rail-link[aria-current="true"] .mn-idx    { color: var(--mn-rail-accent); }
.mn-rail-link[aria-current="true"] .mn-rl-label { transform: translateX(2px); }
.mn-rail-link[aria-current="true"] .mn-chev-r { opacity: 1; transform: translateX(0); }
.mn-rail-link[aria-current="true"]::after  { transform: scaleX(1); opacity: 1; }
.mn-rail-link[aria-current="true"]::before { transform: translateY(-50%) scaleY(1); }
.mn-rail-link[data-tone="sale"] .mn-rl-label {
  color: color-mix(in oklab, #C0476A 70%, var(--mn-rail-fg));
}
.mn-rail-link[data-tone="sale"]::before,
.mn-rail-link[data-tone="sale"]::after { background: #C0476A; }
.mn-rail-link[data-tone="sale"][aria-current="true"] .mn-idx { color: #C0476A; }

.mn-rail-foot {
  padding: 18px 28px 22px; flex-shrink: 0;
  border-top: 1px solid var(--mn-rail-hair);
  display: flex; flex-direction: column; gap: 12px;
}
.mn-foot-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.mn-rail-foot a {
  font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--mn-rail-muted); text-decoration: none;
  display: inline-flex; align-items: center; gap: 8px;
  font-family: var(--mn-sans);
  transition: color 240ms cubic-bezier(0.25,1,0.5,1);
}
.mn-rail-foot a:hover { color: var(--mn-rail-fg); }
.mn-locale {
  color: var(--mn-rail-fg) !important;
  border: 1px solid var(--mn-rail-hair); padding: 7px 11px;
}
.mn-locale:hover { border-color: var(--mn-rail-accent) !important; }

/* ── Column 2 · cream sub-nav ── */
.mn-sub {
  background: var(--mn-pane-bg); color: var(--mn-pane-fg);
  border-right: 1px solid var(--mn-pane-hair);
  display: flex; flex-direction: column; overflow: hidden; min-width: 0;
}

/* Mobile-only back header — hidden on desktop */
.mn-sub-mobile-head {
  display: none;
  height: 64px; padding: 0 24px; flex-shrink: 0;
  align-items: center; justify-content: space-between;
  border-bottom: 1px solid var(--mn-pane-hair);
}
.mn-mobile-back {
  background: none; border: 0; cursor: pointer;
  display: flex; align-items: center; gap: 8px;
  font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase;
  color: var(--mn-pane-muted); font-family: var(--mn-sans);
  transition: color 240ms cubic-bezier(0.25,1,0.5,1);
}
.mn-mobile-back:hover { color: var(--mn-pane-fg); }
.mn-sub-mobile-close {
  background: none; border: 0; cursor: pointer;
  display: flex; align-items: center; gap: 8px;
  font-size: 10px; letter-spacing: 0.24em; text-transform: uppercase;
  color: var(--mn-pane-muted); font-family: var(--mn-sans);
  transition: color 240ms cubic-bezier(0.25,1,0.5,1);
}
.mn-sub-mobile-close:hover { color: var(--mn-pane-fg); }

.mn-sub-body { padding: 26px 32px 22px; overflow-y: auto; flex: 1; }
.mn-fade-enter { animation: mn-fadeUp 560ms cubic-bezier(0.16,1,0.3,1) both; }
@keyframes mn-fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.mn-sub-head { margin-bottom: 18px; }
.mn-sub-kicker {
  font-size: 9.5px; letter-spacing: 0.3em; text-transform: uppercase;
  color: var(--mn-pane-muted); margin-bottom: 8px;
}
.mn-sub-title {
  font-family: var(--mn-serif); font-weight: 300; font-style: italic;
  font-size: 36px; line-height: 0.98; letter-spacing: -0.01em; color: var(--mn-pane-fg);
}
.mn-sub-all {
  display: inline-flex; align-items: center; gap: 9px; cursor: pointer;
  font-size: 10.5px; letter-spacing: 0.22em; text-transform: uppercase;
  color: var(--mn-pane-accent); text-decoration: none;
  padding: 12px 0 14px; border: 0; background: none; font-family: var(--mn-sans);
}
.mn-ar { transition: transform 360ms cubic-bezier(0.16,1,0.3,1); display: flex; }
.mn-sub-all:hover .mn-ar { transform: translateX(6px); }

.mn-sub-list {
  display: flex; flex-direction: column;
  border-top: 1px solid var(--mn-pane-hair);
}
.mn-sub-item {
  background: none; border: 0; text-align: left; cursor: pointer;
  padding: 11px 0; border-bottom: 1px solid var(--mn-pane-hair);
  font-size: 13px; letter-spacing: 0.05em; color: var(--mn-pane-fg);
  display: flex; align-items: center; justify-content: space-between;
  font-family: var(--mn-sans);
  transition: color 240ms cubic-bezier(0.25,1,0.5,1),
              padding-left 360ms cubic-bezier(0.16,1,0.3,1);
}
.mn-sub-item:hover { color: var(--mn-pane-accent); padding-left: 8px; }
.mn-sub-chev {
  color: var(--mn-pane-muted); display: flex;
  transition: transform 300ms cubic-bezier(0.16,1,0.3,1), color 240ms;
}
.mn-sub-item:hover .mn-sub-chev { color: var(--mn-pane-accent); transform: translateX(3px); }

.mn-sub-section { margin-top: 26px; }
.mn-sub-section-label {
  font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase;
  color: var(--mn-pane-muted); margin-bottom: 14px;
}
.mn-sub-highlights { display: flex; flex-direction: column; gap: 10px; }
.mn-sub-highlight {
  background: none; border: 0; text-align: left; padding: 0; cursor: pointer;
  font-family: var(--mn-serif); font-style: italic; font-weight: 300; font-size: 18px;
  color: var(--mn-pane-fg); width: fit-content; line-height: 1.1;
  transition: color 240ms cubic-bezier(0.25,1,0.5,1);
}
.mn-sub-highlight::after {
  content: ''; display: block; height: 1px; background: var(--mn-pane-accent);
  transform: scaleX(0); transform-origin: left;
  transition: transform 380ms cubic-bezier(0.16,1,0.3,1); margin-top: 3px;
}
.mn-sub-highlight:hover { color: var(--mn-pane-accent); }
.mn-sub-highlight:hover::after { transform: scaleX(1); }

/* ── Column 3 · editorial ── */
.mn-editorial {
  position: relative; background: var(--mn-pane-bg);
  padding: 24px; min-width: 0; overflow: hidden;
}
.mn-editorial::before, .mn-editorial::after {
  content: ''; position: absolute; width: 14px; height: 14px;
  z-index: 4; pointer-events: none;
  border: 0 solid var(--mn-pane-muted); opacity: 0.5;
}
.mn-editorial::before { top: 16px; right: 16px; border-top-width: 1px; border-right-width: 1px; }
.mn-editorial::after  { bottom: 16px; left: 16px; border-bottom-width: 1px; border-left-width: 1px; }

.mn-tiles {
  height: 100%; display: grid; gap: 10px;
  grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr;
}
.mn-tile {
  position: relative; overflow: hidden;
  background: var(--mn-tile-fallback); cursor: pointer;
  opacity: 0; transform: translateY(20px);
  animation: mn-tileIn 820ms cubic-bezier(0.16,1,0.3,1) forwards;
}
.mn-tile:nth-child(1) { animation-delay: 120ms; }
.mn-tile:nth-child(2) { animation-delay: 200ms; }
.mn-tile:nth-child(3) { animation-delay: 280ms; }
.mn-tile:nth-child(4) { animation-delay: 360ms; }
@keyframes mn-tileIn { to { opacity: 1; transform: translateY(0); } }

.mn-tile-media { position: absolute; inset: 0; }
.mn-tile-media img {
  width: 100%; height: 100%; object-fit: cover; display: block;
  transition: transform 1300ms cubic-bezier(0.16,1,0.3,1);
}
.mn-tile:hover .mn-tile-media img { transform: scale(1.06); }
.mn-tile::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(180deg,rgba(10,10,10,0) 42%,rgba(10,10,10,0.05) 60%,rgba(10,10,10,0.50) 100%);
}
.mn-tile-cap { position: absolute; left: 18px; bottom: 18px; right: 18px; z-index: 2; color: #fff; }
.mn-kicker { font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase; opacity: 0.92; margin-bottom: 6px; }
.mn-name {
  font-family: var(--mn-serif); font-weight: 300; font-size: 22px;
  line-height: 1.04; display: inline-block; position: relative;
}
.mn-name::after {
  content: ''; position: absolute; left: 0; right: 0; bottom: -3px;
  height: 1px; background: #fff; transform: scaleX(0); transform-origin: left;
  transition: transform 460ms cubic-bezier(0.16,1,0.3,1);
}
.mn-tile:hover .mn-name::after { transform: scaleX(1); }

/* Ken Burns */
.mn-kb { width: 100%; height: 100%; }
.mn-kb img {
  animation: mn-kenburns 24s cubic-bezier(0.25,1,0.5,1) infinite alternate;
  transform-origin: 60% 40%;
}
.mn-tile[data-paused="true"] .mn-kb img { animation-play-state: paused; }
@keyframes mn-kenburns {
  0%   { transform: scale(1.0)  translate(0,0); }
  100% { transform: scale(1.15) translate(-2.5%,-2%); }
}
.mn-video-ctl {
  position: absolute; left: 18px; bottom: 18px; z-index: 3;
  width: 34px; height: 34px; cursor: pointer;
  background: rgba(255,255,255,0.14); backdrop-filter: blur(6px);
  border: 1px solid rgba(255,255,255,0.5); border-radius: 0;
  display: grid; place-items: center; color: #fff;
  transition: background 280ms cubic-bezier(0.25,1,0.5,1);
}
.mn-video-ctl:hover { background: rgba(255,255,255,0.3); }
.mn-video-tag {
  position: absolute; right: 14px; top: 14px; z-index: 3;
  font-size: 8px; letter-spacing: 0.28em; text-transform: uppercase;
  color: #fff; display: flex; align-items: center; gap: 6px; opacity: 0.92;
  font-family: var(--mn-sans);
}
.mn-rec { width: 6px; height: 6px; border-radius: 9999px; background: #fff; flex-shrink: 0; }
.mn-tile[data-paused="true"] .mn-video-tag .mn-rec { background: rgba(255,255,255,0.4); }
.mn-is-video .mn-tile-cap { left: 60px; }

/* ── Laptop / medium desktop (hide editorial, keep 2 columns) ── */
@media (max-width: 1100px) {
  .mn-mega { grid-template-columns: 260px 1fr; width: 92vw; }
  .mn-editorial { display: none; }
  .mn-sub { border-right: none; }
}

/* ── Tablet / phone — full-width drill-down ── */
@media (max-width: 768px) {
  .mn-mega {
    /* keep position: fixed from base — do NOT switch to relative */
    grid-template-columns: 1fr;
    width: 100vw;
    max-width: 100vw;
  }
  /* Rail and sub are stacked, full-panel slides */
  .mn-rail {
    position: absolute; inset: 0; z-index: 1;
    transition: transform 420ms cubic-bezier(0.16,1,0.3,1);
  }
  .mn-mega[data-panel="sub"] .mn-rail { transform: translateX(-100%); }

  .mn-sub {
    position: absolute; inset: 0; z-index: 2;
    transform: translateX(100%);
    transition: transform 420ms cubic-bezier(0.16,1,0.3,1);
    border-right: none;
  }
  .mn-mega[data-panel="sub"] .mn-sub { transform: translateX(0); }

  .mn-sub-mobile-head { display: flex; }

  /* Tighter mobile spacing */
  .mn-rail-head  { height: 64px; padding: 0 24px; }
  .mn-mark       { font-size: 24px; }
  .mn-rail-nav   { padding: 6px 0; }
  .mn-rail-link  { height: 56px; padding: 0 24px; }
  .mn-rail-link::after { left: 24px; right: 24px; }
  .mn-rail-foot  { padding: 16px 24px 20px; }
  .mn-sub-body   { padding: 22px 24px 22px; }
  .mn-sub-title  { font-size: 32px; }

  /* Hide active-on-hover state — touch devices set active on tap only */
  .mn-rail-link:hover .mn-rl-label { letter-spacing: 0.24em; transform: none; }
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .mn-mega, .mn-scrim, .mn-rail, .mn-sub { transition-duration: 1ms !important; }
  .mn-tile      { animation: none !important; opacity: 1 !important; transform: none !important; }
  .mn-fade-enter { animation: none !important; }
  .mn-kb img    { animation: none !important; }
}
`

/* ─── Component ──────────────────────────────────────────────── */
interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

function pad(n: number) { return String(n).padStart(2, '0') }

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [mounted,      setMounted]     = useState(false)
  const [activeKey,    setActiveKey]   = useState('women')
  const [tileKey,      setTileKey]     = useState(0)
  const [mobilePanel,  setMobilePanel] = useState<'rail' | 'sub'>('rail')
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { setMounted(true) }, [])

  // On open: re-trigger tile animations, focus close button, reset mobile panel
  useEffect(() => {
    if (isOpen) {
      setTileKey(k => k + 1)
      setMobilePanel('rail')
      setTimeout(() => closeRef.current?.focus(), 80)
    }
  }, [isOpen])

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  const handleSetActive = (key: string) => {
    setActiveKey(key)
    setTileKey(k => k + 1)
    // On mobile, navigate to sub-nav panel
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setMobilePanel('sub')
    }
  }

  if (!mounted) return null

  const active = CATEGORIES.find(c => c.key === activeKey) ?? CATEGORIES[0]

  const nav = (
    <>
      <div
        className={`mn-scrim${isOpen ? ' mn-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <nav
        className="mn-mega"
        data-open={isOpen ? 'true' : 'false'}
        data-panel={mobilePanel}
        aria-label="Hauptnavigation"
        role="dialog"
        aria-modal="true"
      >
        {/* ── Column 1 · ink rail ── */}
        <div className="mn-rail">
          <div className="mn-rail-head">
            <span className="mn-mark">Enunas</span>
            <button ref={closeRef} className="mn-rail-close" onClick={onClose}>
              <IClose /> Schließen
            </button>
          </div>

          <div className="mn-rail-nav">
            {CATEGORIES.map((c, i) => (
              <button
                key={c.key}
                className="mn-rail-link"
                data-tone={c.tone}
                aria-current={activeKey === c.key ? 'true' : 'false'}
                onMouseEnter={() => handleSetActive(c.key)}
                onFocus={() => handleSetActive(c.key)}
                onClick={() => handleSetActive(c.key)}
              >
                <span className="mn-idx">{pad(i + 1)}</span>
                <span className="mn-rl-label">{c.label}</span>
                <span className="mn-chev-r"><IChevR /></span>
              </button>
            ))}
          </div>

          <div className="mn-rail-foot">
            <div className="mn-foot-row">
              <a href="#">Anmelden</a>
              <a href="#">Hilfe &amp; Kontakt</a>
            </div>
            <a className="mn-locale" href="#">DE / EUR</a>
          </div>
        </div>

        {/* ── Column 2 · cream sub-nav ── */}
        <div className="mn-sub">
          {/* Mobile header (back + close) */}
          <div className="mn-sub-mobile-head">
            <button className="mn-mobile-back" onClick={() => setMobilePanel('rail')}>
              <IChevL /> {active.label}
            </button>
            <button className="mn-sub-mobile-close" onClick={onClose}>
              <IClose /> Schließen
            </button>
          </div>

          <div className="mn-sub-body" key={`sub-${activeKey}`}>
            <div className="mn-fade-enter">
              <div className="mn-sub-head">
                <div className="mn-sub-kicker">{active.kicker}</div>
                <div className="mn-sub-title">{active.title}</div>
              </div>

              <a className="mn-sub-all" href={active.route}>
                Alle ansehen <span className="mn-ar"><IArrow /></span>
              </a>

              <div className="mn-sub-list">
                {active.sub.map((s, i) => (
                  <button
                    key={i}
                    className="mn-sub-item"
                    onClick={() => s.href && (window.location.href = s.href)}
                  >
                    {s.label}
                    {s.deep && <span className="mn-sub-chev"><IChevR /></span>}
                  </button>
                ))}
              </div>

              <div className="mn-sub-section">
                <div className="mn-sub-section-label">Highlights</div>
                <div className="mn-sub-highlights">
                  {active.highlights.map((h, i) => (
                    <button key={i} className="mn-sub-highlight">{h.label}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Column 3 · editorial ── */}
        <div className="mn-editorial">
          <div className="mn-tiles" key={tileKey}>
            {active.tiles.map((tile, i) => (
              <Tile tile={tile} key={`${active.key}-${i}`} />
            ))}
          </div>
        </div>
      </nav>
    </>
  )

  return (
    <>
      <style>{MEGA_CSS}</style>
      {createPortal(nav, document.body)}
    </>
  )
}
