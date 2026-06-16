export default function CookieRichtlinienPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 lg:py-24">
      <p
        className="text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] mb-4"
        style={{ fontFamily: 'var(--font-league-spartan)' }}
      >
        Datenschutz
      </p>
      <h1
        className="text-3xl lg:text-4xl font-light text-[#0A0A0A] mb-12"
        style={{ fontFamily: 'var(--font-cormorant)' }}
      >
        Cookie-Richtlinien
      </h1>

      <div
        className="space-y-8 text-[14px] leading-relaxed text-[#2D2D2D]"
        style={{ fontFamily: 'var(--font-league-spartan)' }}
      >
        <section>
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-3">Was sind Cookies?</h2>
          <p>
            Cookies sind kleine Textdateien, die beim Besuch unserer Website auf Ihrem Gerät gespeichert werden.
            Sie helfen uns, die Website funktionsfähig zu halten und Ihr Erlebnis zu verbessern.
          </p>
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-3">Notwendige Cookies</h2>
          <p>
            Diese Cookies sind für den Betrieb der Website unbedingt erforderlich (z.B. Warenkorb,
            Anmeldestatus). Sie können nicht deaktiviert werden.
          </p>
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-3">Analyse-Cookies</h2>
          <p>
            Mit Ihrer Einwilligung setzen wir Analyse-Cookies ein, um die Nutzung der Website zu verstehen
            und zu verbessern. Diese Daten werden anonymisiert verarbeitet.
          </p>
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-3">Cookie-Einstellungen ändern</h2>
          <p>
            Sie können Ihre Cookie-Einstellungen jederzeit über unsere{' '}
            <a href="/cookie-einstellungen" className="underline hover:text-[#370E4D]">
              Cookie-Einstellungsseite
            </a>{' '}
            anpassen.
          </p>
        </section>
      </div>
    </div>
  )
}
