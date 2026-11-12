import Image from 'next/image'

interface HeroBrandProps {
  brandName: string
  logoUrl?: string | null
  heroImageUrl?: string | null
  count?: number
  loading?: boolean
}

// The brand's own hero image (uploaded in the vendor dashboard) fills the hero.
// Brands without one fall back to the monogram treatment used on brand cards
// (FeaturedBrandCard) — an oversized, near-invisible initial letter.
const HeroBrand = ({ brandName, logoUrl, heroImageUrl, count, loading = false }: HeroBrandProps) => {
  return (
    <section style={{ position: 'relative', width: '100%', height: '88vh', overflow: 'hidden', minHeight: 520, background: 'linear-gradient(160deg, #0a0a0a 0%, #250838 130%)' }}>

      {heroImageUrl ? (
        <div className="animate-fade-in" style={{ position: 'absolute', inset: 0 }}>
          <Image
            src={heroImageUrl}
            alt=""
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
        </div>
      ) : (
      /* Oversized monogram — decorative, echoes the brand-card fallback */
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
      )}

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

        {/* Brand logo — square, object-cover, same framing as the vendor dashboard upload */}
        {logoUrl && (
          <div
            className="animate-fade-in"
            style={{
              position: 'relative',
              width: 'clamp(64px, 7vw, 96px)',
              aspectRatio: '1 / 1',
              overflow: 'hidden',
              background: '#F5F5F0',
              margin: '0 0 28px',
            }}
          >
            <Image
              src={logoUrl}
              alt={`${brandName} Logo`}
              fill
              sizes="96px"
              priority
              className="object-cover"
            />
          </div>
        )}

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
