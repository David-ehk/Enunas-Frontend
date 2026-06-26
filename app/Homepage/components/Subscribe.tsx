'use client'

import { useState } from 'react'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const Subscribe = () => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!EMAIL_RE.test(email.trim())) {
      setStatus('error')
      return
    }
    // No backend newsletter endpoint yet. Validate + acknowledge so the form isn't dead UI.
    // When a provider (Brevo/Mailchimp hosted form) or backend endpoint is wired, replace
    // this with the real submit. Keep it cookie-free to preserve the no-consent-banner setup.
    setStatus('success')
    setEmail('')
  }

  return (
    <section className="w-full h-full ">

    <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Linke Emailliste Anmelden */}
        <div className="flex flex-col justify-center items-center px-6 py-10 md:py-15 lg:py-20">
         <h2 className="text-2xl md:text-3xl lg:text-4xl mb-4">Newsletter</h2>

  <h4 className="text-center text-lg font-cormorant italic text-enunas-gray-medium mb-6 max-w-md leading-relaxed">
    Sei der Erste, der von neuen Drops, exklusiven Kollektionen und Geheimnissen aus der Enunas-Welt erfährt.
  </h4>

  {/* EMAIL INPUT */}
  <form className="w-full max-w-md" onSubmit={handleSubmit} noValidate>
    <input
      type="email"
      value={email}
      onChange={e => { setEmail(e.target.value); if (status !== 'idle') setStatus('idle') }}
      placeholder="Deine E-Mail Adresse"
      aria-label="E-Mail Adresse"
      aria-invalid={status === 'error'}
      className={`w-full px-4 py-3 border mb-3 focus:outline-none transition-colors ${
        status === 'error' ? 'border-enunas-error focus:border-enunas-error' : 'border-gray-300 focus:border-black'
      }`}
    />

 <button
  type="submit"
  className="group relative w-full overflow-hidden"
  style={{
    padding: '16px 32px',
    background: '#370E4D',
    fontFamily: 'var(--font-Cormorant-Garamond)',
    fontSize: '18px',
    fontWeight: 400,
    letterSpacing: '0.06em',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 300ms',
  }}
  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#250838' }}
  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#370E4D' }}
>
  <span className="absolute left-1/2 -translate-x-1/2 top-[14%] w-full h-[1px] bg-white/60 transition-all duration-500 ease-out group-hover:w-[70%]" />
  <span className="relative z-10">Abonnieren</span>
  <span className="absolute left-1/2 -translate-x-1/2 bottom-[14%] w-full h-[1px] bg-white/60 transition-all duration-500 ease-out group-hover:w-[70%]" />
</button>

  {status === 'error' && (
    <p className="mt-3 text-sm text-enunas-error font-league-spartan" role="alert">
      Bitte gib eine gültige E-Mail-Adresse ein.
    </p>
  )}
  {status === 'success' && (
    <p className="mt-3 text-sm text-enunas-success font-league-spartan" role="status">
      Danke! Wir melden uns, sobald der Newsletter startet.
    </p>
  )}
  </form>
        </div>
        
        {/* Rechte Seite mit Logo - BEGRENZTE HÖHE */}
        <div className="relative h-[400px] md:h-[450px] lg:h-[400px] overflow-hidden flex items-center justify-center pt-5">
          <video 
            src="/assets/videos/3DLogo20sec.mp4" 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-contain"
          />
        </div>
    </div>

      {/* Seo Text C4A47C/f9dc84  */}
      <div className="py-6 sm:py-8 px-6 sm:px-12 text-lg md:text-xl">

        <h4 className="text-center">
          <span className="text-[#370E4D] font-bold">Enunas </span> ist die  Anlaufstelle für neue, innovative Designer im Bereich Luxus- und
  Streetwear. Wir verbinden aufstrebende Kreative mit einer Community, die mehr
  sucht als nur Kleidung – Menschen, die Ausdruck, Identität und Kultur in ihren
  Outfits tragen wollen. Als kuratierter <strong>Marktplatz</strong> und kreatives Movement bietet 
  <span className="text-[#370E4D] font-bold"> Enunas </span> exklusive Pieces, künstlerisches Storytelling und eine Plattform für 
  Designer, die die Zukunft von Mode prägen.  <span className="text-[#370E4D] font-bold">Enunas </span> ist nicht nur ein Shop, 
  sondern ein Ort für Stil, <span className="text-[#A4B7ED]"> Seele </span> und <span className="text-[#C4A47C]">Vision</span>.
        </h4>
      </div>
    </section>
  )
}

export default Subscribe