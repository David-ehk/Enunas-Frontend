/* global React, ReactDOM, FOOTER_COLS, useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakColor */

/* ── Payment marks · uniform 56×38 tiles, informational glyphs ── */
const Pay = {
  visa: (c) => (
    <svg width="42" height="26" viewBox="0 0 48 32"><text x="24" y="22" textAnchor="middle" fontFamily="'League Spartan',sans-serif" fontSize="14" fontWeight="800" fontStyle="italic" letterSpacing="1" fill={c || "#1A1F71"}>VISA</text></svg>
  ),
  mc: () => (
    <svg width="40" height="26" viewBox="0 0 48 32"><circle cx="20" cy="16" r="8.5" fill="#EB001B" /><circle cx="28" cy="16" r="8.5" fill="#F79E1B" /><path d="M24 9.3a8.5 8.5 0 0 1 0 13.4 8.5 8.5 0 0 1 0-13.4Z" fill="#FF5F00" /></svg>
  ),
  pp: () => (
    <svg width="44" height="26" viewBox="0 0 48 32"><text x="24" y="21" textAnchor="middle" fontFamily="'League Spartan',sans-serif" fontSize="11" fontWeight="800" fontStyle="italic"><tspan fill="#003087">Pay</tspan><tspan fill="#0070BA">Pal</tspan></text></svg>
  ),
  klarna: () => (
    <svg width="44" height="26" viewBox="0 0 48 32"><rect x="6" y="9" width="36" height="14" rx="3" fill="#FFB3C7" /><text x="24" y="20" textAnchor="middle" fontFamily="'League Spartan',sans-serif" fontSize="9.5" fontWeight="800" letterSpacing="-0.2" fill="#0A0A0A">Klarna.</text></svg>
  ),
  applepay: () => (
    <svg width="46" height="26" viewBox="0 0 48 32"><path d="M13.6 12.1c-.4.5-1 .8-1.6.8-.1-.6.1-1.2.5-1.6.4-.5 1-.8 1.6-.9.1.6-.1 1.2-.5 1.7Zm.5.8c-.9-.1-1.6.5-2 .5-.4 0-1-.5-1.7-.5-.9 0-1.7.5-2.1 1.3-.9 1.6-.2 3.9.7 5.2.4.6.9 1.3 1.6 1.3.6 0 .9-.4 1.7-.4.8 0 1 .4 1.7.4.7 0 1.1-.6 1.6-1.2.5-.7.7-1.4.7-1.4s-1.3-.5-1.4-2c0-1.2 1-1.8 1-1.8-.5-.8-1.4-.9-1.8-.9Z" fill="#0A0A0A"/><text x="27" y="21" textAnchor="middle" fontFamily="'League Spartan',sans-serif" fontSize="11" fontWeight="600" letterSpacing="-0.2" fill="#0A0A0A">Pay</text></svg>
  ),
  amex: () => (
    <svg width="44" height="26" viewBox="0 0 48 32"><rect x="5" y="7" width="38" height="18" rx="2" fill="#006FCF" /><text x="24" y="16.5" textAnchor="middle" fontFamily="'League Spartan',sans-serif" fontSize="6" fontWeight="800" letterSpacing="0.3" fill="#FFFFFF">AMERICAN</text><text x="24" y="22.5" textAnchor="middle" fontFamily="'League Spartan',sans-serif" fontSize="6" fontWeight="800" letterSpacing="0.3" fill="#FFFFFF">EXPRESS</text></svg>
  ),
};

const PAY_LIST = [
  { key: "visa", el: Pay.visa },
  { key: "mc", el: Pay.mc },
  { key: "amex", el: Pay.amex },
  { key: "pp", el: Pay.pp },
  { key: "klarna", el: Pay.klarna },
  { key: "applepay", el: Pay.applepay },
];

/* ── Social glyphs ── */
const Social = {
  instagram: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" /></svg>
  ),
  twitter: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.2 3h3.3l-7.2 8.2L22.7 21h-6.6l-5.2-6.8L4.9 21H1.6l7.7-8.8L1.3 3h6.8l4.7 6.2L18.2 3Zm-1.2 16h1.8L7.1 4.9H5.2L17 19Z" /></svg>
  ),
  facebook: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M14 8.5V6.9c0-.8.2-1.2 1.3-1.2H17V2.8c-.3 0-1.4-.1-2.6-.1-2.6 0-4.3 1.6-4.3 4.4v1.4H7.5V12h2.6v9h3.2v-9h2.7l.4-3.5H13.3Z" transform="translate(0.3 0)" /></svg>
  ),
  pinterest: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 0-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.9 0 1.3.6 1.3 1.4 0 .9-.5 2.2-.8 3.4-.2.9.5 1.7 1.4 1.7 1.7 0 3-1.8 3-4.4 0-2.3-1.6-3.9-4-3.9-2.7 0-4.3 2-4.3 4.1 0 .8.3 1.7.7 2.2l.1.4-.3 1.1c0 .2-.1.3-.3.2-1.2-.6-2-2.4-2-3.8 0-3.1 2.3-6 6.5-6 3.4 0 6.1 2.4 6.1 5.7 0 3.4-2.1 6.1-5.1 6.1-1 0-1.9-.5-2.2-1.1l-.6 2.3c-.2.8-.8 1.9-1.2 2.5A10 10 0 1 0 12 2Z" /></svg>
  ),
};
const SOCIAL_LIST = [
  { key: "instagram", el: Social.instagram, label: "Instagram" },
  { key: "twitter", el: Social.twitter, label: "X" },
  { key: "facebook", el: Social.facebook, label: "Facebook" },
  { key: "pinterest", el: Social.pinterest, label: "Pinterest" },
];

const Glyph = {
  lock: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="4" y="10" width="16" height="11" rx="1.5" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>,
  globe: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" /></svg>,
  copy: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="12" cy="12" r="9" /><path d="M14.8 9.3a3.5 3.5 0 1 0 0 5.4" strokeLinecap="round" /></svg>,
  up: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>,
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "surface": "purple",
  "accent": "#370E4D",
  "motion": "standard"
}/*EDITMODE-END*/;

function pad(n) { return String(n).padStart(2, "0"); }

function Footer({ t }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add("armed");
    const reveal = () => el.classList.add("in");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) reveal(); });
    }, { threshold: 0.12 });
    io.observe(el);
    // Safety net: if the observer never fires (already in view, throttled tab), reveal anyway.
    const fallback = setTimeout(reveal, 1200);
    return () => { io.disconnect(); clearTimeout(fallback); };
  }, []);

  return (
    <footer className="foot" ref={ref} data-surface={t.surface} data-motion={t.motion}
            style={{ "--accent": t.accent }}>
      <div className="foot-inner">

        {/* Colophon band */}
        <div className="foot-top">
          <div className="foot-mark reveal-item">Enunas</div>
          <div className="foot-tagline reveal-item reveal-d1">
            Der kuratierte Marktplatz<br />für Designer &amp; Streetwear
          </div>
        </div>

        {/* Columns */}
        <div className="foot-cols">
          {FOOTER_COLS.map((col, i) => (
            <nav className={`col reveal-item reveal-d${i + 1}`} key={col.title} aria-label={col.title}>
              <div className="col-head">
                <span className="col-idx">{pad(i + 1)}</span>
                <span className="col-title">{col.title}</span>
              </div>
              <div className="col-list">
                {col.links.map((l) => <a className="col-link" href="#" key={l}>{l}</a>)}
              </div>
            </nav>
          ))}

          {/* Payment column */}
          <div className="col reveal-item reveal-d4">
            <div className="col-head">
              <span className="col-idx">{pad(FOOTER_COLS.length + 1)}</span>
              <span className="col-title">Zahlungsarten</span>
            </div>
            <div className="pay-tiles">
              {PAY_LIST.map((p) => (
                <div className="pay-tile" key={p.key} title={p.key}>{p.el()}</div>
              ))}
            </div>
            <div className="pay-note"><span className="lock"><Glyph.lock /></span> SSL-verschlüsselt · Käuferschutz</div>
          </div>
        </div>

        {/* Utility row — social + locale */}
        <div className="foot-utility reveal-item reveal-d5">
          <div className="social">
            {SOCIAL_LIST.map((s) => (
              <button className="social-btn" key={s.key} aria-label={s.label}>{s.el()}</button>
            ))}
          </div>
          <button className="locale"><span className="globe"><Glyph.globe /></span> Deutschland · EUR €</button>
        </div>

        {/* Legal */}
        <div className="foot-legal">
          <div className="copy"><Glyph.copy /> Enunas 2026 — Alle Rechte vorbehalten</div>
          <button className="to-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            Nach oben <Glyph.up />
          </button>
        </div>

      </div>
    </footer>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  return (
    <React.Fragment>
      <div className="page-filler">↑ Seiteninhalt</div>
      <Footer t={t} />
      <TweaksPanel title="Tweaks">
        <TweakSection label="Oberfläche" />
        <TweakRadio label="Surface" value={t.surface} options={["purple", "ink", "cream"]} onChange={(v) => setTweak("surface", v)} />
        <TweakColor label="Akzent" value={t.accent} options={["#370E4D", "#0A0A0A", "#4A1566", "#5A1228"]} onChange={(v) => setTweak("accent", v)} />
        <TweakSection label="Bewegung" />
        <TweakRadio label="Motion" value={t.motion} options={["subtle", "standard", "expressive"]} onChange={(v) => setTweak("motion", v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
