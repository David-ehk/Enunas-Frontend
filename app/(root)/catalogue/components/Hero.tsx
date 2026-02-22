import React from 'react'


const Catalogue = () => {
  return (
    <div className=''>
        <div className="pt-25 p-6 w-full"> 

            <div className="h-[75vw] sm:h-[50vw] lg:max-h-[700px]">
                <img src="https://i.imgur.com/VNHRUgU.jpeg" alt="Hero" className='object-cover w-full h-full'/>
            </div>

            <div className="flex justify-between">
                <h2 className="sm:text-7xl text-4xl ">Catalogue</h2>
                <div className="">
                    <p className="font-bold text-xl sm:text-2xl">NEW Drop ist angekommen</p>
                    <h4 className="smtext-lg">
                     Endecke neue limitierte Kleidung  →
                    </h4>
                    <div className="bg-gray-700"></div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Catalogue