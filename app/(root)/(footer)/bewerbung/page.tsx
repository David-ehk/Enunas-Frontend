import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Teil von Enunas werden — Für Marken & Designer',
  description:
    'Werde Brand Partner auf Enunas, dem kuratierten Marktplatz für Designer & Streetwear. Jetzt bewerben oder als bestehender Partner einloggen.',
}

const reasons = [
  {
    n: '01',
    title: 'Kuratierte Community',
    body: 'Deine Marke erscheint neben sorgfältig ausgewählten Designern — keine Masse, sondern ein Publikum, das Handwerk und Herkunft zu schätzen weiss.',
  },
  {
    n: '02',
    title: 'Volle Kontrolle',
    body: 'Verwalte Produkte, Varianten, Preise und Bestellungen eigenständig im Brand Portal. Transparente Provisionsabrechnung inklusive.',
  },
  {
    n: '03',
    title: 'Wir kümmern uns um den Rest',
    body: 'Zahlungsabwicklung, Käuferschutz und Reichweite übernehmen wir. Du konzentrierst dich auf das, was du am besten kannst — deine Kollektion.',
  },
]

const steps = [
  {
    n: '01',
    title: 'Bewerben',
    body: 'Reiche deine Markendaten über das Brand Portal ein — Kontaktperson, Firmensitz und ein paar Angaben zu deiner Marke genügen.',
  },
  {
    n: '02',
    title: 'Prüfung',
    body: 'Unser Team prüft jede Bewerbung persönlich, um die Qualität des Marktplatzes zu wahren. Du erhältst die Rückmeldung per E-Mail.',
  },
  {
    n: '03',
    title: 'Verkaufen',
    body: 'Nach der Freigabe stellst du deine Produkte ein und erreichst ab dem ersten Tag die kuratierte Enunas-Community.',
  },
]

export default function BewerbungPage() {
  return (
    <div className="bg-white min-h-screen" style={{ fontFamily: 'var(--font-league-spartan)' }}>

      {/* Purple hero */}
      <section className="bg-[#370E4D] text-white px-8 lg:px-16 pt-36 pb-28 min-h-[520px] lg:min-h-[600px] flex flex-col justify-end">
        <p className="text-[11px] uppercase tracking-[0.3em] opacity-60 mb-8">Teil von Enunas</p>
        <div className="grid lg:grid-cols-[7fr_5fr] gap-16 lg:gap-20 items-end">
          <h1
            className="text-[64px] lg:text-[96px] font-light leading-[0.95] m-0"
            style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
          >
            Verkaufe deine<br />
            Produkte<br />
            auf Enunas
          </h1>
          <div className="flex flex-col gap-8">
            <p className="text-[15px] lg:text-[17px] font-light leading-[1.6] opacity-85 m-0">
              Der kuratierte Marktplatz für Designer &amp; Streetwear. Präsentiere deine Kollektion
              einem Publikum, das Kuration zu schätzen weiss.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard/register"
                className="inline-block text-center px-10 py-[18px] bg-white text-[#370E4D] text-[11px] uppercase tracking-[0.2em] hover:bg-[#F5F5F0] transition-colors duration-200 no-underline"
                style={{ fontFamily: 'var(--font-league-spartan)' }}
              >
                Als Brand Partner bewerben →
              </Link>
              <Link
                href="/dashboard/login"
                className="inline-block text-center px-10 py-[18px] border border-white/40 text-white text-[11px] uppercase tracking-[0.2em] hover:border-white transition-colors duration-200 no-underline"
                style={{ fontFamily: 'var(--font-league-spartan)' }}
              >
                Partner-Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Enunas */}
      <section className="px-8 lg:px-16 py-24 border-b border-[#E8E8E8]">
        <p className="text-[11px] uppercase tracking-[0.3em] text-[#6B6B6B] mb-8">Warum Enunas</p>
        <div className="grid md:grid-cols-3 gap-12">
          {reasons.map((r) => (
            <div key={r.n} className="border-t border-[#E8E8E8] pt-7">
              <p
                className="text-[40px] lg:text-[44px] font-light italic text-[#370E4D] leading-none mb-4"
                style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
              >
                {r.n}
              </p>
              <h3
                className="text-[28px] lg:text-[30px] font-light leading-[1.1] mb-4"
                style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
              >
                {r.title}
              </h3>
              <p className="text-[14px] font-light leading-[1.65] text-[#2D2D2D] m-0">{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#F5F5F0] px-8 lg:px-16 py-24">
        <p className="text-[11px] uppercase tracking-[0.3em] text-[#6B6B6B] mb-12">So funktioniert&apos;s</p>
        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((s) => (
            <div key={s.n}>
              <p
                className="text-[44px] lg:text-[52px] font-light italic text-[#370E4D] leading-none mb-5"
                style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
              >
                {s.n}
              </p>
              <h3
                className="text-[24px] lg:text-[26px] font-light leading-[1.15] mb-3"
                style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
              >
                {s.title}
              </h3>
              <p className="text-[14px] font-light leading-[1.65] text-[#2D2D2D] m-0">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Apply CTA */}
      <section className="px-8 lg:px-16 py-24 border-b border-[#E8E8E8]">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          <div>
            <h2
              className="text-[40px] lg:text-[52px] font-light leading-[1.1] mb-5"
              style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
            >
              Bereit, deine Marke<br />zu zeigen?
            </h2>
            <p className="text-[14px] font-light leading-[1.65] text-[#2D2D2D] m-0">
              Reiche deine Bewerbung ein und werde Teil des kuratierten Enunas-Marktplatzes.
              Bereits Partner? Melde dich direkt im Brand Portal an.
            </p>
          </div>
          <div className="flex flex-col items-start lg:items-end gap-4">
            <Link
              href="/dashboard/register"
              className="inline-block px-10 py-[18px] bg-[#370E4D] text-white text-[11px] uppercase tracking-[0.2em] hover:bg-[#4A1566] transition-colors duration-200 no-underline"
              style={{ fontFamily: 'var(--font-league-spartan)' }}
            >
              Als Brand Partner bewerben →
            </Link>
            <Link
              href="/dashboard/login"
              className="text-[13px] tracking-[0.06em] text-[#6B6B6B] no-underline hover:text-[#370E4D] transition-colors duration-200"
              style={{ fontFamily: 'var(--font-league-spartan)' }}
            >
              Bereits Partner?{' '}
              <span className="text-[#370E4D] underline">Hier einloggen</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
