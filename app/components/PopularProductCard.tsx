const PopularProductCard = ({imgURL,Brandname, name,colour, colourname, price}) => {
  return (
    <div className="flex flex-1 flex-col w-full max-sm:w-full">
      <a href="">
        <img className='w-[380px] h-[480px]' src={imgURL}>
        </img>

         {/* Neu wenn wirklich der Fall ist muss geändert werden */}
        <h2 className="mt-2 text-sm text-yellow-500 font-bold">new in</h2>

        <h3>{Brandname}</h3>

          {/* Productbeschreibung */}
        <h3 className="mt-1 text-2xl leading-normal font-extrabold">{name}</h3>

          {/* Farbquadrat */}
      <div className="flex items-center gap-5 mt-3">
        <div className={`w-8 h-8 ${colour}`}></div>
        <h3 className="text-2xl font-extrabold">{colourname}</h3>
      </div>

        <h3 className="mt-1 text-2xl leading-normal">{price}</h3>
      </a> 
    </div>
  )
}

export default PopularProductCard