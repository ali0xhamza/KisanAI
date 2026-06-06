// src/components/LocationPicker.jsx
import { useState } from 'react'
import { PAK_CITY_NAMES } from '../utils/pakLocations'

const QUICK_CITIES = ['Lahore','Faisalabad','Multan','Sialkot','Gujranwala','Narowal','Shakargarh','Sahiwal']

export default function LocationPicker({ gpsState, gpsMsg, cityName, onDetectGPS, onSelectCity }) {
  const [mode,       setMode]       = useState('gps')
  const [citySearch, setCitySearch] = useState('')
  const [showDrop,   setShowDrop]   = useState(false)

  const filtered = PAK_CITY_NAMES.filter(c =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  )

  const handleCitySelect = (city) => {
    setCitySearch(city)
    setShowDrop(false)
    onSelectCity(city)
  }

  const borderColor = gpsState === 'done'    ? '#1B4D2E'
                    : gpsState === 'error'   ? '#dc2626'
                    : '#86efac'
  const bgColor     = gpsState === 'done'    ? '#e8f5e9' : '#f8fafc'
  const statusIcon  = gpsState === 'loading' ? '⏳'
                    : gpsState === 'done'    ? '✅'
                    : gpsState === 'error'   ? '⚠️' : '📍'
  const statusColor = gpsState === 'error'   ? '#dc2626' : '#1B4D2E'

  return (
    <div>
      {/* Mode toggle */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
        {['gps','manual'].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding:'10px', borderRadius:12, border:'none', cursor:'pointer',
            fontSize:13, fontWeight:700, fontFamily:'inherit',
            background: mode===m ? 'linear-gradient(135deg,#1B4D2E,#2D7A47)' : '#F0F7F0',
            color:      mode===m ? 'white' : '#1B4D2E',
          }}>
            {m === 'gps' ? '📍 GPS / Auto' : '🔍 Select City '}
          </button>
        ))}
      </div>

      {/* GPS mode */}
      {mode === 'gps' && (
        <button
          onClick={onDetectGPS}
          disabled={gpsState === 'loading'}
          style={{
            width:'100%', display:'flex', alignItems:'center', gap:10,
            padding:'12px 14px', borderRadius:14,
            cursor: gpsState==='loading' ? 'not-allowed' : 'pointer',
            textAlign:'left', boxSizing:'border-box',
            border:`1.5px dashed ${borderColor}`,
            background: bgColor,
          }}
        >
          <span style={{ fontSize:22 }}>{statusIcon}</span>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color: statusColor }}>
              {gpsState === 'loading' ? 'Detecting location...'
               : gpsState === 'done'  ? `Location found${cityName ? ' — ' + cityName : ''}`
               : gpsState === 'error' ? gpsMsg
               : 'Auto Detect — GPS → Internet → Manual'}
            </div>
            <div style={{ fontSize:11, color: gpsState==='error' ? '#dc2626' : '#64748b', marginTop:2 }}>
              {gpsState === 'loading' ? 'Please wait a moment...'
               : gpsState === 'done'  ? gpsMsg
               : gpsState === 'error' ? 'Select the city manually below'
               : 'First GPS will be tried, then internet'}
            </div>
          </div>
        </button>
      )}

      {/* Manual mode */}
      {mode === 'manual' && (
        <div>
          {/* Search input with dropdown */}
          <div style={{ position:'relative' }}>
            <input
              placeholder="Enter city name..."
              value={citySearch}
              onChange={e => { setCitySearch(e.target.value); setShowDrop(true) }}
              onFocus={() => setShowDrop(true)}
              onBlur={() => setTimeout(() => setShowDrop(false), 200)}
              style={inputStyle}
            />
            {showDrop && citySearch && filtered.length > 0 && (
              <div style={{
                position:'absolute', top:'100%', left:0, right:0,
                background:'white', borderRadius:12,
                boxShadow:'0 8px 24px rgba(0,0,0,0.15)',
                zIndex:200, maxHeight:200, overflowY:'auto', marginTop:4,
              }}>
                {filtered.slice(0, 8).map(c => (
                  <button
                    key={c}
                    onMouseDown={() => handleCitySelect(c)}
                    style={{
                      width:'100%', padding:'11px 14px', background:'transparent',
                      border:'none', cursor:'pointer', textAlign:'left',
                      fontSize:14, color:'#1B4D2E', fontWeight:600,
                      borderBottom:'1px solid #F0F7F0', fontFamily:'inherit',
                    }}
                  >
                    📍 {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick city chips */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:10 }}>
            {QUICK_CITIES.map(c => (
              <button
                key={c}
                onClick={() => handleCitySelect(c)}
                style={{
                  padding:'6px 13px', borderRadius:20,
                  border:`1px solid ${cityName===c ? '#1B4D2E' : '#C8EDD6'}`,
                  background: cityName===c ? '#1B4D2E' : '#F8FFF8',
                  color:      cityName===c ? 'white'   : '#1B4D2E',
                  fontSize:12, fontWeight:600, cursor:'pointer',
                }}
              >{c}</button>
            ))}
          </div>

          {/* Status message */}
          {gpsMsg && (
            <div style={{
              marginTop:10, padding:'9px 13px', borderRadius:10,
              fontSize:12, fontWeight:600,
              background: gpsState==='done'    ? '#F0FFF4'
                        : gpsState==='loading' ? '#FFFBEB' : '#FFF0F0',
              color:      gpsState==='done'    ? '#1B4D2E'
                        : gpsState==='loading' ? '#92400E' : '#CC0000',
              border:`1px solid ${gpsState==='done'?'#C8EDD6':gpsState==='loading'?'#FDE68A':'#FFB3B3'}`,
            }}>
              {gpsState === 'loading' ? '⏳ Setting location...' : gpsMsg}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const inputStyle = {
  width:'100%', padding:'11px 14px', borderRadius:12,
  border:'1.5px solid #C8EDD6', background:'#F8FFF8',
  fontSize:14, outline:'none', fontFamily:'inherit', boxSizing:'border-box',
}