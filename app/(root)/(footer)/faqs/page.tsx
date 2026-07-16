'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Link from 'next/link'

const faqs = [
  {
    id: 'einkaufen',
    category: 'Einkaufen',
    items: [
      {
        q: 'Wie gebe ich eine Bestellung auf?',
        a: 'Wählen Sie Ihre gewünschten Artikel aus, fügen Sie diese dem Warenkorb hinzu und folgen Sie dem Checkout-Prozess. Sie können als Gast oder mit einem Konto bestellen.',
      },
      {
        q: 'Kann ich meine Bestellung nach der Aufgabe ändern?',
        a: 'Bestellungen können nur geändert oder storniert werden, solange sie noch nicht versendet wurden. Kontaktieren Sie bitte umgehend unseren Kundenservice.',
      },
      {
        q: 'Welche Größen sind verfügbar?',
        a: 'Das Größenangebot variiert je nach Marke und Produkt. Die verfügbaren Größen werden auf der jeweiligen Produktseite angezeigt.',
      },
    ],
  },
  {
    id: 'zahlung',
    category: 'Zahlung',
    items: [
      {
        q: 'Welche Zahlungsmethoden akzeptieren Sie?',
        a: 'Wir akzeptieren Kreditkarten (Visa, Mastercard, Amex), PayPal, Klarna und Sofortüberweisung.',
      },
      {
        q: 'Wann wird meine Zahlung abgebucht?',
        a: 'Die Zahlung wird zum Zeitpunkt der Bestellaufgabe autorisiert und nach dem Versand Ihres Pakets abgebucht.',
      },
      {
        q: 'Ist meine Zahlung sicher?',
        a: 'Alle Transaktionen sind SSL-verschlüsselt. Wir speichern keine Kreditkartendaten auf unseren Servern.',
      },
    ],
  },
  {
    id: 'versand',
    category: 'Versand',
    items: [
      {
        q: 'Wie lange dauert die Lieferung?',
        a: 'Innerhalb Deutschlands liefern wir in 2–4 Werktagen, in die EU in 4–8 Werktagen. Eine detaillierte Übersicht finden Sie auf unserer Lieferseite.',
      },
      {
        q: 'Wie viel kostet der Versand?',
        a: 'Ab einem Bestellwert von 50 € ist der Versand kostenlos. Darunter berechnen wir eine Pauschale von 4,99 €.',
      },
      {
        q: 'Kann ich meine Bestellung verfolgen?',
        a: 'Nach dem Versand erhalten Sie eine E-Mail mit Ihrer Tracking-Nummer. Den Status Ihrer Sendung können Sie jederzeit unter Sendungsverfolgung einsehen.',
      },
    ],
  },
  {
    id: 'konto',
    category: 'Mein Konto',
    items: [
      {
        q: 'Wie erstelle ich ein Konto?',
        a: 'Klicken Sie auf das Konto-Symbol oben rechts und wählen Sie „Registrieren". Die Anmeldung dauert nur wenige Minuten.',
      },
      {
        q: 'Ich habe mein Passwort vergessen. Was tun?',
        a: 'Klicken Sie auf „Passwort vergessen" auf der Anmeldeseite. Wir senden Ihnen einen Link zur Zurücksetzung an Ihre hinterlegte E-Mail-Adresse.',
      },
      {
        q: 'Wie kann ich meine persönlichen Daten ändern?',
        a: 'In Ihrem Konto unter „Einstellungen" können Sie Ihre persönlichen Daten, Lieferadressen und Zahlungsmethoden jederzeit anpassen.',
      },
    ],
  },
  {
    id: 'ruecksendung',
    category: 'Rücksendung & Umtausch',
    items: [
      {
        q: 'Wie initiiere ich eine Rücksendung?',
        a: 'Melden Sie sich in Ihrem Konto an, wählen Sie die betreffende Bestellung und klicken Sie auf „Rücksendung einleiten". Sie erhalten ein vorfrankiertes Etikett per E-Mail.',
      },
      {
        q: 'Wie lange habe ich Zeit für eine Rücksendung?',
        a: 'Sie haben 14 Tage nach Erhalt der Ware Zeit, eine Rücksendung einzuleiten. Artikel müssen ungetragen und mit Originaletiketten zurückgesandt werden.',
      },
      {
        q: 'Wann erhalte ich meine Rückerstattung?',
        a: 'Nach Eingang und Prüfung der Rücksendung erfolgt die Rückerstattung innerhalb von 5–10 Werktagen über die ursprüngliche Zahlungsmethode.',
      },
    ],
  },
  {
    id: 'marken',
    category: 'Marken & Produkte',
    items: [
      {
        q: 'Wie werden Marken auf Enunas ausgewählt?',
        a: 'Jede Marke auf Enunas wird sorgfältig geprüft und kuratiert. Wir arbeiten ausschließlich mit authentischen, qualitätsbewussten Labels zusammen.',
      },
      {
        q: 'Sind alle Produkte auf Enunas original?',
        a: 'Ja. Wir garantieren die Authentizität aller Produkte auf unserer Plattform — jede Marke ist ein direkter Partner von Enunas.',
      },
      {
        q: 'Kann ich als Marke auf Enunas verkaufen?',
        a: 'Wir freuen uns über Bewerbungen. Besuchen Sie unsere Markenpartner-Seite und füllen Sie das Bewerbungsformular aus — wir melden uns zeitnah.',
      },
    ],
  },
]

export default function FaqsPage() {
  return (
    <div className="bg-white min-h-screen">

      {/* Hero */}
      <section className="px-6 pt-24 pb-20 text-center border-b border-[#E8E8E8]">
        <p
          className="text-[10px] uppercase tracking-[0.25em] text-[#6B6B6B] mb-6"
          style={{ fontFamily: 'var(--font-league-spartan)' }}
        >
          Kundenservice
        </p>
        <h1
          className="text-4xl lg:text-[52px] font-light text-[#0A0A0A] mb-10 leading-[1.15]"
          style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
        >
          Willkommen.<br />
          Wie können wir dir heute helfen?
        </h1>
        <div className="inline-flex">
          <Link
            href="/kundenservice"
            className="px-10 py-3 border border-[#E8E8E8] text-[10px] tracking-[0.2em] uppercase text-[#6B6B6B] hover:border-[#370E4D] hover:text-[#370E4D] transition-colors duration-300"
            style={{ fontFamily: 'var(--font-league-spartan)' }}
          >
            Kontakt
          </Link>
          <span
            className="px-10 py-3 border border-[#370E4D] bg-[#370E4D] text-[10px] tracking-[0.2em] uppercase text-white"
            style={{ fontFamily: 'var(--font-league-spartan)' }}
          >
            FAQs
          </span>
        </div>
      </section>

      {/* Accordion */}
      <section className="max-w-2xl mx-auto px-6 py-20 lg:py-28">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((group) => (
            <AccordionItem
              key={group.id}
              value={group.id}
              className="border-b border-[#E8E8E8] last:border-b-0"
            >
              <AccordionTrigger className="py-7 hover:no-underline group/trigger [&>svg]:hidden">
                <div className="flex w-full items-center justify-between">
                  <span
                    className="text-[22px] font-light text-[#0A0A0A] group-hover/trigger:text-[#370E4D] transition-colors duration-300 tracking-wide"
                    style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
                  >
                    {group.category}
                  </span>
                  <span
                    className="text-[#6B6B6B] group-data-[state=open]/trigger:rotate-45 transition-transform duration-300 text-lg leading-none"
                    style={{ fontFamily: 'var(--font-league-spartan)' }}
                  >
                    +
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="overflow-hidden">
                <div className="pb-4">
                  {group.items.map((item, i) => (
                    <div key={i} className="border-t border-[#E8E8E8] py-6">
                      <p
                        className="text-[11px] uppercase tracking-[0.15em] text-[#0A0A0A] mb-3"
                        style={{ fontFamily: 'var(--font-league-spartan)' }}
                      >
                        {item.q}
                      </p>
                      <p
                        className="text-[13px] leading-[1.7] text-[#6B6B6B]"
                        style={{ fontFamily: 'var(--font-league-spartan)' }}
                      >
                        {item.a}
                      </p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

    </div>
  )
}
