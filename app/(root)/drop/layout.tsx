import type { Metadata } from 'next'
import Footer from '../../Homepage/components/footer'
import DropNavbar from './components/navbar'


export const metadata: Metadata = {
  title: 'Drop Page',
}

export default function DropLayout({ children}: { children: React.ReactNode}) {
  return (
    <div className="bg-black text-white min-h-screen">
      <DropNavbar />
      {children}
    </div>
  )
}