import Footer from './Footer'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import FeedbackSection from '../components/FeedbackSection'
import UserFeedback from "../components/UserFeedback"

const FONT_LINK = document.createElement('link')
FONT_LINK.rel = 'stylesheet'
FONT_LINK.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Nunito:wght@400;500;600;700;800&display=swap'
if (!document.head.querySelector('[href*="Playfair"]')) document.head.appendChild(FONT_LINK)

const FEATURE_META = [
  { to: '/chat',      icon: '🤖', tag: 'AI', img: '/images/chat.png' },
  { to: '/disease',   icon: '🔬', tag: 'AI', img: '/images/disease.jpg' },
  { to: '/weather',   icon: '⛅', tag: 'Weather', img: '/images/weather.jpg' },
  { to: '/fertilizer',icon: '🧪', tag: 'Crop', img: '/images/fertilizer.jpg' },
  { to: '/mandi',     icon: '💰', tag: 'Market', img: '/images/mandi.jpg' },
  { to: '/soil',      icon: '🌱', tag: 'Soil', img: '/images/soil.jpg' },
  { to: '/calendar',  icon: '📅', tag: 'Planning', img: '/images/calender.png' },
  { to: '/history',   icon: '💬', tag: 'History', img: '/images/history.png' },
  { to: '/expense',   icon: '📊', tag: 'Finance', img: '/images/expense.png' },
  { to: '/community', icon: '🌾', tag: 'Social', img: '/images/community.jpg' },
  { to: '/crop',      icon: '🌾', tag: 'Crop', img: '/images/crops.jpg' },
  { to: '/yield',     icon: '📈', tag: 'Analytics', img: '/images/yield.jpg' },
  { to: '/spray',     icon: '🧪', tag: 'Calculator', img: '/images/sray.jpg' },
  { to: '/diary',     icon: '📔', tag: 'Journal', img: '/images/diary.png' },
  { to: '/about', icon: '📖', tag: 'Project',img:'/images/about.webp',  },
]

const STATS_META = [
  { value: 'Free', icon: '🎁' },
  { value: '14+',   icon: '✨' },
  { value: 'AI',   icon: '🤖' },
  { value: '24/7', icon: '🕐' },
]

const STEP_ICONS = ['📝', '📷', '🤖', '✅']

function useInView(threshold = 0.12) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

function Reveal({ children, delay = 0 }) {
  const [ref, visible] = useInView()
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(32px)',
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
    }}>
      {children}
    </div>
  )
}

function Navbar() {
  const [scrolled, setScrolled]       = useState(false)
  const [menuOpen, setMenuOpen]       = useState(false)
  const [isMobile, setIsMobile]       = useState(window.innerWidth < 768)
  const { isLoggedIn, user, logout }  = useAuth()
  const navigate                      = useNavigate()
  const { t }                         = useTranslation()

  const NAV_LINKS = [
    { to: '/',         label: t('home.nav.home')     },
    { to: '/weather',  label: t('home.nav.weather')  },
    { to: '/mandi',    label: t('home.nav.mandi')    },
    { to: '/chat',     label: t('home.nav.chat')     },
    { to: '/settings', label: t('home.nav.settings') },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('scroll', onScroll)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999,
        background: scrolled || menuOpen ? 'rgba(5,15,7,0.98)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none',
        transition: 'all 0.35s ease',
        padding: isMobile ? '0 16px' : '0 32px',
        height: 70,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg,#2d8a45,#4caf65)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, boxShadow: '0 8px 24px rgba(45,138,69,0.35)',
          }}>🌾</div>
          <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: 22, color: 'white' }}>
            Kisan<span style={{ color: '#c9a84c' }}>AI</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: 4 }}>
            {NAV_LINKS.map(n => (
              <Link key={n.to} to={n.to} style={{
                color: 'rgba(255,255,255,0.7)', textDecoration: 'none',
                padding: '8px 14px', borderRadius: 24,
                fontSize: 14, fontWeight: 700, fontFamily: "'Nunito',sans-serif",
                transition: 'all 0.25s ease',
              }}
                onMouseEnter={e => { e.target.style.background = 'rgba(201,168,76,0.15)'; e.target.style.color = '#c9a84c' }}
                onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'rgba(255,255,255,0.7)' }}
              >{n.label}</Link>
            ))}
          </div>
        )}

        {/* Desktop Auth Buttons */}
        {!isMobile && (
          isLoggedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {user?.role === 'admin' && (
                <Link to="/admin" style={{
                  background: 'linear-gradient(135deg,rgba(233,30,99,0.25),rgba(233,30,99,0.15))',
                  border: '1px solid rgba(233,30,99,0.5)',
                  color: '#ff80ab', padding: '9px 16px', borderRadius: 22,
                  fontSize: 13, fontWeight: 700, textDecoration: 'none',
                }}>{t('home.admin')}</Link>
              )}
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 600 }}>
                {user?.name?.split(' ')[0]}
              </span>
              <button onClick={() => { logout(); navigate('/auth') }} style={{
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                color: 'white', padding: '9px 18px', borderRadius: 22,
                fontSize: 13, cursor: 'pointer', fontWeight: 700,
              }}>{t('home.logout')}</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}>
              <Link to="/auth" style={{
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                color: 'white', padding: '10px 18px', borderRadius: 24,
                fontWeight: 700, fontSize: 14, textDecoration: 'none',
              }}>{t('home.hero.btnLogin')}</Link>
              <Link to="/auth" style={{
                background: 'linear-gradient(135deg,#c9a84c,#a8872e)',
                color: '#0a1f0d', padding: '10px 20px', borderRadius: 24,
                fontWeight: 800, fontSize: 14, textDecoration: 'none',
                boxShadow: '0 6px 20px rgba(201,168,76,0.35)',
              }}>{t('home.hero.btnRegister')}</Link>
            </div>
          )
        )}

        {/* Mobile Hamburger */}
        {isMobile && (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              color: 'white', width: 40, height: 40, borderRadius: 10,
              fontSize: 18, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        )}
      </nav>

      {/* Mobile Dropdown Menu */}
      {isMobile && menuOpen && (
        <div style={{
          position: 'fixed', top: 70, left: 0, right: 0, zIndex: 998,
          background: 'rgba(5,15,7,0.98)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          padding: '16px',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {NAV_LINKS.map(n => (
            <Link key={n.to} to={n.to}
              onClick={() => setMenuOpen(false)}
              style={{
                color: 'rgba(255,255,255,0.85)', textDecoration: 'none',
                padding: '12px 16px', borderRadius: 12,
                fontSize: 15, fontWeight: 700, fontFamily: "'Nunito',sans-serif",
                background: 'rgba(255,255,255,0.05)',
              }}
            >{n.label}</Link>
          ))}

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12, marginTop: 4 }}>
            {isLoggedIn ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {user?.role === 'admin' && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)} style={{
                    background: 'rgba(233,30,99,0.15)', border: '1px solid rgba(233,30,99,0.3)',
                    color: '#ff80ab', padding: '12px 16px', borderRadius: 12,
                    fontSize: 14, fontWeight: 700, textDecoration: 'none', textAlign: 'center',
                  }}>👑 Admin Panel</Link>
                )}
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center', padding: '4px 0' }}>
                  👋 {user?.name}
                </div>
                <button onClick={() => { logout(); navigate('/auth'); setMenuOpen(false) }} style={{
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                  color: 'white', padding: '12px', borderRadius: 12,
                  fontSize: 14, cursor: 'pointer', fontWeight: 700,
                }}>🚪 Logout</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10 }}>
                <Link to="/auth" onClick={() => setMenuOpen(false)} style={{
                  flex: 1, textAlign: 'center',
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                  color: 'white', padding: '12px', borderRadius: 12,
                  fontWeight: 700, fontSize: 14, textDecoration: 'none',
                }}>Login</Link>
                <Link to="/auth" onClick={() => setMenuOpen(false)} style={{
                  flex: 1, textAlign: 'center',
                  background: 'linear-gradient(135deg,#c9a84c,#a8872e)',
                  color: '#0a1f0d', padding: '12px', borderRadius: 12,
                  fontWeight: 800, fontSize: 14, textDecoration: 'none',
                }}>Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function Hero() {
  const { isLoggedIn } = useAuth()
  
  const { t } = useTranslation()

  return (
    <section style={{ 
      minHeight: '100vh', 
      // background: 'linear-gradient(160deg,#040d06 0%,#0d2e14 35%,#1b5e28 70%,#2a8040 100%)', 
background: `linear-gradient(160deg,rgba(10,6,2,0.78) 0%,rgba(30,18,5,0.74) 35%,rgba(50,32,8,0.68) 70%,rgba(70,45,10,0.60) 100%), url('/images/farm.jpg') center/cover no-repeat`,
display: 'flex',      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '120px 20px 60px', 
      textAlign: 'center', 
      position: 'relative', 
      overflow: 'hidden'
    }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeDown{from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bounce2{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(12px)}}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(76,175,101,0.6)}50%{box-shadow:0 0 0 8px rgba(76,175,101,0)}}
        @keyframes float{0%,100%{transform:translateY(0px)}50%{transform:translateY(-12px)}}
      `}</style>

      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '8%', left: '4%', fontSize: 140, opacity: 0.05, transform: 'rotate(-15deg)', userSelect: 'none', animation: 'float 6s ease-in-out infinite' }}>🌾</div>
        <div style={{ position: 'absolute', bottom: '12%', right: '4%', fontSize: 120, opacity: 0.06, transform: 'rotate(10deg)', userSelect: 'none', animation: 'float 8s ease-in-out infinite 1s' }}>🚜</div>
        <div style={{ position: 'absolute', top: '35%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle,rgba(45,138,69,0.15) 0%,transparent 70%)' }} />
      </div>

      <div style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: 10, 
        background: 'rgba(201,168,76,0.15)', 
        border: '1px solid rgba(201,168,76,0.35)', 
        padding: '8px 20px', 
        borderRadius: 32, 
        marginBottom: 28, 
        animation: 'fadeDown 0.7s ease forwards',
        backdropFilter: 'blur(8px)'
      }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4caf65', display: 'inline-block', animation: 'pulse 2s infinite' }} />
        <span style={{ fontSize: 13, color: '#f0d080', fontWeight: 800, letterSpacing: 1.8, fontFamily: "'Nunito',sans-serif", textTransform: 'uppercase' }}>{t('home.badge')}</span>
      </div>

      <h1 style={{ 
        fontFamily: "'Playfair Display',serif", 
        fontSize: 'clamp(42px,8vw,76px)', 
        fontWeight: 900, 
        lineHeight: 1.15, 
        color: 'white', 
        margin: '0 0 24px', 
        maxWidth: 900, 
        animation: 'fadeUp 0.8s ease 0.15s both',
        letterSpacing: -1
      }}>
        {t('home.hero.line1')} <em style={{ fontStyle: 'italic', color: '#c9a84c', textShadow: '0 0 30px rgba(201,168,76,0.3)' }}>{t('home.hero.line2')}</em><br />
        {t('home.hero.line3')}
      </h1>

      <p style={{ 
        fontSize: 'clamp(16px,2.8vw,20px)', 
        color: 'rgba(255,255,255,0.75)', 
        maxWidth: 620, 
        lineHeight: 1.85, 
        margin: '0 auto 42px', 
        fontFamily: "'Nunito',sans-serif", 
        fontWeight: 500, 
        animation: 'fadeUp 0.8s ease 0.3s both'
      }}>
        {t('home.hero.desc')} <strong style={{ color: '#c9a84c' }}>{t('home.hero.descBold')}</strong>
      </p>

      <div style={{ 
        display: 'flex', 
        gap: 16, 
        flexWrap: 'wrap', 
        justifyContent: 'center', 
        animation: 'fadeUp 0.8s ease 0.45s both'
      }}>
        {isLoggedIn ? (
          <Link to="/chat" style={{ 
            background: 'linear-gradient(135deg,#c9a84c,#a8872e)', 
            color: '#0a1f0d', 
            padding: '16px 36px', 
            borderRadius: 18, 
            fontWeight: 800, 
            fontSize: 16, 
            textDecoration: 'none', 
            fontFamily: "'Nunito',sans-serif", 
            boxShadow: '0 10px 32px rgba(201,168,76,0.4)',
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 8,
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 16px 48px rgba(201,168,76,0.5)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 10px 32px rgba(201,168,76,0.4)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {t('home.hero.btnChat')}
          </Link>
        ) : (
          <>
            <Link to="/auth" style={{ 
              background: 'linear-gradient(135deg,#c9a84c,#a8872e)', 
              color: '#0a1f0d', 
              padding: '16px 36px', 
              borderRadius: 18, 
              fontWeight: 800, 
              fontSize: 16, 
              textDecoration: 'none', 
              fontFamily: "'Nunito',sans-serif", 
              boxShadow: '0 10px 32px rgba(201,168,76,0.4)',
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 8,
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(201,168,76,0.5)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 10px 32px rgba(201,168,76,0.4)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {t('home.hero.btnRegister')}
            </Link>
            <Link to="/auth" style={{ 
              background: 'rgba(255,255,255,0.1)', 
              border: '1.5px solid rgba(255,255,255,0.25)', 
              color: 'white', 
              padding: '16px 36px', 
              borderRadius: 18, 
              fontWeight: 700, 
              fontSize: 16, 
              textDecoration: 'none', 
              fontFamily: "'Nunito',sans-serif", 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 8,
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(8px)'
            }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {t('home.hero.btnLogin')}
            </Link>
          </>
        )}
      </div>

      <div style={{ 
        display: 'flex', 
        marginTop: 72, 
        flexWrap: 'wrap', 
        justifyContent: 'center', 
        background: 'rgba(255,255,255,0.06)', 
        backdropFilter: 'blur(12px)', 
        border: '1px solid rgba(255,255,255,0.12)', 
        borderRadius: 24, 
        overflow: 'hidden', 
        animation: 'fadeUp 0.8s ease 0.6s both'
      }}>
        {STATS_META.map((s, i) => (
          <div key={i} style={{ 
            padding: '26px 42px', 
            textAlign: 'center', 
            borderRight: i < STATS_META.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 900, color: '#c9a84c', lineHeight: 1.2 }}>{s.value}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontFamily: "'Nunito',sans-serif", fontWeight: 700, marginTop: 4 }}>
              {t(`home.stats.${['free', 'features', 'powered', 'available'][i]}`)}
            </div>
          </div>
        ))}
      </div>

      <div style={{ position: 'absolute', bottom: 32, left: '50%', animation: 'bounce2 2.5s infinite' }}>
        <div style={{ width: 32, height: 32, border: '2px solid rgba(255,255,255,0.32)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 16, fontWeight: 700 }}>↓</div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const { t } = useTranslation()
  const steps = t('home.steps', { returnObjects: true })

  return (
    <section style={{ background: 'white', padding: '100px 20px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{ 
              display: 'inline-block', 
              background: 'linear-gradient(135deg,#fff8e1,#ffecb3)', 
              color: '#854d0e', 
              fontSize: 13, 
              fontWeight: 800, 
              letterSpacing: 2, 
              padding: '6px 16px', 
              borderRadius: 24, 
              fontFamily: "'Nunito',sans-serif", 
              textTransform: 'uppercase'
            }}>{t('home.howItWorks.badge')}</span>
            <h2 style={{ 
              fontFamily: "'Playfair Display',serif", 
              fontSize: 'clamp(32px,5vw,48px)', 
              fontWeight: 900, 
              color: '#0d2e14', 
              margin: '18px 0 0',
              letterSpacing: -1
            }}>{t('home.howItWorks.title')}</h2>
          </div>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 32 }}>
          {steps.map((s, i) => (
            <Reveal key={i} delay={i * 100}>
              <div style={{ textAlign: 'center', position: 'relative' }}>
                {i < steps.length - 1 && (
                  <div style={{ 
                    position: 'absolute', 
                    top: 40, 
                    left: '50%', 
                    width: 'calc(100% - 80px)', 
                    height: '2px', 
                    background: 'linear-gradient(90deg,transparent,#e0e0e0,transparent)',
                    transform: 'translateX(50%)',
                    display: window.innerWidth > 768 ? 'block' : 'none'
                  }} />
                )}
                <div style={{ 
                  width: 90, 
                  height: 90, 
                  borderRadius: '50%', 
                  margin: '0 auto 24px', 
                  background: 'linear-gradient(135deg,#e8f5e9,#c8e6c9)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: 40, 
                  position: 'relative', 
                  boxShadow: '0 10px 32px rgba(45,138,69,0.2)',
                  transition: 'transform 0.3s ease'
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {STEP_ICONS[i]}
                  <span style={{ 
                    position: 'absolute', 
                    top: -6, 
                    right: -6, 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg,#1b5e28,#2d8a45)', 
                    color: 'white', 
                    fontSize: 13, 
                    fontWeight: 800, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontFamily: "'Nunito',sans-serif",
                    boxShadow: '0 4px 12px rgba(27,94,40,0.3)'
                  }}>{i + 1}</span>
                </div>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: '#0d2e14', margin: '0 0 10px' }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: '#4a7c59', lineHeight: 1.75, fontFamily: "'Nunito',sans-serif", fontWeight: 500 }}>{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Testimonials() {
  const { t } = useTranslation()
  const items = t('home.testimonialItems', { returnObjects: true })

  return (
    <section style={{ background: 'linear-gradient(160deg,#080f09,#0d2e14,#1b5e28)', padding: '100px 20px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{ 
              display: 'inline-block', 
              background: 'rgba(201,168,76,0.18)', 
              border: '1px solid rgba(201,168,76,0.35)', 
              color: '#f0d080', 
              fontSize: 13, 
              fontWeight: 800, 
              letterSpacing: 2, 
              padding: '6px 16px', 
              borderRadius: 24, 
              fontFamily: "'Nunito',sans-serif", 
              textTransform: 'uppercase'
            }}>{t('home.testimonials.badge')}</span>
            <h2 style={{ 
              fontFamily: "'Playfair Display',serif", 
              fontSize: 'clamp(32px,5vw,48px)', 
              fontWeight: 900, 
              color: 'white', 
              margin: '18px 0 0',
              letterSpacing: -1
            }}>{t('home.testimonials.title')}</h2>
          </div>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 24 }}>
          {items.map((item, i) => (
            <Reveal key={i} delay={i * 100}>
              <div style={{ 
                background: 'rgba(255,255,255,0.08)', 
                border: '1px solid rgba(255,255,255,0.15)', 
                borderRadius: 24, 
                padding: '28px 24px', 
                backdropFilter: 'blur(12px)',
                transition: 'all 0.3s ease'
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
                  e.currentTarget.style.transform = 'translateY(-6px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 14, color: '#c9a84c', lineHeight: 1 }}>"</div>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.88)', lineHeight: 1.85, fontFamily: "'Nunito',sans-serif", margin: '0 0 24px', fontWeight: 500 }}>{item.text}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg,#2d8a45,#4caf65)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: 20, 
                    fontWeight: 900, 
                    color: 'white', 
                    fontFamily: "'Playfair Display',serif",
                    boxShadow: '0 4px 12px rgba(45,138,69,0.3)'
                  }}>{item.name[0]}</div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'white', fontSize: 15, fontFamily: "'Nunito',sans-serif" }}>{item.name}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontFamily: "'Nunito',sans-serif" }}>{item.loc} · {item.crop}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function AboutCard() {
  return (
    <section style={{ background: '#071107', padding: '40px 20px 60px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Link to="/about" style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{
            position: 'relative',
            borderRadius: 28,
            overflow: 'hidden',
            border: '1px solid rgba(201,168,76,0.4)',
            transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
            cursor: 'pointer',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-6px)'
              e.currentTarget.style.borderColor = '#c9a84c'
              e.currentTarget.style.boxShadow = '0 28px 60px rgba(0,0,0,0.5), 0 0 40px rgba(201,168,76,0.12)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&w=1400&q=80)`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              filter: 'brightness(0.25) saturate(0.6)',
            }} />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(105deg, rgba(12,20,10,0.97) 40%, rgba(30,20,5,0.85) 70%, rgba(50,35,5,0.6) 100%)',
            }} />
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 3,
              background: 'linear-gradient(90deg, #c9a84c, #e2b13b, #c9a84c)',
            }} />
            <div style={{
              position: 'absolute', right: -80, top: '50%', transform: 'translateY(-50%)',
              width: 420, height: 420, borderRadius: '50%',
              border: '1px solid rgba(201,168,76,0.1)',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', right: -30, top: '50%', transform: 'translateY(-50%)',
              width: 280, height: 280, borderRadius: '50%',
              border: '1px solid rgba(201,168,76,0.07)',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'relative', zIndex: 1,
padding: 'clamp(24px, 5vw, 44px) clamp(16px, 5vw, 48px)',
display: 'flex', alignItems: 'center',
justifyContent: 'center', flexWrap: 'wrap', gap: 32,
            }}>
              <div style={{ maxWidth: 560 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'rgba(201,168,76,0.12)',
                  border: '1px solid rgba(201,168,76,0.3)',
                  padding: '5px 14px', borderRadius: 20, marginBottom: 22,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9a84c', display: 'inline-block' }} />
                  <span style={{
                    fontSize: 10.5, color: '#e2c278', fontWeight: 800,
                    letterSpacing: 2, fontFamily: "'Nunito',sans-serif", textTransform: 'uppercase',
                  }}>
                    🎓 UET Lahore, Narowal Campus · 4th Semester Project
                  </span>
                </div>
                <h2 style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: 'clamp(32px,4.5vw,52px)',
                  fontWeight: 900, color: 'white',
                  margin: '0 0 8px', letterSpacing: -1, lineHeight: 1.1,
                }}>
                  About <em style={{ fontStyle: 'italic', color: '#c9a84c' }}>KisanAI</em>
                </h2>
                <p style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: 18, color: 'rgba(255,255,255,0.45)',
                  fontStyle: 'italic', margin: '0 0 22px',
                }}>
                  Built by students, for Pakistan's farmers
                </p>
                <p style={{
                  fontSize: 14.5, color: 'rgba(255,255,255,0.6)',
                  fontFamily: "'Nunito',sans-serif", lineHeight: 1.8,
                  margin: '0 0 28px', maxWidth: 480,
                }}>
                  Meet the team behind KisanAI — 4 BS Computer Science students from UET Lahore
                  who built this AI-powered farming platform as their 4th semester project.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
                  {[
                    { name: 'Ali Hamza',     icon: '👨‍💻', color: '#C9903A', lead: true  },
                    { name: 'Abdul Rehman',  icon: '🛠️',  color: '#52B788', lead: false },
                    { name: 'M. Usman',      icon: '🎨',  color: '#5ABED6', lead: false },
                    { name: 'M. Saad',       icon: '🤖',  color: '#C5759A', lead: false },
                  ].map((m, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      background: 'rgba(255,255,255,0.06)',
                      border: `1px solid ${m.color}30`,
                      padding: '6px 12px', borderRadius: 20,
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: `${m.color}22`,
                        border: `1.5px solid ${m.color}55`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14,
                      }}>{m.icon}</div>
                      <span style={{
                        fontSize: 12.5, color: 'rgba(255,255,255,0.75)',
                        fontFamily: "'Nunito',sans-serif", fontWeight: 700,
                      }}>{m.name}</span>
                      {m.lead && (
                        <span style={{
                          fontSize: 9, color: m.color, fontWeight: 800,
                          fontFamily: "'Nunito',sans-serif", letterSpacing: 1,
                          textTransform: 'uppercase',
                        }}>Lead</span>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['React + Vite', 'FastAPI', 'PostgreSQL', 'Python', 'PWA'].map((t, i) => (
                    <span key={i} style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      padding: '4px 12px', borderRadius: 8,
                      fontSize: 11.5, color: 'rgba(255,255,255,0.5)',
                      fontFamily: "'Nunito',sans-serif", fontWeight: 600,
                    }}>{t}</span>
                  ))}
                </div>
              </div>
              <div style={{
                background: 'rgba(201,168,76,0.08)',
                border: '1px solid rgba(201,168,76,0.22)',
                borderRadius: 20, padding: '32px 28px',
                textAlign: 'center', minWidth: 220,
                 width: '100%',        // ← add karo
                maxWidth: 280,        // ← add karo
                flexShrink: 0,
              }}>
                <div style={{ fontSize: 52, marginBottom: 14 }}>📖</div>
                <div style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: 22, fontWeight: 700,
                  color: 'white', marginBottom: 8,
                }}>
                  Full Story
                </div>
                <div style={{
                  fontSize: 13, color: 'rgba(255,255,255,0.5)',
                  fontFamily: "'Nunito',sans-serif", lineHeight: 1.7,
                  marginBottom: 22,
                }}>
                  Mission, tech stack, architecture & complete project details
                </div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'linear-gradient(135deg,#c9a84c,#a8872e)',
                  color: '#0a1f0d', padding: '11px 24px', borderRadius: 12,
                  fontWeight: 800, fontSize: 14,
                  fontFamily: "'Nunito',sans-serif",
                  boxShadow: '0 8px 24px rgba(201,168,76,0.3)',
                }}>
                  View About Page →
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  )
}

function CTA() {
  const { isLoggedIn } = useAuth()
  const { t } = useTranslation()

  return (
    <section style={{ background: 'linear-gradient(180deg,#f3faf4 0%,#f0f9f1 100%)', padding: '100px 20px' }}>
      <Reveal>
        <div style={{ 
          maxWidth: 800, 
          margin: '0 auto', 
          textAlign: 'center', 
          background: 'linear-gradient(140deg,#0a1f0d,#1b5e28)', 
          borderRadius: 32, 
          padding: '68px 48px', 
          boxShadow: '0 28px 72px rgba(10,30,13,0.3)', 
          position: 'relative', 
          overflow: 'hidden',
          border: '1px solid rgba(76,175,101,0.2)'
        }}>
          <div style={{ position: 'absolute', top: -50, right: -50, fontSize: 140, opacity: 0.06, userSelect: 'none' }}>🌾</div>
          <h2 style={{ 
            fontFamily: "'Playfair Display',serif", 
            fontSize: 'clamp(28px,5vw,42px)', 
            fontWeight: 900, 
            color: 'white', 
            margin: '0 0 16px',
            letterSpacing: -0.5
          }}>
            {isLoggedIn ? t('home.cta.titleIn') : t('home.cta.titleOut')}
          </h2>
          <p style={{ 
            fontSize: 17, 
            color: 'rgba(255,255,255,0.75)', 
            fontFamily: "'Nunito',sans-serif", 
            margin: '0 0 38px', 
            lineHeight: 1.8,
            fontWeight: 500
          }}>
            {isLoggedIn ? t('home.cta.descIn') : t('home.cta.descOut')}
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {isLoggedIn ? (
              <>
                <Link to="/chat" style={{ 
                  background: 'linear-gradient(135deg,#c9a84c,#a8872e)', 
                  color: '#0a1f0d', 
                  padding: '15px 34px', 
                  borderRadius: 16, 
                  fontWeight: 800, 
                  fontSize: 16, 
                  textDecoration: 'none', 
                  fontFamily: "'Nunito',sans-serif", 
                  boxShadow: '0 10px 28px rgba(201,168,76,0.4)',
                  transition: 'all 0.3s ease'
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '0 14px 40px rgba(201,168,76,0.5)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = '0 10px 28px rgba(201,168,76,0.4)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >{t('home.cta.btnChat')}</Link>
                <Link to="/disease" style={{ 
                  background: 'rgba(255,255,255,0.1)', 
                  border: '1.5px solid rgba(255,255,255,0.25)', 
                  color: 'white', 
                  padding: '15px 34px', 
                  borderRadius: 16, 
                  fontWeight: 700, 
                  fontSize: 16, 
                  textDecoration: 'none', 
                  fontFamily: "'Nunito',sans-serif",
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(8px)'
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >{t('home.cta.btnDisease')}</Link>
              </>
            ) : (
              <>
                <Link to="/auth" style={{ 
                  background: 'linear-gradient(135deg,#c9a84c,#a8872e)', 
                  color: '#0a1f0d', 
                  padding: '15px 34px', 
                  borderRadius: 16, 
                  fontWeight: 800, 
                  fontSize: 16, 
                  textDecoration: 'none', 
                  fontFamily: "'Nunito',sans-serif", 
                  boxShadow: '0 10px 28px rgba(201,168,76,0.4)',
                  transition: 'all 0.3s ease'
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '0 14px 40px rgba(201,168,76,0.5)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = '0 10px 28px rgba(201,168,76,0.4)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >{t('home.cta.btnRegister')}</Link>
                <Link to="/auth" style={{ 
                  background: 'rgba(255,255,255,0.1)', 
                  border: '1.5px solid rgba(255,255,255,0.25)', 
                  color: 'white', 
                  padding: '15px 34px', 
                  borderRadius: 16, 
                  fontWeight: 700, 
                  fontSize: 16, 
                  textDecoration: 'none', 
                  fontFamily: "'Nunito',sans-serif",
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(8px)'
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >{t('home.cta.btnLogin')}</Link>
              </>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  )
}

export default function Home() {
  const { t } = useTranslation()
  const { isLoggedIn } = useAuth()
    const location = useLocation()

  useEffect(() => {
    if (location.hash === '#reviews-section') {
      const el = document.getElementById('reviews-section')
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100)
    }
    if (location.hash === '#feedback-section') {
      const el = document.getElementById('feedback-section')
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }, [location])
  
  const featureItems = t('home.featureItems', { returnObjects: true }) || []
  
  const tier3 = FEATURE_META.map((f, idx) => ({
    to: f.to,
    icon: f.icon,
    img: f.img,
    title: featureItems[idx]?.title || f.to.replace('/','').charAt(0).toUpperCase() + f.to.slice(1),
    desc: featureItems[idx]?.desc || 'Smart farming solution',
    tag: f.tag,
  }))

  // Reordered groups to ensure Crop Recommendation (crop) appears prominently
  const getCategoryGroups = (features) => {
    const cropRec = features.find(f => f.to === '/crop')
    const otherFeatures = features.filter(f => f.to !== '/crop')
    
    return [
      {
        title: '🤖 1. AI Advisory',
        items: otherFeatures.filter(f => f.to === '/chat' || f.to === '/disease')
      },
      {
        title: '🌾 2. Crop Recommendation & Farm Management',
        items: cropRec ? [cropRec] : []
      },
      {
        title: '🌱 3. Farm Intelligence & Decision Support',
        items: otherFeatures.filter(f => ['/soil', '/fertilizer', '/calendar', '/spray', '/diary'].includes(f.to))
      },
      {
        title: '📊 4. Market, Weather & Profit Analytics',
        items: otherFeatures.filter(f => ['/weather', '/yield', '/mandi', '/expense'].includes(f.to))
      },
      {
        title: '👥 5. Community & History (Support System)',
        items: otherFeatures.filter(f => ['/history', '/community', '/about'].includes(f.to))
      }
    ].filter(group => group.items.length > 0)
  }

  const groups = getCategoryGroups(tier3)

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", overflowX: 'hidden' }}>
      <Navbar />
      <Hero />
      
      <section style={{ background: '#071107', padding: '60px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {groups.map((group, gIndex) => (
            <div key={gIndex} style={{ marginBottom: 60 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 24 }}>
                <h2 style={{ 
                  color: '#e2c28b', 
                  fontSize: 'clamp(24px, 4vw, 32px)', 
                  fontFamily: "'Playfair Display', serif", 
                  fontWeight: 700,
                  borderLeft: '4px solid #c9a84c',
                  paddingLeft: 16
                }}>
                  {group.title}
                </h2>
                <Link to="/features" style={{ color: '#c9a84c', textDecoration: 'none', fontWeight: 600, fontSize: 13 }}>
                  View All →
                </Link>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                gap: 24 
              }}>
                {group.items.map((item, idx) => (
                  <Link key={idx} to={item.to} style={{ textDecoration: 'none' }}>
                    <div style={{
                      background: '#122010',
                      borderRadius: 20,
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 6px 14px rgba(0,0,0,0.4)',
                      border: '1px solid rgba(201,168,76,0.35)'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#e2b13b';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.6)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(201,168,76,0.35)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.4)';
                    }}>
                      <div style={{
                        height: 150,
                        backgroundImage: `url(${item.img})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative'
                      }}>
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '100%',
                          background: 'linear-gradient(to bottom, rgba(18,32,16,0.2), rgba(18,32,16,0.85))'
                        }} />
                        <div style={{
                          position: 'absolute',
                          bottom: 10,
                          left: 12,
                          right: 12,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span style={{ fontSize: 32, filter: 'drop-shadow(0 2px 4px black)' }}>{item.icon}</span>
                          <span style={{
                            background: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(4px)',
                            border: '1px solid rgba(226,177,59,0.5)',
                            color: '#f0d080',
                            fontSize: 10,
                            fontWeight: 800,
                            padding: '3px 12px',
                            borderRadius: 30
                          }}>
                            {item.tag}
                          </span>
                        </div>
                      </div>
                      
                      <div style={{ padding: '16px 18px 20px', background: '#122010' }}>
                        <h3 style={{ color: '#faf3e0', fontSize: 18, fontWeight: 800, margin: '0 0 6px' }}>
                          {item.title}
                        </h3>
                        <p style={{ color: '#c0cdae', fontSize: 13, lineHeight: 1.5, margin: '0 0 12px' }}>
                          {item.desc}
                        </p>
                        <div style={{ color: '#e2b13b', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                          Explore →
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
          
          {!isLoggedIn && (
            <div style={{ 
              textAlign: 'center', 
              marginTop: 20, 
              padding: '36px 24px', 
              background: '#122010', 
              borderRadius: 28, 
              border: '1px solid rgba(226,177,59,0.4)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.4)'
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🌾</div>
              <h3 style={{ color: '#faf3e0', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
                Join KisanAI Today
              </h3>
              <p style={{ color: '#c0cdae', fontSize: 15, marginBottom: 20 }}>
                Get access to all AI tools, market prices, and crop advisory.
              </p>
              <Link to="/auth" style={{ 
                background: 'linear-gradient(135deg, #e2b13b, #c9a84c)', 
                color: '#0a1f0d', 
                padding: '12px 36px', 
                borderRadius: 40, 
                fontWeight: 800, 
                fontSize: 15, 
                textDecoration: 'none',
                display: 'inline-block',
                boxShadow: '0 6px 16px rgba(226,177,59,0.4)'
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                Get Started Free →
              </Link>
            </div>
          )}
        </div>
      </section>
      
      <HowItWorks />
      {/* Reviews section with ID */}
    <div id="reviews-section">
      <FeedbackSection />
    </div>

    {/* Feedback form section with ID */}
    <div id="feedback-section">
      <UserFeedback />
      
    </div>
      <AboutCard />
      <CTA />
      <Footer />
    </div>
  )
}