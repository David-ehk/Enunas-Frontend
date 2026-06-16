export default function DatenschutzerklaerungPage() {
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
        Datenschutzerklärung
      </h1>

      <div
        className="space-y-8 text-[14px] leading-relaxed text-[#2D2D2D]"
        style={{ fontFamily: 'var(--font-league-spartan)' }}
      >
        <section>
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-3">1. Verantwortlicher</h2>
          <p>
            Verantwortlicher für die Datenverarbeitung ist die Enunas GmbH, Musterstraße 1, 10115 Berlin.
            Kontakt: datenschutz@enunas.de
          </p>
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-3">2. Erhobene Daten</h2>
          <p>
            Wir erheben personenbezogene Daten, die Sie uns aktiv mitteilen (Name, E-Mail, Adresse)
            sowie technische Daten (IP-Adresse, Browser, Cookies) beim Besuch unserer Plattform.
          </p>
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-3">3. Zweck der Verarbeitung</h2>
          <p>
            Ihre Daten werden zur Vertragserfüllung, für den Kundenservice, zur Verbesserung unserer
            Dienste und — mit Ihrer Einwilligung — für Marketingzwecke verarbeitet.
          </p>
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-3">4. Rechtsgrundlagen</h2>
          <p>
            Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung),
            Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse) und Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).
          </p>
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-3">5. Ihre Rechte</h2>
          <p>
            Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung,
            Datenübertragbarkeit und Widerspruch. Wenden Sie sich hierzu an datenschutz@enunas.de.
          </p>
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-3">6. Datenweitergabe</h2>
          <p>
            Daten werden nur an Dritte weitergegeben, soweit dies zur Vertragserfüllung notwendig ist
            (z.B. Zahlungsdienstleister, Versanddienstleister) oder eine gesetzliche Pflicht besteht.
          </p>
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-3">7. Cookies</h2>
          <p>
            Informationen zu unserer Cookie-Nutzung finden Sie in unserer{' '}
            <a href="/cookie-richtlinien" className="underline hover:text-[#370E4D]">Cookie-Richtlinie</a>.
          </p>
        </section>
      </div>
    </div>
  )
}
