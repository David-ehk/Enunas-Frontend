import React from 'react'
import Test from './components/Test'
import CuratedDropSection from './components/CuratedDropSection'

function page() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <section className="flex-1">
        <Test />
      </section>
      <CuratedDropSection />
    </div>
  )
}

export default page