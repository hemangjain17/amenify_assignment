const FEATURES = [
  {
    icon: '👷',
    title: 'Your Property\'s Vetted Professionals',
    desc: 'We vet, hire, and train dedicated service teams for your communities. Pros are assigned specific time windows based on data-driven resident feedback.',
  },
  {
    icon: '📣',
    title: 'Automated Resident Marketing',
    desc: 'We create all marketing assets, leverage major PMS integrations, and handle resident onboarding. Credit packages are also available.',
  },
  {
    icon: '📲',
    title: 'Real-Time Booking Engine',
    desc: 'Residents and managers can order, manage, and edit bookings safely and securely with assisted key releases and instant notifications.',
  },
  {
    icon: '🕐',
    title: '7-Day a Week Support',
    desc: 'Our Pros are trained for 5-star service and our concierge team is available 7 days a week. We centralize and analyze data for constant improvement.',
  },
  {
    icon: '💵',
    title: 'Amenify Cash to Drive Adoption',
    desc: 'Flexible credit packages available for all budgets. We understand that some owners have a low operating budget — more options available for enterprise customers.',
  },
]

export default function ForManagers() {
  return (
    <section
      id="for-managers"
      style={{
        padding: '6rem 1.5rem',
        background: 'linear-gradient(180deg, #fff 0%, #F9FAFB 100%)',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={grid}>
          {/* Left: content */}
          <div style={leftCol}>
            <div style={labelStyle}>For Property Managers</div>
            <h2 style={h2Style}>
              Drive Resident Satisfaction at Scale
            </h2>
            <p style={subStyle}>
              Amenify is trusted by the nation's largest multifamily operators.
              A complete amenity solution that boosts retention, generates revenue,
              and earns 5-star reviews — with zero operational overhead for your team.
            </p>

            <div style={quoteBox}>
              <p style={quoteText}>
                "Undoubtedly enhances our Resident Experience"
              </p>
              <p style={quoteAuthor}>
                — Andrew Stewart, Chairman · Venterra Realty (23,000 homes)
              </p>
            </div>

            <div style={ctaRow}>
              <a
                href="https://www.amenify.com/property-managers-2"
                target="_blank"
                rel="noopener noreferrer"
                style={primaryBtn}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 12px 36px rgba(27,175,114,0.45)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = ''
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(27,175,114,0.3)'
                }}
              >
                Partner With Amenify
              </a>
              <a
                href="https://www.amenify.com/re-sales-lead-capture-form"
                target="_blank"
                rel="noopener noreferrer"
                style={ghostBtn}
              >
                Request a Demo →
              </a>
            </div>
          </div>

          {/* Right: feature list */}
          <div style={rightCol}>
            {FEATURES.map((f) => (
              <FeatureRow key={f.title} {...f} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureRow({ icon, title, desc }) {
  return (
    <div style={rowStyle}>
      <div style={iconWrap}>{icon}</div>
      <div>
        <h3 style={rowTitle}>{title}</h3>
        <p style={rowDesc}>{desc}</p>
      </div>
    </div>
  )
}

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '5rem',
  alignItems: 'center',
}

const leftCol = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
}

const rightCol = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
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
}

const h2Style = {
  fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
  fontWeight: 900,
  color: '#0D1117',
  lineHeight: 1.15,
  letterSpacing: '-0.025em',
}

const subStyle = {
  fontSize: '1rem',
  color: '#6B7280',
  lineHeight: 1.75,
}

const quoteBox = {
  background: 'linear-gradient(135deg, #F0FBF6 0%, #E0F5EA 100%)',
  border: '1px solid rgba(27,175,114,0.2)',
  borderRadius: 16,
  padding: '1.25rem 1.5rem',
  borderLeft: '4px solid #1BAF72',
}

const quoteText = {
  fontSize: '1rem',
  fontWeight: 600,
  color: '#0D1117',
  fontStyle: 'italic',
  marginBottom: '0.4rem',
}

const quoteAuthor = {
  fontSize: '0.82rem',
  color: '#6B7280',
  fontWeight: 500,
}

const ctaRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  flexWrap: 'wrap',
  marginTop: '0.5rem',
}

const primaryBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0.8rem 1.6rem',
  borderRadius: 999,
  background: '#1BAF72',
  color: '#fff',
  fontWeight: 700,
  fontSize: '0.9rem',
  textDecoration: 'none',
  boxShadow: '0 6px 24px rgba(27,175,114,0.3)',
  transition: 'all 0.22s',
  fontFamily: 'Inter, sans-serif',
}

const ghostBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  fontSize: '0.9rem',
  fontWeight: 600,
  color: '#1BAF72',
  textDecoration: 'none',
}

const rowStyle = {
  display: 'flex',
  gap: '1rem',
  alignItems: 'flex-start',
  padding: '1.25rem',
  background: '#fff',
  border: '1.5px solid #E5E7EB',
  borderRadius: 16,
  transition: 'all 0.22s',
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
}

const iconWrap = {
  width: 44,
  height: 44,
  background: '#E8F8F1',
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.25rem',
  flexShrink: 0,
}

const rowTitle = {
  fontSize: '0.95rem',
  fontWeight: 700,
  color: '#0D1117',
  marginBottom: '0.3rem',
}

const rowDesc = {
  fontSize: '0.85rem',
  color: '#6B7280',
  lineHeight: 1.6,
}
