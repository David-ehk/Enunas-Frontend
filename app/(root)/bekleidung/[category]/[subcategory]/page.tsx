import { notFound } from 'next/navigation'
import Link from 'next/link'

interface PageProps {
  params: {
    category: string      // "tops" oder "bottoms"
    subcategory: string   // "tshirts", "sweater", etc.
  }
}

// Zentrale Daten
const subcategoryData = {
  tops: {
    tshirts: {
      title: 'T-Shirts & Oberteile',
      description: 'Klassische und moderne T-Shirts für jeden Anlass'
    },
    sweater: {
      title: 'Sweater',
      description: 'Kuschelige Sweater für kalte Tage'
    },
    hoodie: {
      title: 'Hoodies',
      description: 'Lässige Hoodies in verschiedenen Styles'
    },
    jacke: {
      title: 'Jacken & Puffer',
      description: 'Warme Jacken für jede Jahreszeit'
    }
  },
  bottoms: {
    shorts: {
      title: 'Shorts',
      description: 'Komfortable Shorts für den Sommer'
    },
    jogging: {
      title: 'Jogginghosen',
      description: 'Bequeme Jogginghosen für Sport und Freizeit'
    },
    jeans: {
      title: 'Jeans',
      description: 'Klassische und moderne Jeans-Styles'
    }
  }
}

export default function SubcategoryPage({ params }: PageProps) {
  const { category, subcategory } = params

  // Validierung
  const categoryData = subcategoryData[category as keyof typeof subcategoryData]
  if (!categoryData) {
    notFound()
  }

  const data = categoryData[subcategory as keyof typeof categoryData]
  if (!data) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="text-sm mb-6 text-gray-600">
        <Link href="/" className="hover:text-black">Home</Link>
        {' / '}
        <Link href="/bekleidung" className="hover:text-black">Bekleidung</Link>
        {' / '}
        <Link href={`/bekleidung/${category}`} className="hover:text-black capitalize">
          {category}
        </Link>
        {' / '}
        <span className="text-black"></span>
      </nav>

      {/* Titel */}
      <h1 className="text-4xl font-cormorant mb-4">
        
      </h1>

      {/* Beschreibung */}
      <p className="text-gray-600 mb-12">
        
      </p>

      {/* Filter & Sort */}
      <div className="flex gap-4 mb-8">
        <select className="border px-4 py-2 rounded">
          <option>Sortieren nach</option>
          <option>Preis aufsteigend</option>
          <option>Preis absteigend</option>
          <option>Neueste zuerst</option>
        </select>
        
        <select className="border px-4 py-2 rounded">
          <option>Größe</option>
          <option>XS</option>
          <option>S</option>
          <option>M</option>
          <option>L</option>
          <option>XL</option>
        </select>
      </div>

      {/* Produkte Grid - später mit echten Daten */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="border p-4">
          <div className="bg-gray-200 aspect-square mb-4"></div>
          <h3 className="font-spartan mb-2">Produkt Platzhalter</h3>
          <p className="text-gray-600">49,99 €</p>
        </div>
        
        <div className="border p-4">
          <div className="bg-gray-200 aspect-square mb-4"></div>
          <h3 className="font-spartan mb-2">Produkt Platzhalter</h3>
          <p className="text-gray-600">59,99 €</p>
        </div>
        
        <div className="border p-4">
          <div className="bg-gray-200 aspect-square mb-4"></div>
          <h3 className="font-spartan mb-2">Produkt Platzhalter</h3>
          <p className="text-gray-600">39,99 €</p>
        </div>
        
        <div className="border p-4">
          <div className="bg-gray-200 aspect-square mb-4"></div>
          <h3 className="font-spartan mb-2">Produkt Platzhalter</h3>
          <p className="text-gray-600">69,99 €</p>
        </div>
      </div>
    </div>
  )
}

// Static Site Generation
export async function generateStaticParams() {
  const params: { category: string; subcategory: string }[] = []
  
  // Für jede Category und Subcategory
  Object.keys(subcategoryData).forEach(category => {
    const subs = subcategoryData[category as keyof typeof subcategoryData]
    Object.keys(subs).forEach(subcategory => {
      params.push({ category, subcategory })
    })
  })
  
  return params
  
  // Ergebnis:
  // [
  //   { category: 'tops', subcategory: 'tshirts' },
  //   { category: 'tops', subcategory: 'sweater' },
  //   { category: 'tops', subcategory: 'hoodie' },
  //   ...
  // ]
}