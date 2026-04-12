import { useState, useRef, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// ── Suggested starter questions ──────────────────────────────
const SUGGESTIONS = [
  'What services does Amenify offer?',
  'How do I book a cleaning service?',
  'Is Amenify available in my city?',
  'How much does dog walking cost?',
]

// ── Welcome message from the bot ─────────────────────────────
const WELCOME = {
  id: 'welcome',
  role: 'bot',
  content:
    "Hi there! 👋 I'm **Ami**, your Amenify assistant.\n\nI can help you with:\n- 🧹 Cleaning & home services\n- 📅 Booking & scheduling\n- 💰 Pricing & plans\n- 🏢 Property manager solutions\n- 🔗 Navigation & quick links\n\nWhat can I help you with today?",
  streaming: false,
}

export default function ChatWidget() {
  const [open, setOpen]           = useState(false)
  const [messages, setMessages]   = useState([WELCOME])
  const [input, setInput]         = useState('')
  const [sessionId, setSessionId] = useState(
    () => sessionStorage.getItem('ami_session_id') || null
  )
  const [loading, setLoading]     = useState(false)
  const [unread, setUnread]       = useState(0)

  const bottomRef   = useRef(null)
  const inputRef    = useRef(null)
  const abortRef    = useRef(null)

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [open])

  // Persist sessionId
  useEffect(() => {
    if (sessionId) sessionStorage.setItem('ami_session_id', sessionId)
  }, [sessionId])

  const sendMessage = useCallback(async (text) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    setInput('')
    setLoading(true)

    // Add user message
    const userId = `user-${Date.now()}`
    setMessages((prev) => [...prev, { id: userId, role: 'user', content: trimmed }])

    // Add placeholder bot message (streaming)
    const botId = `bot-${Date.now()}`
    setMessages((prev) => [
      ...prev,
      { id: botId, role: 'bot', content: '', streaming: true },
    ])

    try {
      const controller = new AbortController()
      abortRef.current = controller

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          session_id: sessionId || undefined,
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        throw new Error(`Server error ${res.status}`)
      }

      if (!res.body) {
        throw new Error('No response body — SSE not supported?')
      }

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer    = ''

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''   // keep incomplete line in buffer

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (!raw || raw === '[DONE]') continue

          let evt
          try { evt = JSON.parse(raw) } catch { continue }

          if (evt.token !== undefined) {
            // Append streaming token
            setMessages((prev) =>
              prev.map((m) =>
                m.id === botId
                  ? { ...m, content: m.content + evt.token }
                  : m
              )
            )
          }

          if (evt.done) {
            // Finalise message
            if (evt.session_id) setSessionId(evt.session_id)
            setMessages((prev) =>
              prev.map((m) =>
                m.id === botId
                  ? {
                      ...m,
                      streaming: false,
                      sources: evt.sources ?? [],
                      found_in_kb: evt.found_in_kb,
                    }
                  : m
              )
            )
            if (!open) setUnread((n) => n + 1)
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return

      const errMsg =
        err.message.includes('Failed to fetch') || err.message.includes('NetworkError')
          ? '⚠️ Cannot reach the Amenify backend. Please ensure the server is running on port 8000.'
          : `⚠️ ${err.message}`

      setMessages((prev) =>
        prev.map((m) =>
          m.id === botId
            ? { ...m, content: errMsg, streaming: false }
            : m
        )
      )
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }, [loading, sessionId, open])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const clearChat = () => {
    setMessages([WELCOME])
    setSessionId(null)
    sessionStorage.removeItem('ami_session_id')
  }

  return (
    <>
      {/* ── Floating bubble ──────────────────────────────── */}
      <button
        id="chat-widget-bubble"
        aria-label="Open Amenify AI chat"
        onClick={() => setOpen((o) => !o)}
        style={bubbleStyle(open)}
      >
        {open ? (
          // X icon
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M5 5L17 17M17 5L5 17" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        ) : (
          // Chat icon
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              fill="white" opacity={0.95}/>
            <circle cx="9"  cy="11" r="1.2" fill="#0E3D24"/>
            <circle cx="12" cy="11" r="1.2" fill="#0E3D24"/>
            <circle cx="15" cy="11" r="1.2" fill="#0E3D24"/>
          </svg>
        )}

        {/* Pulse ring */}
        {!open && (
          <span style={pulseRing} />
        )}

        {/* Unread badge */}
        {!open && unread > 0 && (
          <span style={unreadBadge}>{unread}</span>
        )}
      </button>

      {/* ── Chat panel ───────────────────────────────────── */}
      <div
        id="chat-widget-panel"
        role="dialog"
        aria-label="Ami — Amenify AI Assistant"
        style={panelStyle(open)}
      >
        {/* Header */}
        <div style={headerStyle}>
          <div style={headerLeft}>
            <div style={botAvatar}>A</div>
            <div>
              <p style={botName}>Ami</p>
              <p style={botStatus}>
                <span style={onlineDot} />
                Amenify AI · Always on
              </p>
            </div>
          </div>
          <div style={headerActions}>
            <button
              title="Clear conversation"
              onClick={clearChat}
              style={iconBtn}
              aria-label="Clear conversation"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M2 4h11M5 4V2.5A.5.5 0 0 1 5.5 2h4a.5.5 0 0 1 .5.5V4M6 7v5M9 7v5M3 4l.8 8.5A.5.5 0 0 0 4.3 13h6.4a.5.5 0 0 0 .5-.5L12 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </button>
            <button
              onClick={() => setOpen(false)}
              style={iconBtn}
              aria-label="Close chat"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M2 2L13 13M13 2L2 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={messagesArea} role="log" aria-live="polite" aria-label="Conversation">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}

          {/* Typing indicator */}
          {loading && messages[messages.length - 1]?.content === '' && (
            <div style={typingWrap}>
              <div style={typingBubble}>
                {[0,1,2].map((i) => (
                  <span key={i} style={typingDot(i)} />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Suggestions (only on first message) */}
        {messages.length === 1 && (
          <div style={suggestionsRow}>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                style={suggestionChip}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#E8F8F1'
                  e.currentTarget.style.borderColor = 'rgba(27,175,114,0.5)'
                  e.currentTarget.style.color = '#1BAF72'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F9FAFB'
                  e.currentTarget.style.borderColor = '#E5E7EB'
                  e.currentTarget.style.color = '#374151'
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div style={inputBar}>
          <textarea
            ref={inputRef}
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about Amenify…"
            rows={1}
            style={inputStyle}
            disabled={loading}
            aria-label="Chat message input"
          />
          <button
            id="chat-send-btn"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            style={sendBtn(!input.trim() || loading)}
            aria-label="Send message"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14.5 1.5L7 9M14.5 1.5L10 14.5L7 9M14.5 1.5L1.5 5.5L7 9"
                stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Footer */}
        <p style={panelFooter}>
          Powered by Amenify AI · Answers from{' '}
          <a href="https://amenify.com" target="_blank" rel="noopener noreferrer" style={{ color: '#1BAF72', textDecoration: 'none' }}>
            amenify.com
          </a>
        </p>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulseRing {
          0%   { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes typingBlink {
          0%,80%,100% { opacity: 0.2; transform: translateY(0); }
          40%          { opacity: 1;   transform: translateY(-4px); }
        }
        .ami-link { color: #1BAF72 !important; font-weight: 500; }
        .ami-link:hover { text-decoration: underline !important; }
        .ami-md p   { margin: 0 0 0.5rem; }
        .ami-md p:last-child { margin-bottom: 0; }
        .ami-md ul  { padding-left: 1.2em; margin: 0.4rem 0; }
        .ami-md li  { margin-bottom: 0.2rem; }
        .ami-md strong { color: #0D1117; font-weight: 700; }
        .ami-md h2,.ami-md h3 { font-weight: 700; margin: 0.6rem 0 0.3rem; font-size: 0.9rem; }
        .chat-source-tag { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; background: #E8F8F1; color: #1BAF72; border-radius: 999px; font-size: 0.72rem; font-weight: 600; text-decoration: none; border: 1px solid rgba(27,175,114,0.25); transition: background 0.15s; }
        .chat-source-tag:hover { background: #D0F0E3; }
      `}</style>
    </>
  )
}

// ── Message Bubble ────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'

  return (
    <div style={msgRow(isUser)}>
      {!isUser && <div style={amiAvatar}>A</div>}
      <div style={{ maxWidth: '82%' }}>
        <div style={bubble(isUser, msg.streaming)}>
          {isUser ? (
            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>{msg.content}</p>
          ) : (
            <div className="ami-md">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ami-link"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {msg.content || (msg.streaming ? '…' : '')}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Source tags */}
        {!isUser && !msg.streaming && msg.sources && msg.sources.length > 0 && (
          <div style={sourcesRow}>
            <span style={{ fontSize: '0.7rem', color: '#9CA3AF', marginRight: 4 }}>Sources:</span>
            {[...new Set(msg.sources.map((s) => s.url))].slice(0, 3).map((url) => {
              const label = url.replace('https://www.amenify.com', '').replace(/\//g, '') || 'amenify.com'
              return (
                <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="chat-source-tag">
                  🔗 {label || 'home'}
                </a>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────
const bubbleStyle = (open) => ({
  position: 'fixed',
  bottom: 28,
  right: 28,
  width: 58,
  height: 58,
  borderRadius: '50%',
  background: open
    ? '#6B7280'
    : 'linear-gradient(135deg, #1BAF72 0%, #0E8A5F 100%)',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: open
    ? '0 4px 16px rgba(0,0,0,0.2)'
    : '0 8px 32px rgba(27,175,114,0.45)',
  zIndex: 9999,
  transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
  transform: open ? 'scale(0.92)' : 'scale(1)',
})

const pulseRing = {
  position: 'absolute',
  inset: 0,
  borderRadius: '50%',
  border: '2px solid #1BAF72',
  animation: 'pulseRing 2s ease-out infinite',
  pointerEvents: 'none',
}

const unreadBadge = {
  position: 'absolute',
  top: -4,
  right: -4,
  minWidth: 20,
  height: 20,
  background: '#EF4444',
  borderRadius: 999,
  color: '#fff',
  fontSize: '0.7rem',
  fontWeight: 800,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 4px',
  border: '2px solid #fff',
}

const panelStyle = (open) => ({
  position: 'fixed',
  bottom: 98,
  right: 28,
  width: 400,
  maxWidth: 'calc(100vw - 48px)',
  height: 600,
  maxHeight: 'calc(100vh - 120px)',
  background: '#fff',
  borderRadius: 24,
  boxShadow: '0 24px 64px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.08)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  zIndex: 9998,
  border: '1px solid #E5E7EB',
  opacity: open ? 1 : 0,
  pointerEvents: open ? 'all' : 'none',
  transform: open ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.97)',
  transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
  transformOrigin: 'bottom right',
})

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '1rem 1.25rem',
  background: 'linear-gradient(135deg, #0E3D24 0%, #1BAF72 100%)',
  flexShrink: 0,
}

const headerLeft = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
}

const botAvatar = {
  width: 42,
  height: 42,
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.2)',
  border: '2px solid rgba(255,255,255,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontWeight: 900,
  fontSize: '1.15rem',
  flexShrink: 0,
}

const botName = {
  color: '#fff',
  fontWeight: 800,
  fontSize: '1rem',
  lineHeight: 1.2,
  margin: 0,
}

const botStatus = {
  color: 'rgba(255,255,255,0.75)',
  fontSize: '0.75rem',
  fontWeight: 500,
  margin: '2px 0 0',
  display: 'flex',
  alignItems: 'center',
  gap: 5,
}

const onlineDot = {
  display: 'inline-block',
  width: 7,
  height: 7,
  background: '#5EEAB4',
  borderRadius: '50%',
  boxShadow: '0 0 6px rgba(94,234,180,0.7)',
}

const headerActions = {
  display: 'flex',
  gap: '0.5rem',
}

const iconBtn = {
  width: 30,
  height: 30,
  borderRadius: 8,
  border: 'none',
  background: 'rgba(255,255,255,0.15)',
  color: 'rgba(255,255,255,0.8)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 0.2s',
}

const messagesArea = {
  flex: 1,
  overflowY: 'auto',
  padding: '1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  scrollBehavior: 'smooth',
}

const msgRow = (isUser) => ({
  display: 'flex',
  justifyContent: isUser ? 'flex-end' : 'flex-start',
  alignItems: 'flex-end',
  gap: '0.5rem',
})

const amiAvatar = {
  width: 28,
  height: 28,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #1BAF72, #0E8A5F)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontWeight: 800,
  fontSize: '0.8rem',
  flexShrink: 0,
}

const bubble = (isUser, streaming) => ({
  padding: '0.75rem 1rem',
  borderRadius: isUser ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
  background: isUser ? 'linear-gradient(135deg, #1BAF72, #0E8A5F)' : '#F3F4F6',
  color: isUser ? '#fff' : '#0D1117',
  fontSize: '0.875rem',
  lineHeight: 1.65,
  boxShadow: isUser ? '0 2px 8px rgba(27,175,114,0.25)' : '0 1px 3px rgba(0,0,0,0.05)',
  opacity: streaming && !isUser ? 0.85 : 1,
  maxWidth: '100%',
  wordBreak: 'break-word',
})

const sourcesRow = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.4rem',
  marginTop: '0.4rem',
  alignItems: 'center',
}

const typingWrap = {
  display: 'flex',
  alignItems: 'flex-end',
  gap: '0.5rem',
}

const typingBubble = {
  background: '#F3F4F6',
  borderRadius: '4px 18px 18px 18px',
  padding: '0.75rem 1rem',
  display: 'flex',
  gap: 5,
  alignItems: 'center',
}

const typingDot = (i) => ({
  width: 7,
  height: 7,
  borderRadius: '50%',
  background: '#9CA3AF',
  animation: `typingBlink 1.2s ease-in-out ${i * 0.2}s infinite`,
})

const suggestionsRow = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
  padding: '0 1rem 0.75rem',
  flexShrink: 0,
}

const suggestionChip = {
  padding: '0.4rem 0.85rem',
  borderRadius: 999,
  border: '1.5px solid #E5E7EB',
  background: '#F9FAFB',
  color: '#374151',
  fontSize: '0.78rem',
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'Inter, sans-serif',
  transition: 'all 0.2s',
  textAlign: 'left',
}

const inputBar = {
  display: 'flex',
  alignItems: 'flex-end',
  gap: '0.5rem',
  padding: '0.75rem 1rem',
  borderTop: '1px solid #F3F4F6',
  background: '#FAFAFA',
  flexShrink: 0,
}

const inputStyle = {
  flex: 1,
  resize: 'none',
  border: '1.5px solid #E5E7EB',
  borderRadius: 12,
  padding: '0.6rem 0.85rem',
  fontSize: '0.875rem',
  fontFamily: 'Inter, sans-serif',
  color: '#0D1117',
  background: '#fff',
  outline: 'none',
  lineHeight: 1.5,
  maxHeight: 100,
  transition: 'border-color 0.2s',
}

const sendBtn = (disabled) => ({
  width: 38,
  height: 38,
  borderRadius: 10,
  border: 'none',
  background: disabled
    ? '#E5E7EB'
    : 'linear-gradient(135deg, #1BAF72, #0E8A5F)',
  color: '#fff',
  cursor: disabled ? 'not-allowed' : 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  transition: 'all 0.2s',
  boxShadow: disabled ? 'none' : '0 4px 12px rgba(27,175,114,0.3)',
})

const panelFooter = {
  textAlign: 'center',
  fontSize: '0.7rem',
  color: '#9CA3AF',
  padding: '0.4rem 1rem 0.6rem',
  background: '#FAFAFA',
  borderTop: '1px solid #F3F4F6',
  flexShrink: 0,
}
