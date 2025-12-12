import React from 'react'
import DropNavbar from './components/navbar'
import Footer from '../../Homepage/components/footer'

function page() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <DropNavbar />
      <main className="flex-1 flex items-center justify-center pt-20">
        <h2 className="text-white text-4xl md:text-6xl font-medium">comming soon</h2>
      </main>
      <Footer />
    </div>
  )
}

export default page