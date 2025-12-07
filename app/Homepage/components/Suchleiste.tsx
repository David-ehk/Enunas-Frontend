import { useState } from 'react'
import { Input } from "@/components/ui/input"
import Link from 'next/link'

interface SearchBarProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchBar({ isOpen, onClose }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('')

  // Highlights - könnten aus einer API/Datenbank kommen
  const highlights = [
    { title: 'GESCHENKE FUER SIE', href: '/geschenke/sie' },
    { title: 'GESCHENKE FUER IHN', href: '/geschenke/ihn' },
    { title: 'Accesoirs', href: '/accesoirs' },
    { title: 'DROPS', href: '/Drops' },
    { title: 'ALLE BEKLEIDUNG ', href: '/bekleidung' }
  ]

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTerm = e.target.value
    setSearchTerm(newTerm)
    
    // Hier Query ausführen wenn mehr als 2 Zeichen
    if (newTerm.length > 2) {
      // fetch(`/api/search?q=${newTerm}`)
      console.log('Suche nach:', newTerm)
    }
  }

  const handleLinkClick = () => {
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300
                    ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Search Sidebar */}
      <aside 
        className={`fixed top-0 right-0 h-full w-full md:w-[500px] bg-[#F5F5F0] z-50
                    transform transition-transform duration-500 ease-out
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center
                   hover:bg-black/5 rounded-full transition-all duration-300"
          aria-label="Suche schließen"
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </button>

        {/* Search Input Container */}
        <div className="px-6 pt-32 pb-8">
          <div className="relative">
            <Input
              type="text"
              placeholder="SUCHEN"
              value={searchTerm}
              onChange={handleSearchChange}
              autoFocus
              className="w-full bg-transparent border-0 border-b-[1.5px] border-black
                       rounded-none px-0 pb-3 text-[13px] tracking-[0.1em] uppercase
                       placeholder:text-black/40 placeholder:tracking-[0.1em]
                       focus-visible:ring-0 focus-visible:ring-offset-0
                       focus-visible:border-black transition-colors duration-300"
            />
            {/* Search Icon */}
            <svg 
              className="absolute right-0 top-1 w-5 h-5 text-black/60" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>
        </div>

        {/* Highlights Section */}
        <div className="px-6 py-8">
          <h3 className="text-xs tracking-[0.15em] uppercase mb-6 text-black/80">
            HIGHLIGHTS
          </h3>
          
          <ul className="space-y-3">
            {highlights.map((item, index) => (
              <li key={index}>
                <Link
                  href={item.href}
                  onClick={handleLinkClick}
                  className="block text-[13px] tracking-[0.05em] uppercase
                           hover:translate-x-1 transition-transform duration-300
                           text-black hover:text-black"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Search Results (wenn searchTerm > 0) */}
        {searchTerm.length > 0 && (
          <div className="px-6 py-4 border-t border-black/10">
            <h3 className="text-[11px] tracking-[0.15em] uppercase font-medium mb-4 text-black/80">
              SUCHERGEBNISSE
            </h3>
            
            {/* Beispiel-Ergebnisse - später dynamisch */}
            <div className="space-y-4">
              <p className="text-sm text-black/60">
                {searchTerm.length < 3 
                  ? 'Geben Sie mindestens 3 Zeichen ein...' 
                  : `Suche nach "${searchTerm}"...`}
              </p>
              
              {/* Hier kommen später die echten Suchergebnisse */}
            </div>
          </div>
        )}
      </aside>
    </>
  )
}