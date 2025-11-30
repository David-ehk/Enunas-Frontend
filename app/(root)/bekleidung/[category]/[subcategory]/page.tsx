import { notFound } from 'next/navigation'
import Link from 'next/link'

interface PageProps {
  params: {
    category: string      // "tops" oder "bottoms"
    subcategory: string   // "tshirts", "sweater", etc.
  }
}

// ✅ Type für Subcategory Data definieren
interface SubcategoryInfo {
  title: string
  description: string
}

// ✅ Type für Category Data
interface CategoryData {
  [key: string]: SubcategoryInfo
}

// ✅ Type für gesamte Struktur
interface SubcategoryDataStructure {
  [key: string]: CategoryData
}

// Zentrale Daten
const subcategoryData: SubcategoryDataStructure = {
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
    <div className="max-w-7xl mx-auto px-4 py-8 bg-white sm:pt-30 pt-20 ">
    

      {/* Titel */}
      <h1 className="text-4xl  flex justify-center mb-4">
        {data.title}
      </h1>

    

      {/* Beschreibung */}
      <p className="text-black font-light text-lg md:text-xl flex justify-center mb-12 ">
        {data.description}
      </p>

       {/* Artikelanzahl muss noch dynamisch gemacht werden */}
        <p className='text-black/75 font-light text-lg md:text-xl flex justify-center mb-12'>
            20 Artikel
        </p>

        <br/>

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