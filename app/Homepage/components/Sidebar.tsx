import React, { useEffect } from 'react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  
  // ESC-Taste zum Schließen & Body-Scroll verhindern
  

  return (
    <>
  
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 lg:hidden
                    ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 left-0 h-full w-80 bg-white z-50 shadow-2xl 
                    transform transition-transform duration-300 ease-out 
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Navigation Menü"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="font-cormorant text-3xl">Menü</h2>
          
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 
                       rounded-full transition-colors"
            aria-label="Menü schließen"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>

        {/* Navigation Content */}
        <nav className="flex flex-col h-[calc(100%-80px)]">
          {/* Main Links */}
          <div className="flex-1 overflow-y-auto p-6">
            <ul className="space-y-1">
              <li>
                <a 
                  href="/neu"
                  onClick={onClose}
                  className="block py-3 px-4 font-spartan text-base hover:bg-gray-100 
                           rounded-lg transition-colors"
                >
                  Neu
                </a>
              </li>
              <li>
                <a 
                  href="/women"
                  onClick={onClose}
                  className="block py-3 px-4 font-spartan text-base hover:bg-gray-100 
                           rounded-lg transition-colors"
                >
                  Women
                </a>
              </li>
              <li>
                <a 
                  href="/men"
                  onClick={onClose}
                  className="block py-3 px-4 font-spartan text-base hover:bg-gray-100 
                           rounded-lg transition-colors"
                >
                  Men
                </a>
              </li>
             </ul>
         </div>

          {/* Footer */}
          <div className="p-6 border-t bg-gray-50">
            <p className="text-sm text-gray-600 mb-3">Sprache & Währung</p>
            <button 
              className="w-full py-2 px-4 bg-white/10 border rounded-lg text-left text-sm
                       hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <span>Deutschland € / DE</span>
        {/* Es ist erst relevant wenn ich mehrere Sprachen implementiere*/}
             {/* <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 9l-7 7-7-7" 
                />
              </svg> */}
            </button>
          </div>
        </nav>
      </aside>
    </>
  )
}

export default Sidebar