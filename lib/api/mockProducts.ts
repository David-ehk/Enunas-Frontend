import { generateSlug } from '../product';

export interface MockProduct {
  id: string;
  slug: string;
  brandName: string;
  productName: string;
  price: string;
  priceNumber: number;
  imgURL: string;
  category: string;      // e.g., "schuhe", "jacken", "oberteile" → URL: /bekleidung/[category]/...
  subcategory: string;   // e.g., "sneaker", "denim", "blazer" → URL: /bekleidung/[category]/[subcategory]/...
  colours: {
    hex: string;
    name: string;
  }[];
  catalogue: string[];
  sizes: string[];
  createdAt: Date;
  isPopular: boolean;
  isNew: boolean;
  // Additional fields for product page compatibility
  description?: string;
  images?: string[];
  sku?: string;
  details?: {
    material?: string;
    care?: string;
    origin?: string;
  };
}

export const mockProducts: MockProduct[] = [
  // POPULAR PRODUCTS
  {
    id: "1",
    slug: generateSlug("Nike Air Shoes 5"),
    brandName: "Nike",
    productName: "Nike Air Shoes 5",
    price: "220€",
    priceNumber: 220,
    imgURL: "https://www.manieredevoir.com/cdn/shop/files/GEN-WD-23-10-2025.jpg?crop=center&height=2095&v=1761206881&width=1920",
    category: "schuhe",
    subcategory: "sneaker",
    colours: [
      { hex: "#DE0000", name: "Rot" },
      { hex: "#1A1A1A", name: "Schwarz" }
    ],
    catalogue: ["Streetwear", "Athleisure"],
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    createdAt: new Date(),
    isPopular: true,
    isNew: true,
    description: "Premium Nike Air Shoes mit modernem Design und maximalem Komfort. Perfekt für den Alltag und Sport.",
    images: [
      "https://www.manieredevoir.com/cdn/shop/files/GEN-WD-23-10-2025.jpg?crop=center&height=2095&v=1761206881&width=1920",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=1000&fit=crop"
    ],
    sku: "NIKE-AIR-5-001",
    details: { material: "Leder, Textil", care: "Mit feuchtem Tuch abwischen", origin: "Vietnam" }
  },
  {
    id: "2",
    slug: generateSlug("Worlds End Denim Boxer Jacket"),
    brandName: "Vivienne Westwood",
    productName: "Worlds End Denim Boxer Jacket",
    price: "420€",
    priceNumber: 420,
    imgURL: "https://www.viviennewestwood.com/dw/image/v2/BJGV_PRD/on/demandware.static/-/Sites-viviennewestwood-master-catalog/default/dw69896e20/images/2G01000A-J001M-_GREY-MELANGE_001_large.jpeg?q=80",
    category: "jacken",
    subcategory: "denim",
    colours: [
      { hex: "#630393", name: "Lila" },
      { hex: "#1A1A1A", name: "Schwarz" },
      { hex: "#F5F5F0", name: "Off-White" },
      { hex: "#8B4513", name: "Braun" }
    ],
    catalogue: ["Experimental", "Culture"],
    sizes: ["XS", "S", "M", "L", "XL"],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    isPopular: true,
    isNew: false,
    description: "Iconisches Denim Boxer Jacket von Worlds End. Zeitloses Design mit modernem Twist.",
    images: [
      "https://www.viviennewestwood.com/dw/image/v2/BJGV_PRD/on/demandware.static/-/Sites-viviennewestwood-master-catalog/default/dw69896e20/images/2G01000A-J001M-_GREY-MELANGE_001_large.jpeg?q=80",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=1000&fit=crop"
    ],
    sku: "VW-DENIM-001",
    details: { material: "100% Denim", care: "Maschinenwäsche bei 30°C", origin: "Italien" }
  },
  {
    id: "3",
    slug: generateSlug("D.D. Shell Hooded-Padded Jacket"),
    brandName: "Maison Guava",
    productName: "D.D. Shell Hooded-Padded Jacket",
    price: "320€",
    priceNumber: 320,
    imgURL: "https://eu.manieredevoir.com/cdn/shop/files/MDV_0030_MDV2_be0fab84-a04c-4251-adc9-1fefaa4175c4.jpg?v=1759502594",
    category: "jacken",
    subcategory: "puffer",
    colours: [
      { hex: "#FFFFFF", name: "Weiß" }
    ],
    catalogue: ["Athleisure", "Streetwear"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    isPopular: true,
    isNew: true,
    description: "Funktionale Shell Jacke mit Kapuze und Futter. Ideal für kühle Tage.",
    images: [
      "https://eu.manieredevoir.com/cdn/shop/files/MDV_0030_MDV2_be0fab84-a04c-4251-adc9-1fefaa4175c4.jpg?v=1759502594",
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=1000&fit=crop"
    ],
    sku: "MAISON-SHELL-001",
    details: { material: "Polyester, Baumwolle", care: "Maschinenwäsche bei 40°C", origin: "Portugal" }
  },
  {
    id: "4",
    slug: generateSlug("Oversized Structured Blazer"),
    brandName: "6pm",
    productName: "Oversized Structured Blazer",
    price: "180€",
    priceNumber: 180,
    imgURL: "https://www.viviennewestwood.com/dw/image/v2/BJGV_PRD/on/demandware.static/-/Library-Sites-viviennewestwood-global-content/default/dw8c63789d/images/collections/autumn-winter-25_26/AW2526%20Lookbook/2x3/VW_AW2526_Lookbook_Look_02.jpg?sw=632&sh=948&q=80",
    category: "oberteile",
    subcategory: "blazer",
    colours: [
      { hex: "#0A0A0A", name: "Schwarz" },
      { hex: "#2D2D2D", name: "Anthrazit" }
    ],
    catalogue: ["Culture", "Experimental"],
    sizes: ["XS", "S", "M", "L"],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    isPopular: true,
    isNew: true,
    description: "Einzigartiges Design mit modernen Details. Perfekt für jeden Anlass.",
    images: [
      "https://www.viviennewestwood.com/dw/image/v2/BJGV_PRD/on/demandware.static/-/Library-Sites-viviennewestwood-global-content/default/dw8c63789d/images/collections/autumn-winter-25_26/AW2526%20Lookbook/2x3/VW_AW2526_Lookbook_Look_02.jpg?sw=632&sh=948&q=80",
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=800&h=1000&fit=crop"
    ],
    sku: "6PM-BLAZER-001",
    details: { material: "Baumwolle, Elasthan", care: "Schonwäsche bei 30°C", origin: "Deutschland" }
  },

  // NEW ARRIVALS (additional products)
  {
    id: "5",
    slug: generateSlug("Premium Running Sneaker"),
    brandName: "Puma",
    productName: "Premium Running Sneaker",
    price: "220€",
    priceNumber: 220,
    imgURL: "https://www.manieredevoir.com/cdn/shop/files/GEN-WD-23-10-2025.jpg?crop=center&height=2095&v=1761206881&width=1920",
    category: "schuhe",
    subcategory: "running",
    colours: [
      { hex: "#DE0000", name: "Rot" },
      { hex: "#1A1A1A", name: "Schwarz" }
    ],
    catalogue: ["Streetwear", "Star"],
    sizes: ["38", "39", "40", "41", "42", "43"],
    createdAt: new Date(),
    isPopular: false,
    isNew: true,
    description: "Lange Produktbeschreibung für Testzwecke. Premium Qualität und modernes Design.",
    images: [
      "https://www.manieredevoir.com/cdn/shop/files/GEN-WD-23-10-2025.jpg?crop=center&height=2095&v=1761206881&width=1920",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=1000&fit=crop"
    ],
    sku: "PUMA-RUN-001",
    details: { material: "Synthetik, Textil", care: "Mit feuchtem Tuch abwischen" }
  },
  {
    id: "6",
    slug: generateSlug("Denim Statement Jacket"),
    brandName: "Adidas",
    productName: "Denim Statement Jacket",
    price: "280€",
    priceNumber: 280,
    imgURL: "https://www.viviennewestwood.com/dw/image/v2/BJGV_PRD/on/demandware.static/-/Sites-viviennewestwood-master-catalog/default/dw69896e20/images/2G01000A-J001M-_GREY-MELANGE_001_large.jpeg?q=80",
    category: "jacken",
    subcategory: "denim",
    colours: [
      { hex: "#630393", name: "Lila" },
      { hex: "#1A1A1A", name: "Schwarz" },
      { hex: "#FFFFFF", name: "Weiß" }
    ],
    catalogue: ["Experimental", "Culture"],
    sizes: ["XS", "S", "M", "L", "XL"],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    isPopular: false,
    isNew: false,
    description: "Test-Produkt mit langer Beschreibung für Demonstrationszwecke.",
    images: [
      "https://www.viviennewestwood.com/dw/image/v2/BJGV_PRD/on/demandware.static/-/Sites-viviennewestwood-master-catalog/default/dw69896e20/images/2G01000A-J001M-_GREY-MELANGE_001_large.jpeg?q=80"
    ],
    sku: "ADIDAS-DENIM-001",
    details: { material: "Denim", care: "Maschinenwäsche bei 30°C" }
  },
  {
    id: "7",
    slug: generateSlug("Minimalist Windbreaker"),
    brandName: "Maison Louis",
    productName: "Minimalist Windbreaker",
    price: "190€",
    priceNumber: 190,
    imgURL: "https://eu.manieredevoir.com/cdn/shop/files/MDV_0030_MDV2_be0fab84-a04c-4251-adc9-1fefaa4175c4.jpg?v=1759502594",
    category: "jacken",
    subcategory: "windbreaker",
    colours: [
      { hex: "#FFFFFF", name: "Weiß" }
    ],
    catalogue: ["Athleisure", "Streetwear"],
    sizes: ["S", "M", "L", "XL"],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    isPopular: false,
    isNew: true,
    description: "Minimalistische Windbreaker-Jacke für den urbanen Lifestyle.",
    images: [
      "https://eu.manieredevoir.com/cdn/shop/files/MDV_0030_MDV2_be0fab84-a04c-4251-adc9-1fefaa4175c4.jpg?v=1759502594"
    ],
    sku: "MAISON-WIND-001",
    details: { material: "Polyester", care: "Maschinenwäsche bei 30°C" }
  },
  {
    id: "8",
    slug: generateSlug("Luxury Wool Blazer"),
    brandName: "Gucci",
    productName: "Luxury Wool Blazer",
    price: "890€",
    priceNumber: 890,
    imgURL: "https://www.viviennewestwood.com/dw/image/v2/BJGV_PRD/on/demandware.static/-/Library-Sites-viviennewestwood-global-content/default/dw8c63789d/images/collections/autumn-winter-25_26/AW2526%20Lookbook/2x3/VW_AW2526_Lookbook_Look_02.jpg?sw=632&sh=948&q=80",
    category: "oberteile",
    subcategory: "blazer",
    colours: [
      { hex: "#0A0A0A", name: "Schwarz" },
      { hex: "#2D2D2D", name: "Anthrazit" }
    ],
    catalogue: ["Culture", "Star"],
    sizes: ["XS", "S", "M", "L"],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    isPopular: false,
    isNew: true,
    description: "Sehr lange Produktbeschreibung für Testzwecke. Premium Qualität und exklusives Design.",
    images: [
      "https://www.viviennewestwood.com/dw/image/v2/BJGV_PRD/on/demandware.static/-/Library-Sites-viviennewestwood-global-content/default/dw8c63789d/images/collections/autumn-winter-25_26/AW2526%20Lookbook/2x3/VW_AW2526_Lookbook_Look_02.jpg?sw=632&sh=948&q=80"
    ],
    sku: "GUCCI-WOOL-001",
    details: { material: "Baumwolle", care: "Schonwäsche" }
  }
];

// Helper function to build href
// URL structure: /bekleidung/[category]/[subcategory]/[slug]
// Example: /bekleidung/schuhe/sneaker/nike-air-shoes-5
export const buildProductHref = (product: MockProduct): string => {
  return `/bekleidung/${product.category}/${product.subcategory}/${product.slug}`;
};

// Get popular products (for "Unsere Favoriten" section)
export const getPopularProducts = (): MockProduct[] => {
  return mockProducts.filter(p => p.isPopular === true);
};

// Get new products (for "Neue Arrivals" section)
export const getNewProducts = (): MockProduct[] => {
  return mockProducts.filter(p => p.isNew === true);
};

// Get product by slug (for product detail page)
export const getProductBySlug = (slug: string): MockProduct | undefined => {
  return mockProducts.find(p => p.slug === slug);
};

// Get all products
export const getAllProducts = (): MockProduct[] => {
  return mockProducts;
};

// Get products by category
export const getProductsByCategory = (category: string, subcategory?: string): MockProduct[] => {
  return mockProducts.filter(p => {
    if (subcategory) {
      return p.category === category && p.subcategory === subcategory;
    }
    return p.category === category;
  });
};
