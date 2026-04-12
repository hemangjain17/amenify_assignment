import { useState, useEffect } from 'react'

const SERVICE_BADGES = [
  { icon: '🧹', label: 'Cleaning' },
  { icon: '🔧', label: 'Handyman' },
  { icon: '🐕', label: 'Dog Walking' },
  { icon: '🛒', label: 'Grocery' },
  { icon: '🍕', label: 'Food Delivery' },
  { icon: '🌿', label: 'Chores' },
  { icon: '🚗', label: 'Car Wash' },
  { icon: '📦', label: 'Moving' },
]

const STATS = [
  { value: '15M+',   label: 'Homes Served' },
  { value: '500+',   label: 'US Cities' },
  { value: '4.9★',   label: 'Avg Rating' },
  { value: '7 Days', label: 'Support/Week' },
]

const styles = {
  hero: {
    id: 'home',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #061A10 0%, #0D2B1B 30%, #0E3D24 60%, #145C34 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: '8rem 1.5rem 5rem',
    position: 'relative',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(80px)',
    opacity: 0.18,
    pointerEvents: 'none',
  },
  glow1: { width: 600, height: 600, background: '#1BAF72', top: '-10%', left: '-10%' },
  glow2: { width: 500, height: 500, background: '#0E8A5F', bottom: '-5%', right: '-5%' },
  glow3: { width: 300, height: 300, background: '#1BAF72', top: '30%', right: '10%' },
  grid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(27,175,114,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(27,175,114,0.04) 1px, transparent 1px)
    `,
    backgroundSize: '60px 60px',
    pointerEvents: 'none',
  },
  inner: {
    position: 'relative',
    zIndex: 2,
    maxWidth: 850,
    width: '100%',
  },
  topBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    background: 'rgba(27,175,114,0.15)',
    border: '1px solid rgba(27,175,114,0.3)',
    borderRadius: 999,
    padding: '0.35rem 1rem',
    color: '#5EEAB4',
    fontSize: '0.82rem',
    fontWeight: 600,
    marginBottom: '1.75rem',
    letterSpacing: '0.04em',
  },
  dot: {
    width: 8,
    height: 8,
    background: '#1BAF72',
    borderRadius: '50%',
    display: 'inline-block',
    boxShadow: '0 0 0 2px rgba(27,175,114,0.4)',
    animation: 'pulseDot 2s ease-in-out infinite',
  },
  h1: {
    fontSize: 'clamp(2.4rem, 6vw, 4.2rem)',
    fontWeight: 900,
    color: '#FFFFFF',
    lineHeight: 1.1,
    letterSpacing: '-0.035em',
    marginBottom: '1.5rem',
  },
  accent: { color: '#1BAF72' },
  sub: {
    fontSize: 'clamp(1rem, 2vw, 1.2rem)',
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 1.7,
    marginBottom: '2.5rem',
    maxWidth: 580,
    margin: '0 auto 2.5rem',
  },
  ctas: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '3.5rem',
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.9rem 2rem',
    borderRadius: 999,
    fontSize: '1rem',
    fontWeight: 700,
    color: '#fff',
    background: '#1BAF72',
    boxShadow: '0 8px 32px rgba(27,175,114,0.45)',
    textDecoration: 'none',
    transition: 'all 0.22s',
    fontFamily: 'Inter, sans-serif',
  },
  btnOutline: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.9rem 2rem',
    borderRadius: 999,
    fontSize: '1rem',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.85)',
    border: '1.5px solid rgba(255,255,255,0.3)',
    background: 'rgba(255,255,255,0.06)',
    textDecoration: 'none',
    transition: 'all 0.22s',
    fontFamily: 'Inter, sans-serif',
  },
  badgesRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.6rem',
    justifyContent: 'center',
    marginBottom: '4rem',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.45rem 1rem',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 999,
    color: 'rgba(255,255,255,0.8)',
    fontSize: '0.85rem',
    fontWeight: 500,
    backdropFilter: 'blur(8px)',
    transition: 'all 0.2s',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    paddingTop: '2.5rem',
    width: '100%',
  },
  statItem: {
    textAlign: 'center',
  },
  statVal: {
    display: 'block',
    fontSize: '2rem',
    fontWeight: 900,
    color: '#1BAF72',
    letterSpacing: '-0.03em',
    lineHeight: 1.1,
  },
  statLabel: {
    display: 'block',
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.5)',
    fontWeight: 500,
    marginTop: '0.25rem',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
}

export default function Hero() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <section
      id="home"
      style={{
        ...styles.hero,
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.6s ease',
      }}
    >
      {/* Background effects */}
      <div style={{ ...styles.glow, ...styles.glow1 }} />
      <div style={{ ...styles.glow, ...styles.glow2 }} />
      <div style={{ ...styles.glow, ...styles.glow3 }} />
      <div style={styles.grid} />

      <div style={styles.inner}>
        {/* Top badge */}
        <div style={styles.topBadge}>
          <span style={styles.dot} />
          Now live in 500+ U.S. cities · 15M+ homes
        </div>

        {/* Headline */}
        <h1 style={styles.h1}>
          Your Home,{' '}
          <span style={styles.accent}>Perfectly</span>
          <br />
          Managed.
        </h1>

        {/* Sub-headline */}
        <p style={styles.sub}>
          Professional on-demand lifestyle services for apartment residents.
          Cleaning, handyman, dog walking, grocery delivery & more — all in one platform.
        </p>

        {/* CTA buttons */}
        <div style={styles.ctas}>
          <a
            href="https://amenify.app.link/e/website-search"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.btnPrimary}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(27,175,114,0.55)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = ''
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(27,175,114,0.45)'
            }}
          >
            🎉 Get Started — $50 Off
          </a>
          <a
            href="https://www.amenify.com/property-managers-2"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.btnOutline}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.55)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
            }}
          >
            For Property Managers →
          </a>
        </div>

        {/* Service badges */}
        <div style={styles.badgesRow}>
          {SERVICE_BADGES.map((b) => (
            <span
              key={b.label}
              style={styles.badge}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(27,175,114,0.15)'
                e.currentTarget.style.borderColor = 'rgba(27,175,114,0.4)'
                e.currentTarget.style.color = '#5EEAB4'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
              }}
            >
              {b.icon} {b.label}
            </span>
          ))}
        </div>

        {/* Stats bar */}
        <div style={styles.statsRow}>
          {STATS.map((s) => (
            <div key={s.label} style={styles.statItem}>
              <span style={styles.statVal}>{s.value}</span>
              <span style={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulseDot {
          0%,100% { box-shadow: 0 0 0 2px rgba(27,175,114,0.4); }
          50%      { box-shadow: 0 0 0 5px rgba(27,175,114,0.15); }
        }
      `}</style>
    </section>
  )
}
