import { notFound } from 'next/navigation'

interface PageProps {
  params: {
    category: string
  }
}

// ✅ ZENTRALE DATEN-QUELLE
const categoryData = {
  tops: {
    title: 'Oberteile',
    description: 'Entdecke unsere neuesten T-Shirts, Sweater und Hoodies',
    subcategories: [
      { name: 'T-Shirts', href: '/bekleidung/tops/tshirts' },
      { name: 'Sweater', href: '/bekleidung/tops/sweater' },
      { name: 'Hoodies', href: '/bekleidung/tops/hoodie' },
      { name: 'Jacken', href: '/bekleidung/tops/jacke' }
    ]
  },
  bottoms: {
    title: 'Hosen & Shorts',
    description: 'Die perfekte Passform für jeden Style',
    subcategories: [
      { name: 'Shorts', href: '/bekleidung/bottoms/shorts' },
      { name: 'Jogginghosen', href: '/bekleidung/bottoms/jogging' },
      { name: 'Jeans', href: '/bekleidung/bottoms/jeans' }
    ]
  }
}

export default function CategoryPage({ params }: PageProps) {
  const { category } = params

  // ✅ Validierung + Daten holen in einem Schritt
  const data = categoryData[category as keyof typeof categoryData]
  
  if (!data) {
    notFound()  // 404 wenn Kategorie nicht existiert
  }

  return (
     
    <div className="max-w-7xl mx-auto px-4 py-8 bg-white sm:pt-30 pt-20 ">
      {/* Titel */}
      
      <h1 className="text-4xl flex justify-center mb-4">
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

      {/* Unterkategorien ist gerade von UI/UX quatsch */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {data.subcategories.map((sub) => (
          <a
            key={sub.href}
            href={sub.href}
            className="border p-6 hover:border-black transition-colors"
          >
            <h3 className="text-lg font-spartan">{sub.name}</h3>
          </a>
        ))}
      </div>

      {/* Später: Produkte Grid */}
      <div className="grid grid-cols-4 gap-6">
        {/* ProductCards hier */}
      </div>
    </div>
  )
}
// ist Optional für Static Site Generation
export async function generateStaticParams() {
  return Object.keys(categoryData).map(category => ({
    category
  }))
}