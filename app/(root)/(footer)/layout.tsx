import Navbar from '@/app/Homepage/components/navbar'
import Footer from '@/app/Homepage/components/footer'

export default function FooterPagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="h-[54px] sm:h-[70px]" />
      <main className="min-h-screen bg-white">
        {children}
      </main>
      <Footer />
    </>
  )
}
