'use client'

import { useState, useEffect, useRef } from 'react'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ComingSoonNewsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle')
  const videoRef = useRef<HTMLVideoElement>(null)

  // Same autoplay robustness as the homepage Subscribe section: relying on the
  // JSX autoPlay/muted attributes alone can lose the race with hydration, and
  // some mobile browsers reject autoplay as a policy decision rather than a
  // buffering one — the first touch/click/scroll anywhere is used as a
  // last-resort kick.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = true
    video.defaultMuted = true
    const playPromise = video.play()
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        const retry = () => { video.play().catch(() => {}) }
        video.addEventListener('canplaythrough', retry, { once: true })
      })
    }
    const tryPlay = () => { video.play().catch(() => {}) }
    const events: Array<keyof DocumentEventMap> = ['touchstart', 'pointerdown', 'click', 'scroll']
    events.forEach(event => document.addEventListener(event, tryPlay, { once: true, passive: true }))
    return () => {
      events.forEach(event => document.removeEventListener(event, tryPlay))
    }
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!EMAIL_RE.test(email.trim())) {
      setStatus('error')
      return
    }
    // No backend newsletter endpoint yet — same precedent as Homepage/Subscribe.tsx.
    // Validate + acknowledge locally so the form isn't dead UI. Replace with the
    // real submit once a provider/backend endpoint exists.
    setStatus('success')
    setEmail('')
  }

  const lbl = (opacity = 0.35) => ({
    fontSize: 9 as const, letterSpacing: '0.28em',
    textTransform: 'uppercase' as const,
    color: `rgba(245,245,240,${opacity})`, margin: 0,
  })

  return (
    <div style={{ background: '#080808', color: '#F5F5F0', fontFamily: "'League Spartan', sans-serif", minHeight: '100vh' }}>
      <section style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <video
          ref={videoRef}
          src="https://5btl2wh3w0.ufs.sh/f/XBXTuU9dmEWb2WGqVP7isC1V3ItrQiuhO5KGRm6Ue0BLyTDl"
          autoPlay loop muted playsInline
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center 30%',
            filter: 'brightness(0.32)',
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(105deg, rgba(8,8,8,0.92) 0%, rgba(8,8,8,0.55) 55%, rgba(8,8,8,0.3) 100%)',
        }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.06)' }} />

        <div style={{
          position: 'relative', width: '100%', maxWidth: 640,
          margin: '0 auto', padding: '96px clamp(20px, 6vw, 72px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        }}>
          <p style={{ ...lbl(0.4), marginBottom: 22, letterSpacing: '0.36em' }}>Enunas Drops</p>

          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(2.5rem, 9vw, 5rem)', fontWeight: 300, fontStyle: 'italic',
            lineHeight: 0.95, letterSpacing: '-0.01em',
            color: '#F5F5F0', margin: '0 0 22px', whiteSpace: 'pre-line',
          }}>{'The Drops\nAre Coming'}</h1>

          <p style={{
            fontSize: 13, lineHeight: 1.7, fontWeight: 300,
            color: 'rgba(245,245,240,0.5)', letterSpacing: '0.02em',
            margin: '0 0 44px', maxWidth: 440,
          }}>
            Limited-edition collaborative releases, arriving soon. Be the first to know the moment the first drop goes live.
          </p>

          <form onSubmit={handleSubmit} noValidate style={{ width: '100%', maxWidth: 420 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); if (status !== 'idle') setStatus('idle') }}
                placeholder="Your email address"
                aria-label="Email address"
                aria-invalid={status === 'error'}
                style={{
                  flex: '1 1 220px',
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${status === 'error' ? '#8B1E3F' : 'rgba(255,255,255,0.16)'}`,
                  color: '#F5F5F0',
                  fontFamily: "'League Spartan', sans-serif",
                  fontSize: 13,
                  padding: '15px 16px',
                  outline: 'none',
                  transition: 'border-color 200ms',
                }}
              />
              <button
                type="submit"
                style={{
                  flex: '0 0 auto',
                  background: '#F5F5F0', color: '#080808', border: 'none', cursor: 'pointer',
                  fontFamily: "'League Spartan', sans-serif",
                  fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase',
                  padding: '17px 28px', transition: 'opacity 200ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
              >Notify Me</button>
            </div>

            {status === 'error' && (
              <p style={{ marginTop: 12, fontSize: 11, color: '#E88', letterSpacing: '0.02em' }} role="alert">
                Please enter a valid email address.
              </p>
            )}
            {status === 'success' && (
              <p style={{ marginTop: 12, fontSize: 11, color: 'rgba(245,245,240,0.6)', letterSpacing: '0.02em' }} role="status">
                Thank you — we&apos;ll let you know the moment the first drop goes live.
              </p>
            )}
          </form>
        </div>
      </section>
    </div>
  )
}
