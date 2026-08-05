import React from 'react'
import Link from 'next/link'

interface CatalogueSectionProps {
  color: string
  label: string
  title: string
  description: string
  philosophy: string
  href: string
  imageFirst?: boolean
  imageSrc?: string
}

function CatalogueSection({
  color, label, title, description, philosophy, href, imageFirst = true, imageSrc,
}: CatalogueSectionProps) {
  const image = (
    <div className="w-full lg:w-1/2 flex-shrink-0">
      <div className="w-full overflow-hidden" style={{ aspectRatio: '3/4' }}>
        {imageSrc ? (
          <img src={imageSrc} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-enunas-off-white flex items-center justify-center">
            <span className="font-league-spartan text-[10px] tracking-[0.2em] uppercase text-enunas-gray-medium">Bild</span>
          </div>
        )}
      </div>
    </div>
  )

  const text = (
    <div
      className="w-full lg:w-1/2 flex-shrink-0 p-8 sm:p-10 lg:p-12 flex flex-col justify-center"
      style={{ background: color }}
    >
      <p className="font-league-spartan text-[10px] tracking-[0.25em] uppercase text-white/60 mb-3">
        {label}
      </p>
      <h2
        className="font-cormorant font-light text-white mb-6"
        style={{ fontSize: 'clamp(32px, 7vw, 56px)', lineHeight: 1.05 }}
      >
        {title}
      </h2>
      <p className="font-league-spartan text-xs sm:text-sm text-white/80 leading-relaxed mb-4">
        {description}
      </p>
      <p className="font-cormorant italic text-base sm:text-lg text-white/70 leading-relaxed mb-8">
        {philosophy}
      </p>
      <Link
        href={href}
        className="inline-flex items-center gap-2 font-league-spartan text-[11px] tracking-[0.2em] uppercase text-white border-b border-white/40 pb-1 hover:border-white transition-colors duration-200 self-start"
      >
        Kategorie entdecken →
      </Link>
    </div>
  )

  return (
    <div className="flex flex-col lg:flex-row">
      {imageFirst ? <>{image}{text}</> : <>{text}{image}</>}
    </div>
  )
}

function CatalogueDescription() {
  return (
    <section className="flex flex-col">

      {/* Streetwear */}
      <CatalogueSection
        color="#0011A5"
        label="Kategorie · Streetwear"
        title="Streetwear"
        description="Du kennst die Szene. Du weißt, was läuft, bevor es alle anderen checken. Dein Stil kommt nicht aus Magazinen. Er kommt von der Straße, aus der Musik, aus Bewegungen, die die meisten nicht mal kommen sehen. Oversized Fits, Grafik Tees, Cargos, Hoodies – nicht weil es gerade angesagt ist. Sondern weil es einfach du bist."
        philosophy="Wenn du dich beim Anziehen nicht erklären musst, dann bist du hier richtig."
        href="/bekleidung/streetwear"
        imageFirst={true}
        imageSrc="/assets/images/Test1.WebP"
      />

      {/* Experimental */}
      <CatalogueSection
        color="#6C169C"
        label="Kategorie · Experimental"
        title="Experimental"
        description="Du hast schon mal ein Kompliment für dein Outfit bekommen und wusstest nicht, ob es eines war. Asymmetrische Schnitte, ungewöhnliche Materialien, Stücke, die Fragen aufwerfen. Mode ist für dich keine Routine. Sie ist Ausdruck, manchmal Provokation, immer bewusst gewählt."
        philosophy="Wenn du lieber auffällst als dazugehörst und das nicht trotz, sondern wegen deines Stils, dann ist das deine Kategorie."
        href="/bekleidung/experimental"
        imageFirst={false}
        imageSrc="https://cdn.rickowens.eu/products/205600/large/RL02E1719_CTW_09_01.jpg?1757411991"
      />

      {/* Athleisure */}
      <CatalogueSection
        color="#C01B1B"
        label="Kategorie · Athleisure"
        title="Athleisure"
        description="Keine Pause, kein Kompromiss. Dein Leben ist in Bewegung: vom Studio in den Alltag, deine Kleidung macht alles mit. Performance-Stoffe, saubere Silhouetten, Kleidung, die Style und Funktion vereinen, aber nicht unbedingt nach Sportkleidung aussehen"
        philosophy="Wenn Stil und Bewegung für dich kein Widerspruch sind, sondern eine Selbstverständlichkeit"
        href="/bekleidung/athleisure"
        imageFirst={true}
        imageSrc="/assets/images/Test3.WebP"
      />

      {/* Culture */}
      <CatalogueSection
        color="#C07850"
        label="Kategorie · Cultural"
        title="Cultural"
        description="Dein Kleiderschrank erzählt Geschichten von Orten, Menschen und Einflüssen, die dich geprägt haben. Du trägst Stücke, die Bedeutung haben. Kulturelle Referenzen, globale Einflüsse, handwerkliche Details. Du bist stolz auf deine Wurzeln und gleichzeitig neugierig auf das, was die Welt noch zu bieten hat."
        philosophy="Du interessierst dich für die Geschichten hinter der Mode, und für dich ist sie ein Ausdruck von Inspiration, um dich mit der Welt zu verbinden."
        href="/bekleidung/cultural"
        imageFirst={false}
        imageSrc="/assets/images/Test4.WebP"
      />

      {/* Star */}
      <CatalogueSection
        color="#0A0A0A"
        label="Kategorie · Star"
        title="Star"
        description="Du betrittst einen Raum, und Leute merken es. Nicht weil du laut bist, sondern weil dein Stil Präsenz hat. Starke Stücke, klare Aussagen, Qualität, die man sieht. Du ziehst dich nicht für andere an, aber du weißt genau, welchen Eindruck du hinterlässt."
        philosophy="Du musst nichts erklären – dein Stil macht das."
        href="/bekleidung/star"
        imageFirst={true}
        imageSrc="/assets/images/Test1.WebP"
      />

    </section>
  )
}

export default CatalogueDescription
