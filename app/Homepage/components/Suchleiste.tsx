'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import Link from 'next/link'

interface SearchBarProps {
  isOpen: boolean
  onClose: () => void
}

const SearchBar = ({ isOpen, onClose }: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Mount state for portal (SSR safety)
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Lock body scroll when search is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Highlights - könnten aus einer API/Datenbank kommen
  const highlights = [
    { title: 'GESCHENKE FUER SIE', href: '/geschenke/sie' },
    { title: 'GESCHENKE FUER IHN', href: '/geschenke/ihn' },
    { title: 'Accesoirs', href: '/accesoirs' },
    { title: 'DROPS', href: '/Drops' },
    { title: 'ALLE BEKLEIDUNG ', href: '/bekleidung' }
  ]

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim().length > 0) {
      router.push(`/bekleidung?q=${encodeURIComponent(searchTerm.trim())}`)
      onClose()
      setSearchTerm('')
    }
  }

  const handleLinkClick = () => {
    onClose()
  }

  // Search content to be portaled
  const searchContent = (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-all duration-300
                    ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ zIndex: 9998 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Search Sidebar */}
      <aside
        className={`fixed top-0 right-0 w-full md:w-[500px]
                    transform transition-transform duration-500 ease-out
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ backgroundColor: '#F5F5F0', zIndex: 9999, height: '100vh', minHeight: '100vh' }}
        aria-label="Search panel"
        role="dialog"
        aria-modal="true"
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
              onKeyDown={handleKeyDown}
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

        {searchTerm.trim().length > 0 && (
          <div className="px-6 py-4 border-t border-black/10">
            <p className="text-xs text-black/50 tracking-[0.05em]">
              Enter drücken, um nach „{searchTerm}" zu suchen
            </p>
          </div>
        )}
      </aside>
    </>
  )

  // Use portal to render at document body level (escapes header stacking context)
  // Only render portal after component is mounted (SSR safety)
  if (!mounted) return null

  return createPortal(searchContent, document.body)
}

export default SearchBar