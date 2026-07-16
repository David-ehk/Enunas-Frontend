export default function KundenservicePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 lg:py-24">
      <p
        className="text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] mb-4"
        style={{ fontFamily: 'var(--font-league-spartan)' }}
      >
        Hilfe
      </p>
      <h1
        className="text-3xl lg:text-4xl font-light text-[#0A0A0A] mb-4"
        style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
      >
        Kundenservice
      </h1>
      <p
        className="text-[14px] text-[#6B6B6B] mb-12 leading-relaxed"
        style={{ fontFamily: 'var(--font-league-spartan)' }}
      >
        Wir sind für Sie da. Wählen Sie den Kontaktweg, der für Sie am bequemsten ist.
      </p>

      <div
        className="space-y-6 text-[14px] text-[#2D2D2D]"
        style={{ fontFamily: 'var(--font-league-spartan)' }}
      >
        <div className="border border-[#E8E8E8] p-6">
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-2">E-Mail</h2>
          <p className="text-[#6B6B6B] mb-3">Antwort innerhalb von 24 Stunden (Mo–Fr)</p>
          <a
            href="mailto:service@enunas.de"
            className="text-[#370E4D] underline hover:text-[#4A1566] transition-colors"
          >
            service@enunas.de
          </a>
        </div>

        <div className="border border-[#E8E8E8] p-6">
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-2">Häufige Fragen</h2>
          <p className="text-[#6B6B6B] mb-3">Schnelle Antworten auf häufige Fragen</p>
          <a
            href="/faqs"
            className="text-[#370E4D] underline hover:text-[#4A1566] transition-colors"
          >
            Zu den FAQs
          </a>
        </div>

        <div className="border border-[#E8E8E8] p-6">
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-2">Sendungsverfolgung</h2>
          <p className="text-[#6B6B6B] mb-3">Verfolgen Sie Ihre Bestellung in Echtzeit</p>
          <a
            href="/sendungsverfolgung"
            className="text-[#370E4D] underline hover:text-[#4A1566] transition-colors"
          >
            Bestellung verfolgen
          </a>
        </div>
      </div>
    </div>
  )
}
