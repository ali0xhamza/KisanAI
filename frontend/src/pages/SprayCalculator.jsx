// frontend/src/pages/SprayCalculator.jsx
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const COMMON_DAWAYEIN = [
  { name: 'Urea',               icon: '🌿', type: 'khaad'  },
  { name: 'DAP',                icon: '🌱', type: 'khaad'  },
  { name: 'Cypermethrin',       icon: '🐛', type: 'keera'  },
  { name: 'Imidacloprid',       icon: '🐛', type: 'keera'  },
  { name: 'Chlorpyrifos',       icon: '🐛', type: 'keera'  },
  { name: 'Mancozeb',           icon: '🍄', type: 'bimari' },
  { name: 'Copper Oxychloride', icon: '🍄', type: 'bimari' },
  { name: 'Glyphosate',         icon: '🌾', type: 'weed'   },
  { name: 'Zinc Sulphate',      icon: '⚗️', type: 'khaad'  },
]

const TYPE_COLORS = {
  khaad:  { bg: '#f0fdf4', color: '#16a34a' },
  keera:  { bg: '#fff7ed', color: '#ea580c' },
  bimari: { bg: '#fef2f2', color: '#dc2626' },
  weed:   { bg: '#fefce8', color: '#ca8a04' },
}

const FASLEN = [
  '🌾 Wheat', '🍚 Rice', '🌽 Maize', '🌿 Cotton',
  '🎋 Sugarcane', '🍅 Tomato', '🥔 Potato', '🌻 Mustard',
]

export default function SprayCalculator() {
  const { user, token } = useAuth()

  const [product,   setProduct]   = useState('')
  const [crop,   setCrop]   = useState(user?.fasal || '')
  const [acres,   setAcres]   = useState(user?.zameen || '1')
  const [issue,   setIssue]   = useState('')
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState(null)
  const [error,   setError]   = useState('')

  const calculate = async () => {
    if (!product.trim())  { setError('Please enter the product name'); return }
    if (!crop.trim()) { setError('Please select a crop');  return }
    if (!acres || parseFloat(acres) <= 0) { setError('Please enter acres'); return }
    setLoading(true); setError(''); setResult(null)
    try {
      const resp = await axios.post(
        `${API}/api/spray/calculate`,
        { dawa: product.trim(), fasal: crop.trim(), acres: parseFloat(acres), masla: issue.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setResult(resp.data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Calculation failed — please try again')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => { setResult(null); setProduct(''); setIssue('') }

  return (
    <div style={{ minHeight:'100vh', background:'#F0F7F0', paddingBottom:100 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#0A1F10,#1B4D2E)', padding:'80px 20px 28px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
          <div style={{ width:46, height:46, borderRadius:14, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, border:'1px solid rgba(255,255,255,0.2)' }}>🧪</div>
          <div>
            <div style={{ color:'white', fontWeight:800, fontSize:17 }}>Spray Calculator</div>
            <div style={{ color:'#86D4A0', fontSize:12, marginTop:2 }}>Enter product name — AI calculates exactly</div>
          </div>
        </div>

        {/* How it works strip */}
        <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:14, padding:'12px 14px' }}>
          <div style={{ color:'#86D4A0', fontSize:11, fontWeight:700, marginBottom:8, letterSpacing:0.5 }}>🧪 HOW IT WORKS</div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {[
              '1️⃣ Enter product name',
              '2️⃣ Tell your crop',
              '3️⃣ Enter acres',
              '4️⃣ AI calculates',
            ].map((s, i) => (
              <div key={i} style={{ background:'rgba(255,255,255,0.1)', borderRadius:20, padding:'4px 10px', fontSize:11, color:'white', fontWeight:500 }}>
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding:'16px' }}>

        {/* ── RESULT ── */}
        {result ? (
          <div style={{ animation:'fadeIn 0.4s ease' }}>
            <div style={{ background:'linear-gradient(135deg,#0A1F10,#1B4D2E)', borderRadius:20, padding:'20px', marginBottom:14, textAlign:'center' }}>
              <div style={{ fontSize:11, fontWeight:800, color:'#86D4A0', letterSpacing:1, marginBottom:8 }}>✅ CALCULATION READY</div>
              <div style={{ color:'white', fontWeight:900, fontSize:18 }}>{result.data.chemical_name
}</div>
              <div style={{ color:'#86D4A0', fontSize:13, marginTop:4 }}>{crop} • {result.acres} Acres</div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
             {[
  { icon:'💊', label:'Dose per Acre',   value: result?.data?.dose_per_acre   || '-', color:'#16a34a' },
  { icon:'📦', label:'Total Product',   value: result?.data?.total_chemical  || '-', color:'#2563eb' },
  { icon:'💧', label:'Water per Acre',  value: result?.data?.water_per_acre  || '-', color:'#0891b2' },
  { icon:'🪣', label:'Total Water',     value: result?.data?.total_water     || '-', color:'#0891b2' },
  { icon:'🔫', label:'Pump Count (15L)',value: result?.data?.pump_count      || '-', color:'#7c3aed' },
  { icon:'💰', label:'Approx. Cost',    value: result?.data?.cost            || '-', color:'#d97706' },
].map(s => (
                <div key={s.label} style={{ background:'white', borderRadius:14, padding:'14px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', border:'1px solid #e5e7eb' }}>
                  <div style={{ fontSize:20, marginBottom:6 }}>{s.icon}</div>
                  <div style={{ fontSize:11, color:'#9ca3af', marginBottom:4 }}>{s.label}</div>
                  <div style={{ fontSize:15, fontWeight:800, color:s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ background:'white', borderRadius:16, padding:'16px', marginBottom:12, boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontWeight:700, fontSize:14, color:'#1B4D2E', marginBottom:12 }}>📋 Important Information</div>
              {[
                { icon:'⏰', label:'Spray Timing', value: result.data.spray_time },
                { icon:'🔄', label:'Repeat Spray', value: result.data.repeat_after    },
                { icon:'⚠️', label:'Safety',        value: result.data.safety     },
              ].map(r => (
                <div key={r.label} style={{ display:'flex', gap:10, padding:'10px 0', borderBottom:'1px solid #f3f4f6', alignItems:'flex-start' }}>
                  <span style={{ fontSize:18, flexShrink:0 }}>{r.icon}</span>
                  <div>
                    <div style={{ fontSize:11, color:'#9ca3af', marginBottom:2 }}>{r.label}</div>
                    <div style={{ fontSize:13, color:'#374151', fontWeight:600 }}>{r.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {result.data.tips?.length > 0 && (
              <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:16, padding:'16px', marginBottom:16 }}>
                <div style={{ fontWeight:700, fontSize:14, color:'#15803d', marginBottom:10 }}>💡 Expert Tips</div>
                {result.data.tips.map((tip, i) => (
                  <div key={i} style={{ display:'flex', gap:8, marginBottom:8, alignItems:'flex-start' }}>
                    <span style={{ color:'#16a34a', fontWeight:800, flexShrink:0 }}>✓</span>
                    <span style={{ fontSize:13, color:'#166534', lineHeight:1.5 }}>{tip}</span>
                  </div>
                ))}
              </div>
            )}

            <button onClick={reset} style={{ width:'100%', padding:'14px', borderRadius:14, border:'none', background:'linear-gradient(135deg,#1B4D2E,#2D7A47)', color:'white', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
              🔄 New Calculation
            </button>
          </div>

        ) : (
          <>
            {/* ── STEP 1: Product Name ── */}
            <div style={card}>
              <div style={secTitle}>1️⃣ Enter Product Name *</div>
              <p style={{ fontSize:12, color:'#6b7280', marginBottom:10, marginTop:-8 }}>
                Any product — pesticide, fertilizer, fungicide — type the name or select from below
              </p>
              <input
                value={product}
                onChange={e => { setProduct(e.target.value); setError('') }}
                placeholder="e.g., Cypermethrin, Urea, Mancozeb, DAP..."
                style={inputStyle}
              />
              <div style={{ fontSize:12, color:'#1B4D2E', fontWeight:700, marginBottom:8 }}>⚡ Quick select:</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {COMMON_DAWAYEIN.map(d => {
                  const tc = TYPE_COLORS[d.type]
                  return (
                    <button key={d.name} onClick={() => setProduct(d.name)} style={{
                      padding:'6px 12px', borderRadius:20,
                      border:`1.5px solid ${product===d.name ? tc.color : '#e5e7eb'}`,
                      background: product===d.name ? tc.bg : 'white',
                      color:      product===d.name ? tc.color : '#6b7280',
                      fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
                    }}>
                      {d.icon} {d.name}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── STEP 2: Crop ── */}
            <div style={card}>
              <div style={secTitle}>2️⃣ Your Crop *</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:10 }}>
                {FASLEN.map(f => (
                  <button key={f} onClick={() => setCrop(f)} style={{
                    padding:'7px 14px', borderRadius:20, border:'none', cursor:'pointer',
                    fontSize:13, fontWeight:600, fontFamily:'inherit',
                    background: crop===f ? 'linear-gradient(135deg,#1B4D2E,#2D7A47)' : '#F0F7F0',
                    color:      crop===f ? 'white' : '#1B4D2E',
                  }}>{f}</button>
                ))}
              </div>
              <input
                value={crop}
                onChange={e => { setCrop(e.target.value); setError('') }}
                placeholder="Or type your own — Onion, Garlic, Sunflower..."
                style={inputStyle}
              />
            </div>

            {/* ── STEP 3: Acres ── */}
            <div style={card}>
              <div style={secTitle}>3️⃣ Land Area (Acres) *</div>
              <input
                type="number" value={acres} min="0.25" step="0.25"
                onChange={e => setAcres(e.target.value)}
                placeholder="e.g., 5"
                style={inputStyle}
              />
              {user?.zameen && (
                <div style={{ fontSize:12, color:'#4a7c59', marginTop:-8, display:'flex', alignItems:'center', gap:6 }}>
                  💡 Your registered land: <b>{user.zameen} acres</b>
                  <button onClick={() => setAcres(user.zameen)} style={{ color:'#16a34a', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:8, padding:'2px 8px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                    Use
                  </button>
                </div>
              )}
            </div>

            {/* ── STEP 4: Problem (Optional) ── */}
            <div style={card}>
              <div style={secTitle}>4️⃣ What is the problem? <span style={{ fontSize:11, color:'#9ca3af', fontWeight:400 }}>(optional)</span></div>
              <p style={{ fontSize:12, color:'#6b7280', marginBottom:10, marginTop:-8 }}>
                Telling us helps the AI give more accurate advice
              </p>
              <input
                value={issue}
                onChange={e => setIssue(e.target.value)}
                placeholder="e.g., aphid attack, yellow leaves, weed control..."
                style={inputStyle}
              />
            </div>

            {error && (
              <div style={{ background:'#FFF0F0', border:'1px solid #FFB3B3', borderRadius:12, padding:'12px 14px', color:'#CC0000', fontSize:13, marginBottom:14 }}>
                ⚠️ {error}
              </div>
            )}

            <button onClick={calculate} disabled={loading} style={{
              width:'100%', padding:'16px', borderRadius:16, border:'none',
              background: loading ? '#ccc' : 'linear-gradient(135deg,#1B4D2E,#2D7A47)',
              color:'white', fontSize:15, fontWeight:700,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily:'inherit',
              display:'flex', alignItems:'center', justifyContent:'center', gap:10,
            }}>
              {loading
                ? <><div style={{ width:20, height:20, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid white', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/> AI is calculating...</>
                : '🧪 Calculate Now'
              }
            </button>

            <p style={{ textAlign:'center', fontSize:11, color:'#9ca3af', marginTop:10 }}>
              🇵🇰 AI calculates exactly based on products available in the Pakistani market.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

const card       = { background:'white', borderRadius:18, padding:'16px', marginBottom:12, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }
const secTitle   = { fontWeight:700, fontSize:14, color:'#1B4D2E', marginBottom:12 }
const inputStyle = { display:'block', width:'100%', padding:'11px 14px', borderRadius:12, border:'1.5px solid #C8EDD6', background:'#F8FFF8', fontSize:14, outline:'none', fontFamily:'inherit', boxSizing:'border-box', marginBottom:12 }