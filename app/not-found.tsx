import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <p
        className="text-[10px] uppercase tracking-[0.25em] text-enunas-gray-medium mb-6"
        style={{ fontFamily: 'var(--font-league-spartan)' }}
      >
        Fehler 404
      </p>
      <h1
        className="font-cormorant font-light text-enunas-black mb-6"
        style={{ fontSize: 'clamp(40px, 9vw, 80px)', lineHeight: 1 }}
      >
        Seite nicht gefunden
      </h1>
      <p
        className="font-league-spartan text-sm text-enunas-gray-dark max-w-md leading-relaxed mb-10"
      >
        Die von dir gesuchte Seite existiert nicht oder wurde verschoben.
      </p>
      <Link
        href="/"
        className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-black border-b border-enunas-black pb-1 hover:text-enunas-purple hover:border-enunas-purple transition-colors duration-200"
      >
        Zurück zur Startseite →
      </Link>
    </main>
  )
}
