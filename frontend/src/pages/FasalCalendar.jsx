// src/pages/FasalCalendar.jsx
import { useState } from 'react'
import { aiAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const FASALS = [
  { name: 'Wheat', season: 'Rabi', icon: '🌾' },
  { name: 'Rice', season: 'Kharif', icon: '🍚' },
  { name: 'Sugarcane', season: 'All year', icon: '🎋' },
  { name: 'Cotton', season: 'Kharif', icon: '🌿' },
  { name: 'Maize', season: 'Kharif/Rabi', icon: '🌽' },
  { name: 'Mustard', season: 'Rabi', icon: '🌻' },
  { name: 'Tomato', season: 'All year', icon: '🍅' },
  { name: 'Potato', season: 'Rabi', icon: '🥔' },
  { name: 'Onion', season: 'Rabi', icon: '🧅' },
  { name: 'Chilli', season: 'Kharif', icon: '🌶️' },
  { name: 'Eggplant', season: 'Kharif', icon: '🍆' },
  { name: 'Moong Dal', season: 'Kharif', icon: '🫘' },
  { name: 'Lentil', season: 'Rabi', icon: '🫘' },
  { name: 'Peas', season: 'Rabi', icon: '🫛' },
  { name: 'Mango', season: 'Summer', icon: '🥭' },
  { name: 'Kinnow', season: 'Winter', icon: '🍊' },
  { name: 'Guava', season: 'All year', icon: '🍈' },
  { name: 'Sunflower', season: 'Kharif', icon: '🌻' },
  { name: 'Peanut', season: 'Kharif', icon: '🥜' },
  { name: 'Garlic', season: 'Rabi', icon: '🧄' },
]

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const ZONES = [
  'Punjab (North)', 'Punjab (South)', 'Sindh', 'KPK', 'Balochistan', 'AJK'
]

export default function FasalCalendar() {
  const { isLoggedIn } = useAuth()
  const [fasal, setFasal]       = useState('')
  const [month, setMonth]       = useState(MONTHS[new Date().getMonth()])
  const [zone, setZone]         = useState('Punjab (North)')
  const [result, setResult]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [activeTab, setActiveTab] = useState('calendar')

  async function getCalendar() {
    if (!fasal) { setError('Please select a crop!'); return }
    if (!isLoggedIn) { setError('Please login for calendar!'); return }
    setLoading(true)
    setResult(null)
    setError('')

    try {
      const prompt = `Give me the farming calendar for ${fasal} in ${zone}.
Current month is ${month}.

Please provide:
📅 SOWING TIME: (which month to sow)
🌱 NURSERY/TRANSPLANT: (if needed)
💧 IRRIGATION SCHEDULE: (frequency and amount)
🧪 FERTILIZER SCHEDULE: (which fertilizer in which month)
🌿 SPRAY SCHEDULE: (which spray at what time)
✂️ PRUNING/WEEDING: (weeding and pruning time)
🌾 HARVEST TIME: (when to harvest)
⚠️ IMPORTANT ACTIVITIES FOR THIS MONTH: (what to do in ${month})
📊 FULL TIMELINE: (from start to harvest)

Give a month-by-month guide in simple English.`

      const reply = await aiAPI.chat([{ role: 'user', content: prompt }])
      setResult({ text: reply, fasal, month, zone })
    } catch (err) {
      if (err.response?.status === 401) setError('Please login')
      else if (err.response?.status === 429) setError('Please wait and try again')
      else setError('Something went wrong — please try again')
    } finally {
      setLoading(false)
    }
  }

  async function getMonthlyAdvice() {
    if (!isLoggedIn) { setError('Please login!'); return }
    setLoading(true)
    setResult(null)
    setError('')

    try {
      const reply = await aiAPI.chat([{
        role: 'user',
        content: `Give me a farming calendar and advice for the month of ${month} in ${zone}.

Please include:
🌾 WHICH CROPS TO SOW THIS MONTH: (list)
✅ ESSENTIAL TASKS FOR THIS MONTH: (checklist)
💧 WATERING SCHEDULE: (general advice)
🧪 FERTILIZER: (which fertilizer to apply this month)
🌿 SPRAY: (which spray to apply)
⚠️ CAUTIONS: (what NOT to do this month)
🌡️ WEATHER PREPARATIONS: (weather conditions and preparations)

Give practical and detailed advice in simple English.`
      }])
      setResult({ text: reply, fasal: 'Monthly Guide', month, zone })
    } catch {
      setError('Something went wrong — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#F0F7F0', paddingBottom:90 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#0A1F10,#1B4D2E)', padding:'52px 20px 24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:46, height:46, borderRadius:14, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, border:'1px solid rgba(255,255,255,0.2)' }}>📅</div>
          <div>
            <div style={{ color:'white', fontWeight:800, fontSize:17 }}>Fasal Calendar</div>
            <div style={{ color:'#86D4A0', fontSize:12, marginTop:2 }}>Full crop schedule from AI</div>
          </div>
        </div>
      </div>

      <div style={{ padding:'20px 16px' }}>

        {!isLoggedIn && (
          <div style={{ background:'#FEF3C7', border:'1px solid #FDE68A', borderRadius:14, padding:'12px 16px', marginBottom:14, display:'flex', gap:8 }}>
            <span>⚠️</span>
            <span style={{ fontSize:13, color:'#92400E', fontWeight:600 }}>Login required for calendar</span>
          </div>
        )}

        {error && (
          <div style={{ background:'#FFF0F0', border:'1px solid #FFB3B3', borderRadius:12, padding:'10px 14px', color:'#CC0000', fontSize:13, marginBottom:14 }}>❌ {error}</div>
        )}

        {/* Tabs */}
        <div style={{ display:'flex', background:'white', borderRadius:14, padding:4, marginBottom:16, border:'1px solid #C8EDD6', gap:4 }}>
          {[{ k:'calendar', label:'🌾 Crop Calendar' }, { k:'monthly', label:'📅 Monthly Guide' }].map(t => (
            <button key={t.k} onClick={() => setActiveTab(t.k)} style={{ flex:1, padding:'10px', borderRadius:10, border:'none', cursor:'pointer', fontWeight:700, fontSize:13, fontFamily:'inherit', background: activeTab === t.k ? 'linear-gradient(135deg,#1B4D2E,#2D7A47)' : 'transparent', color: activeTab === t.k ? 'white' : '#5A8A6A' }}>{t.label}</button>
          ))}
        </div>

        {/* Zone + Month */}
        <div style={{ background:'white', borderRadius:18, padding:'16px', marginBottom:12, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight:700, fontSize:14, color:'#1B4D2E', marginBottom:12 }}>📍 Your Zone and Month</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div>
              <label style={{ fontSize:12, fontWeight:700, color:'#1B4D2E', display:'block', marginBottom:6 }}>Zone</label>
              <select value={zone} onChange={e => setZone(e.target.value)} style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1.5px solid #C8EDD6', background:'#F8FFF8', fontSize:13, outline:'none', fontFamily:'inherit' }}>
                {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:700, color:'#1B4D2E', display:'block', marginBottom:6 }}>Month</label>
              <select value={month} onChange={e => setMonth(e.target.value)} style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1.5px solid #C8EDD6', background:'#F8FFF8', fontSize:13, outline:'none', fontFamily:'inherit' }}>
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Crop Calendar Tab */}
        {activeTab === 'calendar' && (
          <>
            <div style={{ background:'white', borderRadius:18, padding:'16px', marginBottom:12, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ fontWeight:700, fontSize:14, color:'#1B4D2E', marginBottom:12 }}>🌾 Select Crop *</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {FASALS.map(f => (
                  <button key={f.name} onClick={() => { setFasal(f.name); setError('') }} style={{ padding:'10px 12px', borderRadius:12, border:'none', cursor:'pointer', fontFamily:'inherit', textAlign:'left', background: fasal === f.name ? 'linear-gradient(135deg,#1B4D2E,#2D7A47)' : '#F0F7F0', color: fasal === f.name ? 'white' : '#1B4D2E' }}>
                    <div style={{ fontWeight:700, fontSize:13 }}>{f.icon} {f.name}</div>
                    <div style={{ fontSize:10, opacity:0.7, marginTop:2 }}>{f.season}</div>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={getCalendar} disabled={!fasal || loading || !isLoggedIn} style={{ width:'100%', padding:'15px', borderRadius:16, border:'none', background: (!fasal || loading || !isLoggedIn) ? '#ccc' : 'linear-gradient(135deg,#1B4D2E,#2D7A47)', color:'white', fontSize:15, fontWeight:700, cursor: (!fasal || loading || !isLoggedIn) ? 'not-allowed' : 'pointer', fontFamily:'inherit', marginBottom:16, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              {loading ? <><div style={{ width:18, height:18, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid white', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />Preparing calendar...</> : '📅 Get Crop Calendar'}
            </button>
          </>
        )}

        {/* Monthly Guide Tab */}
        {activeTab === 'monthly' && (
          <button onClick={getMonthlyAdvice} disabled={loading || !isLoggedIn} style={{ width:'100%', padding:'15px', borderRadius:16, border:'none', background: (loading || !isLoggedIn) ? '#ccc' : 'linear-gradient(135deg,#1B4D2E,#2D7A47)', color:'white', fontSize:15, fontWeight:700, cursor: (loading || !isLoggedIn) ? 'not-allowed' : 'pointer', fontFamily:'inherit', marginBottom:16, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            {loading ? <><div style={{ width:18, height:18, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid white', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />Preparing guide...</> : `📅 Farming Guide for ${month}`}
          </button>
        )}

        {/* Result */}
        {result && (
          <div style={{ background:'white', borderRadius:18, padding:'20px', boxShadow:'0 4px 20px rgba(27,77,46,0.12)', border:'1.5px solid #C8EDD6', animation:'fadeIn 0.4s ease' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#1B4D2E,#2D7A47)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>📅</div>
              <div>
                <div style={{ fontWeight:800, fontSize:14, color:'#1B4D2E' }}>{result.fasal}</div>
                <div style={{ fontSize:11, color:'#999' }}>{result.zone} • {result.month}</div>
              </div>
            </div>
            <div style={{ background:'#F8FFF8', borderRadius:14, padding:'14px', fontSize:13, lineHeight:1.8, color:'#1a1a1a', border:'1px solid #E8F4E8', whiteSpace:'pre-wrap' }}>
              {result.text}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}