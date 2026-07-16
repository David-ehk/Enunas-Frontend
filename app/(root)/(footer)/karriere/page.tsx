type Job = { dept: string; title: string; type: string; loc: string }

// Aktuell keine offenen Stellen — Initiativbewerbung bleibt jederzeit möglich.
// Zum Ausschreiben einfach wieder Einträge ergänzen, die Liste rendert automatisch.
const jobs: Job[] = []

const benefits = [
  {
    n: '01',
    title: 'Wirkung vom ersten Tag',
    body: 'Wir sind ein schlankes Team — jede Person hat direkten Einfluss auf Produkt und Community, ohne bürokratische Ebenen dazwischen.',
  },
  {
    n: '02',
    title: 'Echter Gestaltungsspielraum',
    body: 'Keine endlosen Review-Runden. Du verantwortest dein Gebiet und triffst echte Entscheidungen, die das Produkt prägen.',
  },
  {
    n: '03',
    title: 'Mode trifft Technologie',
    body: 'Du arbeitest an einem der faszinierendsten Schnittpunkte unserer Zeit — wo Kultur auf Code trifft und Kuration auf Conversion.',
  },
]

export default function KarrierePage() {
  return (
    <div className="bg-white min-h-screen" style={{ fontFamily: 'var(--font-league-spartan)' }}>

      {/* Purple hero */}
      <section className="bg-[#370E4D] text-white px-8 lg:px-16 pt-36 pb-28 min-h-[520px] lg:min-h-[600px] flex flex-col justify-end">
        <p className="text-[11px] uppercase tracking-[0.3em] opacity-60 mb-8">Karriere bei Enunas</p>
        <div className="grid lg:grid-cols-[7fr_5fr] gap-16 lg:gap-20 items-end">
          <h1
            className="text-[64px] lg:text-[96px] font-light leading-[0.95] m-0"
            style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
          >
            Bau mit uns<br />
            die Zukunft<br />der Mode
          </h1>
          <p className="text-[15px] lg:text-[17px] font-light leading-[1.6] opacity-85 m-0">
            Wir suchen Menschen, die Mode lieben, technisch denken und glauben, dass Kuration
            eine Superkraft ist.
          </p>
        </div>
      </section>

      {/* Why Enunas */}
      <section className="px-8 lg:px-16 py-24 border-b border-[#E8E8E8]">
        <p className="text-[11px] uppercase tracking-[0.3em] text-[#6B6B6B] mb-8">Warum Enunas</p>
        <div className="grid md:grid-cols-3 gap-12">
          {benefits.map((b) => (
            <div key={b.n} className="border-t border-[#E8E8E8] pt-7">
              <p className="text-[11px] tracking-[0.25em] text-[#370E4D] mb-4">{b.n}</p>
              <h3
                className="text-[28px] lg:text-[30px] font-light leading-[1.1] mb-4"
                style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
              >
                {b.title}
              </h3>
              <p className="text-[14px] font-light leading-[1.65] text-[#2D2D2D] m-0">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Job listings */}
      <section className="bg-[#F5F5F0] px-8 lg:px-16 py-20">
        <div className="flex justify-between items-baseline mb-10">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#6B6B6B] m-0">Offene Stellen</p>
          <p
            className="text-[18px] lg:text-[20px] font-light italic text-[#6B6B6B] m-0"
            style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
          >
            {jobs.length > 0 ? `${jobs.length} Positionen offen` : 'Keine offenen Stellen'}
          </p>
        </div>

        {jobs.length > 0 ? (
          <div>
            {jobs.map((j, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_auto] lg:grid-cols-[180px_1fr_140px_200px_28px] items-center gap-4 lg:gap-6 py-6 border-t border-[#E8E8E8] cursor-pointer group hover:bg-white transition-colors duration-200 -mx-8 lg:-mx-16 px-8 lg:px-16"
              >
                <p className="hidden lg:block text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] m-0">{j.dept}</p>
                <p
                  className="text-[18px] lg:text-[22px] font-light m-0 col-span-1"
                  style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
                >
                  {j.title}
                </p>
                <span className="hidden lg:block text-[10px] uppercase tracking-[0.15em] text-[#6B6B6B]">{j.type}</span>
                <span className="hidden lg:block text-[10px] uppercase tracking-[0.15em] text-[#6B6B6B]">{j.loc}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform duration-200 shrink-0">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            ))}
            <div className="border-t border-[#E8E8E8]" />
          </div>
        ) : (
          <div className="border-t border-[#E8E8E8] pt-12 pb-2">
            <p
              className="text-[28px] lg:text-[36px] font-light leading-[1.2] text-[#0A0A0A] max-w-[640px] m-0"
              style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
            >
              Aktuell schreiben wir keine Stellen aus — doch die richtigen Menschen finden bei uns immer einen Platz.
            </p>
            <p className="text-[14px] font-light leading-[1.65] text-[#2D2D2D] mt-5 max-w-[560px] m-0">
              Sende uns deine Initiativbewerbung, und wir melden uns, sobald etwas Passendes entsteht.
            </p>
          </div>
        )}
      </section>

      {/* Open application */}
      <section className="px-8 lg:px-16 py-24 border-b border-[#E8E8E8]">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          <div>
            <h2
              className="text-[40px] lg:text-[52px] font-light leading-[1.1] mb-5"
              style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
            >
              Nichts Passendes dabei?
            </h2>
            <p className="text-[14px] font-light leading-[1.65] text-[#2D2D2D] m-0">
              Wir freuen uns über starke Kandidat:innen. Schick uns eine Initiativbewerbung mit
              Portfolio und einem kurzen Text, warum du zu Enunas passt.
            </p>
          </div>
          <div className="flex flex-col items-start lg:items-end gap-4">
            <p
              className="text-[20px] lg:text-[22px] font-light italic text-[#6B6B6B] m-0"
              style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
            >
              jobs@enunas.com
            </p>
            <a
              href="mailto:jobs@enunas.com"
              className="inline-block px-10 py-[18px] bg-[#370E4D] text-white text-[11px] uppercase tracking-[0.2em] hover:bg-[#4A1566] transition-colors duration-200 no-underline"
              style={{ fontFamily: 'var(--font-league-spartan)' }}
            >
              Initiativbewerbung →
            </a>
          </div>
        </div>
      </section>

    </div>
  )
}
