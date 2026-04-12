const SERVICES = [
  {
    icon: '🧹',
    emoji_bg: 'rgba(27,175,114,0.12)',
    title: 'Cleaning Services',
    desc: 'Professional apartment and house cleaning — weekly, bi-weekly, deep clean, or move-out. Trained, background-checked cleaners.',
    href: 'https://www.amenify.com/cleaningservices1',
    tag: 'Most Popular',
    tagColor: '#1BAF72',
  },
  {
    icon: '🔧',
    emoji_bg: 'rgba(59,130,246,0.1)',
    title: 'Handyman Services',
    desc: 'Minor repairs, TV mounting, furniture assembly, leaky faucets and more — on-demand, same-day availability.',
    href: 'https://www.amenify.com/handymanservices1',
    tag: null,
  },
  {
    icon: '🐕',
    emoji_bg: 'rgba(245,158,11,0.1)',
    title: 'Dog Walking',
    desc: 'GPS-tracked walks by vetted dog walkers. Flexible scheduling — daily, weekly, or one-time.',
    href: 'https://www.amenify.com/dog-walking-services',
    tag: null,
  },
  {
    icon: '🛒',
    emoji_bg: 'rgba(139,92,246,0.1)',
    title: 'Grocery Delivery',
    desc: 'Fresh groceries delivered to your door. No more weekend store runs — schedule ahead or order same-day.',
    href: 'https://www.amenify.com/groceryservices1',
    tag: null,
  },
  {
    icon: '🍕',
    emoji_bg: 'rgba(239,68,68,0.1)',
    title: 'Food Delivery',
    desc: 'Restaurant-quality meals delivered fast. Amenify Cash accepted at 375,000+ locations nationwide.',
    href: 'https://www.amenify.com/groceryservices1',
    tag: 'New: Grubhub',
    tagColor: '#EF4444',
  },
  {
    icon: '🌿',
    emoji_bg: 'rgba(16,185,129,0.1)',
    title: 'Chores Services',
    desc: 'Laundry, dishes, organizing, running errands — dedicated chores teams available 7 days a week.',
    href: 'https://www.amenify.com/choreservices1',
    tag: null,
  },
]

export default function Services() {
  return (
    <section id="services" style={{ padding: '6rem 1.5rem', background: '#fff' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={labelStyle}>✦ Our Services</div>
          <h2 style={h2Style}>
            Everything Your Home Needs,<br />In One Platform
          </h2>
          <p style={subStyle}>
            From spotless apartments to on-demand groceries — Amenify's managed service teams
            handle it all so you can focus on living.
          </p>
        </div>

        {/* Grid */}
        <div style={gridStyle}>
          {SERVICES.map((s) => (
            <ServiceCard key={s.title} {...s} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ServiceCard({ icon, emoji_bg, title, desc, href, tag, tagColor }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={cardStyle(hovered)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {tag && (
        <div style={{ ...tagStyle, background: tagColor + '18', color: tagColor, border: `1px solid ${tagColor}30` }}>
          {tag}
        </div>
      )}
      <div style={{ ...iconWrap, background: emoji_bg }}>{icon}</div>
      <h3 style={cardTitle}>{title}</h3>
      <p style={cardDesc}>{desc}</p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={learnMore(hovered)}
      >
        Learn More
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transition: 'transform 0.2s', transform: hovered ? 'translateX(3px)' : '' }}>
          <path d="M3 7H11M11 7L8 4M11 7L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </a>
    </div>
  )
}

// Styles
import { useState } from 'react'

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
  fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)',
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
  maxWidth: 560,
  margin: '0 auto',
}

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: '1.5rem',
}

const cardStyle = (hovered) => ({
  background: '#fff',
  border: `1.5px solid ${hovered ? 'rgba(27,175,114,0.4)' : '#E5E7EB'}`,
  borderRadius: 20,
  padding: '2rem 1.75rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
  transform: hovered ? 'translateY(-4px)' : 'none',
  boxShadow: hovered
    ? '0 20px 48px rgba(0,0,0,0.1), 0 4px 12px rgba(27,175,114,0.12)'
    : '0 1px 4px rgba(0,0,0,0.05)',
  cursor: 'default',
})

const tagStyle = {
  position: 'absolute',
  top: '1.25rem',
  right: '1.25rem',
  padding: '0.25rem 0.7rem',
  borderRadius: 999,
  fontSize: '0.72rem',
  fontWeight: 700,
  letterSpacing: '0.05em',
}

const iconWrap = {
  width: 52,
  height: 52,
  borderRadius: 14,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.5rem',
  marginBottom: '0.25rem',
  flexShrink: 0,
}

const cardTitle = {
  fontSize: '1.1rem',
  fontWeight: 700,
  color: '#0D1117',
  letterSpacing: '-0.01em',
}

const cardDesc = {
  fontSize: '0.9rem',
  color: '#6B7280',
  lineHeight: 1.65,
  flex: 1,
}

const learnMore = (hovered) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  color: '#1BAF72',
  fontSize: '0.875rem',
  fontWeight: 600,
  textDecoration: 'none',
  marginTop: 'auto',
  paddingTop: '0.5rem',
})
