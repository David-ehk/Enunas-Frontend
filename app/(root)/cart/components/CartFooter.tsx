import React from 'react'

const CartFooter = () => {
  return (
    <div className="bg-black text-white py-8 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* Umtausch und Rückgaben */}
        <div>
          <h2 className="text-lg font-semibold mb-3 uppercase tracking-wide">
            UMTAUSCH UND RÜCKGABEN
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            Liefer- und Rückversand | Für alle Bestellungen, die zwischen dem 25. 
            November und dem 2. Dezember aufgegeben werden, wird die Rückgabefrist 
            bis zum 31. Januar 2026 verlängert.
          </p>
        </div>

        {/* Können wir Ihnen behilflich sein */}
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Können wir Ihnen behilflich sein?
          </h2>
          <p className="text-sm text-gray-300 mb-2">
            Unser Kundenservice ist von Montag bis Samstag von 9:30 bis 19:00 Uhr erreichbar
          </p>
          <p className="text-sm text-gray-300 mb-3">
            Rufen Sie uns an: <span className="underline">+49 30 30 80 64 09</span>
          </p>
          <a href="#" className="text-sm underline hover:text-gray-400 transition-colors">
            Barrierefreiheit
          </a>
        </div>

        {/* Zahlungsarten */}
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Zahlungsarten
          </h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="bg-white rounded px-2 py-1">
                <span className="text-blue-700 font-bold text-xs">VISA</span>
              </div>
              <span className="text-sm text-gray-300">Visa</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-white rounded px-2 py-1 flex items-center">
                <div className="w-4 h-4 rounded-full bg-red-500 mr-0.5"></div>
                <div className="w-4 h-4 rounded-full bg-orange-400 -ml-2"></div>
              </div>
              <span className="text-sm text-gray-300">Mastercard</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-white rounded px-2 py-1">
                <span className="text-blue-600 font-bold text-xs">AMEX</span>
              </div>
              <span className="text-sm text-gray-300">American Express</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-white rounded px-2 py-1">
                <span className="text-blue-600 font-bold text-xs">PayPal</span>
              </div>
              <span className="text-sm text-gray-300">PayPal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartFooter