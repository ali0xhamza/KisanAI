import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

// ─── CSS with added responsive queries ───────────────────────────────────────
const CSS = `
  :root {
    --gold:  #C9903A;
    --goldL: #E8B86D;
    --dark:  #0A0602;
    --dark2: #110D07;
    --text:  #F0E8D8;
    --muted: rgba(240,232,216,0.5);
    --D: 'Cormorant Garamond', Georgia, serif;
    --B: 'Outfit', system-ui, sans-serif;
  }

  @keyframes fadeUp   { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeDown { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:0.5} }
  @keyframes spin     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes marqueeA { from{transform:translateX(0)} to{transform:translateX(-50%)} }

  .about-tag {
    display:inline-flex; align-items:center; gap:6px;
    background:rgba(201,144,58,0.12); border:1px solid rgba(201,144,58,0.26);
    color:var(--goldL); font-size:10.5px; font-weight:700; letter-spacing:1.8px;
    padding:4px 13px; border-radius:20px; font-family:var(--B); text-transform:uppercase;
  }
  .team-card {
    background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.09);
    border-radius:22px; padding:32px 26px; text-align:center;
    transition:all 0.35s cubic-bezier(0.34,1.56,0.64,1);
    position:relative; overflow:hidden; cursor:default;
  }
  .team-card:hover {
    background:rgba(255,255,255,0.075); border-color:rgba(201,144,58,0.28);
    transform:translateY(-8px); box-shadow:0 28px 56px rgba(0,0,0,0.28);
  }
  .team-card .top-acc {
    position:absolute; top:0; left:0; right:0; height:3px; border-radius:22px 22px 0 0;
  }
  .team-avatar {
    width: 100px; height: 100px; border-radius: 50%; margin: 0 auto 18px;
    object-fit: cover; border: 2px solid rgba(201,144,58,0.3);
    transition: transform 0.3s ease;
  }
  .team-avatar:hover { transform: scale(1.05) rotate(3deg); }
  .feat-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.09);
    padding: 10px 16px;
    border-radius: 12px;
    font-family: var(--B);
    font-size: 13px;
    font-weight: 500;
    color: var(--muted);
    transition: all 0.25s;
    text-decoration: none;
    text-shadow: none;
    -webkit-font-smoothing: antialiased;
    backdrop-filter: none;
  }
  .feat-pill:hover {
    background: rgba(201,144,58,0.1);
    border-color: rgba(201,144,58,0.28);
    color: var(--goldL);
    transform: translateY(-3px);
  }
  .gh-btn {
    display:inline-flex; align-items:center; gap:10px;
    background:rgba(255,255,255,0.07); border:1.5px solid rgba(255,255,255,0.15);
    color:var(--text); padding:13px 26px; border-radius:12px;
    font-family:var(--B); font-size:14px; font-weight:600; text-decoration:none;
    transition:all 0.3s ease;
  }
  .gh-btn:hover { background:rgba(255,255,255,0.12); border-color:rgba(255,255,255,0.28); transform:translateY(-3px); }
  .btn-gold {
    display:inline-flex; align-items:center; gap:8px;
    background:linear-gradient(135deg,#D4A853,#A87A28);
    color:#0A0602; padding:14px 30px; border-radius:12px;
    font-family:var(--B); font-size:14.5px; font-weight:700;
    text-decoration:none; box-shadow:0 8px 26px rgba(201,144,58,0.3);
    transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  .btn-gold:hover { transform:translateY(-4px); box-shadow:0 18px 44px rgba(201,144,58,0.45); }
  .tech-b {
    display:inline-flex; align-items:center; gap:8px;
    background:rgba(255,255,255,0.055); border:1px solid rgba(255,255,255,0.1);
    padding:10px 18px; border-radius:12px;
    font-family:var(--B); font-size:13px; font-weight:600;
    color:rgba(240,232,216,0.65); transition:all 0.25s;
  }
  .tech-b:hover { background:rgba(255,255,255,0.09); color:var(--text); transform:translateY(-2px); }
  .stat-box {
    background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.09);
    border-radius:20px; padding:32px 24px; text-align:center;
    transition:all 0.3s ease;
  }
  .stat-box:hover { background:rgba(255,255,255,0.07); border-color:rgba(201,144,58,0.2); transform:translateY(-5px); }
  .section-divide {
    height:1px;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent);
    margin:0;
  }

  /* Responsive additions */
  @media (max-width: 768px) {
    .mission-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
    .supervisor-card { flex-direction: column !important; text-align: center !important; }
    .uni-card { padding: 36px 24px !important; }
    .about-hero { padding: 60px 20px 60px !important; }
  }
`

// ─── Team data with real photos ─────────────────────────────────────────────
const TEAM = [
  { 
    name: 'Ali Hamza', 
    roll: '2024-CS-554', 
    role: 'Group Lead', 
    img: '/images/hamza.jpeg',
    alt: 'Ali Hamza',
    accent: '#C9903A',
    isLead: true
  },
  { 
    name: 'Abdul Rehman', 
    roll: '2024-CS-500', 
    role: 'Member', 
    img: '/images/rehman.jpeg',
    alt: 'Abdul Rehman',
    accent: '#52B788',
    isLead: false
  },
  { 
    name: 'M.Usman', 
    roll: '2024-CS-512', 
    role: 'Member', 
    img: '/images/usman.jpeg',
    alt: 'Muhammad Usman',
    accent: '#5ABED6',
    isLead: false
  },
  { 
    name: 'M.Saad', 
    roll: '2024-CS-522', 
    role: 'Member', 
    img: '/images/saad.jpeg',
    alt: 'Muhammad Saad',
    accent: '#C5759A',
    isLead: false
  },
]

const TECH_STACK = [
  { icon: '⚛️', label: 'React + Vite',  desc: 'Frontend PWA'    },
  { icon: '⚡', label: 'FastAPI',        desc: 'Backend API'     },
  { icon: '🐘', label: 'PostgreSQL',     desc: 'Database'        },
  { icon: '🐍', label: 'Python',         desc: 'Backend Lang'    },
  { icon: '📱', label: 'PWA',            desc: 'Mobile First'    },
  { icon: '⏰', label: 'APScheduler',    desc: 'Auto Scraper'    },
  { icon: '🌐', label: 'i18n',           desc: 'EN / اردو'       },
]

const FEATURES = [
  { icon: '🤖', label: 'AI Chat Assistant'   },
  { icon: '🔬', label: 'Disease Scanner'     },
  { icon: '⛅', label: 'Weather & Forecast'  },
  { icon: '🧪', label: 'Fertilizer Guide'    },
  { icon: '💰', label: 'Mandi Prices'        },
  { icon: '🌱', label: 'Soil Checker'        },
  { icon: '📅', label: 'Crop Calendar'       },
  { icon: '💬', label: 'Chat History'        },
  { icon: '📊', label: 'Expense Tracker'     },
  { icon: '🤝', label: 'Community'           },
  { icon: '🌾', label: 'Crop Planner'        },
  { icon: '📈', label: 'Yield Predictor'     },
  { icon: '💧', label: 'Spray Calculator'    },
  { icon: '📔', label: 'Farm Diary'          },
]

const STATS = [
  { value: '14',   label: 'AI Features',       icon: '✨' },
  { value: '100%', label: 'Free to Use',        icon: '🎁' },
  { value: '2',    label: 'Languages',          icon: '🌐' },
  { value: '4',    label: 'Team Members',       icon: '👥' },
]

function Reveal({ children, delay = 0, style: extra = {} }) {
  const ref = useRef(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect() } },
      { threshold: 0.08 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => {
      if (ref.current) obs.unobserve(ref.current)
      obs.disconnect()
    }
  }, [])
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'none' : 'translateY(36px)',
      transition: `opacity 0.75s ease ${delay}ms, transform 0.75s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      ...extra,
    }}>
      {children}
    </div>
  )
}

export default function About() {
  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh', overflowX: 'hidden', paddingTop: 70 }}>
      <style>{CSS}</style>

      {/* ── HERO with class about-hero ── */}
      <section className="about-hero" style={{
        padding: '90px 24px 80px', textAlign: 'center',
        background: 'linear-gradient(180deg,#0C0904 0%,#110D07 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:700,height:700,borderRadius:'50%',border:'1px solid rgba(201,144,58,0.06)',pointerEvents:'none' }} />
        <div style={{ position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:1000,height:1000,borderRadius:'50%',border:'1px solid rgba(201,144,58,0.03)',pointerEvents:'none' }} />
        <div style={{ position:'absolute',top:'-20%',left:'50%',transform:'translateX(-50%)',width:800,height:400,background:'radial-gradient(ellipse,rgba(201,144,58,0.07) 0%,transparent 70%)',pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1, maxWidth:800, margin:'0 auto' }}>
          <div style={{ animation:'fadeDown 0.8s ease forwards' }}>
            <span className="about-tag" style={{ marginBottom:28, display:'inline-block' }}>
              🎓 4th Semester Project · BS Computer Science
            </span>
          </div>
          <div style={{ animation:'fadeUp 0.9s ease 0.1s both' }}>
            <h1 style={{
              fontFamily:'var(--D)', fontSize:'clamp(58px,11vw,110px)',
              fontWeight:700, lineHeight:0.95, color:'var(--text)',
              letterSpacing:-3, margin:'0 0 6px',
            }}>
              Kisan<em style={{ fontStyle:'italic', color:'var(--gold)', textShadow:'0 0 80px rgba(201,144,58,0.2)' }}>AI</em>
            </h1>
            <h2 style={{
              fontFamily:'var(--D)', fontSize:'clamp(22px,4vw,36px)',
              fontWeight:300, fontStyle:'italic',
              color:'rgba(240,232,216,0.42)', margin:'0 0 36px', letterSpacing:-0.5,
            }}>
              Empowering Pakistani Farmers with Artificial Intelligence
            </h2>
          </div>
          <div style={{ width:64,height:1.5,background:'linear-gradient(90deg,transparent,var(--gold),transparent)',margin:'0 auto 36px',animation:'fadeUp 0.9s ease 0.25s both' }} />
          <p style={{
            fontSize:'clamp(15px,2vw,18px)', color:'var(--muted)',
            lineHeight:1.95, fontFamily:'var(--B)', fontWeight:400,
            maxWidth:620, margin:'0 auto 48px',
            animation:'fadeUp 0.9s ease 0.3s both',
          }}>
            KisanAI is an AI-powered web application designed to help Pakistani farmers make smarter, 
            data-driven decisions — from crop disease detection to live mandi prices, 
            all in one free platform available in English and Urdu.
          </p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap', animation:'fadeUp 0.9s ease 0.4s both' }}>
            <Link to="/chat" className="btn-gold">Try AI Chat →</Link>
            <a href="https://github.com/ali0xhamza" target="_blank" rel="noopener noreferrer" className="gh-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              GitHub Repository
            </a>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background:'#0D0A05', padding:'72px 24px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16 }}>
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 80}>
                <div className="stat-box">
                  <div style={{ fontSize:36, marginBottom:12 }}>{s.icon}</div>
                  <div style={{ fontFamily:'var(--D)', fontSize:58, fontWeight:600, color:'var(--gold)', lineHeight:1, letterSpacing:-2, marginBottom:8 }}>{s.value}</div>
                  <div style={{ fontSize:13, color:'var(--muted)', fontFamily:'var(--B)', fontWeight:600, letterSpacing:1.5, textTransform:'uppercase' }}>{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divide" />

      {/* ── MISSION with class mission-grid ── */}
      <section style={{ padding:'100px 24px', background:'var(--dark2)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div className="mission-grid" style={{
            display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'center'
          }}>
            <Reveal>
              <div>
                <span className="about-tag" style={{ marginBottom:24, display:'inline-block' }}>Our Mission</span>
                <h2 style={{
                  fontFamily:'var(--D)', fontSize:'clamp(36px,5.5vw,64px)',
                  fontWeight:700, color:'var(--text)', lineHeight:1.0,
                  letterSpacing:-1.5, margin:'0 0 24px',
                }}>
                  Technology in Every Farmer's Hands
                </h2>
                <p style={{ fontSize:16, color:'var(--muted)', lineHeight:1.95, fontFamily:'var(--B)', fontWeight:400, marginBottom:20 }}>
                  Pakistan has over 8 million farmers who often lack access to timely, 
                  accurate agricultural information. KisanAI bridges this gap by bringing 
                  AI-powered tools directly to their smartphones — completely free.
                </p>
                <p style={{ fontSize:16, color:'var(--muted)', lineHeight:1.95, fontFamily:'var(--B)', fontWeight:400 }}>
                  From detecting crop diseases with a photo, to checking live mandi prices, 
                  to getting personalized fertilizer recommendations — KisanAI puts expert 
                  knowledge in every farmer's pocket, in both English and Urdu.
                </p>
              </div>
            </Reveal>
            <Reveal delay={150}>
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {[
                  { icon:'🎯', title:'Problem We Solve',   desc:'Pakistani farmers lack access to real-time data, expert advice and modern tools — especially in rural areas.' },
                  { icon:'💡', title:'Our Solution',       desc:'A free, bilingual AI platform with 14 specialized tools covering every aspect of modern farming.' },
                  { icon:'📱', title:'Mobile First PWA',   desc:'Works on any smartphone browser with offline capabilities — no app store download needed.' },
                ].map((item, idx) => (
                  <div key={idx} style={{
                    background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)',
                    borderRadius:16, padding:'22px 22px',
                    display:'flex', gap:16, alignItems:'flex-start',
                    transition:'all 0.3s ease',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor='rgba(201,144,58,0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.09)'; }}
                  >
                    <span style={{ fontSize:28, flexShrink:0 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontFamily:'var(--D)', fontSize:20, fontWeight:600, color:'var(--text)', marginBottom:6 }}>{item.title}</div>
                      <div style={{ fontSize:13.5, color:'var(--muted)', fontFamily:'var(--B)', lineHeight:1.75 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <div className="section-divide" />

      {/* ── FEATURES ── */}
      <section style={{ padding:'100px 24px', background:'var(--dark)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <Reveal>
            <div style={{ textAlign:'center', marginBottom:60 }}>
              <span className="about-tag" style={{ marginBottom:22, display:'inline-block' }}>Features</span>
              <h2 style={{
                fontFamily:'var(--D)', fontSize:'clamp(36px,5.5vw,62px)',
                fontWeight:700, color:'var(--text)', letterSpacing:-1.5, lineHeight:1.0,
              }}>
                14 Tools, One Platform
              </h2>
              <p style={{ fontSize:15, color:'var(--muted)', fontFamily:'var(--B)', marginTop:16, maxWidth:500, margin:'16px auto 0' }}>
                Every tool built specifically for Pakistani agriculture and farming needs.
              </p>
            </div>
          </Reveal>
          <div style={{ display:'flex', flexWrap:'wrap', gap:10, justifyContent:'center' }}>
            {FEATURES.map((f, i) => (
              <Reveal key={f.label} delay={i * 40}>
                <Link to={`/${f.label.toLowerCase().replace(/\s+&\s+/g,' ').replace(/\s+/g,'-').replace(/[^a-z-]/g,'')}`} className="feat-pill" style={{ textDecoration: 'none' }}>
                  <span style={{ fontSize:18 }}>{f.icon}</span>
                  {f.label}
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divide" />

      {/* ── TECH STACK ── */}
      <section style={{ padding:'100px 24px', background:'#0D0A05' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <Reveal>
            <div style={{ textAlign:'center', marginBottom:60 }}>
              <span className="about-tag" style={{ marginBottom:22, display:'inline-block' }}>Tech Stack</span>
              <h2 style={{
                fontFamily:'var(--D)', fontSize:'clamp(36px,5.5vw,62px)',
                fontWeight:700, color:'var(--text)', letterSpacing:-1.5, lineHeight:1.0,
              }}>
                Built With Modern Technology
              </h2>
            </div>
          </Reveal>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12 }}>
            {TECH_STACK.map((t, i) => (
              <Reveal key={t.label} delay={i * 60}>
                <div className="tech-b" style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'28px 20px', borderRadius:16, textAlign:'center', gap:10 }}>
                  <span style={{ fontSize:36 }}>{t.icon}</span>
                  <div>
                    <div style={{ fontFamily:'var(--D)', fontSize:22, fontWeight:600, color:'var(--text)', marginBottom:4 }}>{t.label}</div>
                    <div style={{ fontSize:12, color:'var(--muted)', fontFamily:'var(--B)', letterSpacing:1, textTransform:'uppercase' }}>{t.desc}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200}>
            <div style={{
              marginTop:32, padding:'28px 32px',
              background:'rgba(255,255,255,0.04)', border:'1px solid rgba(201,144,58,0.18)',
              borderRadius:18, display:'flex', alignItems:'flex-start', gap:20,
            }}>
              <span style={{ fontSize:32, flexShrink:0 }}>⚙️</span>
              <div>
                <div style={{ fontFamily:'var(--D)', fontSize:22, fontWeight:600, color:'var(--text)', marginBottom:8 }}>
                  Architecture Highlights
                </div>
                <div style={{ fontSize:14, color:'var(--muted)', fontFamily:'var(--B)', lineHeight:1.85 }}>
                  React + Vite PWA frontend communicates with a FastAPI backend over REST APIs. 
                  PostgreSQL stores all user data, expenses, diary entries and chat history. 
                  An APScheduler-powered nightly scraper pulls live mandi prices from AMIS.pk and Kissan.com.pk. 
                  Groq AI powers the chat assistant, disease scanner and crop recommendations. 
                  Full bilingual support with i18next — English and Urdu with RTL layout switching.
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="section-divide" />

      {/* ── TEAM ── */}
      <section style={{ padding:'100px 24px', background:'var(--dark2)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <Reveal>
            <div style={{ textAlign:'center', marginBottom:64 }}>
              <span className="about-tag" style={{ marginBottom:22, display:'inline-block' }}>The Team</span>
              <h2 style={{
                fontFamily:'var(--D)', fontSize:'clamp(36px,5.5vw,62px)',
                fontWeight:700, color:'var(--text)', letterSpacing:-1.5, lineHeight:1.0,
              }}>
                Meet the Developers
              </h2>
              <p style={{ fontSize:15, color:'var(--muted)', fontFamily:'var(--B)', marginTop:16 }}>
                BS Computer Science · University of Engineering & Technology Lahore, Narowal Campus
              </p>
            </div>
          </Reveal>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:16, marginBottom:40 }}>
            {TEAM.map((m, i) => (
              <Reveal key={m.name} delay={i * 90}>
                <div className="team-card">
                  <div className="top-acc" style={{ background:`linear-gradient(90deg,${m.accent},${m.accent}44)` }} />
                  <img 
                    src={m.img} 
                    alt={m.alt} 
                    className="team-avatar"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/100?text=👤'; }}
                  />
                  <h3 style={{
                    fontFamily:'var(--D)', fontSize:24, fontWeight:600,
                    color:'var(--text)', margin:'0 0 6px', letterSpacing:-0.3,
                  }}>{m.name}</h3>
                  <div style={{
                    fontSize:12.5, color: m.accent, fontFamily:'var(--B)',
                    fontWeight:700, letterSpacing:0.5, marginBottom:14,
                  }}>{m.role}</div>
                  <div style={{
                    display:'inline-block',
                    background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)',
                    padding:'5px 14px', borderRadius:8,
                    fontSize:12, color:'var(--muted)', fontFamily:'var(--B)',
                    letterSpacing:0.5, fontWeight:600,
                  }}>
                    {m.roll}
                  </div>
                  {m.isLead && (
                    <div style={{
                      position:'absolute', top:18, right:18,
                      background:`${m.accent}22`, border:`1px solid ${m.accent}44`,
                      padding:'3px 10px', borderRadius:8,
                      fontSize:10, color:m.accent, fontFamily:'var(--B)', fontWeight:700,
                      letterSpacing:1, textTransform:'uppercase',
                    }}>Lead</div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>

          {/* Supervisor with class supervisor-card */}
          <Reveal delay={400}>
            <div className="supervisor-card" style={{
              background:'rgba(201,144,58,0.07)', border:'1px solid rgba(201,144,58,0.22)',
              borderRadius:20, padding:'32px 36px',
              display:'flex', alignItems:'center', gap:24, flexWrap:'wrap',
            }}>
              <div style={{
                width:70, height:70, borderRadius:'50%', flexShrink:0,
                background:'linear-gradient(135deg,rgba(201,144,58,0.25),rgba(201,144,58,0.1))',
                border:'2px solid rgba(201,144,58,0.35)',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:32,
              }}>👩‍🏫</div>
              <div>
                <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--gold)', fontFamily:'var(--B)', marginBottom:8 }}>
                  Project Supervisor
                </div>
                <div style={{ fontFamily:'var(--D)', fontSize:30, fontWeight:600, color:'var(--text)', letterSpacing:-0.5, marginBottom:4 }}>
                  Ma'am Rabia Sana
                </div>
                <div style={{ fontSize:13.5, color:'var(--muted)', fontFamily:'var(--B)' }}>
                  Department of Computer Science · UET Lahore, Narowal Campus
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="section-divide" />

      {/* ── UNIVERSITY with class uni-card ── */}
      <section style={{ padding:'100px 24px', background:'var(--dark)' }}>
        <div style={{ maxWidth:800, margin:'0 auto', textAlign:'center' }}>
          <Reveal>
            <div className="uni-card" style={{
              background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)',
              borderRadius:28, padding:'60px 48px',
              position:'relative', overflow:'hidden',
            }}>
              <div style={{ position:'absolute',top:-40,right:-40,fontSize:140,opacity:0.04,userSelect:'none',pointerEvents:'none' }}>🎓</div>
              <div style={{ fontSize:56, marginBottom:24 }}>🎓</div>
              <h2 style={{
                fontFamily:'var(--D)', fontSize:'clamp(26px,4vw,42px)',
                fontWeight:700, color:'var(--text)', letterSpacing:-1, margin:'0 0 12px',
              }}>
                University of Engineering & Technology Lahore
              </h2>
              <div style={{
                fontSize:16, color:'var(--gold)', fontFamily:'var(--B)',
                fontWeight:700, letterSpacing:0.5, marginBottom:24,
              }}>
                Narowal Campus
              </div>
              <div style={{
                display:'flex', justifyContent:'center', gap:12, flexWrap:'wrap', marginBottom:32,
              }}>
                {['BS Computer Science','4th Semester Project','Batch 2024','Session 2024–2028'].map((b, idx) => (
                  <span key={idx} style={{
                    background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)',
                    padding:'6px 16px', borderRadius:20,
                    fontSize:12.5, color:'var(--muted)', fontFamily:'var(--B)', fontWeight:600,
                  }}>{b}</span>
                ))}
              </div>
              <p style={{ fontSize:15, color:'var(--muted)', fontFamily:'var(--B)', lineHeight:1.9, maxWidth:520, margin:'0 auto 36px' }}>
                KisanAI was developed as a 4th semester project to demonstrate the practical 
                application of artificial intelligence in solving real-world problems faced 
                by Pakistan's agricultural sector.
              </p>
              <a href="https://github.com/ali0xhamza" target="_blank" rel="noopener noreferrer" className="gh-btn" style={{ margin:'0 auto' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                View Project on GitHub
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section style={{
        padding:'80px 24px', textAlign:'center',
        background:'linear-gradient(160deg,#060301,#0C1808,#1A3528)',
      }}>
        <Reveal>
          <span className="about-tag" style={{ marginBottom:24, display:'inline-block' }}>🌾 KisanAI</span>
          <h2 style={{
            fontFamily:'var(--D)', fontSize:'clamp(32px,5vw,58px)',
            fontWeight:700, color:'var(--text)', letterSpacing:-1.5,
            lineHeight:1.0, margin:'0 0 20px',
          }}>
            Start Using KisanAI Today
          </h2>
          <p style={{ fontSize:16, color:'var(--muted)', fontFamily:'var(--B)', lineHeight:1.9, maxWidth:480, margin:'0 auto 40px' }}>
            14 AI tools, completely free, available in English and Urdu — built for every Pakistani farmer.
          </p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/auth" className="btn-gold">Get Started Free →</Link>
            <Link to="/" className="gh-btn">Back to Home</Link>
          </div>
        </Reveal>
      </section>

    </div>
  )
}