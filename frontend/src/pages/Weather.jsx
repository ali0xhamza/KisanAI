// src/pages/Weather.jsx
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { aiAPI } from '../services/api'

const API_KEY = import.meta.env.VITE_OPENWEATHER_KEY

function getEnglishCondition(main) {
  const map = {
    'Clear':        'Clear',
    'Clouds':       'Cloudy',
    'Rain':         'Rain',
    'Drizzle':      'Drizzle',
    'Thunderstorm': 'Thunderstorm',
    'Snow':         'Snow',
    'Mist':         'Mist',
    'Fog':          'Fog',
    'Haze':         'Haze',
    'Dust':         'Dust',
    'Sand':         'Sandstorm',
    'Smoke':        'Smoke',
  }
  return map[main] || main
}

function getWeatherIcon(main) {
  const map = {
    'Clear':'☀️', 'Clouds':'☁️', 'Rain':'🌧️',
    'Drizzle':'🌦️', 'Thunderstorm':'⛈️', 'Snow':'❄️',
    'Mist':'🌫️', 'Fog':'🌫️', 'Haze':'🌫️', 'Dust':'💨',
  }
  return map[main] || '🌤️'
}

function getFarmingAdvice(weather) {
  const temp      = weather.main.temp
  const condition = weather.weather[0].main
  const humidity  = weather.main.humidity
  const wind      = weather.wind.speed * 3.6
  const advice    = []

  if (['Rain','Drizzle','Thunderstorm'].includes(condition)) {
    advice.push('🚫 Do not spray today — the product will wash off')
    advice.push('💧 No need for irrigation — it is raining')
  } else if (condition === 'Clear' && temp > 38) {
    advice.push('🌡️ Extreme heat — irrigate between 6‑9 AM or 5‑7 PM')
    advice.push('🌿 Use mulching to protect from sun')
    advice.push('🚫 Do not spray in the afternoon')
  } else if (condition === 'Clear' && temp > 30) {
    advice.push('✅ Spraying is fine in the morning or evening')
    advice.push('💧 Regular irrigation is essential')
  } else if (condition === 'Clear') {
    advice.push('✅ Perfect day for spraying')
    advice.push('💧 Irrigate as needed')
  } else if (condition === 'Clouds') {
    advice.push('✅ Cloudy — good time for spraying')
    advice.push('💧 Check if irrigation is needed')
  } else if (condition === 'Thunderstorm') {
    advice.push('⚠️ Severe storm — do not go to the field')
    advice.push('🚫 Stop all work')
  }

  if (wind > 30)     advice.push(`💨 Strong wind (${Math.round(wind)} km/h) — avoid spraying`)
  if (humidity > 85) advice.push('🍄 Very high humidity — risk of fungal diseases, check your crop')
  if (humidity < 25) advice.push('🏜️ Very low humidity — crops need immediate water')
  if (temp < 3)      advice.push('🥶 Risk of frost — cover sensitive crops')
  if (temp < 10)     advice.push('❄️ Very cold — avoid watering')

  return advice.length > 0 ? advice : ['🌱 Weather is normal — proceed with routine work']
}

async function searchCity(cityName) {
  const attempts = [`${cityName},PK`, cityName, `${cityName} Pakistan`]
  for (const query of attempts) {
    try {
      const res  = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query)}&appid=${API_KEY}&units=metric`)
      const data = await res.json()
      if (data.cod === 200) return data
    } catch { continue }
  }
  try {
    const geoRes  = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)},PK&limit=5&appid=${API_KEY}`)
    const geoData = await geoRes.json()
    if (geoData.length > 0) {
      const { lat, lon } = geoData[0]
      const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
      return await weatherRes.json()
    }
  } catch {}
  return null
}

function processForecast(list) {
  const daily = {}
  list.forEach(item => {
    const date = item.dt_txt.split(' ')[0]
    if (!daily[date]) daily[date] = []
    daily[date].push(item)
  })
  return Object.entries(daily).slice(0, 7).map(([date, items]) => {
    const temps     = items.map(i => i.main.temp)
    const conds     = items.map(i => i.weather[0].main)
    const top       = conds.sort((a,b) => conds.filter(v=>v===b).length - conds.filter(v=>v===a).length)[0]
    const rainItems = items.filter(i => ['Rain','Drizzle','Thunderstorm'].includes(i.weather[0].main))
    return {
      date,
      maxTemp:    Math.round(Math.max(...temps)),
      minTemp:    Math.round(Math.min(...temps)),
      condition:  top,
      humidity:   Math.round(items.reduce((a,b) => a+b.main.humidity,  0) / items.length),
      wind:       Math.round(items.reduce((a,b) => a+b.wind.speed,     0) / items.length * 3.6),
      pressure:   Math.round(items.reduce((a,b) => a+b.main.pressure,  0) / items.length),
      feelsLike:  Math.round(items.reduce((a,b) => a+b.main.feels_like,0) / items.length),
      visibility: Math.round(items.reduce((a,b) => a+(b.visibility||10000), 0) / items.length / 1000),
      rain:       rainItems.length > 0,
      rainMM:     Math.round(rainItems.reduce((a,b) => a+(b.rain?.['3h']||0), 0)),
      hourly:     items.map(i => ({
        time:      i.dt_txt.split(' ')[1].slice(0,5),
        temp:      Math.round(i.main.temp),
        condition: i.weather[0].main,
        humidity:  i.main.humidity,
        wind:      Math.round(i.wind.speed * 3.6),
      }))
    }
  })
}

function getDayName(dateStr) {
  const days  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const d     = new Date(dateStr)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return 'Today'
  const tom = new Date(today); tom.setDate(today.getDate()+1)
  if (d.toDateString() === tom.toDateString()) return 'Tomorrow'
  return days[d.getDay()]
}

const PAKISTANI_CITIES = [
  'Lahore','Karachi','Islamabad','Faisalabad','Multan',
  'Peshawar','Quetta','Sialkot','Gujranwala','Rawalpindi',
  'Narowal','Kasur','Sheikhupura','Sahiwal','Bahawalpur',
]

const DEFAULT_FASLEN = [
  'Wheat','Rice','Sugarcane','Cotton','Maize',
  'Mustard','Tomato','Potato','Onion','Mango',
  'Kinnow','Guava'
]

export default function Weather() {
  const { isLoggedIn } = useAuth()

  const [inputCity,    setInputCity]    = useState('')
  const [displayCity,  setDisplayCity]  = useState('')
  const [weather,      setWeather]      = useState(null)
  const [forecast,     setForecast]     = useState([])
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')
  const [locationLoading, setLocationLoading] = useState(false)
  const [selectedDay,  setSelectedDay]  = useState(null)

  const [crop,         setCrop]         = useState('')
  const [customCrop,   setCustomCrop]   = useState('')
  const [showCustom,   setShowCustom]   = useState(false)
  const [cropAdvice,   setCropAdvice]   = useState('')
  const [cropLoading,  setCropLoading]  = useState(false)

  function getDayNameFn(dateStr) { return getDayName(dateStr) }

  async function loadWeather(weatherData) {
    setWeather(weatherData)
    setDisplayCity(`${weatherData.name}, ${weatherData.sys.country}`)
    setSelectedDay(null)
    setCropAdvice('')
    try {
      const res  = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${API_KEY}&units=metric&cnt=56`)
      const data = await res.json()
      if (data.list) setForecast(processForecast(data.list))
    } catch {}
  }

  async function fetchByCity() {
    const q = inputCity.trim()
    if (!q) { setError('Please enter a city name'); return }
    setLoading(true); setError(''); setWeather(null); setForecast([])
    const data = await searchCity(q)
    if (data && data.cod === 200) await loadWeather(data)
    else setError(`"${q}" not found — OpenWeatherMap may not have this city. Try a nearby larger city.`)
    setLoading(false)
  }

  async function fetchByLocation() {
    if (!navigator.geolocation) { setError('Browser does not support location'); return }
    setLocationLoading(true); setError('')
    navigator.geolocation.getCurrentPosition(
      async pos => {
        setLoading(true)
        try {
          const { latitude: lat, longitude: lon } = pos.coords
          const res  = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
          const data = await res.json()
          if (data.cod === 200) {
            try {
              const geoRes  = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`)
              const geoArr  = await geoRes.json()
              if (geoArr?.length > 0) data.name = geoArr[0].name
            } catch {}
            await loadWeather(data)
          } else {
            setError('Could not fetch weather for your location')
          }
        } catch { setError('Could not load weather') }
        setLoading(false); setLocationLoading(false)
      },
      (err) => {
        if (err.code === 1) setError('Location permission denied — please allow in browser settings')
        else setError('Could not access location — please enter city name')
        setLocationLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  async function getCropAdvice() {
    const activeCrop = showCustom ? customCrop.trim() : crop
    if (!activeCrop || !weather) return
    setCropLoading(true); setCropAdvice('')
    const month = new Date().toLocaleString('en-US', { month: 'long' })
    try {
      const reply = await aiAPI.chat([{
        role: 'user',
        content: `Weather details:
- City: ${displayCity}
- Temperature: ${Math.round(weather.main.temp)}°C (feels like: ${Math.round(weather.main.feels_like)}°C)
- Conditions: ${getEnglishCondition(weather.weather[0].main)}
- Humidity: ${weather.main.humidity}%
- Wind: ${Math.round(weather.wind.speed * 3.6)} km/h
- Month: ${month}
- Crop: ${activeCrop}
${forecast.length > 0 ? `- Rain in next 7 days: ${forecast.some(f => f.rain) ? 'Yes' : 'No'}` : ''}

Give detailed practical advice for ${activeCrop} for this month:

📅 WHAT TO DO THIS MONTH:
(specific tasks that should be done now)

🌡️ WEATHER IMPACT:
(how this temperature and conditions affect the crop)

💧 IRRIGATION SCHEDULE:
(how much and when — based on current weather)

🧪 FERTILIZER:
(which fertilizer to apply this month and how much)

🌿 DISEASE / PESTS:
(what risks exist this month and how to prevent)

⚠️ CAUTIONS:
(what NOT to do)

Write in simple English — practical, short, to the point.`
      }])
      setCropAdvice(reply)
    } catch { setCropAdvice('Something went wrong — please try again') }
    setCropLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', background:'#F0F7F0', paddingBottom:90 }}>
      <style>{`
        @keyframes spin   { to { transform:rotate(360deg) } }
        @keyframes fadeIn { from { opacity:0;transform:translateY(10px) } to { opacity:1;transform:translateY(0) } }
      `}</style>

      {/* Header */}
<div className="kisan-header" style={{ background:'linear-gradient(135deg,#0A1F10,#1B4D2E)', padding:'16px 20px 20px' }}>        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
          <div style={{ width:46, height:46, borderRadius:14, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, border:'1px solid rgba(255,255,255,0.2)' }}>⛅</div>
          <div>
            <div style={{ color:'white', fontWeight:800, fontSize:17 }}>Weather</div>
            <div style={{ color:'#86D4A0', fontSize:12, marginTop:2 }}>7‑day forecast + crop advice</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:8, marginBottom:10 }}>
          <input
            placeholder="Enter city... (Lahore, Narowal, Kasur)"
            value={inputCity}
            onChange={e => setInputCity(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchByCity()}
            style={{ flex:1, padding:'12px 16px', borderRadius:12, border:'none', background:'rgba(255,255,255,0.15)', color:'white', fontSize:14, outline:'none', fontFamily:'inherit' }}
          />
          <button onClick={fetchByCity} disabled={loading} style={{ padding:'12px 18px', borderRadius:12, border:'none', background:'rgba(255,255,255,0.9)', color:'#1B4D2E', fontSize:14, cursor:'pointer', fontWeight:700 }}>
            🔍
          </button>
        </div>
        <button onClick={fetchByLocation} disabled={locationLoading || loading} style={{ width:'100%', padding:'11px', borderRadius:12, border:'1px solid rgba(255,255,255,0.3)', background:'transparent', color:'white', fontSize:13, cursor:'pointer', fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          {locationLoading ? '⏳ Getting your location...' : '📍 Use My Location'}
        </button>
      </div>

      <div style={{ padding:'16px' }}>

        {error && (
          <div style={{ background:'#FFF0F0', border:'1px solid #FFB3B3', borderRadius:12, padding:'12px 16px', color:'#CC0000', fontSize:13, marginBottom:14, fontWeight:600 }}>
            ❌ {error}
            <div style={{ fontSize:11, color:'#888', marginTop:4, fontWeight:400 }}>
              💡 Tip: Instead of a small town, try a larger nearby city like "Gujranwala"
            </div>
          </div>
        )}

        {loading && (
          <div style={{ textAlign:'center', padding:'40px' }}>
            <div style={{ width:40, height:40, border:'3px solid #C8EDD6', borderTop:'3px solid #1B4D2E', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto' }} />
            <p style={{ color:'#888', marginTop:12 }}>Loading weather...</p>
          </div>
        )}

        {!loading && !weather && !error && (
          <div style={{ textAlign:'center', padding:'40px 20px', background:'white', borderRadius:18, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize:64 }}>⛅</div>
            <div style={{ fontWeight:700, fontSize:16, color:'#1B4D2E', marginTop:16 }}>Check Your Weather</div>
            <div style={{ color:'#888', fontSize:13, marginTop:8 }}>Enter a city name or use your location</div>
            <div style={{ marginTop:16, display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center' }}>
              {PAKISTANI_CITIES.map(c => (
                <button key={c} onClick={() => setInputCity(c)} style={{ padding:'6px 14px', borderRadius:20, border:'1px solid #C8EDD6', background:'#F8FFF8', color:'#1B4D2E', fontSize:12, fontWeight:600, cursor:'pointer' }}>{c}</button>
              ))}
            </div>
          </div>
        )}

        {!loading && weather && (
          <>
            {/* Current Weather */}
            <div style={{ background:'linear-gradient(135deg,#1B4D2E,#2D7A47)', borderRadius:20, padding:'24px', marginBottom:14, color:'white' }}>
              <div style={{ fontSize:12, opacity:0.7, marginBottom:8 }}>📍 {displayCity}</div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <div style={{ fontSize:72, lineHeight:1 }}>{getWeatherIcon(weather.weather[0].main)}</div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:60, fontWeight:900, lineHeight:1 }}>{Math.round(weather.main.temp)}°</div>
                  <div style={{ fontSize:12, opacity:0.7 }}>Feels like: {Math.round(weather.main.feels_like)}°C</div>
                </div>
              </div>
              <div style={{ fontSize:18, fontWeight:700 }}>{getEnglishCondition(weather.weather[0].main)}</div>
              <div style={{ fontSize:12, opacity:0.6, marginBottom:20 }}>{weather.weather[0].description}</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:8 }}>
                {[
                  { icon:'💧', label:'Humidity', val:`${weather.main.humidity}%` },
                  { icon:'💨', label:'Wind',    val:`${Math.round(weather.wind.speed*3.6)} km/h` },
                  { icon:'🌡️', label:'High',    val:`${Math.round(weather.main.temp_max)}°` },
                  { icon:'❄️', label:'Low',     val:`${Math.round(weather.main.temp_min)}°` },
                ].map(s => (
                  <div key={s.label} style={{ background:'rgba(255,255,255,0.12)', borderRadius:12, padding:'10px 6px', textAlign:'center' }}>
                    <div style={{ fontSize:18 }}>{s.icon}</div>
                    <div style={{ fontSize:13, fontWeight:700, marginTop:4 }}>{s.val}</div>
                    <div style={{ fontSize:10, opacity:0.7 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Farmer Advice */}
            <div style={{ background:'white', borderRadius:18, padding:'16px', marginBottom:14, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ fontWeight:700, fontSize:14, color:'#1B4D2E', marginBottom:10 }}>🌾 Today's Farming Advice</div>
              {getFarmingAdvice(weather).map((a, i) => (
                <div key={i} style={{ background:'#F8FFF8', borderRadius:10, padding:'10px 14px', fontSize:13, color:'#1a1a1a', border:'1px solid #E8F4E8', marginBottom:8, lineHeight:1.5 }}>{a}</div>
              ))}
            </div>

            {/* 7-Day Forecast */}
            {forecast.length > 0 && (
              <div style={{ background:'white', borderRadius:18, padding:'16px', marginBottom:14, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ fontWeight:700, fontSize:14, color:'#1B4D2E', marginBottom:12 }}>📅 7‑Day Forecast — Click for details</div>
                {forecast.map((day, i) => (
                  <div key={i}>
                    <div
                      onClick={() => setSelectedDay(selectedDay?.date === day.date ? null : day)}
                      style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background: selectedDay?.date === day.date ? '#E8F5E9' : day.rain ? '#FFF5F5' : '#F8FFF8', borderRadius: selectedDay?.date === day.date ? '12px 12px 0 0' : 12, border:`1.5px solid ${selectedDay?.date === day.date ? '#1B4D2E' : day.rain ? '#FECACA' : '#E8F4E8'}`, marginBottom: selectedDay?.date === day.date ? 0 : 8, cursor:'pointer', transition:'all 0.2s' }}
                    >
                      <div style={{ fontSize:22, width:32, textAlign:'center' }}>{getWeatherIcon(day.condition)}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:13, color:'#1B4D2E' }}>
                          {getDayName(day.date)}
                          <span style={{ fontSize:10, color:'#999', fontWeight:400, marginLeft:6 }}>{day.date}</span>
                        </div>
                        <div style={{ fontSize:11, color:'#888' }}>{getEnglishCondition(day.condition)}{day.rain ? ` 🌧️ ${day.rainMM}mm` : ''}</div>
                      </div>
                      <div style={{ fontSize:11, color:'#666', textAlign:'center' }}>
                        <div>💧 {day.humidity}%</div>
                        <div>💨 {day.wind} km/h</div>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontWeight:800, fontSize:15, color:'#1B4D2E' }}>{day.maxTemp}°</div>
                        <div style={{ fontSize:11, color:'#999' }}>{day.minTemp}°</div>
                      </div>
                      <div style={{ fontSize:12, color:'#1B4D2E', marginLeft:4 }}>
                        {selectedDay?.date === day.date ? '▲' : '▼'}
                      </div>
                    </div>

                    {selectedDay?.date === day.date && (
                      <div style={{ background:'#F0F7F0', borderRadius:'0 0 12px 12px', padding:'14px', marginBottom:8, border:'1.5px solid #1B4D2E', borderTop:'none', animation:'fadeIn 0.2s ease' }}>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:12 }}>
                          {[
                            { icon:'🌡️', label:'Feels like', val:`${day.feelsLike}°C`   },
                            { icon:'📊', label:'Pressure',   val:`${day.pressure} hPa`  },
                            { icon:'👁️', label:'Visibility', val:`${day.visibility} km` },
                            { icon:'💧', label:'Humidity',   val:`${day.humidity}%`     },
                            { icon:'💨', label:'Wind',       val:`${day.wind} km/h`     },
                            { icon:'🌧️', label:'Rain',       val:day.rain ? `${day.rainMM}mm` : 'No' },
                          ].map(s => (
                            <div key={s.label} style={{ background:'white', borderRadius:10, padding:'10px 8px', textAlign:'center', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
                              <div style={{ fontSize:18 }}>{s.icon}</div>
                              <div style={{ fontWeight:700, fontSize:13, color:'#1B4D2E', marginTop:4 }}>{s.val}</div>
                              <div style={{ fontSize:10, color:'#888' }}>{s.label}</div>
                            </div>
                          ))}
                        </div>

                        <div style={{ fontWeight:700, fontSize:12, color:'#1B4D2E', marginBottom:8 }}>⏰ Hourly breakdown</div>
                        <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:6 }}>
                          {day.hourly.map((h, hi) => (
                            <div key={hi} style={{ minWidth:58, background:'white', borderRadius:10, padding:'8px 6px', textAlign:'center', boxShadow:'0 1px 4px rgba(0,0,0,0.05)', flexShrink:0 }}>
                              <div style={{ fontSize:10, color:'#888', marginBottom:4 }}>{h.time}</div>
                              <div style={{ fontSize:18 }}>{getWeatherIcon(h.condition)}</div>
                              <div style={{ fontWeight:700, fontSize:13, color:'#1B4D2E', marginTop:4 }}>{h.temp}°</div>
                              <div style={{ fontSize:10, color:'#888' }}>💧{h.humidity}%</div>
                              <div style={{ fontSize:10, color:'#888' }}>💨{h.wind}</div>
                            </div>
                          ))}
                        </div>

                        <div style={{ marginTop:12, background:'#FEF3C7', borderRadius:10, padding:'10px 12px', fontSize:12, color:'#92400E', border:'1px solid #FDE68A' }}>
                          {day.rain
                            ? `🚫 Do not spray on this day — it will rain (${day.rainMM}mm). No irrigation needed.`
                            : day.maxTemp > 38
                            ? '🌡️ Extreme heat — irrigate in the morning or evening. Avoid the field at noon.'
                            : day.wind > 30
                            ? `💨 Strong wind (${day.wind} km/h) — avoid spraying`
                            : day.minTemp < 5
                            ? '🥶 Cold night — cover sensitive crops'
                            : '✅ Good day for routine farm work'}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Crop Advice */}
            <div style={{ background:'white', borderRadius:18, padding:'16px', marginBottom:14, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ fontWeight:700, fontSize:14, color:'#1B4D2E', marginBottom:12 }}>🌱 Get Crop‑Specific Advice</div>

              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:10 }}>
                {DEFAULT_FASLEN.map(f => (
                  <button key={f} onClick={() => { setCrop(f); setShowCustom(false); setCropAdvice('') }} style={{
                    padding:'7px 14px', borderRadius:20, border:'none', cursor:'pointer',
                    fontSize:12, fontWeight:600, fontFamily:'inherit',
                    background: crop === f && !showCustom ? '#1B4D2E' : '#F0F7F0',
                    color:      crop === f && !showCustom ? 'white'   : '#1B4D2E',
                  }}>{f}</button>
                ))}
                <button onClick={() => { setShowCustom(true); setCrop(''); setCropAdvice('') }} style={{
                  padding:'7px 14px', borderRadius:20, border:'1.5px dashed #1B4D2E', cursor:'pointer',
                  fontSize:12, fontWeight:600, fontFamily:'inherit',
                  background: showCustom ? '#1B4D2E' : 'transparent',
                  color:      showCustom ? 'white'   : '#1B4D2E',
                }}>✏️ Your own crop</button>
              </div>

              {showCustom && (
                <input
                  placeholder="Enter crop name... (e.g. Green Chili, Okra, Tinda)"
                  value={customCrop}
                  onChange={e => { setCustomCrop(e.target.value); setCropAdvice('') }}
                  style={{ width:'100%', padding:'11px 14px', borderRadius:12, border:'1.5px solid #C8EDD6', background:'#F8FFF8', fontSize:14, outline:'none', fontFamily:'inherit', marginBottom:10, boxSizing:'border-box' }}
                />
              )}

              <button
                onClick={getCropAdvice}
                disabled={cropLoading || !isLoggedIn || (!crop && !customCrop.trim())}
                style={{
                  width:'100%', padding:'14px', borderRadius:14, border:'none',
                  background: (cropLoading || !isLoggedIn || (!crop && !customCrop.trim())) ? '#ccc' : 'linear-gradient(135deg,#1B4D2E,#2D7A47)',
                  color:'white', fontSize:14, fontWeight:700,
                  cursor: (cropLoading || !isLoggedIn || (!crop && !customCrop.trim())) ? 'not-allowed' : 'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                }}
              >
                {cropLoading
                  ? <><div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid white', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} /> AI is preparing advice...</>
                  : `🌾 Get Advice for ${showCustom ? (customCrop || 'Crop') : (crop || 'Select Crop')}`}
              </button>

              {!isLoggedIn && (
                <div style={{ marginTop:8, fontSize:12, color:'#92400E', background:'#FEF3C7', borderRadius:10, padding:'8px 12px', border:'1px solid #FDE68A' }}>
                  ⚠️ Login required to get crop advice
                </div>
              )}

              {cropAdvice && (
                <div style={{ marginTop:14, background:'#F8FFF8', borderRadius:14, padding:'14px', fontSize:13, lineHeight:1.9, color:'#1a1a1a', border:'1px solid #E8F4E8', whiteSpace:'pre-wrap', animation:'fadeIn 0.4s ease' }}>
                  {cropAdvice}
                </div>
              )}
            </div>

            <div style={{ padding:'10px 14px', background:'#FEF3C7', borderRadius:12, fontSize:12, color:'#92400E', border:'1px solid #FDE68A' }}>
              ⚠️ Weather data is provided by OpenWeatherMap. For critical decisions, consult a local agriculture expert.
            </div>
          </>
        )}
      </div>
    </div>
  )
}