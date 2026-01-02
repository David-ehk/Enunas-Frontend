'use client'
import { useState, useEffect } from 'react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartSidebar({ isOpen, onClose }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'cart' | 'wishlist'>('cart')

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

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed top-0 right-0 h-full w-full sm:w-[480px] bg-[#F5F5F0] z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          flex flex-col
        `}
      >
        {/* Header with Tabs */}
        <div className="px-8 pt-6 pb-0 flex-shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-2xl hover:opacity-50 transition-opacity"
          >
            ✕
          </button>
          
          <div className="flex gap-8 border-b border-gray-300">
            <button
              onClick={() => setActiveTab('cart')}
              className={`pb-3 text-sm transition-all ${
                activeTab === 'cart' 
                  ? 'border-b-2 border-black' 
                  : 'text-gray-500'
              }`}
             
            >
            <h4>  Warenkorb </h4>
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`pb-3 text-sm transition-all ${
                activeTab === 'wishlist' 
                  ? 'border-b-2 border-black' 
                  : 'text-gray-500'
              }`}
            >
             <h4> Wunschliste </h4>
            </button>
          </div>
        </div>

        {/* Scrollable Cart Items Area */}
        <div className="flex-1 overflow-y-auto px-8 py-6 min-h-0">
          {activeTab === 'cart' ? (
            <>
              {/* Item 1 */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-32 bg-gray-200 flex-shrink-0"></div>
                  
                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-base font-medium pr-2" >
                        Name des Produktes
                      </h3>
                      <button 
                        className="text-xs underline hover:no-underline text-gray-600 flex-shrink-0"
                      >
                        Entfernen
                      </button>
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-1">Schwarz</p>
                    <p className="text-xs text-gray-500 mb-3">Größe: S</p>
                    
                    {/* Quantity and Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button className="w-6 h-6 flex items-center justify-center border border-gray-300 hover:bg-gray-50">
                          −
                        </button>
                        <span className="text-sm w-8 text-center">1</span>
                        <button className="w-6 h-6 flex items-center justify-center border border-gray-300 hover:bg-gray-50">
                          +
                        </button>
                      </div>
                      <span className="text-sm font-semibold">€120</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Item 2 */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex gap-4">
                  <div className="w-24 h-32 bg-gray-200 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-base font-medium pr-2" >
                        Name des Produktes
                      </h3>
                      <button 
                        className="text-xs underline hover:no-underline text-gray-600 flex-shrink-0"
                      >
                        Entfernen
                      </button>
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-1">Weiß</p>
                    <p className="text-xs text-gray-500 mb-3">Größe: M</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button className="w-6 h-6 flex items-center justify-center border border-gray-300 hover:bg-gray-50">
                          −
                        </button>
                        <span className="text-sm w-8 text-center">2</span>
                        <button className="w-6 h-6 flex items-center justify-center border border-gray-300 hover:bg-gray-50">
                          +
                        </button>
                      </div>
                      <span className="text-sm font-semibold">€190</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Item 3 */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex gap-4">
                  <div className="w-24 h-32 bg-gray-200 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-base font-medium pr-2">
                        Weiteres Produkt Name
                      </h3>
                      <button 
                        className="text-xs underline hover:no-underline text-gray-600 flex-shrink-0"
                      >
                        Entfernen
                      </button>
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-1">Grau</p>
                    <p className="text-xs text-gray-500 mb-3">Größe: L</p>
                    
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2 text-sm">
                        <button className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition-colors">
                          −
                        </button>
                        <span className="text-sm">1</span>
                        <button className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition-colors">
                          +
                        </button>
                      </div>
                      <span className="text-sm">€85</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <p className="text-sm">Ihre Wunschliste ist leer</p>
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="border-t border-gray-200 px-8 py-6 flex-shrink-0 bg-white">
           {/* Total */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-light">Insgesamt</span>
            <span className="text-lg font-light">1000 €</span>
          </div>
          
          {/* Checkout Button */}
          <button className="w-full bg-[#370E4D] text-white py-4  tracking-wide hover:bg-[#2a0b3b] transition-colors mb-3" >
           <h3 className='text-base'> Sicher Zur Kasse </h3>
          </button>

          {/* Continue Shopping */}
          <button 
            onClick={onClose}
            className="w-full text-center text-xs underline hover:no-underline text-gray-600 mb-5"
          >
            Weiter einkaufen
          </button>

          {/* Free Shipping Progress */}
          <div className="pt-5 border-t border-gray-200">
            <div className="mb-2">
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#370E4D] rounded-full transition-all" style={{ width: '78%' }}></div>
              </div>
            </div>
            <p className="text-xs text-gray-600">
              Noch <span className="font-semibold">€5</span> bis kostenloser Versand
            </p>
          </div>
        </div>
      </div>
    </>
  )
}