"use client";

import { useEffect, useRef } from "react";
import { footerLinks } from "../../constants";

/* ─────────────────────────────────────────────────────────────────
   CSS from design_handoff_footer/footer/footer.css — embedded here
   so it loads with the component regardless of hot-reload state.
   Purple surface only (ink / cream variants dropped).
───────────────────────────────────────────────────────────────── */
const css = `
.foot {
  --fg:       #FFFFFF;
  --muted:    rgba(255,255,255,0.62);
  --faint:    rgba(255,255,255,0.40);
  --hair-c:   rgba(255,255,255,0.16);
  --hair-str: rgba(255,255,255,0.42);
  --foot-bg:  #370E4D;
  --acc:      color-mix(in oklab, #370E4D 42%, #ffffff);
  --tile-bg:  #FFFFFF;
  --tile-bd:  transparent;
  --ease:     cubic-bezier(0.16, 1, 0.3, 1);
  --ease-q:   cubic-bezier(0.25, 1, 0.5, 1);
  position: relative;
  background: var(--foot-bg);
  color: var(--fg);
  padding: 92px 64px 30px;
  font-family: 'League Spartan', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.foot button, .foot a { font-family: inherit; }
.foot svg { display: block; }

.foot-inner { max-width: 1680px; margin: 0 auto; position: relative; }

.foot-inner::before, .foot-inner::after {
  content: ""; position: absolute; width: 15px; height: 15px;
  border: 0 solid var(--faint); opacity: 0.7; pointer-events: none;
}
.foot-inner::before { top: -22px; right: 0; border-top-width: 1px; border-right-width: 1px; }
.foot-inner::after  { bottom: 64px; left: 0; border-bottom-width: 1px; border-left-width: 1px; }

.foot-top {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 40px; padding-bottom: 54px;
  border-bottom: 1px solid var(--hair-c);
}
.foot-mark {
  font-family: 'Cormorant Garamond', Garamond, Georgia, serif;
  font-weight: 300; font-size: 64px; line-height: 0.9; letter-spacing: 0.01em;
}
.foot-tagline {
  text-align: right; max-width: 340px;
  font-size: 11px; letter-spacing: 0.26em; text-transform: uppercase;
  color: var(--muted); line-height: 1.9;
}

.foot-cols {
  display: grid;
  grid-template-columns: repeat(4, 1fr) 1.1fr;
  gap: 40px;
  padding: 56px 0 64px;
}
.col-head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 26px; }
.col-idx  { font-size: 10px; letter-spacing: 0.1em; color: var(--faint); font-variant-numeric: tabular-nums; }
.col-title { font-size: 12px; letter-spacing: 0.26em; text-transform: uppercase; font-weight: 500; color: var(--fg); }
.col-list  { display: flex; flex-direction: column; }
.col-link {
  position: relative; display: inline-flex; align-items: center; width: fit-content;
  padding: 8px 0; font-size: 13.5px; letter-spacing: 0.03em; color: var(--muted);
  text-decoration: none; background: none; border: 0; text-align: left;
  transition: color 260ms var(--ease-q);
}
.col-link::after {
  content: ""; position: absolute; left: 0; bottom: 6px; height: 1px; width: 100%;
  background: var(--acc); transform: scaleX(0); transform-origin: left;
  transition: transform 420ms var(--ease);
}
.col-link:hover { color: var(--fg); }
.col-link:hover::after { transform: scaleX(1); }

.pay-tiles { display: grid; grid-template-columns: repeat(2, 56px); gap: 8px; }
.pay-tile {
  width: 56px; height: 38px; display: grid; place-items: center;
  background: var(--tile-bg); border: 1px solid var(--tile-bd);
  transition: transform 320ms var(--ease);
}
.pay-tile:hover { transform: translateY(-3px); }
.pay-note {
  margin-top: 16px; font-size: 10px; letter-spacing: 0.22em;
  text-transform: uppercase; color: var(--faint);
  display: flex; align-items: center; gap: 8px;
}
.pay-note .lock { display: flex; }

.foot-utility {
  display: flex; align-items: center; justify-content: space-between;
  gap: 28px; padding: 30px 0;
  border-top: 1px solid var(--hair-c); border-bottom: 1px solid var(--hair-c);
}
.social { display: flex; gap: 10px; }
.social-btn {
  width: 42px; height: 42px; display: grid; place-items: center;
  background: none; border: 1px solid var(--hair-str); color: var(--fg); cursor: pointer;
  transition: background 280ms var(--ease-q), color 280ms var(--ease-q), border-color 280ms var(--ease-q);
}
.social-btn:hover { background: var(--fg); color: var(--foot-bg); border-color: var(--fg); }
.locale {
  display: inline-flex; align-items: center; gap: 11px;
  padding: 13px 18px; border: 1px solid var(--hair-str); color: var(--fg);
  background: none; cursor: pointer;
  font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase;
  transition: border-color 280ms var(--ease-q);
}
.locale:hover { border-color: var(--fg); }
.locale .globe { display: flex; opacity: 0.8; }

.foot-legal {
  display: flex; align-items: center; justify-content: space-between;
  gap: 24px; padding-top: 26px; flex-wrap: wrap;
}
.foot-legal .copy {
  display: flex; align-items: center; gap: 9px;
  font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--muted);
}
.foot-legal .copy svg { opacity: 0.8; }
.foot-legal .to-top {
  display: inline-flex; align-items: center; gap: 9px;
  background: none; border: 0; cursor: pointer; padding: 4px 0;
  font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--muted);
  transition: color 240ms var(--ease-q);
}
.foot-legal .to-top svg { transition: transform 320ms var(--ease); }
.foot-legal .to-top:hover { color: var(--fg); }
.foot-legal .to-top:hover svg { transform: translateY(-3px); }

.foot.armed .reveal-item { opacity: 0; transform: translateY(16px); }
.foot.armed.in .reveal-item { animation: footIn 760ms var(--ease) forwards; }
.foot.armed.in .reveal-item:nth-child(1) { animation-delay: 60ms; }
.reveal-d1 { animation-delay: 120ms !important; }
.reveal-d2 { animation-delay: 200ms !important; }
.reveal-d3 { animation-delay: 280ms !important; }
.reveal-d4 { animation-delay: 360ms !important; }
.reveal-d5 { animation-delay: 440ms !important; }
@keyframes footIn { to { opacity: 1; transform: translateY(0); } }

@media (prefers-reduced-motion: reduce) {
  .foot.armed .reveal-item { opacity: 1; transform: none; animation: none !important; }
}
@media (max-width: 1080px) {
  .foot-cols { grid-template-columns: repeat(2, 1fr); gap: 44px 32px; }
  .foot-top  { flex-direction: column; align-items: flex-start; gap: 22px; }
  .foot-tagline { text-align: left; }
}
@media (max-width: 620px) {
  .foot        { padding: 56px 24px 32px; }
  /* minmax(0,…) — without it the tracks refuse to shrink below the longest
     link label and the grid overflows the footer padding. */
  .foot-cols   { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 36px 20px; }
  .foot-mark   { font-size: 44px; }
  .foot-utility { flex-direction: column; align-items: flex-start; gap: 20px; }
  .foot-legal  { flex-direction: column; align-items: flex-start; gap: 12px; }
  .foot-legal .to-top { display: none; }
  /* Wide tracking eats the narrow 2-up columns — tighten it so the longest
     labels ("Zahlungsarten", the SSL note) keep breathing room. */
  .col-title   { letter-spacing: 0.12em; }
  .pay-note    { letter-spacing: 0.1em; }

  /* The bottom-left corner mark floats awkwardly on its own down by the
     legal bar on narrow screens — move it to sit right under the tagline
     instead, where it reads as a deliberate accent rather than stray. */
  .foot-inner::after { display: none; }
  .foot-tagline { position: relative; }
  .foot-tagline::after {
    content: "";
    position: absolute;
    bottom: -20px;
    left: 0;
    width: 15px;
    height: 15px;
    border: 0 solid var(--faint);
    border-bottom-width: 1px;
    border-left-width: 1px;
    opacity: 0.7;
    pointer-events: none;
  }
}
@media (max-width: 374px) {
  /* Two tracks can no longer hold the longest labels — stack them. */
  .foot-cols { grid-template-columns: 1fr; gap: 32px; }
}
`;

/* ── Payment marks — 56×38 tiles ─────────────────────────────── */
const PayVisa = () => (
  <svg width="42" height="26" viewBox="0 0 48 32">
    <text x="24" y="22" textAnchor="middle" fontFamily="'League Spartan',sans-serif"
      fontSize="14" fontWeight="800" fontStyle="italic" letterSpacing="1" fill="#1A1F71">VISA</text>
  </svg>
);
const PayMC = () => (
  <svg width="40" height="26" viewBox="0 0 48 32">
    <circle cx="20" cy="16" r="8.5" fill="#EB001B" />
    <circle cx="28" cy="16" r="8.5" fill="#F79E1B" />
    <path d="M24 9.3a8.5 8.5 0 0 1 0 13.4 8.5 8.5 0 0 1 0-13.4Z" fill="#FF5F00" />
  </svg>
);
const PayAmex = () => (
  <svg width="44" height="26" viewBox="0 0 48 32">
    <rect x="5" y="7" width="38" height="18" rx="2" fill="#006FCF" />
    <text x="24" y="16.5" textAnchor="middle" fontFamily="'League Spartan',sans-serif"
      fontSize="6" fontWeight="800" letterSpacing="0.3" fill="#FFFFFF">AMERICAN</text>
    <text x="24" y="22.5" textAnchor="middle" fontFamily="'League Spartan',sans-serif"
      fontSize="6" fontWeight="800" letterSpacing="0.3" fill="#FFFFFF">EXPRESS</text>
  </svg>
);
const PayPP = () => (
  <svg width="44" height="26" viewBox="0 0 48 32">
    <text x="24" y="21" textAnchor="middle" fontFamily="'League Spartan',sans-serif"
      fontSize="11" fontWeight="800" fontStyle="italic">
      <tspan fill="#003087">Pay</tspan><tspan fill="#0070BA">Pal</tspan>
    </text>
  </svg>
);
const PayKlarna = () => (
  <svg width="44" height="26" viewBox="0 0 48 32">
    <rect x="6" y="9" width="36" height="14" rx="3" fill="#FFB3C7" />
    <text x="24" y="20" textAnchor="middle" fontFamily="'League Spartan',sans-serif"
      fontSize="9.5" fontWeight="800" letterSpacing="-0.2" fill="#0A0A0A">Klarna.</text>
  </svg>
);
const PayApple = () => (
  <svg width="46" height="26" viewBox="0 0 48 32">
    <path d="M13.6 12.1c-.4.5-1 .8-1.6.8-.1-.6.1-1.2.5-1.6.4-.5 1-.8 1.6-.9.1.6-.1 1.2-.5 1.7Zm.5.8c-.9-.1-1.6.5-2 .5-.4 0-1-.5-1.7-.5-.9 0-1.7.5-2.1 1.3-.9 1.6-.2 3.9.7 5.2.4.6.9 1.3 1.6 1.3.6 0 .9-.4 1.7-.4.8 0 1 .4 1.7.4.7 0 1.1-.6 1.6-1.2.5-.7.7-1.4.7-1.4s-1.3-.5-1.4-2c0-1.2 1-1.8 1-1.8-.5-.8-1.4-.9-1.8-.9Z" fill="#0A0A0A" />
    <text x="27" y="21" textAnchor="middle" fontFamily="'League Spartan',sans-serif"
      fontSize="11" fontWeight="600" letterSpacing="-0.2" fill="#0A0A0A">Pay</text>
  </svg>
);

const PAY_LIST = [
  { key: "visa",     El: PayVisa },
  { key: "mc",       El: PayMC },
  { key: "amex",     El: PayAmex },
  { key: "pp",       El: PayPP },
  { key: "klarna",   El: PayKlarna },
  { key: "applepay", El: PayApple },
];

/* ── Social glyphs ───────────────────────────────────────────── */
const SOCIAL_LIST = [
  {
    key: "instagram",
    label: "Instagram",
    url: "https://www.instagram.com/enunas_munich/",
    Icon: () => (
      <a
        href="https://www.instagram.com/enunas_munich/"
        aria-label="Instagram"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
        </svg>
      </a>
    ),
  },
  {
    key: "tiktok",
    label: "TikTok",
    url: "https://www.tiktok.com/@enunas_munich",
    Icon: () => (
      <a
        href="https://www.tiktok.com/@enunas_munich"
        aria-label="TikTok"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      </a>
    ),
  },
  {
    key: "pinterest",
    label: "Pinterest",
    url: "/",
    Icon: () => (
      <a
        href="/"
       
        aria-label="Pinterest"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 0-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.9 0 1.3.6 1.3 1.4 0 .9-.5 2.2-.8 3.4-.2.9.5 1.7 1.4 1.7 1.7 0 3-1.8 3-4.4 0-2.3-1.6-3.9-4-3.9-2.7 0-4.3 2-4.3 4.1 0 .8.3 1.7.7 2.2l.1.4-.3 1.1c0 .2-.1.3-.3.2-1.2-.6-2-2.4-2-3.8 0-3.1 2.3-6 6.5-6 3.4 0 6.1 2.4 6.1 5.7 0 3.4-2.1 6.1-5.1 6.1-1 0-1.9-.5-2.2-1.1l-.6 2.3c-.2.8-.8 1.9-1.2 2.5A10 10 0 1 0 12 2Z" />
        </svg>
      </a>
    ),
  },
];

function pad(n: number) { return String(n).padStart(2, "0"); }

const Footer = () => {
  const footRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = footRef.current;
    if (!el) return;
    el.classList.add("armed");
    const reveal = () => el.classList.add("in");
    const io = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) reveal(); }); },
      { threshold: 0.12 }
    );
    io.observe(el);
    const fallback = setTimeout(reveal, 1200);
    return () => { io.disconnect(); clearTimeout(fallback); };
  }, []);

  return (
    <>
      <style>{css}</style>
      <footer ref={footRef} className="foot">
        <div className="foot-inner">

          {/* Colophon band */}
          <div className="foot-top">
            <div className="foot-mark reveal-item">Enunas</div>
            <div className="foot-tagline reveal-item reveal-d1">
              Der kuratierte Marktplatz<br />für Designer &amp; Streetwear
            </div>
          </div>

          {/* Column grid */}
          <div className="foot-cols">
            {footerLinks.map((col, i) => (
              <nav key={col.title} className={`reveal-item reveal-d${i + 1}`} aria-label={col.title}>
                <div className="col-head">
                  <span className="col-idx">{pad(i + 1)}</span>
                  <span className="col-title">{col.title}</span>
                </div>
                <div className="col-list">
                  {col.links.map((l) => (
                    <a key={l.name} href={l.link} className="col-link">{l.name}</a>
                  ))}
                </div>
              </nav>
            ))}

            {/* Payment column */}
            <div className={`reveal-item reveal-d${footerLinks.length + 1}`}>
              <div className="col-head">
                <span className="col-idx">{pad(footerLinks.length + 1)}</span>
                <span className="col-title">Zahlungsarten</span>
              </div>
              <div className="pay-tiles">
                {PAY_LIST.map(({ key, El }) => (
                  <div key={key} className="pay-tile" title={key}><El /></div>
                ))}
              </div>
              <div className="pay-note">
                <span className="lock">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <rect x="4" y="10" width="16" height="11" rx="1.5" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                </span>
                SSL-verschlüsselt · Käuferschutz
              </div>
            </div>
          </div>

          {/* Utility row — social + locale */}
          <div className="foot-utility reveal-item reveal-d5">
            <div className="social">
              {SOCIAL_LIST.map(({ key, label, Icon }) => (
                <button key={key} className="social-btn" aria-label={label}><Icon /></button>
              ))}
            </div>
            <button className="locale">
              <span className="globe">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
                </svg>
              </span>
              Deutschland · EUR €
            </button>
          </div>

          {/* Legal bar */}
          <div className="foot-legal">
            <div className="copy">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <circle cx="12" cy="12" r="9" />
                <path d="M14.8 9.3a3.5 3.5 0 1 0 0 5.4" strokeLinecap="round" />
              </svg>
              Enunas 2026 — Alle Rechte vorbehalten
            </div>
            <button className="to-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              Nach oben
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          </div>

        </div>
      </footer>
    </>
  );
};

export default Footer;
