/* global React, ReactDOM */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "collapsed": false,
  "density": "comfortable",
  "cormorantAccents": true
}/*EDITMODE-END*/;

const BP_NAV = [
  { id: "overview",  label: "Overview", icon: "Dashboard", group: "Studio" },
  { id: "orders",    label: "Orders", icon: "Orders", group: "Studio", badge: "7", badgeTone: "purple" },
  { id: "products",  label: "Products", icon: "Box", group: "Studio" },
  { id: "analytics", label: "Analytics", icon: "Chart", group: "Studio" },
  { id: "returns",   label: "Returns", icon: "Return", group: "Studio", badge: "1" },
  { id: "marketing", label: "Marketing", icon: "Tag", group: "Growth" },
  { id: "payouts",   label: "Payouts", icon: "Wallet", group: "Finance" },
  { id: "profile",   label: "Brand profile", icon: "Profile", group: "Finance" },
];

const SCREEN_LABELS = {
  overview: "Partner · Overview", orders: "Partner · Orders & fulfilment",
  products: "Partner · Products & inventory", analytics: "Partner · Analytics",
  returns: "Partner · Returns", marketing: "Partner · Marketing",
  payouts: "Partner · Payouts", profile: "Partner · Brand profile",
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [page, setPage] = React.useState("overview");

  const view = (() => {
    switch (page) {
      case "overview":  return <BPOverview />;
      case "orders":    return <BPOrders />;
      case "products":  return <BPProducts />;
      case "analytics": return <BPAnalytics />;
      case "returns":   return <BPReturns />;
      case "marketing": return <BPMarketing />;
      case "payouts":   return <BPPayouts />;
      case "profile":   return <BPProfile />;
      default: return <BPOverview />;
    }
  })();

  return (
    <div
      className="app"
      data-collapsed={t.collapsed}
      data-density={t.density}
      data-screen-label={SCREEN_LABELS[page]}
      style={!t.cormorantAccents ? { "--font-display": "var(--font-body)" } : {}}
    >
      <Sidebar role="partner" items={BP_NAV} current={page} onNavigate={setPage} />
      <main>
        <Topbar
          role="partner"
          collapsed={t.collapsed}
          onToggleSidebar={() => setTweak("collapsed", !t.collapsed)}
          onSwitchRole={() => {}}
          searchPlaceholder="Search your orders, products, campaigns…"
        />
        {view}
      </main>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Layout">
          <TweakToggle label="Collapse sidebar" value={t.collapsed} onChange={(v) => setTweak("collapsed", v)} />
          <TweakRadio
            label="Density"
            value={t.density}
            onChange={(v) => setTweak("density", v)}
            options={[{ value: "comfortable", label: "Comfort" }, { value: "compact", label: "Compact" }]}
          />
        </TweakSection>
        <TweakSection label="Voice">
          <TweakToggle label="Cormorant accents" value={t.cormorantAccents} onChange={(v) => setTweak("cormorantAccents", v)} />
          <div style={{ fontSize: 11, color: "var(--enunas-gray-medium)", marginTop: 4, lineHeight: 1.4 }}>
            When off, titles and KPI numbers fall back to League Spartan — fully utilitarian.
          </div>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
