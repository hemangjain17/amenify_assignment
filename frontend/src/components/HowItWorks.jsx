const STEPS = [
  {
    num: '01',
    icon: '📱',
    title: 'Create Your Account',
    desc: 'Sign up on the Amenify app in under 2 minutes. Get $50 in Amenify Cash on your first booking plus access to exclusive monthly perks.',
    color: '#1BAF72',
    bg: 'rgba(27,175,114,0.08)',
  },
  {
    num: '02',
    icon: '📅',
    title: 'Book a Service',
    desc: 'Choose from cleaning, handyman, dog walking, groceries, and more. Pick a convenient time slot — our vetted pros show up on schedule.',
    color: '#6366F1',
    bg: 'rgba(99,102,241,0.08)',
  },
  {
    num: '03',
    icon: '🏡',
    title: 'Sit Back & Enjoy',
    desc: 'Your dedicated professional handles everything while you focus on living. Track, review, and re-book anytime from the app.',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.08)',
  },
]

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      style={{
        padding: '6rem 1.5rem',
        background: 'linear-gradient(180deg, #F9FAFB 0%, #fff 100%)',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={labelStyle}>How It Works</div>
          <h2 style={h2Style}>From Sign-Up to Service in Minutes</h2>
          <p style={subStyle}>
            Amenify makes it effortless to book and manage all your home services
            from a single app.
          </p>
        </div>

        {/* Steps */}
        <div style={stepsWrapper}>
          {STEPS.map((step, i) => (
            <>
              <StepCard key={step.num} {...step} />
              {i < STEPS.length - 1 && (
                <div key={`arrow-${i}`} style={arrowStyle}>
                  <svg viewBox="0 0 40 24" width="40" fill="none">
                    <path d="M0 12H38M38 12L28 4M38 12L28 20" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              )}
            </>
          ))}
        </div>

        {/* CTA banner */}
        <div style={ctaBanner}>
          <div>
            <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>
              Ready to simplify your home life?
            </p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginTop: 4 }}>
              Join 15M+ residents already using Amenify.
            </p>
          </div>
          <a
            href="https://amenify.app.link/e/website-search"
            target="_blank"
            rel="noopener noreferrer"
            style={ctaBtn}
            onMouseEnter={(e) => e.currentTarget.style.background = '#fff'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.9)'}
          >
            Get $50 Off — Sign Up Free
          </a>
        </div>
      </div>
    </section>
  )
}

function StepCard({ num, icon, title, desc, color, bg }) {
  return (
    <div style={cardStyle}>
      <div style={{ ...iconWrap, background: bg, border: `1.5px solid ${color}22` }}>
        <span style={{ fontSize: '1.8rem' }}>{icon}</span>
      </div>
      <div style={{ ...numBadge, background: color }}>{num}</div>
      <h3 style={{ ...cardTitle, color: '#0D1117' }}>{title}</h3>
      <p style={cardDesc}>{desc}</p>
    </div>
  )
}

const labelStyle = {
  display: 'inline-block',
  background: '#E8F8F1',
  color: '#1BAF72',
  border: '1px solid rgba(27,175,114,0.25)',
  borderRadius: 999,
  padding: '0.3rem 1rem',
  fontSize: '0.78rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  marginBottom: '1.2rem',
}

const h2Style = {
  fontSize: 'clamp(1.9rem, 3.5vw, 2.7rem)',
  fontWeight: 900,
  color: '#0D1117',
  lineHeight: 1.15,
  letterSpacing: '-0.025em',
  marginBottom: '1rem',
}

const subStyle = {
  fontSize: '1.05rem',
  color: '#6B7280',
  lineHeight: 1.7,
  maxWidth: 520,
  margin: '0 auto',
}

const stepsWrapper = {
  display: 'flex',
  alignItems: 'center',
  gap: '1.5rem',
  marginBottom: '3rem',
  flexWrap: 'wrap',
  justifyContent: 'center',
}

const arrowStyle = {
  flexShrink: 0,
  opacity: 0.6,
  display: 'flex',
  alignItems: 'center',
}

const cardStyle = {
  flex: '1 1 260px',
  maxWidth: 320,
  background: '#fff',
  border: '1.5px solid #E5E7EB',
  borderRadius: 20,
  padding: '2rem 1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.85rem',
  position: 'relative',
  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
  transition: 'transform 0.25s, box-shadow 0.25s',
}

const iconWrap = {
  width: 64,
  height: 64,
  borderRadius: 18,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const numBadge = {
  position: 'absolute',
  top: '1.25rem',
  right: '1.25rem',
  width: 32,
  height: 32,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontSize: '0.75rem',
  fontWeight: 800,
}

const cardTitle = {
  fontSize: '1.1rem',
  fontWeight: 700,
  letterSpacing: '-0.01em',
  marginTop: '0.25rem',
}

const cardDesc = {
  fontSize: '0.9rem',
  color: '#6B7280',
  lineHeight: 1.65,
}

const ctaBanner = {
  background: 'linear-gradient(135deg, #0E3D24 0%, #1BAF72 100%)',
  borderRadius: 20,
  padding: '2rem 2.5rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1.5rem',
  flexWrap: 'wrap',
  boxShadow: '0 12px 40px rgba(27,175,114,0.25)',
}

const ctaBtn = {
  padding: '0.85rem 1.75rem',
  borderRadius: 999,
  background: 'rgba(255,255,255,0.9)',
  color: '#0E3D24',
  fontWeight: 800,
  fontSize: '0.95rem',
  textDecoration: 'none',
  fontFamily: 'Inter, sans-serif',
  transition: 'background 0.2s',
  whiteSpace: 'nowrap',
  flexShrink: 0,
}
