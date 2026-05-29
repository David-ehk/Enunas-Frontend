/* global window */
// Extra data specific to the standalone Brand Partner dashboard.
// Builds on data.jsx (loaded before this).

// ── Revenue / units / conversion — 14 day daily series
const BP_DAYS = ["16","17","18","19","20","21","22","23","24","25","26","27","28","29"];
const BP_REVENUE = [820, 940, 760, 1120, 1380, 1180, 1620, 1480, 1320, 1640, 2110, 1820, 2410, 2680];
const BP_REVENUE_PREV = [620, 700, 680, 880, 940, 920, 1240, 1180, 1080, 1280, 1480, 1320, 1620, 1740];
const BP_UNITS = [4, 5, 4, 6, 7, 6, 9, 8, 7, 9, 11, 10, 13, 14];
const BP_CONV = [2.4, 2.6, 2.5, 2.8, 2.9, 2.7, 3.1, 3.0, 2.8, 3.1, 3.4, 3.2, 3.6, 3.7];

// ── Revenue by catalogue category over 6 months (stacked)
const BP_CAT_KEYS = [
  { key: "street", label: "Streetwear", color: "var(--enunas-purple)" },
  { key: "culture", label: "Culture", color: "#9B7BB5" },
  { key: "athl", label: "Athleisure", color: "#C9B8D6" },
];
const BP_CAT_MONTHS = ["Dec","Jan","Feb","Mar","Apr","May"];
const BP_CAT_DATA = [
  { street: 8200, culture: 3100, athl: 1800 },
  { street: 9100, culture: 3600, athl: 2100 },
  { street: 7400, culture: 4200, athl: 2400 },
  { street: 10200, culture: 4800, athl: 2900 },
  { street: 11800, culture: 5400, athl: 3100 },
  { street: 12600, culture: 5800, athl: 3400 },
];

// ── Conversion funnel
const BP_FUNNEL = [
  { label: "Storefront views", value: 14820 },
  { label: "Product views", value: 8940 },
  { label: "Added to cart", value: 1820 },
  { label: "Reached checkout", value: 742 },
  { label: "Purchased", value: 459 },
];

// ── Payout waterfall (current month)
const BP_WATERFALL = [
  { label: "Gross", value: 18420, type: "base" },
  { label: "Platform 10%", value: 1842, type: "sub" },
  { label: "Processing", value: 412, type: "sub" },
  { label: "Refunds", value: 938, type: "sub" },
  { label: "Net payout", value: 15228, type: "total" },
];

// ── Orders by weekday × time block (heatmap)
const BP_HEAT_ROWS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const BP_HEAT_COLS = ["00–06", "06–12", "12–18", "18–24"];
const BP_HEAT_DATA = [
  [1, 4, 7, 9],
  [0, 5, 8, 11],
  [1, 6, 9, 10],
  [2, 7, 11, 14],
  [1, 8, 13, 18],
  [3, 9, 16, 21],
  [2, 6, 10, 12],
];

// ── Inventory health
const BP_INVENTORY = [
  { label: "Drop Hoodie Vol.1", sku: "WEW-DBJ-PRP", stock: 12, threshold: 8, max: 50 },
  { label: "Worlds End Denim Boxer Jacket", sku: "WEW-WED-BLK", stock: 4, threshold: 6, max: 50 },
  { label: "Volume Tee, Charcoal", sku: "WEW-TEE-BLK", stock: 41, threshold: 12, max: 50 },
  { label: "Atelier Overcoat, Crema", sku: "WEW-COA-CRM", stock: 6, threshold: 8, max: 50 },
  { label: "Embossed Cap, Aubergine", sku: "WEW-CAP-PRP", stock: 0, threshold: 10, max: 50 },
];

// ── Sales channels
const BP_CHANNELS = [
  { label: "Direct", value: 5630, sub: "38%" },
  { label: "Organic search", value: 3558, sub: "24%" },
  { label: "Instagram", value: 2668, sub: "18%" },
  { label: "Newsletter", value: 1778, sub: "12%" },
  { label: "Editorial features", value: 1186, sub: "8%" },
];

// ── Top products (ranking)
const BP_TOP_PRODUCTS = [
  { label: "Drop Hoodie Vol.1", value: 7968, sub: "32 sold" },
  { label: "Worlds End Denim Boxer Jacket", value: 6846, sub: "14 sold" },
  { label: "Atelier Overcoat, Crema", value: 4494, sub: "6 sold" },
  { label: "Volume Tee, Charcoal", value: 2492, sub: "28 sold" },
  { label: "Embossed Cap, Aubergine", value: 276, sub: "4 sold" },
];

// ── Return rate trend (last 6 months, %)
const BP_RETURN_TREND = [9.1, 8.6, 8.2, 7.7, 7.2, 6.8];
const BP_RETURN_MONTHS = ["Dec","Jan","Feb","Mar","Apr","May"];

// ── Sales by category (donut)
const BP_CAT_SPLIT = [
  { label: "Streetwear", value: 12600, color: "var(--enunas-purple)" },
  { label: "Culture", value: 5800, color: "#9B7BB5" },
  { label: "Athleisure", value: 3400, color: "#C9B8D6" },
];

// ── Marketing / promotions
const BP_CAMPAIGNS = [
  { id: "CMP-014", name: "Spring Drop — Vol.1", channel: "Instagram + Newsletter", status: "active", spend: 1200, revenue: 8420, roas: 7.0, ctr: 3.2, start: "May 12" },
  { id: "CMP-013", name: "Hero slot — Denim", channel: "Storefront hero", status: "active", spend: 0, revenue: 6846, roas: null, ctr: 5.8, start: "May 20" },
  { id: "CMP-012", name: "Returning customer −15%", channel: "Email", status: "active", spend: 0, revenue: 3140, roas: null, ctr: 4.1, start: "May 1" },
  { id: "CMP-011", name: "Easter capsule", channel: "Instagram", status: "ended", spend: 800, revenue: 4210, roas: 5.3, ctr: 2.7, start: "Apr 2" },
  { id: "CMP-010", name: "Newsletter — April edit", channel: "Email", status: "ended", spend: 0, revenue: 2980, roas: null, ctr: 3.9, start: "Apr 8" },
];

const BP_PROMOS = [
  { code: "SPRING24", type: "15% off", used: 142, cap: 300, revenue: 6820, status: "active", expires: "Jun 15" },
  { code: "WELCOME10", type: "10% off first order", used: 88, cap: null, revenue: 3940, status: "active", expires: "Evergreen" },
  { code: "RETURN15", type: "15% win-back", used: 41, cap: 200, revenue: 3140, status: "active", expires: "Jun 1" },
  { code: "EASTER20", type: "20% off capsule", used: 96, cap: 100, revenue: 4210, status: "ended", expires: "Apr 21" },
];

// ── Campaign performance over time (combo: spend bars + revenue line)
const BP_CMP_WEEKS = ["W18","W19","W20","W21","W22","W23"];
const BP_CMP_SPEND = [180, 240, 320, 280, 410, 380];
const BP_CMP_REVENUE = [1240, 1820, 2680, 2410, 3640, 3980];

Object.assign(window, {
  BP_DAYS, BP_REVENUE, BP_REVENUE_PREV, BP_UNITS, BP_CONV,
  BP_CAT_KEYS, BP_CAT_MONTHS, BP_CAT_DATA, BP_FUNNEL, BP_WATERFALL,
  BP_HEAT_ROWS, BP_HEAT_COLS, BP_HEAT_DATA, BP_INVENTORY, BP_CHANNELS,
  BP_TOP_PRODUCTS, BP_RETURN_TREND, BP_RETURN_MONTHS, BP_CAT_SPLIT,
  BP_CAMPAIGNS, BP_PROMOS, BP_CMP_WEEKS, BP_CMP_SPEND, BP_CMP_REVENUE,
});
