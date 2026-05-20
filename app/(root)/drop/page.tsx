import React from 'react'
import DropNavbar from './components/navbar'
import Test from './components/Test'

function page() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      
      <section className="flex-1">
        <Test />
      </section>
      
    </div>
  )
}

export default page