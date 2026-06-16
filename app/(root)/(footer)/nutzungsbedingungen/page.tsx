export default function NutzungsbedingungenPage() {
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
        Nutzungsbedingungen
      </h1>

      <div
        className="space-y-8 text-[14px] leading-relaxed text-[#2D2D2D]"
        style={{ fontFamily: 'var(--font-league-spartan)' }}
      >
        <section>
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-3">1. Nutzung der Plattform</h2>
          <p>
            Die Nutzung der Enunas-Plattform setzt die Zustimmung zu diesen Nutzungsbedingungen voraus.
            Die Plattform darf nur für rechtmäßige Zwecke genutzt werden.
          </p>
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-3">2. Nutzerkonto</h2>
          <p>
            Für die vollständige Nutzung der Plattform ist eine Registrierung erforderlich. Nutzerdaten
            müssen wahrheitsgemäß angegeben und aktuell gehalten werden. Das Konto ist nicht übertragbar.
          </p>
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-3">3. Verbotene Handlungen</h2>
          <p>
            Es ist untersagt, die Plattform zu missbrauchen, automatisierte Zugriffe ohne Genehmigung
            durchzuführen, Inhalte zu kopieren oder Dritte zu schädigen.
          </p>
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-3">4. Verfügbarkeit</h2>
          <p>
            Enunas bemüht sich um eine hohe Verfügbarkeit der Plattform, übernimmt jedoch keine Garantie
            für ununterbrochene Verfügbarkeit. Wartungsarbeiten werden soweit möglich angekündigt.
          </p>
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-3">5. Änderungen</h2>
          <p>
            Enunas behält sich vor, diese Nutzungsbedingungen jederzeit zu ändern. Wesentliche Änderungen
            werden den Nutzern rechtzeitig mitgeteilt.
          </p>
        </section>
      </div>
    </div>
  )
}
