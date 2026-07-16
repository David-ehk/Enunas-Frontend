import LegalPage from '../components/LegalPage'
import type { LegalSection } from '../components/LegalPage'

const sections: LegalSection[] = [
  {
    id: 'anbieter', num: '01', label: 'Anbieter gemäß § 5 TMG', title: 'Anbieter',
    paras: [
      ['Diensteanbieter', 'Enunas UG (haftungsbeschränkt)', 'Musterstraße 42, 10115 Berlin, Deutschland'],
      ['Vertreten durch', 'David Emmanuel Hod Konan, Geschäftsführer'],
    ],
  },
  {
    id: 'kontakt', num: '02', label: 'Kontakt', title: 'Kontakt',
    paras: [
      ['E-Mail', 'info@enunas.com'],
      ['Web', 'www.enunas.com'],
    ],
  },
  {
    id: 'register', num: '03', label: 'Handelsregister', title: 'Registereintrag',
    paras: [
      ['Registergericht', 'Amtsgericht Berlin-Charlottenburg'],
      ['Registernummer', '[HRB-Nummer]'],
    ],
  },
  {
    id: 'ustid', num: '04', label: 'Umsatzsteuer-ID', title: 'Umsatzsteuer',
    paras: [
      'Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:',
      ['USt-IdNr.', '[USt-IdNr.]'],
    ],
  },
  {
    id: 'os', num: '05', label: 'EU-Streitschlichtung', title: 'Online-Streitbeilegung',
    paras: [
      'Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit, erreichbar unter https://ec.europa.eu/consumers/odr/. Unsere E-Mail-Adresse finden Sie oben.',
      'Wir sind weder bereit noch verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.',
    ],
  },
  {
    id: 'inhalte', num: '06', label: 'Haftung für Inhalte', title: 'Haftung für Inhalte',
    paras: [
      'Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen.',
      'Eine Haftung ist erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden entsprechender Rechtsverletzungen entfernen wir diese Inhalte umgehend.',
    ],
  },
  {
    id: 'links', num: '07', label: 'Haftung für Links', title: 'Haftung für Links',
    paras: [
      'Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter verantwortlich.',
      'Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft — rechtswidrige Inhalte waren nicht erkennbar. Bei Bekanntwerden von Rechtsverletzungen entfernen wir derartige Links umgehend.',
    ],
  },
  {
    id: 'urheberrecht', num: '08', label: 'Urheberrecht', title: 'Urheberrecht',
    paras: [
      'Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen Autors.',
      'Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.',
    ],
  },
]

export default function ImpressumPage() {
  return (
    <LegalPage
      kicker="Rechtliches — Impressum"
      title="Impressum"
      lede="Transparenz ist die Grundlage von Vertrauen. Hier finden Sie alle gesetzlich vorgeschriebenen Angaben zu Enunas."
      meta={['Angaben gemäß § 5 TMG', 'Stand Juni 2026']}
      sections={sections}
      contact={{
        aside: 'Fragen zu diesem Dokument beantworten wir gern persönlich.',
        eyebrow: 'Kontakt',
        heading: <>Sprechen Sie uns an</>,
        email: 'info@enunas.com',
        hours: 'Mo–Sa · 10:00–18:00 Uhr',
      }}
    />
  )
}
