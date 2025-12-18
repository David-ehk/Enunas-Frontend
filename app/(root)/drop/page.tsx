import React from 'react'
import DropNavbar from './components/navbar'
import Test from './components/Test'

export default function page() {
  return (
    <main className="min-h-screen bg-black flex flex-col">
      
      <section className="flex-1">
        <Test />
      </section>
      
    </main>
  )
}
