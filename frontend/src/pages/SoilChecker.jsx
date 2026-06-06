// src/pages/SoilChecker.jsx
import { useState } from 'react'
import { aiAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const PH_LEVELS = [
  { value: '4.0-5.0', label: '4.0-5.0', desc: 'Very acidic', color: '#DC2626' },
  { value: '5.0-6.0', label: '5.0-6.0', desc: 'Acidic', color: '#F59E0B' },
  { value: '6.0-7.0', label: '6.0-7.0', desc: 'Ideal (Fertile)', color: '#16A34A' },
  { value: '7.0-8.0', label: '7.0-8.0', desc: 'Slightly Alkaline', color: '#3B82F6' },
  { value: '8.0-9.0', label: '8.0-9.0', desc: 'Alkaline', color: '#8B5CF6' },
  { value: 'Unknown', label: 'Unknown', desc: 'AI will estimate', color: '#6B7280' },
]

const SOIL_TYPES = [
  { value: 'Sandy', label: '🏜️ Sandy', desc: 'Water drains quickly' },
  { value: 'Clay', label: '🧱 Clay', desc: 'Retains water' },
  { value: 'Loamy', label: '🌱 Loamy', desc: 'Best soil' },
  { value: 'Silty', label: '💧 Silty', desc: 'Soft and smooth' },
  { value: 'Sandy Loam', label: '🌾 Sandy Loam', desc: 'Good drainage' },
  { value: 'Clay Loam', label: '🟤 Clay Loam', desc: 'Holds water' },
  { value: 'Unknown', label: '❓ Unknown', desc: 'AI will estimate' },
]

const MOISTURE = [
  { value: 'Very dry', label: '🏜️ Very Dry' },
  { value: 'Slightly dry', label: '😐 Slightly Dry' },
  { value: 'Ideal moisture', label: '✅ Ideal Moisture' },
  { value: 'High moisture', label: '💧 High Moisture' },
  { value: 'Very wet', label: '🌊 Very Wet' },
]

const ISSUES = [
  'Crop is turning yellow', 'Leaves are wilting',
  'Plant is not growing', 'Spots on leaves',
  'Roots are weak', 'Fruits are small',
  'Soil has become compact', 'Salinity issue',
  'Pests in soil', 'No issue'
]

const CROPS_FOR_SOIL = [
  'Wheat', 'Rice', 'Sugarcane', 'Cotton', 'Maize',
  'Tomato', 'Potato', 'Onion', 'Mustard', 'Peanut',
  'Mango', 'Kinnow', 'Guava', 'Vegetables', 'Pulses'
]

export default function SoilChecker() {
  const { isLoggedIn } = useAuth()
  const [ph, setPh]           = useState('')
  const [soilType, setSoilType] = useState('')
  const [moisture, setMoisture] = useState('')
  const [issues, setIssues]   = useState([])
  const [crop, setCrop]       = useState('')
  const [area, setArea]       = useState('')
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  function toggleIssue(issue) {
    setIssues(prev =>
      prev.includes(issue) ? prev.filter(i => i !== issue) : [...prev, issue]
    )
  }

  async function checkSoil() {
    if (!soilType || !moisture) { setError('Soil type and moisture details are required!'); return }
    if (!isLoggedIn) { setError('Please login for soil check!'); return }
    setLoading(true)
    setResult(null)
    setError('')

    try {
      const prompt = `My land details:
- Soil type: ${soilType}
- pH level: ${ph || 'Unknown'}
- Moisture: ${moisture}
- Issues: ${issues.length > 0 ? issues.join(', ') : 'No specific issues'}
- Crop: ${crop || 'General'}
- Area: ${area ? area + ' acre' : 'Not specified'}

Please tell me:
🔬 SOIL CONDITION: (assessment)
⚠️ PROBLEMS: (what issues exist)
💊 SOLUTION: (what should be done)
🌱 BEST CROPS: (which crops are suitable for this soil)
🧪 FERTILIZER GUIDE: (which fertilizer to apply)
💧 WATER: (how much and when to irrigate)
📈 IMPROVEMENT TIPS: (long term improvement)

Give a practical guide in simple English.`

      const reply = await aiAPI.chat([{ role: 'user', content: prompt }])
      setResult({ text: reply, soilType, ph })
    } catch (err) {
      if (err.response?.status === 401) setError('Please login')
      else if (err.response?.status === 429) setError('Please wait and try again')
      else setError('Something went wrong — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#F0F7F0', paddingBottom:90 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div className="kisan-header" style={{ background:'linear-gradient(135deg,#0A1F10,#1B4D2E)', padding:'16px 20px 24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:46, height:46, borderRadius:14, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, border:'1px solid rgba(255,255,255,0.2)' }}>🌱</div>
          <div>
            <div style={{ color:'white', fontWeight:800, fontSize:17 }}>Soil Health Checker</div>
            <div style={{ color:'#86D4A0', fontSize:12, marginTop:2 }}>Check your soil health with AI</div>
          </div>
        </div>
      </div>

      <div style={{ padding:'20px 16px' }}>

        {!isLoggedIn && (
          <div style={{ background:'#FEF3C7', border:'1px solid #FDE68A', borderRadius:14, padding:'12px 16px', marginBottom:14, display:'flex', gap:8 }}>
            <span>⚠️</span>
            <span style={{ fontSize:13, color:'#92400E', fontWeight:600 }}>Login required for soil check</span>
          </div>
        )}

        {error && (
          <div style={{ background:'#FFF0F0', border:'1px solid #FFB3B3', borderRadius:12, padding:'10px 14px', color:'#CC0000', fontSize:13, marginBottom:14 }}>❌ {error}</div>
        )}

        {/* Soil Type */}
        <div style={{ background:'white', borderRadius:18, padding:'16px', marginBottom:12, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight:700, fontSize:14, color:'#1B4D2E', marginBottom:12 }}>1️⃣ Soil Type *</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {SOIL_TYPES.map(s => (
              <button key={s.value} onClick={() => { setSoilType(s.value); setError('') }} style={{ padding:'10px 12px', borderRadius:12, border:'none', cursor:'pointer', fontFamily:'inherit', textAlign:'left', background: soilType === s.value ? 'linear-gradient(135deg,#1B4D2E,#2D7A47)' : '#F0F7F0', color: soilType === s.value ? 'white' : '#1B4D2E' }}>
                <div style={{ fontWeight:700, fontSize:13 }}>{s.label}</div>
                <div style={{ fontSize:11, opacity:0.7, marginTop:2 }}>{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* pH Level */}
        <div style={{ background:'white', borderRadius:18, padding:'16px', marginBottom:12, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight:700, fontSize:14, color:'#1B4D2E', marginBottom:12 }}>2️⃣ pH Level (Optional)</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {PH_LEVELS.map(p => (
              <button key={p.value} onClick={() => setPh(p.value)} style={{ padding:'8px 14px', borderRadius:20, border:`2px solid ${ph === p.value ? p.color : '#E8F4E8'}`, cursor:'pointer', fontFamily:'inherit', background: ph === p.value ? p.color : '#F8FFF8', color: ph === p.value ? 'white' : '#1a1a1a', fontSize:12, fontWeight:700 }}>
                {p.label} <span style={{ fontSize:10, opacity:0.8 }}>({p.desc})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Moisture */}
        <div style={{ background:'white', borderRadius:18, padding:'16px', marginBottom:12, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight:700, fontSize:14, color:'#1B4D2E', marginBottom:12 }}>3️⃣ Soil Moisture *</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {MOISTURE.map(m => (
              <button key={m.value} onClick={() => { setMoisture(m.value); setError('') }} style={{ padding:'8px 16px', borderRadius:20, border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:13, background: moisture === m.value ? 'linear-gradient(135deg,#1B4D2E,#2D7A47)' : '#F0F7F0', color: moisture === m.value ? 'white' : '#1B4D2E' }}>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Issues */}
        <div style={{ background:'white', borderRadius:18, padding:'16px', marginBottom:12, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight:700, fontSize:14, color:'#1B4D2E', marginBottom:12 }}>4️⃣ Any Issues? (Multiple select)</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {ISSUES.map(issue => (
              <button key={issue} onClick={() => toggleIssue(issue)} style={{ padding:'7px 14px', borderRadius:20, border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:12, background: issues.includes(issue) ? '#DC2626' : '#F0F7F0', color: issues.includes(issue) ? 'white' : '#1B4D2E' }}>
                {issue}
              </button>
            ))}
          </div>
        </div>

        {/* Crop + Area */}
        <div style={{ background:'white', borderRadius:18, padding:'16px', marginBottom:12, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight:700, fontSize:14, color:'#1B4D2E', marginBottom:12 }}>5️⃣ Additional (Optional)</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div>
              <label style={{ fontSize:12, fontWeight:700, color:'#1B4D2E', display:'block', marginBottom:6 }}>Crop</label>
              <select value={crop} onChange={e => setCrop(e.target.value)} style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1.5px solid #C8EDD6', background:'#F8FFF8', fontSize:13, outline:'none', fontFamily:'inherit' }}>
                <option value="">-- Select --</option>
                {CROPS_FOR_SOIL.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:700, color:'#1B4D2E', display:'block', marginBottom:6 }}>Land Area (Acre)</label>
              <input type="number" value={area} onChange={e => setArea(e.target.value)} placeholder="e.g. 2" style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1.5px solid #C8EDD6', background:'#F8FFF8', fontSize:13, outline:'none', fontFamily:'inherit', boxSizing:'border-box' }} />
            </div>
          </div>
        </div>

        {/* Button */}
        <button onClick={checkSoil} disabled={!soilType || !moisture || loading || !isLoggedIn} style={{
          width:'100%', padding:'15px', borderRadius:16, border:'none',
          background: (!soilType || !moisture || loading || !isLoggedIn) ? '#ccc' : 'linear-gradient(135deg,#1B4D2E,#2D7A47)',
          color:'white', fontSize:15, fontWeight:700,
          cursor: (!soilType || !moisture || loading || !isLoggedIn) ? 'not-allowed' : 'pointer',
          fontFamily:'inherit', marginBottom:16,
          display:'flex', alignItems:'center', justifyContent:'center', gap:8
        }}>
          {loading ? (
            <><div style={{ width:18, height:18, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid white', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />AI is analyzing...</>
          ) : '🌱 Check Soil Health'}
        </button>

        {/* Result */}
        {result && (
          <div style={{ background:'white', borderRadius:18, padding:'20px', boxShadow:'0 4px 20px rgba(27,77,46,0.12)', border:'1.5px solid #C8EDD6', animation:'fadeIn 0.4s ease' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#1B4D2E,#2D7A47)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🌱</div>
              <div>
                <div style={{ fontWeight:800, fontSize:14, color:'#1B4D2E' }}>Soil Health Report</div>
                <div style={{ fontSize:11, color:'#999' }}>{result.soilType} {result.ph ? `• pH ${result.ph}` : ''}</div>
              </div>
            </div>
            <div style={{ background:'#F8FFF8', borderRadius:14, padding:'14px', fontSize:13, lineHeight:1.8, color:'#1a1a1a', border:'1px solid #E8F4E8', whiteSpace:'pre-wrap' }}>
              {result.text}
            </div>
            <div style={{ marginTop:12, padding:'10px 14px', background:'#FEF3C7', borderRadius:12, fontSize:12, color:'#92400E', border:'1px solid #FDE68A' }}>
              ⚠️ For accurate results, get your soil tested at a lab.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}