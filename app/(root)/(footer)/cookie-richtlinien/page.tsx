export default function CookieRichtlinienPage() {
  return (
    <div className="bg-white min-h-screen">

      {/* Hero */}
      <section className="px-6 pt-24 pb-20 text-center border-b border-[#E8E8E8]">
        <p
          className="text-[10px] uppercase tracking-[0.25em] text-[#6B6B6B] mb-6"
          style={{ fontFamily: 'var(--font-league-spartan)' }}
        >
          Datenschutz
        </p>
        <h1
          className="text-4xl lg:text-[52px] font-light text-[#0A0A0A] leading-[1.15]"
          style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
        >
          Cookie-Richtlinien
        </h1>
      </section>

      {/* Content */}
      <section className="max-w-2xl mx-auto px-6 py-20 lg:py-28">
        <div
          className="text-[13px] leading-[1.8] text-[#2D2D2D]"
          style={{ fontFamily: 'var(--font-league-spartan)' }}
        >

          <div className="border-b border-[#E8E8E8] pb-10 mb-10">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] mb-4">
              Was sind Cookies?
            </p>
            <p>
              Cookies sind kleine Textdateien, die beim Besuch unserer Website auf Ihrem Gerät gespeichert werden.
              Sie helfen uns, die Website funktionsfähig zu halten und Ihr Erlebnis zu verbessern.
            </p>
          </div>

          <div className="border-b border-[#E8E8E8] pb-10 mb-10">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] mb-4">
              Notwendige Cookies
            </p>
            <p>
              Diese Cookies sind für den Betrieb der Website unbedingt erforderlich (z.B. Warenkorb,
              Anmeldestatus). Sie können nicht deaktiviert werden.
            </p>
          </div>

          <div className="border-b border-[#E8E8E8] pb-10 mb-10">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] mb-4">
              Analyse-Cookies
            </p>
            <p>
              Mit Ihrer Einwilligung setzen wir Analyse-Cookies ein, um die Nutzung der Website zu verstehen
              und zu verbessern. Diese Daten werden anonymisiert verarbeitet.
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] mb-4">
              Cookie-Einstellungen ändern
            </p>
            <p>
              Sie können Ihre Cookie-Einstellungen jederzeit über unsere{' '}
              <a
                href="/cookie-einstellungen"
                className="underline underline-offset-4 hover:text-[#370E4D] transition-colors duration-200"
              >
                Cookie-Einstellungsseite
              </a>{' '}
              anpassen.
            </p>
          </div>

        </div>
      </section>

    </div>
  )
}
