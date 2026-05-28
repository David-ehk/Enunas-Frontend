/* global React, Icons */

// ─── Sidebar ──────────────────────────────────────────────────────────────
const Sidebar = ({ role, items, current, onNavigate }) => {
  const grouped = items.reduce((acc, item) => {
    const g = item.group || "";
    (acc[g] = acc[g] || []).push(item);
    return acc;
  }, {});
  const groupOrder = Object.keys(grouped);

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="wordmark">Enunas</span>
        <span className="surface-tag">{role === "admin" ? "Admin" : "Partner"}</span>
      </div>

      {groupOrder.map((g) => (
        <div key={g} className="sidebar-section">
          {g && <div className="sidebar-section-label">{g}</div>}
          <nav className="sidebar-nav">
            {grouped[g].map((item) => {
              const I = item.icon ? Icons[item.icon] : null;
              return (
                <button
                  key={item.id}
                  aria-current={current === item.id ? "page" : undefined}
                  onClick={() => onNavigate(item.id)}
                >
                  {I && <I size={16} />}
                  <span className="nav-label">{item.label}</span>
                  {item.badge && (
                    <span className="nav-badge" data-tone={item.badgeTone}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      ))}

      <div className="sidebar-foot">
        <div className="avatar">{role === "admin" ? "EW" : "WE"}</div>
        <div className="sidebar-foot-text">
          <span className="who">{role === "admin" ? "Elena Weiss" : "World's End"}</span>
          <span className="role">{role === "admin" ? "Platform Admin" : "Brand Partner"}</span>
        </div>
      </div>
    </aside>
  );
};

// ─── Topbar ───────────────────────────────────────────────────────────────
const Topbar = ({ role, onToggleSidebar, collapsed, onSwitchRole, searchPlaceholder }) => (
  <div className="topbar">
    <button className="topbar-collapse" onClick={onToggleSidebar} aria-label="Toggle sidebar">
      {collapsed ? <Icons.ChevronsRight size={14} /> : <Icons.ChevronsLeft size={14} />}
    </button>
    <div className="topbar-search">
      <Icons.Search size={14} />
      <input type="search" placeholder={searchPlaceholder || "Search orders, products, brands…"} />
      <kbd>⌘K</kbd>
    </div>
    <div className="topbar-right">
      <span className="role-pill" data-role={role === "admin" ? "admin" : "partner"}>
        {role === "admin" ? "Admin" : "Brand Partner"}
      </span>
      <button className="topbar-icon-btn" onClick={onSwitchRole} title="Switch role">
        <Icons.Return size={14} />
      </button>
      <button className="topbar-icon-btn" title="Notifications">
        <Icons.Bell size={14} />
        <span className="dot" />
      </button>
    </div>
  </div>
);

// ─── PageHeader ───────────────────────────────────────────────────────────
const PageHeader = ({ eyebrow, title, italicTitle, sub, actions }) => (
  <header className="page-header">
    <div>
      {eyebrow && <div className="page-eyebrow">{eyebrow}</div>}
      <h1 className="page-title">
        {title} {italicTitle && <em>{italicTitle}</em>}
      </h1>
      {sub && <div className="page-sub">{sub}</div>}
    </div>
    {actions && <div className="page-actions">{actions}</div>}
  </header>
);

// ─── KPI ──────────────────────────────────────────────────────────────────
const KPI = ({ label, value, unit, delta, deltaTone = "up", spark }) => (
  <div className="kpi">
    <div className="kpi-label">{label}</div>
    <div className="kpi-value">
      {value}
      {unit && <span className="unit">{unit}</span>}
    </div>
    {delta && (
      <div className={`kpi-delta ${deltaTone}`}>
        <span className="arrow">{deltaTone === "up" ? "▲" : "▼"}</span>
        <span>{delta}</span>
      </div>
    )}
    {spark && <Sparkline data={spark} tone={deltaTone} />}
  </div>
);

const KPIGrid = ({ children }) => <div className="kpi-grid">{children}</div>;

// ─── Sparkline (tiny SVG) ────────────────────────────────────────────────
const Sparkline = ({ data, tone = "up", w = 140, h = 28 }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data
    .map((v, i) => `${(i * step).toFixed(1)},${(h - ((v - min) / range) * h).toFixed(1)}`)
    .join(" ");
  const stroke = tone === "down" ? "var(--enunas-error)" : "var(--enunas-purple)";
  return (
    <svg className="kpi-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" width="100%">
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth="1.25" />
    </svg>
  );
};

// ─── Card ─────────────────────────────────────────────────────────────────
const Card = ({ eyebrow, title, action, foot, flush, children, style }) => (
  <section className="card" style={style}>
    {(title || eyebrow || action) && (
      <header className="card-head">
        <div>
          {eyebrow && <div className="card-eyebrow">{eyebrow}</div>}
          {title && <h2 className="card-title">{title}</h2>}
        </div>
        {action}
      </header>
    )}
    <div className={`card-body ${flush ? "flush" : ""}`}>{children}</div>
    {foot && <div className="card-foot">{foot}</div>}
  </section>
);

// ─── Status dot ───────────────────────────────────────────────────────────
const Status = ({ tone, children }) => (
  <span className="status" data-tone={tone}>
    {children}
  </span>
);

const Chip = ({ tone, children }) => <span className={`chip ${tone || ""}`}>{children}</span>;

// ─── Avatar ───────────────────────────────────────────────────────────────
const Avatar = ({ name, purple }) => {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return <span className={`avatar-sm ${purple ? "purple" : ""}`}>{initials}</span>;
};

// ─── Placeholder image ───────────────────────────────────────────────────
const PhImg = ({ label, className = "" }) => (
  <div className={`ph-img ${className}`}>{label || "image"}</div>
);

// ─── Filter bar segment ──────────────────────────────────────────────────
const Segmented = ({ value, onChange, options }) => (
  <div className="seg">
    {options.map((o) => (
      <button
        key={o.value}
        aria-pressed={value === o.value}
        onClick={() => onChange(o.value)}
      >
        {o.label}
        {o.count != null && <span style={{ marginLeft: 6, opacity: 0.6 }}>{o.count}</span>}
      </button>
    ))}
  </div>
);

// ─── Bar chart (revenue / units over time) ───────────────────────────────
const BarChart = ({ data, labels, height = 200, accent = true, accentIdx, maxLabel }) => {
  const w = 720;
  const h = height;
  const pad = { l: 36, r: 12, t: 12, b: 28 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const max = Math.max(...data) * 1.1;
  const bw = (innerW / data.length) * 0.66;
  const gap = (innerW / data.length) - bw;
  const yTicks = 4;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" preserveAspectRatio="xMidYMid meet" className="chart">
      {/* gridlines */}
      <g className="chart-grid">
        {Array.from({ length: yTicks + 1 }).map((_, i) => {
          const y = pad.t + (innerH / yTicks) * i;
          return <line key={i} x1={pad.l} x2={pad.l + innerW} y1={y} y2={y} />;
        })}
      </g>
      {/* y axis labels */}
      <g className="chart-axis">
        {Array.from({ length: yTicks + 1 }).map((_, i) => {
          const v = max - (max / yTicks) * i;
          const y = pad.t + (innerH / yTicks) * i;
          const label = maxLabel ? `${Math.round(v / 1000)}K` : Math.round(v);
          return (
            <text key={i} x={pad.l - 6} y={y + 3} textAnchor="end">
              {label}
            </text>
          );
        })}
      </g>
      {/* bars */}
      <g>
        {data.map((v, i) => {
          const x = pad.l + gap / 2 + i * (bw + gap);
          const bh = (v / max) * innerH;
          const y = pad.t + innerH - bh;
          const isAccent = accent && (accentIdx != null ? i === accentIdx : i === data.length - 1);
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={bw}
              height={bh}
              className={isAccent ? "bar-active" : "bar-rest"}
            />
          );
        })}
      </g>
      {/* x labels */}
      <g className="chart-axis">
        {labels.map((l, i) => {
          const x = pad.l + gap / 2 + i * (bw + gap) + bw / 2;
          return (
            <text key={i} x={x} y={h - 8} textAnchor="middle">
              {l}
            </text>
          );
        })}
      </g>
    </svg>
  );
};

// ─── Line chart with secondary (compare) ─────────────────────────────────
const LineChart = ({ series, labels, height = 220 }) => {
  const w = 720;
  const h = height;
  const pad = { l: 40, r: 12, t: 12, b: 28 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const allMax = Math.max(...series.flatMap((s) => s.data)) * 1.1;
  const yTicks = 4;
  const pointsFor = (data) =>
    data
      .map((v, i) => {
        const x = pad.l + (innerW / (data.length - 1)) * i;
        const y = pad.t + innerH - (v / allMax) * innerH;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" preserveAspectRatio="xMidYMid meet">
      <g className="chart-grid">
        {Array.from({ length: yTicks + 1 }).map((_, i) => {
          const y = pad.t + (innerH / yTicks) * i;
          return <line key={i} x1={pad.l} x2={pad.l + innerW} y1={y} y2={y} />;
        })}
      </g>
      <g className="chart-axis">
        {Array.from({ length: yTicks + 1 }).map((_, i) => {
          const v = allMax - (allMax / yTicks) * i;
          const y = pad.t + (innerH / yTicks) * i;
          return (
            <text key={i} x={pad.l - 6} y={y + 3} textAnchor="end">
              {(v / 1000).toFixed(1)}K
            </text>
          );
        })}
      </g>
      {series.map((s, idx) => (
        <polyline
          key={idx}
          points={pointsFor(s.data)}
          className={s.compare ? "line-rest" : "line-active"}
        />
      ))}
      <g className="chart-axis">
        {labels.map((l, i) => (
          <text
            key={i}
            x={pad.l + (innerW / (labels.length - 1)) * i}
            y={h - 8}
            textAnchor="middle"
          >
            {l}
          </text>
        ))}
      </g>
    </svg>
  );
};

// ─── Donut (single ratio with center number) ─────────────────────────────
const Donut = ({ pct, label, size = 130, stroke = 12 }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E8E8E8" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--enunas-purple)"
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${c - dash}`}
          strokeDashoffset={c / 4}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fontFamily: "Cormorant Garamond, serif",
            fontWeight: 300,
            fontSize: 28,
          }}
        >
          {pct}%
        </text>
      </svg>
      {label && (
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--enunas-gray-medium)" }}>
            {label.eyebrow}
          </div>
          <div style={{ fontFamily: "Cormorant Garamond, serif", fontStyle: "italic", fontSize: 22, marginTop: 4 }}>
            {label.title}
          </div>
          {label.sub && <div style={{ fontSize: 11.5, color: "var(--enunas-gray-medium)", marginTop: 6 }}>{label.sub}</div>}
        </div>
      )}
    </div>
  );
};

// ─── Reason bar (returns reasons) ────────────────────────────────────────
const ReasonRow = ({ label, count, total, meta }) => {
  const pct = Math.round((count / total) * 100);
  return (
    <div className="reason-row">
      <div>
        <div className="reason-label">{label}</div>
        {meta && <div className="reason-meta">{meta}</div>}
        <div className="reason-bar" style={{ marginTop: 6 }}>
          <i style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="reason-meta">{pct}%</div>
      <div className="reason-count">{count}</div>
    </div>
  );
};

// ─── Toggle ──────────────────────────────────────────────────────────────
const Toggle = ({ on, onChange }) => (
  <button
    type="button"
    className="toggle"
    aria-pressed={on}
    onClick={() => onChange(!on)}
  />
);

Object.assign(window, {
  Sidebar, Topbar, PageHeader, KPI, KPIGrid, Sparkline, Card, Status, Chip,
  Avatar, PhImg, Segmented, BarChart, LineChart, Donut, ReasonRow, Toggle,
});
