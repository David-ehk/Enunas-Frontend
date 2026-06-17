const HeroNew = ({ count, loading = false }: { count?: number; loading?: boolean }) => {
  return (
    <section style={{ position: 'relative', width: '100%', height: '88vh', overflow: 'hidden', minHeight: 520 }}>

      {/* Photo — fills the section, no overlap with navbar needed since section is in normal flow */}
      <img
        src="/assets/images/NEWIN.jpg"
        alt="New in"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center top',
        }}
      />

      {/* Gradient — barely visible at top, deep at bottom for text legibility */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.06) 40%, rgba(0,0,0,0.78) 100%)',
      }} />

      {/* Editorial text block — bottom-left */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '0 clamp(20px, 4vw, 48px) 52px',
      }}>

        {/* Eyebrow */}
        <p style={{
          fontFamily: "'League Spartan', sans-serif",
          fontSize: 10,
          letterSpacing: '0.44em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.52)',
          margin: '0 0 20px',
          fontWeight: 400,
        }}>
          Enunas · Neu In
        </p>

        {/* Main title */}
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(64px, 11vw, 122px)',
          fontWeight: 300,
          letterSpacing: '-0.01em',
          color: '#fff',
          margin: '0 0 20px',
          lineHeight: 0.92,
        }}>
          New in.
        </h1>

        {/* Tagline */}
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic',
          fontSize: 'clamp(15px, 1.4vw, 18px)',
          fontWeight: 400,
          color: 'rgba(255,255,255,0.76)',
          margin: '0 0 30px',
          maxWidth: 460,
          lineHeight: 1.58,
        }}>
          Wir pushen die Grenzen der Alltagswear. Frische Silhouetten, mutige Farbpaletten und Grafiken, die für sich sprechen.
        </p>

        {/* Article count with horizontal rules */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ display: 'block', height: 1, width: 36, background: 'rgba(255,255,255,0.22)' }} />
          <span style={{
            fontFamily: "'League Spartan', sans-serif",
            fontSize: 10,
            letterSpacing: '0.26em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.44)',
            whiteSpace: 'nowrap',
          }}>
            {loading ? '—' : `${count ?? '—'} Artikel`}
          </span>
          <span style={{ display: 'block', height: 1, width: 36, background: 'rgba(255,255,255,0.22)' }} />
        </div>

      </div>
    </section>
  )
}

export default HeroNew
