/* global React, Icons */
// Brand Partner — chart-heavy views (part 1):
//   BPOverview · BPOrders · BPProducts · BPAnalytics

const eurK = (v) => `€${(v / 1000).toFixed(0)}K`;
const pctF = (v) => `${v.toFixed(1)}%`;

// ─── Overview ─────────────────────────────────────────────────────────────
const BPOverview = () => (
  <div className="page">
    <PageHeader
      eyebrow="World's End · 29 May 2026"
      title="Studio"
      italicTitle="overview."
      sub="Your month at a glance — what sold, what's owed, and what needs a hand before the DHL cut-off."
      actions={
        <>
          <button className="btn ghost"><Icons.Calendar size={14} /> May 2026</button>
          <button className="btn ghost"><Icons.External size={14} /> Storefront</button>
          <button className="btn primary"><Icons.Plus size={14} /> Add product</button>
        </>
      }
    />

    <KPIGrid>
      <KPI label="Revenue · MTD" value="€18,420" delta="+12.4% vs. Apr" deltaTone="up" spark={[8,10,9,12,14,15,18]} />
      <KPI label="Open orders" value="7" delta="2 past SLA" deltaTone="down" spark={[3,5,4,6,5,8,7]} />
      <KPI label="Inventory value" value="€26,140" delta="3 low-stock SKUs" deltaTone="down" spark={[30,29,28,27,27,26,26]} />
      <KPI label="Next payout" value="€15,228" delta="Settles Jun 5" deltaTone="up" />
      <KPI label="Return rate" value="6.8%" delta="−1.1pp vs. Apr" deltaTone="up" spark={[9.1,8.6,8.2,7.7,7.2,6.8]} />
      <KPI label="Conversion" value="3.10%" delta="+0.4pp" deltaTone="up" spark={[2.4,2.6,2.5,2.8,2.9,3.0,3.1]} />
    </KPIGrid>

    <div className="grid-2-1" style={{ marginTop: 24 }}>
      <Card
        eyebrow="Last 14 days · vs. previous period"
        title="Revenue"
        action={<Segmented value="rev" onChange={() => {}} options={[{ value: "rev", label: "Revenue" }, { value: "u", label: "Units" }]} />}
      >
        <AreaChart data={BP_REVENUE} compare={BP_REVENUE_PREV} labels={BP_DAYS} fmt={eurK} height={230} />
        <div style={{ display: "flex", gap: 18, paddingTop: 14, borderTop: "1px solid var(--enunas-gray-light)", marginTop: 8, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <i style={{ width: 14, height: 2, background: "var(--enunas-purple)" }} />
            <span style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--enunas-gray-dark)" }}>This period · €21,820</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <i style={{ width: 14, height: 0, borderTop: "1px dashed var(--enunas-gray-medium)" }} />
            <span style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--enunas-gray-medium)" }}>Previous · €16,180</span>
          </div>
        </div>
      </Card>

      <Card eyebrow="May 2026" title="Payout vs. revenue">
        <GaugeArc pct={83} label="Net payout share" sub="You keep €0.83 of every €1 in gross sales after platform fee, processing and refunds." size={210} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: "1px solid var(--enunas-gray-light)", marginTop: 8 }}>
          <div style={{ padding: "14px 0" }}>
            <div style={{ fontSize: 9.5, letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--enunas-gray-medium)" }}>Gross</div>
            <div style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 300, fontSize: 24, marginTop: 4 }}>€18,420</div>
          </div>
          <div style={{ padding: "14px 0" }}>
            <div style={{ fontSize: 9.5, letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--enunas-gray-medium)" }}>Net payout</div>
            <div style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 300, fontSize: 24, marginTop: 4, color: "var(--enunas-purple)" }}>€15,228</div>
          </div>
        </div>
      </Card>
    </div>

    <div className="grid-3" style={{ marginTop: 24 }}>
      <Card eyebrow="This month" title="Sales by category">
        <DonutMulti segments={BP_CAT_SPLIT} centerValue="€21.8K" centerLabel="Total" />
      </Card>

      <Card eyebrow="Today · DHL cut-off 17:00" title="Needs a hand" flush style={{ gridColumn: "span 2" }}>
        <ul className="feed">
          <li>
            <span className="feed-dot" data-tone="warn" />
            <span className="feed-body"><b>2 orders</b> past fulfilment SLA<br /><em>ENU-10484 · ENU-10480 — print labels now</em></span>
            <button className="btn primary sm">Ship</button>
          </li>
          <li>
            <span className="feed-dot" data-tone="error" />
            <span className="feed-body"><b>Embossed Cap, Aubergine</b> out of stock<br /><em>940 views this week · restock to recover sales</em></span>
            <button className="btn ghost sm">Restock</button>
          </li>
          <li>
            <span className="feed-dot" data-tone="purple" />
            <span className="feed-body"><b>1 return</b> inbound to your atelier<br /><em>ENU-10483 · denim jacket · arrives Thu</em></span>
            <button className="btn ghost sm">View</button>
          </li>
          <li>
            <span className="feed-dot" data-tone="success" />
            <span className="feed-body"><b>Spring Drop campaign</b> at 7.0× ROAS<br /><em>€8,420 revenue on €1,200 spend</em></span>
            <button className="btn ghost sm">Open</button>
          </li>
        </ul>
      </Card>
    </div>
  </div>
);

// ─── Orders & Fulfillment ──────────────────────────────────────────────────
const BPOrders = () => {
  const [filter, setFilter] = React.useState("toShip");
  const all = PARTNER_ORDERS.concat([
    { id: "ENU-10470", customer: "Anna W.", brand: "World's End", items: 1, total: 89, status: "preparing", date: "May 27, 14:20", payment: "Card" },
    { id: "ENU-10465", customer: "Theo K.", brand: "World's End", items: 2, total: 408, status: "shipped", date: "May 27, 11:00", payment: "Klarna" },
    { id: "ENU-10455", customer: "Nina F.", brand: "World's End", items: 1, total: 249, status: "delivered", date: "May 26, 09:12", payment: "PayPal" },
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
        eyebrow={`${all.length} active orders · DHL cut-off 17:00`}
        title="Orders"
        italicTitle="& fulfilment."
        sub="Where every parcel stands. Returns route back to your atelier — Enunas handles the customer and the refund."
        actions={
          <>
            <button className="btn ghost"><Icons.Download size={14} /> Export</button>
            <button className="btn"><Icons.Truck size={14} /> Print all labels</button>
          </>
        }
      />

      <KPIGrid>
        <KPI label="To ship today" value="7" delta="2 past SLA" deltaTone="down" />
        <KPI label="In transit" value="14" delta="On time" deltaTone="up" />
        <KPI label="Avg fulfilment" value="6.2h" delta="−0.8h vs. Apr" deltaTone="up" />
        <KPI label="On-time rate" value="94%" delta="+2pp" deltaTone="up" />
      </KPIGrid>

      <div className="grid-2-1" style={{ marginTop: 24 }}>
        <Card eyebrow="Fulfilment pipeline · this month" title="Order flow">
          <Funnel
            stages={[
              { label: "Placed", value: 96 },
              { label: "Paid", value: 94 },
              { label: "Label printed", value: 88 },
              { label: "Shipped", value: 86 },
              { label: "Delivered", value: 79 },
            ]}
            fmt={(v) => `${v} orders`}
          />
        </Card>

        <Card eyebrow="When orders come in" title="Peak hours">
          <Heatmap rows={BP_HEAT_ROWS} cols={BP_HEAT_COLS} data={BP_HEAT_DATA} fmt={(v) => `${v} orders`} />
          <div style={{ fontSize: 11, color: "var(--enunas-gray-medium)", marginTop: 14, lineHeight: 1.5 }}>
            Saturday evening is your peak. Schedule restocks and drops for Friday to catch the weekend wave.
          </div>
        </Card>
      </div>

      <div className="filterbar" style={{ marginTop: 24 }}>
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
    </div>
  );
};

// ─── Products / Inventory ───────────────────────────────────────────────────
const BPProducts = () => {
  const [view, setView] = React.useState("table");
  return (
    <div className="page">
      <PageHeader
        eyebrow="Your catalogue · 7 SKUs live"
        title="Products"
        italicTitle="& inventory."
        sub="Stock health, sell-through, and what to reorder before it's gone. The black line marks each SKU's reorder threshold."
        actions={
          <>
            <Segmented value={view} onChange={setView} options={[{ value: "table", label: "Table" }, { value: "grid", label: "Grid" }]} />
            <button className="btn ghost"><Icons.Download size={14} /> CSV import</button>
            <button className="btn primary"><Icons.Plus size={14} /> New product</button>
          </>
        }
      />

      <KPIGrid>
        <KPI label="SKUs live" value="7" delta="+1 this week" deltaTone="up" />
        <KPI label="Units in stock" value="113" delta="−14 sold this week" deltaTone="down" />
        <KPI label="Inventory value" value="€26,140" delta="At retail price" deltaTone="up" />
        <KPI label="Low / out of stock" value="3" delta="Needs reorder" deltaTone="down" />
      </KPIGrid>

      <div className="grid-2" style={{ marginTop: 24 }}>
        <Card eyebrow="Stock health · vs. reorder threshold" title="Inventory levels">
          <div style={{ marginTop: 4 }}>
            {BP_INVENTORY.map((it, i) => <InventoryBar key={i} {...it} />)}
          </div>
        </Card>

        <Card eyebrow="Last 6 months · by category" title="Revenue mix">
          <StackedBar data={BP_CAT_DATA} labels={BP_CAT_MONTHS} keys={BP_CAT_KEYS} fmt={eurK} height={220} />
          <div style={{ paddingTop: 14, borderTop: "1px solid var(--enunas-gray-light)", marginTop: 8 }}>
            <StackLegend keys={BP_CAT_KEYS} />
          </div>
        </Card>
      </div>

      <div className="filterbar" style={{ marginTop: 24 }}>
        <Segmented value="all" onChange={() => {}} options={[
          { value: "all", label: "All", count: 7 },
          { value: "live", label: "Live", count: 5 },
          { value: "low", label: "Low stock", count: 2 },
          { value: "out", label: "Out", count: 1 },
        ]} />
        <input type="search" placeholder="Search SKU or name" />
        <div className="spacer" />
        <span className="count">{PARTNER_PRODUCTS.length} products</span>
      </div>

      {view === "table" ? (
        <Card flush>
          <table className="tbl">
            <thead>
              <tr>
                <th>Product</th>
                <th className="mono">SKU</th>
                <th>Catalogue</th>
                <th className="num">Price</th>
                <th className="num">Stock</th>
                <th>14-day trend</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {PARTNER_PRODUCTS.map((p, i) => (
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
                  <td style={{ width: 120 }}><Sparkline data={[3,4,3,5,6,5,7].map(n => n + i)} tone={i % 3 === 0 ? "down" : "up"} /></td>
                  <td><Status tone={statusTone(p.status)}>{statusLabel(p.status)}</Status></td>
                  <td><button className="btn ghost sm">Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
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
        </div>
      )}
    </div>
  );
};

// ─── Analytics ──────────────────────────────────────────────────────────────
const BPAnalytics = () => (
  <div className="page">
    <PageHeader
      eyebrow="World's End · Last 30 days"
      title="Analytics"
      italicTitle="& signals."
      sub="The full read — traffic, conversion, channels and what comes back. Built for weekly editorial planning."
      actions={
        <>
          <button className="btn ghost"><Icons.Calendar size={14} /> 30 days</button>
          <button className="btn ghost"><Icons.Download size={14} /> PDF report</button>
        </>
      }
    />

    <KPIGrid>
      <KPI label="Sessions" value="14,820" delta="+18.2%" deltaTone="up" spark={[400,420,510,480,540,610,720]} />
      <KPI label="Add to cart" value="1,820" delta="+8.4%" deltaTone="up" spark={[18,21,19,24,28,30,34]} />
      <KPI label="Conversion" value="3.10%" delta="+0.4pp" deltaTone="up" spark={[2.4,2.6,2.5,2.8,2.9,3.0,3.1]} />
      <KPI label="Avg order value" value="€218" delta="+€12" deltaTone="up" spark={[190,195,200,205,210,214,218]} />
    </KPIGrid>

    <div className="grid-2-1" style={{ marginTop: 24 }}>
      <Card eyebrow="Last 14 days · sessions vs. conversion" title="Traffic & conversion">
        <ComboChart
          bars={[280,310,290,340,360,330,380,420,400,440,460,420,500,540]}
          line={BP_CONV}
          labels={BP_DAYS}
          barFmt={(v) => Math.round(v)}
          lineFmt={(v) => `${v.toFixed(1)}%`}
        />
        <div style={{ display: "flex", gap: 18, paddingTop: 14, borderTop: "1px solid var(--enunas-gray-light)", marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <i style={{ width: 12, height: 12, background: "#E8E8E8" }} />
            <span style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--enunas-gray-dark)" }}>Sessions</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <i style={{ width: 14, height: 2, background: "var(--enunas-purple)" }} />
            <span style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--enunas-purple)" }}>Conversion %</span>
          </div>
        </div>
      </Card>

      <Card eyebrow="Storefront → purchase" title="Conversion funnel">
        <Funnel stages={BP_FUNNEL} />
      </Card>
    </div>

    <div className="grid-3" style={{ marginTop: 24 }}>
      <Card eyebrow="Last 30 days" title="Top products" style={{ gridColumn: "span 1" }}>
        <HBar items={BP_TOP_PRODUCTS} fmt={(v) => money(v)} />
      </Card>
      <Card eyebrow="Where shoppers come from" title="Channels">
        <HBar items={BP_CHANNELS} fmt={(v) => v.toLocaleString()} />
      </Card>
      <Card eyebrow="Top cities" title="Geography" flush>
        <table className="tbl">
          <thead><tr><th>City</th><th className="num">Orders</th><th className="num">Share</th></tr></thead>
          <tbody>
            {[["Berlin",184,"24%"],["München",142,"18%"],["Hamburg",118,"15%"],["Köln",86,"11%"],["Frankfurt",72,"9%"],["Stuttgart",54,"7%"]].map((c,i) => (
              <tr key={i}><td>{c[0]}</td><td className="num">{c[1]}</td><td className="num muted">{c[2]}</td></tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  </div>
);

Object.assign(window, { BPOverview, BPOrders, BPProducts, BPAnalytics, eurK, pctF });
