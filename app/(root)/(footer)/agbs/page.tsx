export default function AgbsPage() {
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
        Allgemeine Geschäftsbedingungen
      </h1>

      <div
        className="space-y-8 text-[14px] leading-relaxed text-[#2D2D2D]"
        style={{ fontFamily: 'var(--font-league-spartan)' }}
      >
        <section>
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-3">§ 1 Geltungsbereich</h2>
          <p>
            Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge, die zwischen Enunas GmbH
            und dem Kunden über die Plattform enunas.de geschlossen werden.
          </p>
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-3">§ 2 Vertragsschluss</h2>
          <p>
            Die Darstellung der Produkte auf der Plattform stellt kein rechtlich bindendes Angebot dar.
            Durch Absenden der Bestellung gibt der Kunde ein verbindliches Angebot ab. Die Annahme erfolgt
            durch Bestätigungs-E-Mail oder Versandbestätigung.
          </p>
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-3">§ 3 Preise und Zahlung</h2>
          <p>
            Alle Preise sind Endpreise und enthalten die gesetzliche Mehrwertsteuer. Zahlungen erfolgen
            über die angebotenen Zahlungsmethoden (Kreditkarte, PayPal, Sofortüberweisung etc.).
          </p>
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-3">§ 4 Lieferung</h2>
          <p>
            Die Lieferzeit beträgt in der Regel 2–5 Werktage innerhalb Deutschlands. Für Lieferungen
            ins Ausland gelten abweichende Lieferzeiten.
          </p>
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-3">§ 5 Widerrufsrecht</h2>
          <p>
            Verbrauchern steht ein gesetzliches Widerrufsrecht zu. Die Widerrufsfrist beträgt 14 Tage
            ab Erhalt der Ware. Details entnehmen Sie unserer Widerrufsbelehrung.
          </p>
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-3">§ 6 Anwendbares Recht</h2>
          <p>
            Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist Berlin, sofern
            der Kunde Kaufmann ist.
          </p>
        </section>
      </div>
    </div>
  )
}
