'use client'

interface CartHeaderProps {
  itemCount: number;
}

export default function CartHeader({ itemCount }: CartHeaderProps) {
  return (
    <div className="text-center mb-12 lg:mb-14">
      <p className="font-league-spartan text-[11px] tracking-[0.35em] uppercase text-enunas-gray-medium mb-3 animate-fade-in">
        Warenkorb
      </p>
      <h1
        className="font-cormorant text-4xl lg:text-5xl font-light text-enunas-black animate-fade-in-up"
        style={{ animationDelay: '100ms' }}
      >
        {itemCount} {itemCount === 1 ? 'Artikel' : 'Artikel'}
      </h1>
    </div>
  )
}
