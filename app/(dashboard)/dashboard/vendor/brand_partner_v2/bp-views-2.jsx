/* global React, Icons */
// Brand Partner — chart-heavy views (part 2):
//   BPReturns · BPPayouts · BPMarketing · BPProfile

// ─── Returns ────────────────────────────────────────────────────────────────
const BPReturns = () => (
  <div className="page">
    <PageHeader
      eyebrow="May 2026 · 50 returns"
      title="Returns"
      italicTitle="& reasons."
      sub="Enunas refunds the customer — the garment travels back to your atelier. Here is what came home, and why."
      actions={<button className="btn ghost"><Icons.Download size={14} /> Export</button>}
    />

    <KPIGrid>
      <KPI label="Returns this month" value="50" delta="−6 vs. Apr" deltaTone="up" />
      <KPI label="Return rate" value="6.8%" delta="below DE avg 9.1%" deltaTone="up" spark={[9.1,8.6,8.2,7.7,7.2,6.8]} />
      <KPI label="Refunded value" value="€8,940" delta="issued by Enunas" deltaTone="down" />
      <KPI label="Restocked" value="68%" delta="34 of 50 items" deltaTone="up" />
    </KPIGrid>

    <div className="grid-2" style={{ marginTop: 24 }}>
      <Card eyebrow="Last 6 months" title="Return rate trend">
        <AreaChart data={BP_RETURN_TREND} labels={BP_RETURN_MONTHS} fmt={(v) => `${v.toFixed(0)}%`} height={210} />
        <div style={{ fontSize: 11.5, color: "var(--enunas-gray-medium)", marginTop: 12, lineHeight: 1.5 }}>
          Down 2.3pp since December. The sizing note added to the denim PDP in March is working — fit-related returns dropped fastest.
        </div>
      </Card>

      <Card eyebrow="Distribution · 50 returns" title="Why customers return" flush>
        <div style={{ padding: "8px 22px" }}>
          {RETURN_REASONS.map((r, i) => <ReasonRow key={i} {...r} total={50} />)}
        </div>
      </Card>
    </div>

    <Card eyebrow="Recent returns · inbound to your atelier" title="What's coming back" flush style={{ marginTop: 24 }}>
      <table className="tbl">
        <thead>
          <tr>
            <th className="mono">Order</th>
            <th>Product</th>
            <th>Reason</th>
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
          ].map(r => (
            <tr key={r.id}>
              <td className="mono">{r.id}</td>
              <td>{r.p}</td>
              <td><Chip tone="ghost">{r.r}</Chip></td>
              <td style={{ maxWidth: 300, fontFamily: "Cormorant Garamond, serif", fontStyle: "italic", color: "var(--enunas-gray-dark)", fontSize: 13.5 }}>"{r.n}"</td>
              <td><Status tone={r.st}>{r.s}</Status></td>
              <td><button className="btn ghost sm">Open</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </div>
);

// ─── Payouts / Finance ────────────────────────────────────────────────────
const BPPayouts = () => (
  <div className="page">
    <PageHeader
      eyebrow="Banking · DE89 ••• 4421"
      title="Payouts"
      italicTitle="& finance."
      sub="Every euro accounted for — from gross sales to the figure that lands in your account. Platform fee, processing and refunds, made plain."
      actions={
        <>
          <button className="btn ghost"><Icons.Download size={14} /> Statements</button>
          <button className="btn ghost">Update banking</button>
        </>
      }
    />

    <KPIGrid>
      <KPI label="Next payout" value="€15,228" delta="Settles Jun 5" deltaTone="up" />
      <KPI label="Gross · MTD" value="€18,420" delta="+12.4%" deltaTone="up" spark={[8,10,9,12,14,15,18]} />
      <KPI label="Effective take-home" value="82.7%" delta="after all fees" deltaTone="up" />
      <KPI label="YTD earnings" value="€77,648" delta="68% of €100K goal" deltaTone="up" spark={[10,22,38,52,64,77]} />
    </KPIGrid>

    <div className="grid-2-1" style={{ marginTop: 24 }}>
      <Card eyebrow="May 2026 · gross → net" title="Payout breakdown">
        <WaterfallChart steps={BP_WATERFALL} fmt={(v) => `€${(v / 1000).toFixed(1)}K`} height={270} />
        <div style={{ display: "flex", gap: 18, paddingTop: 14, borderTop: "1px solid var(--enunas-gray-light)", marginTop: 8, flexWrap: "wrap" }}>
          {[["Gross","var(--enunas-black)"],["Deductions","var(--enunas-error)"],["Net payout","var(--enunas-purple)"]].map(([l,c]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <i style={{ width: 10, height: 10, background: c, display: "block" }} />
              <span style={{ fontSize: 10.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--enunas-gray-dark)" }}>{l}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card eyebrow="2026 goal" title="Earnings progress">
        <GaugeArc pct={68} label="of €100K goal" sub="€77,648 earned year-to-date. On trajectory to clear the goal by early August." size={210} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: "1px solid var(--enunas-gray-light)", marginTop: 8 }}>
          <div style={{ padding: "14px 0" }}>
            <div style={{ fontSize: 9.5, letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--enunas-gray-medium)" }}>Best month</div>
            <div style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 300, fontSize: 22, marginTop: 4 }}>€22,180</div>
          </div>
          <div style={{ padding: "14px 0" }}>
            <div style={{ fontSize: 9.5, letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--enunas-gray-medium)" }}>Avg / month</div>
            <div style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 300, fontSize: 22, marginTop: 4 }}>€17,820</div>
          </div>
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

// ─── Marketing / Promotions ──────────────────────────────────────────────
const BPMarketing = () => (
  <div className="page">
    <PageHeader
      eyebrow="May 2026 · 3 active campaigns"
      title="Marketing"
      italicTitle="& promotions."
      sub="Drops, codes and the hero slot — and exactly what each one returned. Spend less where it doesn't move, more where it does."
      actions={
        <>
          <button className="btn ghost"><Icons.Tag size={14} /> New promo code</button>
          <button className="btn primary"><Icons.Plus size={14} /> New campaign</button>
        </>
      }
    />

    <KPIGrid>
      <KPI label="Campaign revenue" value="€18,616" delta="+22% vs. Apr" deltaTone="up" spark={[8,11,14,12,16,18]} />
      <KPI label="Ad spend" value="€2,000" delta="2 paid campaigns" deltaTone="down" />
      <KPI label="Blended ROAS" value="6.4×" delta="+1.1× vs. Apr" deltaTone="up" spark={[4.1,4.8,5.3,5.6,6.0,6.4]} />
      <KPI label="Promo-driven sales" value="38%" delta="of monthly revenue" deltaTone="up" />
    </KPIGrid>

    <div className="grid-2-1" style={{ marginTop: 24 }}>
      <Card eyebrow="Last 6 weeks · spend vs. revenue" title="Campaign performance">
        <ComboChart
          bars={BP_CMP_SPEND}
          line={BP_CMP_REVENUE}
          labels={BP_CMP_WEEKS}
          barFmt={(v) => `€${Math.round(v)}`}
          lineFmt={(v) => `€${(v / 1000).toFixed(1)}K`}
        />
        <div style={{ display: "flex", gap: 18, paddingTop: 14, borderTop: "1px solid var(--enunas-gray-light)", marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <i style={{ width: 12, height: 12, background: "#E8E8E8" }} />
            <span style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--enunas-gray-dark)" }}>Spend</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <i style={{ width: 14, height: 2, background: "var(--enunas-purple)" }} />
            <span style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--enunas-purple)" }}>Revenue</span>
          </div>
        </div>
      </Card>

      <Card eyebrow="Hero slot" title="Storefront feature">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <PhImg label="HERO · Worlds End Denim" style={{ aspectRatio: "16/9" }} />
          <div>
            <Status tone="purple">Live until Jun 3</Status>
            <div style={{ fontFamily: "Cormorant Garamond, serif", fontStyle: "italic", fontSize: 19, marginTop: 10, lineHeight: 1.3 }}>
              "Worlds End Denim Boxer Jacket"
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, marginTop: 14, borderTop: "1px solid var(--enunas-gray-light)" }}>
              {[["Impressions","24.1K"],["CTR","5.8%"],["Revenue","€6,846"]].map(([l,v]) => (
                <div key={l} style={{ padding: "12px 0" }}>
                  <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--enunas-gray-medium)" }}>{l}</div>
                  <div style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 300, fontSize: 20, marginTop: 4 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>

    <Card eyebrow="All campaigns" title="Campaigns" flush style={{ marginTop: 24 }}>
      <table className="tbl">
        <thead>
          <tr>
            <th className="mono">ID</th>
            <th>Campaign</th>
            <th>Channel</th>
            <th className="num">Spend</th>
            <th className="num">Revenue</th>
            <th className="num">ROAS</th>
            <th className="num">CTR</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {BP_CAMPAIGNS.map(c => (
            <tr key={c.id}>
              <td className="mono">{c.id}</td>
              <td><span style={{ fontWeight: 500 }}>{c.name}</span></td>
              <td className="muted">{c.channel}</td>
              <td className="num">{c.spend ? money(c.spend) : "—"}</td>
              <td className="num">{money(c.revenue)}</td>
              <td className="num">{c.roas ? `${c.roas.toFixed(1)}×` : <span className="muted">organic</span>}</td>
              <td className="num">{c.ctr}%</td>
              <td><Status tone={c.status === "active" ? "success" : "muted"}>{c.status === "active" ? "Active" : "Ended"}</Status></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>

    <Card eyebrow="Discount codes" title="Promo codes" flush style={{ marginTop: 16 }}>
      <table className="tbl">
        <thead>
          <tr>
            <th className="mono">Code</th>
            <th>Type</th>
            <th>Redemptions</th>
            <th className="num">Revenue</th>
            <th>Expires</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {BP_PROMOS.map(p => (
            <tr key={p.code}>
              <td className="mono"><Chip tone="dark">{p.code}</Chip></td>
              <td>{p.type}</td>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="mono" style={{ fontSize: 11.5, minWidth: 60 }}>{p.used}{p.cap ? ` / ${p.cap}` : ""}</span>
                  {p.cap && (
                    <span style={{ width: 80, height: 5, background: "var(--enunas-gray-light)", display: "block", position: "relative" }}>
                      <i style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(p.used / p.cap) * 100}%`, background: "var(--enunas-purple)", display: "block" }} />
                    </span>
                  )}
                </div>
              </td>
              <td className="num">{money(p.revenue)}</td>
              <td className="muted">{p.expires}</td>
              <td><Status tone={p.status === "active" ? "success" : "muted"}>{p.status === "active" ? "Active" : "Ended"}</Status></td>
              <td><button className="btn ghost sm">Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </div>
);

// ─── Brand Profile / Settings ─────────────────────────────────────────────
const BPProfile = () => (
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
          <PhImg label="logo" style={{ height: 168 }} />
          <div style={{ padding: 22 }}>
            <div style={{ fontSize: 9.5, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--enunas-gray-medium)" }}>Brand name</div>
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

Object.assign(window, { BPReturns, BPPayouts, BPMarketing, BPProfile });
