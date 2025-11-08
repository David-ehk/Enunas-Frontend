const Subscribe = () => {
  return (
    <section>

    <div className="grid grid-cols-1 lg:grid-cols-2">
        {/*Linke Emailliste Anmelden*/}
        <div className="relativ items-center">
          <h1 className="flex justify-center items-center text-4xl ">Newsletter</h1>
          <br/>
          <h4 className="flex justify-center items-center "> Subscribe to the Newsletter and be the first to receive the latest news and secrets from enunas</h4>
          <br/>
          {/*Query für Emailliste Anmelden*/}
        </div>
        
        {/*Rechte Seite mit Logo*/}
        <div>
         {/* <img src="" alt="logo" height={400} width={300}/> */}
        </div>
    </div>

      {/*Seo Text*/}
      <div className="py-6 sm:py-2 px-3 sm:px-2">
        <p>Enunas ist der führer für neue innovative designer in der Luxus und Streetwear Schiene der Marktplatz für deine Seele. Für alle die sich mehr in ihren Klammotten wünschen und Bedürfnisse haben für mehr. </p>
      </div>
    </section>
  )
}

export default Subscribe