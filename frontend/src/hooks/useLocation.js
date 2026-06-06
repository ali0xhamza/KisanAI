// src/hooks/useLocation.js
import { useState } from 'react'
import { getCityCoords, PAK_CITIES_DATA } from '../utils/pakLocations'

const W_KEY = import.meta.env.VITE_WEATHER_API_KEY || ''

export function useLocation() {
  const [coords,   setCoords]   = useState(null)
  const [cityName, setCityName] = useState('')
  const [gpsState, setGpsState] = useState('idle')   // idle|loading|done|error
  const [gpsMsg,   setGpsMsg]   = useState('')

  // ── Internal: mark success, call onFound immediately ─────────
  const _success = (lat, lon, name, source, onFound) => {
    const c = { lat, lon }
    setCoords(c)
    setCityName(name)
    setGpsState('done')
    setGpsMsg(`${source} — ${name}`)
    onFound?.(c, name)        // ← caller gets coords right away
  }

  const _fail = (msg) => {
    setGpsState('error')
    setGpsMsg(msg)
  }

  // ── Nearest PAK city from raw lat/lon ─────────────────────────
  const findNearestCity = (lat, lon) => {
    let nearest = null, minDist = Infinity
    for (const [city, data] of Object.entries(PAK_CITIES_DATA)) {
      const dist = Math.hypot(data.lat - lat, data.lon - lon)
      if (dist < minDist) { minDist = dist; nearest = city }
    }
    return nearest
  }

  // ── IP-based fallback (2 free services, no API key needed) ────
  const tryIP = async (onFound) => {
    // Service 1: ip-api.com
    try {
      const r = await fetch('https://ip-api.com/json/?fields=lat,lon,city,status', {
        signal: AbortSignal.timeout(5000),
      })
      const d = await r.json()
      if (d.status === 'success' && d.lat) {
        const cityKey = Object.keys(PAK_CITIES_DATA).find(
  c => c.toLowerCase() === d.city?.toLowerCase()
)

const name = cityKey
  ? cityKey
  : findNearestCity(d.lat || d.latitude, d.lon || d.longitude)
        _success(d.lat, d.lon, name || d.city || 'Detected', '🌐 Internet se', onFound)
        return true
      }
    } catch (_) {}

    // Service 2: ipapi.co
    try {
      const r = await fetch('https://ipapi.co/json/', {
        signal: AbortSignal.timeout(5000),
      })
      const d = await r.json()
      if (d.latitude) {
        const cityKey = Object.keys(PAK_CITIES_DATA).find(
  c => c.toLowerCase() === d.city?.toLowerCase()
)

const name = cityKey
  ? cityKey
  : findNearestCity(d.lat || d.latitude, d.lon || d.longitude)
        _success(d.latitude, d.longitude, name || d.city || 'Detected', '🌐 Internet se', onFound)
        return true
      }
    } catch (_) {}

    return false
  }

  // ── detectGPS(onFound) — GPS → IP → fail ─────────────────────
  // onFound(coords, cityName) fires as soon as location resolves
  const detectGPS = (onFound) => {
    setGpsState('loading')
    setGpsMsg('Detecting location...')
    setCoords(null)
    setCityName('')

    if (!navigator.geolocation) {
      tryIP(onFound).then(ok => {
        if (!ok) _fail('GPS not supported — please select city manually')
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      // GPS success
      async ({ coords: c }) => {
        let name = findNearestCity(c.latitude, c.longitude)

        // Try to get exact city name from OWM reverse geocoding
        if (W_KEY) {
          try {
            const r = await fetch(
              `https://api.openweathermap.org/geo/1.0/reverse?lat=${c.latitude}&lon=${c.longitude}&limit=1&appid=${W_KEY}`,
              { signal: AbortSignal.timeout(4000) }
            )
            const arr = await r.json()
            if (arr?.[0]?.name) name = arr[0].name
          } catch (_) {}
        }

        _success(c.latitude, c.longitude, name || 'GPS Location', '📍 GPS se', onFound)
      },

      // GPS fail — try IP silently
      async (err) => {
        setGpsMsg(
          err.code === 1
            ? 'GPS permission denied — trying via internet...'
            : 'GPS timeout — trying via internet...'
        )
        const ok = await tryIP(onFound)
        if (!ok) {
          _fail(
            err.code === 1
              ? '⚠️ GPS permission denied — please select city manually below'
              : '⚠️ GPS failed — please select city manually below'
          )
        }
      },
      { timeout: 8000, enableHighAccuracy: true, maximumAge: 30000 }
    )
  }

  // ── selectCity(name, onFound) — hardcoded coords, never fails ─
  const selectCity = (name, onFound) => {
    const data = getCityCoords(name)
    if (!data) {
      _fail(`No data found for "${name}"`)
      return
    }
    _success(data.lat, data.lon, name, '🔍 Manual', onFound)
  }

  const reset = () => {
    setCoords(null); setCityName(''); setGpsState('idle'); setGpsMsg('')
  }

  return { coords, cityName, gpsState, gpsMsg, detectGPS, selectCity, reset }
}