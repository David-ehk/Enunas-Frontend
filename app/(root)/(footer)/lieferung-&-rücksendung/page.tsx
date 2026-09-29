import Image from 'next/image'
import Link from 'next/link'
import HorizontalHero from '@/app/(root)/ueber-uns/components/HorizontalHero'
import CurationBand from '@/app/(root)/ueber-uns/components/CurationBand'

const HERO_IMAGE = 'https://5btl2wh3w0.ufs.sh/f/XBXTuU9dmEWbUWYc1N0CkowKO0cMZUjxbWqG5AnJDLrlYgd9'
const BAND_IMAGE = 'https://5btl2wh3w0.ufs.sh/f/XBXTuU9dmEWbtHIlEDhG6Y2kcfPEpBKhCNUQTLJxsWyoARO0'
const BANNER_IMAGE = 'https://5btl2wh3w0.ufs.sh/f/XBXTuU9dmEWbUFTrjg0CkowKO0cMZUjxbWqG5AnJDLrlYgd9'

const serif = { fontFamily: 'var(--font-Cormorant-Garamond)', fontVariantNumeric: 'lining-nums' as const }

const heroSummary = [
  'Innerhalb von Deutschland ist deine Bestellung in 2–4 Werktagen bei dir.',
  'Nach Erhalt der Ware hast du 14 Tage Zeit für eine Rücksendung.',
  'Nach Eingang und Prüfung erstatten wir innerhalb von 5–10 Werktagen über deine ursprüngliche Zahlungsmethode.',
]

const deliveryTimes = [
  { region: 'Deutschland', time: '2–4 Werktage' },
  { region: 'Österreich & Schweiz', time: '3–6 Werktage' },
  { region: 'EU (sonstige)', time: '4–8 Werktage' },
]

const returnSteps = [
  {
    n: '01',
    title: 'Rücksendung beantragen',
    body: 'Melde dich in deinem Konto an und wähle die entsprechende Bestellung aus.',
  },
  {
    n: '02',
    title: 'Retourennummer erhalten',
    body: 'Nach dem Antrag zeigen wir dir die Rücksendeadresse der jeweiligen Marke und eine Retourennummer an. Jede Marke versendet eigenständig, deshalb gehen Rücksendungen direkt an die Marke. Bei Bestellungen mehrerer Marken sendest du bitte getrennt zurück.',
  },
  {
    n: '03',
    title: 'Selbst versenden',
    body: 'Du organisierst die Rücksendung über einen Versanddienst deiner Wahl und trägst die unmittelbaren Kosten selbst. Ein vorfrankiertes Retourenlabel stellen wir derzeit nicht bereit. Bewahre den Einlieferungsbeleg bis zum Abschluss der Erstattung auf.',
  },
]

/** Giant centered uppercase serif section title. */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-light uppercase text-center leading-[1] m-0 px-6"
      style={{ ...serif, fontSize: 'clamp(2.75rem, 6vw, 5.5rem)' }}
    >
      {children}
    </h2>
  )
}

export default function LieferungRuecksendungPage() {
  return (
    <div className="bg-white min-h-screen" style={{ fontFamily: 'var(--font-league-spartan)', color: '#0A0A0A' }}>

      {/* Pinned tinted hero — the three facts that matter, sliding sideways on scroll */}
      <HorizontalHero
        image={HERO_IMAGE}
        title={<>Lieferung<br />&amp; Rücksendung</>}
        tagline={heroSummary[0]}
        paragraphs={heroSummary.slice(1)}
      />

      {/* Lieferzeiten */}
      <section className="pt-24 lg:pt-32 pb-24 lg:pb-32 px-8 lg:px-16">
        <SectionTitle>Lieferzeiten</SectionTitle>
        <div className="max-w-[1080px] mx-auto mt-16 lg:mt-24">
          {deliveryTimes.map((d) => (
            <div
              key={d.region}
              className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 border-t border-[#E8E8E8] py-8 lg:py-10 last:border-b"
            >
              <p className="font-light uppercase leading-[1] m-0" style={{ ...serif, fontSize: 'clamp(1.75rem, 3.2vw, 2.75rem)' }}>
                {d.region}
              </p>
              <p className="font-light italic text-[#370E4D] leading-[1] m-0" style={{ ...serif, fontSize: 'clamp(1.5rem, 2.6vw, 2.25rem)' }}>
                {d.time}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Versandkosten — offset single column */}
      <section className="px-8 lg:px-16 pb-24 lg:pb-32">
        <div className="lg:ml-[33%] max-w-[760px]">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#6B6B6B] mb-6">Versandkosten</p>
          <h2
            className="font-light leading-[1.08] m-0 mb-10"
            style={{ ...serif, fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}
          >
            Pro Marke berechnet
          </h2>
          <p
            className="font-light italic leading-[1.6] text-[#2D2D2D] m-0"
            style={{ ...serif, fontSize: 'clamp(1.2rem, 1.8vw, 1.5rem)' }}
          >
            Die Versandkosten werden pro Marke berechnet. Enthält deine Bestellung Artikel mehrerer
            Marken, wird der Versand je Marke separat ausgewiesen. Die genaue Aufstellung siehst du
            vor dem Bezahlen.
          </p>
        </div>
      </section>

      {/* Rücksendung — conditions, then the three steps as a slide timeline */}
      <section className="px-8 lg:px-16 pb-24 lg:pb-32">
        <SectionTitle>Rücksendung</SectionTitle>
        <p
          className="max-w-[720px] mx-auto text-center font-light italic leading-[1.55] text-[#2D2D2D] m-0 mt-12 lg:mt-16"
          style={{ ...serif, fontSize: 'clamp(1.3rem, 2vw, 1.75rem)' }}
        >
          Rücksendungen sind innerhalb von 14 Tagen nach Erhalt der Ware möglich. Artikel müssen
          ungetragen, ungewaschen und mit Originaletiketten zurückgesendet werden.
        </p>
      </section>
      <CurationBand steps={returnSteps} image={BAND_IMAGE} marquee="Rücksendung" interval={12000} />

      {/* Rückerstattung */}
      <section className="pt-24 lg:pt-32 pb-24 lg:pb-32 px-8 lg:px-16">
        <SectionTitle>Rückerstattung</SectionTitle>
        <p
          className="max-w-[720px] mx-auto text-center font-light italic leading-[1.55] text-[#2D2D2D] m-0 mt-12 lg:mt-16"
          style={{ ...serif, fontSize: 'clamp(1.3rem, 2vw, 1.75rem)' }}
        >
          Nach Eingang und Prüfung der Rücksendung erfolgt die Rückerstattung innerhalb von 5–10
          Werktagen über die ursprüngliche Zahlungsmethode.
        </p>
      </section>

      {/* Closing banner — full-bleed tinted portrait, centred title and link */}
      <section className="relative h-[85svh] min-h-[560px] overflow-hidden text-white">
        <Image
          src={BANNER_IMAGE}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-top grayscale brightness-[1.15]"
        />
        <div className="absolute inset-0 bg-[#5B1F80] mix-blend-multiply" aria-hidden />
        <div className="relative h-full flex flex-col items-center justify-end pb-24 lg:pb-32 text-center px-6">
          <h2
            className="font-light uppercase leading-[1] m-0"
            style={{ ...serif, fontSize: 'clamp(2.75rem, 6vw, 5.5rem)' }}
          >
            Noch Fragen?
          </h2>
          <p className="text-[18px] lg:text-[20px] font-medium m-0 mt-6">
            info@enunas.com · Mo–Sa · 10:00–18:00 Uhr
          </p>
          <Link
            href="/kundenservice"
            className="mt-12 font-league-spartan text-[16px] font-medium tracking-[0.12em] uppercase border-b border-white pb-1 hover:opacity-70 transition-opacity duration-300 ease-out-expo"
          >
            Zum Kundenservice
          </Link>
        </div>
      </section>

    </div>
  )
}
