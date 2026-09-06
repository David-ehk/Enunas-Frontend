import Image from 'next/image'

const values = [
  {
    n: '01',
    title: 'Kuration',
    body: 'Jedes Stück bei Enunas wurde sorgfältig ausgewählt. Qualität, Haltung und Originalität sind unsere einzigen Maßstäbe — kein Algorithmus, nur Urteilsvermögen.',
  },
  {
    n: '02',
    title: 'Gemeinschaft',
    body: 'Enunas ist mehr als ein Marktplatz. Wir bauen eine Gemeinschaft auf, die Mode als Sprache versteht und gemeinsam neue Ausdrucksweisen entdeckt.',
  },
 /* {
    n: '03',
    title: 'Verantwortung',
    body: 'Nachhaltigkeit und ethische Produktion sind keine Optionen — sie sind Grundvoraussetzung für alle Marken auf unserer Plattform.',
  }, */
]

const stats = [
  { n: '10+',    label: 'Marken & Designer' },
  { n: '2.000+', label: 'Produkte' },
  { n: '10.000+', label: 'Kund:innen' },
  { n: '2026',    label: 'Gegründet' },
]

export default function UeberUnsPage() {
  return (
    <div className="bg-white min-h-screen" style={{ fontFamily: 'var(--font-league-spartan)', color: '#0A0A0A' }}>

      {/* Hero */}
      <section className="px-8 lg:px-16 pt-36 lg:pt-44 pb-24">
        <p className="text-[11px] uppercase tracking-[0.3em] text-[#370E4D] mb-8">Über uns</p>
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-end">
          <h1
            className="text-[72px] lg:text-[96px] font-light leading-[0.95] m-0"
            style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
          >
            Wir sind<br />Enunas
          </h1>
          <p className="text-[15px] lg:text-[17px] font-light leading-[1.6] text-[#2D2D2D] m-0">
            Der kuratierte Marktplatz für Designer- und Streetwear. Die Zukunft neu definieren.
            Ein Ort für Stil, Seele und Vision. Einzigartig. Exklusiv. Echt.
          </p>
        </div>
      </section>

      {/* Banner image */}
      <div className="mx-8 lg:mx-16 h-[300px] lg:h-[460px] overflow-hidden relative">
        <Image
          src="https://5btl2wh3w0.ufs.sh/f/XBXTuU9dmEWbwvgYFfeasfCTE4YZSIlyMR6HrLXdq5AVepFt"
          alt="Enunas — Fashion editorial"
          fill
          priority
          className="object-contain"
          sizes="100vw"
        />
      </div>

      {/* Mission */}
      <section className="px-8 lg:px-16 py-20 border-b border-[#E8E8E8]">
        <div className="grid lg:grid-cols-[220px_1fr] gap-16 lg:gap-20">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#6B6B6B] m-0 lg:pt-1.5">
            Unsere Mission
          </p>
          <div>
            <h2
              className="text-[40px] lg:text-[52px] font-light leading-[1.1] mb-7"
              style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
            >
              Mode als Medium —<br />kuratiert mit Haltung
            </h2>
            <p className="text-[14px] lg:text-[15px] font-light leading-[1.65] text-[#2D2D2D] m-0 max-w-[640px]">
              Wir glauben, dass Mode mehr ist als Kleidung. Sie ist Ausdruck von Identität,
              Kultur und Haltung. Bei Enunas steckt hinter jedem Stück eine Frage: Was sagt es
              über die Person, die es trägt? Wir verbinden Fashion-Forward-Denker mit den
              aufregendsten Marken und Designern unserer Zeit.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-[#F5F5F0] px-8 lg:px-16 py-24">
        <p className="text-[11px] uppercase tracking-[0.3em] text-[#6B6B6B] mb-8">Unsere Werte</p>
        <div className="grid md:grid-cols-2 gap-12 lg:gap-24">
          {values.map((v) => (
            <div key={v.n} className="border-t border-[#E8E8E8] pt-7">
              <p
                className="text-[40px] lg:text-[44px] font-light italic text-[#370E4D] leading-none mb-4"
                style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
              >
                {v.n}
              </p>
              <h3
                className="text-[32px] lg:text-[36px] font-light mb-4"
                style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
              >
                {v.title}
              </h3>
              <p className="text-[14px] font-light leading-[1.65] text-[#2D2D2D] m-0 max-w-[480px]">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story panel */}
      <div className="grid lg:grid-cols-[5fr_7fr]">
        <div className="relative h-[300px] lg:h-[500px] overflow-hidden">
          <Image
            src="https://5btl2wh3w0.ufs.sh/f/XBXTuU9dmEWbUWYc1N0CkowKO0cMZUjxbWqG5AnJDLrlYgd9"
            alt="Enunas — Our story"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 42vw"
          />
        </div>
        <div className="bg-[#F5F5F0] text-[#0A0A0A] border-t-2 border-[#370E4D] px-10 lg:px-14 py-16 lg:py-[72px] flex flex-col justify-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#6B6B6B] mb-5">Die Geschichte</p>
          <h2
            className="text-[40px] lg:text-[52px] font-light leading-[1.1] mb-7"
            style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
          >
            Gegründet aus einer<br />echten Lücke
          </h2>
          <p
            className="text-[17px] lg:text-[19px] font-light italic leading-[1.65] text-[#2D2D2D] m-0"
            style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
          >
            2026 entstand Enunas aus unserer Frustration über die fehlende Kuration im deutschen
            Streetwear-Markt. Wir wollten einen Ort schaffen, an dem besondere Brands,
            hochwertige Designs und eine echte Community zusammenkommen. Für uns geht es nicht
            nur darum, Kleidung anzubieten, sondern eine neue Art zu entdecken, was Stil
            bedeuten kann.
          </p>
        </div>
      </div>

      {/* Stats — hidden at launch, none of these numbers are true yet
      <section className="border-t border-[#E8E8E8] px-8 lg:px-16 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.n}
              className="text-center py-6 lg:py-4 border-[#E8E8E8] [&:nth-child(odd)]:border-r [&:nth-child(-n+2)]:border-b lg:border-r lg:border-b-0 lg:[&:last-child]:border-r-0"
            >
              <p
                className="text-[48px] lg:text-[64px] font-light leading-none mb-2"
                style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
              >
                {s.n}
              </p>
              <p className="text-[11px] uppercase tracking-[0.25em] text-[#6B6B6B] m-0">{s.label}</p>
            </div>
          ))}
        </div>
      </section>
      */}

    </div>
  )
}
