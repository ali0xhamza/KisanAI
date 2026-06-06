import { Link } from 'react-router-dom'

const FOOTER_CSS = `
  .fl {
    color:rgba(240,232,216,0.55); text-decoration:none;
    font-family:'Outfit',sans-serif; font-size:13px; font-weight:500;
    transition:all 0.25s; display:block; margin-bottom:12px;
  }
  .fl:hover { color:#E8B86D; transform:translateX(2px); }
  .tech-badge {
    display:inline-flex; align-items:center; gap:8px;
    background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);
    padding:6px 14px; border-radius:40px;
    font-family:'Outfit',sans-serif; font-size:12px; font-weight:500;
    color:rgba(240,232,216,0.55); letter-spacing:0.2px; transition:all 0.25s;
  }
  .tech-badge:hover {
    background:rgba(255,255,255,0.08);
    border-color:rgba(255,255,255,0.2);
    color:rgba(240,232,216,0.9);
    transform:translateY(-2px);
  }
  .src-link {
    color:rgba(201,144,58,0.7); text-decoration:none;
    font-family:'Outfit',sans-serif; font-size:12px; font-weight:600;
    transition:all 0.22s;
  }
  .src-link:hover { color:#E8B86D; }
  .social-btn {
    display:inline-flex; align-items:center; gap:10px;
    background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);
    padding:9px 20px; border-radius:40px; text-decoration:none;
    color:rgba(240,232,216,0.7); font-size:13px; font-weight:600;
    font-family:'Outfit',sans-serif; transition:all 0.25s;
  }
  .social-btn:hover {
    background:rgba(255,255,255,0.09);
    border-color:rgba(255,255,255,0.2);
    color:#F0E8D8;
    transform:translateY(-3px);
  }
  .fdivide {
    height:1px;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent);
    margin:45px 0;
  }
  .col-head {
    font-size:11px; font-weight:800; letter-spacing:2px;
    text-transform:uppercase; color:#C9903A;
    margin-bottom:22px; font-family:'Outfit',sans-serif;
  }

  @media (max-width: 768px) {
    .footer-grid {
      grid-template-columns: 1fr 1fr !important;
      gap: 28px !important;
    }
    .footer-brand {
      grid-column: 1 / -1 !important;
    }
  }
  @media (max-width: 480px) {
    .footer-grid {
      grid-template-columns: 1fr !important;
    }
  }
`

const FEATURE_COLS = [
  {
    head: 'AI Tools',
    links: [
      { to: '/chat',       l: 'AI Chat Assistant'  },
      { to: '/disease',    l: 'Disease Scanner'    },
      { to: '/weather',    l: 'Weather & Forecast' },
      { to: '/fertilizer', l: 'Fertilizer Guide'   },
      { to: '/soil',       l: 'Soil Checker'       },
    ],
  },
  {
    head: 'Farm Management',
    links: [
      { to: '/calendar', l: 'Crop Calendar'    },
      { to: '/crop',     l: 'Crop Planner'     },
      { to: '/spray',    l: 'Spray Calculator' },
      { to: '/yield',    l: 'Yield Predictor'  },
      { to: '/diary',    l: 'Farm Diary'       },
    ],
  },
  {
    head: 'Market & Finance',
    links: [
      { to: '/mandi',     l: 'Mandi Prices'    },
      { to: '/expense',   l: 'Expense Tracker' },
      { to: '/community', l: 'Community'       },
      { to: '/history',   l: 'Chat History'    },
      { to: '/settings',  l: 'Settings'        },
      { to: '/about',     l: 'About Project'   },
    ],
  },
  {
    head: 'Support & Legal',
    links: [
      { to: '/faq',       l: '❓ FAQ'               },
      { to: '/',          l: '📬 Give Feedback',    hash: '#feedback-section' },
      { to: '/',          l: '⭐ Farmer Reviews',   hash: '#reviews-section' },
      { to: '/privacy',   l: '🔒 Privacy Policy'    },
      { to: '/terms',     l: '📜 Terms of Service'  },
    ],
  },
]

const TECH_STACK = [
  { icon: '⚛️', label: 'React + Vite'  },
  { icon: '⚡', label: 'FastAPI'       },
  { icon: '🐘', label: 'PostgreSQL'    },
  { icon: '📱', label: 'PWA'           },
  { icon: '🐍', label: 'Python'        },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{
      background: 'linear-gradient(180deg, #070a05 0%, #0c1408 100%)',
      borderTop: '1px solid rgba(201,144,58,0.15)',
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{FOOTER_CSS}</style>

      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 800, height: 200, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center top, rgba(201,144,58,0.08) 0%, transparent 70%)',
      }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 40px 0', position: 'relative', zIndex: 1 }}>

        {/* Main columns - now with class names for responsive behavior */}
        <div className="footer-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr repeat(4, 1fr)',
          gap: 40,
        }}>
          {/* Brand column with footer-brand class */}
          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 46, height: 46, borderRadius: 14,
                background: 'linear-gradient(135deg,#1A3D28,#3A8A5C)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, boxShadow: '0 6px 18px rgba(26,61,40,0.5)',
              }}>🌾</div>
              <span style={{
                fontFamily: "'Cormorant Garamond',Georgia,serif",
                fontWeight: 700, fontSize: 28, color: '#F0E8D8', letterSpacing: -0.5,
              }}>
                Kisan<em style={{ fontStyle: 'italic', color: '#C9903A' }}>AI</em>
              </span>
            </div>
            <p style={{
              fontSize: 13.5, color: 'rgba(240,232,216,0.45)', lineHeight: 1.8,
              maxWidth: 260, marginBottom: 32, fontFamily: "'Outfit',sans-serif", fontWeight: 400,
            }}>
              AI-powered farming assistant for Pakistani farmers — from soil health to market prices.
            </p>
            <div style={{ display: 'flex', gap: 14 }}>
              <a href="https://github.com/ali0xhamza" target="_blank" rel="noopener noreferrer" className="social-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                GitHub
              </a>
              <a href="https://www.linkedin.com/in/ali0xhamza" target="_blank" rel="noopener noreferrer" className="social-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.203 0 22.225 0z"/>
                </svg>
                LinkedIn
              </a>
            </div>
          </div>

          {/* Feature columns (4 columns) */}
          {FEATURE_COLS.map(col => (
            <div key={col.head}>
              <p className="col-head">{col.head}</p>
              {col.links.map(lnk => {
                if (lnk.hash) {
                  return (
                    <a key={lnk.to + lnk.hash} href={`${lnk.to}${lnk.hash}`} className="fl">
                      {lnk.l}
                    </a>
                  )
                }
                return (
                  <Link key={lnk.to} to={lnk.to} className="fl">{lnk.l}</Link>
                )
              })}
            </div>
          ))}
        </div>

        <div className="fdivide" />

        {/* Built With row */}
        <div style={{ marginBottom: 32 }}>
          <p className="col-head" style={{ marginBottom: 16 }}>Built With</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {TECH_STACK.map(t => (
              <span key={t.label} className="tech-badge">
                <span style={{ fontSize: 14 }}>{t.icon}</span>
                {t.label}
              </span>
            ))}
          </div>
        </div>

        {/* Data Sources row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12, marginBottom: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span className="col-head" style={{ marginBottom: 0 }}>Data Sources:</span>
            <a href="http://amis.pk" target="_blank" rel="noopener noreferrer" className="src-link">AMIS.pk</a>
            <span style={{ color: 'rgba(255,255,255,0.12)' }}>·</span>
            <a href="https://kissan.com.pk" target="_blank" rel="noopener noreferrer" className="src-link">Kissan.com.pk</a>
          </div>
        </div>

        <div className="fdivide" />

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 20, paddingBottom: 40,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg,rgba(201,144,58,0.15),rgba(201,144,58,0.05))',
              border: '1px solid rgba(201,144,58,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>🎓</div>
            <div>
              <div style={{
                fontSize: 13, fontWeight: 600,
                color: 'rgba(240,232,216,0.75)',
                fontFamily: "'Outfit',sans-serif",
              }}>University of Engineering & Technology Lahore</div>
              <div style={{
                fontSize: 12, color: 'rgba(240,232,216,0.4)',
                marginTop: 3, fontFamily: "'Outfit',sans-serif",
              }}>Narowal Campus · BS Computer Science · 4th Semester</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: 11, color: 'rgba(240,232,216,0.3)',
              marginBottom: 5, fontFamily: "'Outfit',sans-serif",
            }}>For educational purposes only. Market data may not reflect real-time prices.</div>
            <div style={{
              fontSize: 12, color: 'rgba(240,232,216,0.25)',
              fontFamily: "'Outfit',sans-serif", fontWeight: 500,
            }}>© {year} Kisan AI · Ali Hamza & Team · UET Lahore</div>
          </div>
        </div>

      </div>
    </footer>
  )
}