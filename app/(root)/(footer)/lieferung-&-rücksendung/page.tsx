export default function LieferungRuecksendungPage() {
  return (
    <div className="bg-white min-h-screen">

      {/* Hero */}
      <section className="px-6 pt-24 pb-20 text-center border-b border-[#E8E8E8]">
        <p
          className="text-[10px] uppercase tracking-[0.25em] text-[#6B6B6B] mb-6"
          style={{ fontFamily: 'var(--font-league-spartan)' }}
        >
          Service
        </p>
        <h1
          className="text-4xl lg:text-[52px] font-light text-[#0A0A0A] leading-[1.15]"
          style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
        >
          Lieferung &amp; Rücksendung
        </h1>
      </section>

      {/* Content */}
      <section className="max-w-2xl mx-auto px-6 py-20 lg:py-28">
        <div
          className="text-[13px] leading-[1.8] text-[#2D2D2D]"
          style={{ fontFamily: 'var(--font-league-spartan)' }}
        >

          <div className="border-b border-[#E8E8E8] pb-10 mb-10">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] mb-6">
              Lieferzeiten
            </p>
            <div className="space-y-0">
              <div className="flex justify-between border-b border-[#E8E8E8] py-4 first:border-t first:border-t-[#E8E8E8]">
                <span>Deutschland</span>
                <span className="text-[#6B6B6B]">2–4 Werktage</span>
              </div>
              <div className="flex justify-between border-b border-[#E8E8E8] py-4">
                <span>Österreich &amp; Schweiz</span>
                <span className="text-[#6B6B6B]">3–6 Werktage</span>
              </div>
              <div className="flex justify-between py-4">
                <span>EU (sonstige)</span>
                <span className="text-[#6B6B6B]">4–8 Werktage</span>
              </div>
            </div>
          </div>

          <div className="border-b border-[#E8E8E8] pb-10 mb-10">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] mb-4">
              Versandkosten
            </p>
            <p>
              Kostenloser Versand ab einem Bestellwert von 50 €. Darunter fällt eine Versandkostenpauschale
              von 4,99 € an.
            </p>
          </div>

          <div className="border-b border-[#E8E8E8] pb-10 mb-10">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] mb-4">
              Rücksendung
            </p>
            <p>
              Rücksendungen sind innerhalb von 14 Tagen nach Erhalt der Ware möglich. Artikel müssen
              ungetragen, ungewaschen und mit Originaletiketten zurückgesendet werden.
            </p>
            <p className="mt-4">
              Um eine Rücksendung einzuleiten, melden Sie sich in Ihrem Konto an und wählen Sie die
              entsprechende Bestellung aus.
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] mb-4">
              Rückerstattung
            </p>
            <p>
              Nach Eingang und Prüfung der Rücksendung erfolgt die Rückerstattung innerhalb von 5–10
              Werktagen über die ursprüngliche Zahlungsmethode.
            </p>
          </div>

        </div>
      </section>

    </div>
  )
}
