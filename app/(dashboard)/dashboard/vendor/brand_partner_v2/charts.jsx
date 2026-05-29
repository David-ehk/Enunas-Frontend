/* global React */
// Richer chart vocabulary for the Brand Partner dashboard.
// All flat, single purple accent against gray rests, NO gradients.
// SVG-based, no external library. Each chart is responsive via viewBox.

const PURPLE = "var(--enunas-purple)";
const PURPLE_FILL = "rgba(55, 14, 77, 0.10)";
const REST = "#E8E8E8";
const GRID = "var(--enunas-gray-light)";
const TEXT = "var(--enunas-gray-medium)";

// ─── AreaChart — filled line, optional compare line ──────────────────────
const AreaChart = ({ data, labels, compare, height = 220, fmt = (v) => v }) => {
  const w = 760, h = height;
  const pad = { l: 44, r: 14, t: 14, b: 28 };
  const iW = w - pad.l - pad.r, iH = h - pad.t - pad.b;
  const max = Math.max(...data, ...(compare || [])) * 1.12;
  const yT = 4;
  const xy = (v, i, arr) => [pad.l + (iW / (arr.length - 1)) * i, pad.t + iH - (v / max) * iH];
  const linePts = (arr) => arr.map((v, i) => xy(v, i, arr).map((n) => n.toFixed(1)).join(",")).join(" ");
  const areaPath = (() => {
    const pts = data.map((v, i) => xy(v, i, data));
    return `M${pad.l},${pad.t + iH} ` + pts.map((p) => `L${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ") + ` L${pad.l + iW},${pad.t + iH} Z`;
  })();
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" preserveAspectRatio="xMidYMid meet">
      <g className="chart-grid">
        {Array.from({ length: yT + 1 }).map((_, i) => {
          const y = pad.t + (iH / yT) * i;
          return <line key={i} x1={pad.l} x2={pad.l + iW} y1={y} y2={y} />;
        })}
      </g>
      <g className="chart-axis">
        {Array.from({ length: yT + 1 }).map((_, i) => {
          const v = max - (max / yT) * i;
          const y = pad.t + (iH / yT) * i;
          return <text key={i} x={pad.l - 8} y={y + 3} textAnchor="end">{fmt(v)}</text>;
        })}
      </g>
      <path d={areaPath} fill={PURPLE_FILL} stroke="none" />
      {compare && <polyline points={linePts(compare)} className="line-rest" />}
      <polyline points={linePts(data)} fill="none" stroke={PURPLE} strokeWidth="1.75" />
      {data.map((v, i) => {
        const [x, y] = xy(v, i, data);
        return <circle key={i} cx={x} cy={y} r={i === data.length - 1 ? 3.2 : 0} fill={PURPLE} />;
      })}
      <g className="chart-axis">
        {labels.map((l, i) => (
          <text key={i} x={pad.l + (iW / (labels.length - 1)) * i} y={h - 8} textAnchor="middle">{l}</text>
        ))}
      </g>
    </svg>
  );
};

// ─── ComboChart — bars (primary) + line (secondary axis) ─────────────────
const ComboChart = ({ bars, line, labels, height = 240, barFmt = (v) => v, lineFmt = (v) => v }) => {
  const w = 760, h = height;
  const pad = { l: 46, r: 46, t: 16, b: 28 };
  const iW = w - pad.l - pad.r, iH = h - pad.t - pad.b;
  const bMax = Math.max(...bars) * 1.15;
  const lMax = Math.max(...line) * 1.25;
  const lMin = Math.min(...line) * 0.85;
  const bw = (iW / bars.length) * 0.6;
  const gap = iW / bars.length - bw;
  const yT = 4;
  const lx = (i) => pad.l + gap / 2 + i * (bw + gap) + bw / 2;
  const ly = (v) => pad.t + iH - ((v - lMin) / (lMax - lMin)) * iH;
  const linePts = line.map((v, i) => `${lx(i).toFixed(1)},${ly(v).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" preserveAspectRatio="xMidYMid meet">
      <g className="chart-grid">
        {Array.from({ length: yT + 1 }).map((_, i) => {
          const y = pad.t + (iH / yT) * i;
          return <line key={i} x1={pad.l} x2={pad.l + iW} y1={y} y2={y} />;
        })}
      </g>
      <g className="chart-axis">
        {Array.from({ length: yT + 1 }).map((_, i) => {
          const v = bMax - (bMax / yT) * i;
          const y = pad.t + (iH / yT) * i;
          return <text key={i} x={pad.l - 8} y={y + 3} textAnchor="end">{barFmt(v)}</text>;
        })}
        {Array.from({ length: yT + 1 }).map((_, i) => {
          const v = lMax - ((lMax - lMin) / yT) * i;
          const y = pad.t + (iH / yT) * i;
          return <text key={`r${i}`} x={pad.l + iW + 8} y={y + 3} textAnchor="start" fill={PURPLE}>{lineFmt(v)}</text>;
        })}
      </g>
      {bars.map((v, i) => {
        const x = pad.l + gap / 2 + i * (bw + gap);
        const bh = (v / bMax) * iH;
        return <rect key={i} x={x} y={pad.t + iH - bh} width={bw} height={bh} className="bar-rest" />;
      })}
      <polyline points={linePts} fill="none" stroke={PURPLE} strokeWidth="1.75" />
      {line.map((v, i) => <circle key={i} cx={lx(i)} cy={ly(v)} r="3" fill={PURPLE} />)}
      <g className="chart-axis">
        {labels.map((l, i) => <text key={i} x={lx(i)} y={h - 8} textAnchor="middle">{l}</text>)}
      </g>
    </svg>
  );
};

// ─── WaterfallChart — payout breakdown (gross → fees → net) ──────────────
const WaterfallChart = ({ steps, height = 260, fmt = (v) => v }) => {
  // steps: [{label, value, type: 'base'|'add'|'sub'|'total'}]
  const w = 760, h = height;
  const pad = { l: 56, r: 14, t: 20, b: 44 };
  const iW = w - pad.l - pad.r, iH = h - pad.t - pad.b;
  // compute running totals
  let running = 0;
  const bars = steps.map((s) => {
    if (s.type === "base" || s.type === "total") {
      const bar = { start: 0, end: s.value, ...s };
      running = s.value;
      return bar;
    }
    const start = running;
    const end = s.type === "sub" ? running - s.value : running + s.value;
    running = end;
    return { start, end, ...s };
  });
  const max = Math.max(...bars.map((b) => Math.max(b.start, b.end))) * 1.1;
  const bw = (iW / bars.length) * 0.56;
  const gap = iW / bars.length - bw;
  const yT = 4;
  const yOf = (v) => pad.t + iH - (v / max) * iH;
  const fill = (t) => (t === "sub" ? "var(--enunas-error)" : t === "total" ? PURPLE : t === "base" ? "var(--enunas-black)" : "#9B7BB5");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" preserveAspectRatio="xMidYMid meet">
      <g className="chart-grid">
        {Array.from({ length: yT + 1 }).map((_, i) => {
          const y = pad.t + (iH / yT) * i;
          return <line key={i} x1={pad.l} x2={pad.l + iW} y1={y} y2={y} />;
        })}
      </g>
      <g className="chart-axis">
        {Array.from({ length: yT + 1 }).map((_, i) => {
          const v = max - (max / yT) * i;
          const y = pad.t + (iH / yT) * i;
          return <text key={i} x={pad.l - 8} y={y + 3} textAnchor="end">{fmt(v)}</text>;
        })}
      </g>
      {bars.map((b, i) => {
        const x = pad.l + gap / 2 + i * (bw + gap);
        const top = Math.max(b.start, b.end);
        const bot = Math.min(b.start, b.end);
        const y = yOf(top);
        const bh = Math.max(yOf(bot) - yOf(top), 1.5);
        return (
          <g key={i}>
            {/* connector */}
            {i > 0 && (
              <line
                x1={x - gap} x2={x}
                y1={yOf(bars[i - 1].end)} y2={yOf(bars[i - 1].end)}
                stroke={GRID} strokeDasharray="2 3"
              />
            )}
            <rect x={x} y={y} width={bw} height={bh} fill={fill(b.type)} />
            <text x={x + bw / 2} y={y - 7} textAnchor="middle" className="chart-axis"
              style={{ fontSize: 10, fontFamily: "var(--font-mono)" }} fill="var(--enunas-black)">
              {b.type === "sub" ? "−" : ""}{fmt(b.value)}
            </text>
            <text x={x + bw / 2} y={h - 24} textAnchor="middle" className="chart-axis">{b.label}</text>
          </g>
        );
      })}
    </svg>
  );
};

// ─── Funnel — conversion funnel (vertical stages) ───────────────────────
const Funnel = ({ stages, fmt = (v) => v.toLocaleString() }) => {
  const max = stages[0].value;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {stages.map((s, i) => {
        const pct = (s.value / max) * 100;
        const stepConv = i === 0 ? 100 : (s.value / stages[i - 1].value) * 100;
        return (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "150px 1fr 92px", alignItems: "center", gap: 14 }}>
            <div>
              <div style={{ fontSize: 12.5 }}>{s.label}</div>
              <div style={{ fontSize: 9.5, letterSpacing: "0.16em", textTransform: "uppercase", color: TEXT, marginTop: 2 }}>
                {fmt(s.value)}
              </div>
            </div>
            <div style={{ position: "relative", height: 34, background: REST }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: i === stages.length - 1 ? PURPLE : "#9B7BB5", transition: "width 600ms cubic-bezier(0.16,1,0.3,1)" }} />
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: pct > 18 ? "#fff" : "var(--enunas-black)", fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>
                {pct.toFixed(1)}%
              </span>
            </div>
            <div style={{ textAlign: "right", fontSize: 11, color: i === 0 ? TEXT : stepConv >= 50 ? "var(--enunas-success)" : "var(--enunas-gray-dark)", letterSpacing: "0.06em" }}>
              {i === 0 ? "entry" : `${stepConv.toFixed(0)}% →`}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── HBar — horizontal ranking bars ─────────────────────────────────────
const HBar = ({ items, fmt = (v) => v, accentTop = true }) => {
  const max = Math.max(...items.map((i) => i.value));
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 64px", gap: 14, alignItems: "center", padding: "11px 0", borderBottom: i < items.length - 1 ? `1px solid ${GRID}` : "0" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
              <span style={{ fontSize: 12.5 }}>{it.label}</span>
              {it.sub && <span style={{ fontSize: 10.5, color: TEXT, letterSpacing: "0.04em" }}>{it.sub}</span>}
            </div>
            <div style={{ height: 6, background: REST, position: "relative" }}>
              <i style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(it.value / max) * 100}%`, background: accentTop && i === 0 ? PURPLE : "#9B7BB5", display: "block" }} />
            </div>
          </div>
          <div style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 12 }}>{fmt(it.value)}</div>
        </div>
      ))}
    </div>
  );
};

// ─── StackedBar — categories over time ──────────────────────────────────
const StackedBar = ({ data, labels, keys, height = 240, fmt = (v) => v }) => {
  // data: [{cat1: n, cat2: n, ...}], keys: [{key,label,color}]
  const w = 760, h = height;
  const pad = { l: 46, r: 14, t: 16, b: 28 };
  const iW = w - pad.l - pad.r, iH = h - pad.t - pad.b;
  const totals = data.map((d) => keys.reduce((s, k) => s + d[k.key], 0));
  const max = Math.max(...totals) * 1.12;
  const bw = (iW / data.length) * 0.62;
  const gap = iW / data.length - bw;
  const yT = 4;
  const yOf = (v) => (v / max) * iH;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" preserveAspectRatio="xMidYMid meet">
      <g className="chart-grid">
        {Array.from({ length: yT + 1 }).map((_, i) => {
          const y = pad.t + (iH / yT) * i;
          return <line key={i} x1={pad.l} x2={pad.l + iW} y1={y} y2={y} />;
        })}
      </g>
      <g className="chart-axis">
        {Array.from({ length: yT + 1 }).map((_, i) => {
          const v = max - (max / yT) * i;
          const y = pad.t + (iH / yT) * i;
          return <text key={i} x={pad.l - 8} y={y + 3} textAnchor="end">{fmt(v)}</text>;
        })}
      </g>
      {data.map((d, i) => {
        const x = pad.l + gap / 2 + i * (bw + gap);
        let cursor = pad.t + iH;
        return (
          <g key={i}>
            {keys.map((k, ki) => {
              const bh = yOf(d[k.key]);
              cursor -= bh;
              return <rect key={ki} x={x} y={cursor} width={bw} height={bh} fill={k.color} />;
            })}
          </g>
        );
      })}
      <g className="chart-axis">
        {labels.map((l, i) => {
          const x = pad.l + gap / 2 + i * (bw + gap) + bw / 2;
          return <text key={i} x={x} y={h - 8} textAnchor="middle">{l}</text>;
        })}
      </g>
    </svg>
  );
};

const StackLegend = ({ keys }) => (
  <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
    {keys.map((k) => (
      <div key={k.key} style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <i style={{ width: 10, height: 10, background: k.color, display: "block" }} />
        <span style={{ fontSize: 10.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--enunas-gray-dark)" }}>{k.label}</span>
      </div>
    ))}
  </div>
);

// ─── Heatmap — orders by weekday × time block ───────────────────────────
const Heatmap = ({ rows, cols, data, fmt = (v) => v }) => {
  // data: 2D array [row][col]
  const max = Math.max(...data.flat());
  const shade = (v) => {
    if (v === 0) return "#F5F5F0";
    const t = v / max;
    // interpolate cream → purple
    return `rgba(55, 14, 77, ${(0.12 + t * 0.78).toFixed(2)})`;
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: `54px repeat(${cols.length}, 1fr)`, gap: 3 }}>
      <div />
      {cols.map((c) => (
        <div key={c} style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: TEXT, textAlign: "center", paddingBottom: 4 }}>{c}</div>
      ))}
      {rows.map((r, ri) => (
        <React.Fragment key={r}>
          <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: TEXT, display: "flex", alignItems: "center" }}>{r}</div>
          {cols.map((c, ci) => (
            <div key={ci} title={`${r} ${c}: ${fmt(data[ri][ci])}`}
              style={{ aspectRatio: "1.6", background: shade(data[ri][ci]), display: "grid", placeItems: "center", fontSize: 9.5, fontFamily: "var(--font-mono)", color: data[ri][ci] / max > 0.55 ? "#fff" : "var(--enunas-gray-dark)" }}>
              {data[ri][ci] > 0 ? data[ri][ci] : ""}
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

// ─── GaugeArc — payout vs revenue ratio (semicircle) ────────────────────
const GaugeArc = ({ pct, label, sub, size = 200 }) => {
  const r = size / 2 - 16;
  const cx = size / 2, cy = size / 2;
  const circ = Math.PI * r; // semicircle
  const dash = (pct / 100) * circ;
  const arc = (start, end) => {
    const a0 = Math.PI + (start / 100) * Math.PI;
    const a1 = Math.PI + (end / 100) * Math.PI;
    return `M ${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)}`;
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg viewBox={`0 0 ${size} ${size / 2 + 14}`} width={size}>
        <path d={arc(0, 100)} fill="none" stroke={REST} strokeWidth="14" />
        <path d={arc(0, pct)} fill="none" stroke={PURPLE} strokeWidth="14" />
        <text x={cx} y={cy - 6} textAnchor="middle" style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 300, fontSize: 40 }}>{pct}%</text>
      </svg>
      {label && <div style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: TEXT, marginTop: 2 }}>{label}</div>}
      {sub && <div style={{ fontSize: 11.5, color: TEXT, marginTop: 6, textAlign: "center" }}>{sub}</div>}
    </div>
  );
};

// ─── DonutMulti — category split with legend ────────────────────────────
const DonutMulti = ({ segments, size = 170, stroke = 22, centerLabel, centerValue }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0);
  let offset = 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <svg width={size} height={size} style={{ flex: "none" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={REST} strokeWidth={stroke} />
        {segments.map((s, i) => {
          const frac = s.value / total;
          const dash = frac * c;
          const el = (
            <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={s.color} strokeWidth={stroke}
              strokeDasharray={`${dash} ${c - dash}`}
              strokeDashoffset={-offset + c / 4}
              transform={`rotate(-90 ${size / 2} ${size / 2})`} />
          );
          offset += dash;
          return el;
        })}
        {centerValue && <text x="50%" y="46%" textAnchor="middle" dominantBaseline="central" style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 300, fontSize: 26 }}>{centerValue}</text>}
        {centerLabel && <text x="50%" y="60%" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 8.5, letterSpacing: "0.2em", textTransform: "uppercase", fill: TEXT }}>{centerLabel}</text>}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        {segments.map((s, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "12px 1fr auto", gap: 10, alignItems: "center" }}>
            <i style={{ width: 10, height: 10, background: s.color, display: "block" }} />
            <span style={{ fontSize: 12 }}>{s.label}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5 }}>{Math.round((s.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── ProgressArc — circular goal (full circle) ──────────────────────────
const InventoryBar = ({ label, sku, stock, threshold, max }) => {
  const pct = Math.min((stock / max) * 100, 100);
  const tone = stock === 0 ? "var(--enunas-error)" : stock <= threshold ? "var(--enunas-warning)" : "var(--enunas-success)";
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 56px", gap: 14, alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${GRID}` }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12.5 }}>{label}</span>
          <span className="mono" style={{ fontSize: 10.5, color: TEXT }}>{sku}</span>
        </div>
        <div style={{ height: 6, background: REST, position: "relative" }}>
          <i style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: tone, display: "block" }} />
          <i style={{ position: "absolute", left: `${(threshold / max) * 100}%`, top: -2, bottom: -2, width: 1, background: "var(--enunas-black)", display: "block" }} title="reorder threshold" />
        </div>
      </div>
      <div style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 12, color: tone }}>{stock}</div>
    </div>
  );
};

Object.assign(window, {
  AreaChart, ComboChart, WaterfallChart, Funnel, HBar, StackedBar, StackLegend,
  Heatmap, GaugeArc, DonutMulti, InventoryBar,
});
