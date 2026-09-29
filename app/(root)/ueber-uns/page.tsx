import Image from 'next/image'
import Link from 'next/link'
import HorizontalHero from './components/HorizontalHero'
import CurationBand from './components/CurationBand'

const values = [
  {
    n: '01',
    title: 'Kuration',
    body: 'Jedes Stück bei Enunas wurde sorgfältig ausgewählt. Qualität, Haltung und Originalität sind unsere einzigen Maßstäbe — kein Algorithmus, nur Urteilsvermögen.',
    // Reused from CatalogueDescription's confirmed Streetwear photo — curation of the marketplace's
    // designer/streetwear range is literally what this photo already represents on /catalogue.
    image: 'https://5btl2wh3w0.ufs.sh/f/XBXTuU9dmEWbtHIlEDhG6Y2kcfPEpBKhCNUQTLJxsWyoARO0',
  },
  {
    n: '02',
    title: 'Gemeinschaft',
    body: 'Enunas ist mehr als ein Marktplatz. Wir bauen eine Gemeinschaft auf, die Mode als Sprache versteht und gemeinsam neue Ausdrucksweisen entdeckt.',
    // Reused from CatalogueDescription's confirmed Star photo — presence in a room, being seen.
    image: 'https://5btl2wh3w0.ufs.sh/f/XBXTuU9dmEWbUFTrjg0CkowKO0cMZUjxbWqG5AnJDLrlYgd9',
  },
 /* {
    n: '03',
    title: 'Verantwortung',
    body: 'Nachhaltigkeit und ethische Produktion sind keine Optionen — sie sind Grundvoraussetzung für alle Marken auf unserer Plattform.',
  }, */
]

// The community Enunas wants to be: open to people of every background and belief.
const communityPoints = [
  {
    n: '01',
    title: 'Offenheit',
    body: 'Enunas ist für alle da. Wir bauen eine Community aus Menschen mit den unterschiedlichsten Hintergründen, Geschichten und Lebensentwürfen. Jede Stimme hat hier ihren Platz.',
  },
  {
    n: '02',
    title: 'Glaube & Herkunft',
    body: 'Unser Zeichen hat christliche Wurzeln. Es ist unsere Herkunft, keine Bedingung. Bei uns sind Menschen aller Glaubensrichtungen willkommen, und ebenso die, die an nichts davon glauben.',
  },
  {
    n: '03',
    title: 'Respekt',
    body: 'Offenheit heißt, einander zuzuhören und Unterschiede auszuhalten. Wo viele Perspektiven zusammenkommen, entsteht ein Stil, den es sonst nirgends gäbe.',
  },
]

const stats = [
  { n: '10+',    label: 'Marken & Designer' },
  { n: '2.000+', label: 'Produkte' },
  { n: '10.000+', label: 'Kund:innen' },
  { n: '2026',    label: 'Gegründet' },
]

const tagline =
  'Der kuratierte Marktplatz für Designer- und Streetwear. Die Zukunft neu definieren. Ein Ort für Stil, Seele und Vision. Einzigartig. Exklusiv. Echt.'

const missionParagraphs = [
  'Wir glauben, dass Mode mehr ist als Kleidung. Sie ist Ausdruck von Identität, Kultur und Haltung.',
  'Bei Enunas steckt hinter jedem Stück eine Frage: Was sagt es über die Person, die es trägt?',
  'Wir verbinden Fashion-Forward-Denker mit den aufregendsten Marken und Designern unserer Zeit.',
]

// A reading of the logo, in the manner of an iconographic analysis. Each entry names the detail,
// the interpretation, and the sources it leans on (biblical citations follow the Lutherbibel).
const logoReadings = [
  {
    n: 'I',
    title: 'Das Schwert und das Kreuz',
    body: 'Das Schwert steht aufrecht, die Spitze nach unten, der Griff nach oben. Griff und Parierstange bilden ein Kreuz. In der christlichen Tradition ist das Schwert nicht nur Waffe, sondern Bild für das Wort: „Das Wort Gottes ist lebendig und kräftig und schärfer als jedes zweischneidige Schwert“. Unser Schwert schneidet nicht, es trägt.',
    refs: 'Vgl. Eph 6,17 („Schwert des Geistes“); Hebr 4,12.',
  },
  {
    n: 'II',
    title: 'Der Ring und der Heiligenschein',
    body: 'Der Ring um die Klinge erinnert an den Nimbus, den die christliche Kunst seit der Spätantike Heiligen und Christus zuordnet. Er ist bei uns hohl, nicht gefüllt: kein Anspruch auf Heiligkeit, nur eine Andeutung davon. Und er liegt schräg. Ein Heiligenschein wäre waagerecht und vollkommen. Unser Ring kippt, weil wir es nicht sind.',
    refs: 'Zum Nimbus in der christlichen Ikonografie vgl. die spätantike und frühbyzantinische Kunst.',
  },
  {
    n: 'III',
    title: 'Die Scharten in der Klinge',
    body: 'In der Klinge sitzen kleine Kerben. Eine Klinge ohne Scharte wurde nie geführt. Wir verstecken sie nicht, sie sind das Bild für unsere Fehler und für das, was die Bibel nüchtern festhält: „Denn alle haben gesündigt und verfehlen die Herrlichkeit Gottes.“ Das Zeichen gibt sich nicht makellos, und gerade darin ist es ehrlich.',
    refs: 'Vgl. Röm 3,23.',
  },
  {
    n: 'IV',
    title: 'Die Waage',
    body: 'Die Parierstange liegt wie ein Waagbalken quer zur Klinge, die Klinge ist Lot und Zeiger. Schwert und Waage sind seit jeher die Attribute der Justitia, der Gerechtigkeit, die abwägt, bevor sie urteilt. Im Mittelalter hält auch der Erzengel Michael beides: das Schwert und die Waage, mit der er die Seelen wägt. Balance ist bei uns der Anspruch, nicht der Zustand.',
    refs: 'Zu Justitia und zu Michael als Seelenwäger (Psychostasie) vgl. die mittelalterliche und neuzeitliche Ikonografie.',
  },
  {
    n: 'V',
    title: 'Die Krone am Knauf',
    body: 'Die kleine Krone im Knauf ist kein Herrschaftsanspruch. Sie steht für aufrechte Haltung trotz aller Fehler: Kopf hoch, weil einem der Kopf gehoben wird. „Du, HERR, bist der Schild für mich, du bist meine Ehre und hebst mein Haupt empor“, heißt es im Psalm. Die Krone der Gerechtigkeit im Neuen Testament wird nicht verdient, sondern verliehen.',
    refs: 'Vgl. Ps 3,4; 2 Tim 4,8.',
  },
  {
    n: 'VI',
    title: 'München',
    body: 'Enunas kommt aus München, einer Stadt, deren Name „bei den Mönchen“ bedeutet und die ein Mönchskind im Wappen trägt. Gegründet 1158, ist sie seit ihrem Anfang christlich geprägt. In der Michaelskirche, zwischen 1583 und 1597 erbaut, steht der Erzengel Michael als Sieger an der Fassade, mit Schwert. Ein Zeichen mit Schwert, Nimbus und Krone ist in dieser Stadt keine Fremdheit, sondern Herkunft.',
    refs: 'Zur Stadtgeschichte: Gründung 1158 unter Heinrich dem Löwen; Michaelskirche München (1583–1597).',
  },
]

const STORY_IMAGE ='https://5btl2wh3w0.ufs.sh/f/XBXTuU9dmEWbUWYc1N0CkowKO0cMZUjxbWqG5AnJDLrlYgd9'

const serif = { fontFamily: 'var(--font-Cormorant-Garamond)', fontVariantNumeric: 'lining-nums' as const }

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

/** Staggered image + text row with a rotated caption beside the image. */
function QuinRow({
  image,
  alt,
  caption,
  title,
  body,
  reverse = false,
}: {
  image: string
  alt: string
  caption: string
  title: string
  body: string
  reverse?: boolean
}) {
  return (
    <div className={`flex flex-col md:flex-row md:justify-between md:items-center gap-10 md:gap-0 ${reverse ? 'md:flex-row-reverse' : ''}`}>
      <div className={`flex items-stretch gap-6 md:gap-8 ${reverse ? 'md:flex-row-reverse' : ''}`}>
        <p
          className="m-0 text-[14px] md:text-[16px] uppercase tracking-[0.08em] whitespace-nowrap [writing-mode:vertical-rl] self-start"
          style={{ fontFamily: 'var(--font-league-spartan)' }}
        >
          {caption}
        </p>
        <div className="relative aspect-[3/4] w-[min(404px,62vw)] overflow-hidden bg-enunas-off-white">
          <Image
            src={image}
            alt={alt}
            fill
            sizes="(min-width: 768px) 404px, 62vw"
            className="object-cover"
          />
        </div>
      </div>
      <div className="md:w-[324px]">
        <h3
          className="font-light uppercase leading-[0.95] m-0 mb-8"
          style={{ ...serif, fontSize: 'clamp(2.25rem, 3.4vw, 2.75rem)' }}
        >
          {title}
        </h3>
        <p className="font-normal leading-[1.5] m-0 md:pl-11 text-[18px]" style={serif}>
          {body}
        </p>
      </div>
    </div>
  )
}

export default function UeberUnsPage() {
  return (
    <div className="bg-white min-h-screen" style={{ fontFamily: 'var(--font-league-spartan)', color: '#0A0A0A' }}>

      {/* Pinned tinted hero — scroll slides the text columns sideways */}
      <HorizontalHero video="https://5btl2wh3w0.ufs.sh/f/XBXTuU9dmEWbpR5K1iOCwcgFKdqleIRySxzn6ZXroN0M3Ha7" title={<>Wir sind<br />Enunas</>} tagline={tagline} paragraphs={missionParagraphs} />

      {/* Werte — giant title, then staggered image/text rows */}
      <section className="pt-24 lg:pt-32 pb-24 lg:pb-32 overflow-x-clip">
        <SectionTitle>Unsere Werte</SectionTitle>
        <div className="max-w-[1080px] mx-auto px-8 mt-16 lg:mt-24 space-y-20 lg:space-y-28">
          {values.map((v, i) => (
            <QuinRow
              key={v.n}
              image={v.image}
              alt={v.title}
              caption={`Wert ${v.n}`}
              title={v.title}
              body={v.body}
              reverse={i % 2 === 1}
            />
          ))}
        </div>
      </section>

      {/* Community — colour band, slide timeline, outlined marquee title */}
      <CurationBand steps={communityPoints} image={values[0].image} marquee="Kuration" />

      {/* Die Geschichte — text-first staggered row */}
      <section className="pt-24 lg:pt-32 pb-24 lg:pb-32 overflow-x-clip">
        <SectionTitle>Die Geschichte</SectionTitle>
        <div className="max-w-[1080px] mx-auto px-8 mt-16 lg:mt-24">
          <QuinRow
            image={STORY_IMAGE}
            alt="Enunas — Our story"
            caption="Gegründet 2026"
            title="Aus einer echten Lücke"
            body="2026 entstand Enunas aus unserer Frustration über die fehlende Kuration im deutschen Streetwear-Markt. Wir wollten einen Ort schaffen, an dem besondere Brands, hochwertige Designs und eine echte Community zusammenkommen. Für uns geht es nicht nur darum, Kleidung anzubieten, sondern eine neue Art zu entdecken, was Stil bedeuten kann."
            reverse
          />
        </div>
      </section>

      {/* Overture — brand film */}
      <section className="pb-24 lg:pb-32">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12">
          <video
            src="https://5btl2wh3w0.ufs.sh/f/XBXTuU9dmEWbpJX24hROCwcgFKdqleIRySxzn6ZXroN0M3Ha"
            controls
            playsInline
            preload="metadata"
            className="block w-full aspect-[3840/1608] bg-enunas-off-white object-cover"
          >
            Dein Browser unterstützt dieses Video nicht.
          </video>
        </div>
      </section>

      {/* Logo — the original about-page image, in the slot the category list used to occupy */}
      <section className="pb-24 lg:pb-32">
        <SectionTitle>Das Zeichen</SectionTitle>
        <div className="relative mx-auto mt-12 lg:mt-16 aspect-[4/5] w-[min(360px,70vw)]">
          <Image
            src="https://5btl2wh3w0.ufs.sh/f/XBXTuU9dmEWbwvgYFfeasfCTE4YZSIlyMR6HrLXdq5AVepFt"
            alt="Enunas Logo: ein aufrecht stehendes Schwert mit Krone am Knauf, umkreist von einem schräg liegenden, offenen Ring"
            fill
            sizes="(min-width: 768px) 360px, 70vw"
            className="object-contain"
          />
        </div>

        <div className="px-8 lg:px-16 mt-16 lg:mt-24">
          <p
            className="max-w-[720px] mx-auto text-center font-light italic leading-[1.55] text-[#2D2D2D] m-0"
            style={{ ...serif, fontSize: 'clamp(1.3rem, 2vw, 1.75rem)' }}
          >
            Das Zeichen von Enunas ist kein Kampfsymbol. Es zeigt ein Schwert, das nicht angreift,
            sondern aufrecht steht, und in fünf Details eine Haltung: Wir sind nicht makellos, und wir
            tragen den Kopf trotzdem hoch.
          </p>

          <div className="max-w-[1080px] mx-auto mt-16 lg:mt-24">
            {logoReadings.map((r) => (
              <div
                key={r.n}
                className="grid lg:grid-cols-[100px_300px_minmax(0,1fr)] gap-4 lg:gap-10 items-baseline border-t border-[#E8E8E8] py-8 lg:py-10 last:border-b"
              >
                <p className="font-light italic text-[#370E4D] leading-none m-0" style={{ ...serif, fontSize: '2.25rem' }}>
                  {r.n}
                </p>
                <h3
                  className="font-light uppercase leading-[1.05] m-0"
                  style={{ ...serif, fontSize: 'clamp(1.6rem, 2.4vw, 2rem)' }}
                >
                  {r.title}
                </h3>
                <div>
                  <p className="font-normal leading-[1.6] m-0 text-[18px] max-w-[600px]" style={serif}>
                    {r.body}
                  </p>
                  <p className="m-0 mt-4 text-[12px] tracking-[0.06em] text-[#6B6B6B] max-w-[600px]">{r.refs}</p>
                </div>
              </div>
            ))}
          </div>

          <p
            className="max-w-[720px] mx-auto text-center font-light italic leading-[1.55] text-[#6B6B6B] m-0 mt-14"
            style={{ ...serif, fontSize: '1.15rem' }}
          >
            Symbole lassen mehrere Lesarten zu. Dies ist unsere.
          </p>
        </div>
      </section>

      {/* Closing banner — full-bleed tinted portrait, centred title and link */}
      <section className="relative h-[85svh] min-h-[560px] overflow-hidden text-white">
        <Image
          src={values[1].image}
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
            Entdecke die Marken
          </h2>
          <p className="text-[18px] lg:text-[20px] font-medium m-0 mt-6">Die Marken, die Enunas ausmachen.</p>
          <Link
            href="/marken"
            className="mt-12 font-league-spartan text-[16px] font-medium tracking-[0.12em] uppercase border-b border-white pb-1 hover:opacity-70 transition-opacity duration-300 ease-out-expo"
          >
            Alle Marken entdecken
          </Link>
        </div>
      </section>

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
