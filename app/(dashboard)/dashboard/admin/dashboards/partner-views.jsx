/* global React, Icons */
// Brand Partner views — 7 surfaces:
//   PartnerOverview · PartnerOrders · PartnerProducts · PartnerPayouts
//   PartnerAnalytics · PartnerReturns · PartnerProfile

// ─── Overview ─────────────────────────────────────────────────────────────
const PartnerOverview = () => (
  <div className="page">
    <PageHeader
      eyebrow="World's End · May 2026"
      title="Welcome back,"
      italicTitle="World's End."
      sub="A quiet morning. Two parcels to dispatch, one return on its way back to you, and a payout settling in nine days."
      actions={
        <>
          <button className="btn ghost"><Icons.External size={14} /> Public storefront</button>
          <button className="btn primary"><Icons.Plus size={14} /> Add product</button>
        </>
      }
    />

    <KPIGrid>
      <KPI label="Revenue · MTD" value="€18,420" delta="+12.4% vs. Apr" deltaTone="up" spark={[8,10,9,12,14,15,18]} />
      <KPI label="Units sold" value="84" delta="+11 units" deltaTone="up" spark={[40,46,52,58,64,72,84]} />
      <KPI label="Conversion" value="3.10%" delta="+0.4pp" deltaTone="up" spark={[2.4,2.6,2.5,2.8,2.9,3.0,3.1]} />
      <KPI label="Next payout" value="€15,640" delta="Settles Jun 5" deltaTone="up" />
    </KPIGrid>

    <div className="grid-2-1" style={{ marginTop: 24 }}>
      <Card
        eyebrow="Last 14 days"
        title="Revenue & units"
        action={<Segmented value="rev" onChange={() => {}} options={[{ value: "rev", label: "Revenue" }, { value: "u", label: "Units" }, { value: "conv", label: "Conv." }]} />}
      >
        <LineChart
          labels={["14","15","16","17","18","19","20","21","22","23","24","25","26","27"]}
          series={[
            { data: [820, 940, 760, 1120, 1380, 1180, 1620, 1480, 1320, 1640, 2110, 1820, 2410, 2980], compare: false },
            { data: [620, 700, 680, 880, 940, 920, 1240, 1180, 1080, 1280, 1480, 1320, 1620, 1740], compare: true },
          ]}
        />
        <div style={{ display: "flex", gap: 18, paddingTop: 14, borderTop: "1px solid var(--enunas-gray-light)", marginTop: 8, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <i style={{ width: 14, height: 2, background: "var(--enunas-purple)" }} />
            <span style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--enunas-gray-dark)" }}>This period</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <i style={{ width: 14, height: 1, background: "var(--enunas-gray-medium)", borderTop: "1px dashed" }} />
            <span style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--enunas-gray-medium)" }}>Previous</span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 32 }}>
            <Legend label="Period revenue" value="€21,820" />
            <Legend label="Avg order" value="€218" />
          </div>
        </div>
      </Card>

      <Card eyebrow="Today" title="To do" flush>
        <ul className="feed">
          <li>
            <span className="feed-dot" data-tone="warn" />
            <span className="feed-body"><b>2 orders</b> to ship by 17:00<br /><em>DHL · cut-off in 3 h 12 min</em></span>
            <button className="btn ghost sm">Open</button>
          </li>
          <li>
            <span className="feed-dot" data-tone="purple" />
            <span className="feed-body"><b>1 return</b> on its way back<br /><em>ENU-10483 · arrives Thu</em></span>
            <button className="btn ghost sm">View</button>
          </li>
          <li>
            <span className="feed-dot" data-tone="warn" />
            <span className="feed-body"><b>Worlds End Denim</b> stock at 4 units<br /><em>Below your reorder threshold</em></span>
            <button className="btn ghost sm">Stock</button>
          </li>
          <li>
            <span className="feed-dot" />
            <span className="feed-body"><b>1 customer message</b> via Support<br /><em>"Fit on the boxer jacket — runs small?"</em></span>
            <button className="btn ghost sm">Reply</button>
          </li>
          <li>
            <span className="feed-dot" data-tone="success" />
            <span className="feed-body"><b>Payout queued</b> — €15,640<br /><em>Settles to DE89 ••• 4421 on Jun 5</em></span>
          </li>
        </ul>
      </Card>
    </div>

    <div className="grid-2-1" style={{ marginTop: 24 }}>
      <Card eyebrow="Most viewed this week" title="Top products" flush>
        <table className="tbl">
          <thead><tr><th>Product</th><th className="num">Views</th><th className="num">Sold</th><th className="num">Revenue</th><th>Stock</th></tr></thead>
          <tbody>
            {[
              { n: "Drop Hoodie Vol.1", v: 4820, s: 32, r: 7968, st: "12 left", stTone: "success" },
              { n: "Worlds End Denim Boxer Jacket", v: 3640, s: 14, r: 6846, st: "4 left", stTone: "warn" },
              { n: "Volume Tee, Charcoal", v: 2410, s: 28, r: 2492, st: "41 left", stTone: "success" },
              { n: "Atelier Overcoat, Crema", v: 1820, s: 6, r: 4494, st: "6 left", stTone: "warn" },
              { n: "Embossed Cap, Aubergine", v: 940, s: 4, r: 276, st: "Out of stock", stTone: "error" },
            ].map((p, i) => (
              <tr key={i}>
                <td>
                  <div className="cell-stack">
                    <PhImg label="img" className="row-thumb" />
                    <div className="meta"><span className="name">{p.n}</span><span className="sub">Streetwear</span></div>
                  </div>
                </td>
                <td className="num">{p.v.toLocaleString()}</td>
                <td className="num">{p.s}</td>
                <td className="num">{money(p.r)}</td>
                <td><Status tone={p.stTone}>{p.st}</Status></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card eyebrow="Last 30 days" title="Where shoppers come from">
        {[
          { src: "Direct", pct: 38 },
          { src: "Organic search", pct: 24 },
          { src: "Instagram", pct: 18 },
          { src: "Newsletter", pct: 12 },
          { src: "Editorial features", pct: 8 },
        ].map((s, i) => (
          <div key={s.src} style={{ padding: "12px 0", borderBottom: i < 4 ? "1px solid var(--enunas-gray-light)" : "0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12.5 }}>{s.src}</span>
              <span className="mono" style={{ fontSize: 11.5 }}>{s.pct}%</span>
            </div>
            <div className="reason-bar"><i style={{ width: `${s.pct * 2.5}%` }} /></div>
          </div>
        ))}
      </Card>
    </div>
  </div>
);

// ─── Orders & Fulfilment ──────────────────────────────────────────────────
const PartnerOrders = () => {
  const [filter, setFilter] = React.useState("toShip");
  const all = ORDERS.filter(o => o.brand === "World's End").concat([
    { id: "ENU-10470", customer: "Anna W.", brand: "World's End", items: 1, total: 89, status: "preparing", date: "May 25, 14:20", payment: "Card" },
    { id: "ENU-10465", customer: "Theo K.", brand: "World's End", items: 2, total: 408, status: "shipped", date: "May 25, 11:00", payment: "Klarna" },
  ]);
  const buckets = {
    toShip: all.filter(o => o.status === "preparing"),
    transit: all.filter(o => o.status === "shipped"),
    delivered: all.filter(o => o.status === "delivered"),
    returned: all.filter(o => o.status === "returned"),
  };
  const rows = buckets[filter] || all;

  return (
    <div className="page">
      <PageHeader
        eyebrow={`${all.length} active · DHL cut-off 17:00`}
        title="Orders"
        italicTitle="& fulfilment."
        sub="Print labels, mark shipped, and watch your parcels travel. Returns route back to you — the platform handles the customer."
        actions={
          <>
            <button className="btn ghost"><Icons.Download size={14} /> Export</button>
            <button className="btn"><Icons.Truck size={14} /> Print all labels</button>
          </>
        }
      />

      <div className="filterbar">
        <Segmented value={filter} onChange={setFilter} options={[
          { value: "toShip", label: "To ship", count: buckets.toShip.length },
          { value: "transit", label: "In transit", count: buckets.transit.length },
          { value: "delivered", label: "Delivered", count: buckets.delivered.length },
          { value: "returned", label: "Returned", count: buckets.returned.length },
        ]} />
        <input type="search" placeholder="Order #, customer" />
        <div className="spacer" />
        <span className="count">{rows.length} orders</span>
      </div>

      <Card flush>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 32 }}><input type="checkbox" /></th>
              <th className="mono">Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th className="num">Total</th>
              <th>Status</th>
              <th>Placed</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(o => (
              <tr key={o.id}>
                <td><input type="checkbox" /></td>
                <td className="mono">{o.id}</td>
                <td>
                  <div className="cell-stack">
                    <Avatar name={o.customer} />
                    <div className="meta">
                      <span className="name">{o.customer}</span>
                      <span className="sub">Berlin · DHL Express</span>
                    </div>
                  </div>
                </td>
                <td>{o.items} × {o.items === 1 ? "item" : "items"}</td>
                <td className="num">{money(o.total)}</td>
                <td><Status tone={statusTone(o.status)}>{statusLabel(o.status)}</Status></td>
                <td className="muted">{o.date}</td>
                <td>
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    {o.status === "preparing" && <button className="btn primary sm">Print label</button>}
                    {o.status === "shipped" && <button className="btn ghost sm">Track</button>}
                    {o.status === "returned" && <button className="btn ghost sm">Return slip</button>}
                    {o.status === "delivered" && <button className="btn ghost sm">View</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {filter === "returned" && (
        <div style={{ marginTop: 16, padding: 20, border: "1px dashed rgba(10,10,10,0.18)", background: "#fff" }}>
          <div style={{ fontSize: 9.5, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--enunas-gray-medium)", marginBottom: 8 }}>
            How returns work
          </div>
          <div style={{ fontFamily: "Cormorant Garamond, serif", fontStyle: "italic", fontSize: 18, lineHeight: 1.4, color: "var(--enunas-gray-dark)", maxWidth: 720 }}>
            "Enunas handles the customer — refund, communication, the courtesy.
            The parcel travels back to you. Inspect the garment, restock or
            retire it, and tell us why."
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Products ─────────────────────────────────────────────────────────────
const PartnerProducts = () => {
  const [view, setView] = React.useState("grid");
  return (
    <div className="page">
      <PageHeader
        eyebrow="Your catalogue · 7 SKUs live"
        title="Products."
        sub="Upload your collection, hold stock, set prices. We handle the storefront."
        actions={
          <>
            <Segmented value={view} onChange={setView} options={[{ value: "grid", label: "Grid" }, { value: "table", label: "Table" }]} />
            <button className="btn ghost"><Icons.Download size={14} /> CSV import</button>
            <button className="btn primary"><Icons.Plus size={14} /> New product</button>
          </>
        }
      />

      <KPIGrid>
        <KPI label="SKUs live" value="7" delta="+1 this week" deltaTone="up" />
        <KPI label="Total stock" value="113" delta="−14 units sold" deltaTone="down" />
        <KPI label="Low stock alerts" value="3" delta="Below threshold" deltaTone="down" />
        <KPI label="Avg price" value="€333" delta="+€18 vs. last drop" deltaTone="up" />
      </KPIGrid>

      <div className="filterbar" style={{ marginTop: 24 }}>
        <Segmented value="all" onChange={() => {}} options={[
          { value: "all", label: "All", count: 7 },
          { value: "live", label: "Live", count: 5 },
          { value: "low", label: "Low stock", count: 2 },
          { value: "out", label: "Out", count: 1 },
          { value: "draft", label: "Draft", count: 0 },
        ]} />
        <input type="search" placeholder="Search SKU or name" />
        <div className="spacer" />
        <span className="count">7 of 7</span>
      </div>

      {view === "grid" ? (
        <div className="prod-grid">
          {PARTNER_PRODUCTS.map(p => (
            <div className="prod-card" key={p.sku}>
              <PhImg label={p.img} className="prod-img" />
              <div className="prod-meta">{p.catalogue} · <span className="mono">{p.sku}</span></div>
              <div className="prod-name">{p.name}</div>
              <div className="prod-foot">
                <span className="prod-price">{money(p.price)}</span>
                <Status tone={statusTone(p.status)}>{p.status === "live" ? `${p.stock} left` : statusLabel(p.status)}</Status>
              </div>
            </div>
          ))}
          <div className="prod-card" style={{ display: "grid", placeItems: "center", textAlign: "center", border: "1px dashed rgba(10,10,10,0.18)", background: "var(--enunas-off-white)" }}>
            <div>
              <Icons.Plus size={22} />
              <div style={{ marginTop: 12, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase" }}>New product</div>
              <div style={{ marginTop: 6, fontSize: 11, color: "var(--enunas-gray-medium)" }}>Drag photos or paste a Cloudinary link</div>
            </div>
          </div>
        </div>
      ) : (
        <Card flush>
          <table className="tbl">
            <thead>
              <tr>
                <th>Product</th>
                <th className="mono">SKU</th>
                <th>Catalogue</th>
                <th className="num">Price</th>
                <th className="num">Stock</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {PARTNER_PRODUCTS.map(p => (
                <tr key={p.sku}>
                  <td>
                    <div className="cell-stack">
                      <PhImg label={p.img} className="row-thumb" />
                      <div className="meta"><span className="name">{p.name}</span><span className="sub">{p.catalogue}</span></div>
                    </div>
                  </td>
                  <td className="mono">{p.sku}</td>
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
      )}
    </div>
  );
};

// ─── Payouts / Finance ────────────────────────────────────────────────────
const PartnerPayouts = () => (
  <div className="page">
    <PageHeader
      eyebrow="Banking · DE89 ••• 4421"
      title="Payouts"
      italicTitle="& statements."
      sub="The numbers behind your craft. Every payout, every fee, every refund accounted for — month by month."
      actions={
        <>
          <button className="btn ghost"><Icons.Download size={14} /> Download statements</button>
          <button className="btn ghost">Update banking</button>
        </>
      }
    />

    <div className="grid-2-1">
      <Card eyebrow="Settles Jun 5, 2026" title="Next payout">
        <div style={{ display: "flex", alignItems: "flex-end", gap: 18, marginBottom: 16 }}>
          <div style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 300, fontSize: 76, lineHeight: 1, letterSpacing: "-0.02em" }}>
            €15,640<span style={{ fontSize: 26, color: "var(--enunas-gray-medium)" }}>.<em style={{ fontStyle: "italic" }}>00</em></span>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", borderTop: "1px solid var(--enunas-gray-light)" }}>
          {[
            { l: "Gross sales", v: "€18,420" },
            { l: "Platform fee (10%)", v: "−€1,842" },
            { l: "Refunds & returns", v: "−€938" },
            { l: "Net payout", v: "€15,640" },
          ].map((b, i) => (
            <div key={i} style={{ padding: "14px 18px 14px 0", borderRight: i < 3 ? "1px solid var(--enunas-gray-light)" : "0" }}>
              <div style={{ fontSize: 9.5, letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--enunas-gray-medium)" }}>{b.l}</div>
              <div style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 300, fontSize: 22, marginTop: 6 }}>{b.v}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card eyebrow="Year to date" title="Earnings">
        <Donut pct={68} label={{
          eyebrow: "2026 goal",
          title: "€68K of €100K",
          sub: "Trajectory holds — Aug 9th projection.",
        }} />
        <div style={{ display: "flex", gap: 24, marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--enunas-gray-light)" }}>
          <Legend label="Best month" value="€22,180" />
          <Legend label="Avg / month" value="€17,820" />
        </div>
      </Card>
    </div>

    <Card eyebrow="Payout history" title="Statements" flush style={{ marginTop: 24 }}>
      <table className="tbl">
        <thead>
          <tr>
            <th className="mono">ID</th>
            <th>Period</th>
            <th className="num">Gross</th>
            <th className="num">Fee (10%)</th>
            <th className="num">Refunds</th>
            <th className="num">Net</th>
            <th>Date</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {PAYOUTS.map(p => (
            <tr key={p.id}>
              <td className="mono">{p.id}</td>
              <td>{p.period}</td>
              <td className="num">{money(p.gross)}</td>
              <td className="num muted">−{money(p.fees)}</td>
              <td className="num muted">−{money(p.refunds)}</td>
              <td className="num"><b>{money(p.net)}</b></td>
              <td className="muted">{p.date}</td>
              <td><Status tone={statusTone(p.status)}>{statusLabel(p.status)}</Status></td>
              <td><button className="btn ghost sm"><Icons.Download size={12} /> PDF</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </div>
);

// ─── Analytics ────────────────────────────────────────────────────────────
const PartnerAnalytics = () => (
  <div className="page">
    <PageHeader
      eyebrow="World's End · Last 30 days"
      title="Analytics"
      italicTitle="& signals."
      sub="What sells, who buys, where they look — and what comes back. A weekly read for editorial planning."
      actions={
        <>
          <button className="btn ghost"><Icons.Calendar size={14} /> 30 days</button>
          <button className="btn ghost"><Icons.Download size={14} /> PDF report</button>
        </>
      }
    />

    <KPIGrid>
      <KPI label="Sessions" value="14,820" delta="+18.2%" deltaTone="up" spark={[400,420,510,480,540,610,720]} />
      <KPI label="Add to cart" value="612" delta="+8.4%" deltaTone="up" spark={[18,21,19,24,28,30,34]} />
      <KPI label="Conversion" value="3.10%" delta="+0.4pp" deltaTone="up" spark={[2.4,2.6,2.5,2.8,2.9,3.0,3.1]} />
      <KPI label="Return rate" value="6.8%" delta="−1.1pp" deltaTone="up" spark={[8.2,8.0,7.6,7.4,7.2,7.0,6.8]} />
    </KPIGrid>

    <div className="grid-2-1" style={{ marginTop: 24 }}>
      <Card eyebrow="Last 30 days · per day" title="Sessions">
        <BarChart
          data={[280,310,290,340,360,330,380,420,400,440,460,420,500,540,520,560,580,540,620,640,610,680,720,700,740,760,720,800,820,840]}
          labels={["W18","","","","","","W19","","","","","","W20","","","","","","W21","","","","","","W22","","","","","W22"]}
          accentIdx={29}
          maxLabel
        />
      </Card>

      <Card eyebrow="Where they come from" title="Channels" flush>
        <table className="tbl">
          <thead><tr><th>Channel</th><th className="num">Share</th><th className="num">Sessions</th></tr></thead>
          <tbody>
            {[
              { c: "Direct", sh: 38, s: 5630 },
              { c: "Organic", sh: 24, s: 3558 },
              { c: "Instagram", sh: 18, s: 2668 },
              { c: "Newsletter", sh: 12, s: 1778 },
              { c: "Editorial", sh: 8, s: 1186 },
            ].map((c, i) => (
              <tr key={i}>
                <td>{c.c}</td>
                <td className="num">{c.sh}%</td>
                <td className="num">{c.s.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>

    <div className="grid-2-1" style={{ marginTop: 24 }}>
      <Card eyebrow="Editorial language · returned items" title="Why customers return" flush>
        <div style={{ padding: "8px 22px" }}>
          {RETURN_REASONS.map((r, i) => (
            <ReasonRow key={i} {...r} total={50} />
          ))}
        </div>
        <div className="card-foot">
          <span>Total returns this month · <b>50</b> across 7 SKUs</span>
          <button className="btn ghost sm">Open return centre <Icons.ChevronRight size={12} /></button>
        </div>
      </Card>

      <Card eyebrow="Top cities · last 30 days" title="Where customers are">
        {[
          { city: "Berlin", count: 184 },
          { city: "München", count: 142 },
          { city: "Hamburg", count: 118 },
          { city: "Köln", count: 86 },
          { city: "Frankfurt", count: 72 },
          { city: "Stuttgart", count: 54 },
          { city: "Düsseldorf", count: 41 },
        ].map((c, i) => (
          <div key={c.city} style={{ display: "grid", gridTemplateColumns: "120px 1fr 40px", alignItems: "center", padding: "10px 0", borderBottom: i < 6 ? "1px solid var(--enunas-gray-light)" : "0", gap: 12 }}>
            <span style={{ fontSize: 12 }}>{c.city}</span>
            <div className="reason-bar"><i style={{ width: `${(c.count / 184) * 100}%` }} /></div>
            <span className="mono" style={{ fontSize: 11, textAlign: "right" }}>{c.count}</span>
          </div>
        ))}
      </Card>
    </div>
  </div>
);

// ─── Returns (separate, deeper view) ──────────────────────────────────────
const PartnerReturns = () => (
  <div className="page">
    <PageHeader
      eyebrow="May 2026 · 50 returns"
      title="Returns"
      italicTitle="& reasons."
      sub="Enunas refunds the customer — the garment travels back to you. Here is what came home, and why."
      actions={
        <>
          <button className="btn ghost"><Icons.Download size={14} /> Export</button>
        </>
      }
    />

    <KPIGrid>
      <KPI label="Returns this month" value="50" delta="−6 vs. Apr" deltaTone="up" />
      <KPI label="Return rate" value="6.8%" delta="below DE average 9.1%" deltaTone="up" />
      <KPI label="Refunded value" value="€8,940" delta="Issued by Enunas" deltaTone="down" />
      <KPI label="Restocked" value="34" delta="68% returned to inventory" deltaTone="up" />
    </KPIGrid>

    <div className="grid-1-2" style={{ marginTop: 24 }}>
      <Card eyebrow="Distribution" title="By reason" flush>
        <div style={{ padding: "8px 22px" }}>
          {RETURN_REASONS.map((r, i) => (
            <ReasonRow key={i} {...r} total={50} />
          ))}
        </div>
      </Card>

      <Card eyebrow="Recent returns · 7 items" title="Inbound to you" flush>
        <table className="tbl">
          <thead>
            <tr>
              <th className="mono">Order</th>
              <th>Product</th>
              <th>Customer reason</th>
              <th>Customer note</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: "ENU-10483", p: "Worlds End Denim Boxer Jacket", r: "Fit / cut", n: "Runs small on the shoulders, like a 38 not a 40.", s: "In transit", st: "warn" },
              { id: "ENU-10478", p: "Drop Hoodie Vol.1", r: "Size too small", n: "Lovely fabric — needed an L not an M.", s: "Received", st: "success" },
              { id: "ENU-10471", p: "Drop Hoodie Vol.1", r: "Colour", n: "Listed as 'aubergine', read more grey-blue in daylight.", s: "Restocked", st: "success" },
              { id: "ENU-10468", p: "Atelier Overcoat, Crema", r: "Size too small", n: "Half a size up across the chest please.", s: "Restocked", st: "success" },
              { id: "ENU-10462", p: "Worlds End Denim Boxer Jacket", r: "Quality", n: "Loose stitch on the inside seam.", s: "Quality hold", st: "error" },
              { id: "ENU-10459", p: "Volume Tee, Charcoal", r: "Other", n: "Ordered the wrong colour by mistake.", s: "Restocked", st: "success" },
              { id: "ENU-10454", p: "Embossed Cap, Aubergine", r: "Late arrival", n: "Birthday gift — arrived two days after.", s: "Received", st: "success" },
            ].map(r => (
              <tr key={r.id}>
                <td className="mono">{r.id}</td>
                <td>{r.p}</td>
                <td><Chip tone="ghost">{r.r}</Chip></td>
                <td style={{ maxWidth: 280, fontFamily: "Cormorant Garamond, serif", fontStyle: "italic", color: "var(--enunas-gray-dark)", fontSize: 13 }}>"{r.n}"</td>
                <td><Status tone={r.st}>{r.s}</Status></td>
                <td><button className="btn ghost sm">Open</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  </div>
);

// ─── Profile / Settings ───────────────────────────────────────────────────
const PartnerProfile = () => (
  <div className="page">
    <PageHeader
      eyebrow="Brand profile"
      title="World's End"
      italicTitle="— Atelier."
      sub="How your brand looks to shoppers, and how Enunas reaches you."
    />

    <div className="grid-2">
      <Card eyebrow="Public storefront" title="Brand identity" flush>
        <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", borderBottom: "1px solid var(--enunas-gray-light)" }}>
          <PhImg label="logo" style={{ height: 160 }} />
          <div style={{ padding: 22 }}>
            <div style={{ fontSize: 9.5, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--enunas-gray-medium)" }}>BRAND NAME</div>
            <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 30, fontWeight: 300, marginTop: 6 }}>World's End</div>
            <div style={{ fontFamily: "Cormorant Garamond, serif", fontStyle: "italic", color: "var(--enunas-gray-medium)", fontSize: 14, marginTop: 6 }}>
              "Inspired by Berlin nights — the long ones, before the trams stop."
            </div>
            <div style={{ marginTop: 14, display: "flex", gap: 6 }}>
              <Chip tone="ghost">Streetwear</Chip>
              <Chip tone="ghost">Culture</Chip>
              <Chip>Editorial Pick</Chip>
            </div>
          </div>
        </div>
        <dl className="deflist" style={{ padding: "0 22px 8px" }}>
          <dt>Tagline</dt><dd>Inspired by Berlin nights <button className="btn ghost sm" style={{ marginLeft: "auto" }}><Icons.Edit size={12} /></button></dd>
          <dt>About</dt><dd>Founded 2023 by Marie Holm & Vince Rother. Atelier in Kreuzberg.</dd>
          <dt>Website</dt><dd>worlds-end.studio <Icons.External size={12} /></dd>
          <dt>Instagram</dt><dd>@worldsend.atelier · 24.3K</dd>
        </dl>
      </Card>

      <Card eyebrow="How we contact you" title="Operations" flush>
        <dl className="deflist" style={{ padding: "0 22px 8px" }}>
          <dt>Primary contact</dt><dd>Marie Holm <span className="muted">— marie@worlds-end.studio</span></dd>
          <dt>Order alerts</dt><dd>SMS · DE +49 ••• 8821 <span style={{ marginLeft: "auto" }}><Toggle on={true} onChange={() => {}} /></span></dd>
          <dt>Weekly digest</dt><dd>Mondays · 09:00 CET <span style={{ marginLeft: "auto" }}><Toggle on={true} onChange={() => {}} /></span></dd>
          <dt>Banking</dt><dd>Berliner Volksbank · DE89 ••• 4421</dd>
          <dt>Return address</dt><dd>Atelier Workshop · Skalitzer Str. 84 · 10997 Berlin</dd>
          <dt>VAT ID</dt><dd className="mono">DE 312 884 901</dd>
          <dt>Carrier preference</dt><dd>DHL Express (default) · DPD (overflow)</dd>
        </dl>
      </Card>
    </div>

    <div className="grid-2" style={{ marginTop: 16 }}>
      <Card eyebrow="Catalogue presence" title="Visibility">
        <dl className="deflist">
          <dt>Hero slot</dt><dd>Active until Jun 3 · "Worlds End Denim" <Chip tone="purple">Live</Chip></dd>
          <dt>Catalogue tags</dt><dd>Streetwear · Culture · Editorial</dd>
          <dt>Languages</dt><dd>DE (primary), EN</dd>
          <dt>Regions</dt><dd>EU · UK · CH</dd>
        </dl>
      </Card>

      <Card eyebrow="Danger zone" title="Account">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 500 }}>Pause brand</div>
              <div style={{ fontSize: 11.5, color: "var(--enunas-gray-medium)", marginTop: 4, maxWidth: 360 }}>Hide all products from the storefront. Existing orders continue.</div>
            </div>
            <button className="btn ghost">Pause</button>
          </div>
          <hr className="hr" />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 500 }}>Leave Enunas</div>
              <div style={{ fontSize: 11.5, color: "var(--enunas-gray-medium)", marginTop: 4, maxWidth: 360 }}>Final payout settles 60 days after departure. We'll be sorry to see you go.</div>
            </div>
            <button className="btn danger">Request offboarding</button>
          </div>
        </div>
      </Card>
    </div>
  </div>
);

Object.assign(window, {
  PartnerOverview, PartnerOrders, PartnerProducts, PartnerPayouts,
  PartnerAnalytics, PartnerReturns, PartnerProfile,
});
