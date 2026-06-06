import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { usePushNotification } from '../hooks/usePushNotification'

const FASLEN = [
  '🌾 Wheat','🍚 Rice','🌽 Maize','🌿 Cotton',
  '🎋 Sugarcane','🫘 Chickpea','🌻 Mustard','🥭 Mango',
  '🍅 Tomato','🥔 Potato','🍌 Banana','🧅 Onion',
  '🧄 Garlic','Other',
]

const MITTI_OPTIONS = [
  { value:'sandy', label:'🏜️ Sandy (Retli) — Light soil' },
  { value:'loamy', label:'🌱 Loamy (Domat) — Best soil'  },
  { value:'clay',  label:'🪨 Clay (Matiyar) — Heavy soil' },
]

const MITTI_LABELS = { sandy:'Sandy', loamy:'Loamy', clay:'Clay' }

function KisanIDCard({ user, cardRef }) {
  const joinYear = user?.created_at ? new Date(user.created_at).getFullYear() : new Date().getFullYear()
  const kisanId  = user?.id ? `KAI-${String(user.id).padStart(4,'0')}` : 'KAI-0000'
  const qrData   = `https://kisanai.pk/farmer/${user?.id || '0'}`
  const qrUrl    = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(qrData)}&color=1B4D2E&bgcolor=f0fdf4`

  return (
    <div ref={cardRef} style={{
      width:'100%', maxWidth:340, margin:'0 auto',
      background:'linear-gradient(145deg,#0A1F10 0%,#1B4D2E 50%,#2D7A47 100%)',
      borderRadius:24, padding:'24px 22px', boxShadow:'0 20px 60px rgba(0,0,0,0.3)',
      fontFamily:'sans-serif', position:'relative', overflow:'hidden',
    }}>
      <div style={{ position:'absolute', top:-30, right:-30, width:120, height:120, borderRadius:'50%', background:'rgba(255,255,255,0.04)' }}/>
      <div style={{ position:'absolute', bottom:-20, left:-20, width:100, height:100, borderRadius:'50%', background:'rgba(255,255,255,0.03)' }}/>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:32, height:32, borderRadius:10, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🌾</div>
          <div>
            <div style={{ color:'white', fontWeight:900, fontSize:15, letterSpacing:0.5 }}>KisanAI</div>
            <div style={{ color:'#86D4A0', fontSize:9, letterSpacing:1, textTransform:'uppercase' }}>Verified Farmer Card</div>
          </div>
        </div>
        <div style={{ background:'rgba(201,168,76,0.2)', border:'1px solid rgba(201,168,76,0.4)', borderRadius:20, padding:'3px 10px', fontSize:10, color:'#f0d080', fontWeight:700 }}>🇵🇰 Pakistan</div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
        <div style={{ width:60, height:60, borderRadius:18, background:'linear-gradient(135deg,#2D7A47,#86D4A0)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, fontWeight:900, color:'white', border:'2px solid rgba(255,255,255,0.2)', flexShrink:0 }}>
          {user?.name?.charAt(0).toUpperCase() || '👨'}
        </div>
        <div>
          <div style={{ color:'white', fontWeight:800, fontSize:18, lineHeight:1.2 }}>{user?.name || 'Farmer'}</div>
          <div style={{ color:'#86D4A0', fontSize:12, marginTop:3 }}>📍 {user?.city || 'Pakistan'}{user?.tehsil ? `, ${user.tehsil}` : ''}</div>
          <div style={{ color:'rgba(255,255,255,0.5)', fontSize:10, marginTop:2 }}>Member Since {joinYear}</div>
        </div>
      </div>
      <div style={{ height:1, background:'rgba(255,255,255,0.1)', marginBottom:16 }}/>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
        {[
          { icon:'🌾', label:'Crop',  value: user?.fasal  || '—' },
          { icon:'🏞️', label:'Land',  value: user?.zameen ? `${user.zameen} Acres` : '—' },
          { icon:'🪨', label:'Soil',  value: user?.mitti  ? MITTI_LABELS[user.mitti] || user.mitti : '—' },
          { icon:'📞', label:'Phone', value: user?.phone  || '—' },
        ].map(f => (
          <div key={f.label} style={{ background:'rgba(255,255,255,0.07)', borderRadius:12, padding:'10px 12px' }}>
            <div style={{ fontSize:9, color:'rgba(255,255,255,0.45)', textTransform:'uppercase', letterSpacing:0.8, marginBottom:4 }}>{f.icon} {f.label}</div>
            <div style={{ color:'white', fontWeight:700, fontSize:12 }}>{f.value}</div>
          </div>
        ))}
      </div>
      <div style={{ height:1, background:'rgba(255,255,255,0.1)', marginBottom:16 }}/>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <div>
          <div style={{ fontSize:9, color:'rgba(255,255,255,0.4)', letterSpacing:1, textTransform:'uppercase', marginBottom:4 }}>Farmer ID</div>
          <div style={{ color:'#c9a84c', fontWeight:900, fontSize:18, letterSpacing:1 }}>{kisanId}</div>
          <div style={{ marginTop:8, display:'flex', alignItems:'center', gap:5, background:'rgba(74,222,128,0.15)', borderRadius:20, padding:'4px 10px', width:'fit-content' }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#4ade80' }}/>
            <span style={{ color:'#4ade80', fontSize:10, fontWeight:700 }}>✅ Verified Farmer</span>
          </div>
        </div>
        <div style={{ background:'#f0fdf4', borderRadius:12, padding:6 }}>
          <img src={qrUrl} alt="QR" width={70} height={70} style={{ display:'block', borderRadius:8 }}/>
          <div style={{ fontSize:8, color:'#4a7c59', textAlign:'center', marginTop:3 }}>Scan</div>
        </div>
      </div>
    </div>
  )
}

export default function Settings() {
  const navigate  = useNavigate()
  const { user, logout, updateProfile, isLoggedIn } = useAuth()
  const { i18n }  = useTranslation()
  const cardRef   = useRef(null)
  const { permission, subscribed, loading: notifLoading, subscribe, unsubscribe } = usePushNotification()

  const [name,   setName]   = useState('')
  const [city,   setCity]   = useState('')
  const [phone,  setPhone]  = useState('')
  const [fasal,  setFasal]  = useState('')
  const [zameen, setZameen] = useState('')
  const [mitti,  setMitti]  = useState('')
  const [tehsil, setTehsil] = useState('')

  const [saved,       setSaved]       = useState(false)
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')
  const [tab,         setTab]         = useState('profile')
  const [downloading, setDownloading] = useState(false)

  const isUrdu = i18n.language === 'ur'

  useEffect(() => {
    if (user) {
      setName(user.name     || '')
      setCity(user.city     || '')
      setPhone(user.phone   || '')
      setFasal(user.fasal   || '')
      setZameen(user.zameen || '')
      setMitti(user.mitti   || '')
      setTehsil(user.tehsil || '')
    }
  }, [user])

  const save = async () => {
    if (!name.trim()) { setError('Name is required!'); return }
    setSaving(true); setError('')
    const result = await updateProfile({ name, city, phone, fasal, zameen, mitti, tehsil })
    setSaving(false)
    if (result.success) { setSaved(true); setTimeout(() => setSaved(false), 2500) }
    else setError(result.error || 'Could not save!')
  }

  const downloadCard = async () => {
    if (!cardRef.current) return
    setDownloading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, { backgroundColor:null, scale:3, useCORS:true, logging:false })
      const link = document.createElement('a')
      link.download = `KisanAI-${user?.name || 'Card'}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch { alert('Download issue — please take a screenshot') }
    finally { setDownloading(false) }
  }

  const shareCard = async () => {
    if (!cardRef.current) return
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, { scale:2, useCORS:true, logging:false })
      canvas.toBlob(async (blob) => {
        if (navigator.share && blob) {
          const file = new File([blob], 'KisanAI-Card.png', { type:'image/png' })
          await navigator.share({ title:'My KisanAI Farmer Card', text:`I'm ${user?.name} — a registered farmer on KisanAI. Join too! 🌾`, files:[file] })
        } else { alert('Download the card and share it on WhatsApp') }
      })
    } catch {}
  }

  const toggleLanguage = () => {
    const newLang = isUrdu ? 'en' : 'ur'
    i18n.changeLanguage(newLang)
    localStorage.setItem('language', newLang)
  }

  const handleLogout = () => { logout(); navigate('/auth') }

  const farmFields = [fasal, zameen, mitti, city]
  const percent    = Math.round((farmFields.filter(Boolean).length / farmFields.length) * 100)

  const menuItems = [
    { icon:'🔬', label:'Disease Detection', to:'/disease'    },
    { icon:'🌤️', label:'Weather',            to:'/weather'    },
    { icon:'🧪', label:'Fertilizer Guide',  to:'/fertilizer' },
    { icon:'💰', label:'Mandi Prices',      to:'/mandi'      },
    { icon:'🌱', label:'Soil Checker',      to:'/soil'       },
    { icon:'📅', label:'Crop Calendar',     to:'/calendar'   },
    { icon:'🌾', label:'Farmer Community',  to:'/community'  },
    { icon:'📊', label:'Expense Tracker',   to:'/expense'    },
  ]

  return (
    <div style={{ minHeight:'100vh', background:'#F0F7F0', paddingBottom:90 }}>
      <style>{`
        .kisan-header { padding-top: 72px !important; }
        @media (min-width: 768px) { .kisan-header { padding-top: 28px !important; } }
      `}</style>

      {/* Header */}
      <div className="kisan-header" style={{ background:'linear-gradient(135deg,#0A1F10,#1B4D2E)', padding:'28px 20px 28px', textAlign:'center' }}>
        <div style={{ width:72, height:72, borderRadius:24, margin:'0 auto 12px', background:'linear-gradient(135deg,#2D7A47,#86D4A0)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, boxShadow:'0 8px 24px rgba(0,0,0,0.2)' }}>
          {user?.name?.charAt(0).toUpperCase() || '👨‍🌾'}
        </div>
        <div style={{ color:'white', fontWeight:800, fontSize:18 }}>{user?.name || 'Farmer'}</div>
        <div style={{ color:'#86D4A0', fontSize:13, marginTop:4 }}>📍 {user?.city || 'Pakistan'} {user?.fasal ? `• 🌾 ${user.fasal}` : ''}</div>
        {isLoggedIn && (
          <div style={{ marginTop:14, background:'rgba(255,255,255,0.1)', borderRadius:12, padding:'10px 16px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#86D4A0', marginBottom:6 }}>
              <span>Profile Complete</span><span style={{ fontWeight:700 }}>{percent}%</span>
            </div>
            <div style={{ height:6, background:'rgba(255,255,255,0.15)', borderRadius:999, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${percent}%`, background:'linear-gradient(90deg,#4ade80,#86D4A0)', borderRadius:999, transition:'width 0.5s ease' }}/>
            </div>
            {percent < 100 && <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', marginTop:6 }}>Fill crop, land, soil, and city — AI will give better advice</div>}
          </div>
        )}
        {user?.role === 'admin' && (
          <div style={{ marginTop:8 }}>
            <span style={{ background:'rgba(233,30,99,0.3)', color:'#ff80ab', borderRadius:20, padding:'4px 14px', fontSize:12, fontWeight:700, border:'1px solid rgba(233,30,99,0.4)' }}>👑 Admin</span>
          </div>
        )}
      </div>

      <div style={{ padding:'16px' }}>
        {!isLoggedIn && (
          <div style={{ background:'#FEF3C7', border:'1px solid #FDE68A', borderRadius:16, padding:'16px', marginBottom:14, textAlign:'center' }}>
            <div style={{ fontSize:24, marginBottom:8 }}>🔐</div>
            <div style={{ fontSize:14, fontWeight:600, color:'#92400E', marginBottom:10 }}>Login to view profile</div>
            <button onClick={() => navigate('/auth')} style={{ padding:'10px 24px', background:'linear-gradient(135deg,#1B4D2E,#2D7A47)', color:'white', border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer' }}>Login / Register</button>
          </div>
        )}

        {isLoggedIn && (
          <>
            <div style={{ display:'flex', gap:8, marginBottom:14 }}>
              {[{key:'profile',label:'👤 Profile'},{key:'farm',label:'🌾 Crop'},{key:'idcard',label:'🪪 ID Card'}].map(t => (
                <button key={t.key} onClick={() => setTab(t.key)} style={{ flex:1, padding:'10px 4px', borderRadius:12, border:'none', background:tab===t.key?'linear-gradient(135deg,#1B4D2E,#2D7A47)':'white', color:tab===t.key?'white':'#1B4D2E', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>{t.label}</button>
              ))}
            </div>

            {error && <div style={{ background:'#FFF0F0', border:'1px solid #FFB3B3', borderRadius:10, padding:'10px 14px', color:'#CC0000', fontSize:13, marginBottom:12 }}>❌ {error}</div>}

            {tab === 'profile' && (
              <div style={{ background:'white', borderRadius:20, padding:'18px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', marginBottom:14 }}>
                <div style={{ fontWeight:700, fontSize:14, color:'#1B4D2E', marginBottom:14 }}>👤 Personal Info</div>
                {[
                  {label:'Name *',  value:name,  set:setName,  placeholder:'Your name'},
                  {label:'City',    value:city,  set:setCity,  placeholder:'Your city'},
                  {label:'Phone',   value:phone, set:setPhone, placeholder:'03XX-XXXXXXX'},
                ].map(f => (
                  <div key={f.label} style={{ marginBottom:12 }}>
                    <label style={labelStyle}>{f.label}</label>
                    <input value={f.value} onChange={e=>{f.set(e.target.value);setError('')}} placeholder={f.placeholder} style={inputStyle}/>
                  </div>
                ))}
                <div style={{ marginBottom:16 }}>
                  <label style={labelStyle}>Email (Cannot change)</label>
                  <input value={user?.email||''} readOnly style={{...inputStyle,background:'#F5F5F5',color:'#999'}}/>
                </div>
                <button onClick={save} disabled={saving} style={saveBtnStyle(saved,saving)}>
                  {saving?'⏳ Saving...':saved?'✅ Saved!':'💾 Save'}
                </button>
              </div>
            )}

            {tab === 'farm' && (
              <div style={{ background:'white', borderRadius:20, padding:'18px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', marginBottom:14 }}>
                <div style={{ fontWeight:700, fontSize:14, color:'#1B4D2E', marginBottom:4 }}>🌾 My Crop Info</div>
                <p style={{ fontSize:12, color:'#4a7c59', marginBottom:16 }}>Fill this info — AI will give advice tailored to your crop</p>
                <div style={{ marginBottom:14 }}>
                  <label style={labelStyle}>Main Crop</label>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {FASLEN.map(f => (
                      <button key={f} onClick={()=>setFasal(f)} style={{ padding:'7px 14px', borderRadius:20, border:'none', cursor:'pointer', fontSize:13, fontWeight:600, fontFamily:'inherit', background:fasal===f?'linear-gradient(135deg,#1B4D2E,#2D7A47)':'#F0F7F0', color:fasal===f?'white':'#1B4D2E' }}>{f}</button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom:14 }}>
                  <label style={labelStyle}>Soil Type</label>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {MITTI_OPTIONS.map(o => (
                      <button key={o.value} onClick={()=>setMitti(o.value)} style={{ padding:'10px 14px', borderRadius:12, border:'none', cursor:'pointer', fontSize:13, fontWeight:600, fontFamily:'inherit', textAlign:'left', background:mitti===o.value?'linear-gradient(135deg,#1B4D2E,#2D7A47)':'#F0F7F0', color:mitti===o.value?'white':'#1B4D2E' }}>{o.label}</button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom:14 }}>
                  <label style={labelStyle}>Land Area (Acres)</label>
                  <input type="number" value={zameen} onChange={e=>setZameen(e.target.value)} placeholder="e.g., 5" min="0.5" step="0.5" style={inputStyle}/>
                </div>
                <div style={{ marginBottom:16 }}>
                  <label style={labelStyle}>Tehsil / Area</label>
                  <input value={tehsil} onChange={e=>setTehsil(e.target.value)} placeholder="e.g., Chunian, Okara..." style={inputStyle}/>
                </div>
                <button onClick={save} disabled={saving} style={saveBtnStyle(saved,saving)}>
                  {saving?'⏳ Saving...':saved?'✅ Saved!':'💾 Save Crop Info'}
                </button>
              </div>
            )}

            {tab === 'idcard' && (
              <div style={{ marginBottom:14 }}>
                <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:14, padding:'12px 14px', marginBottom:16, fontSize:13, color:'#15803d' }}>
                  🪪 This is your digital Kisan ID Card — download and share on WhatsApp!
                </div>
                {percent < 75 && (
                  <div style={{ background:'#FEF3C7', border:'1px solid #FDE68A', borderRadius:12, padding:'10px 14px', marginBottom:14, fontSize:12, color:'#92400E' }}>
                    ⚠️ Fill more details in "🌾 Crop" tab for a richer card
                  </div>
                )}
                <KisanIDCard user={user} cardRef={cardRef}/>
                <div style={{ display:'flex', gap:10, marginTop:16 }}>
                  <button onClick={downloadCard} disabled={downloading} style={{ flex:1, padding:'13px', borderRadius:14, border:'none', background:downloading?'#ccc':'linear-gradient(135deg,#1B4D2E,#2D7A47)', color:'white', fontWeight:700, fontSize:14, cursor:downloading?'not-allowed':'pointer', fontFamily:'inherit' }}>
                    {downloading?'⏳ Generating...':'⬇️ Download'}
                  </button>
                  <button onClick={shareCard} style={{ flex:1, padding:'13px', borderRadius:14, border:'none', background:'linear-gradient(135deg,#25D366,#128C7E)', color:'white', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'inherit' }}>
                    📤 Share
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── App Settings ─────────────────────────────────────── */}
        <div style={{ background:'white', borderRadius:20, padding:'18px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', marginBottom:14 }}>
          <div style={{ fontWeight:700, fontSize:14, color:'#1B4D2E', marginBottom:14 }}>⚙️ App Settings</div>

          {/* Language Toggle */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid #F0F7F0' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:22 }}>🌐</span>
              <div>
                <div style={{ fontWeight:600, fontSize:13, color:'#1a1a1a' }}>Language</div>
                <div style={{ fontSize:11, color:'#888', marginTop:2 }}>{isUrdu ? 'اردو فعال ہے' : 'English is active'}</div>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
  <button disabled style={{
    padding:'8px 18px', borderRadius:20,
    border:'1.5px solid #ccc',
    background:'#f5f5f5',
    color:'#aaa',
    fontWeight:700, fontSize:13,
    cursor:'not-allowed',
    fontFamily:'inherit',
    opacity:0.65,
    pointerEvents:'none',
  }}>
    اردو
  </button>
  <span style={{
    fontSize:11, color:'#16a34a', fontWeight:700,
    background:'#dcfce7', padding:'2px 8px', borderRadius:10,
  }}>
    Coming Soon
  </span>
</div>
          </div>

          {/* Notifications Toggle */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:22 }}>🔔</span>
              <div>
                <div style={{ fontWeight:600, fontSize:13, color:'#1a1a1a' }}>Notifications</div>
                <div style={{ fontSize:11, color: subscribed ? '#16A34A' : '#888', marginTop:2 }}>
                  {subscribed ? '✅ Enabled — mandi, weather alerts' : 'Get farming alerts'}
                </div>
              </div>
            </div>
            <button
              onClick={subscribed ? unsubscribe : subscribe}
              disabled={notifLoading}
              style={{
                padding:'8px 18px', borderRadius:20,
                border:'1.5px solid',
                borderColor: subscribed ? '#DC2626' : '#1B4D2E',
                background: subscribed ? 'rgba(220,38,38,0.08)' : 'linear-gradient(135deg,#1B4D2E,#2D7A47)',
                color: subscribed ? '#DC2626' : 'white',
                fontWeight:700, fontSize:13,
                cursor: notifLoading ? 'not-allowed' : 'pointer',
                opacity: notifLoading ? 0.6 : 1,
                fontFamily:'inherit',
              }}
            >
              {notifLoading ? '...' : subscribed ? 'Turn Off' : 'Enable'}
            </button>
          </div>
        </div>

        {user?.role === 'admin' && (
          <button onClick={() => navigate('/admin')} style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'16px 18px', borderRadius:16, border:'1px solid rgba(233,30,99,0.3)', background:'rgba(233,30,99,0.08)', cursor:'pointer', fontFamily:'inherit', marginBottom:14 }}>
            <span style={{ fontSize:24 }}>🛡️</span>
            <span style={{ fontWeight:700, fontSize:14, color:'#e91e63', flex:1, textAlign:'left' }}>Admin Panel</span>
            <span style={{ color:'#e91e63', fontSize:16 }}>›</span>
          </button>
        )}

        {/* Quick Links */}
        <div style={{ background:'white', borderRadius:20, padding:'18px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', marginBottom:14 }}>
          <div style={{ fontWeight:700, fontSize:14, color:'#1B4D2E', marginBottom:12 }}>🚀 Quick Links</div>
          {menuItems.map(item => (
            <button key={item.to} onClick={() => navigate(item.to)} style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:12, border:'none', background:'#F8FFF8', cursor:'pointer', fontFamily:'inherit', marginBottom:8 }}>
              <span style={{ fontSize:20 }}>{item.icon}</span>
              <span style={{ fontWeight:600, fontSize:13, color:'#1B4D2E', flex:1, textAlign:'left' }}>{item.label}</span>
              <span style={{ color:'#999', fontSize:16 }}>›</span>
            </button>
          ))}
        </div>

        {/* App Info */}
        <div style={{ background:'white', borderRadius:20, padding:'18px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', marginBottom:14 }}>
          <div style={{ fontWeight:700, fontSize:14, color:'#1B4D2E', marginBottom:12 }}>ℹ️ App Info</div>
          {[
            {label:'Version',   value:'v2.0.0 (Phase 2)'},
            {label:'AI Model',  value:'Llama 3.3 (Groq)'},
            {label:'Backend',   value:'FastAPI + PostgreSQL'},
            {label:'Auth',      value:'JWT Tokens'},
            {label:'Weather',   value:'OpenWeatherMap'},
            {label:'Made for',  value:'Pakistani Farmers 🇵🇰'},
          ].map(i => (
            <div key={i.label} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #F0F7F0' }}>
              <span style={{ fontSize:13, color:'#666' }}>{i.label}</span>
              <span style={{ fontSize:13, fontWeight:600, color:'#1B4D2E' }}>{i.value}</span>
            </div>
          ))}
        </div>

        {isLoggedIn && (
          <button onClick={handleLogout} style={{ width:'100%', padding:'14px', borderRadius:16, border:'none', background:'linear-gradient(135deg,#DC2626,#F87171)', color:'white', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 14px rgba(220,38,38,0.3)' }}>
            🚪 Logout
          </button>
        )}
        <div style={{ textAlign:'center', marginTop:16, color:'#bbb', fontSize:11 }}>
          KisanAI v2.0 – Made with ❤️ for Pakistani Farmers 🇵🇰
        </div>
      </div>
    </div>
  )
}

const labelStyle   = { fontSize:12, fontWeight:700, color:'#1B4D2E', display:'block', marginBottom:6 }
const inputStyle   = { width:'100%', padding:'11px 14px', borderRadius:12, border:'1.5px solid #C8EDD6', background:'#F8FFF8', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }
const saveBtnStyle = (saved, saving) => ({
  width:'100%', padding:'13px', borderRadius:14, border:'none',
  background: saved ? 'linear-gradient(135deg,#16A34A,#4ADE80)' : saving ? '#ccc' : 'linear-gradient(135deg,#1B4D2E,#2D7A47)',
  color:'white', fontSize:14, fontWeight:700,
  cursor: saving ? 'not-allowed' : 'pointer',
  fontFamily:'inherit', boxShadow:'0 4px 14px rgba(27,77,46,0.3)', transition:'all 0.3s',
})