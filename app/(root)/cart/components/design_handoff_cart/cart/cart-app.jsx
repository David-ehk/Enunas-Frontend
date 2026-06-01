/* global React, ReactDOM, useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakColor */

const I = {
  close: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" {...p}><path d="m6 6 12 12M18 6 6 18" /></svg>,
  minus: (p) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...p}><path d="M5 12h14" /></svg>,
  plus: (p) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...p}><path d="M12 5v14M5 12h14" /></svg>,
  trash: (p) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13h10l1-13" /></svg>,
  arrow: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 12h15M13 6l6 6-6 6" /></svg>,
  lock: (p) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><rect x="4" y="10" width="16" height="11" rx="1.5" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>,
  bag: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M6 8h12l-1 12H7L6 8Z" /><path d="M9 8a3 3 0 0 1 6 0" /></svg>,
  heart: (p) => <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" {...p}><path d="M12 20s-7-4.5-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5C19 15.5 12 20 12 20Z" strokeLinejoin="round" /></svg>,
};

const SHIP_THRESHOLD = 50000; // cents — free shipping over €500
const SHIP_COST = 690;        // €6.90

const fmt = (cents) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(cents / 100);

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "surface": "cream",
  "accent": "#370E4D",
  "motion": "standard"
}/*EDITMODE-END*/;

const INITIAL_CART = [
  { id: "c1", brand: "6PM", name: "Oversized Structured Blazer", img: "img/p4.jpg", size: "S", price: 18000, qty: 1 },
  { id: "c2", brand: "Vivienne Westwood", name: "Worlds End Denim Boxer Jacket", img: "img/p1.jpg", color: "Lila", sw: "#7A5C8E", size: "S", price: 42000, qty: 1 },
];

const INITIAL_WISH = [
  { id: "w1", brand: "Maison Margiela", name: "Tabi Leather Ankle Boots", img: "img/p2.jpg", size: "39", price: 99000 },
  { id: "w2", brand: "Acne Studios", name: "Wool Cashmere Scarf", img: "img/p3.jpg", color: "Anthrazit", sw: "#3A3A3A", price: 24000 },
];

function Stepper({ qty, onDec, onInc }) {
  return (
    <div className="stepper">
      <button onClick={onDec} disabled={qty <= 1} aria-label="Menge verringern"><I.minus /></button>
      <span className="qty">{qty}</span>
      <button onClick={onInc} aria-label="Menge erhöhen"><I.plus /></button>
    </div>
  );
}

function CartItem({ it, removing, onDec, onInc, onRemove }) {
  return (
    <div className={`item${removing ? " removing" : ""}`}>
      <div className="item-media"><img src={it.img} alt={it.name} /></div>
      <div className="item-main">
        <div className="item-top">
          <div>
            <div className="item-brand">{it.brand}</div>
            <div className="item-name">{it.name}</div>
          </div>
          <button className="item-remove" onClick={onRemove} aria-label="Entfernen"><I.trash /></button>
        </div>
        <div className="item-attrs">
          {it.color && <span className="item-attr"><span className="sw" style={{ background: it.sw }} />{it.color}</span>}
          {it.size && <span className="item-attr">Größe {it.size}</span>}
        </div>
        <div className="item-bottom">
          <Stepper qty={it.qty} onDec={onDec} onInc={onInc} />
          <div className="item-price">{fmt(it.price * it.qty)}</div>
        </div>
      </div>
    </div>
  );
}

function WishItem({ it, onMove, onRemove }) {
  return (
    <div className="item wish-item">
      <div className="item-media"><img src={it.img} alt={it.name} /></div>
      <div className="item-main">
        <div className="item-top">
          <div>
            <div className="item-brand">{it.brand}</div>
            <div className="item-name">{it.name}</div>
          </div>
          <button className="item-remove" onClick={onRemove} aria-label="Entfernen"><I.trash /></button>
        </div>
        <div className="item-attrs">
          {it.color && <span className="item-attr"><span className="sw" style={{ background: it.sw }} />{it.color}</span>}
          {it.size && <span className="item-attr">Größe {it.size}</span>}
        </div>
        <div className="item-bottom">
          <button className="move-to-cart" onClick={onMove}><I.bag /> In den Warenkorb</button>
          <div className="item-price">{fmt(it.price)}</div>
        </div>
      </div>
    </div>
  );
}

function Cart({ t, onClose }) {
  const [tab, setTab] = React.useState("cart");
  const [cart, setCart] = React.useState(INITIAL_CART);
  const [wish, setWish] = React.useState(INITIAL_WISH);
  const [removing, setRemoving] = React.useState(null);

  const subtotal = cart.reduce((s, it) => s + it.price * it.qty, 0);
  const count = cart.reduce((s, it) => s + it.qty, 0);
  const freeShip = subtotal >= SHIP_THRESHOLD || subtotal === 0;
  const shipping = freeShip ? 0 : SHIP_COST;
  const remaining = Math.max(0, SHIP_THRESHOLD - subtotal);
  const pct = Math.min(100, (subtotal / SHIP_THRESHOLD) * 100);
  const total = subtotal + shipping;

  const setQty = (id, d) => setCart((c) => c.map((it) => it.id === id ? { ...it, qty: Math.max(1, it.qty + d) } : it));
  const removeItem = (id) => {
    setRemoving(id);
    setTimeout(() => { setCart((c) => c.filter((it) => it.id !== id)); setRemoving(null); }, 400);
  };
  const moveToCart = (id) => {
    const it = wish.find((w) => w.id === id);
    if (!it) return;
    setWish((w) => w.filter((x) => x.id !== id));
    setCart((c) => {
      const ex = c.find((x) => x.name === it.name);
      if (ex) return c.map((x) => x === ex ? { ...x, qty: x.qty + 1 } : x);
      return [...c, { ...it, qty: 1 }];
    });
    setTab("cart");
  };

  return (
    <aside className="cart" data-surface={t.surface} data-motion={t.motion} style={{ "--accent": t.accent }} aria-label="Warenkorb">
      <div className="cart-head">
        <div className="cart-head-top">
          <div className="cart-tabs" role="tablist">
            <button className="cart-tab" role="tab" aria-selected={tab === "cart"} onClick={() => setTab("cart")}>
              Warenkorb<span className="tab-n">{count}</span>
            </button>
            <button className="cart-tab" role="tab" aria-selected={tab === "wish"} onClick={() => setTab("wish")}>
              Wunschliste<span className="tab-n">{wish.length}</span>
            </button>
          </div>
          <button className="cart-close" onClick={onClose} aria-label="Schließen"><I.close /></button>
        </div>
      </div>

      {tab === "cart" && cart.length > 0 && (
        <div className="ship" style={{ "--pct": `${pct}%` }}>
          <div className="ship-row">
            {freeShip ? (
              <div className="ship-msg is-done">Kostenloser Versand freigeschaltet</div>
            ) : (
              <div className="ship-msg">Noch <span className="amt">{fmt(remaining)}</span> bis zum kostenlosen Versand</div>
            )}
            <div className="ship-meta">{fmt(subtotal)} / {fmt(SHIP_THRESHOLD)}</div>
          </div>
          <div className="ship-track"><div className="ship-fill" /></div>
        </div>
      )}

      <div className="cart-body">
        {tab === "cart" ? (
          cart.length > 0 ? (
            cart.map((it) => (
              <CartItem key={it.id} it={it} removing={removing === it.id}
                        onDec={() => setQty(it.id, -1)} onInc={() => setQty(it.id, 1)}
                        onRemove={() => removeItem(it.id)} />
            ))
          ) : (
            <div className="empty">
              <div className="e-mark"><I.bag width="40" height="40" /></div>
              <div className="e-title">Dein Warenkorb ist leer</div>
              <div className="e-sub">Entdecke kuratierte Designer- und Streetwear-Stücke.</div>
              <button className="e-cta" onClick={onClose}>Weiter einkaufen <span className="ar"><I.arrow /></span></button>
            </div>
          )
        ) : (
          wish.length > 0 ? (
            wish.map((it) => <WishItem key={it.id} it={it} onMove={() => moveToCart(it.id)} onRemove={() => setWish((w) => w.filter((x) => x.id !== it.id))} />)
          ) : (
            <div className="empty">
              <div className="e-mark"><I.heart /></div>
              <div className="e-title">Noch nichts gemerkt</div>
              <div className="e-sub">Tippe auf das Herz, um Lieblingsstücke hier zu sammeln.</div>
            </div>
          )
        )}
      </div>

      {tab === "cart" && cart.length > 0 && (
        <div className="summary">
          <div className="sum-lines">
            <div className="sum-row">
              <span className="lbl">Zwischensumme</span>
              <span className="val">{fmt(subtotal)}</span>
            </div>
            <div className="sum-row">
              <span className="lbl">Versand</span>
              {freeShip ? <span className="val free">Kostenlos</span> : <span className="val">{fmt(shipping)}</span>}
            </div>
          </div>
          <div className="sum-total">
            <span className="lbl">Gesamt<span className="n">{count} {count === 1 ? "Artikel" : "Artikel"}</span></span>
            <span className="val">{fmt(total)}</span>
          </div>
          <div className="sum-vat">inkl. MwSt.</div>

          <button className="checkout"><span className="lock"><I.lock /></span> Sicher zur Kasse</button>
          <button className="continue" onClick={onClose}><span>Weiter einkaufen</span></button>
          <div className="trust"><I.lock width="11" height="11" /><span>SSL-verschlüsselt · Käuferschutz</span></div>
        </div>
      )}
    </aside>
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
        <div className="site-hero"><img src="img/p4.jpg" alt="" /></div>
        <header className="site-nav">
          <span className="wordmark">Enunas</span>
          <button className="site-bag" onClick={() => setOpen(true)}><I.bag /> Warenkorb <span className="count">2</span></button>
        </header>
      </div>

      <div className="scrim" onClick={() => setOpen(false)} />
      <Cart t={t} onClose={() => setOpen(false)} />

      <button className="reopen" onClick={() => setOpen(true)}><I.bag /> Warenkorb öffnen</button>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Oberfläche" />
        <TweakRadio label="Surface" value={t.surface} options={["cream", "white", "ink"]} onChange={(v) => setTweak("surface", v)} />
        <TweakColor label="Akzent" value={t.accent} options={["#370E4D", "#0A0A0A", "#4A1566", "#5A1228"]} onChange={(v) => setTweak("accent", v)} />
        <TweakSection label="Bewegung" />
        <TweakRadio label="Motion" value={t.motion} options={["subtle", "standard", "expressive"]} onChange={(v) => setTweak("motion", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
