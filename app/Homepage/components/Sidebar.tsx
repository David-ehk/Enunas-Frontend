import Link from 'next/link'
import { useState, useEffect } from 'react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)

  // Submenu schließen wenn Hauptmenü geschlossen wird
  useEffect(() => {
    if (!isOpen) {
      setActiveSubmenu(null)
      setOpenAccordion(null)
    }
  }, [isOpen])

  // vlt relevant muss ich noch verstehen richtig
  interface MenuItem {
    title: string
    href?: string
    hasSubmenu: boolean
    color?: string  // <- Optional, weil nicht alle Items Farbe haben
    submenu?: {
      showAll: { title: string; href: string }
      categories: Array<{
        title: string
        items: Array<{ title: string; href: string }>
      }>
    }
  }

  const menuItems: MenuItem[] = [
    { title: 'Neu', href: '/neu', hasSubmenu: false },
    { title: 'Trendy', href: '/trendy', hasSubmenu: false },
    { title: 'Catalogue', href: '/catalogue', hasSubmenu: false, color: "#DAD4CB" },
    {
      title: 'Bekleidung',
      hasSubmenu: true,
      submenu: {
        showAll: { title: 'Siehe Alle Bekleidung', href: '/bekleidung' },
        categories: [
          {
            title: 'Tops',
            items: [
              { title: 'Siehe Alle Tops', href: '/bekleidung/tops' },
              { title: 'T-Shirts / Oberteile', href: '/bekleidung/tops/tshirts' },
              { title: 'Sweater', href: '/bekleidung/tops/sweater' },
              { title: 'Hoodie', href: '/bekleidung/tops/hoodie' },
              { title: 'Jacke / Puffer', href: '/bekleidung/tops/jacke' }
            ]
          },
          {
            title: 'Bottoms',
            items: [
              { title: 'Siehe Alle Bottoms', href: '/bekleidung/bottoms' },
              { title: 'Shorts', href: '/bekleidung/bottoms/shorts' },
              { title: 'Jogging', href: '/bekleidung/bottoms/jogging' },
              { title: 'Jeans', href: '/bekleidung/bottoms/jeans' }
            ]
          }
        ]
      }
    },
    {
      title: 'Women',
      hasSubmenu: true,
      submenu: {
        showAll: { title: 'Siehe Alle Women', href: '/women' },
        categories: [
          {
            title: 'Tops',
            items: [
              { title: 'Siehe Alle Tops', href: '/women/tops' },
              { title: 'Blusen', href: '/women/tops/blusen' },
              { title: 'T-Shirts', href: '/women/tops/tshirts' },
              { title: 'Sweater', href: '/women/tops/sweater' }
            ]
          },
          {
            title: 'Bottoms',
            items: [
              { title: 'Siehe Alle Bottoms', href: '/women/bottoms' },
              { title: 'Röcke', href: '/women/bottoms/roecke' },
              { title: 'Hosen', href: '/women/bottoms/hosen' },
              { title: 'Jeans', href: '/women/bottoms/jeans' }
            ]
          }
        ]
      }
    },
    {
      title: 'Men',
      hasSubmenu: true,
      submenu: {
        showAll: { title: 'Siehe Alle Men', href: '/men' },
        categories: [
          {
            title: 'Tops',
            items: [
              { title: 'Siehe Alle Tops', href: '/men/tops' },
              { title: 'Hemden', href: '/men/tops/hemden' },
              { title: 'T-Shirts', href: '/men/tops/tshirts' },
              { title: 'Sweater', href: '/men/tops/sweater' },
              { title: 'Hoodie', href: '/men/tops/hoodie' }
            ]
          },
          {
            title: 'Bottoms',
            items: [
              { title: 'Siehe Alle Bottoms', href: '/men/bottoms' },
              { title: 'Shorts', href: '/men/bottoms/shorts' },
              { title: 'Hosen', href: '/men/bottoms/hosen' },
              { title: 'Jeans', href: '/men/bottoms/jeans' }
            ]
          }
        ]
      }
    },
    { title: 'Marken', href: '/marken', hasSubmenu: false },
    { title: 'Drops', href: '/drop', hasSubmenu: false, color: "#000000" },
    { title: 'Sale', href: '/sale', hasSubmenu: false, color: "#DE0000" }
  ]

  const handleCategoryClick = (item: any) => {
    if (item.hasSubmenu) {
      setActiveSubmenu(item.title)
    } else {
      window.location.href = item.href
      onClose()
    }
  }

  const toggleAccordion = (title: string) => {
    setOpenAccordion(openAccordion === title ? null : title)
  }

  const handleLinkClick = () => {
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-500
                    ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ zIndex: 9998 }}
        onClick={onClose}
      />

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 left-0 w-full sm:w-96 text-white
                    transform transition-all duration-500 ease-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ backgroundColor: '#370E4D', zIndex: 9999, height: '100vh', minHeight: '100vh' }}
      >
        {/* Header */}
        <div className="flex items-center px-8 py-4 border-b border-white/10">
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-full transition-all duration-300 group"
          >
            <svg
              className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300"
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
          <p className="text-xl tracking-wider">Schließen</p>
        </div>

        {/* Navigation */}
        <nav className="h-[calc(100%-120px)] overflow-y-auto px-8 py-8">
          <ul className="space-y-2">
            {menuItems.map((item: any) => (
              <li key={item.title}>
                <button
                  onClick={() => handleCategoryClick(item)}
                  className="w-full group relative"
                >
                  <div className="flex items-center justify-between py-4 
                              ">
                    <span className="font-spartan text-sm tracking-[0.2em] uppercase
                                   group-hover:tracking-[0.3em] transition-all duration-300">
                      {item.title}
                    </span>
                    {item.hasSubmenu && (
                      <svg
                        className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1
                                    transition-all duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    )}
                  </div>
                  {item.color && (
                    <div
                      className="text-color absolute left-0 bottom-0 w-full h-[1px] transition-all duration-300 group-hover:opacity-100 opacity-60"
                      style={{ backgroundColor: item.color }}
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 w-full px-8 py-6 border-t border-white/10">
          <button className="w-full py-3 px-4 border border-white/20 rounded text-xs
                           tracking-widest uppercase hover:bg-white/5 transition-all duration-300
                           flex items-center justify-between">
            <span>DE / EUR</span>
          </button>
        </div>
      </aside>

      {/* Submenu Sidebar mit Accordion */}
      {activeSubmenu && (
        <aside
          className={`fixed top-0 left-0 w-full sm:left-96 sm:w-96 text-black
                      transition-all duration-500 ease-out
                     ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ backgroundColor: '#F5F5F0', zIndex: 9999, height: '100vh', minHeight: '100vh' }}
        >
          {/* Submenu Header */}
          <div className="sm:hidden flex items-center px-8 py-4 border-b border-white/10 bg-[#370E4D]">
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-full transition-all duration-300 group"
            >
              <svg
                className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300"
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
            <p className="text-xl tracking-wider">Schließen</p>
          </div>

          <div className="flex items-center justify-center px-6 py-8 border-b border-white/10 text-[#370E4D]">
            <button 
              onClick={() => setActiveSubmenu(null)}
              className="flex items-center gap-3 group"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300"
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-3xl">{activeSubmenu}</span>
            </button>
          </div>

          {/* Submenu Content */}
          <nav className="h-[calc(100%-100px)] overflow-y-auto px-6 py-6">
            {/* "Siehe Alle" Link */}
            <a
              href={menuItems.find((item: any) => item.title === activeSubmenu)?.submenu?.showAll.href}
              onClick={handleLinkClick}
              className="block py-4 px-5 mb-4 transition-all duration-300 hover:translate-x-1"
            >
              <span className="font-spartan text-sm tracking-wide uppercase">
                {menuItems.find((item: any) => item.title === activeSubmenu)?.submenu?.showAll.title}
              </span>
            </a>

            {/* Accordion Categories */}
            <ul className="space-y-2">
              {menuItems
                .find((item: any) => item.title === activeSubmenu)
                ?.submenu?.categories?.map((category: any) => (
                  <li key={category.title}>
                    {/* Accordion Button */}
                    <button
                      onClick={() => toggleAccordion(category.title)}
                      className="w-full group"
                    >
                      <div className="flex items-center justify-between py-3 px-4
                                   hover:bg-white/5 rounded transition-all duration-300">
                        <span className="text-sm tracking-wide uppercase">
                          {category.title}
                        </span>
                        <svg
                          className={`w-4 h-4 transition-transform duration-300
                                    ${openAccordion === category.title ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </button>

                    {/* Accordion Content */}
                    <div
                      className={`overflow-hidden transition-all duration-300
                                ${openAccordion === category.title ? 'max-h-96' : 'max-h-0'}`}
                    >
                      <ul className="pl-4 py-2 space-y-1">
                        {category.items.map((item: any) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={handleLinkClick}
                              className={`block py-2 px-4 text-sm rounded transition-all duration-300
                                       hover:bg-white/5 border-l-2 border-transparent hover:border-white/30 hover:translate-x-1
                                       ${item.title.includes('Siehe Alle') ? 'text-[#370E4D] italic' : ''}`}
                            >
                              {item.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                ))}
            </ul>
          </nav>
        </aside>
      )}
    </>
  )
}

export default Sidebar