// ─── Brand Partner ───────────────────────────────────────────────────────────

export const brandProfile = {
  name: 'Krauss Studio',
  category: 'Minimalist Streetwear',
  avatar: 'KS',
}

export const brandKpis = [
  { label: 'Total Revenue', value: '€4.280', icon: 'euro' },
  { label: 'Pending Payout', value: '€640', icon: 'wallet' },
  { label: 'Active Listings', value: '18', icon: 'package' },
  { label: 'Orders This Month', value: '34', icon: 'bag' },
]

export const brandRecentOrders = [
  { id: '#KS-2847', product: 'Oversize Hoodie "Blau"', size: 'M', city: 'Berlin', status: 'Shipped', date: '28 May 2026' },
  { id: '#KS-2846', product: 'Cargo Pants "Sand"', size: 'L', city: 'Munich', status: 'Processing', date: '27 May 2026' },
  { id: '#KS-2845', product: 'Coach Jacket "Nacht"', size: 'S', city: 'Hamburg', status: 'Delivered', date: '26 May 2026' },
  { id: '#KS-2844', product: 'Oversize Hoodie "Blau"', size: 'XL', city: 'Cologne', status: 'Delivered', date: '25 May 2026' },
  { id: '#KS-2843', product: 'Logo Cap "Sand"', size: 'OS', city: 'Frankfurt', status: 'Shipped', date: '24 May 2026' },
  { id: '#KS-2842', product: 'Ribbed Longsleeve "Creme"', size: 'M', city: 'Vienna', status: 'Processing', date: '23 May 2026' },
]

export const brandTopProducts = [
  { name: 'Oversize Hoodie "Blau"', sku: 'KS-HOOD-BL', sold: 14, revenue: '€1.890' },
  { name: 'Coach Jacket "Nacht"', sku: 'KS-JACK-N', sold: 9, revenue: '€1.260' },
  { name: 'Cargo Pants "Sand"', sku: 'KS-PANT-S', sold: 7, revenue: '€840' },
]

export const brandNextPayout = {
  date: 'June 2, 2026',
  amount: '€640',
  method: 'bank transfer',
}

export const brandAllOrders = [
  { id: '#KS-2847', product: 'Oversize Hoodie "Blau"', size: 'M', city: 'Berlin', status: 'Shipped', date: '28 May 2026', total: '€135' },
  { id: '#KS-2846', product: 'Cargo Pants "Sand"', size: 'L', city: 'Munich', status: 'Processing', date: '27 May 2026', total: '€120' },
  { id: '#KS-2845', product: 'Coach Jacket "Nacht"', size: 'S', city: 'Hamburg', status: 'Delivered', date: '26 May 2026', total: '€140' },
  { id: '#KS-2844', product: 'Oversize Hoodie "Blau"', size: 'XL', city: 'Cologne', status: 'Delivered', date: '25 May 2026', total: '€135' },
  { id: '#KS-2843', product: 'Logo Cap "Sand"', size: 'OS', city: 'Frankfurt', status: 'Shipped', date: '24 May 2026', total: '€55' },
  { id: '#KS-2842', product: 'Ribbed Longsleeve "Creme"', size: 'M', city: 'Vienna', status: 'Processing', date: '23 May 2026', total: '€85' },
  { id: '#KS-2841', product: 'Oversized Tee "Basalt"', size: 'S', city: 'Zurich', status: 'Delivered', date: '21 May 2026', total: '€75' },
  { id: '#KS-2840', product: 'Coach Jacket "Nacht"', size: 'M', city: 'Stuttgart', status: 'Shipped', date: '20 May 2026', total: '€140' },
  { id: '#KS-2839', product: 'Cargo Pants "Sand"', size: 'M', city: 'Düsseldorf', status: 'Delivered', date: '19 May 2026', total: '€120' },
  { id: '#KS-2838', product: 'Ribbed Longsleeve "Creme"', size: 'L', city: 'Leipzig', status: 'Delivered', date: '18 May 2026', total: '€85' },
]

export const brandProducts = [
  { sku: 'KS-HOOD-BL', name: 'Oversize Hoodie "Blau"', price: '€135', sizes: 'XS · S · M · L · XL', status: 'Active', sold: 14 },
  { sku: 'KS-HOOD-CR', name: 'Oversize Hoodie "Creme"', price: '€135', sizes: 'XS · S · M · L · XL', status: 'Active', sold: 6 },
  { sku: 'KS-JACK-N', name: 'Coach Jacket "Nacht"', price: '€140', sizes: 'S · M · L · XL', status: 'Active', sold: 9 },
  { sku: 'KS-PANT-S', name: 'Cargo Pants "Sand"', price: '€120', sizes: 'XS · S · M · L · XL', status: 'Active', sold: 7 },
  { sku: 'KS-CAP-S', name: 'Logo Cap "Sand"', price: '€55', sizes: 'OS', status: 'Active', sold: 11 },
  { sku: 'KS-LS-CR', name: 'Ribbed Longsleeve "Creme"', price: '€85', sizes: 'XS · S · M · L · XL', status: 'Active', sold: 8 },
  { sku: 'KS-SHIRT-B', name: 'Oversized Tee "Basalt"', price: '€75', sizes: 'XS · S · M · L · XL · 2XL', status: 'Active', sold: 12 },
  { sku: 'KS-VEST-N', name: 'Padded Vest "Nacht"', price: '€160', sizes: 'S · M · L · XL', status: 'Inactive', sold: 0 },
]

export const brandPayouts = [
  { id: 'PAY-0041', period: '1–31 May 2026', orders: 34, gross: '€4.280', commission: '€856', net: '€3.424', status: 'Pending', date: '2 Jun 2026' },
  { id: 'PAY-0037', period: '1–30 Apr 2026', orders: 29, gross: '€3.680', commission: '€736', net: '€2.944', status: 'Paid', date: '2 May 2026' },
  { id: 'PAY-0032', period: '1–31 Mar 2026', orders: 24, gross: '€2.960', commission: '€592', net: '€2.368', status: 'Paid', date: '2 Apr 2026' },
  { id: 'PAY-0027', period: '1–28 Feb 2026', orders: 18, gross: '€2.240', commission: '€448', net: '€1.792', status: 'Paid', date: '2 Mar 2026' },
]

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminKpis = [
  { label: 'Total GMV', value: '€184.200', icon: 'trending' },
  { label: 'Platform Revenue', value: '€36.840', icon: 'euro' },
  { label: 'Active Brand Partners', value: '23', icon: 'building' },
  { label: 'Pending Applications', value: '4', icon: 'file' },
  { label: 'Orders This Month', value: '312', icon: 'bag' },
]

export const revenueChartData = [
  { month: 'Jan', gmv: 22400, revenue: 4480 },
  { month: 'Feb', gmv: 26800, revenue: 5360 },
  { month: 'Mar', gmv: 29200, revenue: 5840 },
  { month: 'Apr', gmv: 31600, revenue: 6320 },
  { month: 'May', gmv: 34200, revenue: 6840 },
  { month: 'Jun', gmv: 40000, revenue: 8000 },
]

export const adminApplications = [
  { name: 'Vault Berlin', followers: '18.4k', category: 'Streetwear', submitted: '16 May 2026', status: 'Pending' },
  { name: 'Stillwater Co.', followers: '9.2k', category: 'Minimalist', submitted: '14 May 2026', status: 'Pending' },
  { name: 'Maison Dusk', followers: '31.0k', category: 'Luxury Casual', submitted: '10 May 2026', status: 'Approved' },
  { name: 'Form Studio', followers: '6.8k', category: 'Streetwear', submitted: '8 May 2026', status: 'Rejected' },
]

export const adminTopBrands = [
  { name: 'Krauss Studio', revenue: '€22.400', orders: 189, commission: '€4.480' },
  { name: 'Maison Dusk', revenue: '€18.900', orders: 156, commission: '€3.780' },
  { name: 'Vault Berlin', revenue: '€14.200', orders: 118, commission: '€2.840' },
]

export const adminBrands = [
  { name: 'Krauss Studio', category: 'Streetwear', listings: 18, gmv: '€22.400', commission: '€4.480', joined: 'Jan 2026', status: 'Active' },
  { name: 'Maison Dusk', category: 'Luxury Casual', listings: 24, gmv: '€18.900', commission: '€3.780', joined: 'Feb 2026', status: 'Active' },
  { name: 'Vault Berlin', category: 'Streetwear', listings: 31, gmv: '€14.200', commission: '€2.840', joined: 'Mar 2026', status: 'Active' },
  { name: 'Weiss & Schwarz', category: 'Luxury Casual', listings: 22, gmv: '€16.400', commission: '€3.280', joined: 'Feb 2026', status: 'Active' },
  { name: 'Atelier Nord', category: 'Minimalist', listings: 15, gmv: '€12.600', commission: '€2.520', joined: 'Jan 2026', status: 'Active' },
  { name: 'Stillwater Co.', category: 'Minimalist', listings: 12, gmv: '€9.800', commission: '€1.960', joined: 'Mar 2026', status: 'Active' },
  { name: 'Dunkelheit', category: 'Avant-garde', listings: 9, gmv: '€8.100', commission: '€1.620', joined: 'Apr 2026', status: 'Active' },
  { name: 'Form Studio', category: 'Streetwear', listings: 8, gmv: '€7.400', commission: '€1.480', joined: 'Apr 2026', status: 'Suspended' },
]

export const adminAllOrders = [
  { id: '#EN-9214', brand: 'Krauss Studio', product: 'Oversize Hoodie "Blau"', city: 'Berlin', total: '€135', status: 'Shipped', date: '28 May 2026' },
  { id: '#EN-9213', brand: 'Maison Dusk', product: 'Satin Blazer "Noir"', city: 'Paris', total: '€290', status: 'Delivered', date: '28 May 2026' },
  { id: '#EN-9212', brand: 'Vault Berlin', product: 'Graphic Tee Vol.3', city: 'Hamburg', total: '€85', status: 'Processing', date: '27 May 2026' },
  { id: '#EN-9211', brand: 'Weiss & Schwarz', product: 'Tailored Trousers', city: 'Munich', total: '€195', status: 'Shipped', date: '27 May 2026' },
  { id: '#EN-9210', brand: 'Atelier Nord', product: 'Wool Coat "Birch"', city: 'Oslo', total: '€380', status: 'Delivered', date: '26 May 2026' },
  { id: '#EN-9209', brand: 'Krauss Studio', product: 'Coach Jacket "Nacht"', city: 'Cologne', total: '€140', status: 'Delivered', date: '26 May 2026' },
  { id: '#EN-9208', brand: 'Maison Dusk', product: 'Leather Clutch', city: 'Vienna', total: '€165', status: 'Shipped', date: '25 May 2026' },
  { id: '#EN-9207', brand: 'Dunkelheit', product: 'Mesh Shirt "Void"', city: 'Berlin', total: '€110', status: 'Processing', date: '25 May 2026' },
]

export const adminPayouts = [
  { id: 'PAY-0041', brand: 'Krauss Studio', period: '1–31 May 2026', gross: '€4.280', commission: '€856', net: '€3.424', status: 'Pending' },
  { id: 'PAY-0040', brand: 'Maison Dusk', period: '1–31 May 2026', gross: '€3.600', commission: '€720', net: '€2.880', status: 'Pending' },
  { id: 'PAY-0039', brand: 'Vault Berlin', period: '1–31 May 2026', gross: '€2.800', commission: '€560', net: '€2.240', status: 'Pending' },
  { id: 'PAY-0038', brand: 'Weiss & Schwarz', period: '1–31 May 2026', gross: '€3.100', commission: '€620', net: '€2.480', status: 'Pending' },
  { id: 'PAY-0037', brand: 'Krauss Studio', period: '1–30 Apr 2026', gross: '€3.680', commission: '€736', net: '€2.944', status: 'Paid' },
  { id: 'PAY-0036', brand: 'Maison Dusk', period: '1–30 Apr 2026', gross: '€3.100', commission: '€620', net: '€2.480', status: 'Paid' },
]
