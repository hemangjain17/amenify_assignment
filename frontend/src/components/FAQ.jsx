import { useState } from 'react'

const FAQS = [
  {
    q: 'What services does Amenify provide?',
    a: 'Amenify offers home cleaning services, handyman services, chores services, food delivery, grocery delivery, dog walking, car washing, and more. Whether you need cleaning, small repairs, errands, or groceries delivered, Amenify streamlines all your household needs in one platform.',
  },
  {
    q: 'How do I find out if Amenify offers services near me?',
    a: 'Amenify is live in all cities across the US. The Amenify Resident App allows you to easily schedule any of our services, including house cleaning, apartment cleaning, and chores services, directly from your phone.',
  },
  {
    q: 'Are your Service Pros trained and background-checked?',
    a: 'Absolutely. We carefully vet all residential cleaners and regularly monitor the performance of all our Pros, including Handyman specialists. Our training process emphasizes cleaning expertise, reliability, and professionalism — giving you peace of mind with every visit.',
  },
  {
    q: 'Can Amenify handle urgent handyman tasks?',
    a: 'Yes. Alongside scheduled cleaning, we offer handyman services for minor repairs and maintenance. This includes fixing leaks, mounting TVs, patching walls, and other small projects that can be difficult to tackle on your own.',
  },
  {
    q: 'Do you offer food delivery and grocery delivery?',
    a: 'We do! Amenify partners with trusted providers to fulfill food delivery and grocery delivery requests. You can schedule deliveries through our easy platform, eliminating the hassle of traffic, long lines, or last-minute store runs.',
  },
  {
    q: 'Does Amenify offer move-out cleaning?',
    a: 'Absolutely. Our move-out cleaning services are perfect for renters looking to secure their deposits or homeowners preparing to sell. Our cleaning teams address everything from deep-cleaning appliances to dusting baseboards.',
  },
  {
    q: 'Is there a difference between house and apartment cleaning?',
    a: 'Yes. House cleaning is tailored to larger spaces with tasks like cleaning multiple bathrooms, spacious kitchens, and extended living areas. Our apartment cleaning focuses on efficiently cleaning smaller spaces without compromising quality. Either way, our teams follow a thorough checklist customized to your needs.',
  },
  {
    q: 'Why should I choose Amenify over other home cleaning companies?',
    a: 'Amenify has exclusive partnerships with your community and offers signup and monthly credits. We integrate multiple lifestyle services — chores, food delivery, handyman — into one user-friendly platform. Advanced technology, flexible scheduling, and top-notch support make us the go-to solution for all your household needs.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState(null)

  const toggle = (i) => setOpen(open === i ? null : i)

  return (
    <section
      id="faq"
      style={{ padding: '6rem 1.5rem', background: '#F9FAFB' }}
    >
      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={labelStyle}>FAQ</div>
          <h2 style={h2Style}>Common Questions Answered</h2>
          <p style={subStyle}>
            Everything you need to know about Amenify services.
            Can't find the answer? Ask our AI chatbot below! 💬
          </p>
        </div>

        {/* Accordion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {FAQS.map((item, i) => (
            <FAQItem
              key={i}
              item={item}
              index={i}
              isOpen={open === i}
              onToggle={() => toggle(i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function FAQItem({ item, index, isOpen, onToggle }) {
  return (
    <div style={itemStyle(isOpen)}>
      <button
        id={`faq-btn-${index}`}
        aria-expanded={isOpen}
        aria-controls={`faq-panel-${index}`}
        onClick={onToggle}
        style={btnStyle(isOpen)}
      >
        <span style={qText}>{item.q}</span>
        <div style={chevronWrap(isOpen)}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M5 7L9 11L13 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
      </button>
      <div
        id={`faq-panel-${index}`}
        role="region"
        aria-labelledby={`faq-btn-${index}`}
        style={panelStyle(isOpen)}
      >
        <p style={answerText}>{item.a}</p>
      </div>
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
}

const itemStyle = (isOpen) => ({
  background: '#fff',
  border: `1.5px solid ${isOpen ? 'rgba(27,175,114,0.4)' : '#E5E7EB'}`,
  borderRadius: 14,
  overflow: 'hidden',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxShadow: isOpen ? '0 4px 20px rgba(27,175,114,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
})

const btnStyle = (isOpen) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
  padding: '1.25rem 1.5rem',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'Inter, sans-serif',
  textAlign: 'left',
})

const qText = {
  fontSize: '0.975rem',
  fontWeight: 600,
  color: '#0D1117',
  lineHeight: 1.5,
}

const chevronWrap = (isOpen) => ({
  color: isOpen ? '#1BAF72' : '#9CA3AF',
  transition: 'transform 0.3s, color 0.2s',
  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
  flexShrink: 0,
})

const panelStyle = (isOpen) => ({
  maxHeight: isOpen ? 500 : 0,
  overflow: 'hidden',
  transition: 'max-height 0.35s cubic-bezier(0.4,0,0.2,1)',
})

const answerText = {
  padding: '0 1.5rem 1.5rem',
  fontSize: '0.9rem',
  color: '#6B7280',
  lineHeight: 1.75,
  borderTop: '1px solid #F3F4F6',
  paddingTop: '1rem',
  marginTop: 0,
}
