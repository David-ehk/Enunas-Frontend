import  Hero  from '@/app/(root)/catalogue/components/Hero'
import CatalogueDescription from '@/app/(root)/catalogue/components/CatalogueDescription'


export default function cataloge() {
  return (
    <main>
        <section>
            <Hero/>
        </section>
        <section className=''>
            <CatalogueDescription/>
        </section>
        
    </main>
  )
}
