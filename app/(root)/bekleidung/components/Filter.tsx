import React from 'react'

function Filter() {
  return (
    <div className="bg-white flex justify-between items-center border-0 border-t-2 border-b-2 border-black my-2 pt-5 px-4">
        {/*Geschlecht auswählen*/}
        <div>
        Männlich oder Weiblich 
        </div>
        {/*Filter optionen*/}
        <div className="flex justify-between gap-3 sm:gap-6">
            <div >
            <h3 className="text-xl">Marken</h3>
            
            </div>
            <div>
                <h3 className="text-xl">Catalogue</h3>
            
            </div>
            <div>
                 <h3 className="text-xl">Filter</h3>
            
            </div>
            <div>
                <h3 className="text-xl">Sortieren</h3>
            
            </div>
        </div>
    </div>
  )
}

export default Filter