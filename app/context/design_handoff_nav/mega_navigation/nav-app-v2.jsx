/* global React, ReactDOM, CATEGORIES, HERO_IMG, useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakColor */

const I = {
  close: (p) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...p}><path d="m6 6 12 12M18 6 6 18" /></svg>,
  chevR: (p) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m9 6 6 6-6 6" /></svg>,
  arrow: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 12h15M13 6l6 6-6 6" /></svg>,
  menu: (p) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" {...p}><path d="M4 7h16M4 12h16M4 17h16" /></svg>,
  search: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><circle cx="10.5" cy="10.5" r="7" /><path d="m21 21-4.5-4.5" strokeLinecap="round" /></svg>,
  bag: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M6 7h12l-1 13H7L6 7Z" /><path d="M9 7a3 3 0 0 1 6 0" /></svg>,
  pause: (p) => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" {...p}><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></svg>,
  play: (p) => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M7 5l12 7-12 7V5Z" /></svg>,
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "surface": "split",
  "accent": "#370E4D",
  "imagery": "grid",
  "motion": "standard"
}/*EDITMODE-END*/;

const REVEAL = { subtle: 0.55, standard: 1, expressive: 1.5 }; // motion presets handled in CSS via data-motion

function VideoTile({ tile }) {
  const [paused, setPaused] = React.useState(false);
  return (
    <div className="tile is-video" data-paused={paused}>
      <div className="tile-media kb"><img src={tile.img} alt={tile.name} /></div>
      <div className="video-tag"><span className="rec" />{paused ? "Pausiert" : "Video"}</div>
      <button className="video-ctl" onClick={(e) => { e.stopPropagation(); setPaused((p) => !p); }} aria-label={paused ? "Abspielen" : "Pausieren"}>
        {paused ? <I.play /> : <I.pause />}
      </button>
      <div className="tile-cap">
        <div className="kicker">{tile.kicker}</div>
        <span className="name">{tile.name}</span>
      </div>
    </div>
  );
}

function Tile({ tile }) {
  if (tile.video) return <VideoTile tile={tile} />;
  return (
    <div className="tile">
      <div className="tile-media"><img src={tile.img} alt={tile.name} /></div>
      <div className="tile-cap">
        <div className="kicker">{tile.kicker}</div>
        <span className="name">{tile.name}</span>
      </div>
    </div>
  );
}

function pad(n) { return String(n).padStart(2, "0"); }

function Mega({ onClose, t }) {
  const [activeKey, setActiveKey] = React.useState("women");
  const active = CATEGORIES.find((c) => c.key === activeKey) || CATEGORIES[0];
  const [revealKey, setRevealKey] = React.useState(0);

  React.useEffect(() => { setRevealKey((k) => k + 1); }, [activeKey]);

  return (
    <nav className="mega reveal" aria-label="Hauptnavigation" data-surface={t.surface} data-motion={t.motion}
         style={{ "--accent": t.accent }}>
      {/* Column 1 — ink rail */}
      <div className="rail">
        <div className="rail-head">
          <span className="mark">Enunas</span>
          <button className="rail-close" onClick={onClose}><I.close /> Schließen</button>
        </div>
        <div className="rail-nav">
          {CATEGORIES.map((c, i) => (
            <button
              key={c.key}
              className="rail-link"
              data-tone={c.tone}
              aria-current={activeKey === c.key}
              onMouseEnter={() => setActiveKey(c.key)}
              onFocus={() => setActiveKey(c.key)}
              onClick={() => setActiveKey(c.key)}
            >
              <span className="idx">{pad(i + 1)}</span>
              <span className="rl-label">{c.label}</span>
              <span className="chev"><I.chevR /></span>
            </button>
          ))}
        </div>
        <div className="rail-foot">
          <div className="foot-row">
            <a href="#">Anmelden</a>
            <a href="#">Hilfe &amp; Kontakt</a>
          </div>
          <a className="locale" href="#">DE / EUR</a>
        </div>
      </div>

      {/* Column 2 — sub-nav */}
      <div className="sub">
        <div className="sub-search">
          <I.search />
          <input placeholder="Suchen" aria-label="Suchen" />
        </div>
        <div className="sub-body" key={`sub-${revealKey}`}>
          <div className="fade-enter">
            <div className="sub-head">
              <div className="sub-kicker">{active.kicker}</div>
              <div className="sub-title">{active.title}</div>
            </div>
            <button className="sub-all">Alle ansehen <span className="ar"><I.arrow /></span></button>
            <div className="sub-list">
              {active.sub.map((s, i) => (
                <button className="sub-item" key={i}>
                  {s.label}
                  {s.deep && <span className="chev"><I.chevR /></span>}
                </button>
              ))}
            </div>
            <div className="sub-section">
              <div className="sub-section-label">Highlights</div>
              <div className="sub-highlights">
                {active.highlights.map((h, i) => (
                  <button className="sub-highlight" key={i}>{h}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Column 3 — editorial */}
      <div className="editorial">
        <div className="tiles" data-mode={t.imagery} key={`tiles-${revealKey}`}>
          {active.tiles.map((tile, i) => <Tile tile={tile} key={`${active.key}-${i}`} />)}
        </div>
      </div>
    </nav>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [open, setOpen] = React.useState(true);

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="stage" data-open={open}>
      <div className="site">
        <div className="site-hero"><img src={HERO_IMG} alt="" /></div>
        <header className="site-nav">
          <div className="grp">
            <button className="icon-btn" onClick={() => setOpen(true)}><I.menu /> Menü</button>
            <button className="icon-btn"><I.search /></button>
          </div>
          <a className="wordmark" href="#">Enunas</a>
          <div className="grp end">
            <button className="icon-btn"><I.bag /></button>
          </div>
        </header>
        <div className="site-hero-copy">
          <div className="eyebrow">Herbst 2026</div>
          <h1>Dein einzigartiger<br /><em>Marktplatz</em></h1>
        </div>
      </div>

      <div className="scrim" onClick={() => setOpen(false)} />
      <Mega onClose={() => setOpen(false)} t={t} />

      <button className="reopen" onClick={() => setOpen(true)}><I.menu /> Menü öffnen</button>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Oberfläche" />
        <TweakRadio
          label="Surface"
          value={t.surface}
          options={["split", "cream", "ink"]}
          onChange={(v) => setTweak("surface", v)}
        />
        <TweakColor
          label="Akzent"
          value={t.accent}
          options={["#370E4D", "#0A0A0A", "#4A1566", "#5A1228"]}
          onChange={(v) => setTweak("accent", v)}
        />
        <TweakSection label="Editorial" />
        <TweakRadio
          label="Imagery"
          value={t.imagery}
          options={["grid", "hero"]}
          onChange={(v) => setTweak("imagery", v)}
        />
        <TweakSection label="Bewegung" />
        <TweakRadio
          label="Motion"
          value={t.motion}
          options={["subtle", "standard", "expressive"]}
          onChange={(v) => setTweak("motion", v)}
        />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
