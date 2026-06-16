export default function ImpressumPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 lg:py-24">
      <p
        className="text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] mb-4"
        style={{ fontFamily: 'var(--font-league-spartan)' }}
      >
        Rechtliches
      </p>
      <h1
        className="text-3xl lg:text-4xl font-light text-[#0A0A0A] mb-12"
        style={{ fontFamily: 'var(--font-cormorant)' }}
      >
        Impressum
      </h1>

      <div
        className="space-y-8 text-[14px] leading-relaxed text-[#2D2D2D]"
        style={{ fontFamily: 'var(--font-league-spartan)' }}
      >
        <section>
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-3">Angaben gemäß § 5 TMG</h2>
          <p>Enunas GmbH<br />Musterstraße 1<br />10115 Berlin<br />Deutschland</p>
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-3">Kontakt</h2>
          <p>E-Mail: kontakt@enunas.de</p>
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-3">Vertreten durch</h2>
          <p>Geschäftsführung: [Name]</p>
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-3">Registereintrag</h2>
          <p>Eintragung im Handelsregister.<br />Registergericht: Amtsgericht Berlin-Charlottenburg<br />Registernummer: [HRB-Nummer]</p>
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-3">Umsatzsteuer-ID</h2>
          <p>Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />[USt-IdNr.]</p>
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-3">Streitschlichtung</h2>
          <p>
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
            https://ec.europa.eu/consumers/odr/. Unsere E-Mail-Adresse finden Sie oben im Impressum.
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </section>
      </div>
    </div>
  )
}
