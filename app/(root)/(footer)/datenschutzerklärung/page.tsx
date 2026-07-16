export default function DatenschutzerklaerungPage() {
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
          Datenschutzerklärung
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
              1. Verantwortlicher
            </p>
            <p>
              Verantwortlicher für die Datenverarbeitung ist die Enunas GmbH, Musterstraße 1, 10115 Berlin.
              Kontakt: datenschutz@enunas.de
            </p>
          </div>

          <div className="border-b border-[#E8E8E8] pb-10 mb-10">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] mb-4">
              2. Erhobene Daten
            </p>
            <p>
              Wir erheben personenbezogene Daten, die Sie uns aktiv mitteilen (Name, E-Mail, Adresse)
              sowie technische Daten (IP-Adresse, Browser, Cookies) beim Besuch unserer Plattform.
            </p>
          </div>

          <div className="border-b border-[#E8E8E8] pb-10 mb-10">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] mb-4">
              3. Zweck der Verarbeitung
            </p>
            <p>
              Ihre Daten werden zur Vertragserfüllung, für den Kundenservice, zur Verbesserung unserer
              Dienste und — mit Ihrer Einwilligung — für Marketingzwecke verarbeitet.
            </p>
          </div>

          <div className="border-b border-[#E8E8E8] pb-10 mb-10">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] mb-4">
              4. Rechtsgrundlagen
            </p>
            <p>
              Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung),
              Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse) und Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).
            </p>
          </div>

          <div className="border-b border-[#E8E8E8] pb-10 mb-10">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] mb-4">
              5. Ihre Rechte
            </p>
            <p>
              Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung,
              Datenübertragbarkeit und Widerspruch. Wenden Sie sich hierzu an datenschutz@enunas.de.
            </p>
          </div>

          <div className="border-b border-[#E8E8E8] pb-10 mb-10">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] mb-4">
              6. Datenweitergabe
            </p>
            <p>
              Daten werden nur an Dritte weitergegeben, soweit dies zur Vertragserfüllung notwendig ist
              (z.B. Zahlungsdienstleister, Versanddienstleister) oder eine gesetzliche Pflicht besteht.
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] mb-4">
              7. Cookies
            </p>
            <p>
              Informationen zu unserer Cookie-Nutzung finden Sie in unserer{' '}
              <a href="/cookie-richtlinien" className="underline underline-offset-4 hover:text-[#370E4D] transition-colors duration-200">
                Cookie-Richtlinie
              </a>.
            </p>
          </div>

        </div>
      </section>

    </div>
  )
}
