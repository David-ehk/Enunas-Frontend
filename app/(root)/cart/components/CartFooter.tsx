import React from 'react'

const CartFooter = () => {
  return (
    <div className="bg-black text-white py-8 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* Lieferung und Rückgabe */}
        <div>
          <h2 className="text-lg font-semibold mb-3 uppercase tracking-wide">
            LIEFERUNG UND RÜCKGABE
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            Bei deiner Bestellung fallen keine Zollgebühren an zu dem Fallen keine Liefergebühren an. 
            Rückgaben fallen mit einem 30 Tage Rückgaberecht an
          </p>
        </div>

        {/* Können wir dir behilflich sein */}
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Können wir dir behilflich sein
          </h2>
          <p className="text-sm text-gray-300 mb-2">
            Unser Kundenservice ist von Montag bis Samstag von 9.30 bis 19 Uhr erreichbar
          </p>
          <p className="text-sm text-gray-300">
            Schreibe uns eine Email an: <span className="font-bold">kundenservice@enunas.com</span>
          </p>
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
                <span className="text-blue-600 font-bold text-xs">PayPal</span>
              </div>
              <span className="text-sm text-gray-300">PayPal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-white rounded px-2 py-1">
                <span className="text-blue-600 font-bold text-xs">APAY</span>
              </div>
              <span className="text-sm text-gray-300">ApplePay</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-pink-100 rounded px-2 py-1">
                <span className="text-pink-600 font-bold text-xs">klarna</span>
              </div>
              <span className="text-sm text-gray-300">Klarna</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartFooter