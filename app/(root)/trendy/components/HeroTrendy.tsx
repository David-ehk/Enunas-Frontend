const HeroTrendy = ({ count, loading = false }: { count?: number; loading?: boolean }) => {
  return (
    <section style={{ position: 'relative', width: '100%', height: '88vh', overflow: 'hidden', minHeight: 520 }}>

      {/* Photo */}
      <img
        src="/assets/images/TRENDY.jpg"
        alt="Trendy"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center 35%',
        }}
      />

      {/* Gradient overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.06) 40%, rgba(0,0,0,0.78) 100%)',
      }} />

      {/* Editorial text block */}
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
          Enunas · Was Läuft
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
          Trendy.
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
          Diese Pieces sind unsere absoluten Top-Seller. Angesagte Silhouetten mit alltagstauglichem Komfort — der Look, der immer trifft.
        </p>

        {/* Article count */}
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

export default HeroTrendy
