/* global React, ReactDOM */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "role": "admin",
  "collapsed": false,
  "density": "comfortable",
  "cormorantAccents": true
}/*EDITMODE-END*/;

// ─── Nav definitions ────────────────────────────────────────────────────
const ADMIN_NAV = [
  { id: "overview", label: "Overview", icon: "Dashboard", group: "Marketplace" },
  { id: "orders",   label: "Orders", icon: "Orders", group: "Marketplace", badge: "12", badgeTone: "purple" },
  { id: "products", label: "Catalogue", icon: "Box", group: "Marketplace" },
  { id: "brands",   label: "Brand partners", icon: "Partners", group: "Marketplace", badge: "1" },
  { id: "customers",label: "Customers", icon: "Users", group: "Marketplace" },
  { id: "settings", label: "Settings & finance", icon: "Settings", group: "Platform" },
];

const PARTNER_NAV = [
  { id: "overview", label: "Overview", icon: "Dashboard", group: "Studio" },
  { id: "orders",   label: "Orders", icon: "Orders", group: "Studio", badge: "2", badgeTone: "purple" },
  { id: "products", label: "Products", icon: "Box", group: "Studio" },
  { id: "analytics",label: "Analytics", icon: "Chart", group: "Studio" },
  { id: "returns",  label: "Returns", icon: "Return", group: "Studio", badge: "1" },
  { id: "payouts",  label: "Payouts", icon: "Wallet", group: "Finance" },
  { id: "profile",  label: "Brand profile", icon: "Profile", group: "Finance" },
];

const SCREEN_LABELS = {
  admin: {
    overview: "Admin · Overview", orders: "Admin · Orders", products: "Admin · Catalogue",
    brands: "Admin · Brand partners", customers: "Admin · Customers", settings: "Admin · Settings & finance",
  },
  partner: {
    overview: "Partner · Overview", orders: "Partner · Orders & fulfilment",
    products: "Partner · Products", analytics: "Partner · Analytics",
    returns: "Partner · Returns", payouts: "Partner · Payouts",
    profile: "Partner · Brand profile",
  },
};

// ─── App ────────────────────────────────────────────────────────────────
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [page, setPage] = React.useState("overview");

  // Reset to overview when switching roles
  const setRole = (newRole) => {
    setTweak("role", newRole);
    setPage("overview");
  };

  const isAdmin = t.role === "admin";
  const nav = isAdmin ? ADMIN_NAV : PARTNER_NAV;

  const view = (() => {
    if (isAdmin) {
      switch (page) {
        case "overview":  return <AdminOverview />;
        case "orders":    return <AdminOrders />;
        case "products":  return <AdminProducts />;
        case "brands":    return <AdminBrands />;
        case "customers": return <AdminCustomers />;
        case "settings":  return <AdminSettings />;
        default: return <AdminOverview />;
      }
    } else {
      switch (page) {
        case "overview":  return <PartnerOverview />;
        case "orders":    return <PartnerOrders />;
        case "products":  return <PartnerProducts />;
        case "analytics": return <PartnerAnalytics />;
        case "returns":   return <PartnerReturns />;
        case "payouts":   return <PartnerPayouts />;
        case "profile":   return <PartnerProfile />;
        default: return <PartnerOverview />;
      }
    }
  })();

  const screenLabel = SCREEN_LABELS[isAdmin ? "admin" : "partner"][page];

  return (
    <div
      className="app"
      data-collapsed={t.collapsed}
      data-density={t.density}
      data-screen-label={screenLabel}
      style={!t.cormorantAccents ? { "--font-display": "var(--font-body)" } : {}}
    >
      <Sidebar
        role={isAdmin ? "admin" : "partner"}
        items={nav}
        current={page}
        onNavigate={setPage}
      />
      <main>
        <Topbar
          role={isAdmin ? "admin" : "partner"}
          collapsed={t.collapsed}
          onToggleSidebar={() => setTweak("collapsed", !t.collapsed)}
          onSwitchRole={() => setRole(isAdmin ? "partner" : "admin")}
          searchPlaceholder={isAdmin ? "Search orders, products, brands, customers…" : "Search your orders, products…"}
        />
        {view}
      </main>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Role">
          <TweakRadio
            label="View as"
            value={t.role}
            onChange={setRole}
            options={[
              { value: "admin", label: "Admin" },
              { value: "partner", label: "Partner" },
            ]}
          />
        </TweakSection>

        <TweakSection label="Layout">
          <TweakToggle
            label="Collapse sidebar"
            value={t.collapsed}
            onChange={(v) => setTweak("collapsed", v)}
          />
          <TweakRadio
            label="Density"
            value={t.density}
            onChange={(v) => setTweak("density", v)}
            options={[
              { value: "comfortable", label: "Comfort" },
              { value: "compact", label: "Compact" },
            ]}
          />
        </TweakSection>

        <TweakSection label="Voice">
          <TweakToggle
            label="Cormorant accents"
            value={t.cormorantAccents}
            onChange={(v) => setTweak("cormorantAccents", v)}
          />
          <div style={{ fontSize: 11, color: "var(--enunas-gray-medium)", marginTop: 4, lineHeight: 1.4 }}>
            When off, page titles and KPI numbers fall back to League Spartan — fully utilitarian.
          </div>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
