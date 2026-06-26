'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface SearchBarProps {
  isOpen: boolean
  onClose: () => void
}

const highlights = [
  { title: 'Alle Bekleidung', href: '/bekleidung' },
  { title: 'Neu', href: '/neu' },
  { title: 'Trendy', href: '/trendy' },
  { title: 'Drops', href: '/drop' },
  { title: 'Catalogue', href: '/catalogue' },
]

const SearchBar = ({ isOpen, onClose }: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [mounted, setMounted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Focus input whenever the panel opens (works on every open, not just first mount)
  useEffect(() => {
    if (!isOpen) return
    const t = setTimeout(() => inputRef.current?.focus(), 60)
    return () => clearTimeout(t)
  }, [isOpen])

  // Body scroll lock + Escape to close
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [isOpen, onClose])

  const handleSubmit = useCallback(() => {
    if (!searchTerm.trim()) return
    router.push(`/bekleidung?q=${encodeURIComponent(searchTerm.trim())}`)
    onClose()
    setSearchTerm('')
  }, [searchTerm, router, onClose])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit()
  }

  if (!mounted) return null

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ zIndex: 9998 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Search panel */}
      <aside
        className={`fixed top-0 right-0 w-full md:w-[500px] flex flex-col
                    transition-transform duration-500 ease-out-expo ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ backgroundColor: '#F5F5F0', zIndex: 9999, height: '100dvh' }}
        role="dialog"
        aria-modal="true"
        aria-label="Suchbereich"
      >
        {/* Corner bracket — top-right */}
        <span
          className="absolute pointer-events-none"
          style={{
            top: 16, right: 16, width: 14, height: 14,
            borderTop: '1px solid rgba(10,10,10,0.3)',
            borderRight: '1px solid rgba(10,10,10,0.3)',
          }}
        />
        {/* Corner bracket — bottom-left */}
        <span
          className="absolute pointer-events-none"
          style={{
            bottom: 16, left: 16, width: 14, height: 14,
            borderBottom: '1px solid rgba(10,10,10,0.3)',
            borderLeft: '1px solid rgba(10,10,10,0.3)',
          }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center
                     hover:bg-black/8 rounded-full transition-colors duration-200"
          aria-label="Suche schließen"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Input area */}
        <div className="px-6 sm:px-8 pt-20 pb-6">
          <div className="flex items-center border-b-[1.5px] border-black pb-3 gap-3">
            {/* Tappable search icon on the left */}
            <button
              onClick={handleSubmit}
              aria-label="Suchen"
              className="flex-shrink-0 text-black/50 hover:text-black transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <input
              ref={inputRef}
              type="search"
              enterKeyHint="search"
              placeholder="SUCHEN"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-0 rounded-none
                         text-[13px] font-league-spartan tracking-[0.1em] uppercase
                         placeholder:text-black/40 placeholder:tracking-[0.1em]
                         focus:outline-none transition-colors duration-300"
            />
          </div>
        </div>

        {/* Highlights */}
        <div className="px-6 sm:px-8 flex-1 overflow-y-auto">
          <p className="text-[10px] font-league-spartan tracking-[0.2em] uppercase text-black/45 mb-4">
            Highlights
          </p>
          <ul>
            {highlights.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="group flex items-center py-3.5 border-b border-black/8
                             font-league-spartan text-[13px] tracking-[0.08em] uppercase
                             text-black hover:text-enunas-purple transition-colors duration-200"
                >
                  <span className="block w-0 group-hover:w-4 h-px bg-enunas-purple mr-0 group-hover:mr-3
                                   transition-all duration-300 ease-out-expo flex-shrink-0" />
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Hint when typing */}
        {searchTerm.trim().length > 0 && (
          <div className="px-6 sm:px-8 py-4 border-t border-black/10">
            <p className="font-league-spartan text-[11px] text-black/45 tracking-[0.05em]">
              „{searchTerm}" suchen — Enter oder auf die Lupe tippen
            </p>
          </div>
        )}
      </aside>
    </>,
    document.body
  )
}

export default SearchBar
