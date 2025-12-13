import { Product } from './product'
import { generateSlug } from './product'

// Mock-Produktdatenbank
export const mockProducts: Product[] = [
  {
    id: '1',
    slug: 'nike-air-shoes-5',
    name: 'nike air shoes 5',
    brand: 'Nike',
    description: 'Premium Nike Air Shoes mit modernem Design und maximalem Komfort. Perfekt für den Alltag und Sport.',
    price: 220,
    currency: 'EUR',
    colors: [
      { id: 'red', name: 'Red', hex: '#DE0000', slug: 'red' },
      { id: 'black', name: 'Black', hex: '#000000', slug: 'black' },
      { id: 'white', name: 'White', hex: '#FFFFFF', slug: 'white' },
    ],
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    sku: 'NIKE-AIR-5-001',
    images: [
      'https://www.manieredevoir.com/cdn/shop/files/GEN-WD-23-10-2025.jpg?crop=center&height=2095&v=1761206881&width=1920',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=1000&fit=crop',
    ],
    category: ['bekleidung', 'schuhe'],
    details: {
      material: 'Leder, Textil',
      care: 'Mit feuchtem Tuch abwischen',
      origin: 'Vietnam',
    },
  },
  {
    id: '2',
    slug: 'worlds-end-denim-boxer-jacket',
    name: 'Worlds End Denim Boxer Jacket',
    brand: 'Jordan',
    description: 'Iconisches Denim Boxer Jacket von Worlds End. Zeitloses Design mit modernem Twist.',
    price: 220,
    currency: 'EUR',
    colors: [
      { id: 'purple', name: 'Purple', hex: '#630393', slug: 'purple' },
      { id: 'blue', name: 'Blue', hex: '#0000FF', slug: 'blue' },
      { id: 'black', name: 'Black', hex: '#000000', slug: 'black' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    sku: 'JORDAN-DENIM-001',
    images: [
      'https://www.viviennewestwood.com/dw/image/v2/BJGV_PRD/on/demandware.static/-/Sites-viviennewestwood-master-catalog/default/dw69896e20/images/2G01000A-J001M-_GREY-MELANGE_001_large.jpeg?q=80',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=1000&fit=crop',
    ],
    category: ['bekleidung', 'jacken'],
    details: {
      material: '100% Denim',
      care: 'Maschinenwäsche bei 30°C',
      origin: 'Italien',
    },
  },
  {
    id: '3',
    slug: 'dd-shell-hooded-padded-jacket',
    name: 'D.D. Shell hooded-padded jacket',
    brand: 'Maison Guava',
    description: 'Funktionale Shell Jacke mit Kapuze und Futter. Ideal für kühle Tage.',
    price: 220,
    currency: 'EUR',
    colors: [
      { id: 'white', name: 'White', hex: '#FFFFFF', slug: 'white' },
      { id: 'black', name: 'Black', hex: '#000000', slug: 'black' },
      { id: 'grey', name: 'Grey', hex: '#808080', slug: 'grey' },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    sku: 'MAISON-SHELL-001',
    images: [
      'https://eu.manieredevoir.com/cdn/shop/files/MDV_0030_MDV2_be0fab84-a04c-4251-adc9-1fefaa4175c4.jpg?v=1759502594',
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=1000&fit=crop',
    ],
    category: ['bekleidung', 'jacken'],
    details: {
      material: 'Polyester, Baumwolle',
      care: 'Maschinenwäsche bei 40°C',
      origin: 'Portugal',
    },
  },
  {
    id: '4',
    slug: 'produktbeschreibung-random-blabalba',
    name: 'Produktbeschreibung random blabalba',
    brand: '6pm',
    description: 'Einzigartiges Design mit modernen Details. Perfekt für jeden Anlass.',
    price: 220,
    currency: 'EUR',
    colors: [
      { id: 'black', name: 'Black', hex: '#000000', slug: 'black' },
      { id: 'brown', name: 'Brown', hex: '#8B4513', slug: 'brown' },
    ],
    sizes: ['M', 'L', 'XL'],
    sku: '6PM-RANDOM-001',
    images: [
      'https://www.viviennewestwood.com/dw/image/v2/BJGV_PRD/on/demandware.static/-/Library-Sites-viviennewestwood-global-content/default/dw8c63789d/images/collections/autumn-winter-25_26/AW2526%20Lookbook/2x3/VW_AW2526_Lookbook_Look_02.jpg?sw=632&sh=948&q=80',
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=800&h=1000&fit=crop',
    ],
    category: ['bekleidung', 'oberteile'],
    details: {
      material: 'Baumwolle, Elasthan',
      care: 'Schonwäsche bei 30°C',
      origin: 'Deutschland',
    },
  },
  // Zusätzliche Produkte für NewProducts
  {
    id: '5',
    slug: 'nike-air-shoes-5-auch-hier-richtig-lange-ohne-grund',
    name: 'nike air shoes 5 auch hier richtig lange ohne Grund',
    brand: 'Puma',
    description: 'Lange Produktbeschreibung für Testzwecke. Premium Qualität und modernes Design.',
    price: 220,
    currency: 'EUR',
    colors: [
      { id: 'red', name: 'Red', hex: '#DE0000', slug: 'red' },
      { id: 'white', name: 'White', hex: '#FFFFFF', slug: 'white' },
    ],
    sizes: ['39', '40', '41', '42', '43'],
    sku: 'PUMA-AIR-LONG-001',
    images: [
      'https://www.manieredevoir.com/cdn/shop/files/GEN-WD-23-10-2025.jpg?crop=center&height=2095&v=1761206881&width=1920',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=1000&fit=crop',
    ],
    category: ['bekleidung', 'schuhe'],
    details: {
      material: 'Synthetik, Textil',
      care: 'Mit feuchtem Tuch abwischen',
    },
  },
  {
    id: '6',
    slug: 'worlds-end-denim-boxer-jacket-einfach-zum-test-blablabla',
    name: 'Worlds End Denim Boxer Jacket einfach zum test blablabla',
    brand: 'Addidas',
    description: 'Test-Produkt mit langer Beschreibung für Demonstrationszwecke.',
    price: 220,
    currency: 'EUR',
    colors: [
      { id: 'purple', name: 'Purple', hex: '#630393', slug: 'purple' },
      { id: 'blue', name: 'Blue', hex: '#0000FF', slug: 'blue' },
    ],
    sizes: ['S', 'M', 'L'],
    sku: 'ADIDAS-TEST-001',
    images: [
      'https://www.viviennewestwood.com/dw/image/v2/BJGV_PRD/on/demandware.static/-/Sites-viviennewestwood-master-catalog/default/dw69896e20/images/2G01000A-J001M-_GREY-MELANGE_001_large.jpeg?q=80',
    ],
    category: ['bekleidung', 'jacken'],
    details: {
      material: 'Denim',
      care: 'Maschinenwäsche bei 30°C',
    },
  },
  {
    id: '7',
    slug: 'produktbeschreibung-random-blabalba-soll-richtig-lange-sein',
    name: 'Produktbeschreibung random blabalba soll richtig lange sein',
    brand: 'Gucci',
    description: 'Sehr lange Produktbeschreibung für Testzwecke. Premium Qualität und exklusives Design.',
    price: 220,
    currency: 'EUR',
    colors: [
      { id: 'black', name: 'Black', hex: '#000000', slug: 'black' },
    ],
    sizes: ['M', 'L', 'XL'],
    sku: 'GUCCI-LONG-001',
    images: [
      'https://www.viviennewestwood.com/dw/image/v2/BJGV_PRD/on/demandware.static/-/Library-Sites-viviennewestwood-global-content/default/dw8c63789d/images/collections/autumn-winter-25_26/AW2526%20Lookbook/2x3/VW_AW2526_Lookbook_Look_02.jpg?sw=632&sh=948&q=80',
    ],
    category: ['bekleidung', 'oberteile'],
    details: {
      material: 'Baumwolle',
      care: 'Schonwäsche',
    },
  },
]

// Helper-Funktion: Produkt anhand Slug finden
export function getProductBySlug(slug: string): Product | undefined {
  return mockProducts.find(product => product.slug === slug)
}

// Helper-Funktion: Alle Produkte abrufen
export function getAllProducts(): Product[] {
  return mockProducts
}

// Helper-Funktion: Slug aus Produktname generieren (für URL-Matching)
export function slugifyProductName(name: string): string {
  return generateSlug(name)
}

