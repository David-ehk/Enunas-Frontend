import LegalPage from '../components/LegalPage'
import type { LegalSection } from '../components/LegalPage'

const sections: LegalSection[] = [
  {
    id: 'v', num: '01', label: 'Verantwortlicher', title: 'Verantwortlicher',
    paras: [
      'Verantwortlich für die Verarbeitung personenbezogener Daten auf dieser Website ist die Enunas UG (haftungsbeschränkt), Musterstraße 42, 10115 Berlin, vertreten durch den Geschäftsführer David Emmanuel Hod Konan.',
      ['Datenschutz-Kontakt', 'datenschutz@enunas.com'],
    ],
  },
  {
    id: 'e', num: '02', label: 'Erhebung & Verarbeitung', title: 'Erhebung und Verarbeitung',
    paras: [
      'Beim Besuch unserer Website übermittelt Ihr Browser automatisch Server-Log-Dateien: IP-Adresse, Datum und Uhrzeit, aufgerufene URL, Referrer-URL, Browsertyp und Betriebssystem. Diese Daten werden zur Sicherstellung des Betriebs verarbeitet (Art. 6 Abs. 1 lit. f DSGVO) und nach spätestens 7 Tagen gelöscht.',
      'Bei Registrierung und Bestellung verarbeiten wir Name, E-Mail, Liefer- und Rechnungsadresse, Zahlungsdaten sowie Bestellhistorie auf Basis von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).',
      'Unsere Website wird auf Servern der Amazon Web Services EMEA SARL (Region Frankfurt, eu-central-1) gehostet. Die Datenverarbeitung erfolgt ausschließlich innerhalb der EU.',
    ],
  },
  {
    id: 'c', num: '03', label: 'Cookies & Tracking', title: 'Cookies und Tracking',
    paras: [
      'Technisch notwendige Cookies (Session, Warenkorb) werden ohne Einwilligung gesetzt, da sie für den Betrieb erforderlich sind (Art. 6 Abs. 1 lit. f DSGVO).',
      'Mit Ihrer Einwilligung setzen wir Analyse-Cookies über PostHog ein — ein Open-Source-Analysetool, das selbstgehostet auf AWS Frankfurt betrieben wird. Es erfolgt keine Datenübertragung außerhalb der EU (Art. 6 Abs. 1 lit. a DSGVO). Widerruf jederzeit über die Cookie-Einstellungen.',
      'Für Marketing und Retargeting holen wir Ihre ausdrückliche, gesonderte Einwilligung ein. Übermittlungen in Drittländer erfolgen auf Basis von Standardvertragsklauseln.',
    ],
  },
  {
    id: 'b', num: '04', label: 'Bestellprozess', title: 'Bestellprozess und Konto',
    paras: [
      'Zur Abwicklung von Bestellungen verarbeiten wir Bestelldaten, Adressen und Zahlungsinformationen (Art. 6 Abs. 1 lit. b DSGVO). Bestelldaten werden aufgrund handels- und steuerrechtlicher Pflichten für 10 Jahre aufbewahrt. Kontodaten löschen wir nach Kündigung binnen 30 Tagen, soweit keine Aufbewahrungspflicht entgegensteht.',
    ],
  },
  {
    id: 'n', num: '05', label: 'Newsletter', title: 'Newsletter',
    paras: [
      'Mit Ihrer ausdrücklichen Einwilligung senden wir Ihnen unseren Newsletter. Die Anmeldung erfolgt im Double-Opt-In-Verfahren; Zeitpunkt und IP-Adresse werden als Nachweis gespeichert.',
      'Sie können den Newsletter jederzeit abbestellen — über den Abmelde-Link oder per E-Mail an newsletter@enunas.com.',
    ],
  },
  {
    id: 'z', num: '06', label: 'Zahlungsdienstleister', title: 'Zahlungsdienstleister',
    paras: [
      'Die Zahlungsabwicklung erfolgt über Mollie B.V., Keizersgracht 126, 1015 CW Amsterdam, Niederlande. Bei der Zahlung werden Ihre Zahlungsdaten direkt an Mollie übertragen. Enunas speichert keine vollständigen Zahlungsdaten (Art. 6 Abs. 1 lit. b DSGVO).',
      ['Datenschutzinformationen Mollie', 'https://www.mollie.com/de/privacy'],
    ],
  },
  {
    id: 'd', num: '07', label: 'Weitergabe an Dritte', title: 'Weitergabe an Dritte',
    paras: [
      'Wir geben Daten nur weiter, wenn dies zur Vertragserfüllung erforderlich ist (z. B. Versanddienstleister DHL), eine gesetzliche Verpflichtung besteht oder Sie eingewilligt haben. Eine Weitergabe zu Werbezwecken ohne Einwilligung findet nicht statt.',
    ],
  },
  {
    id: 'r', num: '08', label: 'Ihre Rechte', title: 'Ihre Rechte nach DSGVO',
    paras: [
      'Ihnen stehen zu: Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung (Art. 18), Datenübertragbarkeit (Art. 20) sowie Widerspruch (Art. 21 DSGVO). Zur Ausübung: datenschutz@enunas.com.',
      ['Beschwerderecht', 'Berliner Beauftragte für Datenschutz und Informationsfreiheit, Alt-Moabit 59–61, 10555 Berlin.'],
    ],
  },
  {
    id: 's', num: '09', label: 'Datensicherheit', title: 'Datensicherheit',
    paras: [
      'Unsere Website nutzt durchgängig SSL/TLS-Verschlüsselung. Alle personenbezogenen Daten werden auf Servern in der EU (Amazon Web Services, Frankfurt) gespeichert. Wir treffen technische und organisatorische Maßnahmen gemäß Art. 32 DSGVO, die regelmäßig überprüft werden.',
    ],
  },
  {
    id: 'a', num: '10', label: 'Änderungen', title: 'Änderungen dieser Erklärung',
    paras: [
      'Wir passen diese Erklärung an, um sie stets aktuellen rechtlichen Anforderungen entsprechen zu lassen. Es gilt die jeweils zum Zeitpunkt Ihres Besuchs aktuelle Fassung. Über wesentliche Änderungen informieren wir registrierte Kund:innen per E-Mail.',
    ],
  },
]

export default function DatenschutzerklaerungPage() {
  return (
    <LegalPage
      kicker="Rechtliches — Datenschutz"
      title={<>Datenschutz&shy;erklärung</>}
      lede="Ihre Daten gehören Ihnen. Wir erklären offen, welche wir erheben, warum — und wie wir sie schützen."
      meta={['Gemäß DSGVO & BDSG', 'Stand Juni 2026']}
      sections={sections}
      contact={{
        aside: 'Sie möchten Ihre Rechte ausüben oder haben Fragen? Melden Sie sich.',
        eyebrow: 'Datenschutz-Team',
        heading: <>Ihre Daten, Ihre Wahl</>,
        email: 'datenschutz@enunas.com',
        hours: 'Antwort binnen 5 Werktagen',
      }}
    />
  )
}
