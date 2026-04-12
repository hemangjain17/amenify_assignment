import { useState, useEffect } from 'react'

const NAV_LINKS = [
  {
    label: 'Residents',
    href: 'https://www.amenify.com/resident-services',
    sub: [
      { label: 'Cleaning Services',  href: 'https://www.amenify.com/cleaningservices1' },
      { label: 'Handyman',           href: 'https://www.amenify.com/handymanservices1' },
      { label: 'Dog Walking',        href: 'https://www.amenify.com/dog-walking-services' },
      { label: 'Food & Grocery',     href: 'https://www.amenify.com/groceryservices1' },
      { label: 'Chores Services',    href: 'https://www.amenify.com/choreservices1' },
    ],
  },
  {
    label: 'Managers',
    href: 'https://www.amenify.com/property-managers-2',
    sub: [
      { label: 'Property Managers',    href: 'https://www.amenify.com/property-managers-2' },
      { label: 'Resident Gifts',       href: 'https://www.amenify.com/autogifts' },
      { label: 'Leasing Concession',   href: 'https://www.amenify.com/leasing-concession' },
      { label: 'Commercial Cleaning',  href: 'https://www.amenify.com/commercialcleaning1' },
    ],
  },
  {
    label: 'Partners',
    href: 'https://www.amenify.com/amenify-platform',
    sub: [
      { label: 'API Partners',      href: 'https://www.amenify.com/amenify-platform' },
      { label: 'Merchants',         href: 'https://www.amenify.com/merchant-landing' },
      { label: 'Service Pros',      href: 'https://www.amenify.com/providers-1' },
      { label: 'Technology',        href: 'https://www.amenify.com/amenify-technology' },
    ],
  },
  {
    label: 'Company',
    href: 'https://www.amenify.com/about-us',
    sub: [
      { label: 'About Us',   href: 'https://www.amenify.com/about-us' },
      { label: 'News',       href: 'https://www.amenify.com/news-articles' },
      { label: 'Blog',       href: 'https://www.amenify.com/blog' },
      { label: 'Careers',    href: 'https://www.amenify.com/careers' },
    ],
  },
]

const styles = {
  nav: (scrolled) => ({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: scrolled ? 'rgba(255,255,255,0.96)' : 'transparent',
    backdropFilter: scrolled ? 'blur(12px)' : 'none',
    borderBottom: scrolled ? '1px solid #E5E7EB' : '1px solid transparent',
    transition: 'all 0.3s ease',
    boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.06)' : 'none',
  }),
  inner: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 1.5rem',
    height: 68,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '2rem',
  },
  logo: (scrolled) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
  }),
  logoIcon: {
    width: 36,
    height: 36,
    background: 'linear-gradient(135deg, #1BAF72 0%, #0E8A5F 100%)',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 900,
    fontSize: '1.1rem',
    fontFamily: 'Inter, sans-serif',
    boxShadow: '0 4px 12px rgba(27,175,114,0.35)',
    flexShrink: 0,
  },
  logoText: (scrolled) => ({
    fontSize: '1.35rem',
    fontWeight: 800,
    color: scrolled ? '#0D1117' : '#fff',
    letterSpacing: '-0.03em',
    lineHeight: 1,
  }),
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    flex: 1,
    justifyContent: 'center',
  },
  linkItem: {
    position: 'relative',
  },
  linkBtn: (scrolled) => ({
    padding: '0.45rem 0.85rem',
    borderRadius: 8,
    fontSize: '0.9rem',
    fontWeight: 500,
    color: scrolled ? '#374151' : 'rgba(255,255,255,0.9)',
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
    fontFamily: 'Inter, sans-serif',
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    transition: 'all 0.2s',
  }),
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: '50%',
    transform: 'translateX(-50%)',
    minWidth: 200,
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 16px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)',
    border: '1px solid #E5E7EB',
    padding: '0.5rem',
    zIndex: 999,
  },
  dropItem: {
    display: 'block',
    padding: '0.55rem 0.85rem',
    borderRadius: 8,
    fontSize: '0.875rem',
    color: '#374151',
    transition: 'all 0.15s',
    fontWeight: 500,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  signIn: (scrolled) => ({
    padding: '0.5rem 1.1rem',
    borderRadius: 999,
    fontSize: '0.875rem',
    fontWeight: 600,
    color: scrolled ? '#374151' : 'rgba(255,255,255,0.85)',
    border: scrolled ? '1.5px solid #E5E7EB' : '1.5px solid rgba(255,255,255,0.35)',
    background: 'transparent',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    transition: 'all 0.2s',
  }),
  ctaBtn: {
    padding: '0.5rem 1.2rem',
    borderRadius: 999,
    fontSize: '0.875rem',
    fontWeight: 700,
    color: '#fff',
    background: 'linear-gradient(135deg, #1BAF72 0%, #0E8A5F 100%)',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    boxShadow: '0 4px 14px rgba(27,175,114,0.4)',
    transition: 'all 0.2s',
  },
}

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav style={styles.nav(scrolled)} role="navigation" aria-label="Main navigation">
      <div style={styles.inner}>
        {/* Logo */}
        <a href="#home" style={styles.logo(scrolled)} aria-label="Amenify home">
          <div style={styles.logoIcon}>A</div>
          <span style={styles.logoText(scrolled)}>amenify</span>
        </a>

        {/* Nav links */}
        <div style={styles.links}>
          {NAV_LINKS.map((link) => (
            <div
              key={link.label}
              style={styles.linkItem}
              onMouseEnter={() => setActiveDropdown(link.label)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button style={styles.linkBtn(scrolled)}>
                {link.label}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>

              {activeDropdown === link.label && (
                <div style={styles.dropdown}>
                  {link.sub.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.dropItem}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#F0FBF6'
                        e.currentTarget.style.color = '#1BAF72'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = '#374151'
                      }}
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA actions */}
        <div style={styles.actions}>
          <a
            href="https://www.amenify.com/sign-in-sign-up"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <button style={styles.signIn(scrolled)}>Sign In</button>
          </a>
          <a
            href="https://amenify.app.link/e/website-search"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <button style={styles.ctaBtn}>Get Started</button>
          </a>
        </div>
      </div>
    </nav>
  )
}
