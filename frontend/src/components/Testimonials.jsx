import { useState } from 'react'

const TESTIMONIALS = [
  {
    quote:
      'Amenify offers a seamless platform specifically designed to help real estate developers, operators, and property managers optimize the performance of their properties.',
    name: 'Andrew Stewart',
    role: 'Chairman, Venterra Realty',
    company: 'Venterra Realty — 23,000 homes',
    initials: 'AS',
    color: '#1BAF72',
  },
  {
    quote:
      'Zego implements Amenify into Zego Living—a new, all-in-one resident commerce platform for millions of Residents. Amenify Cash can now be applied at 375,000+ locations.',
    name: 'Zego Partnership',
    role: 'Resident Commerce Platform',
    company: 'Zego × Amenify',
    initials: 'ZG',
    color: '#6366F1',
  },
  {
    quote:
      'Amenify and Visa collaborated to launch Intelligent Resident Commerce — bringing AI-driven payments and rewards to Amenify\u2019s 15M+ connected homes.',
    name: 'Visa Collaboration',
    role: 'Intelligent Resident Commerce',
    company: 'Visa × Amenify',
    initials: 'VI',
    color: '#F59E0B',
  },
]

export default function Testimonials() {
  const [active, setActive] = useState(0)

  return (
    <section
      id="testimonials"
      style={{
        padding: '6rem 1.5rem',
        background: 'linear-gradient(135deg, #061A10 0%, #0D2B1B 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative glow */}
      <div style={{
        position: 'absolute',
        width: 500,
        height: 500,
        background: '#1BAF72',
        borderRadius: '50%',
        filter: 'blur(100px)',
        opacity: 0.06,
        top: '-20%',
        right: '-10%',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={labelStyle}>Trusted By Leaders</div>
          <h2 style={h2Style}>What Partners Say</h2>
        </div>

        {/* Active testimonial */}
        <div style={cardStyle}>
          <div style={quoteIcon}>"</div>
          <p style={quoteText}>{TESTIMONIALS[active].quote}</p>
          <div style={authorRow}>
            <div style={{ ...avatar, background: TESTIMONIALS[active].color }}>
              {TESTIMONIALS[active].initials}
            </div>
            <div>
              <p style={authorName}>{TESTIMONIALS[active].name}</p>
              <p style={authorRole}>{TESTIMONIALS[active].role}</p>
              <p style={authorCompany}>{TESTIMONIALS[active].company}</p>
            </div>
          </div>
        </div>

        {/* Dots navigation */}
        <div style={dotsRow}>
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                ...dot,
                width: i === active ? 28 : 10,
                background: i === active ? '#1BAF72' : 'rgba(255,255,255,0.25)',
              }}
              aria-label={`Testimonial ${i + 1}`}
            />
          ))}
        </div>

        {/* News ticker */}
        <div style={newsRow}>
          <a
            href="https://www.amenify.com/news-articles"
            target="_blank"
            rel="noopener noreferrer"
            style={newsLink}
          >
            📰 Latest News — Amenify raises oversubscribed financing for next-gen home services →
          </a>
        </div>
      </div>
    </section>
  )
}

const labelStyle = {
  display: 'inline-block',
  background: 'rgba(27,175,114,0.15)',
  color: '#5EEAB4',
  border: '1px solid rgba(27,175,114,0.3)',
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
  color: '#fff',
  lineHeight: 1.15,
  letterSpacing: '-0.025em',
}

const cardStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 24,
  padding: '3rem',
  backdropFilter: 'blur(12px)',
  position: 'relative',
  marginBottom: '2rem',
}

const quoteIcon = {
  position: 'absolute',
  top: '1.5rem',
  left: '2.5rem',
  fontSize: '5rem',
  color: '#1BAF72',
  opacity: 0.3,
  lineHeight: 1,
  fontFamily: 'Georgia, serif',
  fontWeight: 900,
}

const quoteText = {
  fontSize: 'clamp(1rem, 2vw, 1.2rem)',
  color: 'rgba(255,255,255,0.85)',
  lineHeight: 1.8,
  fontStyle: 'italic',
  marginBottom: '2rem',
  paddingTop: '1rem',
}

const authorRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
}

const avatar = {
  width: 52,
  height: 52,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontWeight: 800,
  fontSize: '1rem',
  flexShrink: 0,
}

const authorName = {
  fontWeight: 700,
  color: '#fff',
  fontSize: '0.95rem',
}

const authorRole = {
  color: '#1BAF72',
  fontSize: '0.82rem',
  fontWeight: 500,
  marginTop: 2,
}

const authorCompany = {
  color: 'rgba(255,255,255,0.4)',
  fontSize: '0.78rem',
  marginTop: 2,
}

const dotsRow = {
  display: 'flex',
  justifyContent: 'center',
  gap: '0.5rem',
  marginBottom: '2.5rem',
}

const dot = {
  height: 10,
  borderRadius: 999,
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.3s',
  padding: 0,
}

const newsRow = {
  textAlign: 'center',
}

const newsLink = {
  color: 'rgba(255,255,255,0.45)',
  fontSize: '0.82rem',
  textDecoration: 'none',
  transition: 'color 0.2s',
  fontWeight: 500,
}
