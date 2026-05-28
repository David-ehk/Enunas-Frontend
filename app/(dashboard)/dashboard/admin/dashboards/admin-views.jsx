/* global React, Icons */
// Admin views — 6 surfaces:
//   AdminOverview · AdminOrders · AdminProducts · AdminBrands · AdminCustomers · AdminSettings

// ─── Overview ─────────────────────────────────────────────────────────────
const AdminOverview = () => (
  <div className="page">
    <PageHeader
      eyebrow="Today · 27 May 2026"
      title="Platform"
      italicTitle="overview."
      sub="Every brand, every order, every euro. A single quiet view."
      actions={
        <>
          <button className="btn ghost"><Icons.Calendar size={14} /> Last 7 days</button>
          <button className="btn"><Icons.Download size={14} /> Export</button>
        </>
      }
    />

    <KPIGrid>
      <KPI label="GMV — Today" value="€42,180" delta="+18.2% vs. yesterday" deltaTone="up" spark={[20,22,18,26,24,30,42]} />
      <KPI label="Orders — Today" value="184" delta="+12 orders" deltaTone="up" spark={[110,118,124,132,150,162,184]} />
      <KPI label="Active Brands" value="42" delta="+1 this week" deltaTone="up" spark={[38,38,39,40,41,41,42]} />
      <KPI label="Returns Pending" value="6" delta="2 awaiting review" deltaTone="down" spark={[4,6,8,5,6,7,6]} />
    </KPIGrid>

    <div className="grid-2-1" style={{ marginTop: 24 }}>
      <Card
        eyebrow="Last 14 days"
        title="Gross merchandise volume"
        action={<Segmented value="14d" onChange={() => {}} options={[{ value: "7d", label: "7d" }, { value: "14d", label: "14d" }, { value: "30d", label: "30d" }]} />}
      >
        <BarChart
          data={[12,14,11,16,18,15,22,19,17,21,28,24,31,42]}
          labels={["14","15","16","17","18","19","20","21","22","23","24","25","26","27"]}
          maxLabel
        />
        <div style={{ display: "flex", gap: 32, paddingTop: 14, borderTop: "1px solid var(--enunas-gray-light)", marginTop: 8 }}>
          <Legend label="Period total" value="€288,420" />
          <Legend label="Avg order" value="€189" />
          <Legend label="Conversion" value="2.41%" />
          <Legend label="Refund rate" value="3.8%" />
        </div>
      </Card>

      <Card eyebrow="Live · 6 brands online" title="Activity" flush>
        <ul className="feed">
          {ACTIVITY.map((a, i) => (
            <li key={i}>
              <span className="feed-dot" data-tone={a.tone} />
              <span className="feed-body" dangerouslySetInnerHTML={{ __html: a.body }} />
              <span className="feed-time">{a.time}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>

    <div className="grid-2-1" style={{ marginTop: 24 }}>
      <Card eyebrow="Today · 12 orders" title="Recent orders" flush
        action={<button className="btn ghost sm">View all <Icons.ChevronRight size={12} /></button>}
      >
        <table className="tbl">
          <thead>
            <tr>
              <th className="mono">Order</th>
              <th>Customer</th>
              <th>Brand</th>
              <th className="num">Items</th>
              <th className="num">Total</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {ORDERS.slice(0, 7).map((o) => (
              <tr key={o.id}>
                <td className="mono">{o.id}</td>
                <td>{o.customer}</td>
                <td>{o.brand}</td>
                <td className="num">{o.items}</td>
                <td className="num">{money(o.total)}</td>
                <td><Status tone={statusTone(o.status)}>{statusLabel(o.status)}</Status></td>
                <td className="muted">{o.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card eyebrow="Month-to-date" title="Top brands">
        {BRANDS.filter(b => b.status === "active").slice(0, 5).map((b, i) => (
          <div key={b.id} style={{ display: "grid", gridTemplateColumns: "24px 1fr auto", gap: 12, alignItems: "center", padding: "12px 0", borderBottom: i < 4 ? "1px solid var(--enunas-gray-light)" : "0" }}>
            <span className="mono muted" style={{ fontSize: 11 }}>0{i + 1}</span>
            <div>
              <div style={{ fontSize: 13 }}>{b.name}</div>
              <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--enunas-gray-medium)", marginTop: 2 }}>
                {b.products} products · {b.country}
              </div>
            </div>
            <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 22, fontWeight: 300 }}>
              {money(b.gmv)}
            </div>
          </div>
        ))}
      </Card>
    </div>
  </div>
);

const Legend = ({ label, value }) => (
  <div>
    <div style={{ fontSize: 9.5, letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--enunas-gray-medium)" }}>{label}</div>
    <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 22, fontWeight: 300, marginTop: 4 }}>{value}</div>
  </div>
);

// ─── Orders ───────────────────────────────────────────────────────────────
const AdminOrders = () => {
  const [filter, setFilter] = React.useState("all");
  const counts = {
    all: ORDERS.length,
    preparing: ORDERS.filter(o => o.status === "preparing").length,
    shipped: ORDERS.filter(o => o.status === "shipped").length,
    delivered: ORDERS.filter(o => o.status === "delivered").length,
    returned: ORDERS.filter(o => o.status === "returned").length,
  };
  const rows = filter === "all" ? ORDERS : ORDERS.filter(o => o.status === filter);

  return (
    <div className="page">
      <PageHeader
        eyebrow="Last 30 days · 1,842 orders"
        title="Orders"
        italicTitle="& fulfilment."
        sub="Every transaction across all brand partners — refunds, returns and disputes included."
        actions={
          <>
            <button className="btn ghost"><Icons.Filter size={14} /> Filters</button>
            <button className="btn ghost"><Icons.Download size={14} /> Export</button>
            <button className="btn primary">Create order</button>
          </>
        }
      />

      <div className="filterbar">
        <Segmented
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All", count: counts.all },
            { value: "preparing", label: "Preparing", count: counts.preparing },
            { value: "shipped", label: "Shipped", count: counts.shipped },
            { value: "delivered", label: "Delivered", count: counts.delivered },
            { value: "returned", label: "Returned", count: counts.returned },
          ]}
        />
        <input type="search" placeholder="Order # · customer · email" />
        <select>
          <option>All brands</option>
          {BRANDS.filter(b => b.status === "active").map(b => <option key={b.id}>{b.name}</option>)}
        </select>
        <div className="spacer" />
        <span className="count">Showing {rows.length} of {ORDERS.length}</span>
      </div>

      <Card flush>
        <table className="tbl">
          <thead>
            <tr>
              <th className="mono">Order</th>
              <th>Customer</th>
              <th>Brand</th>
              <th>Payment</th>
              <th className="num">Items</th>
              <th className="num">Total</th>
              <th>Status</th>
              <th>Placed</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(o => (
              <tr key={o.id}>
                <td className="mono">{o.id}</td>
                <td>
                  <div className="cell-stack">
                    <Avatar name={o.customer} />
                    <div className="meta">
                      <span className="name">{o.customer}</span>
                      <span className="sub">{o.customer.split(" ")[0].toLowerCase()}@mail.com</span>
                    </div>
                  </div>
                </td>
                <td>{o.brand}</td>
                <td><Chip tone="ghost">{o.payment}</Chip></td>
                <td className="num">{o.items}</td>
                <td className="num">{money(o.total)}</td>
                <td><Status tone={statusTone(o.status)}>{statusLabel(o.status)}</Status></td>
                <td className="muted">{o.date}</td>
                <td><button className="btn ghost sm">Open</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// ─── Products / catalogue ────────────────────────────────────────────────
const AdminProducts = () => {
  const [view, setView] = React.useState("table");

  return (
    <div className="page">
      <PageHeader
        eyebrow="Catalogue · 248 products live"
        title="Products"
        italicTitle="& catalogue."
        sub="Every SKU across the marketplace. Approve, hide, re-tag and price-check."
        actions={
          <>
            <Segmented value={view} onChange={setView} options={[{ value: "table", label: "Table" }, { value: "grid", label: "Grid" }]} />
            <button className="btn ghost"><Icons.Filter size={14} /> Filters</button>
            <button className="btn primary"><Icons.Plus size={14} /> New product</button>
          </>
        }
      />

      <div className="filterbar">
        <input type="search" placeholder="Search SKU, name, catalogue" />
        <select><option>All catalogues</option><option>Streetwear</option><option>Experimental</option><option>Athleisure</option><option>Culture</option></select>
        <select><option>All brands</option></select>
        <select><option>All status</option><option>Live</option><option>Low stock</option><option>Out of stock</option></select>
        <div className="spacer" />
        <span className="count">8 of 248</span>
      </div>

      {view === "table" ? (
        <Card flush>
          <table className="tbl">
            <thead>
              <tr>
                <th>Product</th>
                <th className="mono">SKU</th>
                <th>Brand</th>
                <th>Catalogue</th>
                <th className="num">Price</th>
                <th className="num">Stock</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {PRODUCTS.map(p => (
                <tr key={p.sku}>
                  <td>
                    <div className="cell-stack">
                      <PhImg label={p.img} className="row-thumb" />
                      <div className="meta">
                        <span className="name">{p.name}</span>
                        <span className="sub">{p.catalogue}</span>
                      </div>
                    </div>
                  </td>
                  <td className="mono">{p.sku}</td>
                  <td>{p.brand}</td>
                  <td><Chip tone="ghost">{p.catalogue}</Chip></td>
                  <td className="num">{money(p.price)}</td>
                  <td className="num">{p.stock}</td>
                  <td><Status tone={statusTone(p.status)}>{statusLabel(p.status)}</Status></td>
                  <td><button className="btn ghost sm">Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <div className="prod-grid">
          {PRODUCTS.map(p => (
            <div className="prod-card" key={p.sku}>
              <PhImg label={p.img} className="prod-img" />
              <div className="prod-meta">{p.brand} · {p.catalogue}</div>
              <div className="prod-name">{p.name}</div>
              <div className="prod-foot">
                <span className="prod-price">{money(p.price)}</span>
                <Status tone={statusTone(p.status)}>{statusLabel(p.status)}</Status>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Brand partners ───────────────────────────────────────────────────────
const AdminBrands = () => (
  <div className="page">
    <PageHeader
      eyebrow="42 active · 1 pending review"
      title="Brand"
      italicTitle="partners."
      sub="The roster. Approve new applications, pause underperformers, see who carries the marketplace this month."
      actions={
        <>
          <button className="btn ghost"><Icons.Download size={14} /> Export roster</button>
          <button className="btn primary"><Icons.Plus size={14} /> Invite brand</button>
        </>
      }
    />

    <KPIGrid>
      <KPI label="Active brands" value="42" delta="+2 this month" deltaTone="up" />
      <KPI label="Avg products / brand" value="22" delta="+1.4 vs. Apr" deltaTone="up" />
      <KPI label="Pending approvals" value="1" delta="Nordstrand · KYC review" deltaTone="down" />
      <KPI label="Total payouts MTD" value="€61,420" delta="+8.4% MoM" deltaTone="up" />
    </KPIGrid>

    <div className="filterbar" style={{ marginTop: 24 }}>
      <Segmented value="all" onChange={() => {}} options={[
        { value: "all", label: "All", count: BRANDS.length },
        { value: "active", label: "Active", count: BRANDS.filter(b => b.status === "active").length },
        { value: "pending", label: "Pending", count: 1 },
        { value: "paused", label: "Paused", count: 1 },
      ]} />
      <input type="search" placeholder="Search brand or contact" />
      <div className="spacer" />
      <span className="count">Sorted by GMV · descending</span>
    </div>

    <Card flush>
      <table className="tbl">
        <thead>
          <tr>
            <th>Brand</th>
            <th>Country</th>
            <th className="num">Products</th>
            <th className="num">GMV (30d)</th>
            <th>Joined</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {BRANDS.sort((a, b) => b.gmv - a.gmv).map(b => (
            <tr key={b.id}>
              <td>
                <div className="cell-stack">
                  <span className="avatar-sm" style={{ fontFamily: "Cormorant Garamond, serif", fontStyle: "italic", fontSize: 14 }}>
                    {b.name[0]}
                  </span>
                  <div className="meta">
                    <span className="name">{b.name}</span>
                    <span className="sub">enunas.com/{b.slug}</span>
                  </div>
                </div>
              </td>
              <td>{b.country}</td>
              <td className="num">{b.products}</td>
              <td className="num">{money(b.gmv)}</td>
              <td className="muted">{b.joined}</td>
              <td><Status tone={statusTone(b.status)}>{statusLabel(b.status)}</Status></td>
              <td>
                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  <button className="btn ghost sm">Open</button>
                  <button className="btn ghost sm btn-icon-only"><Icons.More size={14} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </div>
);

// ─── Customers ────────────────────────────────────────────────────────────
const AdminCustomers = () => (
  <div className="page">
    <PageHeader
      eyebrow="6,418 customers · 412 new this month"
      title="Customers."
      sub="Behind every order is a person. Filter by segment, city, or last purchase to find them."
      actions={
        <>
          <button className="btn ghost"><Icons.Download size={14} /> Export</button>
          <button className="btn ghost"><Icons.Mail size={14} /> Compose</button>
        </>
      }
    />

    <KPIGrid>
      <KPI label="Total customers" value="6,418" delta="+412 this month" deltaTone="up" />
      <KPI label="Avg LTV" value="€482" delta="+€24 YoY" deltaTone="up" />
      <KPI label="Repeat rate" value="38%" delta="+1.2pp" deltaTone="up" />
      <KPI label="Active segments" value="4" delta="VIP · Loyal · New · At-risk" deltaTone="up" />
    </KPIGrid>

    <div className="filterbar" style={{ marginTop: 24 }}>
      <Segmented value="all" onChange={() => {}} options={[
        { value: "all", label: "All", count: 6418 },
        { value: "vip", label: "VIP", count: 184 },
        { value: "loyal", label: "Loyal", count: 1240 },
        { value: "new", label: "New", count: 412 },
      ]} />
      <input type="search" placeholder="Search name, email, ID" />
      <select><option>All cities</option><option>Berlin</option><option>München</option><option>Hamburg</option></select>
      <div className="spacer" />
      <span className="count">8 of 6,418</span>
    </div>

    <Card flush>
      <table className="tbl">
        <thead>
          <tr>
            <th>Customer</th>
            <th className="mono">ID</th>
            <th>City</th>
            <th className="num">Orders</th>
            <th className="num">LTV</th>
            <th>Last order</th>
            <th>Segment</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {CUSTOMERS.map(c => (
            <tr key={c.id}>
              <td>
                <div className="cell-stack">
                  <Avatar name={c.name} purple={c.segment === "VIP"} />
                  <div className="meta">
                    <span className="name">{c.name}</span>
                    <span className="sub">{c.email}</span>
                  </div>
                </div>
              </td>
              <td className="mono">{c.id}</td>
              <td>{c.city}</td>
              <td className="num">{c.orders}</td>
              <td className="num">{money(c.ltv)}</td>
              <td className="muted">{c.last}</td>
              <td><Chip tone={c.segment === "VIP" ? "purple" : c.segment === "New" ? "ghost" : ""}>{c.segment}</Chip></td>
              <td><button className="btn ghost sm">Open</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </div>
);

// ─── Settings / Finance ──────────────────────────────────────────────────
const AdminSettings = () => {
  const [tab, setTab] = React.useState("finance");
  return (
    <div className="page">
      <PageHeader
        eyebrow="Platform configuration"
        title="Settings"
        italicTitle="& finance."
        sub="Commission, payouts, taxation, integrations and the team that runs the marketplace."
      />

      <div className="filterbar">
        <Segmented value={tab} onChange={setTab} options={[
          { value: "finance", label: "Finance" },
          { value: "commerce", label: "Commerce" },
          { value: "team", label: "Team" },
          { value: "integrations", label: "Integrations" },
        ]} />
      </div>

      {tab === "finance" && (
        <div className="grid-2-1">
          <Card eyebrow="May 2026" title="Commission & payouts">
            <dl className="deflist">
              <dt>Platform commission</dt><dd>10.0% of net merchandise value <button className="btn ghost sm" style={{ marginLeft: "auto" }}>Edit</button></dd>
              <dt>Payment processing</dt><dd>Stripe · 1.4% + €0.25 per transaction</dd>
              <dt>Payout schedule</dt><dd>Monthly · 5th of each month <Chip tone="ghost">Net 30</Chip></dd>
              <dt>Hold reserve</dt><dd>5.0% rolling, 30 days <button className="btn ghost sm" style={{ marginLeft: "auto" }}>Edit</button></dd>
              <dt>Default currency</dt><dd>EUR · displays in DE, FR, IT, ES, NL</dd>
              <dt>VAT handling</dt><dd>OSS scheme · auto-collected at checkout</dd>
            </dl>
          </Card>

          <Card eyebrow="Approvals queue" title="Awaiting your review" flush>
            <ul className="feed">
              <li>
                <span className="feed-dot" data-tone="warn" />
                <span className="feed-body">
                  <b>Nordstrand</b> — brand application<br />
                  <em>KYC documents uploaded · 8 min ago</em>
                </span>
                <button className="btn ghost sm">Review</button>
              </li>
              <li>
                <span className="feed-dot" data-tone="purple" />
                <span className="feed-body">
                  <b>Refund · ENU-10483</b> — €689<br />
                  <em>Hexen Berlin · damaged in transit</em>
                </span>
                <button className="btn ghost sm">Approve</button>
              </li>
              <li>
                <span className="feed-dot" data-tone="warn" />
                <span className="feed-body">
                  <b>Catalogue tag change</b> — Volt Atelier<br />
                  <em>Streetwear → Athleisure on 3 SKUs</em>
                </span>
                <button className="btn ghost sm">Review</button>
              </li>
            </ul>
          </Card>
        </div>
      )}

      {tab === "commerce" && (
        <Card eyebrow="Marketplace rules" title="Commerce">
          <dl className="deflist">
            <dt>Shipping</dt><dd>Free within Germany over €80 · standard DHL</dd>
            <dt>Returns window</dt><dd>30 days · returns handled by Enunas, brand receives the parcel</dd>
            <dt>Stock buffer</dt><dd>Hide product when stock ≤ 1 unit</dd>
            <dt>Catalogue tags</dt><dd>Streetwear · Experimental · Athleisure · Culture · Star</dd>
            <dt>Languages</dt><dd>German (default), English</dd>
            <dt>Hero quota per brand</dt><dd>1 active hero slot · 7-day rotation</dd>
          </dl>
        </Card>
      )}

      {tab === "team" && (
        <Card eyebrow="4 admins · 2 support agents" title="Team" flush>
          <table className="tbl">
            <thead><tr><th>Member</th><th>Role</th><th>Last active</th><th>2FA</th><th></th></tr></thead>
            <tbody>
              {[
                { n: "Elena Weiss", r: "Platform Admin", a: "Just now", f: true },
                { n: "Marcus Bauer", r: "Operations", a: "2 h ago", f: true },
                { n: "Yuki Tanaka", r: "Finance", a: "Yesterday", f: true },
                { n: "Sara Klein", r: "Catalogue", a: "Yesterday", f: false },
                { n: "Felix Bach", r: "Support", a: "Just now", f: true },
                { n: "Aida Romero", r: "Support", a: "1 h ago", f: true },
              ].map((m, i) => (
                <tr key={i}>
                  <td><div className="cell-stack"><Avatar name={m.n} /><div className="meta"><span className="name">{m.n}</span><span className="sub">{m.n.split(" ")[0].toLowerCase()}@enunas.de</span></div></div></td>
                  <td><Chip tone="ghost">{m.r}</Chip></td>
                  <td className="muted">{m.a}</td>
                  <td>{m.f ? <Status tone="success">On</Status> : <Status tone="warn">Off</Status>}</td>
                  <td><button className="btn ghost sm">Manage</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === "integrations" && (
        <div className="grid-2">
          {[
            { name: "Stripe", desc: "Payments & payouts", on: true, last: "Syncing now" },
            { name: "Cloudinary", desc: "Image CDN & transformation", on: true, last: "Healthy" },
            { name: "Shipcloud", desc: "Multi-carrier labels (DHL, DPD, GLS)", on: true, last: "Healthy" },
            { name: "Klaviyo", desc: "Customer email automation", on: true, last: "Last sync 12 min ago" },
            { name: "Sendcloud", desc: "Returns portal", on: true, last: "Healthy" },
            { name: "Algolia", desc: "Search & discovery", on: false, last: "Not configured" },
          ].map(g => (
            <Card key={g.name} title={g.name} eyebrow={g.desc}
              action={<Toggle on={g.on} onChange={() => {}} />}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                <Status tone={g.on ? "success" : "muted"}>{g.last}</Status>
                <button className="btn ghost sm">Configure</button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

Object.assign(window, { AdminOverview, AdminOrders, AdminProducts, AdminBrands, AdminCustomers, AdminSettings });
