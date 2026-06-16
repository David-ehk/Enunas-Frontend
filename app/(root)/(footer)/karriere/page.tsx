export default function KarrierePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 lg:py-24">
      <p
        className="text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] mb-4"
        style={{ fontFamily: 'var(--font-league-spartan)' }}
      >
        Unternehmen
      </p>
      <h1
        className="text-3xl lg:text-4xl font-light text-[#0A0A0A] mb-4"
        style={{ fontFamily: 'var(--font-cormorant)' }}
      >
        Karriere bei Enunas
      </h1>
      <p
        className="text-[14px] text-[#6B6B6B] mb-16 leading-relaxed max-w-xl"
        style={{ fontFamily: 'var(--font-league-spartan)' }}
      >
        Wir bauen die Zukunft des europäischen Modehandels. Wenn du Teil davon sein möchtest,
        schreib uns.
      </p>

      <div
        className="space-y-8 text-[14px] text-[#2D2D2D]"
        style={{ fontFamily: 'var(--font-league-spartan)' }}
      >
        <div className="border-t border-[#E8E8E8] pt-8">
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-3">Offene Stellen</h2>
          <p className="text-[#6B6B6B]">
            Derzeit haben wir keine offenen Stellen ausgeschrieben. Wir freuen uns aber jederzeit
            über Initiativbewerbungen.
          </p>
        </div>

        <div className="border-t border-[#E8E8E8] pt-8">
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-3">Initiativbewerbung</h2>
          <p className="text-[#6B6B6B] mb-4">
            Sende deinen Lebenslauf und ein kurzes Anschreiben an:
          </p>
          <a
            href="mailto:jobs@enunas.de"
            className="text-[#370E4D] underline hover:text-[#4A1566] transition-colors"
          >
            jobs@enunas.de
          </a>
        </div>
      </div>
    </div>
  )
}
