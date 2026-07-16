export default function CookieEinstellungenPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 lg:py-24">
      <p
        className="text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] mb-4"
        style={{ fontFamily: 'var(--font-league-spartan)' }}
      >
        Datenschutz
      </p>
      <h1
        className="text-3xl lg:text-4xl font-light text-[#0A0A0A] mb-6"
        style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
      >
        Cookie-Einstellungen
      </h1>

      <p
        className="text-[14px] text-[#2D2D2D] leading-relaxed mb-12 max-w-2xl"
        style={{ fontFamily: 'var(--font-league-spartan)' }}
      >
        Enunas verzichtet bewusst auf Tracking-Cookies. Wir verwenden ausschließlich
        technisch notwendige Cookies sowie eine anonyme, cookielose Reichweitenmessung —
        deshalb gibt es hier nichts zu konfigurieren und keinen Cookie-Banner.
      </p>

      <div
        className="space-y-6 text-[14px] text-[#2D2D2D]"
        style={{ fontFamily: 'var(--font-league-spartan)' }}
      >
        <div className="border border-[#E8E8E8] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.1em] text-[#0A0A0A] font-medium mb-1">Notwendige Cookies</p>
              <p className="text-[13px] text-[#6B6B6B] leading-relaxed">
                Erforderlich für den Betrieb der Website (z.&nbsp;B. Warenkorb, Anmeldung).
                Können nicht deaktiviert werden.
              </p>
            </div>
            <span
              className="text-[10px] uppercase tracking-[0.1em] text-[#1A5A3C] flex-shrink-0 ml-6"
            >
              Aktiv
            </span>
          </div>
        </div>

        <div className="border border-[#E8E8E8] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.1em] text-[#0A0A0A] font-medium mb-1">Anonyme Reichweitenmessung</p>
              <p className="text-[13px] text-[#6B6B6B] leading-relaxed">
                Wir messen die Nutzung der Website cookielos und ohne personenbezogene
                Daten — es werden keine Cookies gesetzt und kein geräteübergreifendes
                Profil gebildet.
              </p>
            </div>
            <span
              className="text-[10px] uppercase tracking-[0.1em] text-[#6B6B6B] flex-shrink-0 ml-6 text-right"
            >
              Cookielos
            </span>
          </div>
        </div>

        <div className="border border-[#E8E8E8] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.1em] text-[#0A0A0A] font-medium mb-1">Marketing-Cookies</p>
              <p className="text-[13px] text-[#6B6B6B] leading-relaxed">
                Wir setzen keine Marketing- oder Werbe-Cookies ein.
              </p>
            </div>
            <span
              className="text-[10px] uppercase tracking-[0.1em] text-[#6B6B6B] flex-shrink-0 ml-6"
            >
              Keine
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
