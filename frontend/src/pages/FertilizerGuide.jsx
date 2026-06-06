// src/pages/FertilizerGuide.jsx
import { useState } from 'react'
import { aiAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const FASALS = [
  'Wheat', 'Rice', 'Sugarcane', 'Cotton',
  'Maize', 'Mustard', 'Sunflower', 'Moong Dal',
  'Masoor Dal', 'Tomato', 'Potato', 'Onion', 'Chilli', 'Eggplant',
  'Carrot', 'Peas', 'Spinach', 'Tinda', 'Tori', 'Kadu',
  'Mango', 'Kinnow', 'Guava', 'Banana',
  'Peanut', 'Sesame', 'Garlic', 'Ginger'
]

const STAGES = [
  'Land Preparation',
  'Sowing / Nursery (Transplanting)',
  'Early Growth',
  'Mid Growth',
  'Flowering',
  'Fruiting',
  'Maturity'
]

const SOILS = [
  'Unknown', 'Sandy', 'Clay', 'Loamy', 'Silty', 'Sandy Loam', 'Clay Loam'
]

export default function FertilizerGuide() {
  const { isLoggedIn } = useAuth()

  const [mode, setMode] = useState('select')

  const [fasal, setFasal]   = useState('')
  const [stage, setStage]   = useState('')
  const [soil, setSoil]     = useState('Unknown')
  const [area, setArea]     = useState('')

  const [manualFasal, setManualFasal]   = useState('')
  const [manualStage, setManualStage]   = useState('')
  const [manualSoil, setManualSoil]     = useState('')
  const [manualArea, setManualArea]     = useState('')
  const [manualNotes, setManualNotes]   = useState('')

  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  function isReady() {
    if (!isLoggedIn) return false
    if (mode === 'select') return fasal && stage
    return manualFasal.trim().length > 0
  }

  async function getGuide() {
    setError('')
    if (!isLoggedIn) { setError('Please login for fertilizer guide!'); return }

    if (mode === 'select') {
      if (!fasal || !stage) { setError('Please select crop and growth stage!'); return }
    } else {
      if (!manualFasal.trim()) { setError('Please write the crop name!'); return }
    }

    setLoading(true)
    setResult(null)

    try {
      let prompt = ''

      if (mode === 'select') {
        const areaText = area ? `Land area: ${area} acre` : ''
        prompt = `Provide a fertilizer guide for ${fasal}.
Growth stage: ${stage}
Soil type: ${soil}
${areaText}

Please include:
🌱 REQUIRED FERTILIZER: (NPK ratio and quantity per acre)
📅 WHEN TO APPLY: (timing)
💊 SPECIFIC PRODUCTS: (available in Pakistan)
⚠️ PRECAUTIONS: (what to avoid)
💰 APPROXIMATE COST: (PKR per acre)
🌿 ORGANIC OPTION: (if chemical fertilizers are not preferred)

Give a practical and detailed guide in simple English.`
      } else {
        const parts = []
        parts.push(`Crop: ${manualFasal.trim()}`)
        if (manualStage.trim())  parts.push(`Stage / Time: ${manualStage.trim()}`)
        if (manualSoil.trim())   parts.push(`Soil type: ${manualSoil.trim()}`)
        if (manualArea.trim())   parts.push(`Land area: ${manualArea.trim()}`)
        if (manualNotes.trim())  parts.push(`Farmer question / problem: ${manualNotes.trim()}`)

        prompt = `${parts.join('\n')}

Based on the above information, provide a fertilizer guide.

Include:
🌱 REQUIRED FERTILIZER: (NPK ratio and quantity per acre)
📅 WHEN TO APPLY: (timing)
💊 SPECIFIC PRODUCTS: (available in Pakistan)
⚠️ PRECAUTIONS: (what to avoid)
💰 APPROXIMATE COST: (PKR per acre)
🌿 ORGANIC OPTION: (if chemical fertilizers are not preferred)

Give a practical and detailed guide in simple English.`
      }

      const reply = await aiAPI.chat([{ role: 'user', content: prompt }])

      setResult({
        text:  reply,
        fasal: mode === 'select' ? fasal  : manualFasal,
        stage: mode === 'select' ? stage  : (manualStage || '—'),
        mode,
      })
    } catch (err) {
      if (err.response?.status === 401)      setError('Please login')
      else if (err.response?.status === 429) setError('Please wait and try again')
      else                                   setError('Something went wrong — please try again')
    } finally {
      setLoading(false)
    }
  }

  const card = {
    background: 'white', borderRadius: 18, padding: '16px',
    marginBottom: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
  }
  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 12,
    border: '1.5px solid #C8EDD6', background: '#F8FFF8',
    fontSize: 14, outline: 'none', fontFamily: 'inherit',
    boxSizing: 'border-box', color: '#1a1a1a'
  }
  const labelStyle = {
    fontSize: 12, fontWeight: 700, color: '#1B4D2E',
    display: 'block', marginBottom: 6
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F0F7F0', paddingBottom: 90 }}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes fadeIn  { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        textarea:focus, input:focus, select:focus { border-color: #2D7A47 !important; }
        .mode-btn          { transition: all 0.2s ease; }
        .mode-btn:active   { transform: scale(0.97); }
      `}</style>

      <div className="kisan-header" style={{ background: 'linear-gradient(135deg,#0A1F10,#1B4D2E)', padding: '16px 20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, border: '1px solid rgba(255,255,255,0.2)' }}>🧪</div>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 17 }}>Fertilizer Guide</div>
            <div style={{ color: '#86D4A0', fontSize: 12, marginTop: 2 }}>Complete fertilizer guide from AI</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 16px' }}>

        {!isLoggedIn && (
          <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 14, padding: '12px 16px', marginBottom: 14, display: 'flex', gap: 8 }}>
            <span>⚠️</span>
            <span style={{ fontSize: 13, color: '#92400E', fontWeight: 600 }}>Login required for fertilizer guide</span>
          </div>
        )}

        {error && (
          <div style={{ background: '#FFF0F0', border: '1px solid #FFB3B3', borderRadius: 12, padding: '10px 14px', color: '#CC0000', fontSize: 13, marginBottom: 14 }}>❌ {error}</div>
        )}

        {/* Mode Toggle */}
        <div style={{ background: 'white', borderRadius: 18, padding: '6px', marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', gap: 4 }}>
          {[
            { key: 'select', label: '📋 Select from list',  sub: 'Ready options' },
            { key: 'manual', label: '✏️ Write your own',     sub: 'Provide your info' },
          ].map(m => (
            <button
              key={m.key}
              className="mode-btn"
              onClick={() => { setMode(m.key); setError(''); setResult(null) }}
              style={{
                flex: 1, padding: '12px 8px', borderRadius: 14, border: 'none',
                cursor: 'pointer', fontFamily: 'inherit',
                background: mode === m.key ? 'linear-gradient(135deg,#1B4D2E,#2D7A47)' : 'transparent',
                color: mode === m.key ? 'white' : '#666',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700 }}>{m.label}</div>
              <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>{m.sub}</div>
            </button>
          ))}
        </div>

        {/* Select Mode */}
        {mode === 'select' && (
          <>
            <div style={card}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1B4D2E', marginBottom: 10 }}>1️⃣ Select Crop *</div>
              <select value={fasal} onChange={e => { setFasal(e.target.value); setError('') }} style={{ ...inputStyle, color: fasal ? '#1a1a1a' : '#999' }}>
                <option value="">-- Select crop --</option>
                {FASALS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <div style={card}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1B4D2E', marginBottom: 10 }}>2️⃣ Growth Stage *</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {STAGES.map(s => (
                  <button key={s} onClick={() => { setStage(s); setError('') }} style={{ padding: '10px 14px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', textAlign: 'left', background: stage === s ? 'linear-gradient(135deg,#1B4D2E,#2D7A47)' : '#F0F7F0', color: stage === s ? 'white' : '#1B4D2E', transition: 'all 0.15s' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div style={card}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1B4D2E', marginBottom: 10 }}>3️⃣ Additional Info (Optional)</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>Soil Type</label>
                  <select value={soil} onChange={e => setSoil(e.target.value)} style={inputStyle}>
                    {SOILS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Land Area (Acre)</label>
                  <input type="number" min="0.1" step="0.5" value={area} onChange={e => setArea(e.target.value)} placeholder="e.g. 2.5" style={inputStyle} />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Manual Mode */}
        {mode === 'manual' && (
          <div style={card}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1B4D2E', marginBottom: 4 }}>✏️ Write Your Information</div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 14 }}>You can also ask about crops not in the list</div>

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>🌾 Crop Name *</label>
              <input
                type="text"
                value={manualFasal}
                onChange={e => { setManualFasal(e.target.value); setError('') }}
                placeholder="e.g. Cauliflower, Radish, Strawberry, Watermelon..."
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>📅 Growth Stage / Time</label>
              <input
                type="text"
                value={manualStage}
                onChange={e => setManualStage(e.target.value)}
                placeholder="e.g. Just sown, 2 weeks old, flowering started..."
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>🪨 Soil Type (Optional)</label>
              <input
                type="text"
                value={manualSoil}
                onChange={e => setManualSoil(e.target.value)}
                placeholder="e.g. Sandy, Clay, Black soil..."
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>📐 Land Area (Optional)</label>
              <input
                type="text"
                value={manualArea}
                onChange={e => setManualArea(e.target.value)}
                placeholder="e.g. 3 acres, 2 kanal, 1 marla..."
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 4 }}>
              <label style={labelStyle}>💬 Specific Question / Problem (Optional)</label>
              <textarea
                value={manualNotes}
                onChange={e => setManualNotes(e.target.value)}
                placeholder="e.g. Leaves are turning yellow, used too much urea last time, want organic fertilizer..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
              />
            </div>

            <div style={{ background: '#F0F7F0', borderRadius: 10, padding: '10px 12px', fontSize: 12, color: '#2D7A47', marginTop: 8 }}>
              💡 The more details you provide, the better the AI guide will be.
            </div>
          </div>
        )}

        <button
          onClick={getGuide}
          disabled={!isReady() || loading}
          style={{
            width: '100%', padding: '15px', borderRadius: 16, border: 'none',
            background: (!isReady() || loading) ? '#ccc' : 'linear-gradient(135deg,#1B4D2E,#2D7A47)',
            color: 'white', fontSize: 15, fontWeight: 700,
            cursor: (!isReady() || loading) ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', marginBottom: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}
        >
          {loading ? (
            <><div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />AI is preparing guide...</>
          ) : '🧪 Get Fertilizer Guide'}
        </button>

        {result && (
          <div style={{ background: 'white', borderRadius: 18, padding: '20px', boxShadow: '0 4px 20px rgba(27,77,46,0.12)', border: '1.5px solid #C8EDD6', animation: 'fadeIn 0.4s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#1B4D2E,#2D7A47)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🧪</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#1B4D2E' }}>Fertilizer Guide</div>
                <div style={{ fontSize: 11, color: '#999' }}>{result.fasal} • {result.stage}</div>
              </div>
              {result.mode === 'manual' && (
                <div style={{ marginLeft: 'auto', background: '#E8F4E8', borderRadius: 8, padding: '3px 8px', fontSize: 10, color: '#1B4D2E', fontWeight: 700 }}>✏️ Manual</div>
              )}
            </div>
            <div style={{ background: '#F8FFF8', borderRadius: 14, padding: '14px', fontSize: 13, lineHeight: 1.8, color: '#1a1a1a', border: '1px solid #E8F4E8', whiteSpace: 'pre-wrap' }}>
              {result.text}
            </div>
            <div style={{ marginTop: 12, padding: '10px 14px', background: '#FEF3C7', borderRadius: 12, fontSize: 12, color: '#92400E', border: '1px solid #FDE68A' }}>
              ⚠️ This is AI advice. Please consult an agriculture officer or dealer for confirmation.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}