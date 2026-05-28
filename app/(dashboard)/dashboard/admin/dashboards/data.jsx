/* global window */
// Realistic mock data for both dashboards.
// English copy, Enunas product/brand vocabulary.

const BRANDS = [
  { id: "wew", name: "World's End", slug: "worlds-end", country: "DE", status: "active", products: 47, gmv: 84210, joined: "Mar 2024" },
  { id: "vlt", name: "Volt Atelier", slug: "volt-atelier", country: "DE", status: "active", products: 23, gmv: 41880, joined: "Aug 2024" },
  { id: "mrn", name: "Marin Studio", slug: "marin-studio", country: "FR", status: "active", products: 18, gmv: 31420, joined: "Jan 2025" },
  { id: "nrd", name: "Nordstrand", slug: "nordstrand", country: "DK", status: "pending", products: 0, gmv: 0, joined: "May 2026" },
  { id: "ksh", name: "Kashmir & Co.", slug: "kashmir-co", country: "DE", status: "active", products: 32, gmv: 28190, joined: "Nov 2024" },
  { id: "hxn", name: "Hexen Berlin", slug: "hexen-berlin", country: "DE", status: "active", products: 14, gmv: 17640, joined: "Feb 2025" },
  { id: "syd", name: "Sydra Knitwear", slug: "sydra", country: "IT", status: "paused", products: 9, gmv: 5210, joined: "Apr 2025" },
  { id: "frt", name: "Frantz", slug: "frantz", country: "DE", status: "active", products: 28, gmv: 22980, joined: "Oct 2024" },
];

const PRODUCTS = [
  { sku: "WEW-DBJ-PRP-M", name: "Drop Hoodie Vol.1", brand: "World's End", catalogue: "Streetwear", price: 249, stock: 12, status: "live", img: "Test1" },
  { sku: "WEW-WED-BLK-L", name: "Worlds End Denim Boxer Jacket", brand: "World's End", catalogue: "Streetwear", price: 489, stock: 4, status: "low", img: "Test3" },
  { sku: "VLT-CRG-OLV-S", name: "Tactical Cargo, Olive Grain", brand: "Volt Atelier", catalogue: "Streetwear", price: 219, stock: 28, status: "live", img: "Test4" },
  { sku: "MRN-LIN-WHT-M", name: "Atlantic Linen Shirt", brand: "Marin Studio", catalogue: "Athleisure", price: 169, stock: 0, status: "out", img: "NEWIN" },
  { sku: "KSH-CSH-CRM-L", name: "Cashmere Crew, Crema", brand: "Kashmir & Co.", catalogue: "Culture", price: 329, stock: 22, status: "live", img: "TRENDY" },
  { sku: "HXN-LTH-BLK-M", name: "Black Sigil Leather Bomber", brand: "Hexen Berlin", catalogue: "Experimental", price: 689, stock: 2, status: "low", img: "Test1" },
  { sku: "FRT-WLK-TAN-S", name: "Walker Trouser, Tan", brand: "Frantz", catalogue: "Streetwear", price: 199, stock: 17, status: "live", img: "Test4" },
  { sku: "VLT-PUF-BLK-XL", name: "Featherweight Puffer", brand: "Volt Atelier", catalogue: "Athleisure", price: 549, stock: 9, status: "live", img: "Test3" },
];

const ORDERS = [
  { id: "ENU-10487", customer: "Jana K.", brand: "World's End", items: 2, total: 738, status: "shipped", date: "May 27, 10:42", payment: "Klarna" },
  { id: "ENU-10486", customer: "Lukas M.", brand: "Volt Atelier", items: 1, total: 219, status: "preparing", date: "May 27, 10:18", payment: "Card" },
  { id: "ENU-10485", customer: "Sofia R.", brand: "Kashmir & Co.", items: 1, total: 329, status: "delivered", date: "May 27, 09:55", payment: "PayPal" },
  { id: "ENU-10484", customer: "Felix B.", brand: "World's End", items: 3, total: 987, status: "preparing", date: "May 27, 09:14", payment: "Klarna" },
  { id: "ENU-10483", customer: "Mira O.", brand: "Hexen Berlin", items: 1, total: 689, status: "returned", date: "May 27, 08:30", payment: "Card" },
  { id: "ENU-10482", customer: "Tomás A.", brand: "Marin Studio", items: 2, total: 338, status: "shipped", date: "May 26, 22:11", payment: "Card" },
  { id: "ENU-10481", customer: "Lara P.", brand: "Frantz", items: 1, total: 199, status: "delivered", date: "May 26, 19:44", payment: "Klarna" },
  { id: "ENU-10480", customer: "Jonas H.", brand: "Volt Atelier", items: 1, total: 549, status: "preparing", date: "May 26, 18:02", payment: "Card" },
  { id: "ENU-10479", customer: "Ina S.", brand: "World's End", items: 1, total: 249, status: "delivered", date: "May 26, 16:25", payment: "PayPal" },
  { id: "ENU-10478", customer: "Robin L.", brand: "Kashmir & Co.", items: 2, total: 658, status: "returned", date: "May 26, 12:00", payment: "Klarna" },
  { id: "ENU-10477", customer: "Hannah T.", brand: "Marin Studio", items: 1, total: 169, status: "delivered", date: "May 26, 11:14", payment: "Card" },
  { id: "ENU-10476", customer: "Paul V.", brand: "Frantz", items: 1, total: 199, status: "cancelled", date: "May 26, 09:33", payment: "Card" },
];

const CUSTOMERS = [
  { id: "C-8841", name: "Jana Kowalski", email: "jana.k@studio-mail.de", city: "Berlin", orders: 14, ltv: 3940, last: "May 27", segment: "VIP" },
  { id: "C-8839", name: "Lukas Mertens", email: "lukas.m@me.com", city: "München", orders: 8, ltv: 1820, last: "May 27", segment: "Loyal" },
  { id: "C-8835", name: "Sofia Roth", email: "sofia@roth.studio", city: "Hamburg", orders: 22, ltv: 6210, last: "May 27", segment: "VIP" },
  { id: "C-8830", name: "Felix Brand", email: "felix.brand@gmail.com", city: "Köln", orders: 5, ltv: 2380, last: "May 27", segment: "Loyal" },
  { id: "C-8825", name: "Mira Olsen", email: "miramail@protonmail.com", city: "Berlin", orders: 3, ltv: 940, last: "May 27", segment: "New" },
  { id: "C-8820", name: "Tomás Aragón", email: "tomasa@bilbao.es", city: "Hamburg", orders: 11, ltv: 2660, last: "May 26", segment: "Loyal" },
  { id: "C-8815", name: "Lara Petrov", email: "lara@petrov.dev", city: "Berlin", orders: 6, ltv: 1340, last: "May 26", segment: "Loyal" },
  { id: "C-8810", name: "Jonas Hartmann", email: "jonas.h@yahoo.de", city: "Stuttgart", orders: 2, ltv: 728, last: "May 26", segment: "New" },
];

const RETURN_REASONS = [
  { label: "Size too small", count: 18, meta: "Most often: M, women's" },
  { label: "Fit / cut not as expected", count: 14, meta: "Concentrated in 'Worlds End Denim'" },
  { label: "Color slightly different", count: 9, meta: "Photo lighting (PDP)" },
  { label: "Quality below expectation", count: 4, meta: "1 escalation pending" },
  { label: "Arrived late, no longer needed", count: 3, meta: "Carrier delay (DHL Nord)" },
  { label: "Other", count: 2, meta: "Open text reviewed by Support" },
];

const ACTIVITY = [
  { tone: "purple", body: "New brand application — <b>Nordstrand</b> submitted KYC docs.", time: "8 min" },
  { tone: "success", body: "<b>ENU-10487</b> shipped by World's End (DHL · 8h SLA).", time: "22 min" },
  { tone: "warn", body: "<b>Marin Studio</b> stock alert — <em>Atlantic Linen Shirt</em> out of stock.", time: "44 min" },
  { tone: "purple", body: "Refund issued — <b>ENU-10483</b> · €689 to original payment.", time: "1 h" },
  { tone: "success", body: "Monthly payouts initiated — 7 brands · <b>€61,420</b>.", time: "3 h" },
  { tone: "default", body: "Catalogue tag added — <em>Streetwear · Drop Hoodie Vol.1</em>.", time: "5 h" },
];

const PARTNER_ORDERS = ORDERS.filter((o) => o.brand === "World's End");

const PARTNER_PRODUCTS = PRODUCTS.filter((p) => p.brand === "World's End").concat([
  { sku: "WEW-TEE-BLK-S", name: "Volume Tee, Charcoal", brand: "World's End", catalogue: "Streetwear", price: 89, stock: 41, status: "live", img: "TRENDY" },
  { sku: "WEW-CAP-PRP-OS", name: "Embossed Cap, Aubergine", brand: "World's End", catalogue: "Streetwear", price: 69, stock: 0, status: "out", img: "NEWIN" },
  { sku: "WEW-COA-CRM-L", name: "Atelier Overcoat, Crema", brand: "World's End", catalogue: "Culture", price: 749, stock: 6, status: "low", img: "Test4" },
]);

const PAYOUTS = [
  { id: "PO-2026-05", period: "May 2026", gross: 18420, fees: 1842, refunds: 938, net: 15640, status: "pending", date: "Jun 5, 2026" },
  { id: "PO-2026-04", period: "Apr 2026", gross: 22180, fees: 2218, refunds: 1240, net: 18722, status: "paid", date: "May 5, 2026" },
  { id: "PO-2026-03", period: "Mar 2026", gross: 19840, fees: 1984, refunds: 1106, net: 16750, status: "paid", date: "Apr 5, 2026" },
  { id: "PO-2026-02", period: "Feb 2026", gross: 14920, fees: 1492, refunds: 712, net: 12716, status: "paid", date: "Mar 5, 2026" },
  { id: "PO-2026-01", period: "Jan 2026", gross: 16280, fees: 1628, refunds: 832, net: 13820, status: "paid", date: "Feb 5, 2026" },
];

// Helpers
const money = (n) => `€${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const moneyDec = (n) => `€${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const statusTone = (s) => ({
  shipped: "success", delivered: "success", preparing: "warn", returned: "error",
  cancelled: "muted", live: "success", out: "error", low: "warn",
  active: "success", pending: "warn", paused: "muted", paid: "success",
}[s] || "muted");
const statusLabel = (s) => ({
  shipped: "Shipped", delivered: "Delivered", preparing: "Preparing",
  returned: "Returned", cancelled: "Cancelled", live: "Live",
  out: "Out of stock", low: "Low stock", active: "Active", pending: "Pending",
  paused: "Paused", paid: "Paid",
}[s] || s);

Object.assign(window, {
  BRANDS, PRODUCTS, ORDERS, CUSTOMERS, RETURN_REASONS, ACTIVITY,
  PARTNER_ORDERS, PARTNER_PRODUCTS, PAYOUTS,
  money, moneyDec, statusTone, statusLabel,
});
