import LegalPage from '../components/LegalPage'
import type { LegalSection } from '../components/LegalPage'

const sections: LegalSection[] = [
  {
    id: 's1', num: '§ 1', label: 'Geltungsbereich', title: 'Geltungsbereich',
    paras: [
      'Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge zwischen der Enunas UG (haftungsbeschränkt), Musterstraße 42, 10115 Berlin („Enunas") und Verbraucherinnen und Verbrauchern sowie Unternehmerinnen und Unternehmern („Kund:in"), die über den Online-Shop www.enunas.com abgeschlossen werden.',
      'Abweichende Bedingungen des Kunden werden nicht anerkannt, es sei denn, Enunas stimmt ihrer Geltung ausdrücklich schriftlich zu.',
    ],
  },
  {
    id: 's2', num: '§ 2', label: 'Vertragsschluss', title: 'Vertragsschluss',
    paras: [
      'Die Darstellung der Produkte im Online-Shop stellt kein rechtlich bindendes Angebot dar, sondern eine unverbindliche Aufforderung zur Bestellung.',
      'Durch Anklicken des Buttons „Jetzt kaufen" gibt der Kunde ein verbindliches Angebot ab. Der Kaufvertrag kommt erst mit Versand der Auftragsbestätigung per E-Mail zustande.',
      'Enunas kann Bestellungen ohne Angabe von Gründen ablehnen.',
    ],
  },
  {
    id: 's3', num: '§ 3', label: 'Preise & Zahlung', title: 'Preise und Zahlung',
    paras: [
      'Alle angegebenen Preise sind Endpreise in Euro und enthalten die gesetzliche Mehrwertsteuer. Versandkosten werden im Bestellprozess gesondert ausgewiesen.',
      ['Akzeptierte Zahlungsarten', 'Visa, Mastercard, American Express, PayPal, Klarna (Sofortüberweisung, Rechnung, Ratenkauf), Apple Pay und Google Pay.'],
      'Der Rechnungsbetrag ist mit Bestellabschluss fällig. Bei Zahlung auf Rechnung gilt das jeweilige Zahlungsziel gemäß Klarna-Bedingungen.',
    ],
  },
  {
    id: 's4', num: '§ 4', label: 'Lieferung & Versand', title: 'Lieferung und Versand',
    paras: [
      'Lieferungen erfolgen innerhalb Deutschlands sowie in ausgewählte europäische Länder. Standardlieferung 3–5 Werktage, Expresslieferung 1–2 Werktage gegen Aufpreis. Ab einem Bestellwert von EUR 100,– innerhalb Deutschlands ist die Standardlieferung kostenfrei.',
      'Die Lieferfrist beginnt am Tag nach Vertragsschluss. Ist ein Artikel nicht vorrätig, wird der Kunde umgehend informiert und kann die Bestellung kostenfrei stornieren.',
    ],
  },
  {
    id: 's5', num: '§ 5', label: 'Eigentumsvorbehalt', title: 'Eigentumsvorbehalt',
    paras: [
      'Die Ware bleibt bis zur vollständigen Bezahlung des Kaufpreises Eigentum der Enunas UG (haftungsbeschränkt).',
    ],
  },
  {
    id: 's6', num: '§ 6', label: 'Widerrufsrecht', title: 'Widerrufsrecht',
    paras: [
      'Verbrauchern steht ein gesetzliches Widerrufsrecht zu. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem der Kunde oder ein benannter Dritter die Waren in Besitz genommen hat.',
      'Zur Ausübung genügt eine eindeutige Erklärung — etwa per E-Mail an widerruf@enunas.com oder über das Online-Rückgabeformular. Zur Fristwahrung reicht die rechtzeitige Absendung der Mitteilung.',
      'Im Falle eines wirksamen Widerrufs erstattet Enunas alle Zahlungen innerhalb von vierzehn Tagen zurück, sofern die Ware eingegangen ist oder deren Rücksendung nachgewiesen wurde.',
    ],
  },
  {
    id: 's7', num: '§ 7', label: 'Mängelansprüche', title: 'Mängelansprüche und Garantie',
    paras: [
      'Es gelten die gesetzlichen Mängelhaftungsrechte. Die Verjährungsfrist für Mängelansprüche beträgt zwei Jahre ab Lieferung der Ware.',
      'Gewähren Hersteller eine Herstellergarantie, gelten deren Bedingungen zusätzlich zu den gesetzlichen Mängelansprüchen und schränken diese nicht ein.',
    ],
  },
  {
    id: 's8', num: '§ 8', label: 'Haftung', title: 'Haftung',
    paras: [
      'Enunas haftet unbeschränkt für Schäden aus der Verletzung von Leben, Körper oder Gesundheit, bei Vorsatz oder grober Fahrlässigkeit sowie nach dem Produkthaftungsgesetz.',
      'Bei leicht fahrlässiger Verletzung wesentlicher Vertragspflichten ist die Haftung auf den vertragstypisch vorhersehbaren Schaden begrenzt. Eine weitergehende Haftung für leichte Fahrlässigkeit ist ausgeschlossen.',
    ],
  },
  {
    id: 's9', num: '§ 9', label: 'Streitschlichtung', title: 'Streitschlichtung',
    paras: [
      'Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung bereit: https://ec.europa.eu/consumers/odr/. Enunas ist weder bereit noch verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.',
    ],
  },
  {
    id: 's10', num: '§ 10', label: 'Anwendbares Recht', title: 'Anwendbares Recht & Gerichtsstand',
    paras: [
      'Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.',
      'Gerichtsstand für alle Streitigkeiten mit Kaufleuten und juristischen Personen des öffentlichen Rechts ist Berlin.',
      'Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.',
    ],
  },
]

export default function AgbsPage() {
  return (
    <LegalPage
      kicker="Rechtliches — AGB"
      title={<>Allgemeine<br />Geschäfts&shy;bedingungen</>}
      lede="Klare Spielregeln schaffen Vertrauen — für Sie als Kund:in und für uns als Plattform."
      meta={['Fassung 2.0', 'Gültig ab Juni 2026']}
      sections={sections}
      contact={{
        aside: 'Etwas unklar? Wir erklären jeden Paragrafen gern in einfachen Worten.',
        eyebrow: 'Kontakt',
        heading: <>Noch Fragen?</>,
        email: 'info@enunas.com',
        hours: 'Mo–Sa · 10:00–18:00 Uhr',
      }}
    />
  )
}
