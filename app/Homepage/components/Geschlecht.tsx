import Link from 'next/link'
import React from 'react'

const geschlecht = [
  {
    title: "Women",
    image: "https://diorama.dam-broadcast.com/cdn-cgi/image/width=640,format=auto/pm_11872_1164_1164642-rw8ghfoty4-whr.jpg",
    link: "/women"
  },
  {
    title: "Men",
    image: "https://amq-mcq.dam.kering.com/asset/e5ee7220-3680-49a9-a084-c5477140578b/Original-Ecom/McQUEEN-SS26-PRE-CO_HOLIDAY_1X1_1-16.jpg",
    link: "/men"
  }
]

 const Geschlecht = () => {
  return (
    <div>
      <div className="grid grid-cols-2 gap-0">
        {geschlecht.map((ges,idx)=>(

          <div className="relative group" key={idx} style={{height: "100vh"}}>

            <Link href={ges.link}>

            
             <div className="sticky flex justify-center  top-0 z-10 p-6 sm:pt-5">
                
               <h2 className=" text-3xl sm:text-4xl md:text-5xl tracking-wider text-white mt-20 z-10 ">
                {ges.title.toUpperCase()}
              </h2>
              
            </div>

              <div className="absolute inset-0 group cursor-pointer group-hover:bg-black/70">
                <img
                className="w-full h-full object-cover"
                src={ges.image}
                alt={ges.title}/>
              </div>

              <div className="absolute inset-0 hover:bg-black/25"></div>

            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Geschlecht