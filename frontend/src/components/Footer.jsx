const FOOTER_LINKS = {
  Services: [
    { label: 'Cleaning Services',       href: 'https://www.amenify.com/cleaningservices1' },
    { label: 'Chores Services',          href: 'https://www.amenify.com/choreservices1' },
    { label: 'Handyman Services',        href: 'https://www.amenify.com/handymanservices1' },
    { label: 'Dog Walking',              href: 'https://www.amenify.com/dog-walking-services' },
    { label: 'Food & Grocery',           href: 'https://www.amenify.com/groceryservices1' },
    { label: 'Move-Out Cleaning',        href: 'https://www.amenify.com/movingoutservices1' },
    { label: 'Protection Plan',          href: 'https://www.amenify.com/resident-protection-plan' },
  ],
  Company: [
    { label: 'About Us',         href: 'https://www.amenify.com/about-us' },
    { label: 'Amenify News',     href: 'https://www.amenify.com/news-articles' },
    { label: 'Blog',             href: 'https://www.amenify.com/blog' },
    { label: 'Careers',          href: 'https://www.amenify.com/careers' },
    { label: 'Technology',       href: 'https://www.amenify.com/amenify-technology' },
  ],
  'For Managers': [
    { label: 'Property Managers',     href: 'https://www.amenify.com/property-managers-2' },
    { label: 'Resident Gifts',        href: 'https://www.amenify.com/autogifts' },
    { label: 'Leasing Concession',    href: 'https://www.amenify.com/leasing-concession' },
    { label: 'Commercial Cleaning',   href: 'https://www.amenify.com/commercialcleaning1' },
    { label: 'API Partners',          href: 'https://www.amenify.com/amenify-platform' },
  ],
  'Quick Links': [
    { label: 'Resident Log In',     href: 'https://m.amenify.com/sign-in/' },
    { label: 'Service Pro Log In',  href: 'https://field-tech.amenify.com' },
    { label: 'Provider Log In',     href: 'https://provider.amenify.com' },
    { label: 'Contact Us',          href: 'https://www.amenify.com/contact-us' },
    { label: 'FAQs',                href: 'https://amenifyconcierge.zendesk.com/hc/en-us' },
    { label: 'Terms & Privacy',     href: 'https://www.amenify.com/terms-and-privacy' },
  ],
}

export default function Footer() {
  return (
    <footer style={footerStyle}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Top: brand + links grid */}
        <div style={topRow}>
          {/* Brand */}
          <div style={brandCol}>
            <a href="#home" style={logoLink}>
              <div style={logoIcon}>A</div>
              <span style={logoText}>amenify</span>
            </a>
            <p style={brandDesc}>
              Amenify is the leading AI-powered resident commerce platform, available in{' '}
              <strong>15 million homes</strong> across the USA. Professional lifestyle services — cleaning,
              handyman, dog walking, grocery delivery, and more.
            </p>
            <p style={contactLine}>
              <a href="https://www.amenify.com/contact-us" style={contactLink} target="_blank" rel="noopener noreferrer">
                Contact us →
              </a>
            </p>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group} style={linkGroup}>
              <h4 style={groupTitle}>{group}</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={footerLink}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#1BAF72'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={divider} />

        {/* Bottom: copyright */}
        <div style={bottomRow}>
          <p style={copyright}>
            © 2026 Amenify Corporation. All Rights Reserved.
          </p>
          <div style={bottomLinks}>
            <a href="https://www.amenify.com/mission-and-values" target="_blank" rel="noopener noreferrer" style={bottomLink}>Mission & Values</a>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
            <a href="https://www.amenify.com/terms-and-privacy" target="_blank" rel="noopener noreferrer" style={bottomLink}>Terms & Privacy</a>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
            <a href="https://amenifyconcierge.zendesk.com/hc/en-us" target="_blank" rel="noopener noreferrer" style={bottomLink}>FAQs</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

const footerStyle = {
  background: 'linear-gradient(180deg, #061A10 0%, #040E0A 100%)',
  padding: '5rem 0 2rem',
  borderTop: '1px solid rgba(27,175,114,0.1)',
}

const topRow = {
  display: 'grid',
  gridTemplateColumns: '280px repeat(4, 1fr)',
  gap: '3rem',
  marginBottom: '3rem',
  flexWrap: 'wrap',
}

const brandCol = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
}

const logoLink = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.6rem',
  textDecoration: 'none',
}

const logoIcon = {
  width: 34,
  height: 34,
  background: 'linear-gradient(135deg, #1BAF72, #0E8A5F)',
  borderRadius: 9,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontWeight: 900,
  fontSize: '1rem',
  boxShadow: '0 4px 12px rgba(27,175,114,0.3)',
  flexShrink: 0,
}

const logoText = {
  fontSize: '1.25rem',
  fontWeight: 800,
  color: '#fff',
  letterSpacing: '-0.03em',
}

const brandDesc = {
  fontSize: '0.85rem',
  color: 'rgba(255,255,255,0.4)',
  lineHeight: 1.75,
}

const contactLine = { marginTop: '0.25rem' }

const contactLink = {
  fontSize: '0.85rem',
  color: '#1BAF72',
  textDecoration: 'none',
  fontWeight: 600,
}

const linkGroup = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
}

const groupTitle = {
  fontSize: '0.8rem',
  fontWeight: 700,
  color: '#fff',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
}

const footerLink = {
  fontSize: '0.85rem',
  color: 'rgba(255,255,255,0.45)',
  textDecoration: 'none',
  transition: 'color 0.2s',
  fontWeight: 400,
}

const divider = {
  height: 1,
  background: 'rgba(255,255,255,0.07)',
  marginBottom: '1.75rem',
}

const bottomRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '1rem',
}

const copyright = {
  fontSize: '0.8rem',
  color: 'rgba(255,255,255,0.25)',
}

const bottomLinks = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
}

const bottomLink = {
  fontSize: '0.8rem',
  color: 'rgba(255,255,255,0.25)',
  textDecoration: 'none',
  transition: 'color 0.2s',
}
