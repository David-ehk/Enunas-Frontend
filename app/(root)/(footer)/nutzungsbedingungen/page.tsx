export default function NutzungsbedingungenPage() {
  return (
    <div className="bg-white min-h-screen">

      {/* Hero */}
      <section className="px-6 pt-24 pb-20 text-center border-b border-[#E8E8E8]">
        <p
          className="text-[10px] uppercase tracking-[0.25em] text-[#6B6B6B] mb-6"
          style={{ fontFamily: 'var(--font-league-spartan)' }}
        >
          Rechtliches
        </p>
        <h1
          className="text-4xl lg:text-[52px] font-light text-[#0A0A0A] leading-[1.15]"
          style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
        >
          Nutzungsbedingungen
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
              1. Nutzung der Plattform
            </p>
            <p>
              Die Nutzung der Enunas-Plattform setzt die Zustimmung zu diesen Nutzungsbedingungen voraus.
              Die Plattform darf nur für rechtmäßige Zwecke genutzt werden.
            </p>
          </div>

          <div className="border-b border-[#E8E8E8] pb-10 mb-10">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] mb-4">
              2. Nutzerkonto
            </p>
            <p>
              Für die vollständige Nutzung der Plattform ist eine Registrierung erforderlich. Nutzerdaten
              müssen wahrheitsgemäß angegeben und aktuell gehalten werden. Das Konto ist nicht übertragbar.
            </p>
          </div>

          <div className="border-b border-[#E8E8E8] pb-10 mb-10">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] mb-4">
              3. Verbotene Handlungen
            </p>
            <p>
              Es ist untersagt, die Plattform zu missbrauchen, automatisierte Zugriffe ohne Genehmigung
              durchzuführen, Inhalte zu kopieren oder Dritte zu schädigen.
            </p>
          </div>

          <div className="border-b border-[#E8E8E8] pb-10 mb-10">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] mb-4">
              4. Verfügbarkeit
            </p>
            <p>
              Enunas bemüht sich um eine hohe Verfügbarkeit der Plattform, übernimmt jedoch keine Garantie
              für ununterbrochene Verfügbarkeit. Wartungsarbeiten werden soweit möglich angekündigt.
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] mb-4">
              5. Änderungen
            </p>
            <p>
              Enunas behält sich vor, diese Nutzungsbedingungen jederzeit zu ändern. Wesentliche Änderungen
              werden den Nutzern rechtzeitig mitgeteilt.
            </p>
          </div>

        </div>
      </section>

    </div>
  )
}
