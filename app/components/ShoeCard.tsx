import React from 'react'

const ShoeCard = ({imgURL, changeBigShoeImage, bigShoeImg}) => {

  const handleClick = () => {
    if (bigShoeImg !== imgURL.bigShoe){
      changeBigShoeImage(imgURL.bigShoe)
    }
  }

  return (
    <div className={`border-2 rounded-xl ${bigShoeImg === imgURL.bigShoe ? "border-red-400" : "border-transparent"} cursor-pointer max-sm:flex-1`} onClick={handleClick}>
       <div className='flex justify-center items-center bg-amber-400 bg-center'>
        <img src={imgURL.thumbnail}
        alt='shoe collection'
        width={127}
        height={103}
        className='object-contain'/>
       </div>
    </div>
  )
}

export default ShoeCard