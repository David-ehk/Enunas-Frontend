export default function LieferungRuecksendungPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 lg:py-24">
      <p
        className="text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] mb-4"
        style={{ fontFamily: 'var(--font-league-spartan)' }}
      >
        Service
      </p>
      <h1
        className="text-3xl lg:text-4xl font-light text-[#0A0A0A] mb-12"
        style={{ fontFamily: 'var(--font-cormorant)' }}
      >
        Lieferung &amp; Rücksendung
      </h1>

      <div
        className="space-y-10 text-[14px] leading-relaxed text-[#2D2D2D]"
        style={{ fontFamily: 'var(--font-league-spartan)' }}
      >
        <section>
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-4">Lieferzeiten</h2>
          <div className="space-y-2">
            <div className="flex justify-between border-b border-[#E8E8E8] pb-2">
              <span>Deutschland</span>
              <span className="text-[#6B6B6B]">2–4 Werktage</span>
            </div>
            <div className="flex justify-between border-b border-[#E8E8E8] pb-2">
              <span>Österreich &amp; Schweiz</span>
              <span className="text-[#6B6B6B]">3–6 Werktage</span>
            </div>
            <div className="flex justify-between border-b border-[#E8E8E8] pb-2">
              <span>EU (sonstige)</span>
              <span className="text-[#6B6B6B]">4–8 Werktage</span>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-4">Versandkosten</h2>
          <p>
            Kostenloser Versand ab einem Bestellwert von 50 €. Darunter fällt eine Versandkostenpauschale
            von 4,99 € an.
          </p>
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-4">Rücksendung</h2>
          <p>
            Rücksendungen sind innerhalb von 14 Tagen nach Erhalt der Ware möglich. Artikel müssen
            ungetragen, ungewaschen und mit Originaletiketten zurückgesendet werden.
          </p>
          <p className="mt-3">
            Um eine Rücksendung einzuleiten, melden Sie sich in Ihrem Konto an und wählen Sie die
            entsprechende Bestellung aus.
          </p>
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-4">Rückerstattung</h2>
          <p>
            Nach Eingang und Prüfung der Rücksendung erfolgt die Rückerstattung innerhalb von 5–10
            Werktagen über die ursprüngliche Zahlungsmethode.
          </p>
        </section>
      </div>
    </div>
  )
}
