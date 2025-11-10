{/* Muss dringen angepasst und reperariet werden*/}

{/* mit richtigen Logos ersetzen nicht vergessen*/}
const logos = [
  "https://logo.clearbit.com/nike.com",
  "https://logo.clearbit.com/adidas.com",
  "https://logo.clearbit.com/puma.com",
  "https://logo.clearbit.com/gucci.com",
  "https://logo.clearbit.com/louisvuitton.com",
  "https://logo.clearbit.com/balenciaga.com",
]

export default function LogoSlider() {
  return (
    <>
      <style>{`
        @keyframes scroll {
          0% { 
            transform: translateX(0); 
          }
          100% { 
            transform: translateX(calc(-100% / 3)); 
          }
        }
        
        .animate-scroll {
          animation: scroll 25s linear infinite;
          display: flex;
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      <section className="py-16 bg-gray-50">
        <div className="max-container">
          <h2 className="text-center text-3xl font-bold mb-12 italic text-gray-700">
            Vertraut von führenden Marken
          </h2>
          
          {/* Overflow Container */}
          <div className="relative overflow-hidden">
            <div className="animate-scroll">
              {/* 3x duplizieren für nahtlosen Loop */}
              {[...logos, ...logos, ...logos].map((logo, index) => (
                <div 
                  key={index}
                  className="flex-shrink-0 mx-16 grayscale hover:grayscale-0 transition-all duration-300"
                >
                  <img 
                    src={logo}
                    alt="Brand Logo"
                    className="h-12 w-auto object-contain opacity-60 hover:opacity-100"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}