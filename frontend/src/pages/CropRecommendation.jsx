// src/pages/CropRecommendation.jsx
import { useState } from 'react'
import { useLocation } from '../hooks/useLocation'
import { PAK_CITIES_DATA } from '../utils/pakLocations'
import LocationPicker from '../components/LocationPicker'

const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const W_KEY   = import.meta.env.VITE_WEATHER_API_KEY || ''

const SOIL_OPTIONS = [
  { value:'sandy', en:'Sandy', ur:'ریتلی', desc:'Light, drains quickly' },
  { value:'loamy', en:'Loamy', ur:'دومٹ',  desc:'Best soil'    },
  { value:'clay',  en:'Clay',  ur:'مٹیار', desc:'Heavy, retains more water' },
]
const WATER_OPTIONS = [
  { value:'low',    en:'Low',    ur:'کم',      desc:'Only rainfall'      },
  { value:'medium', en:'Medium', ur:'درمیانہ', desc:'Tube well / canal' },
  { value:'high',   en:'High',   ur:'زیادہ',   desc:'Full irrigation'  },
]

export default function CropRecommendation() {
  const loc = useLocation()

  const [form, setForm] = useState({
    soil_type:'', temperature:'', humidity:'', rainfall:'', water_availability:'',
  })
  const [weatherLoaded, setWeatherLoaded] = useState(false)
  const [loading,       setLoading]       = useState(false)
  const [result,        setResult]        = useState(null)
  const [error,         setError]         = useState(null)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  // ── Fetch live weather from OWM once we have coords ───────────
  const loadWeather = async (coords, cityName) => {
    const rain = PAK_CITIES_DATA[cityName]?.rainfall || 400
    set('rainfall', rain.toString())

    if (!W_KEY) {
      // No API key — just set rainfall, leave temp/humidity for manual input
      setWeatherLoaded(true)
      return
    }

    try {
      const r    = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${W_KEY}&units=metric`,
        { signal: AbortSignal.timeout(6000) }
      )
      const data = await r.json()
      if (data.cod !== 200) throw new Error()

      set('temperature', Math.round(data.main.temp).toString())
      set('humidity',    Math.round(data.main.humidity).toString())
    } catch {
      // OWM failed — fields remain empty for manual entry
    }
    setWeatherLoaded(true)
  }

  // ── Location callbacks ─────────────────────────────────────────
  const onLocationFound = (coords, cityName) => {
    setResult(null)
    loadWeather(coords, cityName)
  }

  // ── Submit ─────────────────────────────────────────────────────
  const isValid = form.soil_type && form.temperature && form.humidity
    && form.rainfall && form.water_availability

  const handleSubmit = async () => {
    if (!isValid) return
    setLoading(true); setError(null); setResult(null)
    try {
      const res  = await fetch(`${BACKEND}/api/recommendation/recommend`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({
          soil_type:          form.soil_type,
          temperature:        parseFloat(form.temperature),
          humidity:           parseFloat(form.humidity),
          rainfall:           parseFloat(form.rainfall),
          water_availability: form.water_availability,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Server error')
      setResult(data)
    } catch (e) { setError(e.message) }
    finally     { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#F0F7F0', paddingBottom:90 }}>
      <style>{`
        @keyframes spin   { to { transform:rotate(360deg) } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px) }
                            to   { opacity:1; transform:translateY(0)     } }
      `}</style>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#0A1F10,#1B4D2E)', padding:'52px 20px 24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:46, height:46, borderRadius:14, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, border:'1px solid rgba(255,255,255,0.2)' }}>🌱</div>
          <div>
            <div style={{ color:'white', fontWeight:800, fontSize:17 }}>Crop Recommendation</div>
            <div style={{ color:'#86D4A0', fontSize:12, marginTop:2 }}>AI recommends the best crop</div>
          </div>
        </div>
      </div>

      <div style={{ padding:'20px 16px' }}>

        {/* 1. Location */}
        <div style={card}>
          <div style={secTitle}>1️⃣ Share your location</div>
          <LocationPicker
            gpsState={loc.gpsState}
            gpsMsg={loc.gpsMsg}
            cityName={loc.cityName}
            onDetectGPS={() => {
              setWeatherLoaded(false)
              loc.detectGPS(onLocationFound)
            }}
            onSelectCity={(city) => {
              setWeatherLoaded(false)
              loc.selectCity(city, onLocationFound)
            }}
          />
        </div>

        {weatherLoaded && (
          <div style={{ background:'#E8F5E9', borderRadius:12, padding:'10px 14px', marginBottom:12, border:'1px solid #C8EDD6', fontSize:12, color:'#1B4D2E', fontWeight:600, animation:'fadeIn 0.3s ease' }}>
            ✅ Weather loaded for {loc.cityName} — Rainfall auto-filled
            {W_KEY ? ', temperature and humidity also auto-filled' : ' (Enter temperature & humidity manually)'}
          </div>
        )}

        {/* 2. Soil */}
        <div style={card}>
          <div style={secTitle}>2️⃣ Soil Type *</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {SOIL_OPTIONS.map(o => (
              <button key={o.value} onClick={() => set('soil_type',o.value)} style={{
                padding:'10px 14px', borderRadius:12, border:'none', cursor:'pointer',
                fontSize:13, fontWeight:600, fontFamily:'inherit', textAlign:'left',
                background: form.soil_type===o.value ? 'linear-gradient(135deg,#1B4D2E,#2D7A47)' : '#F0F7F0',
                color:      form.soil_type===o.value ? 'white' : '#1B4D2E',
              }}>
                {o.en} — <span style={{ fontWeight:400, fontSize:12 }}>{o.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Weather */}
        <div style={card}>
          <div style={secTitle}>3️⃣ Weather Details</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
            <div>
              <label style={lbl}>🌡️ Temperature (°C)</label>
              <input type="number" value={form.temperature} onChange={e => set('temperature',e.target.value)} placeholder="25" style={inputStyle} />
            </div>
            <div>
              <label style={lbl}>💧 Humidity (%)</label>
              <input type="number" value={form.humidity} onChange={e => set('humidity',e.target.value)} placeholder="60" style={inputStyle} />
            </div>
          </div>
          <label style={lbl}>🌧️ Yearly Rainfall (mm)</label>
          <input type="number" value={form.rainfall} onChange={e => set('rainfall',e.target.value)} placeholder="500" style={inputStyle} />
          <div style={{ fontSize:11, color:'#888', marginTop:4 }}>Dry: 200mm | Medium: 500mm | Heavy: 1500mm</div>
        </div>

        {/* 4. Water */}
        <div style={card}>
          <div style={secTitle}>4️⃣ Water Availability *</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {WATER_OPTIONS.map(o => (
              <button key={o.value} onClick={() => set('water_availability',o.value)} style={{
                padding:'10px 14px', borderRadius:12, border:'none', cursor:'pointer',
                fontSize:13, fontWeight:600, fontFamily:'inherit', textAlign:'left',
                background: form.water_availability===o.value ? 'linear-gradient(135deg,#1B4D2E,#2D7A47)' : '#F0F7F0',
                color:      form.water_availability===o.value ? 'white' : '#1B4D2E',
              }}>
                {o.en} — <span style={{ fontWeight:400, fontSize:12 }}>{o.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button onClick={handleSubmit} disabled={!isValid||loading} style={{
          width:'100%', padding:'15px', borderRadius:16, border:'none',
          background:(!isValid||loading)?'#ccc':'linear-gradient(135deg,#1B4D2E,#2D7A47)',
          color:'white', fontSize:15, fontWeight:700,
          cursor:(!isValid||loading)?'not-allowed':'pointer',
          fontFamily:'inherit', marginBottom:16,
          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
        }}>
          {loading
            ? <><div style={{ width:18, height:18, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid white', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/> AI is analyzing...</>
            : '🌾 Find the Best Crop'}
        </button>

        {error && (
          <div style={{ background:'#FFF0F0', border:'1px solid #FFB3B3', borderRadius:12, padding:'12px 14px', color:'#CC0000', fontSize:13, marginBottom:14 }}>
            ⚠️ {error}
            <button onClick={() => setError(null)} style={{ marginLeft:10, padding:'4px 12px', borderRadius:8, border:'1px solid #CC0000', background:'transparent', color:'#CC0000', cursor:'pointer', fontSize:12 }}>Retry</button>
          </div>
        )}

        {result && <Results data={result} />}
      </div>
    </div>
  )
}

function Results({ data }) {
  const { best_crop:b, alternatives:alt } = data
  return (
    <div style={{ animation:'fadeIn 0.4s ease' }}>
      <div style={{ background:'white', borderRadius:20, padding:22, boxShadow:'0 8px 28px rgba(10,30,13,0.1)', border:`2px solid ${b.color}`, textAlign:'center', marginBottom:14 }}>
        <div style={{ display:'inline-block', fontSize:11, fontWeight:800, padding:'4px 12px', borderRadius:20, marginBottom:12, background:b.color+'15', color:b.color }}>✨ Best Choice</div>
        <div style={{ fontSize:54, marginBottom:6 }}>{b.icon}</div>
        <div style={{ fontSize:26, fontWeight:900, color:b.color, margin:'0 0 4px' }}>{b.crop}</div>
        <div style={{ fontSize:18, color:'#64748b', marginBottom:10, fontFamily:'serif' }}>{b.urdu_name}</div>
        <div style={{ display:'inline-block', background:'#f1f5f9', padding:'5px 14px', borderRadius:20, fontSize:12, color:'#475569', marginBottom:12 }}>📅 {b.season}</div>
        <div style={{ height:10, background:'#e2e8f0', borderRadius:999, overflow:'hidden' }}>
          <div style={{ height:'100%', borderRadius:999, width:`${b.confidence}%`, background:b.color, transition:'width 1s ease' }} />
        </div>
        <div style={{ fontSize:12, color:'#64748b', marginTop:4 }}>Confidence: {b.confidence}%</div>
      </div>
      <div style={{ fontSize:13, fontWeight:700, color:'#475569', marginBottom:8 }}>Alternative Crops</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        {alt.map((a,i) => (
          <div key={i} style={{ background:'white', borderRadius:16, padding:14, boxShadow:'0 2px 10px rgba(10,30,13,0.06)', borderTop:`3px solid ${a.color}` }}>
            <div style={{ fontSize:28, marginBottom:4 }}>{a.icon}</div>
            <div style={{ fontSize:15, fontWeight:800, color:a.color, marginBottom:2 }}>{a.crop}</div>
            <div style={{ fontSize:13, color:'#64748b', fontFamily:'serif', marginBottom:3 }}>{a.urdu_name}</div>
            <div style={{ fontSize:10, color:'#94a3b8', marginBottom:6 }}>{a.season}</div>
            <div style={{ height:6, background:'#e2e8f0', borderRadius:999 }}>
              <div style={{ height:'100%', borderRadius:999, width:`${a.confidence}%`, background:a.color }} />
            </div>
            <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>{a.confidence}%</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const card      = { background:'white', borderRadius:18, padding:'16px', marginBottom:12, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }
const secTitle  = { fontWeight:700, fontSize:14, color:'#1B4D2E', marginBottom:12 }
const lbl       = { display:'block', fontSize:12, fontWeight:700, color:'#1B4D2E', marginBottom:6 }
const inputStyle= { width:'100%', padding:'11px 14px', borderRadius:12, border:'1.5px solid #C8EDD6', background:'#F8FFF8', fontSize:14, outline:'none', fontFamily:'inherit', boxSizing:'border-box' }