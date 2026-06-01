import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

export default function EmptyCart() {
  return (
    <div className="text-center py-20 lg:py-28 max-w-md mx-auto">
      <ShoppingBag
        className="w-14 h-14 mx-auto text-enunas-gray-light mb-8"
        strokeWidth={1.2}
        aria-hidden
      />
      <p className="font-league-spartan text-[11px] tracking-[0.35em] uppercase text-enunas-gray-medium mb-3 animate-fade-in">
        Warenkorb
      </p>
      <h1
        className="font-cormorant text-3xl lg:text-4xl font-light text-enunas-black mb-3 animate-fade-in-up"
        style={{ animationDelay: '100ms' }}
      >
        Dein Warenkorb ist leer
      </h1>
      <p
        className="font-cormorant italic text-base lg:text-lg text-enunas-gray-dark mb-10 leading-relaxed animate-fade-in-up"
        style={{ animationDelay: '200ms' }}
      >
        Entdecke unsere Pieces und finde etwas, das deine Geschichte erzählt.
      </p>
      <Link
        href="/bekleidung"
        className="group relative inline-block overflow-hidden bg-enunas-purple text-white px-10 py-4 hover:bg-enunas-purple-dark transition-colors duration-300 ease-out-expo"
      >
        <span className="absolute left-1/2 -translate-x-1/2 top-[14%] w-full h-[1px] bg-white/60 transition-all duration-500 ease-out group-hover:w-[70%]" />
        <span className="relative z-10 font-cormorant text-[18px] tracking-[0.06em]">Kollektion entdecken</span>
        <span className="absolute left-1/2 -translate-x-1/2 bottom-[14%] w-full h-[1px] bg-white/60 transition-all duration-500 ease-out group-hover:w-[70%]" />
      </Link>
    </div>
  )
}
