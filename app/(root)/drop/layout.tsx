import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Drop Page',
}

export default function DropLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-black text-white min-h-screen">
      {children}
    </div>
  )
}