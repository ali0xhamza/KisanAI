// src/pages/YieldPrediction.jsx
import { useState, useRef } from 'react'
import { useLocation } from '../hooks/useLocation'
import LocationPicker from '../components/LocationPicker'

const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const ALL_CROPS = [
  { value:'Wheat',     ur:'گندم',   icon:'🌾' },
  { value:'Rice',      ur:'چاول',   icon:'🍚' },
  { value:'Maize',     ur:'مکئی',   icon:'🌽' },
  { value:'Cotton',    ur:'کپاس',   icon:'🌿' },
  { value:'Sugarcane', ur:'گنا',    icon:'🎋' },
  { value:'Chickpea',  ur:'چنے',    icon:'🫘' },
  { value:'Lentil',    ur:'مسور',   icon:'🫘' },
  { value:'Mustard',   ur:'سرسوں',  icon:'🌻' },
  { value:'Mango',     ur:'آم',     icon:'🥭' },
  { value:'Tomato',    ur:'ٹماٹر',  icon:'🍅' },
  { value:'Potato',    ur:'آلو',    icon:'🥔' },
  { value:'Banana',    ur:'کیلا',   icon:'🍌' },
]

const SOIL = [
  { value:'sandy', en:'Sandy', ur:'ریتلی', desc:'Light, drains quickly' },
  { value:'loamy', en:'Loamy', ur:'دومٹ',  desc:'Best soil'            },
  { value:'clay',  en:'Clay',  ur:'مٹیار', desc:'Heavy, retains water' },
]
const FERT = [
  { value:'low',    en:'Low — Less fertilizer',    ur:'کم'      },
  { value:'medium', en:'Medium — Normal fertilizer', ur:'درمیانہ' },
  { value:'high',   en:'High — More fertilizer',    ur:'زیادہ'   },
]

const MSG_COLORS = { positive:'#16a34a', negative:'#dc2626', warning:'#d97706' }
const MSG_ICONS  = { positive:'✅', negative:'⚠️', warning:'🔶' }
const MEDALS     = ['🥇','🥈','🥉']
const RANK_COLORS = ['#f59e0b','#94a3b8','#cd7f32']

export default function YieldPrediction() {
  const loc = useLocation()

  const [form,        setForm]        = useState({ soil:'', fert:'', acres:'1' })
  const [loading,     setLoading]     = useState(false)
  const [progress,    setProgress]    = useState(0)
  const [results,     setResults]     = useState(null)
  const [weather,     setWeather]     = useState(null)
  const [error,       setError]       = useState(null)
  const [expanded,    setExpanded]    = useState(null)

  const [customCrop,      setCustomCrop]      = useState('')
  const [customLoading,   setCustomLoading]   = useState(false)
  const [customResult,    setCustomResult]    = useState(null)
  const [customError,     setCustomError]     = useState(null)
  const [customExpanded,  setCustomExpanded]  = useState(false)

  const abortRef = useRef(null)

  const set     = (k,v) => setForm(p => ({ ...p, [k]:v }))
  const isValid = form.soil && form.fert && loc.coords

  const analyzeAll = async () => {
    if (!isValid) return
    setLoading(true)
    setError(null)
    setResults(null)
    setWeather(null)
    setProgress(0)
    setExpanded(null)

    abortRef.current?.abort()
    abortRef.current = new AbortController()

    let done = 0
    const total = ALL_CROPS.length

    try {
      const promises = ALL_CROPS.map(async (crop) => {
        const res  = await fetch(`${BACKEND}/api/yield/predict`, {
          method: 'POST',
          headers: { 'Content-Type':'application/json' },
          signal: abortRef.current.signal,
          body: JSON.stringify({
            crop_type:  crop.value,
            soil_type:  form.soil,
            fertilizer: form.fert,
            latitude:   loc.coords.lat,
            longitude:  loc.coords.lon,
            land_acres: parseFloat(form.acres) || 1,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.detail || `${crop.value} error`)
        done++
        setProgress(Math.round((done / total) * 100))
        return { ...data, _cropMeta: crop }
      })

      const allResults = await Promise.all(promises)
      allResults.sort((a,b) => parseFloat(b.yield_per_acre) - parseFloat(a.yield_per_acre))
      setResults(allResults)
      if (allResults[0]?.weather) setWeather(allResults[0].weather)
    } catch (e) {
      if (e.name !== 'AbortError') setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const analyzeCustomCrop = async () => {
    if (!customCrop.trim() || !isValid) return
    setCustomLoading(true)
    setCustomError(null)
    setCustomResult(null)
    setCustomExpanded(false)

    try {
      const res = await fetch(`${BACKEND}/api/yield/predict-custom`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({
          crop_type:  customCrop.trim(),
          soil_type:  form.soil,
          fertilizer: form.fert,
          latitude:   loc.coords.lat,
          longitude:  loc.coords.lon,
          land_acres: parseFloat(form.acres) || 1,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Error occurred')
      setCustomResult({ ...data, _cropName: customCrop.trim() })
      setCustomExpanded(true)
    } catch (e) {
      setCustomError(e.message)
    } finally {
      setCustomLoading(false)
    }
  }

  const getBarColor = (rank) => {
    if (rank === 0) return '#f59e0b'
    if (rank === 1) return '#94a3b8'
    if (rank === 2) return '#cd7f32'
    if (rank < 5)  return '#22c55e'
    if (rank < 9)  return '#3b82f6'
    return '#e2e8f0'
  }

  const maxYield = results ? parseFloat(results[0]?.yield_per_acre) : 1

  return (
    <div style={{ minHeight:'100vh', background:'#F0F7F0', paddingBottom:100 }}>
      <style>{`
        @keyframes spin      { to { transform:rotate(360deg) } }
        @keyframes fadeIn    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fillBar   { from{width:0} to{width:var(--w)} }
        .crop-card:active    { transform:scale(0.98); }
      `}</style>

      <div style={{ background:'linear-gradient(135deg,#0A1F10,#1B4D2E)', padding:'52px 20px 28px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:46, height:46, borderRadius:14, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, border:'1px solid rgba(255,255,255,0.2)' }}>📊</div>
          <div>
            <div style={{ color:'white', fontWeight:800, fontSize:17 }}>Yield Prediction</div>
            <div style={{ color:'#86D4A0', fontSize:12, marginTop:2 }}>AI analysis of all crops for your land</div>
          </div>
        </div>
      </div>

      <div style={{ padding:'20px 16px' }}>

        {/* 1. Location */}
        <div style={card}>
          <div style={secTitle}>1️⃣ Your Location</div>
          <LocationPicker
            gpsState={loc.gpsState}
            gpsMsg={loc.gpsMsg}
            cityName={loc.cityName}
            onDetectGPS={() => { setResults(null); loc.detectGPS() }}
            onSelectCity={(city) => { setResults(null); loc.selectCity(city) }}
          />
        </div>

        {/* 2. Soil */}
        <div style={card}>
          <div style={secTitle}>2️⃣ Soil Type *</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {SOIL.map(o => (
              <button key={o.value} onClick={() => set('soil',o.value)} style={{
                padding:'11px 14px', borderRadius:12, border:'none', cursor:'pointer',
                fontSize:13, fontWeight:600, fontFamily:'inherit', textAlign:'left',
                background: form.soil===o.value ? 'linear-gradient(135deg,#1B4D2E,#2D7A47)' : '#F0F7F0',
                color:      form.soil===o.value ? 'white' : '#1B4D2E',
              }}>
                {o.en}
                <span style={{ fontWeight:400, fontSize:12, marginLeft:6 }}>— {o.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Fertilizer */}
        <div style={card}>
          <div style={secTitle}>3️⃣ Fertilizer Level *</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {FERT.map(o => (
              <button key={o.value} onClick={() => set('fert',o.value)} style={{
                padding:'11px 14px', borderRadius:12, border:'none', cursor:'pointer',
                fontSize:13, fontWeight:600, fontFamily:'inherit', textAlign:'left',
                background: form.fert===o.value ? 'linear-gradient(135deg,#1B4D2E,#2D7A47)' : '#F0F7F0',
                color:      form.fert===o.value ? 'white' : '#1B4D2E',
              }}>{o.en}</button>
            ))}
          </div>
        </div>

        {/* 4. Acres */}
        <div style={card}>
          <div style={secTitle}>4️⃣ Land Area (Acres)</div>
          <input type="number" value={form.acres} min="0.1" max="9999" step="0.5"
            onChange={e => set('acres',e.target.value)}
            placeholder="1" style={inputStyle} />
          <div style={{ fontSize:11, color:'#888', marginTop:4 }}>Total yield will also be calculated</div>
        </div>

        {/* ── CUSTOM CROP SECTION ── */}
        <div style={{ ...card, border:'2px dashed #2D7A47' }}>
          <div style={secTitle}>🌱 Enter Your Own Crop</div>
          <p style={{ fontSize:12, color:'#4a7c59', marginBottom:12, marginTop:-6 }}>
            If your crop is not in the list above — type it here, AI will predict
          </p>
          <div style={{ display:'flex', gap:8 }}>
            <input
              type="text"
              value={customCrop}
              onChange={e => setCustomCrop(e.target.value)}
              placeholder="e.g., Onion, Garlic, Sunflower..."
              style={{ ...inputStyle, flex:1, margin:0 }}
              onKeyDown={e => e.key === 'Enter' && analyzeCustomCrop()}
            />
            <button
              onClick={analyzeCustomCrop}
              disabled={!customCrop.trim() || !isValid || customLoading}
              style={{
                padding:'11px 16px', borderRadius:12, border:'none',
                background: (!customCrop.trim() || !isValid || customLoading) ? '#ccc' : 'linear-gradient(135deg,#1B4D2E,#2D7A47)',
                color:'white', fontWeight:700, fontSize:13, cursor: (!customCrop.trim() || !isValid || customLoading) ? 'not-allowed' : 'pointer',
                whiteSpace:'nowrap', fontFamily:'inherit',
                display:'flex', alignItems:'center', gap:6,
              }}
            >
              {customLoading
                ? <><div style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid white', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/> Wait...</>
                : '🔍 Predict'
              }
            </button>
          </div>

          {!isValid && (
            <p style={{ fontSize:11, color:'#d97706', marginTop:8 }}>
              ⚠️ Please select location, soil and fertilizer level first
            </p>
          )}

          {customError && (
            <div style={{ background:'#FFF0F0', border:'1px solid #FFB3B3', borderRadius:10, padding:'10px 12px', color:'#CC0000', fontSize:12, marginTop:10 }}>
              ⚠️ {customError}
            </div>
          )}

          {customResult && (
            <div style={{ marginTop:14, animation:'fadeIn 0.3s ease' }}>
              <div
                onClick={() => setCustomExpanded(p => !p)}
                style={{
                  background:'linear-gradient(135deg,#0A1F10,#1B4D2E)',
                  borderRadius:14, padding:'14px 16px', cursor:'pointer',
                  display:'flex', alignItems:'center', gap:12,
                }}
              >
                <div style={{ fontSize:32 }}>🌱</div>
                <div style={{ flex:1 }}>
                  <div style={{ color:'white', fontWeight:800, fontSize:15 }}>
                    {customResult._cropName}
                  </div>
                  <div style={{ color:'#86D4A0', fontSize:12, marginTop:2 }}>
                    AI Prediction Ready
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:22, fontWeight:900, color:'#4ade80' }}>
                    {customResult.yield_per_acre}
                  </div>
                  <div style={{ fontSize:10, color:'#86D4A0' }}>tons/acre</div>
                </div>
                <div style={{ fontSize:14, color:'#86D4A0', transform: customExpanded ? 'rotate(180deg)':'rotate(0)', transition:'transform 0.25s' }}>▼</div>
              </div>

              {customExpanded && (
                <div style={{ background:'#f0fdf4', borderRadius:'0 0 14px 14px', padding:'14px 16px', border:'1px solid #bbf7d0', borderTop:'none', animation:'fadeIn 0.2s ease' }}>
                  {parseFloat(form.acres) > 1 && (
                    <div style={{ background:'white', borderRadius:10, padding:'10px 14px', marginBottom:10, display:'flex', justifyContent:'space-between' }}>
                      <span style={{ fontSize:12, color:'#475569' }}>Total yield on {form.acres} acres:</span>
                      <span style={{ fontSize:16, fontWeight:900, color:'#15803d' }}>{customResult.total_yield} tons</span>
                    </div>
                  )}
                  {customResult.season && (
                    <div style={{ display:'inline-block', background:'#f1f5f9', padding:'4px 12px', borderRadius:20, fontSize:12, color:'#475569', marginBottom:10 }}>
                      📅 {customResult.season}
                    </div>
                  )}
                  {customResult.messages?.map((m, mi) => (
                    <div key={mi} style={{
                      display:'flex', alignItems:'flex-start', gap:8,
                      padding:'8px 12px', borderRadius:10, marginBottom:6,
                      borderLeft:`3px solid ${MSG_COLORS[m[0]]}`,
                      background: MSG_COLORS[m[0]] + '10',
                    }}>
                      <span style={{ fontSize:14 }}>{MSG_ICONS[m[0]]}</span>
                      <span style={{ fontSize:13, color:MSG_COLORS[m[0]], fontWeight:500, lineHeight:1.4 }}>{m[1]}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit all */}
        <button onClick={analyzeAll} disabled={!isValid||loading} style={{
          width:'100%', padding:'16px', borderRadius:16, border:'none',
          background: (!isValid||loading) ? '#ccc' : 'linear-gradient(135deg,#1B4D2E,#2D7A47)',
          color:'white', fontSize:15, fontWeight:700,
          cursor: (!isValid||loading) ? 'not-allowed' : 'pointer',
          fontFamily:'inherit', marginBottom:16,
          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
        }}>
          {loading
            ? <><div style={{ width:18, height:18, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid white', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/> Analyzing all crops...</>
            : '🌾 Analyze All Crops'}
        </button>

        {/* Progress bar */}
        {loading && (
          <div style={{ marginBottom:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#475569', marginBottom:6 }}>
              <span>Calculating each crop...</span>
              <span style={{ fontWeight:700, color:'#1B4D2E' }}>{progress}%</span>
            </div>
            <div style={{ height:8, background:'#e2e8f0', borderRadius:999, overflow:'hidden' }}>
              <div style={{
                height:'100%', borderRadius:999,
                background:'linear-gradient(90deg,#1B4D2E,#4ade80)',
                width:`${progress}%`, transition:'width 0.3s ease',
              }}/>
            </div>
            <div style={{ fontSize:11, color:'#94a3b8', marginTop:4, textAlign:'center' }}>
              {Math.round(progress/100*ALL_CROPS.length)} of {ALL_CROPS.length} crops complete
            </div>
          </div>
        )}

        {error && (
          <div style={{ background:'#FFF0F0', border:'1px solid #FFB3B3', borderRadius:12, padding:'12px 14px', color:'#CC0000', fontSize:13, marginBottom:14 }}>
            ⚠️ {error}
            <button onClick={analyzeAll} style={{ marginLeft:10, padding:'4px 12px', borderRadius:8, border:'1px solid #CC0000', background:'transparent', color:'#CC0000', cursor:'pointer', fontSize:12 }}>Try Again</button>
          </div>
        )}

        {results && (
          <div style={{ animation:'fadeIn 0.4s ease' }}>

            {weather && (
              <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
                {[
                  { icon:'🌡️', label:'Temp',   val:`${weather.temperature}°C` },
                  { icon:'💧', label:'Humidity', val:`${weather.humidity}%`     },
                  { icon:'🌧️', label:'Rainfall', val:`${weather.rainfall}mm`    },
                  { icon:'📍', label:'City',  val: weather.city||loc.cityName },
                ].map(s => (
                  <div key={s.label} style={{ background:'white', borderRadius:12, padding:'10px 12px', textAlign:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', border:'1px solid #e2e8f0', flex:1, minWidth:70 }}>
                    <div style={{ fontSize:18 }}>{s.icon}</div>
                    <div style={{ fontSize:10, color:'#94a3b8', margin:'2px 0' }}>{s.label}</div>
                    <div style={{ fontSize:12, fontWeight:700, color:'#1e293b' }}>{s.val}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ background:'linear-gradient(135deg,#0A1F10,#1B4D2E)', borderRadius:20, padding:'20px 18px', marginBottom:14, textAlign:'center' }}>
              <div style={{ fontSize:11, fontWeight:800, color:'#86D4A0', letterSpacing:1, marginBottom:8 }}>✨ BEST CROP FOR YOUR LAND</div>
              <div style={{ fontSize:52 }}>{results[0]._cropMeta.icon}</div>
              <div style={{ fontSize:26, fontWeight:900, color:'white', margin:'6px 0 2px' }}>{results[0].crop || results[0]._cropMeta.value}</div>
              <div style={{ fontSize:16, color:'#86D4A0', fontFamily:'serif', marginBottom:10 }}>{results[0]._cropMeta.ur}</div>
              <div style={{ display:'inline-flex', alignItems:'baseline', background:'rgba(255,255,255,0.12)', borderRadius:14, padding:'8px 18px' }}>
                <span style={{ fontSize:36, fontWeight:900, color:'#4ade80' }}>{results[0].yield_per_acre}</span>
                <span style={{ fontSize:14, color:'#86D4A0', marginLeft:6 }}>tons/acre</span>
              </div>
              {parseFloat(form.acres) > 1 && (
                <div style={{ marginTop:8, fontSize:13, color:'#86D4A0' }}>
                  On {form.acres} acres: <span style={{ color:'white', fontWeight:800 }}>{results[0].total_yield} tons</span>
                </div>
              )}
            </div>

            <div style={{ fontSize:13, fontWeight:800, color:'#1B4D2E', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
              📋 Ranking of All {ALL_CROPS.length} Crops
              <span style={{ fontSize:11, fontWeight:400, color:'#64748b' }}>(tap for details)</span>
            </div>

            {results.map((r, idx) => {
              const meta     = r._cropMeta
              const barColor = getBarColor(idx)
              const barWidth = Math.round((parseFloat(r.yield_per_acre) / maxYield) * 100)
              const isOpen   = expanded === idx

              return (
                <div key={meta.value} className="crop-card"
                  onClick={() => setExpanded(isOpen ? null : idx)}
                  style={{
                    background:'white', borderRadius:16, marginBottom:10,
                    boxShadow:'0 2px 10px rgba(0,0,0,0.06)',
                    border: idx===0 ? '2px solid #f59e0b' : '1px solid #e8f5e9',
                    overflow:'hidden', cursor:'pointer', transition:'box-shadow 0.2s',
                  }}>
                  <div style={{ padding:'12px 14px', display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ fontSize: idx < 3 ? 22 : 14, fontWeight:800, color: RANK_COLORS[idx]||'#94a3b8', minWidth:28, textAlign:'center' }}>
                      {idx < 3 ? MEDALS[idx] : `#${idx+1}`}
                    </div>
                    <div style={{ fontSize:28, minWidth:36, textAlign:'center' }}>{meta.icon}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:15, fontWeight:800, color:'#1e293b' }}>
                        {r.crop || meta.value}
                        <span style={{ fontSize:12, fontWeight:400, color:'#64748b', marginLeft:6, fontFamily:'serif' }}>{meta.ur}</span>
                      </div>
                      <div style={{ height:6, background:'#f1f5f9', borderRadius:999, marginTop:6, overflow:'hidden' }}>
                        <div style={{ height:'100%', borderRadius:999, background:barColor, width:`${barWidth}%`, transition:'width 0.8s ease' }}/>
                      </div>
                    </div>
                    <div style={{ textAlign:'right', minWidth:70 }}>
                      <div style={{ fontSize:18, fontWeight:900, color:barColor }}>{r.yield_per_acre}</div>
                      <div style={{ fontSize:10, color:'#94a3b8' }}>tons/acre</div>
                      {parseFloat(form.acres) > 1 && (
                        <div style={{ fontSize:10, color:'#64748b', marginTop:1 }}>= {r.total_yield}t total</div>
                      )}
                    </div>
                    <div style={{ fontSize:16, color:'#94a3b8', transform: isOpen?'rotate(180deg)':'rotate(0)', transition:'transform 0.25s' }}>▼</div>
                  </div>

                  {isOpen && (
                    <div style={{ borderTop:'1px solid #f1f5f9', padding:'12px 14px', background:'#fafffe', animation:'fadeIn 0.2s ease' }}>
                      {r.season && (
                        <div style={{ display:'inline-block', background:'#f1f5f9', padding:'4px 12px', borderRadius:20, fontSize:12, color:'#475569', marginBottom:10 }}>
                          📅 {r.season}
                        </div>
                      )}
                      {r.messages && r.messages.length > 0 ? (
                        r.messages.map((m, mi) => (
                          <div key={mi} style={{
                            display:'flex', alignItems:'flex-start', gap:8,
                            padding:'8px 12px', borderRadius:10, marginBottom:6,
                            borderLeft:`3px solid ${MSG_COLORS[m[0]]}`,
                            background: MSG_COLORS[m[0]] + '10',
                          }}>
                            <span style={{ fontSize:14, marginTop:1 }}>{MSG_ICONS[m[0]]}</span>
                            <span style={{ fontSize:13, color:MSG_COLORS[m[0]], fontWeight:500, lineHeight:1.4 }}>{m[1]}</span>
                          </div>
                        ))
                      ) : (
                        <div style={{ fontSize:13, color:'#94a3b8', textAlign:'center', padding:'8px 0' }}>No specific advice for this crop</div>
                      )}
                      {parseFloat(form.acres) > 1 && (
                        <div style={{ background:'#f0fdf4', borderRadius:10, padding:'10px 14px', marginTop:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <span style={{ fontSize:12, color:'#475569' }}>Total yield on {form.acres} acres:</span>
                          <span style={{ fontSize:18, fontWeight:900, color:'#15803d' }}>{r.total_yield} tons</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            <div style={{ background:'white', borderRadius:16, padding:'14px 16px', border:'1px solid #C8EDD6', marginTop:4 }}>
              <div style={{ fontSize:12, fontWeight:700, color:'#1B4D2E', marginBottom:8 }}>📌 Summary of Your Conditions</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, fontSize:12, color:'#475569' }}>
                <div>📍 <b>Location:</b> {loc.cityName || 'Detected'}</div>
                <div>🌱 <b>Soil:</b> {SOIL.find(s=>s.value===form.soil)?.en}</div>
                <div>🌿 <b>Fertilizer:</b> {FERT.find(f=>f.value===form.fert)?.en.split(' — ')[0]}</div>
                <div>🏞️ <b>Land:</b> {form.acres} acres</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const card       = { background:'white', borderRadius:18, padding:'16px', marginBottom:12, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }
const secTitle   = { fontWeight:700, fontSize:14, color:'#1B4D2E', marginBottom:12 }
const inputStyle = { width:'100%', padding:'11px 14px', borderRadius:12, border:'1.5px solid #C8EDD6', background:'#F8FFF8', fontSize:14, outline:'none', fontFamily:'inherit', boxSizing:'border-box' }