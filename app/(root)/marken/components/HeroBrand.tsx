interface HeroBrandProps {
  brandName: string
  count?: number
  loading?: boolean
}

// No per-brand photography exists yet, so the hero leans on the same
// monogram treatment used as the fallback on brand cards (FeaturedBrandCard)
// — an oversized, near-invisible initial letter — instead of a generic
// gradient block or a mismatched stock photo.
const HeroBrand = ({ brandName, count, loading = false }: HeroBrandProps) => {
  return (
    <section style={{ position: 'relative', width: '100%', height: '88vh', overflow: 'hidden', minHeight: 520, background: 'linear-gradient(160deg, #0a0a0a 0%, #250838 130%)' }}>

      {/* Oversized monogram — decorative, echoes the brand-card fallback */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'min(60vw, 820px)',
          fontWeight: 300,
          color: 'rgba(255,255,255,0.05)',
          lineHeight: 1,
          userSelect: 'none',
        }}>
          {brandName.charAt(0).toUpperCase()}
        </span>
      </div>

      {/* Gradient — deep at bottom for text legibility */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.04) 30%, rgba(0,0,0,0.6) 68%, rgba(0,0,0,0.92) 100%)',
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
          Enunas · Marke
        </p>

        {/* Main title */}
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(48px, 9vw, 108px)',
          fontWeight: 300,
          letterSpacing: '-0.01em',
          color: '#fff',
          margin: '0 0 20px',
          lineHeight: 0.98,
        }}>
          {brandName}
        </h1>

        {/* Tagline — the only per-brand "descriptive text" available today */}
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
          Kuratierte Pieces von {brandName} — ausgewählt für ihre unverkennbare Handschrift bei Enunas.
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

export default HeroBrand
