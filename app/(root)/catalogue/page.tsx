import  Hero  from '@/app/(root)/catalogue/components/Hero'
import CatalogueDescription from '@/app/(root)/catalogue/components/CatalogueDescription'
import CuratedRecommendations from '@/components/CuratedRecommendations'


export default function cataloge() {
  return (
    <div>
        <section>
            <Hero/>
        </section>
        <section className=''>
            <CatalogueDescription/>
        </section>
        <CuratedRecommendations title="Das könnte dir auch gefallen" />
    </div>
  )
}
